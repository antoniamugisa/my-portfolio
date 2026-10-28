# Toronto Bike Share — trip data pipeline

Turns Toronto's open Bike Share ridership data into the monthly Parquet files behind the
animated trip map at [antoniamugisa.com/projects/bike-share-toronto](https://antoniamugisa.com/projects/bike-share-toronto).
Inspired by [freeman-jiang/bikemap.nyc](https://github.com/freeman-jiang/bikemap.nyc).

Every trip becomes a line drawn along a cycling route between its start and end stations,
animated at the time it happened.

## How the map uses this data

The web app lives in `src/pages/bike-share-toronto/`.

- It loads `parquets/YYYY-MM.parquet` from a public Cloudflare R2 bucket with
  [DuckDB-WASM](https://duckdb.org/docs/api/wasm/overview) (in the browser, no backend) and
  draws trips with deck.gl's `TripsLayer` over a Mapbox basemap.
- Each playback hour shows up to 1,800 randomly sampled trips:
  - **Default view:** that hour of the day sampled across the whole month (a "typical" hour).
  - **Time travel / picking a ride:** the real trips from that specific day and hour.
- Only months listed in `src/pages/bike-share-toronto/publishedMonths.ts` are requested.
  Add a month there after uploading its file.
- Environment variables (repo root `.env.local`):
  - `VITE_MAPBOX_TOKEN` — required for the basemap.
  - `VITE_BIKESHARE_PARQUET_BASE` — optional; overrides where Parquets are loaded from.
- In development, Vite proxies `/bikeshare-r2` to R2 so DuckDB isn't blocked by CORS. In
  production the browser fetches R2 directly; the bucket's CORS policy allows
  `https://antoniamugisa.com` and `https://www.antoniamugisa.com`.

## Data sources

- **Trips:** [Bike Share Toronto Ridership Data](https://open.toronto.ca/dataset/bike-share-toronto-ridership-data/)
  (City of Toronto Open Data), fetched through its CKAN API.
- **Station coordinates:** the live GBFS feed
  (`https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information`).
- **Street network:** OpenStreetMap extract for Ontario from Geofabrik.

## Prerequisites

- [Bun](https://bun.sh) (scripts use `bun:sqlite`, so Node alone won't run them)
- Docker, for the GraphHopper routing server
- ~7 GB free disk: ~1 GB OSM data and routing graph, ~5 GB raw and extracted trip data,
  ~0.5 GB Parquets and route cache

> **Keep this repo out of iCloud-synced folders (Desktop, Documents).** When macOS
> offloads a file to iCloud it reads as empty, and the pipeline silently skips it — whole
> months go missing with no error.

## Running the pipeline

All commands run from `pipeline/`.

### 1. Install dependencies

```bash
bun install
```

### 2. Download OpenStreetMap data

```bash
mkdir -p osm
curl -L https://download.geofabrik.de/north-america/canada/ontario-latest.osm.pbf \
  -o osm/ontario-latest.osm.pbf
```

### 3. Start GraphHopper

`osm/` is gitignored, so create `osm/config.yml` yourself:

```yaml
graphhopper:
  datareader.file: /data/ontario-latest.osm.pbf
  graph.location: /data/graph-cache
  profiles:
    - name: bike
      navigation_mode: bike
      weighting: custom
      custom_model:
        speed:
          - if: "true"
            limit_to: "15"
        priority:
          - if: "road_access == DESTINATION"
            multiply_by: 0.1
          - else: ""
            multiply_by: 1.0
  profiles_ch:
    - profile: bike
  profiles_lm: []
  graph.encoded_values: road_access
  import.osm.ignored_highways: motorway,trunk

server:
  application_connectors:
    - type: http
      port: 8989
      bind_host: 0.0.0.0
```

This profile caps speed at 15 km/h, never uses motorways or trunk roads, and strongly
avoids destination-only roads. It does not specifically prefer protected bike lanes.

```bash
docker run -d -p 8989:8989 -v "$(pwd)/osm:/data" israelhikingmap/graphhopper -c /data/config.yml
docker logs -f $(docker ps -lq --filter "ancestor=israelhikingmap/graphhopper")
```

It's ready when the logs show `Started Server`. Check it with:

```bash
curl "http://localhost:8989/route?point=43.6453,-79.3806&point=43.6612,-79.3957&profile=bike&points_encoded=true"
```

If you change the profile, delete `osm/graph-cache` so GraphHopper rebuilds its graph.

### 4. Build stations — `bun run stations` (~5 min)

1. Downloads every resource in the CKAN package to `data/raw/` (files already there are skipped).
2. Extracts ZIPs and converts XLSX sheets to CSV under `data/extracted/<resource>/`.
3. Fetches today's stations from GBFS and matches each station name found in the trip CSVs
   to a GBFS station by exact name (after lowercasing, collapsing spaces, `&` → `/`, and
   removing `.` and `,`).
4. Merges stations within 60 m of each other into one canonical station, keeping the other
   names as aliases.
5. Writes `output/stations.json`.

### 5. Build routes — `bun run routes` (4–8 hours)

For every start/end station pair that appears in the trips, asks GraphHopper for a route and
caches it in `output/routes.db` (SQLite). Pairs that already have a route are skipped, so the
step can be stopped and resumed. A round trip (same start and end station) is drawn as a
loop out to the nearest other station within 1 km and back. Failed routes are stored with
no geometry.

### 6. Build Parquets — `bun run parquet` (several hours for all years)

A full 2017–2024 rebuild took about 4.5 hours on an M-series MacBook.

Reads each `data/extracted/` year folder, joins trips to stations and routes, and writes one
file per Toronto calendar month to `output/parquets/YYYY-MM.parquet`.

**It skips any month whose file already exists.** To rebuild a month, delete its file first.

`bun run all` runs steps 4–6 in order.

## Parquet schema

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR | Trip ID from the source data |
| `startName`, `endName` | VARCHAR | Canonical station names |
| `startedAt`, `endedAt` | TIMESTAMP | **UTC**, no time zone attached |
| `hour` | TINYINT | Toronto local hour the trip started (0–23) |
| `bikeType` | VARCHAR | `classic_bike` or `electric_bike` |
| `memberCasual` | VARCHAR | `member` or `casual` |
| `routeGeometry` | VARCHAR | Encoded polyline (precision 5 or 6; the app detects which) |
| `distanceM` | FLOAT | Route length in metres |
| `elevationUp`, `elevationDown` | FLOAT | Always null today (see known issues) |

## Source data quirks the pipeline handles

The CSV format has changed many times. `build-parquet.ts` handles each era:

| Data | Quirk | Handling |
|---|---|---|
| 2014–2015 | Monthly origin/destination matrix (XLSX), not individual trips | Separate query; timestamps are placeholders (15th of the month, noon) |
| 2017 Q1–Q2 | Dates are **day/month/year** (`13/04/2017`) | Each file's date order is detected: any leading number > 12 means day-first |
| 2017 Q4 | Two-digit years (`10/01/17`) | Parsed explicitly |
| 2016–2017, 2025+ | Users labelled `Member` / `Casual` | Mapped to `member` / `casual` |
| 2018–2024 | Users labelled `Annual Member` / `Casual Member` | Mapped to `member` / `casual` |
| 2024 | Bike model in a `Model` column | `EFIT*` / `Boost` → `electric_bike` |
| 2025+ | Bike model in a `Bike_Model` column | Same |
| 2019–2023 | No bike model recorded | All trips are `classic_bike` |
| All | Timestamps are Toronto local time | Converted to UTC; impossible dates (e.g. month 13) are rejected rather than rolled over |

Member share drops sharply from 2023 in the source data (around 6% in 2023, 11% in 2024).
That's how the city labels the trips, not a pipeline bug.

## What gets dropped

Measured on the October 2026 rebuild, each month keeps this share of its raw trips:

| Years | Trips kept |
|---|---|
| 2017 | 33–45% |
| 2018–2023 | 47–58% |
| 2024 (Feb–Sep) | 65–86% |

A trip is left out of the Parquets when:

- **Either station name doesn't match a station in today's GBFS feed.** Renamed or removed
  stations have no coordinates. This is by far the largest loss, especially for older years.
- **Its timestamp can't be parsed** or is impossible.
- **Its row isn't valid UTF-8.** Some 2021–2025 files are Windows-1252 encoded (en dashes in
  station names); DuckDB skips those rows. About 0.1% of all rows.
- **Its route failed** (20 of ~280,000 station pairs).

## Uploading to Cloudflare R2

Upload each month separately (`wrangler r2 object put` takes one file per call). Wrangler 4
writes to a local simulator unless you pass `--remote`:

```bash
wrangler login
wrangler r2 object put <bucket>/parquets/2024-07.parquet \
  --file output/parquets/2024-07.parquet --remote
```

The bucket name isn't stored in this repo; find it in the Cloudflare dashboard under R2 (the
app reads from its public `pub-….r2.dev` URL, set in `useTripStream.ts`). After uploading a
new month, add it to `publishedMonths.ts`.

## Known issues

- **Station matching uses today's station list**, so years with many since-renamed stations
  lose a large share of trips. Fixing this needs historical station coordinates.
- **2025 Parquets predate the Toronto-month fix**: trips from roughly the last 4–5 evening
  hours of each month sit in the next month's file. Rebuild 2025 to fix.
- **Elevation is never filled in.** The existing `routes.db` has `elevation_up` /
  `elevation_down` columns (from an older version of the script), but they're empty for every
  route. The current `build-routes.ts` doesn't create those columns at all, while
  `build-parquet.ts` reads them, so a fresh setup would need them added.
- `scripts/fetch-bikeshare-data.mjs` (`npm run fetch-data`) and `useTripsData.ts` are left
  over from an earlier version of the map and aren't used.
- The `/api/gbfs` proxy in `vercel.json`, `netlify.toml` and `vite.config.ts` isn't called by
  the app.

## Design decisions

- **GraphHopper with a custom bike profile, over OSRM:** speed-capped, motorway-free routing
  gives plausible cycling paths without running a routing server at view time.
- **One Parquet per month:** about 100 files instead of thousands of daily files. DuckDB-WASM
  reads only the parts of a file it needs.
- **Station names as the join key:** station IDs changed between system upgrades, so names
  (with aliases and 60 m clustering) are the more reliable link across years.
