import { useState, useEffect, useCallback, useRef } from 'react';
import type { Station, Filters, RealTrip, HourlyBucket, TripsDataState } from './types';

const DATA_URL = '/data/bikeshare-jan-2025.json';
const MAX_PER_HOUR = 400;

interface RawTrip {
  sid: number;
  eid: number;
  h: number;
  dur: number;
  mem: number;
  eb: number;
}

interface BikeShareJSON {
  meta: {
    month: string;
    monthKey: string;
    totalTrips: number;
    generatedAt: string;
  };
  stations: Array<{
    id: number;
    name: string;
    lat?: number;
    lng?: number;
    cap?: number;
  }>;
  trips: RawTrip[];
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestStation(station: Station, all: Station[], maxKm = 1.0): Station | null {
  let best: Station | null = null;
  let bestDist = Infinity;
  for (const s of all) {
    if (s.id === station.id) continue;
    const d = haversine(station.lat, station.lng, s.lat, s.lng);
    if (d < bestDist && d <= maxKm) {
      best = s;
      bestDist = d;
    }
  }
  return best;
}

function sampleArray<T>(arr: T[], maxLen: number): T[] {
  if (arr.length <= maxLen) return arr;
  const shuffled = arr.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, maxLen);
}

export function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
}

const initialState: TripsDataState = {
  stations: new Map(),
  hourlyBuckets: [],
  totalTrips: 0,
  availableMonths: [],
  currentMonth: '',
  isLoading: false,
  loadingMessage: 'Loading January 2025 trip data...',
  error: null,
};

export function useTripsData(filters: Filters): {
  data: TripsDataState;
  setMonth: (month: string) => void;
} {
  const [data, setData] = useState<TripsDataState>(initialState);

  const rawTripsRef = useRef<RawTrip[]>([]);
  const stationMapRef = useRef<Map<number, Station>>(new Map());
  const allStationsRef = useRef<Station[]>([]);
  const totalTripsRef = useRef(0);

  const applyFilters = useCallback((f: Filters) => {
    const raw = rawTripsRef.current;
    const stations = stationMapRef.current;
    const allStations = allStationsRef.current;
    if (raw.length === 0 || stations.size === 0) return;

    const raw24: RawTrip[][] = Array.from({ length: 24 }, () => []);
    for (const t of raw) {
      if (t.h >= 0 && t.h <= 23) raw24[t.h].push(t);
    }

    const hourlyBuckets: HourlyBucket[] = raw24.map((rawTrips, hour) => {
      let filtered = rawTrips;
      if (!f.member) filtered = filtered.filter(t => t.mem !== 1);
      if (!f.casual) filtered = filtered.filter(t => t.mem !== 0);
      if (!f.ebike) filtered = filtered.filter(t => t.eb !== 1);
      if (!f.classic) filtered = filtered.filter(t => t.eb !== 0);

      const sampled = sampleArray(filtered, MAX_PER_HOUR);

      const trips: RealTrip[] = [];
      for (const t of sampled) {
        const from = stations.get(t.sid);
        let to = stations.get(t.eid);
        if (!from || !to) continue;

        if (from.id === to.id) {
          const near = nearestStation(from, allStations);
          if (!near) continue;
          to = near;
        }

        trips.push({
          from,
          to,
          startHour: t.h,
          startMinute: 0,
          durationSeconds: t.dur,
          isMember: t.mem === 1,
          isEbike: t.eb === 1,
        });
      }

      return { hour, trips, count: rawTrips.length };
    });

    setData(prev => ({
      ...prev,
      hourlyBuckets,
    }));
  }, []);

  const loadData = useCallback(async () => {
    setData(prev => ({
      ...prev,
      isLoading: true,
      loadingMessage: 'Loading January 2025 trip data...',
      error: null,
    }));

    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error(`Failed to fetch trip data: ${res.status}`);
      const json: BikeShareJSON = await res.json();

      setData(prev => ({
        ...prev,
        loadingMessage: `Parsing ${json.meta.totalTrips.toLocaleString()} trips...`,
      }));
      await new Promise(r => setTimeout(r, 0));

      const stationMap = new Map<number, Station>();
      for (const s of json.stations) {
        stationMap.set(s.id, {
          id: s.id,
          name: s.name,
          lat: s.lat ?? 43.655,
          lng: s.lng ?? -79.385,
          cap: s.cap ?? 15,
        });
      }

      setData(prev => ({ ...prev, loadingMessage: 'Building hourly trip map...' }));
      await new Promise(r => setTimeout(r, 0));

      rawTripsRef.current = json.trips;
      stationMapRef.current = stationMap;
      allStationsRef.current = Array.from(stationMap.values());
      totalTripsRef.current = json.meta.totalTrips;

      // Build initial buckets with all-pass filters
      const raw24: RawTrip[][] = Array.from({ length: 24 }, () => []);
      for (const t of json.trips) {
        if (t.h >= 0 && t.h <= 23) raw24[t.h].push(t);
      }

      const allStations = allStationsRef.current;
      const hourlyBuckets: HourlyBucket[] = raw24.map((rawTrips, hour) => {
        const sampled = sampleArray(rawTrips, MAX_PER_HOUR);
        const trips: RealTrip[] = [];
        for (const t of sampled) {
          const from = stationMap.get(t.sid);
          let to = stationMap.get(t.eid);
          if (!from || !to) continue;
          if (from.id === to.id) {
            const near = nearestStation(from, allStations);
            if (!near) continue;
            to = near;
          }
          trips.push({
            from, to,
            startHour: t.h, startMinute: 0,
            durationSeconds: t.dur,
            isMember: t.mem === 1, isEbike: t.eb === 1,
          });
        }
        return { hour, trips, count: rawTrips.length };
      });

      setData({
        stations: stationMap,
        hourlyBuckets,
        totalTrips: json.meta.totalTrips,
        availableMonths: ['2025-01'],
        currentMonth: '2025-01',
        isLoading: false,
        loadingMessage: '',
        error: null,
      });
    } catch (err) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        loadingMessage: '',
        error: `Failed to load trip data: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (rawTripsRef.current.length > 0) {
      applyFilters(filters);
    }
  }, [filters.member, filters.casual, filters.ebike, filters.classic, applyFilters]);

  const setMonth = useCallback((_month: string) => {
    // Future: swap DATA_URL based on month, re-run loadData
  }, []);

  return { data, setMonth };
}
