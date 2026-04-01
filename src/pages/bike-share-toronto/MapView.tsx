"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  type MutableRefObject,
} from "react";
import mapboxgl from "mapbox-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { TripsLayer } from "@deck.gl/geo-layers";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import "mapbox-gl/dist/mapbox-gl.css";
import type { DeckTrip } from "./types";
import {
  buildSpotlightHeadPoint,
  buildTripHeadPoints,
  type TripHeadPoint,
} from "./tripHeads";

interface MapViewProps {
  trips: DeckTrip[];
  /** Synthetic hour window (canonical Toronto clock on the 15th of the month). */
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
  /** Called when simulated time reaches the end of the current hour window (→ next hour, no loop). */
  onAdvanceHour?: () => void;
  /** When set, full start→end path plus same head dot as normal view; other trips dimmed. */
  spotlightTrip: DeckTrip | null;
}

/** Trail behind the head (simulated ms); shorter buckets for longer trips so dense routes stay readable. */
const TRAIL_MS_SHORT_TRIP = 130_000;
const TRAIL_MS_MID_TRIP = 72_000;
const TRAIL_MS_LONG_TRIP = 40_000;
/** Synthetic trip duration thresholds (same units as `DeckTrip.timestamps`). */
const SPAN_SHORT_MAX_MS = 20 * 60 * 1000;
const SPAN_MID_MAX_MS = 40 * 60 * 1000;
/** Real-time seconds to play one simulated hour at 1× speed (lower = faster). */
const REAL_MS_PER_SIM_HOUR = 45_000;
const SIM_MS_PER_REAL_MS = 3600000 / REAL_MS_PER_SIM_HOUR;
const FPS_EMIT_MS = 250;
const MAX_FRAME_MS = 80;

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
    parameters: {
      depthTest: false,
      depthMask: false,
    },
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
  spotlightTrip,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const animFrameRef = useRef<number>(0);
  const spotlightTripRef = useRef<DeckTrip | null>(null);
  const spotlightPathLayerRef = useRef<PathLayer<DeckTrip> | null>(null);
  spotlightTripRef.current = spotlightTrip;
  /**
   * Must update in render (not only in useEffect): useLayoutEffect(pushLayer) runs before
   * useEffect, so tripsRef was stale and TripsLayer was built with [] while data had loaded.
   */
  const tripsRef = useRef<DeckTrip[]>(trips);
  tripsRef.current = trips;
  const playbackWindowRef = useRef(playbackWindow);
  playbackWindowRef.current = playbackWindow;

  /** Absolute simulated epoch ms; never wraps — hours chain via onAdvanceHour. */
  const simEpochMsRef = useRef(0);
  /** Relative [0, 3600000] for TripsLayer (float32-safe). */
  const currentTimeRelRef = useRef(0);
  const tripsLayersRef = useRef<TripsLayer<DeckTrip>[]>([]);
  const headsLayerRef = useRef<ScatterplotLayer<TripHeadPoint> | null>(null);
  const pausedRef = useRef(paused);
  const onAdvanceHourRef = useRef(onAdvanceHour);
  const nonceAppliedRef = useRef(-1);
  const lastPwMinRef = useRef<number | null>(null);
  const lastRealTRef = useRef<number | null>(null);
  const advanceScheduledRef = useRef(false);

  const fpsEmaRef = useRef(60);
  const lastFrameTRef = useRef<number | null>(null);
  const lastFpsEmitRef = useRef(0);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onAdvanceHourRef.current = onAdvanceHour;
  }, [onAdvanceHour]);

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
    }

    if (
      prevMin != null &&
      playbackWindow.min > prevMin &&
      simEpochMsRef.current < playbackWindow.min
    ) {
      simEpochMsRef.current = playbackWindow.min;
    }
  }, [playbackWindow]);

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
          parameters: {
            depthTest: false,
            depthMask: false,
          },
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
      parameters: {
        depthTest: false,
        depthMask: false,
      },
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
      overlay.setProps({ layers: [] });
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
    } else {
      spotlightPathLayerRef.current = null;
    }

    const stack =
      pathFull != null
        ? [...tLayers, pathFull, hLayer]
        : [...tLayers, hLayer];
    overlay.setProps({ layers: stack });
  }, [createTripsLayers, createHeadsLayer, playbackTimeMsRef]);

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

    if (onFpsChange && now - lastFpsEmitRef.current >= FPS_EMIT_MS) {
      lastFpsEmitRef.current = now;
      onFpsChange(Math.round(fpsEmaRef.current));
    }

    if (
      !pausedRef.current &&
      tripsRef.current.length > 0 &&
      pw.max > pw.min
    ) {
      if (lastRealTRef.current == null) {
        lastRealTRef.current = now;
      }
      let dtReal = now - lastRealTRef.current;
      if (dtReal > MAX_FRAME_MS) dtReal = MAX_FRAME_MS;
      lastRealTRef.current = now;

      let sim = simEpochMsRef.current + dtReal * SIM_MS_PER_REAL_MS;

      if (sim >= pw.max) {
        if (onAdvanceHourRef.current && !advanceScheduledRef.current) {
          advanceScheduledRef.current = true;
          onAdvanceHourRef.current();
        }
        sim = Math.min(sim, pw.max - 0.001);
      }

      simEpochMsRef.current = sim;

      const rel = sim - pw.min;
      currentTimeRelRef.current = Math.min(3600000, Math.max(0, rel));
    }

    playbackTimeMsRef.current = simEpochMsRef.current;

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
      const stack =
        pathFull != null && hasSpotlight
          ? [...nextTripLayers, pathFull, nextH]
          : [...nextTripLayers, nextH];
      overlay.setProps({ layers: stack });
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [playbackTimeMsRef, onFpsChange]);

  useEffect(() => {
    if (trips.length === 0) {
      /** Do not zero simEpochMs — DuckDB clears trips during reload; resetting sim to 0 makes
       *  currentTimeRel clamp to 0 forever (sim can never catch up to epoch-scale pw.min). */
      currentTimeRelRef.current = 0;
      playbackTimeMsRef.current = 0;
      onTripCountChange(0);
      return;
    }

    if (playbackResetNonce !== nonceAppliedRef.current) {
      nonceAppliedRef.current = playbackResetNonce;
      simEpochMsRef.current = playbackWindow.min;
      currentTimeRelRef.current = 0;
      lastRealTRef.current = null;
      advanceScheduledRef.current = false;
    }

    /** After a reload with the same nonce, sim may still be 0 or below this hour’s window. */
    if (simEpochMsRef.current < playbackWindow.min) {
      simEpochMsRef.current = playbackWindow.min;
      lastRealTRef.current = null;
    }

    playbackTimeMsRef.current = simEpochMsRef.current;
    onTripCountChange(trips.length);
  }, [
    trips,
    playbackWindow,
    playbackResetNonce,
    onTripCountChange,
    playbackTimeMsRef,
  ]);

  useLayoutEffect(() => {
    if (!overlayRef.current) return;
    pushLayer();
    mapRef.current?.resize();
  }, [trips, pushLayer, spotlightTrip]);

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
          padding: { top: 100, bottom: 160, left: 60, right: 60 },
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

    const map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-79.385, 43.655],
      zoom: 12,
      antialias: true,
      accessToken: token,
    });

    mapRef.current = map;

    const overlay = new MapboxOverlay({
      interleaved: false,
      useDevicePixels: false,
      layers: [],
    });

    map.on("load", () => {
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

      map.resize();
      pushLayer();

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
