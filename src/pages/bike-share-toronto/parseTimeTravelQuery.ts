import { torontoWallClockToUtcMs } from './torontoTime';

const DEFAULT_WINDOW_HALF_MS = 30 * 60 * 1000;
const HOUR_MS = 3600000;

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
  // No am/pm means a 24-hour clock ("12:30" is noon).
  if (!ampm) return h;
  const ap = ampm.toLowerCase();
  if (ap === 'am') return h === 12 ? 0 : h;
  if (ap === 'pm') return h === 12 ? 12 : h + 12;
  return h;
}

type SearchWindow = { windowBeforeMs: number; windowAfterMs: number };

/**
 * Pulls e.g. "— last 3 hours" (the N hours before the instant) or "for 2 hours" (the N hours after).
 * Without a clause the window is ±30 minutes around the instant.
 */
function stripWindowClause(raw: string): { core: string } & SearchWindow {
  let t = raw.trim();
  let window: SearchWindow = {
    windowBeforeMs: DEFAULT_WINDOW_HALF_MS,
    windowAfterMs: DEFAULT_WINDOW_HALF_MS,
  };

  const patterns: Array<{ re: RegExp; after: boolean }> = [
    { re: /\s*[—–-]\s*last\s+(\d+)\s*h(?:ours?)?/i, after: false },
    { re: /,?\s*last\s+(\d+)\s*h(?:ours?)?\s*$/i, after: false },
    { re: /\s+for\s+(\d+)\s*h(?:ours?)?\s*$/i, after: true },
  ];

  for (const { re, after } of patterns) {
    const m = re.exec(t);
    if (m) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n > 0) {
        window = after
          ? { windowBeforeMs: 0, windowAfterMs: n * HOUR_MS }
          : { windowBeforeMs: n * HOUR_MS, windowAfterMs: 0 };
        t = `${t.slice(0, m.index)}${t.slice(m.index + m[0].length)}`.trim();
        break;
      }
    }
  }

  return { core: t, ...window };
}

export type ParsedTimeTravel =
  | ({ ok: true; atMs: number } & SearchWindow)
  | { ok: false; message: string };

/** Rejects impossible dates/times instead of letting them roll over (Feb 31 → Mar 3). */
function isValidWallTime(y: number, mo: number, d: number, h: number, mi: number, sec: number): boolean {
  if (![y, mo, d, h, mi, sec].every(Number.isInteger)) return false;
  if (mo < 1 || mo > 12) return false;
  const daysInMonth = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  return d >= 1 && d <= daysInMonth && h >= 0 && h <= 23 && mi >= 0 && mi <= 59 && sec >= 0 && sec <= 59;
}

/**
 * Parse a free-form line into Toronto wall time + optional window (how far before/after that
 * instant to search for rides).
 */
export function parseTimeTravelQuery(input: string): ParsedTimeTravel {
  const { core, windowBeforeMs, windowAfterMs } = stripWindowClause(input);
  const toResult = (
    y: number,
    mo: number,
    d: number,
    h: number,
    mi: number,
    sec: number,
  ): ParsedTimeTravel =>
    isValidWallTime(y, mo, d, h, mi, sec)
      ? { ok: true, atMs: torontoWallClockToUtcMs(y, mo, d, h, mi, sec), windowBeforeMs, windowAfterMs }
      : { ok: false, message: 'That date or time is not valid in Toronto.' };
  const s = core.replace(/\s+/g, ' ').trim();
  if (!s) return { ok: false, message: 'Type a date and time in Toronto (local to the data).' };

  // YYYY-MM-DD [HH:mm[:ss]] or YYYY-MM-DD H[:mm] am|pm
  let m = s.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:(?:T|\s+)(\d{1,2})(?::(\d{2})(?::(\d{2}))?)?\s*(am|pm)?)?$/i,
  );
  // A bare hour needs am/pm ("2025-01-01 4pm"); otherwise require HH:mm.
  if (m && m[4] !== undefined && m[5] === undefined && m[7] === undefined) m = null;
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const rawH = m[4] !== undefined ? Number(m[4]) : 0;
    const h = m[7] !== undefined ? parseHour12(rawH, m[7]) : rawH;
    const mi = m[5] !== undefined ? Number(m[5]) : 0;
    const sec = m[6] !== undefined ? Number(m[6]) : 0;
    return toResult(y, mo, d, h, mi, sec);
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
    return toResult(y, mo, d, h, mi, sec);
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
    return toResult(y, mon, d, h, mi, 0);
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
    return toResult(y, mon, d, h, mi, 0);
  }

  return {
    ok: false,
    message:
      'Try a format like 2025-01-01 4pm or July 4, 2019 8pm — last 3 hours',
  };
}
