import { Project } from './index';

export const bikeShareTorontoProject: Project = {
  id: 'bike-share-toronto',
  title: 'Toronto Bike Share Flow Map',
  description:
    'Interactive animated flow map visualizing every Toronto Bike Share trip — showing how the city moves, hour by hour.',
  image: '/images/projects/bike-share-toronto.png', // add a screenshot here
  technologies: ['React', 'TypeScript', 'Canvas API', 'Open Toronto Data', 'Vite'],
  category: 'Data Visualization',
  demoUrl: '#bike-share-demo',
  githubUrl: 'https://github.com/antoniamugisa/bike-share-toronto', // update if needed
  featured: true,
  date: '2026-04-02',
  tags: ['Data Viz', 'Open Data', 'Toronto'],
  status: 'Ongoing',
  longDescription:
    'An interactive canvas-based flow map of Toronto Bike Share trips, built with the Open Toronto CKAN API. ' +
    'Animated arcs and moving dots show real trip patterns across 50 stations, with an hour-by-hour time scrubber ' +
    'revealing the rhythm of the city — from the quiet early hours to the morning and evening rush peaks.',
  keyFeatures: [
    'Animated trip arcs with moving dots showing real station-to-station flows',
    'Hour-by-hour time scrubber with 24-bar activity histogram',
    'Play/pause with 1×/2×/4× speed control',
    'Filter by member vs casual riders and e-bike vs classic bike',
    'Zoom and pan the map canvas',
    'Real Open Toronto data via CKAN API',
  ],
  challenges: [
    'Porting vanilla JS canvas animation to React refs without losing performance',
    'Keeping the animation loop decoupled from React re-renders',
    'Scoping styles so the full-viewport dark page does not clash with the portfolio theme',
  ],
  learnings: [
    'Using ResizeObserver and useRef for performant canvas management in React',
    'CSS isolation strategies (fixed positioning + z-index + scoped custom properties)',
    'Open Toronto CKAN API structure and data quirks across years',
  ],
  futureImprovements: [
    'Replace synthetic trip data with real Open Toronto CSV data',
    'Upgrade to Mapbox GL JS + deck.gl TripsLayer for GPU-accelerated rendering',
    'Add 10-year historical playback (2014–2025) with daily Parquet files',
    'Station tooltips showing name, capacity, and trip count',
  ],
};
