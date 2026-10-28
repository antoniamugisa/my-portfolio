import { Project } from './index';

export const bikeShareTorontoProject: Project = {
  id: 'bike-share-toronto',
  title: 'Toronto Bike Share Flow Map',
  description:
    'Interactive animated map that replays real Toronto Bike Share trips from Open Toronto data, showing how the city moves.',
  image: '/images/projects/bike-share-toronto.webp',
  thumbnailVideo: '/images/projects/bike-share-toronto.mp4',
  technologies: ['React', 'TypeScript', 'DuckDB-WASM', 'deck.gl', 'Mapbox GL', 'Open Toronto Data', 'Vite'],
  category: 'Data Visualization',
  demoUrl: '#bike-share-demo',
  githubUrl: 'https://github.com/antoniamugisa/my-portfolio/tree/main/src/pages/bike-share-toronto',
  featured: true,
  date: '2026-04-02',
  tags: ['Data Viz', 'Open Data', 'Toronto'],
  status: 'Ongoing',
  longDescription:
    'An interactive, GPU-accelerated map that replays real Toronto Bike Share trips from Open Toronto ridership data. ' +
    'Monthly Parquet trip files are queried directly in the browser with DuckDB-WASM, and each ride is drawn along its route ' +
    "with deck.gl's TripsLayer on a Mapbox GL basemap, so you can watch an hour of city-wide riding unfold in a single animation.",
  keyFeatures:
    'Trips animate along their real routes, colour-coded by member and casual riders. A timeline of rides per hour lets you scrub through the day and change playback speed, and a live panel shows who is riding this hour. You can jump to any moment in the data, find a real ride from a station and follow it from dock to dock, or follow a random ride.',
  challenges:
    'Loading and querying a month of trip data entirely in the browser with no backend, decoding route polylines stored at different precisions, mapping real trip timestamps into one replayable hour, and keeping deck.gl rendering smooth by running the animation loop outside React re-renders.',
  learnings:
    'I learned to run analytical SQL in the browser with DuckDB-WASM and Parquet, render large animated datasets on the GPU with deck.gl and Mapbox GL, and keep frame rate steady in React using refs and throttled sampling.',
  futureImprovements:
    'Next steps are decade-long historical playback and station tooltips showing name, capacity and trip counts.',
};
