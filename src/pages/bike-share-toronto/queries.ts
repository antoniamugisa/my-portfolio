import { ensureMonthLoaded, getDB, toEpochMs } from './useTripStream';
import { torontoDayRangeMs } from './torontoTime';

type JsonRow = Record<string, unknown>;

function tableFor(monthKey: string): string {
  return `trips_${monthKey.replace('-', '_')}`;
}

function sqlString(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

function sqlTime(ms: number): string {
  return `'${new Date(ms).toISOString()}'`;
}

/** Runs `build(table)` against the month's trips view and returns plain JSON rows. */
async function queryMonth(monthKey: string, build: (table: string) => string): Promise<JsonRow[]> {
  const db = await getDB();
  await ensureMonthLoaded(db, monthKey);
  const conn = await db.connect();
  try {
    const res = await conn.query(build(tableFor(monthKey)));
    return res.toArray().map((r: { toJSON: () => JsonRow }) => r.toJSON());
  } finally {
    await conn.close();
  }
}

/** Rides started per station in the month (only stations with at least one ride). */
export async function fetchStationRideCounts(monthKey: string): Promise<Map<string, number>> {
  const rows = await queryMonth(
    monthKey,
    (t) => `SELECT startName AS name, COUNT(*)::INTEGER AS c FROM ${t} GROUP BY startName`,
  );
  return new Map(rows.map((r) => [String(r.name), Number(r.c)]));
}

/**
 * Rides started per Toronto hour (0–23). With `day` it is that day's real count; without it the
 * month's average day.
 */
export async function fetchHourlyRideCounts(monthKey: string, day: number | null): Promise<number[]> {
  const rows = await queryMonth(monthKey, (t) => {
    if (day === null) {
      return `SELECT hour AS h, COUNT(*)::DOUBLE / GREATEST(1, COUNT(DISTINCT date_trunc('day', startedAt))) AS c FROM ${t} GROUP BY hour`;
    }
    const { min, max } = torontoDayRangeMs(monthKey, day);
    return `SELECT hour AS h, COUNT(*)::INTEGER AS c FROM ${t} WHERE startedAt >= ${sqlTime(min)} AND startedAt < ${sqlTime(max)} GROUP BY hour`;
  });
  const counts = new Array<number>(24).fill(0);
  for (const r of rows) {
    const h = Number(r.h);
    if (h >= 0 && h < 24) counts[h] = Math.round(Number(r.c));
  }
  return counts;
}

export type RideRow = {
  row: JsonRow;
  id: string;
  startName: string;
  endName: string;
  startedAtMs: number;
  endedAtMs: number;
  memberCasual: 'member' | 'casual';
  isEbike: boolean;
  /** Rides with no route geometry can be listed but not drawn. */
  hasRoute: boolean;
};

const RIDE_COLUMNS =
  'id, startName, endName, startedAt, endedAt, bikeType, memberCasual, hour, routeGeometry, distanceM';

function toRideRow(row: JsonRow): RideRow {
  return {
    row,
    id: String(row.id ?? ''),
    startName: String(row.startName ?? ''),
    endName: String(row.endName ?? ''),
    startedAtMs: toEpochMs(row.startedAt),
    endedAtMs: toEpochMs(row.endedAt),
    memberCasual: String(row.memberCasual) === 'member' ? 'member' : 'casual',
    isEbike: String(row.bikeType) === 'electric_bike',
    hasRoute: typeof row.routeGeometry === 'string' && row.routeGeometry.length > 0,
  };
}

/** Rides from `stationName` that started between `fromMs` and `toMs`, earliest first. */
export async function fetchRidesFromStation(
  monthKey: string,
  stationName: string,
  fromMs: number,
  toMs: number,
  limit = 200,
): Promise<RideRow[]> {
  const rows = await queryMonth(
    monthKey,
    (t) => `
      SELECT ${RIDE_COLUMNS} FROM ${t}
      WHERE startName = ${sqlString(stationName)}
        AND startedAt >= ${sqlTime(fromMs)} AND startedAt <= ${sqlTime(toMs)}
      ORDER BY startedAt ASC
      LIMIT ${limit}`,
  );
  return rows.map(toRideRow).filter((r) => Number.isFinite(r.startedAtMs));
}

/** The rides from `stationName` that month whose start is closest to `atMs` (for empty windows). */
export async function fetchNearestRidesFromStation(
  monthKey: string,
  stationName: string,
  atMs: number,
  limit = 6,
): Promise<RideRow[]> {
  const rows = await queryMonth(
    monthKey,
    (t) => `
      SELECT ${RIDE_COLUMNS} FROM ${t}
      WHERE startName = ${sqlString(stationName)} AND routeGeometry IS NOT NULL
      ORDER BY abs(epoch_ms(startedAt) - ${Math.round(atMs)}) ASC
      LIMIT ${limit}`,
  );
  return rows
    .map(toRideRow)
    .filter((r) => Number.isFinite(r.startedAtMs))
    .sort((a, b) => a.startedAtMs - b.startedAtMs);
}
