import { torontoWallClockToUtcMs } from './torontoTime';

const DEFAULT_WINDOW_HALF_MS = 30 * 60 * 1000;

const MONTH_MAP: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function parseHour12(h: number, ampm: string | undefined): number {
  if (!ampm) {
    if (h <= 12 && h >= 0) return h === 12 ? 0 : h;
    return h;
  }
  const ap = ampm.toLowerCase();
  if (ap === 'am') return h === 12 ? 0 : h;
  if (ap === 'pm') return h === 12 ? 12 : h + 12;
  return h;
}

/** Pulls e.g. "— last 3 hours" / ", last 2 hours" and returns half-window in ms (symmetric around the instant). */
function stripWindowClause(raw: string): { core: string; windowHalfMs: number } {
  let t = raw.trim();
  let windowHalfMs = DEFAULT_WINDOW_HALF_MS;

  const patterns: RegExp[] = [
    /\s*[—–\-]\s*last\s+(\d+)\s*h(?:ours?)?/i,
    /,?\s*last\s+(\d+)\s*h(?:ours?)?\s*$/i,
    /\s+for\s+(\d+)\s*h(?:ours?)?\s*$/i,
  ];

  for (const re of patterns) {
    const m = re.exec(t);
    if (m) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n > 0) {
        windowHalfMs = (n / 2) * 3600000;
        t = `${t.slice(0, m.index)}${t.slice(m.index + m[0].length)}`.trim();
        break;
      }
    }
  }

  return { core: t, windowHalfMs };
}

export type ParsedTimeTravel =
  | { ok: true; atMs: number; windowHalfMs: number }
  | { ok: false; message: string };

/**
 * Parse a free-form line into Toronto wall time + optional "how much data" window
 * (half-width on each side of that instant for ride search).
 */
export function parseTimeTravelQuery(input: string): ParsedTimeTravel {
  const { core, windowHalfMs } = stripWindowClause(input);
  const s = core.replace(/\s+/g, ' ').trim();
  if (!s) return { ok: false, message: 'Type a date and time in Toronto (local to the data).' };

  // YYYY-MM-DD [HH:mm]
  let m = s.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/i,
  );
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const h = m[4] !== undefined ? Number(m[4]) : 0;
    const mi = m[5] !== undefined ? Number(m[5]) : 0;
    const sec = m[6] !== undefined ? Number(m[6]) : 0;
    if ([y, mo, d, h, mi, sec].some((n) => !Number.isFinite(n))) {
      return { ok: false, message: 'Could not read that date.' };
    }
    try {
      const atMs = torontoWallClockToUtcMs(y, mo, d, h, mi, sec);
      return { ok: true, atMs, windowHalfMs };
    } catch {
      return { ok: false, message: 'That date or time is not valid in Toronto.' };
    }
  }

  // MM/DD/YYYY [H:mm] or M/D/YYYY
  m = s.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?)?$/i,
  );
  if (m) {
    const mo = Number(m[1]);
    const d = Number(m[2]);
    const y = Number(m[3]);
    let h = 0;
    let mi = 0;
    let sec = 0;
    if (m[4] !== undefined) {
      h = parseHour12(Number(m[4]), m[7]);
      mi = Number(m[5] ?? 0);
      sec = Number(m[6] ?? 0);
    }
    if ([y, mo, d, h, mi, sec].some((n) => !Number.isFinite(n))) {
      return { ok: false, message: 'Could not read that date.' };
    }
    try {
      const atMs = torontoWallClockToUtcMs(y, mo, d, h, mi, sec);
      return { ok: true, atMs, windowHalfMs };
    } catch {
      return { ok: false, message: 'That date or time is not valid in Toronto.' };
    }
  }

  // Month name D[,] YYYY [at] H[:mm] [am|pm]
  m = s.match(
    /^([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})(?:\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/i,
  );
  if (m) {
    const mon = MONTH_MAP[m[1]!.toLowerCase()];
    if (!mon) return { ok: false, message: 'Use a month name like Jan or July.' };
    const d = Number(m[2]);
    const y = Number(m[3]);
    let h = 0;
    let mi = 0;
    if (m[4] !== undefined) {
      h = parseHour12(Number(m[4]), m[6]);
      mi = Number(m[5] ?? 0);
    }
    if ([y, mon, d, h, mi].some((n) => !Number.isFinite(n))) {
      return { ok: false, message: 'Could not read that date.' };
    }
    try {
      const atMs = torontoWallClockToUtcMs(y, mon, d, h, mi, 0);
      return { ok: true, atMs, windowHalfMs };
    } catch {
      return { ok: false, message: 'That date or time is not valid in Toronto.' };
    }
  }

  // Shorter: "Jan 1 2025 4pm" (year last optional → default current year risky; require year)
  m = s.match(
    /^([a-z]+)\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i,
  );
  if (m) {
    const mon = MONTH_MAP[m[1]!.toLowerCase()];
    if (!mon) return { ok: false, message: 'Use a month name like Jan or July.' };
    const d = Number(m[2]);
    const y = Number(m[3]);
    const h = parseHour12(Number(m[4]), m[6]);
    const mi = Number(m[5] ?? 0);
    try {
      const atMs = torontoWallClockToUtcMs(y, mon, d, h, mi, 0);
      return { ok: true, atMs, windowHalfMs };
    } catch {
      return { ok: false, message: 'That date or time is not valid in Toronto.' };
    }
  }

  return {
    ok: false,
    message:
      'Try a format like 2025-01-01 4pm or July 4, 2019 8pm — last 3 hours',
  };
}
