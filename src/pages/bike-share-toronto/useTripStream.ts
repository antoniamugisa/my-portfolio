import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import { MAP_BOUNDS, type DeckTrip } from './types';
import { isFirstHour, loadFirstHour } from './firstHour';
import { isPublishedParquetMonth } from './publishedMonths';
import {
  getPlaybackHourWindow,
  hourStartTorontoMs,
  nextPlaybackSlice,
  type PlaybackSlice,
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

/** One registration per month, shared by concurrent callers (a failed one can be retried). */
const monthRegistrations = new Map<string, Promise<void>>();

export function ensureMonthLoaded(db: duckdb.AsyncDuckDB, month: string): Promise<void> {
  let registration = monthRegistrations.get(month);
  if (!registration) {
    registration = registerMonth(db, month);
    monthRegistrations.set(month, registration);
    registration.catch(() => monthRegistrations.delete(month));
  }
  return registration;
}

async function registerMonth(db: duckdb.AsyncDuckDB, month: string): Promise<void> {
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
  } finally {
    await conn.close();
  }
}

export function toEpochMs(v: unknown): number {
  if (v == null) return NaN;
  if (typeof v === 'bigint') {
    const n = Number(v);
    return n > 1e15 ? Math.floor(n / 1000) : n;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (v > 1e15) return Math.floor(v / 1000);
    return v;
  }
  if (v instanceof Date) return v.getTime();
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

/** Padding so routes that clip the bbox still score the correct precision. */
const SERVICE_AREA_PAD_DEG = 0.12;

function vertexInServiceArea(lng: number, lat: number): boolean {
  const { minLat, maxLat, minLng, maxLng } = MAP_BOUNDS;
  return (
    lat >= minLat - SERVICE_AREA_PAD_DEG &&
    lat <= maxLat + SERVICE_AREA_PAD_DEG &&
    lng >= minLng - SERVICE_AREA_PAD_DEG &&
    lng <= maxLng + SERVICE_AREA_PAD_DEG
  );
}

function decodePolylineFactor(encoded: string, factor: number): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

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

/** How many vertices land in the Toronto service bbox (parquet may be polyline5 or polyline6). */
function scorePathForToronto(coords: [number, number][]): number {
  let score = 0;
  for (const [lng, lat] of coords) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return -1;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return -1;
    if (vertexInServiceArea(lng, lat)) score++;
  }
  return score;
}

function decodePolyline(encoded: string): [number, number][] {
  const d5 = decodePolylineFactor(encoded, 1e5);
  const d6 = decodePolylineFactor(encoded, 1e6);
  const ok5 = d5.length >= 2;
  const ok6 = d6.length >= 2;
  if (!ok5 && !ok6) return d5.length ? d5 : d6;
  const s5 = ok5 ? scorePathForToronto(d5) : -1;
  const s6 = ok6 ? scorePathForToronto(d6) : -1;
  if (s6 > s5) return d6;
  if (s5 > s6) return d5;
  if (ok6 && s6 >= 0) return d6;
  if (ok5 && s5 >= 0) return d5;
  return ok6 ? d6 : d5;
}

/** Shortest / longest ride duration drawn; a handful of trips are stamped as lasting days. */
const MIN_DRAWN_TRIP_MS = 60_000;
const MAX_DRAWN_TRIP_MS = 2 * 3600000;

/**
 * Real start of the playback hour this row belongs to. Day slices play one real hour. Month-wide
 * slices overlay that hour from every day, so each trip is placed against its own day's hour; a trip
 * that started the hour before (still riding at :00) belongs to the next hour of its day.
 */
function sliceHourStartForRow(row: Record<string, unknown>, slice: PlaybackSlice): number {
  if (slice.day !== null) return getPlaybackHourWindow(slice.month, slice.hour, slice.day).min;
  const ownHourStart = hourStartTorontoMs(toEpochMs(row.startedAt));
  return Number(row.hour) === slice.hour ? ownHourStart : ownHourStart + 3600000;
}

function rowToDeckTrip(row: Record<string, unknown>, slice: PlaybackSlice): DeckTrip | null {
  const geom = row.routeGeometry as string | null;
  if (!geom) return null;

  const coords = decodePolyline(geom);
  if (coords.length < 2) return null;

  const startMs = toEpochMs(row.startedAt);
  const endMs = toEpochMs(row.endedAt);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;

  /**
   * Relative ms from the start of the playback hour — TripsLayer uses float32, so epoch-ms breaks
   * time comparisons in the shader. Rides keep their real timing: ones already underway at :00
   * start below 0, and ones still riding at :60 end past 3600000 (the next hour picks them up).
   */
  const tripStartRel = startMs - sliceHourStartForRow(row, slice);
  const span = Math.min(MAX_DRAWN_TRIP_MS, Math.max(MIN_DRAWN_TRIP_MS, endMs - startMs));
  if (tripStartRel + span <= 0 || tripStartRel >= 3600000) return null;

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
  day: number | null = null,
): DeckTrip | null {
  return rowToDeckTrip(row, { month: monthKey, day, hour });
}

function sliceCacheKey(month: string, day: number | null, hour: number): string {
  return `${month}:${day ?? '*'}:${hour}`;
}

/**
 * SQL filter for one playback hour: rides that started in it or were still underway at its start.
 * Day slices use that Toronto day's real hour (startedAt is UTC); month-wide slices use the `hour`
 * column across the month (Toronto offsets are whole hours, so UTC hour boundaries line up).
 */
function sliceWhere(month: string, day: number | null, hour: number): string {
  if (day === null) {
    const prev = (hour + 23) % 24;
    return `(hour = ${hour} OR (hour = ${prev} AND date_trunc('hour', endedAt) > date_trunc('hour', startedAt)))`;
  }
  const { min, max } = getPlaybackHourWindow(month, hour, day);
  const iso = (ms: number) => `'${new Date(ms).toISOString()}'`;
  return `startedAt >= ${iso(min - MAX_DRAWN_TRIP_MS)} AND startedAt < ${iso(max)} AND endedAt > ${iso(min)}`;
}

/**
 * Rows per playback hour. A real day-hour is loaded whole (the busiest, July 2024 at 5pm, is ~4,000
 * rides with carry-over). A month-wide hour overlays ~30 days, so it is always a sample.
 */
const DAY_SLICE_LIMIT = 6000;
const MONTH_SLICE_LIMIT = 1800;

function sliceQuery(tableName: string, month: string, day: number | null, hour: number): string {
  return `
    SELECT id, startName, endName, startedAt, endedAt,
           bikeType, memberCasual, hour, routeGeometry, distanceM
    FROM ${tableName}
    WHERE ${sliceWhere(month, day, hour)}
    ORDER BY random()
    LIMIT ${day === null ? MONTH_SLICE_LIMIT : DAY_SLICE_LIMIT}
  `;
}

/** True when the trips shown are a random subset of that hour (month-wide, or a day over the cap). */
function isSampledSlice(day: number | null, rowCount: number): boolean {
  return day === null || rowCount >= DAY_SLICE_LIMIT;
}

/** Return shape of `useTripStream` (includes prefetch for seamless hour rollovers). */
export type UseTripStreamResult = {
  trips: DeckTrip[];
  /** Trips are a random sample of the hour, so counts are not the real number of rides. */
  isSampled: boolean;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  playbackWindow: { min: number; max: number };
  prefetchHourForMonth: (month: string, hour: number, day?: number | null) => Promise<void>;
};

export function useTripStream(
  currentMonth: string,
  currentHour: number,
  /** Toronto day of month to play; null samples `currentHour` across the whole month. */
  currentDay: number | null,
  /** When the parquet has no trips for `currentHour` (e.g. partial-month file), we load the busiest hour and call this so UI state stays in sync. Month-wide slices only. */
  onAutoPickHour?: (hour: number) => void,
): UseTripStreamResult {
  const [trips, setTrips] = useState<DeckTrip[]>([]);
  const [isSampled, setIsSampled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  /** Month/day/hour of the trips currently shown; playbackWindow follows this so the clock stays aligned during hour fetches. */
  const [dataEpoch, setDataEpoch] = useState<PlaybackSlice | null>(null);
  const dataEpochRef = useRef<PlaybackSlice | null>(null);
  const cacheRef = useRef<
    Map<
      string,
      {
        trips: DeckTrip[];
        isSampled: boolean;
      }
    >
  >(new Map());
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
      day: number | null,
      hour: number,
      tableName: string,
    ) => {
      const key = sliceCacheKey(month, day, hour);
      if (cacheRef.current.has(key)) return;

      const conn = await db.connect();
      try {
        const res = await conn.query(sliceQuery(tableName, month, day, hour));
        const rows = res
          .toArray()
          .map((r: { toJSON: () => Record<string, unknown> }) => r.toJSON());
        const slice = { month, day, hour };
        const deckTrips = rows
          .map((row) => rowToDeckTrip(row, slice))
          .filter((t): t is DeckTrip => t !== null);
        cacheRef.current.set(key, {
          trips: deckTrips,
          isSampled: isSampledSlice(day, rows.length),
        });
        pruneCache();
      } finally {
        await conn.close();
      }
    },
    [],
  );

  const playbackWindow = useMemo(() => {
    if (trips.length > 0 && dataEpoch) {
      return getPlaybackHourWindow(dataEpoch.month, dataEpoch.hour, dataEpoch.day);
    }
    return getPlaybackHourWindow(currentMonth, currentHour, currentDay);
  }, [trips.length, dataEpoch, currentMonth, currentHour, currentDay]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const seamlessHourChange =
        dataEpochRef.current !== null &&
        dataEpochRef.current.month === currentMonth &&
        (dataEpochRef.current.hour !== currentHour || dataEpochRef.current.day !== currentDay);

      if (!seamlessHourChange) {
        setTrips([]);
        setIsSampled(false);
        setIsLoading(true);
        setError(null);
        setLoadingMessage('Loading rides…');
      } else {
        setError(null);
      }

      try {
        const slice = { month: currentMonth, day: currentDay, hour: currentHour };
        const sliceKey = sliceCacheKey(currentMonth, currentDay, currentHour);
        if (isFirstHour(slice) && !cacheRef.current.has(sliceKey)) {
          // The opening hour ships as a static file, so it draws before DuckDB-WASM has even loaded.
          const first = await loadFirstHour();
          if (cancelled) return;
          if (first) {
            const deckTrips = first.rows
              .map((row) => rowToDeckTrip(row, slice))
              .filter((t): t is DeckTrip => t !== null);
            cacheRef.current.set(sliceKey, { trips: deckTrips, isSampled: first.sampled });
            dataEpochRef.current = slice;
            setDataEpoch(slice);
            setTrips(deckTrips);
            setIsSampled(first.sampled);
            setIsLoading(false);
            setLoadingMessage('');
            // Warm DuckDB for search and later hours; the map prefetches the next hour itself.
            getDB().catch(() => {});
            return;
          }
        }

        const db = await getDB();
        if (cancelled) return;

        const cacheKeyForRequest = sliceCacheKey(currentMonth, currentDay, currentHour);

        if (seamlessHourChange) {
          /**
           * Seamless rollover: never advance `dataEpoch` / playback clock before trips for
           * the new hour exist. Doing so remaps the time window while TripsLayer still has
           * the previous hour’s timestamps → everything disappears until fetch completes.
           */
          const cached = cacheRef.current.get(cacheKeyForRequest);
          if (cached) {
            const epoch = { month: currentMonth, day: currentDay, hour: currentHour };
            dataEpochRef.current = epoch;
            setDataEpoch(epoch);
            setTrips(cached.trips);
            setIsSampled(cached.isSampled);
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
            const epochHit = { month: currentMonth, day: currentDay, hour: currentHour };
            dataEpochRef.current = epochHit;
            setDataEpoch(epochHit);
            setTrips(cachedWarm.trips);
            setIsSampled(cachedWarm.isSampled);
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

        const conn = await db.connect();
        try {
          let hourForData = currentHour;
          const result = await conn.query(
            sliceQuery(tableName, currentMonth, currentDay, hourForData),
          );
          if (cancelled) return;

          let rows = result
            .toArray()
            .map((r: { toJSON: () => Record<string, unknown> }) => r.toJSON());

          // A specific day may genuinely be empty at that hour; only month-wide slices jump to the busiest hour.
          if (rows.length === 0 && currentDay === null) {
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
              const retry = await conn.query(
                sliceQuery(tableName, currentMonth, currentDay, hourForData),
              );
              if (cancelled) return;
              rows = retry
                .toArray()
                .map((r: { toJSON: () => Record<string, unknown> }) => r.toJSON());
            }
          }

          const epoch = { month: currentMonth, day: currentDay, hour: hourForData };
          const deckTrips = rows
            .map((row) => rowToDeckTrip(row, epoch))
            .filter((t): t is DeckTrip => t !== null);
          const sampled = isSampledSlice(currentDay, rows.length);
          const resolvedCacheKey = sliceCacheKey(currentMonth, currentDay, hourForData);

          if (!cancelled) {
            dataEpochRef.current = epoch;
            setDataEpoch(epoch);
            setTrips(deckTrips);
            setIsSampled(sampled);
            setIsLoading(false);
            setLoadingMessage('');

            cacheRef.current.set(resolvedCacheKey, {
              trips: deckTrips,
              isSampled: sampled,
            });
            pruneCache();

            if (hourForData !== currentHour) {
              queueMicrotask(() => onAutoPickHour?.(hourForData));
            }

            /**
             * Prefetch the next hour in the background (same month) so the rollover is
             * near-instant most of the time.
             */
            const next = nextPlaybackSlice(epoch);
            if (
              next.month === currentMonth &&
              !cacheRef.current.has(sliceCacheKey(next.month, next.day, next.hour))
            ) {
              Promise.resolve()
                .then(async () => {
                  await prefetchHour(db, currentMonth, next.day, next.hour, tableName);
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
  }, [currentMonth, currentHour, currentDay, onAutoPickHour, prefetchHour]);

  /**
   * Ensures the given month/day/hour slice is in the in-memory cache (same query as rollover).
   * Call from the map before advancing the clock so the seamless path hits the cache and the
   * deck never goes through an empty `trips` frame.
   */
  const prefetchHourForMonth = useCallback(
    async (month: string, hour: number, day: number | null = null) => {
      const db = await getDB();
      await ensureMonthLoaded(db, month);
      const tableName = `trips_${month.replace('-', '_')}`;
      await prefetchHour(db, month, day, hour, tableName);
    },
    [prefetchHour],
  );

  return {
    trips,
    isSampled,
    isLoading,
    loadingMessage,
    error,
    playbackWindow,
    prefetchHourForMonth,
  };
}
