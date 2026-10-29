"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  type MutableRefObject,
} from "react";
import mapboxgl from "mapbox-gl";
import type { Layer } from "@deck.gl/core";
import type { Parameters as LumaParameters } from "@luma.gl/core";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { TripsLayer } from "@deck.gl/geo-layers";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import "mapbox-gl/dist/mapbox-gl.css";
import type { DeckTrip, MapFlyTo } from "./types";
import { MAP_BOUNDS } from "./types";
import { createThrottledSampler } from "./createThrottledSampler";
import {
  buildSpotlightHeadPoint,
  buildTripHeadPoints,
  countActiveTrips,
  type TripHeadPoint,
} from "./tripHeads";

interface MapViewProps {
  trips: DeckTrip[];
  /** Synthetic hour window (canonical Toronto clock on the 1st of the month). */
  playbackWindow: { min: number; max: number };
  onTripCountChange: (count: number) => void;
  /** Updated every animation frame: absolute simulated epoch ms (Toronto wall time). */
  playbackTimeMsRef: MutableRefObject<number>;
  /** When true, simulated time does not advance (Space / HUD button). */
  paused: boolean;
  /** Smoothed FPS from the map animation loop (throttled). */
  onFpsChange?: (fps: number) => void;
  /** Increment when the user changes month or hour so playback snaps to that window start. */
  playbackResetNonce: number;
  /** Called when simulated time reaches the end of the current hour window (→ next hour, no loop). May return a Promise (e.g. prefetch next hour before React state updates). */
  onAdvanceHour?: () => void | Promise<void>;
  /** Fire once per simulated hour after ~20% playback so the next hour can be prefetched before the rollover. */
  onWarmNextHour?: () => void | Promise<void>;
  /** When set, full start→end path plus same head dot as normal view; other trips dimmed. */
  spotlightTrip: DeckTrip | null;
  /**
   * Fly the map when `id` changes (e.g. station picked from search, or a suggested moment's area).
   */
  flyTo?: MapFlyTo | null;
  /** Selected station from the list — shown as a green dot on the map. */
  selectedStationPin?: { lng: number; lat: number; id: number } | null;
  /** Map rotation (degrees) for HUD compass. */
  onBearingChange?: (bearing: number) => void;
  /** Called once the rides layer is on the map (after the basemap loads), so the HUD can wait for it. */
  onDrawing?: () => void;
  /** Playback speed multiplier (1 = one simulated hour per 45 s). */
  speed?: number;
  /**
   * Absolute sim time to start from when `playbackResetNonce` changes. Applied once the loaded
   * hour contains it; otherwise playback starts at the top of the hour.
   */
  seekTimeMs?: number | null;
  /** Increment to rotate and tilt the map back to north-up. */
  resetNorthNonce?: number;
  /** Space kept clear of overlays (search sheet, trip card) when flying or fitting. */
  overlayPadding?: { top: number; bottom: number; left: number; right: number };
}

/** Trail behind the head (simulated ms); shorter buckets for longer trips so dense routes stay readable. */
const TRAIL_MS_SHORT_TRIP = 200_000;
const TRAIL_MS_MID_TRIP = 120_000;
const TRAIL_MS_LONG_TRIP = 70_000;
/** Synthetic trip duration thresholds (same units as `DeckTrip.timestamps`). */
const SPAN_SHORT_MAX_MS = 20 * 60 * 1000;
const SPAN_MID_MAX_MS = 40 * 60 * 1000;
/** Real-time seconds to play one simulated hour at 1× speed (lower = faster). */
const REAL_MS_PER_SIM_HOUR = 45_000;
const SIM_MS_PER_REAL_MS = 3600000 / REAL_MS_PER_SIM_HOUR;
const FPS_EMIT_MS = 250;
const MAX_FRAME_MS = 80;

/** luma.gl v9 uses WebGPU-style depth state (replaces `depthTest` / `depthMask`). */
const LAYER_PARAMS_NO_DEPTH: LumaParameters = {
  depthWriteEnabled: false,
  depthCompare: "always",
};

/** Additive blending so overlapping trails brighten into corridors instead of covering each other. */
const LAYER_PARAMS_ADDITIVE: LumaParameters = {
  ...LAYER_PARAMS_NO_DEPTH,
  blend: true,
  blendColorOperation: "add",
  blendColorSrcFactor: "src-alpha",
  blendColorDstFactor: "one",
  blendAlphaOperation: "add",
  blendAlphaSrcFactor: "one",
  blendAlphaDstFactor: "one-minus-src-alpha",
};

const DEFAULT_OVERLAY_PADDING = { top: 90, bottom: 200, left: 40, right: 40 };

type EndpointMarker = {
  position: [number, number];
  fill: [number, number, number, number];
  line: [number, number, number, number];
};

/** Start (filled, in the rider colour) and end (hollow ring) of the chosen route. */
function buildSpotlightEndpointsLayer(spot: DeckTrip): ScatterplotLayer<EndpointMarker> {
  const [r, g, b] = spot.color;
  const first = spot.path[0]!;
  const last = spot.path[spot.path.length - 1]!;
  return new ScatterplotLayer<EndpointMarker>({
    id: "spotlight-endpoints",
    data: [
      { position: first, fill: [r, g, b, 255], line: [255, 255, 255, 255] },
      { position: last, fill: [10, 10, 10, 255], line: [r, g, b, 255] },
    ],
    getPosition: (d) => d.position,
    getFillColor: (d) => d.fill,
    getLineColor: (d) => d.line,
    getRadius: 7,
    radiusUnits: "pixels",
    stroked: true,
    getLineWidth: 2.5,
    lineWidthUnits: "pixels",
    billboard: true,
    pickable: false,
    parameters: LAYER_PARAMS_NO_DEPTH,
  });
}

function tripSpanMs(d: DeckTrip): number {
  const ts = d.timestamps;
  if (ts.length < 2) return 0;
  return Math.max(0, ts[ts.length - 1]! - ts[0]!);
}

/** 0 = short, 1 = mid, 2 = long (by synthetic duration). */
function trailBucket(spanMs: number): 0 | 1 | 2 {
  if (spanMs <= SPAN_SHORT_MAX_MS) return 0;
  if (spanMs <= SPAN_MID_MAX_MS) return 1;
  return 2;
}

/** Same clock as all trips: clamp global playback time to this trip’s window. */
function spotlightSimTime(spot: DeckTrip, currentTimeRel: number): number {
  const ts = spot.timestamps;
  if (ts.length < 2) return currentTimeRel;
  const t0 = ts[0]!;
  const t1 = ts[ts.length - 1]!;
  return Math.min(Math.max(currentTimeRel, t0), t1);
}

/** Full polyline for the chosen trip (static); the head dot moves along timestamps separately. */
function buildSpotlightFullPathLayer(spot: DeckTrip): PathLayer<DeckTrip> {
  return new PathLayer<DeckTrip>({
    id: "spotlight-route-full",
    data: [spot],
    getPath: (d) => d.path,
    getColor: (d) => [d.color[0], d.color[1], d.color[2], 235],
    getWidth: 5,
    widthUnits: "pixels",
    jointRounded: true,
    capRounded: true,
    opacity: 0.95,
    pickable: false,
    parameters: LAYER_PARAMS_NO_DEPTH,
  });
}

export default function MapView({
  trips,
  playbackWindow,
  onTripCountChange,
  playbackTimeMsRef,
  paused,
  onFpsChange,
  playbackResetNonce,
  onAdvanceHour,
  onWarmNextHour,
  spotlightTrip,
  flyTo,
  selectedStationPin = null,
  onBearingChange,
  onDrawing,
  speed = 1,
  seekTimeMs = null,
  resetNorthNonce = 0,
  overlayPadding = DEFAULT_OVERLAY_PADDING,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const animFrameRef = useRef<number>(0);
  const spotlightTripRef = useRef<DeckTrip | null>(null);
  const spotlightPathLayerRef = useRef<PathLayer<DeckTrip> | null>(null);
  const spotlightEndpointsLayerRef = useRef<ScatterplotLayer<EndpointMarker> | null>(null);
  spotlightTripRef.current = spotlightTrip;
  /**
   * Must update in render (not only in useEffect): useLayoutEffect(pushLayer) runs before
   * useEffect, so tripsRef was stale and TripsLayer was built with [] while data had loaded.
   */
  const tripsRef = useRef<DeckTrip[]>(trips);
  tripsRef.current = trips;
  const playbackWindowRef = useRef(playbackWindow);
  playbackWindowRef.current = playbackWindow;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const overlayPaddingRef = useRef(overlayPadding);
  overlayPaddingRef.current = overlayPadding;
  /** Seek requested with the latest reset nonce, waiting for its hour to load. */
  const pendingSeekRef = useRef<number | null>(null);

  /** Absolute simulated epoch ms; never wraps — hours chain via onAdvanceHour. */
  const simEpochMsRef = useRef(0);
  /** Relative [0, 3600000] for TripsLayer (float32-safe). */
  const currentTimeRelRef = useRef(0);
  const tripsLayersRef = useRef<TripsLayer<DeckTrip>[]>([]);
  const headsLayerRef = useRef<ScatterplotLayer<TripHeadPoint> | null>(null);
  const pausedRef = useRef(paused);
  const onAdvanceHourRef = useRef(onAdvanceHour);
  const onWarmNextHourRef = useRef(onWarmNextHour);
  const lastWarmPlaybackMinRef = useRef<number | null>(null);
  const nonceAppliedRef = useRef(-1);
  const lastPwMinRef = useRef<number | null>(null);
  const lastRealTRef = useRef<number | null>(null);
  const advanceScheduledRef = useRef(false);

  const fpsEmaRef = useRef(60);
  const lastFrameTRef = useRef<number | null>(null);
  const fpsSamplerRef = useRef<ReturnType<typeof createThrottledSampler> | null>(null);
  if (fpsSamplerRef.current === null) {
    fpsSamplerRef.current = createThrottledSampler({ intervalMs: FPS_EMIT_MS });
  }
  /** Last value sent to parent — avoid redundant setState when active count unchanged. */
  const lastActiveTripCountRef = useRef<number | null>(null);
  const selectedStationPinRef = useRef<typeof selectedStationPin>(null);
  selectedStationPinRef.current = selectedStationPin;
  const onBearingChangeRef = useRef(onBearingChange);
  onBearingChangeRef.current = onBearingChange;
  const onDrawingRef = useRef(onDrawing);
  onDrawingRef.current = onDrawing;

  const createStationPinLayer = useCallback(
    (pin: { lng: number; lat: number }) =>
      new ScatterplotLayer<{ position: [number, number] }>({
        id: "station-pick-pin",
        data: [{ position: [pin.lng, pin.lat] }],
        getPosition: (d) => d.position,
        getFillColor: [34, 197, 94, 255],
        getRadius: 10,
        radiusUnits: "pixels",
        stroked: false,
        billboard: true,
        pickable: false,
        parameters: LAYER_PARAMS_NO_DEPTH,
      }),
    [],
  );

  const appendStationPin = useCallback(
    (layers: Layer[]): Layer[] => {
      const pin = selectedStationPinRef.current;
      if (!pin) return layers;
      return [...layers, createStationPinLayer(pin)];
    },
    [createStationPinLayer],
  );

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onAdvanceHourRef.current = onAdvanceHour;
  }, [onAdvanceHour]);

  useEffect(() => {
    onWarmNextHourRef.current = onWarmNextHour;
  }, [onWarmNextHour]);

  useEffect(() => {
    const prevMin = lastPwMinRef.current;
    const nextMin = playbackWindow.min;
    lastPwMinRef.current = nextMin;

    /**
     * Only clear the "advanced" guard when we actually enter a new hour window.
     * Some reload paths can recreate `playbackWindow` with the same min/max, and if we
     * reset the guard on every object change while sim time is already >= pw.max,
     * we'll repeatedly call `onAdvanceHour()` (refresh loop).
     */
    if (prevMin == null || nextMin !== prevMin) {
      advanceScheduledRef.current = false;
      lastWarmPlaybackMinRef.current = null;
    }

    if (
      prevMin != null &&
      playbackWindow.min > prevMin &&
      simEpochMsRef.current < playbackWindow.min
    ) {
      simEpochMsRef.current = playbackWindow.min;
    }
  }, [playbackWindow.min]);

  const createTripsLayers = useCallback((): TripsLayer<DeckTrip>[] => {
    const all = tripsRef.current;
    const spot = spotlightTripRef.current;
    const buckets: [DeckTrip[], DeckTrip[], DeckTrip[]] = [[], [], []];
    for (const d of all) {
      if (spot && String(d.id) === String(spot.id)) continue;
      buckets[trailBucket(tripSpanMs(d))].push(d);
    }
    const trailByBucket = [
      TRAIL_MS_SHORT_TRIP,
      TRAIL_MS_MID_TRIP,
      TRAIL_MS_LONG_TRIP,
    ] as const;
    const layers: TripsLayer<DeckTrip>[] = [];
    for (let b = 0; b < 3; b++) {
      const data = buckets[b];
      if (data.length === 0) continue;
      layers.push(
        new TripsLayer<DeckTrip>({
          id: `trips-b${b}`,
          data,
          getPath: (d: DeckTrip) => d.path,
          getTimestamps: (d: DeckTrip) => d.timestamps,
          getColor: (d: DeckTrip) => {
            const s = spotlightTripRef.current;
            if (!s) return d.color;
            return [d.color[0], d.color[1], d.color[2], 40];
          },
          currentTime: currentTimeRelRef.current,
          trailLength: trailByBucket[b],
          widthMinPixels: 5,
          widthMaxPixels: 10,
          jointRounded: true,
          capRounded: true,
          opacity: spotlightTripRef.current ? 0.38 : 0.95,
          fadeTrail: true,
          pickable: false,
          parameters: LAYER_PARAMS_ADDITIVE,
        }),
      );
    }
    return layers;
  }, []);

  const createHeadsLayer = useCallback((data: TripHeadPoint[]) => {
    return new ScatterplotLayer<TripHeadPoint>({
      id: "trip-heads",
      data,
      getPosition: (d) => d.position,
      getFillColor: (d) => d.color,
      getRadius: 3,
      radiusUnits: "pixels",
      billboard: true,
      stroked: false,
      pickable: false,
      parameters: LAYER_PARAMS_NO_DEPTH,
    });
  }, []);

  const pushLayer = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    if (tripsRef.current.length === 0) {
      tripsLayersRef.current = [];
      headsLayerRef.current = null;
      spotlightPathLayerRef.current = null;
      playbackTimeMsRef.current = 0;
      const pin = selectedStationPinRef.current;
      overlay.setProps({
        layers: pin ? [createStationPinLayer(pin)] : [],
      });
      return;
    }

    const tLayers = createTripsLayers();
    const spot = spotlightTripRef.current;
    const spotlightOk =
      Boolean(spot && spot.path.length >= 2 && spot.timestamps.length >= 2);
    /** Same head dot as normal map; spotlight adds full path underneath via PathLayer. */
    const hLayer = createHeadsLayer([]);
    tripsLayersRef.current = tLayers;
    headsLayerRef.current = hLayer;

    let pathFull: PathLayer<DeckTrip> | null = null;
    if (spotlightOk && spot) {
      pathFull = buildSpotlightFullPathLayer(spot);
      spotlightPathLayerRef.current = pathFull;
      spotlightEndpointsLayerRef.current = buildSpotlightEndpointsLayer(spot);
    } else {
      spotlightPathLayerRef.current = null;
      spotlightEndpointsLayerRef.current = null;
    }

    const stack =
      pathFull != null
        ? [...tLayers, pathFull, spotlightEndpointsLayerRef.current!, hLayer]
        : [...tLayers, hLayer];
    overlay.setProps({ layers: appendStationPin(stack) });
  }, [
    appendStationPin,
    createStationPinLayer,
    createTripsLayers,
    createHeadsLayer,
    playbackTimeMsRef,
  ]);

  const animate = useCallback(() => {
    const now = performance.now();
    const pw = playbackWindowRef.current;

    if (lastFrameTRef.current != null) {
      const dt = now - lastFrameTRef.current;
      if (dt > 0) {
        const inst = 1000 / dt;
        fpsEmaRef.current = fpsEmaRef.current * 0.85 + inst * 0.15;
      }
    }
    lastFrameTRef.current = now;

    if (onFpsChange) {
      fpsSamplerRef.current?.sample(() => {
        onFpsChange(Math.round(fpsEmaRef.current));
      });
    }

    if (
      !pausedRef.current &&
      pendingSeekRef.current == null &&
      tripsRef.current.length > 0 &&
      pw.max > pw.min
    ) {
      if (lastRealTRef.current == null) {
        lastRealTRef.current = now;
      }
      let dtReal = now - lastRealTRef.current;
      if (dtReal > MAX_FRAME_MS) dtReal = MAX_FRAME_MS;
      lastRealTRef.current = now;

      let sim = simEpochMsRef.current + dtReal * SIM_MS_PER_REAL_MS * speedRef.current;

      if (sim >= pw.max) {
        if (onAdvanceHourRef.current && !advanceScheduledRef.current) {
          advanceScheduledRef.current = true;
          void Promise.resolve(onAdvanceHourRef.current()).catch(() => {
            advanceScheduledRef.current = false;
          });
        }
        sim = Math.min(sim, pw.max - 0.001);
      }

      simEpochMsRef.current = sim;

      const rel = sim - pw.min;
      currentTimeRelRef.current = Math.min(3600000, Math.max(0, rel));

      // Prefetch the next hour long before the simulated hour ends so rollover hits the cache
      // (avoids an empty deck + dark map while DuckDB runs the next query).
      const ctRel = currentTimeRelRef.current;
      const warmFn = onWarmNextHourRef.current;
      if (
        warmFn &&
        pw.max > pw.min &&
        ctRel > 0.2 * 3600000 &&
        lastWarmPlaybackMinRef.current !== pw.min
      ) {
        lastWarmPlaybackMinRef.current = pw.min;
        void Promise.resolve(warmFn()).catch(() => {});
      }
    }

    playbackTimeMsRef.current = simEpochMsRef.current;

    const ctForCount = currentTimeRelRef.current;
    const allTrips = tripsRef.current;
    if (allTrips.length > 0) {
      const active = countActiveTrips(allTrips, ctForCount);
      if (lastActiveTripCountRef.current !== active) {
        lastActiveTripCountRef.current = active;
        onTripCountChange(active);
      }
    }

    const prevTripLayers = tripsLayersRef.current;
    const prevH = headsLayerRef.current;
    const overlay = overlayRef.current;
    if (prevH && overlay && tripsRef.current.length > 0) {
      const ct = currentTimeRelRef.current;
      const spot = spotlightTripRef.current;
      const pathFull = spotlightPathLayerRef.current;

      const hasBackground = prevTripLayers.length > 0;
      const hasSpotlight = Boolean(
        spot && spot.path.length >= 2 && spot.timestamps.length >= 2,
      );

      if (!hasBackground && !hasSpotlight) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      let headData: TripHeadPoint[];

      if (spot && spot.path.length >= 2 && spot.timestamps.length >= 2) {
        const st = spotlightSimTime(spot, ct);
        const hp = buildSpotlightHeadPoint(spot, st, [
          spot.color[0],
          spot.color[1],
          spot.color[2],
        ]);
        headData = hp ? [hp] : [];
      } else {
        headData = buildTripHeadPoints(tripsRef.current, ct);
        spotlightPathLayerRef.current = null;
      }

      const nextTripLayers = prevTripLayers.map((layer) =>
        layer.clone({ currentTime: ct }),
      );
      tripsLayersRef.current = nextTripLayers;
      const nextH = prevH.clone({ data: headData });
      headsLayerRef.current = nextH;
      const endpoints = spotlightEndpointsLayerRef.current;
      const baseStack =
        pathFull != null && hasSpotlight
          ? [...nextTripLayers, pathFull, ...(endpoints ? [endpoints] : []), nextH]
          : [...nextTripLayers, nextH];
      overlay.setProps({ layers: appendStationPin(baseStack) });
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [appendStationPin, playbackTimeMsRef, onFpsChange, onTripCountChange]);

  useEffect(() => {
    if (trips.length === 0) {
      /** Do not zero simEpochMs — DuckDB clears trips during reload; resetting sim to 0 makes
       *  currentTimeRel clamp to 0 forever (sim can never catch up to epoch-scale pw.min). */
      currentTimeRelRef.current = 0;
      playbackTimeMsRef.current = 0;
      lastActiveTripCountRef.current = null;
      fpsSamplerRef.current?.reset();
      onTripCountChange(0);
      return;
    }

    if (playbackResetNonce !== nonceAppliedRef.current) {
      nonceAppliedRef.current = playbackResetNonce;
      pendingSeekRef.current = seekTimeMs;
      simEpochMsRef.current = playbackWindow.min;
      currentTimeRelRef.current = 0;
      lastRealTRef.current = null;
      advanceScheduledRef.current = false;
    }

    const seek = pendingSeekRef.current;
    if (seek != null && seek >= playbackWindow.min && seek < playbackWindow.max) {
      pendingSeekRef.current = null;
      simEpochMsRef.current = seek;
      playbackTimeMsRef.current = seek;
      lastRealTRef.current = null;
      currentTimeRelRef.current = seek - playbackWindow.min;
      const active = countActiveTrips(trips, currentTimeRelRef.current);
      lastActiveTripCountRef.current = active;
      onTripCountChange(active);
      return;
    }
    if (seek != null) {
      /** The picked moment's hour is still loading: hold the clock on it (`animate` doesn't advance
       *  while a seek is pending) instead of playing the previous hour from its top. */
      simEpochMsRef.current = seek;
      playbackTimeMsRef.current = seek;
      lastRealTRef.current = null;
      return;
    }

    /**
     * After a reload with the same nonce, sim may still be 0 or outside this hour’s window — e.g. a
     * time-travel jump back in time consumes the nonce against the old trips, leaving sim past the
     * new window, which would otherwise immediately trigger onAdvanceHour and skip the target hour.
     */
    if (
      simEpochMsRef.current < playbackWindow.min ||
      simEpochMsRef.current >= playbackWindow.max
    ) {
      simEpochMsRef.current = playbackWindow.min;
      lastRealTRef.current = null;
    }

    playbackTimeMsRef.current = simEpochMsRef.current;
    let rel = Math.min(
      3600000,
      Math.max(0, simEpochMsRef.current - playbackWindow.min),
    );
    /**
     * TripsLayer only draws where `currentTime` intersects each trip’s timestamp range. If rel is 0
     * but every trip starts later in the synthetic hour, nothing draws (often when paused). Nudge to
     * the earliest trip start. If that still yields zero active trips, try the densest minute in the
     * hour so something is usually on-screen near Toronto.
     */
    let minTripStart = Infinity;
    for (const tr of trips) {
      const ts = tr.timestamps;
      if (ts.length >= 2) minTripStart = Math.min(minTripStart, ts[0]!);
    }
    if (Number.isFinite(minTripStart) && rel < minTripStart) {
      rel = minTripStart;
      simEpochMsRef.current = playbackWindow.min + rel;
      playbackTimeMsRef.current = simEpochMsRef.current;
    }
    let active = countActiveTrips(trips, rel);
    if (active === 0 && trips.length > 0) {
      const { minLat, maxLat, minLng, maxLng } = MAP_BOUNDS;
      const pad = 0.15;
      let bestT = rel;
      let bestCount = 0;
      for (let step = 0; step < 60; step++) {
        const t = (step / 59) * 3600000;
        let n = 0;
        for (const tr of trips) {
          const ts = tr.timestamps;
          const path = tr.path;
          if (ts.length < 2 || path.length < 2) continue;
          if (t < ts[0]! || t > ts[ts.length - 1]! + 500) continue;
          let i = 0;
          while (i < ts.length - 2 && ts[i + 1]! < t) i++;
          i = Math.min(i, path.length - 2);
          const p0 = path[i]!;
          const p1 = path[i + 1]!;
          const t0 = ts[i]!;
          const t1 = ts[i + 1]!;
          const u = t1 <= t0 ? 0 : (t - t0) / (t1 - t0);
          const lng = p0[0] + u * (p1[0] - p0[0]);
          const lat = p0[1] + u * (p1[1] - p0[1]);
          if (
            lat >= minLat - pad &&
            lat <= maxLat + pad &&
            lng >= minLng - pad &&
            lng <= maxLng + pad
          ) {
            n++;
          }
        }
        if (n > bestCount) {
          bestCount = n;
          bestT = t;
        }
      }
      if (bestCount > 0) {
        rel = bestT;
        simEpochMsRef.current = playbackWindow.min + rel;
        playbackTimeMsRef.current = simEpochMsRef.current;
        active = bestCount;
      }
    }
    currentTimeRelRef.current = rel;
    lastActiveTripCountRef.current = active;
    onTripCountChange(active);
  }, [
    trips,
    playbackWindow,
    playbackResetNonce,
    seekTimeMs,
    playbackTimeMsRef,
    onTripCountChange,
  ]);

  useLayoutEffect(() => {
    if (!overlayRef.current) return;
    pushLayer();
    mapRef.current?.resize();
  }, [trips, pushLayer, spotlightTrip, selectedStationPin]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !spotlightTrip?.path?.length) return;

    const applyFit = () => {
      const m = mapRef.current;
      if (!m || !spotlightTrip.path.length) return;
      const coords = spotlightTrip.path;
      let minLng = Infinity;
      let maxLng = -Infinity;
      let minLat = Infinity;
      let maxLat = -Infinity;
      for (const p of coords) {
        const [lng, lat] = p;
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }
      if (!Number.isFinite(minLng)) return;
      const pad = 0.014;
      m.fitBounds(
        [
          [minLng - pad, minLat - pad],
          [maxLng + pad, maxLat + pad],
        ],
        {
          padding: overlayPaddingRef.current,
          duration: 750,
          maxZoom: 15,
        },
      );
    };

    if (map.isStyleLoaded()) applyFit();
    else map.once("load", applyFit);

    return () => {
      map.off("load", applyFit);
    };
  }, [spotlightTrip]);

  useEffect(() => {
    const container = containerRef.current;
    const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
    if (!container || !token) return;

    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;

    const map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-79.385, 43.655],
      zoom: 12,
      antialias: !isCoarsePointer,
      accessToken: token,
      // Simpler touch: pinch-zoom + pan; no accidental tilt/rotate on phones.
      dragRotate: !isCoarsePointer,
      touchPitch: false,
      pitchWithRotate: false,
    });

    mapRef.current = map;

    const overlay = new MapboxOverlay({
      interleaved: false,
      useDevicePixels: false,
      layers: [],
    });

    map.on("load", () => {
      if (isCoarsePointer) {
        try {
          map.touchZoomRotate.disableRotation();
        } catch {
          /* older mapbox builds */
        }
      }

      const layersToCheck = map.getStyle()?.layers ?? [];
      const layerIds = new Set(layersToCheck.map((l) => l.id));

      const roadLayers = [
        "road-primary",
        "road-secondary-tertiary",
        "road-street",
        "road-minor",
        "road-path",
        "road-pedestrian",
      ];

      roadLayers.forEach((id) => {
        if (layerIds.has(id)) {
          map.setPaintProperty(id, "line-opacity", 0.15);
        }
      });

      const labelsToHide = ["poi-label", "transit-label", "airport-label"];
      labelsToHide.forEach((id) => {
        if (layerIds.has(id)) {
          map.setLayoutProperty(id, "visibility", "none");
        }
      });

      map.addControl(overlay);
      overlayRef.current = overlay;

      const emitBearing = () => {
        onBearingChangeRef.current?.(map.getBearing());
      };
      map.on("rotate", emitBearing);
      map.on("pitch", emitBearing);
      emitBearing();

      map.resize();
      pushLayer();
      onDrawingRef.current?.();

      animFrameRef.current = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      tripsLayersRef.current = [];
      headsLayerRef.current = null;
      playbackTimeMsRef.current = 0;
      overlayRef.current?.finalize();
      overlayRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [animate, pushLayer, playbackTimeMsRef]);

  useEffect(() => {
    if (!flyTo) return;
    const map = mapRef.current;
    if (!map) return;

    const run = () => {
      const options = { padding: overlayPaddingRef.current, duration: 1100, essential: true };
      if ("bounds" in flyTo) map.fitBounds(flyTo.bounds, options);
      else map.flyTo({ ...options, center: [flyTo.lng, flyTo.lat], zoom: flyTo.zoom ?? 14 });
    };

    if (map.isStyleLoaded()) run();
    else map.once("load", run);

    return () => {
      map.off("load", run);
    };
  }, [flyTo]);

  useEffect(() => {
    if (resetNorthNonce === 0) return;
    mapRef.current?.easeTo({ bearing: 0, pitch: 0, duration: 600 });
  }, [resetNorthNonce]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        mapRef.current?.resize();
      });
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={
        spotlightTrip
          ? "bs-map-view-root bs-map-view-root--spotlight-dim"
          : "bs-map-view-root"
      }
      style={{
        position: "relative",
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
}
