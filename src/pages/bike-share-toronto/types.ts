import stationsJson from './stations.json';

export const MAP_BOUNDS = {
  minLat: 43.595, maxLat: 43.730,
  minLng: -79.520, maxLng: -79.290,
};

/** A Find ride station. `name` matches `startName`/`endName` in the trip Parquets. */
export interface StationLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

/** Every canonical station from the pipeline (`bun run app-stations`). */
export const STATIONS: StationLocation[] = stationsJson;

export interface DeckTrip {
  /** Stable row id from parquet (for spotlight / random trip). */
  id: string;
  startName: string;
  endName: string;
  startedAtMs: number;
  endedAtMs: number;
  memberCasual: 'member' | 'casual';
  /** Route length in metres (from parquet or estimated from geometry). */
  distanceM: number;
  path: [number, number][];
  timestamps: number[];
  color: [number, number, number, number];
  isEbike: boolean;
}

/** A map area as [[west, south], [east, north]], e.g. the camera for a suggested moment. */
export type MapBounds = [[number, number], [number, number]];

/** A camera move: fly to a point, or fit an area. `id` must change per request. */
export type MapFlyTo =
  | { lng: number; lat: number; zoom?: number; id: number }
  | { bounds: MapBounds; id: number };
