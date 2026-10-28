/**
 * Exports one playback hour as a static JSON file so the map can draw its first frame without
 * waiting for DuckDB-WASM to download and query a month of Parquet.
 *
 *   bun run scripts/export-first-hour.ts 2024-07 18 17
 *
 * Writes `public/bike-share/first-hour.json` at the repo root. Keep the slice in step with
 * `FIRST_HOUR` in `src/pages/bike-share-toronto/firstHour.ts`.
 */
import { DuckDBInstance } from "@duckdb/node-api";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { getPlaybackHourWindow, torontoDayRangeMs } from "../../src/pages/bike-share-toronto/torontoTime";

const PIPELINE_ROOT = join(import.meta.dir, "..");
const OUT_DIR = join(PIPELINE_ROOT, "../public/bike-share");
/** Same as useTripStream: rides up to 2 h long can still be riding at the top of the hour. */
const MAX_DRAWN_TRIP_MS = 2 * 3600000;
const DAY_SLICE_LIMIT = 6000;

const COLUMNS = ["id", "startName", "endName", "startedAt", "endedAt", "bikeType", "memberCasual", "hour", "routeGeometry", "distanceM"];

/** Parquet timestamps are naive UTC. */
function sqlTime(ms: number): string {
  return `'${new Date(ms).toISOString().replace("T", " ").replace("Z", "")}'`;
}

async function main(): Promise<void> {
  const [month, dayArg, hourArg] = process.argv.slice(2);
  const day = Number(dayArg);
  const hour = Number(hourArg);
  if (!month || !/^\d{4}-\d{2}$/.test(month) || !(day >= 1 && day <= 31) || !(hour >= 0 && hour <= 23)) {
    throw new Error("Usage: bun run scripts/export-first-hour.ts YYYY-MM DAY HOUR");
  }

  const parquet = join(PIPELINE_ROOT, `output/parquets/${month}.parquet`);
  const { min, max } = getPlaybackHourWindow(month, hour, day);
  const dayRange = torontoDayRangeMs(month, day);

  const conn = await (await DuckDBInstance.create(":memory:")).connect();
  await conn.run(`SET memory_limit='1GB';`);
  await conn.run(`SET threads=2;`);
  const rows = (
    await conn.runAndReadAll(`
      SELECT id, startName, endName,
        strftime(startedAt, '%Y-%m-%dT%H:%M:%SZ') AS startedAt,
        strftime(endedAt, '%Y-%m-%dT%H:%M:%SZ') AS endedAt,
        bikeType, memberCasual, hour::INTEGER AS hour, routeGeometry, round(distanceM)::INTEGER AS distanceM
      FROM read_parquet('${parquet}')
      WHERE startedAt >= ${sqlTime(min - MAX_DRAWN_TRIP_MS)} AND startedAt < ${sqlTime(max)} AND endedAt > ${sqlTime(min)}
      ORDER BY random()
      LIMIT ${DAY_SLICE_LIMIT}`)
  ).getRows();

  const hourly = new Array<number>(24).fill(0);
  for (const [h, n] of (
    await conn.runAndReadAll(`
      SELECT hour::INTEGER, COUNT(*)::INTEGER FROM read_parquet('${parquet}')
      WHERE startedAt >= ${sqlTime(dayRange.min)} AND startedAt < ${sqlTime(dayRange.max)}
      GROUP BY 1`)
  ).getRows() as [number, number][]) {
    hourly[h] = n;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const out = join(OUT_DIR, "first-hour.json");
  // Rows as arrays under one column list: about 40% smaller than an array of objects.
  writeFileSync(
    out,
    JSON.stringify({ month, day, hour, sampled: rows.length >= DAY_SLICE_LIMIT, hourlyCounts: hourly, columns: COLUMNS, rows }),
  );
  console.log(`Wrote ${out}: ${rows.length} rides for ${month}-${String(day).padStart(2, "0")} ${hour}:00 Toronto`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
