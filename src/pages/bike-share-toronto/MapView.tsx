"use client";

import { useEffect, useRef, useCallback, type MutableRefObject } from "react";
import mapboxgl from "mapbox-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { TripsLayer } from "@deck.gl/geo-layers";
import { ScatterplotLayer } from "@deck.gl/layers";
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
  /** When set, that trip is drawn as a full highlighted path; other trips are dimmed. */
  spotlightTrip: DeckTrip | null;
}

/** Simulated ms of visible trail behind the head (longer = more of each route drawn). */
const TRAIL_LENGTH_MS = 160_000;
/** Real-time seconds to play one simulated hour at 1× speed (lower = faster). */
const REAL_MS_PER_SIM_HOUR = 45_000;
const SIM_MS_PER_REAL_MS = 3600000 / REAL_MS_PER_SIM_HOUR;
const FPS_EMIT_MS = 250;
const MAX_FRAME_MS = 80;
/** Real-time duration for one full spotlight trip sweep (loops). */
const SPOTLIGHT_LOOP_REAL_MS = 14_000;
/** Trail behind the moving spotlight head (sim ms). */
const SPOTLIGHT_TRAIL_MS = 220_000;
const SPOTLIGHT_RGB: [number, number, number] = [127, 179, 213];

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
  const spotlightTripsLayerRef = useRef<TripsLayer<DeckTrip> | null>(null);
  const spotlightTimeRelRef = useRef(0);
  const spotlightAnimAnchorRef = useRef(0);
  spotlightTripRef.current = spotlightTrip;

  useEffect(() => {
    spotlightAnimAnchorRef.current = performance.now();
  }, [spotlightTrip?.id]);

  /** Absolute simulated epoch ms; never wraps — hours chain via onAdvanceHour. */
  const simEpochMsRef = useRef(0);
  /** Relative [0, 3600000] for TripsLayer (float32-safe). */
  const currentTimeRelRef = useRef(0);
  const tripsRef = useRef<DeckTrip[]>([]);
  const playbackWindowRef = useRef(playbackWindow);
  const tripsLayerRef = useRef<TripsLayer<DeckTrip> | null>(null);
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
    lastPwMinRef.current = playbackWindow.min;
    playbackWindowRef.current = playbackWindow;
    advanceScheduledRef.current = false;

    if (
      prevMin != null &&
      playbackWindow.min > prevMin &&
      simEpochMsRef.current < playbackWindow.min
    ) {
      simEpochMsRef.current = playbackWindow.min;
    }
  }, [playbackWindow]);

  const createTripsLayer = useCallback((): TripsLayer<DeckTrip> => {
    return new TripsLayer<DeckTrip>({
      id: "trips",
      data: tripsRef.current,
      getPath: (d: DeckTrip) => d.path,
      getTimestamps: (d: DeckTrip) => d.timestamps,
      getColor: (d: DeckTrip) => {
        const s = spotlightTripRef.current;
        if (!s) return d.color;
        if (d.id === s.id) return [0, 0, 0, 0];
        return [d.color[0], d.color[1], d.color[2], 22];
      },
      currentTime: currentTimeRelRef.current,
      trailLength: TRAIL_LENGTH_MS,
      widthMinPixels: 5,
      widthMaxPixels: 10,
      jointRounded: true,
      capRounded: true,
      opacity: 0.95,
      fadeTrail: true,
      pickable: false,
      parameters: {
        depthTest: false,
        depthMask: false,
      },
    });
  }, []);

  const createHeadsLayer = useCallback((data: TripHeadPoint[]) => {
    return new ScatterplotLayer<TripHeadPoint>({
      id: "trip-heads",
      data,
      getPosition: (d) => d.position,
      getFillColor: (d) => d.color,
      getRadius: 2,
      radiusUnits: "pixels",
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
      tripsLayerRef.current = null;
      headsLayerRef.current = null;
      spotlightTripsLayerRef.current = null;
      playbackTimeMsRef.current = 0;
      overlay.setProps({ layers: [] });
      return;
    }

    const tLayer = createTripsLayer();
    const hLayer = createHeadsLayer([]);
    tripsLayerRef.current = tLayer;
    headsLayerRef.current = hLayer;

    const spot = spotlightTripRef.current;
    let spotTl: TripsLayer<DeckTrip> | null = null;
    if (spot && spot.path.length >= 2 && spot.timestamps.length >= 2) {
      const t0 = spot.timestamps[0]!;
      spotlightTimeRelRef.current = t0;
      spotTl = new TripsLayer<DeckTrip>({
        id: "spotlight-trip",
        data: [spot],
        getPath: (d) => d.path,
        getTimestamps: (d) => d.timestamps,
        getColor: () => [...SPOTLIGHT_RGB, 255],
        currentTime: t0,
        trailLength: SPOTLIGHT_TRAIL_MS,
        widthMinPixels: 7,
        widthMaxPixels: 14,
        jointRounded: true,
        capRounded: true,
        opacity: 1,
        fadeTrail: true,
        pickable: false,
        parameters: {
          depthTest: false,
          depthMask: false,
        },
      });
    }
    spotlightTripsLayerRef.current = spotTl;

    const stack = spotTl ? [tLayer, hLayer, spotTl] : [tLayer, hLayer];
    overlay.setProps({ layers: stack });
  }, [createTripsLayer, createHeadsLayer, playbackTimeMsRef]);

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

    const prevT = tripsLayerRef.current;
    const prevH = headsLayerRef.current;
    const overlay = overlayRef.current;
    if (prevT && prevH && overlay && tripsRef.current.length > 0) {
      const ct = currentTimeRelRef.current;
      const spot = spotlightTripRef.current;
      const spotTlBase = spotlightTripsLayerRef.current;

      let headData: TripHeadPoint[];
      let nextSpotTl: TripsLayer<DeckTrip> | null = spotTlBase;

      if (spot && spotTlBase) {
        const ts = spot.timestamps;
        const t0 = ts[0]!;
        const t1 = ts[ts.length - 1]!;
        const span = Math.max(t1 - t0, 1);
        const elapsed = performance.now() - spotlightAnimAnchorRef.current;
        const phase = (elapsed % SPOTLIGHT_LOOP_REAL_MS) / SPOTLIGHT_LOOP_REAL_MS;
        const st = t0 + phase * span;
        spotlightTimeRelRef.current = st;
        nextSpotTl = spotTlBase.clone({ currentTime: st });
        spotlightTripsLayerRef.current = nextSpotTl;
        const hp = buildSpotlightHeadPoint(spot, st, SPOTLIGHT_RGB);
        headData = hp ? [hp] : [];
      } else {
        headData = buildTripHeadPoints(tripsRef.current, ct);
      }

      const nextT = prevT.clone({ currentTime: ct });
      const nextH = prevH.clone({ data: headData });
      tripsLayerRef.current = nextT;
      headsLayerRef.current = nextH;
      const stack = nextSpotTl ? [nextT, nextH, nextSpotTl] : [nextT, nextH];
      overlay.setProps({ layers: stack });
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [playbackTimeMsRef, onFpsChange]);

  useEffect(() => {
    tripsRef.current = trips;

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

  useEffect(() => {
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
      tripsLayerRef.current = null;
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
