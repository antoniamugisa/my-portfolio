import type { DeckTrip } from "./types";

/** Leading point per active trip — ScatterplotLayer (simpler WebGL path than PathLayer stubs). */
export type TripHeadPoint = {
  position: [number, number];
  color: [number, number, number, number];
};

function findSegmentIndex(ts: number[], t: number): number {
  if (ts.length < 2) return 0;
  let i = 0;
  while (i < ts.length - 2 && ts[i + 1] < t) i++;
  return i;
}

export function buildTripHeadPoints(
  trips: DeckTrip[],
  currentRelMs: number,
): TripHeadPoint[] {
  const out: TripHeadPoint[] = [];
  for (const trip of trips) {
    const ts = trip.timestamps;
    const path = trip.path;
    if (path.length < 2 || ts.length < 2) continue;

    const tEnd = ts[ts.length - 1];
    const tStart = ts[0];
    if (currentRelMs < tStart || currentRelMs > tEnd + 500) continue;

    let i = findSegmentIndex(ts, currentRelMs);
    i = Math.min(i, path.length - 2);

    const t0 = ts[i];
    const t1 = ts[i + 1];
    const p0 = path[i];
    const p1 = path[i + 1];

    let lng: number;
    let lat: number;

    if (currentRelMs >= tEnd) {
      lng = p1[0];
      lat = p1[1];
    } else if (t1 <= t0) {
      lng = p0[0];
      lat = p0[1];
    } else {
      const u = (currentRelMs - t0) / (t1 - t0);
      lng = p0[0] + u * (p1[0] - p0[0]);
      lat = p0[1] + u * (p1[1] - p0[1]);
    }

    out.push({
      position: [lng, lat],
      color: [trip.color[0], trip.color[1], trip.color[2], 255],
    });
  }
  return out;
}

/** Head dot for the spotlight trip at the animated time along its timestamps. */
export function buildSpotlightHeadPoint(
  trip: DeckTrip,
  currentRelMs: number,
  headRgb: [number, number, number],
): TripHeadPoint | null {
  const ts = trip.timestamps;
  const path = trip.path;
  if (path.length < 2 || ts.length < 2) return null;

  const tStart = ts[0]!;
  const tEnd = ts[ts.length - 1]!;
  const t = Math.max(tStart, Math.min(tEnd, currentRelMs));

  let i = findSegmentIndex(ts, t);
  i = Math.min(i, path.length - 2);

  const t0 = ts[i]!;
  const t1 = ts[i + 1]!;
  const p0 = path[i]!;
  const p1 = path[i + 1]!;

  let lng: number;
  let lat: number;

  if (t >= tEnd) {
    lng = p1[0];
    lat = p1[1];
  } else if (t1 <= t0) {
    lng = p0[0];
    lat = p0[1];
  } else {
    const u = (t - t0) / (t1 - t0);
    lng = p0[0] + u * (p1[0] - p0[0]);
    lat = p0[1] + u * (p1[1] - p0[1]);
  }

  return {
    position: [lng, lat],
    color: [...headRgb, 255],
  };
}
