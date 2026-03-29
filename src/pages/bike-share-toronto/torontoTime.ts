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

/** One simulated hour for playback + deck timestamps (anchor day = 15th of selected month). */
export function getPlaybackHourWindow(
  monthKey: string,
  hour: number,
): { min: number; max: number } {
  const [y, m] = monthKey.split("-").map(Number);
  const min = torontoWallClockToUtcMs(y, m, 15, hour, 0, 0);
  return { min, max: min + 3600000 };
}
