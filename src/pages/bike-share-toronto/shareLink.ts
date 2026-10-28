import { isPublishedParquetMonth } from './publishedMonths';
import { torontoSliceAt, torontoWallClockToUtcMs } from './torontoTime';

/**
 * Links to a moment in the demo: `?t=2025-07-01T22:00` (Toronto wall time, so a link means the
 * same moment for everyone) and optionally `&ride=<trip id>` to follow one ride.
 */
export type SharedMoment = {
  atMs: number;
  slice: { month: string; day: number; hour: number };
  rideId: string | null;
};

const DEMO_HASH = '#bike-share-demo';

/** Reads a shared moment from the page URL; null when absent, malformed or outside the dataset. */
export function readSharedMoment(search: string): SharedMoment | null {
  const params = new URLSearchParams(search);
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(params.get('t') ?? '');
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number) as [number, number, number, number, number];
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null;
  const atMs = torontoWallClockToUtcMs(y, mo, d, h, mi, 0);
  const slice = torontoSliceAt(atMs);
  // Rejects dates that rolled over (Feb 31) as well as months we don't publish.
  if (slice.day !== d || slice.hour !== h || !isPublishedParquetMonth(slice.month)) return null;
  return { atMs, slice, rideId: params.get('ride') || null };
}

/** "2025-07-01T22:05" for an instant, in Toronto wall time. */
function torontoMinuteKey(ms: number): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(ms));
  const g = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? '';
  return `${g('year')}-${g('month')}-${g('day')}T${g('hour')}:${g('minute')}`;
}

/** The current page URL pointing at `atMs` (and a followed ride), opening the demo. */
export function sharedMomentUrl(atMs: number, rideId: string | null): string {
  const url = new URL(window.location.href);
  url.searchParams.set('t', torontoMinuteKey(atMs));
  if (rideId) url.searchParams.set('ride', rideId);
  else url.searchParams.delete('ride');
  // Colons are valid in a query string; keep `t=2025-07-01T22:00` readable rather than `%3A`.
  url.search = url.searchParams.toString().replace(/%3A/gi, ':');
  url.hash = DEMO_HASH;
  return url.toString();
}

/** Keeps the address bar on the moment being played, without adding history entries. */
export function replaceUrlWithMoment(atMs: number, rideId: string | null): void {
  const next = sharedMomentUrl(atMs, rideId);
  if (next !== window.location.href) window.history.replaceState(window.history.state, '', next);
}
