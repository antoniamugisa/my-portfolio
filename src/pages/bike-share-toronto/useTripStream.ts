import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import type { DeckTrip } from './types';
import { isPublishedParquetMonth } from './publishedMonths';
import {
  getPlaybackHourWindow,
  hourStartTorontoMs,
  offsetMsIntoHourToronto,
} from './torontoTime';

const R2_PUBLIC_ORIGIN =
  'https://pub-6bbf91ee23654c1c827ccee439375a87.r2.dev';

/**
 * Base URL for monthly Parquet files. In dev, Vite proxies `/bikeshare-r2` to R2 so fetches are
 * same-origin and DuckDB wasm is not blocked by CORS. In production, set
 * `VITE_BIKESHARE_PARQUET_BASE` to a CORS-enabled origin (or your own mirror) if R2 has no ACAO.
 */
function bikeshareParquetBase(): string {
  const fromEnv = import.meta.env.VITE_BIKESHARE_PARQUET_BASE;
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return fromEnv.replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return '/bikeshare-r2';
  }
  return R2_PUBLIC_ORIGIN;
}

function parquetUrl(month: string): string {
  const base = bikeshareParquetBase();
  const path = `/parquets/${month}.parquet`;
  if (base.startsWith('http://') || base.startsWith('https://')) {
    return `${base}${path}`;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${base}${path}`;
  }
  return `${base}${path}`;
}

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

let dbPromise: Promise<duckdb.AsyncDuckDB> | null = null;

export function getDB(): Promise<duckdb.AsyncDuckDB> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
      const worker = new Worker(bundle.mainWorker!);
      const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
      const db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule!, bundle.pthreadWorker);
      return db;
    })();
  }
  return dbPromise;
}

const registeredMonths = new Set<string>();

export async function ensureMonthLoaded(db: duckdb.AsyncDuckDB, month: string) {
  if (registeredMonths.has(month)) return;
  const url = parquetUrl(month);
  const tableName = `trips_${month.replace('-', '_')}`;

  /**
   * DuckDB WASM fetches Parquets in the browser. If the object is public but CORS is not
   * enabled on the bucket/domain, the request is blocked and DuckDB surfaces a confusing
   * "No files found" IO error. Preflight with HEAD so we can show a useful message.
   */
  try {
    const head = await fetch(url, { method: 'HEAD' });
    if (!head.ok) {
      throw new Error(`HTTP ${head.status} ${head.statusText}`.trim());
    }
  } catch (e) {
    const msg =
      e instanceof Error && e.message ? e.message : String(e ?? 'unknown error');
    throw new Error(
      [
        `Unable to fetch Parquet for ${month}.`,
        `This is usually caused by missing CORS headers on the R2 public domain.`,
        `Fix: configure the bucket/domain to return "Access-Control-Allow-Origin: *" (or your site origin) for Parquet responses.`,
        `URL: ${url}`,
        `Details: ${msg}`,
      ].join(' '),
    );
  }

  const conn = await db.connect();
  try {
    await conn.query(`
      CREATE VIEW IF NOT EXISTS ${tableName}
      AS SELECT * FROM read_parquet('${url}')
    `);
    registeredMonths.add(month);
  } finally {
    await conn.close();
  }
}

function toEpochMs(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') return new Date(v).getTime();
  return new Date(String(v)).getTime();
}

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pathLengthMeters(coords: [number, number][]): number {
  let m = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1]!;
    const [lng2, lat2] = coords[i]!;
    m += haversineM(lat1, lng1, lat2, lng2);
  }
  return m;
}

function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const factor = 1e5;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push([lng / factor, lat / factor]);
  }
  return coords;
}

function rowToDeckTrip(
  row: Record<string, unknown>,
  canonicalHourStartMs: number,
): DeckTrip | null {
  const geom = row.routeGeometry as string | null;
  if (!geom) return null;

  const coords = decodePolyline(geom);
  if (coords.length < 2) return null;

  const startMs = toEpochMs(row.startedAt);
  const endMs = toEpochMs(row.endedAt);

  /** Map real trip times into one synthetic Toronto hour so playback sweeps 0–60 min. */
  const startOfHour = hourStartTorontoMs(startMs);
  const offsetStart = offsetMsIntoHourToronto(startMs);
  const tripCanonicalStart = canonicalHourStartMs + offsetStart;
  const endOffsetFromHourStart = endMs - startOfHour;
  const tripCanonicalEnd = Math.min(
    canonicalHourStartMs + 3600000,
    canonicalHourStartMs + endOffsetFromHourStart,
  );
  if (tripCanonicalEnd <= tripCanonicalStart) return null;
  /** Relative ms [0, 3600000] — TripsLayer uses float32; epoch-ms breaks time comparisons in the shader. */
  const tripStartRel = tripCanonicalStart - canonicalHourStartMs;
  const tripEndRel = tripCanonicalEnd - canonicalHourStartMs;
  const span = Math.max(tripEndRel - tripStartRel, 60_000);

  const timestamps = coords.map((_, i) => {
    const t = coords.length === 1 ? 0 : i / (coords.length - 1);
    return tripStartRel + t * span;
  });

  const color: [number, number, number, number] =
    (row.memberCasual as string) === 'member'
      ? [0, 229, 255, 180]
      : [255, 107, 53, 180];

  const idRaw = row.id;
  const startName = String(row.startName ?? '');
  const endName = String(row.endName ?? '');
  const id =
    idRaw != null && String(idRaw).trim() !== ''
      ? String(idRaw)
      : `${startMs}-${endMs}-${startName}-${endName}`;

  const dm = Number(row.distanceM);
  const distanceM =
    Number.isFinite(dm) && dm > 0 ? dm : pathLengthMeters(coords);

  const mc = (row.memberCasual as string) === 'member' ? 'member' : 'casual';

  return {
    id,
    startName,
    endName,
    startedAtMs: startMs,
    endedAtMs: endMs,
    memberCasual: mc,
    distanceM,
    path: coords,
    timestamps,
    color,
    isEbike: (row.bikeType as string) === 'electric_bike',
  };
}

/** Calendar month after `YYYY-MM` (matches 1-based months in getPlaybackHourWindow). */
function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
}

export function deckTripFromDuckRow(
  row: Record<string, unknown>,
  monthKey: string,
  hour: number,
): DeckTrip | null {
  const { min: canonicalHourStartMs } = getPlaybackHourWindow(monthKey, hour);
  return rowToDeckTrip(row, canonicalHourStartMs);
}

/** Return shape of `useTripStream` (includes prefetch for seamless hour rollovers). */
export type UseTripStreamResult = {
  trips: DeckTrip[];
  totalTrips: number;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  playbackWindow: { min: number; max: number };
  prefetchHourForMonth: (month: string, hour: number) => Promise<void>;
};

export function useTripStream(
  currentMonth: string,
  currentHour: number,
  /** When the parquet has no trips for `currentHour` (e.g. partial-month file), we load the busiest hour and call this so UI state stays in sync. */
  onAutoPickHour?: (hour: number) => void,
): UseTripStreamResult {
  const [trips, setTrips] = useState<DeckTrip[]>([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  /** Month/hour of the trips currently shown; playbackWindow follows this so the clock stays aligned during hour fetches. */
  const [dataEpoch, setDataEpoch] = useState<{
    month: string;
    hour: number;
  } | null>(null);
  const dataEpochRef = useRef<{ month: string; hour: number } | null>(null);
  const cacheRef = useRef<
    Map<
      string,
      {
        trips: DeckTrip[];
        totalTrips: number;
      }
    >
  >(new Map());
  /** Latest count for early prefetch only — avoids re-running the main load effect when `totalTrips` updates. */
  const totalTripsRef = useRef(0);
  totalTripsRef.current = totalTrips;
  const pruneCache = () => {
    const c = cacheRef.current;
    const MAX = 8;
    while (c.size > MAX) {
      const firstKey = c.keys().next().value as string | undefined;
      if (!firstKey) break;
      c.delete(firstKey);
    }
  };

  const prefetchHour = useCallback(
    async (
      db: duckdb.AsyncDuckDB,
      month: string,
      hour: number,
      tableName: string,
      totalTripsForMonth: number,
    ) => {
      const key = `${month}:${hour}`;
      if (cacheRef.current.has(key)) return;

      const conn = await db.connect();
      try {
        const res = await conn.query(`
        SELECT id, startName, endName, startedAt, endedAt,
               bikeType, memberCasual, routeGeometry, distanceM
        FROM ${tableName}
        WHERE hour = ${hour}
        ORDER BY random()
        LIMIT 1800
      `);
        const rows = res
          .toArray()
          .map((r: { toJSON: () => Record<string, unknown> }) => r.toJSON());
        const { min: canonicalHourStartMs } = getPlaybackHourWindow(month, hour);
        const deckTrips = rows
          .map((row) => rowToDeckTrip(row, canonicalHourStartMs))
          .filter((t): t is DeckTrip => t !== null);
        cacheRef.current.set(key, { trips: deckTrips, totalTrips: totalTripsForMonth });
        pruneCache();
      } finally {
        await conn.close();
      }
    },
    [],
  );

  const playbackWindow = useMemo(() => {
    if (trips.length > 0 && dataEpoch) {
      return getPlaybackHourWindow(dataEpoch.month, dataEpoch.hour);
    }
    return getPlaybackHourWindow(currentMonth, currentHour);
  }, [trips.length, dataEpoch, currentMonth, currentHour]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const seamlessHourChange =
        dataEpochRef.current !== null &&
        dataEpochRef.current.month === currentMonth &&
        dataEpochRef.current.hour !== currentHour;

      if (!seamlessHourChange) {
        setTrips([]);
        setIsLoading(true);
        setError(null);
        setLoadingMessage(`Initialising DuckDB...`);
      } else {
        setError(null);
      }

      try {
        const db = await getDB();
        if (cancelled) return;

        const cacheKeyForRequest = `${currentMonth}:${currentHour}`;

        if (seamlessHourChange) {
          /**
           * Seamless rollover: never advance `dataEpoch` / playback clock before trips for
           * the new hour exist. Doing so remaps the time window while TripsLayer still has
           * the previous hour’s timestamps → everything disappears until fetch completes.
           */
          const cached = cacheRef.current.get(cacheKeyForRequest);
          if (cached) {
            const epoch = { month: currentMonth, hour: currentHour };
            dataEpochRef.current = epoch;
            setDataEpoch(epoch);
            setTrips(cached.trips);
            setTotalTrips(cached.totalTrips);
            return;
          }
        }

        if (!seamlessHourChange) {
          setLoadingMessage(`Loading ${monthLabel(currentMonth)}...`);
        }
        await ensureMonthLoaded(db, currentMonth);
        if (cancelled) return;

        if (!seamlessHourChange) {
          const cachedWarm = cacheRef.current.get(cacheKeyForRequest);
          if (cachedWarm) {
            const epochHit = { month: currentMonth, hour: currentHour };
            dataEpochRef.current = epochHit;
            setDataEpoch(epochHit);
            setTrips(cachedWarm.trips);
            setTotalTrips(cachedWarm.totalTrips);
            setIsLoading(false);
            setError(null);
            setLoadingMessage('');
            return;
          }
        }

        // Prefetch next month only if that parquet is deployed (avoids R2 404 + worker noise)
        const next = nextMonth(currentMonth);
        if (isPublishedParquetMonth(next)) {
          ensureMonthLoaded(db, next).catch(() => {});
        }

        const tableName = `trips_${currentMonth.replace('-', '_')}`;

        /**
         * Warm the next hour *immediately* (even before the current hour query finishes),
         * so the first hour rollover is also seamless.
         *
         * We don't know `totalTrips` yet; use the current state value as a placeholder —
         * it will be overwritten when the main load finishes.
         */
        const nextHourEarly = (currentHour + 1) % 24;
        const nextKeyEarly = `${currentMonth}:${nextHourEarly}`;
        if (!cacheRef.current.has(nextKeyEarly)) {
          Promise.resolve()
            .then(() =>
              prefetchHour(db, currentMonth, nextHourEarly, tableName, totalTripsRef.current),
            )
            .catch(() => {});
        }

        const conn = await db.connect();
        try {
          const countResult = await conn.query(`SELECT COUNT(*) as c FROM ${tableName}`);
          const total = Number(
            (countResult.toArray()[0] as { toJSON: () => Record<string, unknown> }).toJSON().c,
          );

          let hourForData = currentHour;
          const result = await conn.query(`
            SELECT id, startName, endName, startedAt, endedAt,
                   bikeType, memberCasual, routeGeometry, distanceM
            FROM ${tableName}
            WHERE hour = ${hourForData}
            ORDER BY random()
            LIMIT 1800
          `);
          if (cancelled) return;

          let rows = result
            .toArray()
            .map((r: { toJSON: () => Record<string, unknown> }) => r.toJSON());

          if (rows.length === 0 && total > 0) {
            const pickRes = await conn.query(`
              SELECT hour AS h
              FROM ${tableName}
              GROUP BY hour
              ORDER BY COUNT(*) DESC
              LIMIT 1
            `);
            const pickRow = pickRes.toArray()[0] as
              | { toJSON: () => Record<string, unknown> }
              | undefined;
            const hRaw = pickRow?.toJSON().h;
            const pick =
              typeof hRaw === 'bigint'
                ? Number(hRaw)
                : typeof hRaw === 'number'
                  ? hRaw
                  : Number(hRaw);
            if (Number.isFinite(pick) && pick !== hourForData) {
              hourForData = pick;
              const retry = await conn.query(`
                SELECT id, startName, endName, startedAt, endedAt,
                       bikeType, memberCasual, routeGeometry, distanceM
                FROM ${tableName}
                WHERE hour = ${hourForData}
                ORDER BY random()
                LIMIT 1800
              `);
              if (cancelled) return;
              rows = retry
                .toArray()
                .map((r: { toJSON: () => Record<string, unknown> }) => r.toJSON());
            }
          }

          const { min: canonicalHourStartMs } = getPlaybackHourWindow(
            currentMonth,
            hourForData,
          );

          const deckTrips = rows
            .map((row) => rowToDeckTrip(row, canonicalHourStartMs))
            .filter((t): t is DeckTrip => t !== null);

          const epoch = { month: currentMonth, hour: hourForData };
          const resolvedCacheKey = `${currentMonth}:${hourForData}`;

          if (!cancelled) {
            dataEpochRef.current = epoch;
            setDataEpoch(epoch);
            setTrips(deckTrips);
            setTotalTrips(total);
            setIsLoading(false);
            setLoadingMessage('');

            cacheRef.current.set(resolvedCacheKey, { trips: deckTrips, totalTrips: total });
            pruneCache();

            if (hourForData !== currentHour) {
              queueMicrotask(() => onAutoPickHour?.(hourForData));
            }

            /**
             * Prefetch the next hour in the background (same month) so the rollover is
             * near-instant most of the time.
             */
            const nextHour = (hourForData + 1) % 24;
            const nextKey = `${currentMonth}:${nextHour}`;
            if (!cacheRef.current.has(nextKey)) {
              Promise.resolve()
                .then(async () => {
                  await prefetchHour(db, currentMonth, nextHour, tableName, total);
                })
                .catch(() => {});
            }
          }
        } finally {
          await conn.close();
        }
      } catch (err) {
        console.error('[DuckDB] error:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
          setIsLoading(false);
          setLoadingMessage('');
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [currentMonth, currentHour, onAutoPickHour, prefetchHour]);

  /**
   * Ensures the given month/hour slice is in the in-memory cache (same query as rollover).
   * Call from the map before advancing the clock so the seamless path hits the cache and the
   * deck never goes through an empty `trips` frame.
   */
  const prefetchHourForMonth = useCallback(
    async (month: string, hour: number) => {
      const db = await getDB();
      await ensureMonthLoaded(db, month);
      const tableName = `trips_${month.replace('-', '_')}`;
      await prefetchHour(db, month, hour, tableName, totalTrips);
    },
    [totalTrips, prefetchHour],
  );

  return {
    trips,
    totalTrips,
    isLoading,
    loadingMessage,
    error,
    playbackWindow,
    prefetchHourForMonth,
  };
}
