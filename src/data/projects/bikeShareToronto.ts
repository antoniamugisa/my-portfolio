import { Project } from './index';

export const bikeShareTorontoProject: Project = {
  id: 'bike-share-toronto',
  title: 'Toronto Bike Share Flow Map',
  description:
    'More than 23 million real Bike Share Toronto rides, replayed street by street in the browser. Watch the city move, ' +
    'or pick one ride and follow it from dock to dock.',
  image: '/images/projects/bike-share-toronto.webp',
  thumbnailVideo: '/images/projects/bike-share-toronto.mp4',
  technologies: ['React', 'TypeScript', 'DuckDB-WASM', 'deck.gl', 'Mapbox GL', 'Parquet', 'GraphHopper', 'Bun', 'Cloudflare R2'],
  category: 'Data Visualization',
  demoUrl: '#bike-share-demo',
  githubUrl: 'https://github.com/antoniamugisa/my-portfolio/tree/main/src/pages/bike-share-toronto',
  featured: true,
  date: '2026-04-02',
  tags: ['Data Viz', 'Open Data', 'Toronto'],
  status: 'Ongoing',
  longDescription:
    'Every ride comes from City of Toronto open data, from January 2017 to February 2026, and is drawn along the route a cyclist would most ' +
    'likely take between its two stations. There is no backend: the browser queries the data directly with DuckDB-WASM ' +
    'and animates every ride on the GPU with deck.gl. The demo opens on a July weekday at 5pm, when nearly 4,000 rides ' +
    'cross the city in a single hour.',
  keyFeatures:
    'A timeline of rides per hour lets you jump through the day and speed playback up to 4×. You can jump to any moment in ' +
    'the data, or a suggested one like Canada Day night. Find a real ride from a station and follow it with a live ' +
    '"Riding · 9 min to go" status, or follow a random one. A side panel shows who is riding this hour, the typical ride ' +
    'length and the busiest station. Every moment and ride has its own link, so you can share exactly what you are looking at.',
  architecture:
    '1. Data pipeline (offline, Bun and DuckDB). Every year of ridership CSVs is downloaded from the City\'s open data API ' +
    'and normalised across a decade of format changes. Station names are matched to the live GBFS feed for coordinates.\n\n' +
    '2. Routing. Every start/end station pair, about 370,000 of them, is routed along real streets with a self-hosted ' +
    'GraphHopper server on OpenStreetMap data, then cached in SQLite so the multi-hour run can resume.\n\n' +
    '3. Storage. Trips and their routes are written as one compressed Parquet file per month, about half a gigabyte in ' +
    'all, and served from Cloudflare R2.\n\n' +
    '4. In the browser. DuckDB-WASM reads each month\'s Parquet file over HTTP and runs one SQL query per playback hour, ' +
    'prefetching the next so playback never stalls. deck.gl\'s TripsLayer animates the rides on a Mapbox basemap, with the ' +
    'animation loop running outside React so the interface never re-renders per frame.',
  challenges:
    'Finding a bug in the City\'s data. While building "follow a ride", every 2025 ride came back as a round trip. The City\'s ' +
    'CSVs for January to October 2025 repeat the start station\'s name in the end-station column on every row, about 7 ' +
    'million of them, while the end-station ID is correct. I changed the pipeline to resolve end stations from their IDs, ' +
    'which brought round trips from 100% back to a normal 2–3%, and routed the 90,000 new station pairs this uncovered.\n\n' +
    'Making the first frame fast. The demo took 17.5 seconds to show its first ride: about 4 seconds to start DuckDB-WASM ' +
    'and almost 10 seconds of queries competing for bandwidth. The opening hour now ships as a small static file, so the first ' +
    'ride appears about 6 seconds after page load, while DuckDB loads behind it.\n\n' +
    'Smaller puzzles: the GPU uses 32-bit floats, which can\'t hold epoch timestamps precisely, so ride times are stored ' +
    'relative to the playback hour; and the CSV format changed almost every year, from day-first dates to new column names.',
  learnings:
    'I learned to run analytical SQL in the browser with DuckDB-WASM and Parquet, build and operate an offline data ' +
    'pipeline with a self-hosted routing engine, render large animated datasets on the GPU with deck.gl, and keep a React ' +
    'app smooth by moving hot paths out of render. I also learned to measure before optimising, and not to trust open data ' +
    'blindly: the numbers that look too clean are worth checking.',
  futureImprovements:
    'Comparing two dates side by side, station tooltips with capacity and trip counts, and matching renamed stations so ' +
    'older years keep more of their rides.',
};
