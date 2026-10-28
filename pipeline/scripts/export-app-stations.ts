import { readFileSync, writeFileSync } from "fs";

type StationCluster = {
  id: number;
  canonicalName: string;
  lat: number;
  lng: number;
};

/**
 * Writes the station list the web app's Find ride picker uses. Names must match the
 * `startName`/`endName` values in the Parquets, which are the canonical names.
 */
const STATIONS_FILE = process.argv[2] ?? "./output/stations.json";
const APP_STATIONS_OUT = "../src/pages/bike-share-toronto/stations.json";

const round = (n: number) => Math.round(n * 1e5) / 1e5;

function main(): void {
  const clusters = JSON.parse(readFileSync(STATIONS_FILE, "utf8")) as StationCluster[];
  const stations = clusters
    .map((s) => ({ id: s.id, name: s.canonicalName, lat: round(s.lat), lng: round(s.lng) }))
    .sort((a, b) => a.id - b.id);
  writeFileSync(APP_STATIONS_OUT, `[\n${stations.map((s) => JSON.stringify(s)).join(",\n")}\n]\n`);
  console.log(`Wrote ${stations.length} stations to ${APP_STATIONS_OUT}`);
}

main();
