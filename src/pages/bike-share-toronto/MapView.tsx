"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { Deck } from "@deck.gl/core";
import { TripsLayer } from "@deck.gl/geo-layers";
import "mapbox-gl/dist/mapbox-gl.css";
import type { HourlyBucket, RealTrip } from "./types";

interface MapViewProps {
  currentHour: number;
  hourlyBuckets: HourlyBucket[];
  onTripCountChange: (count: number) => void;
}

interface DeckTrip {
  path: [number, number][];
  timestamps: number[];
  color: [number, number, number, number];
}

const ANIMATION_SPEED = 150;
const TRAIL_LENGTH = 120;

function buildDeckTrips(buckets: HourlyBucket[], hour: number): DeckTrip[] {
  const bucket = buckets[hour];
  if (!bucket) return [];

  return bucket.trips.map((trip: RealTrip) => {
    const from = trip.from;
    const to = trip.to;

    const midLng = (from.lng + to.lng) / 2 + (to.lat - from.lat) * 0.01;
    const midLat = (from.lat + to.lat) / 2 - (to.lng - from.lng) * 0.01;

    const path: [number, number][] = [
      [from.lng, from.lat],
      [midLng, midLat],
      [to.lng, to.lat],
    ];

    const startSec = hour * 3600 + Math.random() * 3600;
    const endSec = startSec + trip.durationSeconds;
    const timestamps = [startSec, (startSec + endSec) / 2, endSec];

    const color: [number, number, number, number] = trip.isMember
      ? [0, 229, 255, 180]
      : [255, 107, 53, 180];

    return { path, timestamps, color };
  });
}

export default function MapView({
  currentHour,
  hourlyBuckets,
  onTripCountChange,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const deckRef = useRef<Deck | null>(null);
  const animFrameRef = useRef<number>(0);

  const currentTimeRef = useRef(currentHour * 3600);
  const currentHourRef = useRef(currentHour);
  const lastRealTimeRef = useRef<number | null>(null);
  const tripsDataRef = useRef<DeckTrip[]>([]);

  const updateTripsLayer = useCallback(() => {
    if (!deckRef.current) return;

    deckRef.current.setProps({
      layers: [
        new TripsLayer<DeckTrip>({
          id: "trips",
          data: tripsDataRef.current,
          getPath: (d) => d.path,
          getTimestamps: (d) => d.timestamps,
          getColor: (d) => d.color,
          currentTime: currentTimeRef.current,
          trailLength: TRAIL_LENGTH,
          widthMinPixels: 1.5,
          widthMaxPixels: 3,
          jointRounded: true,
          capRounded: true,
          opacity: 0.9,
        }),
      ],
    });
  }, []);

  const animate = useCallback(
    (realTime: number) => {
      if (!lastRealTimeRef.current) lastRealTimeRef.current = realTime;
      const dt = (realTime - lastRealTimeRef.current) / 1000;
      lastRealTimeRef.current = realTime;

      currentTimeRef.current += dt * ANIMATION_SPEED;
      const hourStart = currentHourRef.current * 3600;
      const hourEnd = hourStart + 3600;
      if (currentTimeRef.current > hourEnd) {
        currentTimeRef.current = hourStart;
      }

      updateTripsLayer();
      animFrameRef.current = requestAnimationFrame(animate);
    },
    [updateTripsLayer]
  );

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

    map.on("load", () => {
      const dimLayers = [
        "road-primary",
        "road-secondary-tertiary",
        "road-street",
        "road-minor",
        "road-path",
        "road-pedestrian",
      ];

      dimLayers.forEach((id) => {
        try {
          map.setPaintProperty(id, "line-opacity", 0.12);
        } catch {
          // Some style versions may not include all layers.
        }
      });

      try {
        map.setLayoutProperty("poi-label", "visibility", "none");
        map.setLayoutProperty("transit-label", "visibility", "none");
      } catch {
        // Some style versions may not include these label layers.
      }

      const deck = new Deck({
        canvas: "deck-canvas",
        width: "100%",
        height: "100%",
        initialViewState: {
          longitude: -79.385,
          latitude: 43.655,
          zoom: 12,
        },
        controller: false,
        layers: [],
      });

      map.on("move", () => {
        const { lng, lat } = map.getCenter();
        deck.setProps({
          viewState: {
            longitude: lng,
            latitude: lat,
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch(),
          },
        });
      });

      // Sync immediately for initial render before first move.
      const { lng, lat } = map.getCenter();
      deck.setProps({
        viewState: {
          longitude: lng,
          latitude: lat,
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        },
      });

      deckRef.current = deck;
      updateTripsLayer();
      animFrameRef.current = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      deckRef.current?.finalize();
      deckRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [animate, updateTripsLayer]);

  useEffect(() => {
    currentHourRef.current = currentHour;
    currentTimeRef.current = currentHour * 3600;
    lastRealTimeRef.current = null;

    if (hourlyBuckets.length > 0) {
      tripsDataRef.current = buildDeckTrips(hourlyBuckets, currentHour);
      onTripCountChange(tripsDataRef.current.length);
      updateTripsLayer();
    } else {
      tripsDataRef.current = [];
      onTripCountChange(0);
      updateTripsLayer();
    }
  }, [currentHour, hourlyBuckets, onTripCountChange, updateTripsLayer]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      <canvas
        id="deck-canvas"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
