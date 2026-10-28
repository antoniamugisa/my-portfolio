import { Project } from './index';

export const bikeShareTorontoProject: Project = {
  id: 'bike-share-toronto',
  title: 'Toronto Bike Share Flow Map',
  description:
    'Interactive animated map that replays real Toronto Bike Share trips from Open Toronto data, showing how the city moves.',
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
    'An animated map that replays more than 15 million real Bike Share Toronto rides from City of Toronto open data, ' +
    'street by street, at the time they happened. Pick an hour from 2017 to 2025 and watch the city move, or choose a single ride ' +
    'and follow it from dock to dock. There is no backend: the browser queries the trip data directly with DuckDB-WASM ' +
    "and draws every ride on the GPU with deck.gl.",
  keyFeatures:
    'Rides animate along their routes, colour-coded by member and casual riders. A timeline of rides per hour lets you jump ' +
    'through the day and change playback speed. You can jump to any moment in the data (or a suggested one, like Canada Day ' +
    'night), find a real ride from a station and follow it with a live status, or follow a random ride. A side panel shows ' +
    "who is riding this hour, the typical ride length and the busiest station.",
  architecture:
    '1. Data pipeline (offline, Bun + DuckDB). Every year of ridership CSVs is downloaded from the City\'s open data API and ' +
    'normalised across a decade of format changes. Station names are matched to the live GBFS feed for coordinates.\n\n' +
    '2. Routing. Every start/end station pair (about 370,000) is routed along real streets with a self-hosted GraphHopper ' +
    'server on OpenStreetMap data, using a bike profile, and cached in SQLite so the multi-hour run can resume.\n\n' +
    '3. Storage. Trips and their route polylines are written as one compressed Parquet file per month (467 MB in all) and ' +
    'served from Cloudflare R2.\n\n' +
    '4. In the browser. DuckDB-WASM registers each month as a view over its Parquet file and runs one SQL query per playback ' +
    'hour, prefetching the next hour so playback rolls over seamlessly. deck.gl\'s TripsLayer animates the rides on a Mapbox ' +
    'basemap, with the animation loop running outside React so the UI never re-renders per frame.',
  challenges:
    "The City's 2025 data repeats the start station's name in the end-station column on every row, so all 7 million 2025 " +
    'rides looked like round trips. I traced it to the source CSVs and changed the pipeline to resolve end stations from ' +
    'their IDs instead, then routed the 90,000 new station pairs this uncovered. Other challenges: querying months of ' +
    'data in the browser with no backend, keeping deck.gl smooth (the GPU uses 32-bit floats, so ride timestamps are stored ' +
    'relative to the playback hour), and handling CSV formats that changed almost every year.',
  learnings:
    'I learned to run analytical SQL in the browser with DuckDB-WASM and Parquet, build and operate an offline data ' +
    'pipeline with a self-hosted routing engine, render large animated datasets on the GPU with deck.gl, and keep a React ' +
    'app smooth by moving hot paths into refs. Most of all, I learned not to trust open data blindly: check the numbers ' +
    "that look too clean.",
  futureImprovements:
    'Comparing two dates side by side, station tooltips with capacity and trip counts, and matching renamed stations so ' +
    'older years keep more of their rides.',
};
