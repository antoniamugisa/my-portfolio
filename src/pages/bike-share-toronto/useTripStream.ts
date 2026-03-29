import { useState, useEffect, useMemo } from 'react';
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

const R2_BASE = 'https://pub-6bbf91ee23654c1c827ccee439375a87.r2.dev';

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

function getDB(): Promise<duckdb.AsyncDuckDB> {
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

async function ensureMonthLoaded(db: duckdb.AsyncDuckDB, month: string) {
  if (registeredMonths.has(month)) return;
  const url = `${R2_BASE}/parquets/${month}.parquet`;
  const tableName = `trips_${month.replace('-', '_')}`;
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

export function useTripStream(
  currentMonth: string,
  currentHour: number,
): {
  trips: DeckTrip[];
  totalTrips: number;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  playbackWindow: { min: number; max: number };
} {
  const [trips, setTrips] = useState<DeckTrip[]>([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const playbackWindow = useMemo(
    () => getPlaybackHourWindow(currentMonth, currentHour),
    [currentMonth, currentHour],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setTrips([]);
      setIsLoading(true);
      setError(null);
      setLoadingMessage(`Initialising DuckDB...`);

      try {
        const db = await getDB();
        if (cancelled) return;

        setLoadingMessage(`Loading ${monthLabel(currentMonth)}...`);
        await ensureMonthLoaded(db, currentMonth);
        if (cancelled) return;

        // Prefetch next month only if that parquet is deployed (avoids R2 404 + worker noise)
        const next = nextMonth(currentMonth);
        if (isPublishedParquetMonth(next)) {
          ensureMonthLoaded(db, next).catch(() => {});
        }

        const tableName = `trips_${currentMonth.replace('-', '_')}`;

        const conn = await db.connect();
        try {
          const result = await conn.query(`
            SELECT id, startName, endName, startedAt, endedAt,
                   bikeType, memberCasual, routeGeometry, distanceM
            FROM ${tableName}
            WHERE hour = ${currentHour}
            ORDER BY random()
            LIMIT 1800
          `);
          if (cancelled) return;

          const rows = result.toArray().map((r: { toJSON: () => Record<string, unknown> }) => r.toJSON());

          const { min: canonicalHourStartMs } = getPlaybackHourWindow(
            currentMonth,
            currentHour,
          );

          const deckTrips = rows
            .map((row) => rowToDeckTrip(row, canonicalHourStartMs))
            .filter((t): t is DeckTrip => t !== null);

          const countResult = await conn.query(
            `SELECT COUNT(*) as c FROM ${tableName}`
          );
          const total = Number(
            (countResult.toArray()[0] as { toJSON: () => Record<string, unknown> }).toJSON().c
          );

          if (!cancelled) {
            setTrips(deckTrips);
            setTotalTrips(total);
            setIsLoading(false);
            setLoadingMessage('');
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
  }, [currentMonth, currentHour]);

  return { trips, totalTrips, isLoading, loadingMessage, error, playbackWindow };
}
