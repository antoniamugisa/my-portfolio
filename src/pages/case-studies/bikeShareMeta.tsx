import type { CaseStudyMeta } from '@/components/case-study/CaseStudyLayout';

export const bikeShareMeta: CaseStudyMeta = {
  role: 'Solo: data pipeline, routing and front end',
  timeline: '2026',
  stack: ['React + TypeScript', 'DuckDB-WASM + Parquet', 'deck.gl + Mapbox GL', 'GraphHopper', 'Bun', 'Cloudflare R2'],
  overview: (
    <>
      Toronto publishes every Bike Share ride as open data, but as spreadsheets nobody can picture. I wanted to see the
      city move: every ride drawn along its streets, at the time it happened, in a browser with no server behind it.
    </>
  ),
};
