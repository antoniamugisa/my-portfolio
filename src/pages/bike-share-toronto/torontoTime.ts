/** Toronto wall-clock helpers using Intl (no extra deps). */

const TZ = "America/Toronto";

type WallParts = {
  y: number;
  mo: number;
  d: number;
  h: number;
  mi: number;
  s: number;
};

function parseTorontoWallParts(ms: number): WallParts {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = f.formatToParts(new Date(ms));
  const g = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value;
  let h = parseInt(g("hour") ?? "0", 10);
  if (h === 24) h = 0;
  return {
    y: parseInt(g("year") ?? "0", 10),
    mo: parseInt(g("month") ?? "0", 10),
    d: parseInt(g("day") ?? "0", 10),
    h,
    mi: parseInt(g("minute") ?? "0", 10),
    s: parseInt(g("second") ?? "0", 10),
  };
}

function cmpWall(
  p: WallParts,
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
): number {
  if (p.y !== y) return p.y < y ? -1 : 1;
  if (p.mo !== mo) return p.mo < mo ? -1 : 1;
  if (p.d !== d) return p.d < d ? -1 : 1;
  if (p.h !== h) return p.h < h ? -1 : 1;
  if (p.mi !== mi) return p.mi < mi ? -1 : 1;
  if (p.s !== s) return p.s < s ? -1 : 1;
  return 0;
}

/**
 * UTC epoch ms for a given Toronto wall-clock instant (handles DST).
 */
export function torontoWallClockToUtcMs(
  year: number,
  month1: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
): number {
  let lo = Date.UTC(year, month1 - 1, day - 1, 0, 0, 0);
  let hi = Date.UTC(year, month1 - 1, day + 2, 0, 0, 0);
  if (lo > hi) [lo, hi] = [hi, lo];

  for (let i = 0; i < 64; i++) {
    if (hi - lo <= 1) break;
    const mid = Math.floor((lo + hi) / 2);
    const p = parseTorontoWallParts(mid);
    const c = cmpWall(p, year, month1, day, hour, minute, second);
    if (c === 0) {
      const pLo = parseTorontoWallParts(mid - 1);
      if (cmpWall(pLo, year, month1, day, hour, minute, second) !== 0) {
        return mid;
      }
      hi = mid;
      continue;
    }
    if (c < 0) lo = mid;
    else hi = mid;
  }

  for (let t = lo; t <= hi + 2; t++) {
    const p = parseTorontoWallParts(t);
    if (cmpWall(p, year, month1, day, hour, minute, second) === 0) {
      return t;
    }
  }

  return Math.floor((lo + hi) / 2);
}

/** Start of the Toronto wall-clock hour containing `timeMs`. */
export function hourStartTorontoMs(timeMs: number): number {
  const p = parseTorontoWallParts(timeMs);
  return torontoWallClockToUtcMs(p.y, p.mo, p.d, p.h, 0, 0);
}

/** Milliseconds from start of that Toronto hour [0, 3600000) for typical hours. */
export function offsetMsIntoHourToronto(timeMs: number): number {
  return timeMs - hourStartTorontoMs(timeMs);
}

/** Toronto hour of day (0–23) for an epoch ms. */
export function torontoHour(timeMs: number): number {
  return parseTorontoWallParts(timeMs).h;
}

/** Toronto day of month (1–31) for an epoch ms. */
export function torontoDayOfMonth(timeMs: number): number {
  return parseTorontoWallParts(timeMs).d;
}

/**
 * One simulated hour for playback + deck timestamps, anchored on `day` of the selected month
 * (Toronto). Month-wide slices (`day` null) anchor on the 1st.
 */
export function getPlaybackHourWindow(
  monthKey: string,
  hour: number,
  day: number | null = null,
): { min: number; max: number } {
  const [y, m] = monthKey.split("-").map(Number);
  const min = torontoWallClockToUtcMs(y, m, day ?? 1, hour, 0, 0);
  return { min, max: min + 3600000 };
}

/**
 * One playback hour. `day` null = that hour sampled across the whole month;
 * otherwise the real trips from that Toronto day.
 */
export type PlaybackSlice = { month: string; day: number | null; hour: number };

/** The hour after `s`. Month-wide slices loop within the month; day slices roll into the next day/month. */
export function nextPlaybackSlice(s: PlaybackSlice): PlaybackSlice {
  if (s.hour < 23) return { ...s, hour: s.hour + 1 };
  if (s.day === null) return { ...s, hour: 0 };
  const [y, m] = s.month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (s.day < daysInMonth) return { month: s.month, day: s.day + 1, hour: 0 };
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  return { month: `${ny}-${String(nm).padStart(2, "0")}`, day: 1, hour: 0 };
}

/** The playback slice (month key, Toronto day, Toronto hour) that contains `timeMs`. */
export function torontoSliceAt(timeMs: number): { month: string; day: number; hour: number } {
  const p = parseTorontoWallParts(timeMs);
  return { month: `${p.y}-${String(p.mo).padStart(2, "0")}`, day: p.d, hour: p.h };
}

/** Start of the Toronto calendar day `day` of `monthKey`, and the start of the next day. */
export function torontoDayRangeMs(monthKey: string, day: number): { min: number; max: number } {
  const [y, m] = monthKey.split("-").map(Number);
  const min = torontoWallClockToUtcMs(y, m, day, 0, 0, 0);
  const next = new Date(Date.UTC(y, m - 1, day + 1));
  const max = torontoWallClockToUtcMs(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), 0, 0, 0);
  return { min, max };
}
