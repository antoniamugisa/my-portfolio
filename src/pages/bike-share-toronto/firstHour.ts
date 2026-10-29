import type { PlaybackSlice } from './torontoTime';

/**
 * The hour the demo opens on: the busiest evening rush of 2025, a Thursday in July. 2025 also has
 * reliable member/casual labels; 2023–2024 mark most riders casual at the source.
 * Its rides are exported to `public/bike-share/first-hour.json`
 * (`bun run scripts/export-first-hour.ts 2025-07 17 17` in `pipeline/`), so the first frame draws
 * without waiting for DuckDB-WASM. Change both together.
 */
export const FIRST_HOUR: { month: string; day: number; hour: number } = {
  month: '2025-07',
  day: 17,
  hour: 17,
};

export type FirstHourData = {
  rows: Record<string, unknown>[];
  hourlyCounts: number[];
  sampled: boolean;
};

type FirstHourFile = {
  month: string;
  day: number;
  hour: number;
  sampled: boolean;
  hourlyCounts: number[];
  columns: string[];
  rows: unknown[][];
};

export function isFirstHour(slice: PlaybackSlice): boolean {
  return slice.month === FIRST_HOUR.month && slice.day === FIRST_HOUR.day && slice.hour === FIRST_HOUR.hour;
}

let pending: Promise<FirstHourData | null> | null = null;

/** Fetches the opening hour once; resolves null if the file is missing or doesn't match FIRST_HOUR. */
export function loadFirstHour(): Promise<FirstHourData | null> {
  if (!pending) {
    pending = fetch('/bike-share/first-hour.json')
      .then((res) => (res.ok ? (res.json() as Promise<FirstHourFile>) : null))
      .then((file) => {
        if (!file || !isFirstHour(file)) return null;
        const rows = file.rows.map((values) =>
          Object.fromEntries(file.columns.map((col, i) => [col, values[i]])),
        );
        return { rows, hourlyCounts: file.hourlyCounts, sampled: file.sampled };
      })
      .catch(() => null);
  }
  return pending;
}
