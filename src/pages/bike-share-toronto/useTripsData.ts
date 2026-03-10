import { useState, useEffect, useCallback } from 'react';
import type { Station, Trip, HourlyBucket, ProcessedTripsData, TripFilters } from './types';
import { MAX_ACTIVE_TRIPS } from './types';

/** Station data is fetched at build time (npm run fetch-data) to avoid CORS. */
const STATIONS_JSON = '/data/bikeshare-stations.json';

function sample<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, max);
}

export function useTripsData() {
  const [stations, setStations] = useState<Map<number, Station>>(new Map());
  const [hourlyBuckets, setHourlyBuckets] = useState<HourlyBucket[]>([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [dataMonth, setDataMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      try {
        const [stationsRes, tripsRes] = await Promise.all([
          fetch(STATIONS_JSON),
          fetch('/data/bikeshare-processed.json'),
        ]);

        if (!stationsRes.ok) {
          setError('Could not load station data. Run npm run fetch-data to generate /public/data/ files.');
          setIsLoading(false);
          return;
        }

        let stationsJson: { stations?: unknown[]; data?: { stations?: unknown[] } };
        try {
          stationsJson = await stationsRes.json();
        } catch {
          setError('Station data invalid (expected JSON). Run npm run fetch-data.');
          setIsLoading(false);
          return;
        }
        const stationList = stationsJson?.stations ?? stationsJson?.data?.stations ?? [];
        const stationMap = new Map<number, Station>(
          stationList.map((s: { station_id: string; id?: number; name: string; lat: number; lon?: number; lng?: number; capacity?: number }) => {
            const id = s.id ?? parseInt(s.station_id, 10);
            const lng = s.lng ?? s.lon ?? 0;
            return [
              id,
              { id, name: s.name, lat: s.lat, lng, capacity: s.capacity ?? 10 },
            ];
          })
        );

        if (!tripsRes.ok) {
          setError('Could not load trip data. Run npm run fetch-data to generate /public/data/ files.');
          setHourlyBuckets(Array.from({ length: 24 }, (_, h) => ({ hour: h, trips: [], count: 0 })));
          setTotalTrips(0);
          setStations(stationMap);
          setIsLoading(false);
          return;
        }

        let tripsJson: ProcessedTripsData;
        try {
          tripsJson = await tripsRes.json();
        } catch {
          setError('Trip data invalid (expected JSON). Run npm run fetch-data.');
          setHourlyBuckets(Array.from({ length: 24 }, (_, h) => ({ hour: h, trips: [], count: 0 })));
          setStations(stationMap);
          setIsLoading(false);
          return;
        }

        const stationMapFinal = new Map<number, Station>(
          stationList.map((s: { station_id: string; id?: number; name: string; lat: number; lon?: number; lng?: number; capacity?: number }) => {
            const id = s.id ?? parseInt(s.station_id, 10);
            const lng = s.lng ?? s.lon ?? 0;
            return [
              id,
              { id, name: s.name, lat: s.lat, lng, capacity: s.capacity ?? 10 },
            ];
          })
        );

        if (cancelled) return;
        setStations(stationMapFinal);

        const rawBuckets = tripsJson.hourlyBuckets ?? [];
        const filtered: HourlyBucket[] = rawBuckets.map((bucket) => {
          const valid = bucket.trips.filter(
            (t) =>
              stationMapFinal.has(t.startStationId) &&
              stationMapFinal.has(t.endStationId) &&
              t.durationSeconds >= 60 &&
              t.durationSeconds <= 3 * 3600
          );
          const sampled = sample(valid, MAX_ACTIVE_TRIPS);
          return { hour: bucket.hour, trips: sampled, count: valid.length };
        });

        if (cancelled) return;
        setHourlyBuckets(filtered);
        setTotalTrips(tripsJson.totalTrips ?? 0);
        setDataMonth(tripsJson.dataMonth ?? '');
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load data');
          setHourlyBuckets(Array.from({ length: 24 }, (_, h) => ({ hour: h, trips: [], count: 0 })));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const getFilteredTripsForHour = useCallback(
    (hour: number, filters: TripFilters): Trip[] => {
      const bucket = hourlyBuckets[hour];
      if (!bucket) return [];
      return bucket.trips.filter((t) => {
        if (t.isMember && !filters.members) return false;
        if (!t.isMember && !filters.casual) return false;
        if (t.isEbike && !filters.ebike) return false;
        if (!t.isEbike && !filters.classic) return false;
        return true;
      });
    },
    [hourlyBuckets]
  );

  return {
    stations,
    hourlyBuckets,
    totalTrips,
    dataMonth,
    isLoading,
    error,
    getFilteredTripsForHour,
  };
}
