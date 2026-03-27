import { DuckDBInstance } from "@duckdb/node-api";
import { mkdirSync, existsSync, writeFileSync, readdirSync } from "fs";
import { join, basename, extname } from "path";
import AdmZip from "adm-zip";
import * as XLSX from "xlsx";

type GbfsStation = {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  capacity?: number;
};

type StationCluster = {
  id: number;
  canonicalName: string;
  aliases: string[];
  lat: number;
  lng: number;
  capacity: number | null;
};

const CKAN_BASE_URL = "https://ckan0.cf.opendata.inter.prod-toronto.ca";
const CKAN_PACKAGE_ID = "7e876c24-177c-4605-9cef-e50dd74c617f";
const GBFS_URL = "https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information";

const DATA_DIR = "./data";
const RAW_DIR = "./data/raw";
const EXTRACTED_DIR = "./data/extracted";
const OUTPUT_DIR = "./output";
const STATIONS_OUT = "./output/stations.json";

/** Open Toronto / CKAN fetch timeout (5 minutes). */
const FETCH_TIMEOUT_MS = 300_000;
const FETCH_RETRY_DELAY_MS = 2_000;
const FETCH_MAX_ATTEMPTS = 3;

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatFetchError(err: unknown): string {
  if (err instanceof Error && err.name === "AbortError") {
    return `timeout after ${FETCH_TIMEOUT_MS}ms`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

/**
 * Fetch with timeout and retries on network failure or timeout.
 * @param throwOnExhausted - if true, throws after all attempts fail; if false, returns null
 */
async function fetchOpenTorontoWithRetry(
  url: string,
  context: string,
  throwOnExhausted: boolean,
): Promise<Response | null> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= FETCH_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      console.log(`[${context}] fetch attempt ${attempt}/${FETCH_MAX_ATTEMPTS}`);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      console.warn(
        `[${context}] attempt ${attempt}/${FETCH_MAX_ATTEMPTS} failed: ${formatFetchError(err)}`,
      );

      if (attempt < FETCH_MAX_ATTEMPTS) {
        await sleep(FETCH_RETRY_DELAY_MS);
      }
    }
  }

  if (throwOnExhausted) {
    const msg = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`[${context}] failed after ${FETCH_MAX_ATTEMPTS} attempts: ${msg}`);
  }

  console.warn(
    `[${context}] all ${FETCH_MAX_ATTEMPTS} attempts failed; skipping this resource.`,
  );
  return null;
}

/**
 * Download URL to buffer with retries. Fetch + body read must stay in the same try —
 * Bun often completes `fetch()` then fails while streaming `arrayBuffer()` (ECONNRESET).
 */
async function downloadUrlToBufferWithRetry(url: string, context: string): Promise<Buffer | null> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= FETCH_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      console.log(`[${context}] fetch attempt ${attempt}/${FETCH_MAX_ATTEMPTS}`);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[${context}] HTTP ${res.status}; not retrying.`);
        return null;
      }

      const arrayBuf = await res.arrayBuffer();
      return Buffer.from(arrayBuf);
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      console.warn(
        `[${context}] attempt ${attempt}/${FETCH_MAX_ATTEMPTS} failed: ${formatFetchError(err)}`,
      );
      if (attempt < FETCH_MAX_ATTEMPTS) {
        await sleep(FETCH_RETRY_DELAY_MS);
      }
    }
  }

  console.warn(
    `[${context}] all ${FETCH_MAX_ATTEMPTS} attempts failed; skipping this resource.`,
  );
  return null;
}

function normalizeStationName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*&\s*/g, " / ")
    .replace(/[.,]/g, "");
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-z0-9_.-]+/gi, "-").replace(/-+/g, "-");
}

function listFilesRecursive(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

/** DuckDB omits columns from read_csv schema when no input file has that header — bind fails. */
function isMissingColumnBinderError(err: unknown): boolean {
  const s = err instanceof Error ? err.message : String(err);
  return s.includes("Binder Error") && s.includes("not found");
}

type CkanResource = {
  name: string;
  url: string;
  format?: string;
};

function resourceLocalRawPath(resource: CkanResource): { localRawPath: string; loweredExt: string } {
  const label = resource.name;
  const loweredExt = (extname(new URL(resource.url).pathname) || ".bin").toLowerCase();
  let base = sanitizeFileName(label);
  if (base.toLowerCase().endsWith(loweredExt)) {
    base = base.slice(0, -loweredExt.length);
  }
  const localRawPath = join(RAW_DIR, `${base}${loweredExt}`);
  return { localRawPath, loweredExt };
}

/** Older script versions wrote `name.zip` + `.zip` → `*.zip.zip`; still recognize those files. */
function legacyDoubleExtRawPath(resource: CkanResource, loweredExt: string): string {
  return join(RAW_DIR, `${sanitizeFileName(resource.name)}${loweredExt}`);
}

function resolveExistingRawPath(resource: CkanResource): {
  path: string;
  loweredExt: string;
} | null {
  const { localRawPath, loweredExt } = resourceLocalRawPath(resource);
  if (existsSync(localRawPath)) {
    return { path: localRawPath, loweredExt };
  }
  const legacy = legacyDoubleExtRawPath(resource, loweredExt);
  if (existsSync(legacy)) {
    return { path: legacy, loweredExt };
  }
  return null;
}

async function fetchCkanPackageResources(): Promise<CkanResource[]> {
  const packageUrl = `${CKAN_BASE_URL}/api/3/action/package_show?id=${CKAN_PACKAGE_ID}`;
  const packageRes = await fetchOpenTorontoWithRetry(
    packageUrl,
    "CKAN package_show",
    true,
  );
  if (!packageRes?.ok) {
    throw new Error(`Failed to fetch CKAN package metadata (${packageRes?.status ?? "no response"})`);
  }

  const packageJson = (await packageRes.json()) as {
    success?: boolean;
    result?: { resources?: Array<{ name?: string; url?: string; format?: string }> };
  };
  if (!packageJson.success || !packageJson.result?.resources) {
    throw new Error("CKAN package metadata response missing resources.");
  }

  const resources: CkanResource[] = packageJson.result.resources
    .filter((r): r is { name: string; url: string; format?: string } => Boolean(r.url && r.name))
    .map((r) => ({ name: r.name, url: r.url, format: r.format }));

  console.log(
    `\n[CKAN] Package has ${resources.length} downloadable resource(s). Full list:`,
  );
  for (let i = 0; i < resources.length; i += 1) {
    const r = resources[i];
    console.log(`  ${i + 1}. ${r.name} — format: ${r.format ?? "unknown"}`);
  }
  console.log("");

  return resources;
}

/** Phase 1: download every CKAN resource to data/raw (skip file if already present). */
async function downloadAllCkanResources(resources: CkanResource[]): Promise<void> {
  const total = resources.length;
  for (let i = 0; i < total; i += 1) {
    const resource = resources[i];
    if (!resource) continue;
    const label = resource.name;
    const { localRawPath } = resourceLocalRawPath(resource);
    const n = i + 1;

    const existing = resolveExistingRawPath(resource);
    if (existing) {
      console.log(`Skipping ${label} (${n}/${total}) — already on disk: ${existing.path}`);
      continue;
    }

    console.log(`Downloading ${label} (${n}/${total})...`);
    const buf = await downloadUrlToBufferWithRetry(resource.url, `download: ${label}`);
    if (!buf) {
      console.warn(`[${label}] download failed after retries; will skip extract for this resource.`);
      continue;
    }
    writeFileSync(localRawPath, buf);
    console.log(
      `Downloaded ${label} (${n}/${total}) → ${localRawPath} (${buf.length.toLocaleString()} bytes)`,
    );
  }
}

/** Phase 2: extract all ZIPs and convert XLSX → CSV under data/extracted. */
function extractAllTripData(resources: CkanResource[]): void {
  console.log("All files downloaded. Extracting...\n");

  for (const resource of resources) {
    const label = resource.name;
    const { localRawPath, loweredExt } = resourceLocalRawPath(resource);
    const existingRaw = resolveExistingRawPath(resource);
    const rawPathForExtract = existingRaw?.path;

    if (!rawPathForExtract) {
      console.warn(`[${label}] skipping extract — raw file not found`);
      continue;
    }

    const extractedTarget = join(
      EXTRACTED_DIR,
      sanitizeFileName(basename(localRawPath, loweredExt)),
    );
    ensureDir(extractedTarget);

    if (loweredExt === ".zip") {
      console.log(`Extracting ZIP: ${label} → ${extractedTarget}`);
      const zip = new AdmZip(rawPathForExtract);
      zip.extractAllTo(extractedTarget, true);
      continue;
    }

    if (loweredExt === ".xlsx" || loweredExt === ".xls") {
      console.log(`Converting spreadsheet: ${label} → ${extractedTarget}`);
      const workbook = XLSX.readFile(rawPathForExtract);
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;
        const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
        const outPath = join(extractedTarget, `${sanitizeFileName(sheetName)}.csv`);
        writeFileSync(outPath, csv);
      }
    }
  }

  const csvCount = listFilesRecursive(EXTRACTED_DIR).filter((f) =>
    f.toLowerCase().endsWith(".csv"),
  ).length;
  console.log(`\nExtraction finished. ${csvCount} CSV file(s) under ${EXTRACTED_DIR}.\n`);
}

async function ensureTripDataDownloadedAndExtracted(): Promise<void> {
  ensureDir(DATA_DIR);
  ensureDir(RAW_DIR);
  ensureDir(EXTRACTED_DIR);

  const resources = await fetchCkanPackageResources();
  await downloadAllCkanResources(resources);
  extractAllTripData(resources);
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

class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = Array(size).fill(0);
  }

  find(x: number): number {
    const parentX = this.parent[x];
    if (parentX === undefined) {
      throw new Error(`UnionFind index out of bounds: ${x}`);
    }
    if (parentX !== x) this.parent[x] = this.find(parentX);
    return this.parent[x] ?? x;
  }

  union(a: number, b: number): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return;
    const rankA = this.rank[ra] ?? 0;
    const rankB = this.rank[rb] ?? 0;
    if (rankA < rankB) this.parent[ra] = rb;
    else if (rankA > rankB) this.parent[rb] = ra;
    else {
      this.parent[rb] = ra;
      this.rank[ra] = rankA + 1;
    }
  }
}

async function main(): Promise<void> {
  ensureDir(OUTPUT_DIR);
  await ensureTripDataDownloadedAndExtracted();

  const instance = await DuckDBInstance.create(":memory:");
  const conn = await instance.connect();

  const readCsvTripFiles = `read_csv('./data/extracted/**/*.csv',
      union_by_name=true,
      normalize_names=true,
      all_varchar=true,
      null_padding=true,
      ignore_errors=true
    )`;

  // One query per column: with a glob, DuckDB's relation schema only includes columns that appear
  // in at least one file — referencing e.g. start_station_name when only legacy CSVs exist bind-fails.
  // Run separately and skip branches whose column is absent.
  const stationNameColumnQueries: Array<{ column: string; sql: string }> = [
    {
      column: "from_station_name",
      sql: `
        SELECT DISTINCT LOWER(TRIM(from_station_name)) AS name
        FROM ${readCsvTripFiles}
        WHERE from_station_name IS NOT NULL AND TRIM(from_station_name) <> ''
      `,
    },
    {
      column: "to_station_name",
      sql: `
        SELECT DISTINCT LOWER(TRIM(to_station_name)) AS name
        FROM ${readCsvTripFiles}
        WHERE to_station_name IS NOT NULL AND TRIM(to_station_name) <> ''
      `,
    },
    {
      column: "start_station_name",
      sql: `
        SELECT DISTINCT LOWER(TRIM(start_station_name)) AS name
        FROM ${readCsvTripFiles}
        WHERE start_station_name IS NOT NULL AND TRIM(start_station_name) <> ''
      `,
    },
    {
      column: "end_station_name",
      sql: `
        SELECT DISTINCT LOWER(TRIM(end_station_name)) AS name
        FROM ${readCsvTripFiles}
        WHERE end_station_name IS NOT NULL AND TRIM(end_station_name) <> ''
      `,
    },
  ];

  const nameSet = new Set<string>();
  for (const { column, sql } of stationNameColumnQueries) {
    try {
      const reader = await conn.runAndReadAll(sql);
      for (const row of reader.getRows() as Array<[string]>) {
        const [n] = row;
        if (n) nameSet.add(n);
      }
    } catch (err) {
      if (isMissingColumnBinderError(err)) {
        console.warn(
          `[build-stations] Column "${column}" not in CSV schema (no file uses it yet); skipping that branch.`,
        );
        continue;
      }
      throw err;
    }
  }

  const rows = [...nameSet].map((name) => [name] as [string]);

  conn.closeSync();
  instance.closeSync();

  console.log("Fetching GBFS station list for coordinates...\n");
  const gbfsRes = await fetch(GBFS_URL);
  if (!gbfsRes.ok) throw new Error(`Failed to fetch GBFS station info (${gbfsRes.status})`);
  const gbfsJson = (await gbfsRes.json()) as { data?: { stations?: GbfsStation[] } };
  const gbfsStations = gbfsJson.data?.stations ?? [];

  const gbfsByName = new Map<string, GbfsStation>();
  for (const station of gbfsStations) {
    gbfsByName.set(normalizeStationName(station.name), station);
  }

  const points: Array<{
    rawName: string;
    normalizedName: string;
    lat: number;
    lng: number;
    capacity: number | null;
  }> = [];

  for (const [name] of rows) {
    if (!name) continue;
    const normalized = normalizeStationName(name);
    const gbfs = gbfsByName.get(normalized);
    if (!gbfs) continue;
    points.push({
      rawName: gbfs.name,
      normalizedName: normalized,
      lat: gbfs.lat,
      lng: gbfs.lon,
      capacity: gbfs.capacity ?? null,
    });
  }

  if (points.length === 0) {
    throw new Error("No station points matched to GBFS coordinates.");
  }

  const uf = new UnionFind(points.length);
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const pi = points[i];
      const pj = points[j];
      if (!pi || !pj) continue;
      const d = haversineMeters(pi.lat, pi.lng, pj.lat, pj.lng);
      if (d <= 60) uf.union(i, j);
    }
  }

  const clusterMap = new Map<number, number[]>();
  for (let i = 0; i < points.length; i += 1) {
    const root = uf.find(i);
    const arr = clusterMap.get(root) ?? [];
    arr.push(i);
    clusterMap.set(root, arr);
  }

  const clusters: StationCluster[] = [];
  let id = 1;
  for (const members of clusterMap.values()) {
    const aliasSet = new Set<string>();
    let latSum = 0;
    let lngSum = 0;
    let capSum = 0;
    let capCount = 0;
    let canonicalName = "";

    for (const idx of members) {
      const p = points[idx];
      if (!p) continue;
      aliasSet.add(p.rawName);
      latSum += p.lat;
      lngSum += p.lng;
      if (p.capacity !== null) {
        capSum += p.capacity;
        capCount += 1;
      }
      canonicalName = p.rawName;
    }

    const aliases = [...aliasSet].filter((a) => a !== canonicalName).sort();
    clusters.push({
      id,
      canonicalName,
      aliases,
      lat: latSum / members.length,
      lng: lngSum / members.length,
      capacity: capCount > 0 ? Math.round(capSum / capCount) : null,
    });
    id += 1;
  }

  writeFileSync(STATIONS_OUT, JSON.stringify(clusters, null, 2));
  console.log(`Wrote ${clusters.length} canonical stations to ${STATIONS_OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
