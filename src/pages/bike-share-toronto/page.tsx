import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type MutableRefObject,
} from 'react';
import { Helmet } from 'react-helmet-async';
import { Clock, Pause, Play, Search, Shuffle, X } from 'lucide-react';
import MapView from './MapView';
import { ActiveRidesPanel } from './ActiveRidesPanel';
import { SIM_GRAPH_WINDOW_SIZE_MS } from './activeRidesConfig';
import { type DeckTrip, type GraphDataPoint, HOUR_PROFILE, STATIONS } from './types';
import {
  deckTripFromDuckRow,
  ensureMonthLoaded,
  getDB,
  useTripStream,
  monthLabel,
} from './useTripStream';
import {
  parseTimeTravelQuery,
  type ParsedTimeTravel,
} from './parseTimeTravelQuery';

function timeTravelParseErrorMessage(p: ParsedTimeTravel): string | null {
  if (p.ok === false) return p.message;
  return null;
}
import { isPublishedParquetMonth, PUBLISHED_MONTHS } from './publishedMonths';
import { nextPlaybackSlice, torontoDayOfMonth } from './torontoTime';
import './bikeshare.css';

const SPEEDS = [1, 2, 4];
const TORONTO_TZ = 'America/Toronto';

type SearchMode = 'time' | 'ride';

type RideSearchResult = {
  row: Record<string, unknown>;
  id: string;
  startName: string;
  endName: string;
  startedAtMs: number;
  endedAtMs: number;
  memberCasual: 'member' | 'casual';
  bikeType: string;
};

function MapFloatingClock({
  timeMsRef,
  hasTrips,
  isLoading,
  loadError,
}: {
  timeMsRef: MutableRefObject<number>;
  hasTrips: boolean;
  isLoading: boolean;
  loadError: string | null;
}) {
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('--:--:--');
  const [showSlowLoadingText, setShowSlowLoadingText] = useState(false);

  const SLOW_LOADING_THRESHOLD_MS = 5000;

  const hasError = Boolean(loadError);
  const showOverlay = isLoading || hasError;

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: TORONTO_TZ,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [],
  );
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: TORONTO_TZ,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
    [],
  );

  const lastDisplayedSecondRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setShowSlowLoadingText(false);
      return;
    }

    const timer = window.setTimeout(
      () => setShowSlowLoadingText(true),
      SLOW_LOADING_THRESHOLD_MS,
    );
    return () => {
      window.clearTimeout(timer);
      setShowSlowLoadingText(false);
    };
  }, [isLoading]);

  useEffect(() => {
    if (isLoading || !hasTrips || hasError) {
      lastDisplayedSecondRef.current = null;
      setDateStr('');
      setTimeStr('--:--:--');
      return;
    }

    const update = () => {
      const ms = timeMsRef.current;
      if (!ms) return;

      // Only update when the displayed second changes.
      const nextSecond = Math.floor(ms / 1000);
      if (lastDisplayedSecondRef.current === nextSecond) return;
      lastDisplayedSecondRef.current = nextSecond;

      const d = new Date(nextSecond * 1000);
      setDateStr(dateFormatter.format(d));
      setTimeStr(timeFormatter.format(d));
    };

    update();
    const id = window.setInterval(update, 50);
    return () => window.clearInterval(id);
  }, [timeMsRef, hasTrips, isLoading, hasError, dateFormatter, timeFormatter]);

  return (
    <div className="bs-map-hud-clock">
      <div
        className={
          showOverlay
            ? 'bs-map-hud-clock__content bs-map-hud-clock__content--blur'
            : 'bs-map-hud-clock__content'
        }
      >
        <div className="bs-map-hud-date">{dateStr || '—'}</div>
        <div className="bs-map-hud-time">{timeStr}</div>
      </div>

      {showOverlay && (
        <div className="bs-map-hud-clock__overlay" aria-hidden>
          {isLoading && (
            <>
              <div className="bs-map-hud-clock__loading-bar" />
              {showSlowLoadingText && (
                <div className="bs-map-hud-clock__slow-text">
                  <div>This could take ~20s</div>
                  <div>depending on connection</div>
                </div>
              )}
            </>
          )}

          {hasError && !isLoading && (
            <div className="bs-map-hud-clock__error">
              <span className="bs-map-hud-clock__error-dot" />
              <span>Failed to load :(</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const DEFAULT_MONTH = '2025-01';

function formatTripClock(ms: number) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TORONTO_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(ms));
}

function tripStats(trip: DeckTrip) {
  const durSec = Math.max(1, Math.round((trip.endedAtMs - trip.startedAtMs) / 1000));
  const mins = Math.max(1, Math.round(durSec / 60));
  const mi = trip.distanceM / 1609.34;
  const mph = mi / (durSec / 3600);
  return {
    durMin: mins,
    miLabel: mi < 0.05 ? '<0.1' : mi.toFixed(1),
    mphLabel: Number.isFinite(mph) && mph > 0.5 && mph < 200 ? mph.toFixed(1) : '—',
  };
}

function shortTripId(id: string) {
  const compact = id.replace(/-/g, '');
  if (compact.length <= 12) return id.toUpperCase();
  return `${compact.slice(0, 8).toUpperCase()}…`;
}

export type BikeShareTorontoPageProps = {
  /** When true, map is embedded in project detail (not full-viewport). */
  embedded?: boolean;
  /** When true (fullscreen overlay), map fills the viewport; overrides mobile “below nav” inset. */
  portalFullscreen?: boolean;
  /** Info / Esc: exit fullscreen or scroll back to project copy. */
  onRequestProjectDetails?: () => void;
};

export default function BikeShareTorontoPage({
  embedded = false,
  portalFullscreen = false,
  onRequestProjectDetails,
}: BikeShareTorontoPageProps) {
  const [currentHour, setCurrentHour] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [tripCount, setTripCount] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(DEFAULT_MONTH);
  /** Toronto day being played (set by time travel / ride pick); null = hour sampled across the month. */
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [mapTimelinePaused, setMapTimelinePaused] = useState(false);
  const [mapFps, setMapFps] = useState(0);
  /** Bumps when the user picks a month/hour so the map clock snaps to that window (not when the hour auto-advances). */
  const [playbackResetNonce, setPlaybackResetNonce] = useState(0);
  const [spotlightTrip, setSpotlightTrip] = useState<DeckTrip | null>(null);
  const [stationSearchOpen, setStationSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('time');
  const [timeTravelText, setTimeTravelText] = useState('2025-01-01 00:00');
  const [selectedStationPin, setSelectedStationPin] = useState<{
    id: number;
    lng: number;
    lat: number;
  } | null>(null);
  const [rideResults, setRideResults] = useState<RideSearchResult[]>([]);
  const [findRideTimeText, setFindRideTimeText] = useState(timeTravelText);
  const [findRideStartFilter, setFindRideStartFilter] = useState('');
  const [findRideEndFilter, setFindRideEndFilter] = useState('');
  const [findRideStartName, setFindRideStartName] = useState<string | null>(null);
  const [rideSearchLoading, setRideSearchLoading] = useState(false);
  const [rideSearchError, setRideSearchError] = useState<string | null>(null);
  const [stationStats, setStationStats] = useState<{
    startsInHour: number;
    endsInHour: number;
    startsInMonth: number;
    endsInMonth: number;
  } | null>(null);
  const [mapFlyTo, setMapFlyTo] = useState<{
    lng: number;
    lat: number;
    zoom?: number;
    id: number;
  } | null>(null);
  const timeTravelTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const findRideTimeTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const findRideEndFilterRef = useRef<HTMLInputElement | null>(null);
  const [rideGraphData, setRideGraphData] = useState<GraphDataPoint[]>([]);
  const [simTimeForGraph, setSimTimeForGraph] = useState(0);
  const [mapBearing, setMapBearing] = useState(0);
  const tripCountForGraphRef = useRef(0);
  tripCountForGraphRef.current = tripCount;

  const exploreModalWasOpenRef = useRef(false);

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackTimeMsRef = useRef(0);

  const bumpPlaybackReset = useCallback(() => {
    setPlaybackResetNonce((n) => n + 1);
  }, []);

  /** Ref + stable callback avoids TDZ / HMR edge cases around `useTripStream(..., cb)`. */
  const autoPickHourRef = useRef<(hour: number) => void>(() => {});
  autoPickHourRef.current = (hour: number) => {
    setCurrentHour(hour);
    bumpPlaybackReset();
  };
  const notifyAutoPickHour = useCallback((hour: number) => {
    autoPickHourRef.current(hour);
  }, []);

  // Keep the initial view pinned to midnight Jan 1, 2025.
  // The auto-pick fallback is useful for partial/empty hours, but we don't want it
  // to override the requested starting point on first load.
  const allowAutoPickEmptyHour = !(currentMonth === '2025-01' && currentHour === 0);

  const { trips, totalTrips, isLoading, loadingMessage, error, playbackWindow, prefetchHourForMonth } =
    useTripStream(
      currentMonth,
      currentHour,
      currentDay,
      allowAutoPickEmptyHour ? notifyAutoPickHour : undefined,
    );

  /** Next hour of playback; a day that runs past the last published month loops back to the 1st of this month. */
  const nextSlice = useMemo(() => {
    const next = nextPlaybackSlice({ month: currentMonth, day: currentDay, hour: currentHour });
    if (next.month !== currentMonth && !isPublishedParquetMonth(next.month)) {
      return { month: currentMonth, day: 1, hour: 0 };
    }
    return next;
  }, [currentMonth, currentDay, currentHour]);

  const handleWarmNextHour = useCallback(() => {
    return prefetchHourForMonth(nextSlice.month, nextSlice.hour, nextSlice.day);
  }, [nextSlice, prefetchHourForMonth]);

  const handleAdvanceHour = useCallback(async () => {
    try {
      await prefetchHourForMonth(nextSlice.month, nextSlice.hour, nextSlice.day);
    } catch (e) {
      console.error('[BikeShare] prefetch next hour failed:', e);
    }
    setCurrentMonth(nextSlice.month);
    setCurrentDay(nextSlice.day);
    setCurrentHour(nextSlice.hour);
  }, [nextSlice, prefetchHourForMonth]);

  const handleMapFps = useCallback((fps: number) => {
    setMapFps(fps);
  }, []);

  const handleTripCountChange = useCallback((count: number) => {
    setTripCount(count);
  }, []);

  useEffect(() => {
    if (trips.length === 0) {
      setRideGraphData([]);
      return;
    }
    const id = window.setInterval(() => {
      const sim = playbackTimeMsRef.current;
      setSimTimeForGraph(sim);
      setRideGraphData((prev) => {
        const next = [
          ...prev,
          { simTimeMs: sim, count: tripCountForGraphRef.current },
        ];
        const cutoff = sim - SIM_GRAPH_WINDOW_SIZE_MS * 4;
        return next.filter((d) => d.simTimeMs >= cutoff);
      });
    }, 400);
    return () => clearInterval(id);
  }, [trips.length]);

  const parsedTimeTravel = useMemo(
    () => parseTimeTravelQuery(timeTravelText),
    [timeTravelText],
  );

  const parsedSearchMs = parsedTimeTravel.ok ? parsedTimeTravel.atMs : null;

  const parsedSearchMonthHour = useMemo(() => {
    if (!parsedSearchMs) return null;
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: TORONTO_TZ,
      year: 'numeric',
      month: '2-digit',
      hour: '2-digit',
      hour12: false,
    });
    const parts = dtf.formatToParts(new Date(parsedSearchMs));
    const g = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value;
    const year = g('year');
    const month = g('month');
    const hourStr = g('hour');
    if (!year || !month || !hourStr) return null;
    return {
      monthKey: `${year}-${month}`,
      day: torontoDayOfMonth(parsedSearchMs),
      hour: Number(hourStr) % 24,
    };
  }, [parsedSearchMs]);

  const parsedFindRide = useMemo(
    () => parseTimeTravelQuery(findRideTimeText),
    [findRideTimeText],
  );
  const parsedFindRideMs = parsedFindRide.ok ? parsedFindRide.atMs : null;
  const parsedFindRideMonthHour = useMemo(() => {
    if (!parsedFindRideMs) return null;
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: TORONTO_TZ,
      year: 'numeric',
      month: '2-digit',
      hour: '2-digit',
      hour12: false,
    });
    const parts = dtf.formatToParts(new Date(parsedFindRideMs));
    const g = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value;
    const year = g('year');
    const month = g('month');
    const hourStr = g('hour');
    if (!year || !month || !hourStr) return null;
    return { monthKey: `${year}-${month}`, hour: Number(hourStr) };
  }, [parsedFindRideMs]);

  const findRideMonthPublished =
    parsedFindRideMonthHour !== null &&
    isPublishedParquetMonth(parsedFindRideMonthHour.monthKey);

  const findRideSearchKey = parsedFindRide.ok
    ? `${parsedFindRide.atMs}|${parsedFindRide.windowHalfMs}`
    : '';

  useEffect(() => {
    setFindRideStartName(null);
    setRideResults([]);
    setStationStats(null);
    setFindRideEndFilter('');
    setRideSearchError(null);
  }, [findRideSearchKey]);

  const jumpToSearchTime = useCallback(() => {
    if (!parsedSearchMonthHour) return;
    setCurrentMonth(parsedSearchMonthHour.monthKey);
    setCurrentDay(parsedSearchMonthHour.day);
    setCurrentHour(parsedSearchMonthHour.hour);
    bumpPlaybackReset();
    setSpotlightTrip(null);
    setSelectedStationPin(null);
    setStationSearchOpen(false);
  }, [parsedSearchMonthHour, bumpPlaybackReset]);

  const pickRandomTrip = useCallback(() => {
    if (trips.length === 0) return;
    setSpotlightTrip(trips[Math.floor(Math.random() * trips.length)]!);
  }, [trips]);

  const runStationStats = useCallback(
    async (stationName: string, monthKey: string, hour: number) => {
      setStationStats(null);
      setRideSearchError(null);
      try {
        const db = await getDB();
        await ensureMonthLoaded(db, monthKey);
        const tableName = `trips_${monthKey.replace('-', '_')}`;
        const conn = await db.connect();
        try {
          const esc = stationName.replace(/'/g, "''");
          const [startsHour, endsHour, startsMonth, endsMonth] = await Promise.all([
            conn.query(
              `SELECT COUNT(*)::BIGINT AS c FROM ${tableName} WHERE hour = ${hour} AND startName = '${esc}'`,
            ),
            conn.query(
              `SELECT COUNT(*)::BIGINT AS c FROM ${tableName} WHERE hour = ${hour} AND endName = '${esc}'`,
            ),
            conn.query(
              `SELECT COUNT(*)::BIGINT AS c FROM ${tableName} WHERE startName = '${esc}'`,
            ),
            conn.query(
              `SELECT COUNT(*)::BIGINT AS c FROM ${tableName} WHERE endName = '${esc}'`,
            ),
          ]);
          const toNum = (r: {
            toArray: () => Array<{ toJSON: () => Record<string, unknown> }>;
          }) =>
            Number((r.toArray()[0] as { toJSON: () => Record<string, unknown> }).toJSON().c);
          setStationStats({
            startsInHour: toNum(startsHour),
            endsInHour: toNum(endsHour),
            startsInMonth: toNum(startsMonth),
            endsInMonth: toNum(endsMonth),
          });
        } finally {
          await conn.close();
        }
      } catch (e) {
        setRideSearchError(
          e instanceof Error ? e.message : String(e ?? 'Failed to load stats'),
        );
      }
    },
    [],
  );

  const runRideSearchFromStation = useCallback(
    async (
      stationName: string,
      ctx: { monthKey: string; hour: number; baseMs: number; windowHalfMs: number },
    ) => {
      const { monthKey, hour, baseMs, windowHalfMs } = ctx;
      setRideSearchLoading(true);
      setRideSearchError(null);
      setRideResults([]);
      try {
        const db = await getDB();
        await ensureMonthLoaded(db, monthKey);
        const tableName = `trips_${monthKey.replace('-', '_')}`;
        const conn = await db.connect();
        try {
          const fromIso = new Date(baseMs - windowHalfMs).toISOString();
          const toIso = new Date(baseMs + windowHalfMs).toISOString();
          const esc = stationName.replace(/'/g, "''");
          const res = await conn.query(`
            SELECT id, startName, endName, startedAt, endedAt, bikeType, memberCasual, routeGeometry, distanceM
            FROM ${tableName}
            WHERE hour = ${hour}
              AND startName = '${esc}'
              AND startedAt >= '${fromIso}'
              AND startedAt <= '${toIso}'
            ORDER BY startedAt ASC
            LIMIT 60
          `);
          const rows = res
            .toArray()
            .map((r: { toJSON: () => Record<string, unknown> }) => r.toJSON());
          const mapped: RideSearchResult[] = rows
            .map((row) => ({
              row,
              id: String(row.id ?? ''),
              startName: String(row.startName ?? ''),
              endName: String(row.endName ?? ''),
              startedAtMs: new Date(String(row.startedAt)).getTime(),
              endedAtMs: new Date(String(row.endedAt)).getTime(),
              memberCasual: (String(row.memberCasual) === 'member' ? 'member' : 'casual') as
                | 'member'
                | 'casual',
              bikeType: String(row.bikeType ?? ''),
            }))
            .filter((r) => {
              const t = deckTripFromDuckRow(r.row, monthKey, hour);
              return t !== null;
            });
          setRideResults(mapped);
        } finally {
          await conn.close();
        }
      } catch (e) {
        setRideSearchError(
          e instanceof Error ? e.message : String(e ?? 'Failed to load rides'),
        );
      } finally {
        setRideSearchLoading(false);
      }
    },
    [],
  );

  const handleSelectRideResult = useCallback(
    (r: RideSearchResult, monthKey: string, hour: number) => {
      // Play the ride's own day so the spotlight trip lines up with the trips around it.
      const monthWide = deckTripFromDuckRow(r.row, monthKey, hour);
      if (!monthWide) return;
      const day = torontoDayOfMonth(monthWide.startedAtMs);
      const trip = deckTripFromDuckRow(r.row, monthKey, hour, day);
      if (!trip) return;
      setCurrentMonth(monthKey);
      setCurrentDay(day);
      setCurrentHour(hour);
      bumpPlaybackReset();
      setSpotlightTrip(trip);
      setStationSearchOpen(false);
      setSelectedStationPin(null);
      setFindRideStartName(null);
      setRideResults([]);
      setFindRideEndFilter('');
    },
    [bumpPlaybackReset],
  );

  const handlePickEndStation = useCallback(
    (endName: string, monthKey: string, hour: number, targetMs: number) => {
      const candidates = rideResults.filter((r) => r.endName === endName);
      if (candidates.length === 0) return;
      if (candidates.length === 1) {
        handleSelectRideResult(candidates[0]!, monthKey, hour);
        return;
      }
      let best = candidates[0]!;
      let bestD = Infinity;
      for (const c of candidates) {
        const d = Math.abs(c.startedAtMs - targetMs);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      handleSelectRideResult(best, monthKey, hour);
    },
    [rideResults, handleSelectRideResult],
  );

  useEffect(() => {
    if (isLoading) setSpotlightTrip(null);
  }, [isLoading]);

  useEffect(() => {
    if (!spotlightTrip) return;
    if (!trips.some((t) => t.id === spotlightTrip.id)) {
      setSpotlightTrip(null);
    }
  }, [trips, spotlightTrip]);

  const searchPaletteKbd = useMemo(() => {
    if (typeof navigator === 'undefined') return '⌘K';
    return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? '⌘K' : 'Ctrl K';
  }, []);

  const sortedStations = useMemo(
    () => [...STATIONS].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const filteredFindRideStartStations = useMemo(() => {
    const q = findRideStartFilter.trim().toLowerCase();
    if (!q) return sortedStations;
    return sortedStations.filter((s) => s.name.toLowerCase().includes(q));
  }, [sortedStations, findRideStartFilter]);

  const distinctFindRideEndNames = useMemo(() => {
    const set = new Set<string>();
    for (const r of rideResults) {
      if (r.endName) set.add(r.endName);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [rideResults]);

  const filteredFindRideEndNames = useMemo(() => {
    const q = findRideEndFilter.trim().toLowerCase();
    if (!q) return distinctFindRideEndNames;
    return distinctFindRideEndNames.filter((n) => n.toLowerCase().includes(q));
  }, [distinctFindRideEndNames, findRideEndFilter]);

  const dataRangeLabel = useMemo(() => {
    const first = PUBLISHED_MONTHS[0];
    const last = PUBLISHED_MONTHS[PUBLISHED_MONTHS.length - 1];
    if (!first || !last) return '';
    const [fy, fm] = first.split('-').map(Number);
    const [ly, lm] = last.split('-').map(Number);
    const fmt = (y: number, m: number) =>
      new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return `${fmt(fy, fm)} – ${fmt(ly, lm)}`;
  }, []);

  useEffect(() => {
    if (!stationSearchOpen) return;
    const id = window.requestAnimationFrame(() => {
      if (searchMode === 'time') {
        timeTravelTextareaRef.current?.focus();
        timeTravelTextareaRef.current?.select();
      } else {
        findRideTimeTextareaRef.current?.focus();
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [stationSearchOpen, searchMode]);

  useEffect(() => {
    if (!stationSearchOpen || searchMode !== 'ride') return;
    if (!findRideStartName || rideSearchLoading) return;
    const id = window.requestAnimationFrame(() => {
      findRideEndFilterRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [findRideStartName, rideSearchLoading, stationSearchOpen, searchMode]);

  useEffect(() => {
    if (!stationSearchOpen) {
      exploreModalWasOpenRef.current = false;
      return;
    }
    const justOpened = !exploreModalWasOpenRef.current;
    exploreModalWasOpenRef.current = true;
    if (justOpened) {
      setRideSearchError(null);
      setRideSearchLoading(false);
      setRideResults([]);
      setFindRideTimeText(timeTravelText);
      setFindRideStartFilter('');
      setFindRideEndFilter('');
      setFindRideStartName(null);
      setStationStats(null);
    }
  }, [stationSearchOpen, timeTravelText]);

  useEffect(() => {
    const typingTarget = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setStationSearchOpen((o) => !o);
        return;
      }

      if (e.key === 'Escape') {
        if (spotlightTrip) {
          e.preventDefault();
          setSpotlightTrip(null);
          return;
        }
        if (stationSearchOpen) {
          e.preventDefault();
          return;
        }
        if (onRequestProjectDetails) {
          e.preventDefault();
          onRequestProjectDetails();
          return;
        }
        return;
      }

      if (e.code === 'Space' || e.key === ' ') {
        if (typingTarget(e.target)) return;
        e.preventDefault();
        setMapTimelinePaused((p) => !p);
        return;
      }

      if (typingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (!isLoading && trips.length > 0) pickRandomTrip();
        return;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    spotlightTrip,
    stationSearchOpen,
    isLoading,
    trips.length,
    pickRandomTrip,
  ]);

  const maxHourVal = Math.max(...HOUR_PROFILE);

  const handleSetHour = useCallback((h: number) => {
    setCurrentHour(h);
    bumpPlaybackReset();
  }, [bumpPlaybackReset]);

  useEffect(() => {
    if (playing) {
      const msPerSimHour = 60000 / SPEEDS[speedIdx];
      playIntervalRef.current = setInterval(() => {
        setCurrentHour(prev => (prev + 1) % 24);
      }, msPerSimHour);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [playing, speedIdx]);

  const togglePlay = () => setPlaying(p => !p);

  const cycleSpeed = () => {
    setSpeedIdx(i => (i + 1) % SPEEDS.length);
  };

  const spotlightStats = useMemo(
    () => (spotlightTrip ? tripStats(spotlightTrip) : null),
    [spotlightTrip],
  );

  const insights = useMemo(() => {
    if (trips.length === 0) return null;

    let totalMembers = 0;
    let totalEbike = 0;

    for (const t of trips) {
      if (t.color[0] === 0 && t.color[1] === 229) totalMembers++;
      if (t.isEbike) totalEbike++;
    }

    const memberPct = Math.round((totalMembers / trips.length) * 100);
    const ebikePct = Math.round((totalEbike / trips.length) * 100);

    return { memberPct, ebikePct };
  }, [trips]);

  return (
    <>
      {!embedded && (
        <Helmet>
          <title>Bike Share Toronto — Antonia Mugisa</title>
          <meta
            name="description"
            content="Interactive flow map of Toronto Bike Share trips, visualizing how the city moves throughout the day."
          />
        </Helmet>
      )}

      <div
        className={[
          'bs-page',
          embedded ? 'bs-page--embedded' : '',
          !embedded && portalFullscreen ? 'bs-page--fullscreen' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {!embedded && onRequestProjectDetails && (
          <button
            type="button"
            className="bs-fullscreen-exit"
            onClick={() => onRequestProjectDetails()}
            aria-label="Close demo and return to project"
          >
            <X className="bs-fullscreen-exit__icon" strokeWidth={2} aria-hidden />
          </button>
        )}
        <div className="bs-main">
          <div className="bs-map-stage">
          <MapView
            trips={trips}
            playbackWindow={playbackWindow}
            onTripCountChange={handleTripCountChange}
            playbackTimeMsRef={playbackTimeMsRef}
            paused={mapTimelinePaused}
            onFpsChange={handleMapFps}
            playbackResetNonce={playbackResetNonce}
            onAdvanceHour={handleAdvanceHour}
            onWarmNextHour={handleWarmNextHour}
            spotlightTrip={spotlightTrip}
            flyTo={mapFlyTo}
            selectedStationPin={selectedStationPin}
            onBearingChange={setMapBearing}
          />

          <div className="bs-map-clock-slot">
            <MapFloatingClock
              timeMsRef={playbackTimeMsRef}
              hasTrips={trips.length > 0}
              isLoading={isLoading}
              loadError={error}
            />
          </div>

          <div className="bs-map-controls-row">
            <div className="bs-rides-panel__tools" aria-label="Map controls">
              <button
                type="button"
                className="bs-tool-pill bs-tool-pill--icon-only"
                onClick={() => setStationSearchOpen(true)}
                title={`Search stations (${searchPaletteKbd})`}
                aria-label="Search stations"
              >
                <Search className="bs-tool-pill__glyph" strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                className="bs-tool-pill bs-tool-pill--icon-only"
                onClick={() => setMapTimelinePaused((p) => !p)}
                title={mapTimelinePaused ? 'Resume map animation (Space)' : 'Pause map animation (Space)'}
                aria-label={mapTimelinePaused ? 'Resume map animation' : 'Pause map animation'}
              >
                {mapTimelinePaused ? (
                  <Play className="bs-tool-pill__glyph" strokeWidth={2} aria-hidden />
                ) : (
                  <Pause className="bs-tool-pill__glyph" strokeWidth={2} aria-hidden />
                )}
              </button>
              <button
                type="button"
                className="bs-tool-pill bs-tool-pill--icon-only"
                onClick={pickRandomTrip}
                disabled={trips.length === 0 || isLoading}
                title="Random trip — show route and details (R)"
                aria-label="Random trip"
              >
                <Shuffle className="bs-tool-pill__glyph" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>

            <div className="bs-map-banners-stack">
            <div className="bs-active-rides-wrap" aria-label="Active rides">
              <ActiveRidesPanel
                graphData={rideGraphData}
                simTimeMs={simTimeForGraph}
                bearing={mapBearing}
                ridesCount={tripCount}
                fps={trips.length > 0 ? mapFps : null}
              />
            </div>

            <div className="bs-insights-banner" aria-label="Data insights">
              <div className="bs-insights-banner__title">Data Insights</div>
              {insights ? (
                <>
                  <div className="bs-insights-row" style={{ marginTop: 10 }}>
                    <span className="bs-insights-label">Rider split</span>
                  </div>
                  <div className="bs-insights-row">
                    <span className="bs-insights-label">Members</span>
                    <span className="bs-insights-value">~{insights.memberPct}%</span>
                  </div>
                  <div className="bs-stat-bar">
                    <div
                      className="bs-stat-bar-fill member"
                      style={{ width: `${insights.memberPct}%` }}
                    />
                  </div>
                  <div className="bs-insights-row">
                    <span className="bs-insights-label">Casual</span>
                    <span className="bs-insights-value">~{100 - insights.memberPct}%</span>
                  </div>
                  <div className="bs-stat-bar">
                    <div
                      className="bs-stat-bar-fill casual"
                      style={{ width: `${100 - insights.memberPct}%` }}
                    />
                  </div>

                  <div className="bs-insights-row" style={{ marginTop: 10 }}>
                    <span className="bs-insights-label">Bike type</span>
                  </div>
                  <div className="bs-insights-row">
                    <span className="bs-insights-label">Classic</span>
                    <span className="bs-insights-value">~{100 - insights.ebikePct}%</span>
                  </div>
                  <div className="bs-stat-bar">
                    <div
                      className="bs-stat-bar-fill"
                      style={{ width: `${100 - insights.ebikePct}%` }}
                    />
                  </div>
                  <div className="bs-insights-row">
                    <span className="bs-insights-label">E-bike</span>
                    <span className="bs-insights-value">~{insights.ebikePct}%</span>
                  </div>
                  <div className="bs-stat-bar">
                    <div
                      className="bs-stat-bar-fill ebike"
                      style={{ width: `${insights.ebikePct}%` }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="bs-insights-row" style={{ marginTop: 10 }}>
                    <span className="bs-insights-label">Rider split</span>
                  </div>
                  <div className="bs-stat-bar">
                    <div className="bs-stat-bar-fill" style={{ width: '0%' }} />
                  </div>
                  <div className="bs-insights-row" style={{ marginTop: 10 }}>
                    <span className="bs-insights-label">Bike type</span>
                  </div>
                  <div className="bs-stat-bar">
                    <div className="bs-stat-bar-fill" style={{ width: '0%' }} />
                  </div>
                  <div className="bs-stat-bar">
                    <div className="bs-stat-bar-fill" style={{ width: '0%' }} />
                  </div>
                </>
              )}

              <div className="bs-insights-banner__legend">
                <div className="bs-insights-banner__legend-title">Legend</div>
                <div className="bs-insights-banner__legend-items">
                  <div className="bs-legend-item">
                    <div className="bs-legend-dot bs-legend-dot--member" />
                    <div>
                      <div className="bs-legend-text">Member trip</div>
                      <div className="bs-legend-sub">Annual pass holder</div>
                    </div>
                  </div>
                  <div className="bs-legend-item">
                    <div className="bs-legend-dot bs-legend-dot--casual" />
                    <div>
                      <div className="bs-legend-text">Casual trip</div>
                      <div className="bs-legend-sub">Pay-per-ride</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

          {spotlightTrip && spotlightStats && (
            <div
              className="bs-trip-card-wrap"
              role="dialog"
              aria-labelledby="bs-trip-card-title"
            >
              <div className="bs-trip-card">
                <button
                  type="button"
                  className="bs-trip-card-dismiss"
                  onClick={() => setSpotlightTrip(null)}
                  aria-label="Close trip details"
                >
                  ×
                </button>
                <div className="bs-trip-card-head">
                  <div className="bs-trip-card-bike-row">
                    <span className="bs-trip-card-bike-label" id="bs-trip-card-title">
                      {spotlightTrip.isEbike ? 'Electric bike' : 'Classic bike'}
                    </span>
                    <span className="bs-trip-card-id" title={spotlightTrip.id}>
                      {shortTripId(spotlightTrip.id)}
                    </span>
                  </div>
                  <p className="bs-trip-card-route">
                    <span className="bs-trip-card-station">{spotlightTrip.startName}</span>
                    <span className="bs-trip-card-to">to</span>
                    <span className="bs-trip-card-station">{spotlightTrip.endName}</span>
                  </p>
                  <p className="bs-trip-card-time">
                    {formatTripClock(spotlightTrip.startedAtMs)} –{' '}
                    {formatTripClock(spotlightTrip.endedAtMs)}
                  </p>
                  <div className="bs-trip-card-metrics">
                    <span>{spotlightStats.durMin} min</span>
                    <span>{spotlightStats.miLabel} mi</span>
                    <span>{spotlightStats.mphLabel} mph</span>
                  </div>
                  <p className="bs-trip-card-member">
                    {spotlightTrip.memberCasual === 'member' ? 'Member' : 'Casual'} ride
                  </p>
                </div>
                <div className="bs-trip-card-foot">
                  <span className="bs-trip-card-kbd">
                    <span className="bs-trip-card-hint-desktop">
                      <kbd className="bs-kbd">Esc</kbd> to dismiss
                    </span>
                    <span className="bs-trip-card-hint-mobile">Tap × to dismiss</span>
                  </span>
                </div>
              </div>
            </div>
          )}
          </div>

          {stationSearchOpen && (
            <div
              className="bs-search-modal-wrap"
              role="dialog"
              aria-modal="true"
              aria-labelledby="bs-search-title"
              onClick={() => setStationSearchOpen(false)}
            >
              <div className="bs-search-modal" onClick={(e) => e.stopPropagation()}>
                <div className="bs-search-modal__head">
                  <div className="bs-search-modal__title" id="bs-search-title">
                    Explore
                  </div>
                  <button
                    type="button"
                    className="bs-search-modal__close"
                    onClick={() => setStationSearchOpen(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="bs-search-modal__tab-row">
                  <div
                    className="bs-search-modal__tablist"
                    role="tablist"
                    aria-label="Search mode"
                  >
                    <button
                      type="button"
                      role="tab"
                      id="bs-tab-time"
                      aria-selected={searchMode === 'time'}
                      aria-controls="bs-tabpanel-time"
                      className={`bs-search-modal__tab${searchMode === 'time' ? ' bs-search-modal__tab--active' : ''}`}
                      onClick={() => setSearchMode('time')}
                    >
                      <Clock className="bs-search-modal__tab-icon" strokeWidth={2} aria-hidden />
                      <span>Time travel</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      id="bs-tab-ride"
                      aria-selected={searchMode === 'ride'}
                      aria-controls="bs-tabpanel-ride"
                      className={`bs-search-modal__tab${searchMode === 'ride' ? ' bs-search-modal__tab--active' : ''}`}
                      onClick={() => setSearchMode('ride')}
                    >
                      <Search className="bs-search-modal__tab-icon" strokeWidth={2} aria-hidden />
                      <span>Find ride</span>
                    </button>
                  </div>
                </div>

                {searchMode === 'time' && (
                  <div
                    className="bs-search-modal__tab-panel"
                    id="bs-tabpanel-time"
                    role="tabpanel"
                    aria-labelledby="bs-tab-time"
                  >
                    <label className="bs-search-modal__prompt" htmlFor="bs-time-travel-input">
                      What time do you want to jump to?
                    </label>
                    <textarea
                      ref={timeTravelTextareaRef}
                      id="bs-time-travel-input"
                      className="bs-search-modal__textarea"
                      rows={3}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="e.g. 2025-01-01 4pm or July 4, 2019 8pm — last 3 hours"
                      value={timeTravelText}
                      onChange={(e) => setTimeTravelText(e.target.value)}
                    />
                    {timeTravelText.trim().length > 0 && !parsedTimeTravel.ok && (
                      <p className="bs-search-modal__parse-error" role="status">
                        {timeTravelParseErrorMessage(parsedTimeTravel)}
                      </p>
                    )}
                    <button
                      type="button"
                      className="bs-search-modal__primary"
                      onClick={jumpToSearchTime}
                      disabled={!parsedTimeTravel.ok || !parsedSearchMonthHour}
                    >
                      Go to this time
                    </button>
                    <div className="bs-search-modal__footer">
                      <p className="bs-search-modal__footer-line">
                        Processed{' '}
                        <span className="bs-search-modal__brand">Bike Share Toronto</span> trip
                        data spans {dataRangeLabel || 'published months'}.
                      </p>
                      <p className="bs-search-modal__footer-line bs-search-modal__footer-examples">
                        Try: <code>Jan 1 2025 4pm</code> or{' '}
                        <code>July 4, 2019 8pm — last 3 hours</code>. The optional “last N hours”
                        clause sets how wide the time window is when you search for a ride on the other
                        tab.
                      </p>
                    </div>
                  </div>
                )}

                {searchMode === 'ride' && (
                  <div
                    className="bs-search-modal__tab-panel"
                    id="bs-tabpanel-ride"
                    role="tabpanel"
                    aria-labelledby="bs-tab-ride"
                  >
                    <label className="bs-search-modal__prompt" htmlFor="bs-find-ride-time">
                      1. When did the trip start? (Toronto local time)
                    </label>
                    <textarea
                      ref={findRideTimeTextareaRef}
                      id="bs-find-ride-time"
                      className="bs-search-modal__textarea"
                      rows={2}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="e.g. 2025-01-01 4pm — last 2 hours"
                      value={findRideTimeText}
                      onChange={(e) => setFindRideTimeText(e.target.value)}
                    />
                    {findRideTimeText.trim().length > 0 && !parsedFindRide.ok && (
                      <p className="bs-search-modal__parse-error" role="status">
                        {timeTravelParseErrorMessage(parsedFindRide)}
                      </p>
                    )}

                    {parsedFindRide.ok && parsedFindRideMonthHour && !findRideMonthPublished && (
                      <p className="bs-search-modal__empty bs-search-modal__error" role="status">
                        That month is outside the published trip dataset (
                        {dataRangeLabel || 'see published range'}).
                      </p>
                    )}

                    {parsedFindRide.ok &&
                      parsedFindRideMonthHour &&
                      findRideMonthPublished &&
                      !findRideStartName && (
                        <>
                          <p className="bs-search-modal__ride-intro">
                            2. Choose a <strong>start</strong> station. A{' '}
                            <span className="bs-search-modal__green-dot-label">green dot</span> marks
                            it on the map. Add <code>— last N hours</code> above for a wider search
                            window around that moment.
                          </p>
                          <input
                            className="bs-search-modal__input"
                            type="search"
                            autoComplete="off"
                            placeholder="Filter start stations…"
                            value={findRideStartFilter}
                            onChange={(e) => setFindRideStartFilter(e.target.value)}
                          />
                        </>
                      )}

                    {parsedFindRide.ok &&
                      parsedFindRideMonthHour &&
                      findRideMonthPublished &&
                      findRideStartName && (
                        <>
                          <div className="bs-search-modal__find-ride-step-head">
                            <p className="bs-search-modal__hint bs-search-modal__hint--selected">
                              From: {findRideStartName}
                            </p>
                            <button
                              type="button"
                              className="bs-search-modal__text-btn"
                              onClick={() => {
                                setFindRideStartName(null);
                                setRideResults([]);
                                setStationStats(null);
                                setFindRideEndFilter('');
                                setRideSearchError(null);
                              }}
                            >
                              Change start
                            </button>
                          </div>
                          <p className="bs-search-modal__ride-intro">
                            3. Choose an <strong>end</strong> station. The ride closest to your time
                            is highlighted on the map.
                          </p>
                          <input
                            ref={findRideEndFilterRef}
                            className="bs-search-modal__input"
                            type="search"
                            autoComplete="off"
                            placeholder="Filter end stations…"
                            value={findRideEndFilter}
                            onChange={(e) => setFindRideEndFilter(e.target.value)}
                          />
                        </>
                      )}

                    {stationStats && findRideStartName && (
                      <div className="bs-search-modal__stats">
                        <div className="bs-search-modal__stats-row">
                          <span>Starts this hour</span>
                          <span className="bs-search-modal__stats-val">
                            {stationStats.startsInHour.toLocaleString()}
                          </span>
                        </div>
                        <div className="bs-search-modal__stats-row">
                          <span>Ends this hour</span>
                          <span className="bs-search-modal__stats-val">
                            {stationStats.endsInHour.toLocaleString()}
                          </span>
                        </div>
                        <div className="bs-search-modal__stats-row">
                          <span>Starts in month</span>
                          <span className="bs-search-modal__stats-val">
                            {stationStats.startsInMonth.toLocaleString()}
                          </span>
                        </div>
                        <div className="bs-search-modal__stats-row">
                          <span>Ends in month</span>
                          <span className="bs-search-modal__stats-val">
                            {stationStats.endsInMonth.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {rideSearchError && (
                      <p className="bs-search-modal__empty bs-search-modal__error">{rideSearchError}</p>
                    )}

                    <ul className="bs-search-modal__list bs-search-modal__list--stations" role="listbox">
                      {parsedFindRide.ok &&
                        parsedFindRideMonthHour &&
                        findRideMonthPublished &&
                        !findRideStartName &&
                        filteredFindRideStartStations.map((s) => (
                          <li key={s.id} role="none">
                            <button
                              type="button"
                              className={`bs-search-modal__row${selectedStationPin?.id === s.id ? ' bs-search-modal__row--station-active' : ''}`}
                              role="option"
                              disabled={rideSearchLoading}
                              onClick={() => {
                                if (!parsedFindRideMs) return;
                                setFindRideStartName(s.name);
                                setSelectedStationPin({
                                  id: s.id,
                                  lng: s.lng,
                                  lat: s.lat,
                                });
                                setMapFlyTo({
                                  lng: s.lng,
                                  lat: s.lat,
                                  zoom: 14,
                                  id: Date.now(),
                                });
                                void runStationStats(
                                  s.name,
                                  parsedFindRideMonthHour.monthKey,
                                  parsedFindRideMonthHour.hour,
                                );
                                void runRideSearchFromStation(s.name, {
                                  monthKey: parsedFindRideMonthHour.monthKey,
                                  hour: parsedFindRideMonthHour.hour,
                                  baseMs: parsedFindRideMs,
                                  windowHalfMs: parsedFindRide.windowHalfMs,
                                });
                              }}
                            >
                              {s.name}
                            </button>
                          </li>
                        ))}

                      {findRideStartName &&
                        parsedFindRideMonthHour &&
                        parsedFindRideMs &&
                        filteredFindRideEndNames.map((endName) => (
                          <li key={endName} role="none">
                            <button
                              type="button"
                              className="bs-search-modal__row"
                              role="option"
                              disabled={rideSearchLoading}
                              onClick={() =>
                                handlePickEndStation(
                                  endName,
                                  parsedFindRideMonthHour.monthKey,
                                  parsedFindRideMonthHour.hour,
                                  parsedFindRideMs,
                                )
                              }
                            >
                              {endName}
                            </button>
                          </li>
                        ))}
                    </ul>

                    {rideSearchLoading && (
                      <p className="bs-search-modal__empty">Searching…</p>
                    )}

                    {findRideStartName &&
                      !rideSearchLoading &&
                      rideResults.length === 0 &&
                      !rideSearchError && (
                        <p className="bs-search-modal__empty">
                          No rides from that start in this time window. Try widening the window (
                          <code>— last 3 hours</code>) or another time.
                        </p>
                      )}

                    {findRideStartName &&
                      rideResults.length > 0 &&
                      filteredFindRideEndNames.length === 0 && (
                        <p className="bs-search-modal__empty">No end stations match that filter.</p>
                      )}

                    {parsedFindRide.ok &&
                      parsedFindRideMonthHour &&
                      findRideMonthPublished &&
                      !findRideStartName &&
                      filteredFindRideStartStations.length === 0 &&
                      findRideStartFilter.trim() !== '' && (
                        <p className="bs-search-modal__empty">No stations match that filter.</p>
                      )}
                  </div>
                )}

                <p className="bs-search-modal__hint bs-search-modal__hint--dismiss">
                  Tap outside or use × to close
                </p>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          <div
            className="bs-loading-overlay"
            style={{ opacity: isLoading ? 1 : 0, pointerEvents: isLoading ? 'all' : 'none' }}
          >
            <div className="bs-loading-spinner" />
            <div className="bs-loading-text">{loadingMessage}</div>
            {error && <div className="bs-loading-error">{error}</div>}
          </div>

        </div>

      </div>
    </>
  );
}
