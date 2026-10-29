import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { STATIONS, type MapBounds, type StationLocation } from './types';
import { parseTimeTravelQuery } from './parseTimeTravelQuery';
import { isPublishedParquetMonth } from './publishedMonths';
import { torontoSliceAt } from './torontoTime';
import { monthLabel } from './useTripStream';
import {
  fetchNearestRidesFromStation,
  fetchRidesFromStation,
  fetchStationRideCounts,
  type RideRow,
} from './queries';

const TORONTO_TZ = 'America/Toronto';
const MIN_MS = 60000;
const HOUR_MS = 3600000;

/**
 * Moments worth replaying, all inside the published months. `bounds` frames where the moment
 * happens, so it isn't cropped out on a narrow screen.
 */
const SUGGESTIONS: { label: string; query: string; bounds?: MapBounds }[] = [
  { label: 'Weekday rush', query: 'July 15, 2025 5:30pm' },
  // Downtown out to the fireworks at Ashbridge's Bay.
  { label: 'Canada Day night', query: 'July 1, 2025 10pm', bounds: [[-79.42, 43.635], [-79.295, 43.68]] },
  // Yonge St from Bloor down to Dundas, and the Church–Wellesley Village.
  { label: 'Pride Parade', query: 'June 29, 2025 2pm', bounds: [[-79.405, 43.648], [-79.365, 43.675]] },
  { label: 'Winter commute', query: 'Feb 5, 2025 8am' },
  { label: 'Summer 2020', query: 'July 15, 2020 6pm' },
];

const WINDOWS: { label: string; halfMs: number }[] = [
  { label: '±30 min', halfMs: 30 * MIN_MS },
  { label: '±1 h', halfMs: HOUR_MS },
  { label: '±3 h', halfMs: 3 * HOUR_MS },
];

const MAX_STATION_ROWS = 80;

const previewFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TORONTO_TZ,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const rideClockFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TORONTO_TZ,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const rideDayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TORONTO_TZ,
  month: 'short',
  day: 'numeric',
});

/** A query string the parser reads back, e.g. "Jul 1, 2025 5:02pm". */
function formatQueryTime(ms: number): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TORONTO_TZ,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(new Date(ms));
  const g = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? '';
  return `${g('month')} ${g('day')}, ${g('year')} ${g('hour')}:${g('minute')}${g('dayPeriod').toLowerCase()}`;
}

/** Every word of the query appears in the name (so "queen spadina" finds "Queen St W / Spadina Ave"). */
function stationMatches(name: string, words: string[]): boolean {
  const n = name.toLowerCase();
  return words.every((w) => n.includes(w));
}

type ExploreSheetProps = {
  /** Playback time when the sheet opened; fills the time field. */
  initialTimeMs: number;
  dataRangeLabel: string;
  onClose: () => void;
  /** `bounds` is the area to show, when the time came from a suggested moment. */
  onJumpToTime: (atMs: number, bounds?: MapBounds) => void;
  onPickRide: (ride: RideRow, monthKey: string) => void;
  /** Station being searched from, so the map can pin and fly to it (null clears). */
  onPreviewStation: (station: StationLocation | null) => void;
};

export function ExploreSheet({
  initialTimeMs,
  dataRangeLabel,
  onClose,
  onJumpToTime,
  onPickRide,
  onPreviewStation,
}: ExploreSheetProps) {
  const [query, setQuery] = useState(() => formatQueryTime(initialTimeMs));
  const [windowIdx, setWindowIdx] = useState(0);
  const [stationFilter, setStationFilter] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [station, setStation] = useState<StationLocation | null>(null);
  const [stationCounts, setStationCounts] = useState<{ monthKey: string; counts: Map<string, number> } | null>(null);
  const [countsError, setCountsError] = useState<string | null>(null);
  const [rides, setRides] = useState<{ key: string; rows: RideRow[]; nearest: boolean } | null>(null);
  const [ridesError, setRidesError] = useState<string | null>(null);
  const timeInputRef = useRef<HTMLInputElement | null>(null);
  const stationInputRef = useRef<HTMLInputElement | null>(null);
  const listId = useId();

  useEffect(() => {
    timeInputRef.current?.focus();
    timeInputRef.current?.select();
  }, []);

  const parsed = useMemo(() => parseTimeTravelQuery(query), [query]);
  const atMs = parsed.ok ? parsed.atMs : null;
  const monthKey = atMs != null ? torontoSliceAt(atMs).month : null;
  const published = monthKey != null && isPublishedParquetMonth(monthKey);

  const typedWindow =
    parsed.ok && (parsed.windowBeforeMs !== 30 * MIN_MS || parsed.windowAfterMs !== 30 * MIN_MS);
  const windowBeforeMs = typedWindow && parsed.ok ? parsed.windowBeforeMs : WINDOWS[windowIdx]!.halfMs;
  const windowAfterMs = typedWindow && parsed.ok ? parsed.windowAfterMs : WINDOWS[windowIdx]!.halfMs;

  // Rides started per station that month: filters the picker and ranks it.
  useEffect(() => {
    if (!published || !monthKey || stationCounts?.monthKey === monthKey) return;
    let cancelled = false;
    setCountsError(null);
    fetchStationRideCounts(monthKey)
      .then((counts) => {
        if (!cancelled) setStationCounts({ monthKey, counts });
      })
      .catch((e: unknown) => {
        if (!cancelled) setCountsError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [published, monthKey, stationCounts?.monthKey]);

  const countsForMonth = stationCounts?.monthKey === monthKey ? stationCounts.counts : null;

  const stationOptions = useMemo(() => {
    const words = stationFilter.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = STATIONS.filter(
      (s) => (!countsForMonth || countsForMonth.has(s.name)) && stationMatches(s.name, words),
    );
    const count = (s: StationLocation) => countsForMonth?.get(s.name) ?? 0;
    list.sort((a, b) => count(b) - count(a) || a.name.localeCompare(b.name, 'en', { numeric: true }));
    return list;
  }, [stationFilter, countsForMonth]);

  useEffect(() => setActiveIdx(0), [stationFilter, countsForMonth]);

  const ridesKey =
    station && atMs != null && published && monthKey
      ? `${monthKey}|${station.name}|${atMs}|${windowBeforeMs}|${windowAfterMs}`
      : null;

  useEffect(() => {
    if (!ridesKey || !station || atMs == null || !monthKey) {
      setRides(null);
      return;
    }
    let cancelled = false;
    setRides(null);
    setRidesError(null);
    (async () => {
      const inWindow = await fetchRidesFromStation(
        monthKey,
        station.name,
        atMs - windowBeforeMs,
        atMs + windowAfterMs,
      );
      if (inWindow.some((r) => r.hasRoute)) return { rows: inWindow, nearest: false };
      return { rows: await fetchNearestRidesFromStation(monthKey, station.name, atMs), nearest: true };
    })()
      .then(({ rows, nearest }) => {
        if (!cancelled) setRides({ key: ridesKey, rows, nearest });
      })
      .catch((e: unknown) => {
        if (!cancelled) setRidesError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [ridesKey, station, atMs, monthKey, windowBeforeMs, windowAfterMs]);

  const drawable = useMemo(() => rides?.rows.filter((r) => r.hasRoute) ?? [], [rides]);
  const hiddenNoRoute = (rides?.rows.length ?? 0) - drawable.length;
  const closestId = useMemo(() => {
    if (atMs == null || drawable.length === 0) return null;
    let best = drawable[0]!;
    for (const r of drawable) {
      if (Math.abs(r.startedAtMs - atMs) < Math.abs(best.startedAtMs - atMs)) best = r;
    }
    return best.id;
  }, [drawable, atMs]);

  const jump = () => {
    if (atMs != null && published) onJumpToTime(atMs, SUGGESTIONS.find((s) => s.query === query)?.bounds);
  };

  const pickStation = (s: StationLocation) => {
    setStation(s);
    setStationFilter('');
    onPreviewStation(s);
  };

  const clearStation = () => {
    setStation(null);
    onPreviewStation(null);
    requestAnimationFrame(() => stationInputRef.current?.focus());
  };

  const onStationKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const visible = Math.min(stationOptions.length, MAX_STATION_ROWS);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(visible - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const s = stationOptions[activeIdx];
      if (s) pickStation(s);
    }
  };

  useEffect(() => {
    document.getElementById(`${listId}-opt-${activeIdx}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx, listId]);

  let timeStatus: { tone: 'ok' | 'error'; text: string } | null = null;
  if (!query.trim()) timeStatus = { tone: 'error', text: 'Type a date and time, e.g. Jul 1, 2025 5pm.' };
  else if (parsed.ok === false) timeStatus = { tone: 'error', text: parsed.message };
  else if (!published && monthKey)
    timeStatus = {
      tone: 'error',
      text: `${monthLabel(monthKey)} isn't in the dataset. Available: ${dataRangeLabel}.`,
    };
  else if (atMs != null) timeStatus = { tone: 'ok', text: previewFormatter.format(atMs) };

  return (
    <aside className="bs-sheet" role="dialog" aria-modal="false" aria-labelledby="bs-sheet-title">
      <div className="bs-sheet__head">
        <h2 className="bs-sheet__title" id="bs-sheet-title">
          Explore
        </h2>
        <button type="button" className="bs-icon-btn" onClick={onClose} aria-label="Close search (Esc)">
          <X aria-hidden />
        </button>
      </div>

      <div className="bs-sheet__body">
        <section className="bs-sheet__section">
          <label className="bs-sheet__label" htmlFor="bs-explore-time">
            When
          </label>
          <form
            className="bs-sheet__time-row"
            onSubmit={(e) => {
              e.preventDefault();
              jump();
            }}
          >
            <input
              ref={timeInputRef}
              id="bs-explore-time"
              className="bs-input"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-describedby="bs-explore-time-status"
            />
            <button type="submit" className="bs-primary-btn" disabled={atMs == null || !published}>
              Go
              <ArrowRight aria-hidden />
            </button>
          </form>
          <p
            id="bs-explore-time-status"
            className={`bs-sheet__status bs-sheet__status--${timeStatus?.tone ?? 'ok'}`}
            role="status"
          >
            {timeStatus?.text}
          </p>
          <div className="bs-chips" aria-label="Suggested times">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                className={`bs-chip${query === s.query ? ' bs-chip--active' : ''}`}
                onClick={() => setQuery(s.query)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        <section className="bs-sheet__section bs-sheet__section--grow">
          <div className="bs-sheet__label-row">
            <span className="bs-sheet__label">Find a ride</span>
            <div className="bs-segmented" role="radiogroup" aria-label="Search window">
              {WINDOWS.map((w, i) => (
                <button
                  key={w.label}
                  type="button"
                  role="radio"
                  aria-checked={!typedWindow && i === windowIdx}
                  className={`bs-segmented__opt${!typedWindow && i === windowIdx ? ' bs-segmented__opt--on' : ''}`}
                  onClick={() => setWindowIdx(i)}
                  disabled={typedWindow}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {!published || atMs == null ? (
            <p className="bs-sheet__empty">Pick a time in the dataset to search its rides.</p>
          ) : station ? (
            <>
              <div className="bs-station-chip">
                <span className="bs-station-chip__pin" aria-hidden />
                <span className="bs-station-chip__name">From {station.name}</span>
                <button type="button" className="bs-text-btn" onClick={clearStation}>
                  Change
                </button>
              </div>

              {ridesError && <p className="bs-sheet__empty bs-sheet__empty--error">{ridesError}</p>}
              {!rides && !ridesError && <p className="bs-sheet__empty">Searching rides…</p>}
              {rides && drawable.length === 0 && (
                <p className="bs-sheet__empty">No rides from this station in {monthLabel(monthKey!)}.</p>
              )}
              {rides && drawable.length > 0 && (
                <>
                  <p className="bs-sheet__hint">
                    {rides.nearest
                      ? 'Nothing in that window. These are the closest rides that month:'
                      : `${drawable.length} ride${drawable.length === 1 ? '' : 's'} started here. Pick one to follow it.`}
                  </p>
                  <ul className="bs-ride-list">
                    {drawable.map((r) => {
                      const mins = Math.max(1, Math.round((r.endedAtMs - r.startedAtMs) / MIN_MS));
                      const sameDay =
                        torontoSliceAt(r.startedAtMs).day === torontoSliceAt(atMs).day;
                      return (
                        <li key={r.id}>
                          <button
                            type="button"
                            className={`bs-ride-row${r.id === closestId ? ' bs-ride-row--closest' : ''}`}
                            onClick={() => onPickRide(r, monthKey!)}
                          >
                            <span className="bs-ride-row__time">
                              {!sameDay && (
                                <span className="bs-ride-row__day">{rideDayFormatter.format(r.startedAtMs)}</span>
                              )}
                              {rideClockFormatter.format(r.startedAtMs)}
                            </span>
                            <span className="bs-ride-row__main">
                              <span className="bs-ride-row__end">
                                {r.endName === r.startName ? 'Round trip' : `→ ${r.endName}`}
                              </span>
                              <span className="bs-ride-row__meta">
                                <span className={`bs-dot bs-dot--${r.memberCasual}`} aria-hidden />
                                {r.memberCasual === 'member' ? 'Member' : 'Casual'} · {mins} min
                                {r.isEbike ? ' · e-bike' : ''}
                              </span>
                            </span>
                            {r.id === closestId && <span className="bs-ride-row__tag">closest</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {hiddenNoRoute > 0 && (
                    <p className="bs-sheet__footnote">
                      {hiddenNoRoute} more without a recorded route can't be drawn.
                    </p>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <input
                ref={stationInputRef}
                className="bs-input"
                type="search"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={stationOptions.length ? `${listId}-opt-${activeIdx}` : undefined}
                aria-label="Start station"
                autoComplete="off"
                placeholder="Start station, e.g. queen spadina"
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
                onKeyDown={onStationKeyDown}
              />
              {countsError && <p className="bs-sheet__empty bs-sheet__empty--error">{countsError}</p>}
              {!countsForMonth && !countsError && (
                <p className="bs-sheet__hint">Loading {monthLabel(monthKey!)} trips…</p>
              )}
              {countsForMonth && stationOptions.length > 0 && (
                <p className="bs-sheet__hint">Busiest first, with rides started there in {monthLabel(monthKey!)}.</p>
              )}
              <ul className="bs-station-list" id={listId} role="listbox" aria-label="Start stations">
                {stationOptions.slice(0, MAX_STATION_ROWS).map((s, i) => (
                  <li
                    key={s.id}
                    id={`${listId}-opt-${i}`}
                    role="option"
                    aria-selected={i === activeIdx}
                    className={`bs-station-row${i === activeIdx ? ' bs-station-row--active' : ''}`}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => pickStation(s)}
                  >
                    <span className="bs-station-row__name">{s.name}</span>
                    {countsForMonth && (
                      <span className="bs-station-row__count">
                        {(countsForMonth.get(s.name) ?? 0).toLocaleString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {stationOptions.length === 0 && countsForMonth && (
                <p className="bs-sheet__empty">No stations with rides match that.</p>
              )}
              {stationOptions.length > MAX_STATION_ROWS && (
                <p className="bs-sheet__footnote">
                  Showing the {MAX_STATION_ROWS} busiest of {stationOptions.length}. Type to narrow.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </aside>
  );
}
