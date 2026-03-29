# Toronto Bike Share - Data Pipeline

Processes 10 years of Toronto Bike Share trip data (2014-2025) into optimized
Parquet files for the flow map visualization at antoniamugisa.com/projects/bike-share-toronto.

Inspired by freeman-jiang/bikemap.nyc.
Key difference: uses GraphHopper bike2 profile instead of OSRM for
infrastructure-weighted routing that prefers protected bike lanes over fast roads.

## Prerequisites

- Bun v1.2.9+
- Docker (for GraphHopper routing server)
- ~5GB free disk space (OSM file + intermediate data + Parquets)

## Setup

### 0. Install pipeline dependencies

```bash
cd pipeline
bun install
cd ..
```

### 1. Download Ontario OSM data

```bash
mkdir -p osm
cd osm
curl -L https://download.geofabrik.de/north-america/canada/ontario-latest.osm.pbf \
  -o ontario-latest.osm.pbf
cd ..
```

### 2. Start GraphHopper routing server

```bash
# stop/remove previous GraphHopper containers
ids=$(docker ps -aq --filter "ancestor=israelhikingmap/graphhopper")
if [ -n "$ids" ]; then
  docker stop $ids
  docker rm $ids
fi

# clear any stale graph cache when changing profiles/config
rm -rf osm/default-gh osm/graph-cache

# start GraphHopper with v11 config
docker run -d -p 8989:8989 \
  -v "$(pwd)/osm:/data" \
  israelhikingmap/graphhopper \
  -c /data/config.yml
```

Wait for GraphHopper to finish importing/building:

```bash
docker logs -f $(docker ps -lq --filter "ancestor=israelhikingmap/graphhopper")
```

Ready when logs include:

```text
Started application
Started Server ... @...ms
```

Verify it is ready:

```bash
curl "http://localhost:8989/route?point=43.6453,-79.3806&point=43.6612,-79.3957&profile=bike&points_encoded=true"
```

### 3. Download raw trip data

The pipeline reads from the Open Toronto CKAN API automatically.
Raw data is downloaded to `pipeline/data/` (gitignored).

### 4. Run the pipeline

```bash
bun run stations   # ~5 minutes  - builds station list with aliases
bun run routes     # ~4-8 hours  - queries GraphHopper for all station pairs
bun run parquet    # ~30 minutes - joins trips + geometry -> monthly Parquets
```

Or run all at once:

```bash
bun run all
```

## Output

- `output/stations.json` - canonical station list with aliases + coordinates
- `output/routes.db` - SQLite cache of GraphHopper routes
- `output/parquets/YYYY-MM.parquet` - one file per month, 2014-01 through 2025-XX

## Using the output in the web app

- The web app queries monthly Parquets from a public bucket (configured in `src/pages/bike-share-toronto/useTripStream.ts`).
- To use your own Parquets, upload them somewhere public (R2/S3) and point the app at that base URL.

## Uploading to Cloudflare R2

After pipeline completes, upload Parquets to R2:

```bash
wrangler r2 object put bikeshare-toronto/parquets/ --file output/parquets/ -r
```

If you upload to a different bucket/key prefix, update the corresponding base URL in the app.

## Data notes

- 2014-2016: XLSX format, no bike type column
- 2017 Q1/Q2: timestamps in UTC (pipeline converts automatically)
- 2017 Q3+: timestamps in Eastern time
- 2020+: adds Bike_Model column (ICONIC = classic, EFIT G5 = e-bike)
- Round trips (same start/end station) are routed to nearest station within 1km
- Trips with no route geometry are filtered out at build time
- Expected data loss: < 2% (round trips with no nearby station + failed routes)

## Architecture decisions

### GraphHopper over OSRM

GraphHopper's bike2 profile gives greater priority to protected cycling infrastructure
(trails, separated lanes) over faster but less safe roads. This produces more realistic
routes for Bike Share riders who tend to prefer safe infrastructure.

### Monthly Parquet files

One file per month (~120 files for 10 years) vs one per day (~4000 files).
DuckDB WASM handles efficient row group reads within monthly files.

### Station names as keys

Toronto station IDs changed between system upgrades. Station names with alias
resolution are the reliable cross-year key. 60m clustering handles name variations
of the same physical station.
