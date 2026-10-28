import { DuckDBInstance } from "@duckdb/node-api";
import { Database } from "bun:sqlite";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from "fs";
import { join } from "path";

type StationRecord = {
  id: number;
  canonicalName: string;
  aliases: string[];
  lat: number;
  lng: number;
  capacity: number | null;
};

type RouteInfo = {
  geometry: string;
  distance_m: number | null;
  elevation_up: number | null;
  elevation_down: number | null;
};

/** Row written to temp JSON (snake_case keys for read_json_auto). */
type TripRowJson = {
  id: string;
  start_name: string;
  end_name: string;
  started_at: string;
  ended_at: string;
  bike_type: string;
  member_casual: string;
  hour: number;
  route_geometry: string;
  distance_m: number | null;
  elevation_up: number | null;
  elevation_down: number | null;
};

/** Resolve paths relative to pipeline/ (parent of scripts/) so cwd does not matter. */
const PIPELINE_ROOT = join(import.meta.dir, "..");
const ROUTE_DB = join(PIPELINE_ROOT, "output/routes.db");
const STATIONS_FILE = join(PIPELINE_ROOT, "output/stations.json");
const OUT_DIR = join(PIPELINE_ROOT, "output/parquets");
const EXTRACTED_ROOT = join(PIPELINE_ROOT, "data/extracted");

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

function normalizeStationName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*&\s*/g, " / ")
    .replace(/[.,]/g, "");
}

function sqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

function toDuckPath(fsPath: string): string {
  return fsPath.replace(/\\/g, "/");
}

function routeKey(startName: string, endName: string): string {
  return `${startName}|${endName}`;
}

function listYearExtractDirs(): string[] {
  if (!existsSync(EXTRACTED_ROOT)) return [];
  const names = readdirSync(EXTRACTED_ROOT);
  const dirs: string[] = [];
  for (const name of names) {
    const p = join(EXTRACTED_ROOT, name);
    try {
      if (statSync(p).isDirectory()) dirs.push(name);
    } catch {
      /* skip */
    }
  }
  return dirs.sort();
}

function yearFolderHasCsv(dirName: string): boolean {
  const root = join(EXTRACTED_ROOT, dirName);
  try {
    const walk = (d: string): boolean => {
      for (const ent of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, ent.name);
        if (ent.isDirectory()) {
          if (walk(p)) return true;
        } else if (ent.name.toLowerCase().endsWith(".csv")) {
          return true;
        }
      }
      return false;
    };
    return walk(root);
  } catch {
    return false;
  }
}

const READ_CSV_OPTS = `union_by_name=true,
        normalize_names=true,
        all_varchar=true,
        null_padding=true,
        ignore_errors=true,
        quote='"'`;

const DAY_FIRST_FORMATS = `['%d/%m/%y %H:%M:%S', '%d/%m/%y %H:%M', '%d/%m/%Y %H:%M:%S', '%d/%m/%Y %H:%M']`;
const MONTH_FIRST_FORMATS = `['%m/%d/%y %H:%M:%S', '%m/%d/%y %H:%M', '%m/%d/%Y %H:%M:%S', '%m/%d/%Y %H:%M']`;

/**
 * read_csv plus `started_at_iso` / `ended_at_iso` ("YYYY-MM-DD HH:MM:SS", Toronto wall clock).
 * Slash dates vary by file: 2017 Q1–Q2 are day-first ("13/04/2017 10:00"), 2017 Q4 has two-digit
 * years ("10/01/17 00:00:01"), the rest are month-first. A file is day-first if any start time
 * leads with a number > 12. Values that are already ISO pass through; unparseable ones become NULL.
 */
export function readCsvWithIsoTimes(readCsvFrom: string, startCol: string, endCol: string): string {
  const toIso = (col: string) => `CASE
        WHEN ${col} NOT LIKE '%/%' THEN ${col}
        WHEN file_order.day_first THEN strftime(try_strptime(TRIM(${col}), ${DAY_FIRST_FORMATS}), '%Y-%m-%d %H:%M:%S')
        ELSE strftime(try_strptime(TRIM(${col}), ${MONTH_FIRST_FORMATS}), '%Y-%m-%d %H:%M:%S')
      END`;
  return `(
    WITH src AS MATERIALIZED (
      SELECT * FROM read_csv('${readCsvFrom}', ${READ_CSV_OPTS}, filename=true)
    ),
    file_order AS (
      SELECT filename,
        COALESCE(bool_or(TRY_CAST(regexp_extract(${startCol}, '^\\s*(\\d{1,2})/', 1) AS INTEGER) > 12), false) AS day_first
      FROM src GROUP BY filename
    )
    SELECT src.*, ${toIso(startCol)} AS started_at_iso, ${toIso(endCol)} AS ended_at_iso
    FROM src JOIN file_order USING (filename)
  )`;
}

function isMissingColumnBinderError(err: unknown): boolean {
  const s = err instanceof Error ? err.message : String(err);
  return s.includes("Binder Error") && s.includes("not found");
}

/**
 * User type across eras: "Member" / "Casual" (2016–2017, 2025+), "Annual Member" / "Casual Member"
 * (2018–2024). "Subscriber" is kept for older exports.
 */
const MEMBER_CASUAL_SQL = `CASE WHEN LOWER(TRIM(user_type)) IN ('annual member', 'subscriber', 'member')
        THEN 'member' ELSE 'casual' END AS member_casual`;

export function queryLegacyTrips(readCsvFrom: string): string {
  return `
    SELECT
      CAST(trip_id AS VARCHAR) AS trip_row_id,
      LOWER(TRIM(from_station_name)) AS raw_start_name,
      LOWER(TRIM(to_station_name)) AS raw_end_name,
      started_at_iso AS started_at_str,
      ended_at_iso AS ended_at_str,
      'classic_bike' AS bike_type,
      ${MEMBER_CASUAL_SQL}
    FROM ${readCsvWithIsoTimes(readCsvFrom, "trip_start_time", "trip_stop_time")}
    WHERE from_station_name IS NOT NULL AND to_station_name IS NOT NULL
      AND TRIM(from_station_name) <> '' AND TRIM(to_station_name) <> ''
  `;
}

/** 2019–2024-style CSV: start/end station names and times, no bike_model column. */
export function query2019NoBikeModel(readCsvFrom: string): string {
  return `
    SELECT
      CAST(trip_id AS VARCHAR) AS trip_row_id,
      LOWER(TRIM(start_station_name)) AS raw_start_name,
      LOWER(TRIM(end_station_name)) AS raw_end_name,
      started_at_iso AS started_at_str,
      ended_at_iso AS ended_at_str,
      'classic_bike' AS bike_type,
      ${MEMBER_CASUAL_SQL}
    FROM ${readCsvWithIsoTimes(readCsvFrom, "start_time", "end_time")}
    WHERE start_station_name IS NOT NULL AND end_station_name IS NOT NULL
      AND TRIM(start_station_name) <> '' AND TRIM(end_station_name) <> ''
  `;
}

/** 2024+ CSVs with a bike model column: `Model` (2024) or `Bike_Model` (2025+). EFIT/Boost = e-bike. */
export function queryModernTrips(readCsvFrom: string, modelColumn: "bike_model" | "model"): string {
  return `
    SELECT
      CAST(trip_id AS VARCHAR) AS trip_row_id,
      LOWER(TRIM(start_station_name)) AS raw_start_name,
      LOWER(TRIM(end_station_name)) AS raw_end_name,
      started_at_iso AS started_at_str,
      ended_at_iso AS ended_at_str,
      CASE
        WHEN LOWER(${modelColumn}) LIKE '%efit%' THEN 'electric_bike'
        WHEN LOWER(${modelColumn}) LIKE '%boost%' THEN 'electric_bike'
        ELSE 'classic_bike'
      END AS bike_type,
      ${MEMBER_CASUAL_SQL}
    FROM ${readCsvWithIsoTimes(readCsvFrom, "start_time", "end_time")}
    WHERE start_station_name IS NOT NULL AND end_station_name IS NOT NULL
      AND TRIM(start_station_name) <> '' AND TRIM(end_station_name) <> ''
  `;
}

/**
 * 2014–2015 XLSX→CSV: monthly OD matrix (*-Trips.csv), title row then header.
 * Join Station-Key.csv for station names; derive ym from filename via regexp_extract.
 */
function queryD2014MatrixTrips(tripsGlobEscaped: string, stationKeyCsvEscaped: string): string {
  return `
    SELECT
      CAST(t.start_terminal AS VARCHAR) || '_' || CAST(t.end_terminal AS VARCHAR) || '_' || CAST(t.rn AS VARCHAR) AS trip_row_id,
      LOWER(TRIM(ss.station)) AS raw_start_name,
      LOWER(TRIM(es.station)) AS raw_end_name,
      regexp_extract(t.filename, '(\\d{4}-\\d{2})', 1) || '-15 12:00:00' AS started_at_str,
      regexp_extract(t.filename, '(\\d{4}-\\d{2})', 1) || '-15 12:00:00' AS ended_at_str,
      'classic_bike' AS bike_type,
      CASE WHEN COALESCE(TRY_CAST(TRIM(CAST(t.registered AS VARCHAR)) AS INTEGER), 0)
          >= COALESCE(TRY_CAST(TRIM(CAST(t.casual AS VARCHAR)) AS INTEGER), 0)
        THEN 'member' ELSE 'casual' END AS member_casual
    FROM (
      SELECT main.*, ROW_NUMBER() OVER () AS rn
      FROM read_csv('${tripsGlobEscaped}',
        skip=1,
        filename=true,
        ${READ_CSV_OPTS}
      ) AS main
    ) AS t
    INNER JOIN read_csv('${stationKeyCsvEscaped}', ${READ_CSV_OPTS}) AS ss
      ON CAST(t.start_terminal AS BIGINT) = CAST(ss.terminal AS BIGINT)
    INNER JOIN read_csv('${stationKeyCsvEscaped}', ${READ_CSV_OPTS}) AS es
      ON CAST(t.end_terminal AS BIGINT) = CAST(es.terminal AS BIGINT)
    WHERE t.start_terminal IS NOT NULL AND t.end_terminal IS NOT NULL
  `;
}

type RawTripRow = {
  trip_row_id: string;
  raw_start_name: string;
  raw_end_name: string;
  started_at_str: string | null;
  ended_at_str: string | null;
  bike_type: string;
  member_casual: string;
};

/** Second Sunday of March (day of month 1–31). */
function secondSundayOfMarch(year: number): number {
  const d = new Date(Date.UTC(year, 2, 1));
  const dow = d.getUTCDay();
  const firstSunday = 1 + ((7 - dow) % 7);
  return firstSunday + 7;
}

/** First Sunday of November (day of month 1–31). */
function firstSundayOfNovember(year: number): number {
  const d = new Date(Date.UTC(year, 10, 1));
  const dow = d.getUTCDay();
  return 1 + ((7 - dow) % 7);
}

/** Toronto observes EDT between second Sunday March 2:00 and first Sunday November 2:00 (simplified). */
function isTorontoEdt(y: number, m: number, d: number, h: number, mi: number): boolean {
  if (m < 3 || m > 11) return false;
  if (m > 3 && m < 11) return true;
  const ss = secondSundayOfMarch(y);
  const fs = firstSundayOfNovember(y);
  if (m === 3) {
    if (d < ss) return false;
    if (d > ss) return true;
    return h > 2 || (h === 2 && mi > 0);
  }
  if (m === 11) {
    if (d < fs) return true;
    if (d > fs) return false;
    return h < 2 || (h === 2 && mi === 0);
  }
  return false;
}

/** Convert naive Toronto wall-clock components to UTC epoch ms. */
function torontoLocalToUtcMs(y: number, mo: number, d: number, h: number, mi: number, s: number): number {
  const edt = isTorontoEdt(y, mo, d, h, mi);
  const offsetH = edt ? 4 : 5;
  return Date.UTC(y, mo - 1, d, h + offsetH, mi, s);
}

/** Parse timestamp strings from CSV; returns local Toronto components, or null if out of range. */
export function parseTorontoLocal(str: string | null): {
  y: number;
  m: number;
  d: number;
  h: number;
  mi: number;
  s: number;
} | null {
  if (str === null || str === undefined) return null;
  const t = String(str).trim();
  if (t === "") return null;

  const mdUs = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (mdUs) {
    const mo = Number(mdUs[1]);
    const d = Number(mdUs[2]);
    const y = Number(mdUs[3]);
    const h = Number(mdUs[4]);
    const mi = Number(mdUs[5]);
    const s = mdUs[6] !== undefined ? Number(mdUs[6]) : 0;
    return validWallParts({ y, m: mo, d, h, mi, s });
  }

  const isoLike = t.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (isoLike) {
    return validWallParts({
      y: Number(isoLike[1]),
      m: Number(isoLike[2]),
      d: Number(isoLike[3]),
      h: Number(isoLike[4]),
      mi: Number(isoLike[5]),
      s: isoLike[6] !== undefined ? Number(isoLike[6]) : 0,
    });
  }

  return null;
}

/**
 * Rejects impossible components so Date.UTC cannot silently roll e.g. month 13 into the next year.
 * Open data starts in 2014; earlier years are bad rows (one 2016 trip is stamped 2000-01-01).
 */
function validWallParts<T extends { y: number; m: number; d: number; h: number; mi: number; s: number }>(
  p: T,
): T | null {
  const daysInMonth = new Date(Date.UTC(p.y, p.m, 0)).getUTCDate();
  const ok =
    Number.isInteger(p.y) && p.y >= 2014 &&
    p.m >= 1 && p.m <= 12 &&
    p.d >= 1 && p.d <= daysInMonth &&
    p.h >= 0 && p.h <= 23 && p.mi >= 0 && p.mi <= 59 && p.s >= 0 && p.s <= 59;
  return ok ? p : null;
}

function localComponentsToHour(lc: { h: number }): number {
  return Math.min(23, Math.max(0, lc.h));
}

function loadRouteCache(): Map<string, RouteInfo> {
  if (!existsSync(ROUTE_DB)) {
    console.warn(`[build-parquet] routes.db not found at ${ROUTE_DB}`);
    return new Map();
  }

  const db = new Database(ROUTE_DB, { readonly: true });
  const stmt = db.prepare(
    "SELECT start_name, end_name, geometry, distance_m, elevation_up, elevation_down FROM routes WHERE geometry IS NOT NULL",
  );
  const rows = stmt.all() as unknown[];
  db.close();

  const routeCache = new Map<string, RouteInfo>();
  for (const row of rows) {
    let start: string;
    let end: string;
    let geometry: string;
    let dm: unknown;
    let eu: unknown;
    let ed: unknown;

    if (Array.isArray(row)) {
      const r = row as unknown[];
      start = String(r[0] ?? "");
      end = String(r[1] ?? "");
      geometry = String(r[2] ?? "");
      dm = r[3];
      eu = r[4];
      ed = r[5];
    } else {
      const r = row as Record<string, unknown>;
      start = String(r.start_name ?? "");
      end = String(r.end_name ?? "");
      geometry = String(r.geometry ?? "");
      dm = r.distance_m;
      eu = r.elevation_up;
      ed = r.elevation_down;
    }

    if (!start || !end || !geometry || String(geometry).trim() === "") continue;

    const distance_m = dm !== undefined && dm !== null ? Number(dm) : null;
    const elevation_up = eu !== undefined && eu !== null ? Number(eu) : null;
    const elevation_down = ed !== undefined && ed !== null ? Number(ed) : null;

    routeCache.set(routeKey(start, end), {
      geometry,
      distance_m: Number.isFinite(distance_m) ? distance_m : null,
      elevation_up: Number.isFinite(elevation_up) ? elevation_up : null,
      elevation_down: Number.isFinite(elevation_down) ? elevation_down : null,
    });
  }
  return routeCache;
}

function loadAliasMap(stations: StationRecord[]): Map<string, string> {
  const aliases = new Map<string, string>();
  for (const station of stations) {
    aliases.set(normalizeStationName(station.canonicalName), station.canonicalName);
    for (const alias of station.aliases) {
      aliases.set(normalizeStationName(alias), station.canonicalName);
    }
  }
  return aliases;
}

type DuckConn = {
  runAndReadAll: (sql: string) => Promise<{ getRows: () => unknown[] }>;
};

/** Remove parquets whose name looks like YYYY-MM but MM is not 01–12 (e.g. mistaken ISO week). */
function deleteInvalidYmParquets(outDir: string): void {
  if (!existsSync(outDir)) return;
  for (const name of readdirSync(outDir)) {
    const m = name.match(/^(\d{4})-(\d{2})\.parquet$/);
    if (!m) continue;
    const month = Number(m[2]);
    if (month >= 1 && month <= 12) continue;
    const p = join(outDir, name);
    console.log(`[build-parquet] Removing invalid month parquet: ${p}`);
    try {
      unlinkSync(p);
    } catch {
      /* ignore */
    }
  }
}

/** Log header row from a sample *-Trips.csv (2014–2015 matrix files have a title line before the header). */
function logSampleTripCsvColumns(dirName: string): void {
  const root = join(EXTRACTED_ROOT, dirName);
  if (!existsSync(root)) return;

  const walk = (d: string): string | null => {
    for (const ent of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, ent.name);
      if (ent.isDirectory()) {
        const w = walk(p);
        if (w) return w;
      } else if (/^\d{4}-\d{2}-Trips\.csv$/i.test(ent.name)) {
        return p;
      }
    }
    return null;
  };

  const sample = walk(root);
  if (!sample) return;
  const text = readFileSync(sample, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  const title = lines[0] ?? "";
  const header = lines[1] ?? "";
  console.log(
    `[build-parquet] Sample trip CSV for column check (${sample}):\n  line1 (title): ${title}\n  line2 (header): ${header}`,
  );
}

type QueryAttempt = "rows" | "empty" | "binder";

async function fetchTripRowsForYear(conn: DuckConn, readCsvEscaped: string, dirName: string): Promise<RawTripRow[]> {
  const merged = new Map<string, RawTripRow>();

  const runQuery = async (sql: string, label: string): Promise<QueryAttempt> => {
    try {
      const reader = await conn.runAndReadAll(sql);
      const rows = reader.getRows() as Array<[string, string, string, string | null, string | null, string, string]>;
      merged.clear();
      for (const row of rows) {
        const [trip_row_id, raw_start_name, raw_end_name, started_at_str, ended_at_str, bike_type, member_casual] =
          row;
        if (!trip_row_id) continue;
        merged.set(String(trip_row_id), {
          trip_row_id: String(trip_row_id),
          raw_start_name,
          raw_end_name,
          started_at_str,
          ended_at_str,
          bike_type,
          member_casual,
        });
      }
      return rows.length > 0 ? "rows" : "empty";
    } catch (err) {
      if (isMissingColumnBinderError(err)) {
        console.warn(`[build-parquet] ${label}: binder error (schema mismatch), trying next.`);
        return "binder";
      }
      throw err;
    }
  };

  const tripsOnlyGlob = sqlEscape(toDuckPath(join(EXTRACTED_ROOT, dirName, "**", "*-Trips.csv")));
  const stationKeyCsv = sqlEscape(toDuckPath(join(EXTRACTED_ROOT, dirName, "Station-Key.csv")));

  const attempts: Array<{ buildSql: () => string; label: string }> = [
    { buildSql: () => queryLegacyTrips(readCsvEscaped), label: "legacy trip query" },
    // Model-column queries go before query C, which would also match these years but drop bike type.
    { buildSql: () => queryModernTrips(readCsvEscaped, "bike_model"), label: "modern trip query (bike_model)" },
    { buildSql: () => queryModernTrips(readCsvEscaped, "model"), label: "modern trip query (model)" },
    { buildSql: () => query2019NoBikeModel(readCsvEscaped), label: "query C (2019-2023, no model column)" },
    { buildSql: () => queryD2014MatrixTrips(tripsOnlyGlob, stationKeyCsv), label: "query D (2014-2015 OD matrix)" },
  ];

  for (const { buildSql, label } of attempts) {
    const outcome = await runQuery(buildSql(), label);
    if (outcome === "rows") return [...merged.values()];
  }

  console.warn(
    `[build-parquet] All trip queries returned 0 rows or failed with binder errors for year folder: ${dirName}`,
  );
  return [];
}

async function writeMonthParquet(rows: TripRowJson[], outPath: string): Promise<void> {
  if (rows.length === 0) return;

  const tmpJson = `${outPath}.tmp.${process.pid}.${Date.now()}.json`;
  writeFileSync(tmpJson, JSON.stringify(rows));
  const duckJson = toDuckPath(tmpJson);
  const duckOut = toDuckPath(outPath);

  const instance = await DuckDBInstance.create(":memory:");
  const conn = await instance.connect();
  await conn.run(`SET memory_limit='1GB';`);
  await conn.run(`SET threads=1;`);

  try {
    await conn.run(`
      COPY (
        SELECT
          id::VARCHAR AS id,
          start_name AS startName,
          end_name AS endName,
          CAST(started_at AS TIMESTAMP) AS startedAt,
          CAST(ended_at AS TIMESTAMP) AS endedAt,
          bike_type AS bikeType,
          member_casual AS memberCasual,
          CAST(hour AS TINYINT) AS hour,
          route_geometry AS routeGeometry,
          CAST(distance_m AS FLOAT) AS distanceM,
          CAST(elevation_up AS FLOAT) AS elevationUp,
          CAST(elevation_down AS FLOAT) AS elevationDown
        FROM read_json_auto('${sqlEscape(duckJson)}')
      ) TO '${sqlEscape(duckOut)}'
      (FORMAT PARQUET, COMPRESSION ZSTD)
    `);
  } finally {
    try {
      unlinkSync(tmpJson);
    } catch {
      /* ignore */
    }
    conn.closeSync();
    instance.closeSync();
  }
}

async function main(): Promise<void> {
  if (!existsSync(STATIONS_FILE)) throw new Error(`Missing ${STATIONS_FILE}. Run \`bun run stations\` first.`);
  if (!existsSync(ROUTE_DB)) throw new Error(`Missing ${ROUTE_DB}. Run \`bun run routes\` first.`);
  ensureDir(OUT_DIR);
  deleteInvalidYmParquets(OUT_DIR);

  const stations = JSON.parse(readFileSync(STATIONS_FILE, "utf8")) as StationRecord[];
  const aliasMap = loadAliasMap(stations);
  const routeCache = loadRouteCache();
  console.log(
    `Loaded ${aliasMap.size} alias keys, ${routeCache.size} routes from ${ROUTE_DB} (JS Maps — not in DuckDB).\n`,
  );

  const yearDirs = listYearExtractDirs().filter(yearFolderHasCsv);
  if (yearDirs.length === 0) {
    throw new Error(`No CSV files found under ${EXTRACTED_ROOT}. Run \`bun run stations\` to extract trip data.`);
  }

  console.log(`Processing ${yearDirs.length} year folder(s) (CSV in DuckDB only; joins in JS).\n`);

  for (const dirName of yearDirs) {
    const readCsvGlob = toDuckPath(join(EXTRACTED_ROOT, dirName, "**/*.csv"));
    console.log(`\n=== Year folder: ${dirName} ===`);
    console.log(`read_csv: ${readCsvGlob}`);
    logSampleTripCsvColumns(dirName);

    const instance = await DuckDBInstance.create(":memory:");
    const conn = await instance.connect();
    await conn.run(`SET memory_limit='1GB';`);
    await conn.run(`SET threads=1;`);

    let rawTrips: RawTripRow[];
    try {
      rawTrips = await fetchTripRowsForYear(conn, sqlEscape(readCsvGlob), dirName);
    } catch (err) {
      console.warn(`[build-parquet] Skipping ${dirName}: ${String(err)}`);
      conn.closeSync();
      instance.closeSync();
      continue;
    }

    conn.closeSync();
    instance.closeSync();
    console.log(`Fetched ${rawTrips.length} raw trip row(s) (deduped by trip_id); closed DuckDB for this year.`);

    const byMonth = new Map<string, TripRowJson[]>();

    for (const trip of rawTrips) {
      const startLc = parseTorontoLocal(trip.started_at_str);
      const endLc = parseTorontoLocal(trip.ended_at_str);
      if (!startLc) continue;

      const startedUtcMs = torontoLocalToUtcMs(
        startLc.y,
        startLc.m,
        startLc.d,
        startLc.h,
        startLc.mi,
        startLc.s,
      );
      const endedUtcMs = endLc
        ? torontoLocalToUtcMs(endLc.y, endLc.m, endLc.d, endLc.h, endLc.mi, endLc.s)
        : startedUtcMs;

      // Toronto month, not UTC: otherwise Dec 31 evening trips land in next year's January file.
      const ym = `${startLc.y}-${String(startLc.m).padStart(2, "0")}`;
      const hour = localComponentsToHour(startLc);

      const startCanon = aliasMap.get(normalizeStationName(trip.raw_start_name));
      const endCanon = aliasMap.get(normalizeStationName(trip.raw_end_name));
      if (!startCanon || !endCanon) continue;

      const route = routeCache.get(routeKey(startCanon, endCanon));
      if (!route) continue;

      const bucket = byMonth.get(ym) ?? [];
      bucket.push({
        id: trip.trip_row_id,
        start_name: startCanon,
        end_name: endCanon,
        started_at: new Date(startedUtcMs).toISOString(),
        ended_at: new Date(endedUtcMs).toISOString(),
        bike_type: trip.bike_type,
        member_casual: trip.member_casual,
        hour,
        route_geometry: route.geometry,
        distance_m: route.distance_m,
        elevation_up: route.elevation_up,
        elevation_down: route.elevation_down,
      });
      byMonth.set(ym, bucket);
    }

    const sortedMonths = [...byMonth.keys()].sort();
    for (const ym of sortedMonths) {
      const outPath = join(OUT_DIR, `${ym}.parquet`);
      if (existsSync(outPath)) {
        console.log(`Skip ${ym}.parquet (already exists)`);
        continue;
      }
      const monthRows = byMonth.get(ym) ?? [];
      if (monthRows.length === 0) continue;

      await writeMonthParquet(monthRows, outPath);
      console.log(`Wrote ${outPath} (${monthRows.length.toLocaleString()} rows)`);
    }

    byMonth.clear();
    console.log(`Finished ${dirName}.`);
  }

  console.log("\nDone.");
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
