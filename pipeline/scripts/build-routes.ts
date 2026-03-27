import { DuckDBInstance } from "@duckdb/node-api";
import { Database } from "bun:sqlite";
import { existsSync, mkdirSync, readFileSync } from "fs";

type StationRecord = {
  id: number;
  canonicalName: string;
  aliases: string[];
  lat: number;
  lng: number;
  capacity: number | null;
};

type RouteResult = {
  geometry: string;
  distance: number;
};

const GRAPHHOPPER_URL = "http://localhost:8989/route";
const CACHE_DB = "./output/routes.db";
const STATIONS_FILE = "./output/stations.json";

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeStationName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*&\s*/g, " / ")
    .replace(/[.,]/g, "");
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function decodePolyline6(encoded: string): Array<[number, number]> {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: Array<[number, number]> = [];
  const factor = 1e6;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLat = (result & 1) ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = (result & 1) ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
}

function encodePolyline6(points: Array<[number, number]>): string {
  const factor = 1e6;
  let prevLat = 0;
  let prevLng = 0;
  let out = "";

  const encodeDelta = (value: number): string => {
    let v = value < 0 ? ~(value << 1) : value << 1;
    let chunk = "";
    while (v >= 0x20) {
      chunk += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
      v >>= 5;
    }
    chunk += String.fromCharCode(v + 63);
    return chunk;
  };

  for (const [lat, lng] of points) {
    const latI = Math.round(lat * factor);
    const lngI = Math.round(lng * factor);
    out += encodeDelta(latI - prevLat);
    out += encodeDelta(lngI - prevLng);
    prevLat = latI;
    prevLng = lngI;
  }
  return out;
}

async function getRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<RouteResult | null> {
  const params = new URLSearchParams({
    point: `${fromLat},${fromLng}`,
    profile: "bike",
    points_encoded: "true",
  });
  params.append("point", `${toLat},${toLng}`);
  const url = `${GRAPHHOPPER_URL}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as {
    paths?: Array<{ points?: string; distance?: number }>;
  };
  if (!json.paths?.[0]?.points) return null;
  return {
    geometry: json.paths[0].points,
    distance: json.paths[0].distance ?? 0,
  };
}

async function assertGraphhopperReachable(stations: StationRecord[]): Promise<void> {
  const a = stations.find((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));
  const b = stations.find(
    (s) =>
      Number.isFinite(s.lat) &&
      Number.isFinite(s.lng) &&
      (a ? s.canonicalName !== a.canonicalName : true),
  );

  if (!a || !b) {
    throw new Error("No stations available to test GraphHopper connectivity.");
  }

  try {
    const test = await getRoute(a.lat, a.lng, b.lat, b.lng);
    if (!test) {
      throw new Error(
        "GraphHopper is not running on localhost:8989. Start it with Docker first.",
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("GraphHopper is not running on localhost:8989")) {
      throw err;
    }
    throw new Error(
      `GraphHopper is not running on localhost:8989. Start it with Docker first.\n\nUnderlying error: ${msg}`,
    );
  }
}

function combinePolyline6(a: string, b: string): string {
  const aPts = decodePolyline6(a);
  const bPts = decodePolyline6(b);
  if (aPts.length === 0) return b;
  if (bPts.length === 0) return a;
  const merged = [...aPts, ...bPts.slice(1)];
  return encodePolyline6(merged);
}

/** DuckDB omits columns from read_csv schema when no input file has that header — bind fails. */
function isMissingColumnBinderError(err: unknown): boolean {
  const s = err instanceof Error ? err.message : String(err);
  return s.includes("Binder Error") && s.includes("not found");
}

async function main(): Promise<void> {
  if (!existsSync(STATIONS_FILE)) {
    throw new Error("Missing output/stations.json. Run `bun run stations` first.");
  }
  ensureDir("./output");

  const stations = JSON.parse(readFileSync(STATIONS_FILE, "utf8")) as StationRecord[];
  await assertGraphhopperReachable(stations);
  const aliasToCanonical = new Map<string, string>();
  const canonicalToStation = new Map<string, StationRecord>();

  for (const station of stations) {
    canonicalToStation.set(station.canonicalName, station);
    aliasToCanonical.set(normalizeStationName(station.canonicalName), station.canonicalName);
    for (const alias of station.aliases) {
      aliasToCanonical.set(normalizeStationName(alias), station.canonicalName);
    }
  }

  const instance = await DuckDBInstance.create(":memory:");
  const conn = await instance.connect();

  const readCsvTripFiles = `read_csv('./data/extracted/**/*.csv',
      union_by_name=true,
      normalize_names=true,
      all_varchar=true,
      null_padding=true,
      ignore_errors=true,
      quote='"'
    )`;

  // Two queries: legacy vs modern column names. Same relation schema issue as build-stations.ts.
  const legacyPairsSql = `
    SELECT DISTINCT
      LOWER(TRIM(from_station_name)) AS start_name,
      LOWER(TRIM(to_station_name)) AS end_name
    FROM ${readCsvTripFiles}
    WHERE from_station_name IS NOT NULL AND to_station_name IS NOT NULL
      AND TRIM(from_station_name) <> '' AND TRIM(to_station_name) <> ''
  `;

  const modernPairsSql = `
    SELECT DISTINCT
      LOWER(TRIM(start_station_name)) AS start_name,
      LOWER(TRIM(end_station_name)) AS end_name
    FROM ${readCsvTripFiles}
    WHERE start_station_name IS NOT NULL AND end_station_name IS NOT NULL
      AND TRIM(start_station_name) <> '' AND TRIM(end_station_name) <> ''
  `;

  /** Dedupe raw (start,end) rows before resolving aliases (tab delimiter matches split below). */
  const rawPairKeys = new Set<string>();

  for (const [label, sql] of [
    ["legacy from_station_name / to_station_name", legacyPairsSql],
    ["modern start_station_name / end_station_name", modernPairsSql],
  ] as const) {
    try {
      const pairsReader = await conn.runAndReadAll(sql);
      const pairRows = pairsReader.getRows() as Array<[string, string]>;
      for (const [rawStart, rawEnd] of pairRows) {
        if (!rawStart || !rawEnd) continue;
        rawPairKeys.add(`${rawStart}\t${rawEnd}`);
      }
    } catch (err) {
      if (isMissingColumnBinderError(err)) {
        console.warn(
          `[build-routes] Skipping ${label} pair query — column not present in CSV schema.`,
        );
        continue;
      }
      throw err;
    }
  }

  const uniquePairs = new Set<string>();
  for (const key of rawPairKeys) {
    const [rawStart, rawEnd] = key.split("\t");
    if (!rawStart || !rawEnd) continue;
    const start = aliasToCanonical.get(normalizeStationName(rawStart));
    const end = aliasToCanonical.get(normalizeStationName(rawEnd));
    if (!start || !end) continue;
    uniquePairs.add(`${start}\t${end}`);
  }

  const db = new Database(CACHE_DB);
  db.exec(`
    CREATE TABLE IF NOT EXISTS routes (
      start_name      TEXT NOT NULL,
      end_name        TEXT NOT NULL,
      geometry        TEXT,
      distance_m      REAL,
      PRIMARY KEY (start_name, end_name)
    )
  `);

  const hasStmt = db.prepare(
    "SELECT geometry FROM routes WHERE start_name = ? AND end_name = ? LIMIT 1",
  );
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO routes
      (start_name, end_name, geometry, distance_m)
    VALUES (?, ?, ?, ?)
  `);

  let processed = 0;
  let inserted = 0;
  let skippedExistingWithGeometry = 0;
  let pairsWithGeometry = 0;
  let pairsWithNullGeometry = 0;
  for (const key of uniquePairs) {
    processed += 1;
    const [startName, endName] = key.split("\t");
    if (!startName || !endName) continue;

    const existing = hasStmt.get(startName, endName) as { geometry: string | null } | null;
    if (existing?.geometry) {
      skippedExistingWithGeometry += 1;
      continue;
    }

    const startStation = canonicalToStation.get(startName);
    const endStation = canonicalToStation.get(endName);
    if (!startStation || !endStation) {
      insertStmt.run(startName, endName, null, null, null, null);
      pairsWithNullGeometry += 1;
      continue;
    }

    let route: RouteResult | null = null;
    if (startName === endName) {
      let nearest: StationRecord | null = null;
      let nearestDist = Number.POSITIVE_INFINITY;
      for (const station of stations) {
        if (station.canonicalName === startName) continue;
        const d = haversineMeters(startStation.lat, startStation.lng, station.lat, station.lng);
        if (d < nearestDist) {
          nearest = station;
          nearestDist = d;
        }
      }

      if (nearest && nearestDist <= 1000) {
        const leg1 = await getRoute(startStation.lat, startStation.lng, nearest.lat, nearest.lng);
        await sleep(50);
        const leg2 = await getRoute(nearest.lat, nearest.lng, startStation.lat, startStation.lng);
        if (leg1 && leg2) {
          route = {
            geometry: combinePolyline6(leg1.geometry, leg2.geometry),
            distance: leg1.distance + leg2.distance,
          };
        }
      }
    } else {
      route = await getRoute(startStation.lat, startStation.lng, endStation.lat, endStation.lng);
    }

    if (!route) {
      console.warn(`[build-routes] Failed route: "${startName}" -> "${endName}" (NULL geometry)`);
      pairsWithNullGeometry += 1;
    } else {
      pairsWithGeometry += 1;
    }

    insertStmt.run(
      startName,
      endName,
      route?.geometry ?? null,
      route?.distance ?? null,
    );
    inserted += 1;

    if (processed % 100 === 0) {
      console.log(`Processed ${processed}/${uniquePairs.size} pairs (inserted ${inserted})`);
    }
    await sleep(50);
  }

  console.log(
    [
      "[build-routes] Summary",
      `- Total pairs processed: ${processed}`,
      `- Pairs with geometry (success): ${pairsWithGeometry}`,
      `- Pairs with NULL geometry (failed): ${pairsWithNullGeometry}`,
      `- Skipped (already had geometry): ${skippedExistingWithGeometry}`,
    ].join("\n"),
  );
  db.close();
  conn.closeSync();
  instance.closeSync();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
