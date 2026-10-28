import stationsJson from './stations.json';

export interface Station {
  id: number;
  lat: number;
  lng: number;
  name: string;
  cap: number;
}

export interface Trip {
  from: Station;
  to: Station;
  progress: number;
  speed: number;
  member: boolean;
  ebike: boolean;
  alpha: number;
}

export interface Filters {
  member: boolean;
  casual: boolean;
  ebike: boolean;
  classic: boolean;
}

export const HOUR_PROFILE: number[] = [
  0.04, 0.02, 0.01, 0.01, 0.02, 0.06,
  0.15, 0.55, 0.90, 0.65, 0.50, 0.60,
  0.75, 0.65, 0.55, 0.60, 0.70, 0.95,
  1.00, 0.80, 0.65, 0.45, 0.28, 0.12,
];

export const PERIOD_LABELS: string[] = [
  'Late Night','Late Night','Late Night','Late Night','Late Night','Early Morning',
  'Early Morning','Morning Rush','Morning Rush','Mid-Morning','Mid-Morning','Midday',
  'Lunch','Early Afternoon','Afternoon','Afternoon','Evening Rush','Evening Rush',
  'Evening Peak','Evening','Evening','Night','Night','Late Night',
];

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

/** Sample for the active-rides time-series chart (simulated clock × active trip count). */
export type GraphDataPoint = {
  simTimeMs: number;
  count: number;
};

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

export interface RealTrip {
  from: Station;
  to: Station;
  startHour: number;
  startMinute: number;
  durationSeconds: number;
  isMember: boolean;
  isEbike: boolean;
}

export interface HourlyBucket {
  hour: number;
  trips: RealTrip[];
  count: number;
}

export interface TripsDataState {
  stations: Map<number, Station>;
  hourlyBuckets: HourlyBucket[];
  totalTrips: number;
  availableMonths: string[];
  currentMonth: string;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
}
