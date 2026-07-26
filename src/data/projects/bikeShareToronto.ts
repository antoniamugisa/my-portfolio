import { Project } from './index';

export const bikeShareTorontoProject: Project = {
  id: 'bike-share-toronto',
  title: 'Toronto Bike Share Flow Map',
  description:
    'Interactive animated flow map visualizing every Toronto Bike Share trip — showing how the city moves, hour by hour.',
  image: '/images/projects/bike-share-toronto.png',
  thumbnailVideo: '/images/projects/bike-share-toronto.mp4',
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
  keyFeatures:
    'The map animates real station-to-station Bike Share trips with arcs and moving dots, paired with an hour-by-hour scrubber and a 24-bar activity histogram. You can play or pause at 1×, 2×, or 4× speed, filter by member versus casual riders and e-bike versus classic, zoom and pan the canvas, and pull live Open Toronto data through the CKAN API.',
  challenges:
    'Porting the original vanilla JS canvas animation into React without losing frame rate meant careful use of refs, keeping the animation loop separate from React re-renders, and scoping styles so a full-viewport dark experience would not fight the rest of the portfolio theme.',
  learnings:
    'I learned to drive canvas with ResizeObserver and useRef for steady performance in React, isolate page styles with fixed positioning, z-index, and scoped custom properties, and work through the quirks of the Open Toronto CKAN API across different years of data.',
  futureImprovements:
    'Next steps are swapping synthetic trips for full Open Toronto CSV data, moving to Mapbox GL JS with deck.gl TripsLayer for GPU-accelerated rendering, adding decade-long historical playback with daily Parquet files, and station tooltips for name, capacity, and trip counts.',
};
