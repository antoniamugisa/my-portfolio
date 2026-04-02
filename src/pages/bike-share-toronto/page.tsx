import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useId,
  type MutableRefObject,
} from 'react';
import { Helmet } from 'react-helmet-async';
import { Clock, Pause, Play, Search, Shuffle, X } from 'lucide-react';
import MapView from './MapView';
import { type DeckTrip, HOUR_PROFILE, STATIONS } from './types';
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
import { PUBLISHED_MONTHS } from './publishedMonths';
import './bikeshare.css';

const SPEEDS = [1, 2, 4];
const TORONTO_TZ = 'America/Toronto';
const RIDES_SPARK_HOURS = 4;

/** Smooth cubic path through 2+ points (Catmull–Rom–style tangents → Bézier segments). */
function cubicBezierPathThrough(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0]!;
    return `M ${p.x} ${p.y}`;
  }
  const n = points.length;
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i]!;
    const p1 = points[i + 1]!;
    const pm = points[i - 1] ?? p0;
    const pp = points[i + 2] ?? p1;
    const cp1x = p0.x + (p1.x - pm.x) / 6;
    const cp1y = p0.y + (p1.y - pm.y) / 6;
    const cp2x = p1.x - (pp.x - p0.x) / 6;
    const cp2y = p1.y - (pp.y - p0.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

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
  const [ridesByHour, setRidesByHour] = useState<number[]>(() => Array(24).fill(0));
  const [currentMonth, setCurrentMonth] = useState(DEFAULT_MONTH);
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
  const [rideResultsQuery, setRideResultsQuery] = useState('');
  const [stationSearchQuery, setStationSearchQuery] = useState('');
  const [rideSearchLoading, setRideSearchLoading] = useState(false);
  const [rideSearchError, setRideSearchError] = useState<string | null>(null);
  const [selectedSearchStation, setSelectedSearchStation] = useState<string | null>(
    null,
  );
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
  const rideResultsInputRef = useRef<HTMLInputElement | null>(null);
  const sparkGradId = useId().replace(/:/g, '');

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
      allowAutoPickEmptyHour ? notifyAutoPickHour : undefined,
    );

  const handleWarmNextHour = useCallback(() => {
    const nextH = (currentHour + 1) % 24;
    return prefetchHourForMonth(currentMonth, nextH);
  }, [currentMonth, currentHour, prefetchHourForMonth]);

  const handleAdvanceHour = useCallback(async () => {
    const nextH = (currentHour + 1) % 24;
    try {
      await prefetchHourForMonth(currentMonth, nextH);
    } catch (e) {
      console.error('[BikeShare] prefetch next hour failed:', e);
    }
    setCurrentHour(nextH);
  }, [currentMonth, currentHour, prefetchHourForMonth]);

  const handleMapFps = useCallback((fps: number) => {
    setMapFps(fps);
  }, []);

  const handleTripCountChange = useCallback((count: number) => {
    setTripCount(count);
    // Active rides at the simulated clock (updates as the map hour plays).
    setRidesByHour((prev) => {
      if (prev[currentHour] === count) return prev;
      const next = prev.slice();
      next[currentHour] = count;
      return next;
    });
  }, [currentHour]);

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
    return { monthKey: `${year}-${month}`, hour: Number(hourStr) };
  }, [parsedSearchMs]);

  const jumpToSearchTime = useCallback(() => {
    if (!parsedSearchMonthHour) return;
    setCurrentMonth(parsedSearchMonthHour.monthKey);
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
    async (stationName: string) => {
      if (!parsedSearchMonthHour) return;
      const { monthKey, hour } = parsedSearchMonthHour;
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
    [parsedSearchMonthHour],
  );

  const runRideSearchFromStation = useCallback(
    async (stationName: string) => {
      if (!parsedSearchMonthHour || !parsedSearchMs) {
        setRideSearchError('Set a valid time in Time travel first.');
        return;
      }
      const { monthKey, hour } = parsedSearchMonthHour;
      const baseMs = parsedSearchMs;
      const windowHalfMs = parsedTimeTravel.ok
        ? parsedTimeTravel.windowHalfMs
        : 30 * 60 * 1000;
      setRideSearchLoading(true);
      setRideSearchError(null);
      setRideResults([]);
      setRideResultsQuery('');
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
          const mapped: RideSearchResult[] = rows.map((row) => ({
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
          }));
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
    [parsedSearchMonthHour, parsedSearchMs, parsedTimeTravel],
  );

  const handleSelectRideResult = useCallback(
    (r: RideSearchResult) => {
      if (!parsedSearchMonthHour) return;
      const { monthKey, hour } = parsedSearchMonthHour;
      const trip = deckTripFromDuckRow(r.row, monthKey, hour);
      if (!trip) return;
      setCurrentMonth(monthKey);
      setCurrentHour(hour);
      bumpPlaybackReset();
      setSpotlightTrip(trip);
      setStationSearchOpen(false);
    },
    [parsedSearchMonthHour, bumpPlaybackReset],
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

  const filteredStations = useMemo(() => {
    const q = stationSearchQuery.trim().toLowerCase();
    if (!q) return sortedStations;
    return sortedStations.filter((s) => s.name.toLowerCase().includes(q));
  }, [sortedStations, stationSearchQuery]);

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

  const filteredRideResults = useMemo(() => {
    const q = rideResultsQuery.trim().toLowerCase();
    if (!q) return rideResults;
    return rideResults.filter((r) => r.endName.toLowerCase().includes(q));
  }, [rideResults, rideResultsQuery]);

  useEffect(() => {
    if (!stationSearchOpen) return;
    const id = window.requestAnimationFrame(() => {
      if (searchMode === 'time') {
        timeTravelTextareaRef.current?.focus();
        timeTravelTextareaRef.current?.select();
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [stationSearchOpen, searchMode]);

  useEffect(() => {
    if (!stationSearchOpen) return;
    setRideSearchError(null);
    setRideSearchLoading(false);
    setRideResults([]);
    setRideResultsQuery('');
    setStationSearchQuery('');
    setSelectedSearchStation(null);
    setStationStats(null);
  }, [stationSearchOpen]);

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
          setStationSearchOpen(false);
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

  // When the hour jumps (slider/click/autoplay), seed that hour with the latest live count.
  useEffect(() => {
    setRidesByHour((prev) => {
      if (prev[currentHour] === tripCount) return prev;
      const next = prev.slice();
      next[currentHour] = tripCount;
      return next;
    });
  }, [currentHour, tripCount]);

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

  const spark = useMemo(() => {
    const endHour = currentHour;
    const hours = Array.from({ length: RIDES_SPARK_HOURS }, (_, i) => (endHour - (RIDES_SPARK_HOURS - 1 - i) + 24) % 24);
    const values = hours.map((h) => ridesByHour[h] ?? 0);
    const max = Math.max(1, ...values);

    const w = 140;
    const h = 44;
    const pad = 3;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;
    const dx = innerW / (values.length - 1);
    const basePoints = values.map((v, i) => {
      const x = pad + i * dx;
      const y = pad + (1 - v / max) * innerH;
      return { x, y };
    });

    const linePathD = cubicBezierPathThrough(basePoints);
    const bottom = h - pad;
    const first = basePoints[0]!;
    const last = basePoints[basePoints.length - 1]!;
    const areaPathD =
      linePathD.length > 0 ? `${linePathD} L ${last.x} ${bottom} L ${first.x} ${bottom} Z` : '';

    const labels = Array.from({ length: RIDES_SPARK_HOURS }, (_, i) => {
      const delta = RIDES_SPARK_HOURS - 1 - i;
      return delta === 0 ? 'Now' : `-${delta}h`;
    });

    return {
      linePathD,
      areaPathD,
      lastX: last.x,
      lastY: last.y,
      labels,
    };
  }, [ridesByHour, currentHour]);

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
            <div className="bs-rides-spark" aria-label="Rides over hours">
              <div className="bs-rides-spark__top">
                <div className="bs-rides-spark__stat">
                  <div className="bs-rides-spark__val">{tripCount}</div>
                  <div className="bs-rides-spark__lbl">Rides</div>
                </div>
                <div className="bs-rides-spark__fps">{trips.length > 0 ? `${mapFps} FPS` : '—'}</div>
              </div>
              <svg
                className="bs-rides-spark__svg"
                viewBox="0 0 140 44"
                role="img"
                aria-hidden
              >
                <defs>
                  <linearGradient
                    id={sparkGradId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="rgba(0,229,255,0.45)" />
                    <stop offset="48%" stopColor="rgba(0,229,255,0.12)" />
                    <stop offset="100%" stopColor="rgba(0,229,255,0)" />
                  </linearGradient>
                </defs>
                {spark.areaPathD ? (
                  <path
                    className="bs-rides-spark__area"
                    d={spark.areaPathD}
                    fill={`url(#${sparkGradId})`}
                  />
                ) : null}
                {spark.linePathD ? (
                  <path
                    className="bs-rides-spark__stroke"
                    d={spark.linePathD}
                    fill="none"
                    strokeWidth="1.85"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="nonScalingStroke"
                  />
                ) : null}
                <circle
                  className="bs-rides-spark__dot"
                  cx={spark.lastX}
                  cy={spark.lastY}
                  r={3}
                />
              </svg>
              <div className="bs-rides-spark__axis">
                {spark.labels.map((t) => (
                  <span key={t} className="bs-rides-spark__tick">
                    {t}
                  </span>
                ))}
              </div>
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
              <div
                className="bs-search-modal"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                  const el = e.target as HTMLElement;
                  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return;
                  if (el.closest('[role="tablist"]')) {
                    e.preventDefault();
                    setSearchMode((m) => (m === 'time' ? 'ride' : 'time'));
                  }
                }}
              >
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
                  <span className="bs-search-modal__tab-hint">
                    <kbd className="bs-kbd">Tab</kbd> to switch
                  </span>
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
                        <code>July 4, 2019 8pm — last 3 hours</code> (window centers on that moment;
                        wider window = more rides loaded around it in Find ride).
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
                    <p className="bs-search-modal__ride-intro">
                      Pick a station from the list — a{' '}
                      <span className="bs-search-modal__green-dot-label">green dot</span> marks it on
                      the map. Set the time window in <strong>Time travel</strong> first; ride search
                      uses that instant plus the optional “last N hours” span from your text.
                    </p>

                    {selectedSearchStation && (
                      <p className="bs-search-modal__hint bs-search-modal__hint--selected">
                        Selected station: {selectedSearchStation}
                      </p>
                    )}

                    {stationStats && (
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

                    {rideResults.length > 0 && (
                      <input
                        ref={rideResultsInputRef}
                        className="bs-search-modal__input"
                        type="search"
                        autoComplete="off"
                        placeholder="Filter results by end station…"
                        value={rideResultsQuery}
                        onChange={(e) => setRideResultsQuery(e.target.value)}
                      />
                    )}

                    {rideResults.length === 0 && (
                      <input
                        className="bs-search-modal__input"
                        type="search"
                        autoComplete="off"
                        placeholder="Filter stations…"
                        value={stationSearchQuery}
                        onChange={(e) => setStationSearchQuery(e.target.value)}
                      />
                    )}

                    <ul className="bs-search-modal__list bs-search-modal__list--stations" role="listbox">
                      {rideResults.length === 0 &&
                        filteredStations.map((s) => (
                          <li key={s.id} role="none">
                            <button
                              type="button"
                              className={`bs-search-modal__row${selectedStationPin?.id === s.id ? ' bs-search-modal__row--station-active' : ''}`}
                              role="option"
                              onClick={() => {
                                setSelectedSearchStation(s.name);
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
                                runStationStats(s.name);
                                runRideSearchFromStation(s.name);
                              }}
                              disabled={!parsedTimeTravel.ok || rideSearchLoading}
                              title={
                                !parsedTimeTravel.ok
                                  ? 'Enter a valid time in Time travel first'
                                  : undefined
                              }
                            >
                              {s.name}
                            </button>
                          </li>
                        ))}

                      {rideResults.length > 0 &&
                        filteredRideResults.map((r) => (
                          <li key={r.id} role="none">
                            <button
                              type="button"
                              className="bs-search-modal__row"
                              role="option"
                              onClick={() => handleSelectRideResult(r)}
                            >
                              <div className="bs-search-modal__ride-result">
                                <span className="bs-search-modal__ride-end">{r.endName}</span>
                                <span className="bs-search-modal__ride-time">
                                  {new Intl.DateTimeFormat('en-US', {
                                    timeZone: TORONTO_TZ,
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  }).format(new Date(r.startedAtMs))}
                                </span>
                              </div>
                            </button>
                          </li>
                        ))}
                    </ul>

                    {rideSearchLoading && (
                      <p className="bs-search-modal__empty">Searching…</p>
                    )}

                    {rideResults.length > 0 && filteredRideResults.length === 0 && (
                      <p className="bs-search-modal__empty">No rides match that filter.</p>
                    )}

                    {rideResults.length === 0 &&
                      filteredStations.length === 0 &&
                      stationSearchQuery.trim() !== '' && (
                        <p className="bs-search-modal__empty">No stations match that filter.</p>
                      )}
                  </div>
                )}

                <p className="bs-search-modal__hint bs-search-modal__hint--dismiss">
                  <span className="bs-search-hint-desktop">
                    <kbd className="bs-kbd">Esc</kbd> to close
                  </span>
                  <span className="bs-search-hint-mobile">Tap outside to close</span>
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
