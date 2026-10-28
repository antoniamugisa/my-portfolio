import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type MutableRefObject,
} from 'react';
import { Helmet } from 'react-helmet-async';
import { X } from 'lucide-react';
import MapView from './MapView';
import { RidesPanel, type HourInsights } from './RidesPanel';
import { TimelineDock } from './TimelineDock';
import { TripCard } from './TripCard';
import { ExploreSheet } from './ExploreSheet';
import type { DeckTrip, StationLocation } from './types';
import { deckTripFromDuckRow, useTripStream } from './useTripStream';
import { fetchHourlyRideCounts, type RideRow } from './queries';
import { isPublishedParquetMonth, PUBLISHED_RANGE_LABEL } from './publishedMonths';
import { getPlaybackHourWindow, nextPlaybackSlice, torontoSliceAt } from './torontoTime';
import './bikeshare.css';

const SPEEDS = [1, 2, 4];
const TORONTO_TZ = 'America/Toronto';
const DEFAULT_MONTH = '2025-01';
/** Start a followed ride this many ms before it leaves the dock, so you see it set off. */
const RIDE_LEAD_IN_MS = 20_000;
const SLOW_LOADING_THRESHOLD_MS = 5000;

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TORONTO_TZ,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
const monthFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TORONTO_TZ,
  month: 'long',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TORONTO_TZ,
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

/** Date + time of the playback clock. A month-wide hour is labelled as such, not as the 1st. */
function MapClock({
  timeMsRef,
  monthWide,
  hasTrips,
}: {
  timeMsRef: MutableRefObject<number>;
  monthWide: boolean;
  hasTrips: boolean;
}) {
  const [label, setLabel] = useState({ date: '', time: '--:--:--' });

  useEffect(() => {
    if (!hasTrips) {
      setLabel({ date: '', time: '--:--:--' });
      return;
    }
    let lastSecond: number | null = null;
    const update = () => {
      const ms = timeMsRef.current;
      if (!ms) return;
      const second = Math.floor(ms / 1000);
      if (second === lastSecond) return;
      lastSecond = second;
      const d = new Date(second * 1000);
      setLabel({
        date: monthWide ? `Every day in ${monthFormatter.format(d)}` : dateFormatter.format(d),
        time: timeFormatter.format(d),
      });
    };
    update();
    const id = window.setInterval(update, 50);
    return () => window.clearInterval(id);
  }, [timeMsRef, hasTrips, monthWide]);

  return (
    <div className="bs-clock" aria-live="off">
      <div className="bs-clock__date">{label.date || ' '}</div>
      <div className="bs-clock__time">{label.time}</div>
    </div>
  );
}

/** Small non-blocking status under the clock while trips load, or when they fail. */
function LoadingPill({ isLoading, message, error }: { isLoading: boolean; message: string; error: string | null }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      setSlow(false);
      return;
    }
    const t = window.setTimeout(() => setSlow(true), SLOW_LOADING_THRESHOLD_MS);
    return () => window.clearTimeout(t);
  }, [isLoading]);

  if (error && !isLoading) {
    return (
      <div className="bs-loading-pill bs-loading-pill--error" role="alert" title={error}>
        Couldn't load trip data. Check your connection and reload.
      </div>
    );
  }
  if (!isLoading) return null;
  return (
    <div className="bs-loading-pill" role="status">
      <span className="bs-loading-pill__spinner" aria-hidden />
      <span>
        {message || 'Loading trips…'}
        {slow && <span className="bs-loading-pill__slow"> This can take ~20 s on a slow connection.</span>}
      </span>
    </div>
  );
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function computeInsights(trips: DeckTrip[], hourWindow: { min: number; max: number }): HourInsights | null {
  if (trips.length === 0) return null;
  let members = 0;
  let ebikes = 0;
  const durationsMin: number[] = [];
  const starts = new Map<string, number>();
  for (const t of trips) {
    if (t.memberCasual === 'member') members++;
    if (t.isEbike) ebikes++;
    durationsMin.push((t.endedAtMs - t.startedAtMs) / 60000);
    // Month-wide hours overlay many days, so judge "this hour" by the time of day only.
    const offset = ((t.startedAtMs - hourWindow.min) % 86400000 + 86400000) % 86400000;
    if (offset < 3600000) starts.set(t.startName, (starts.get(t.startName) ?? 0) + 1);
  }
  let busiest: HourInsights['busiestStation'] = null;
  for (const [name, n] of starts) {
    if (!busiest || n > busiest.starts) busiest = { name, starts: n };
  }
  return {
    memberPct: Math.round((members / trips.length) * 100),
    ebikePct: Math.round((ebikes / trips.length) * 100),
    medianMin: Math.max(1, Math.round(median(durationsMin))),
    busiestStation: busiest,
  };
}

function useIsNarrow(): boolean {
  const query = '(max-width: 767px)';
  const [narrow, setNarrow] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setNarrow(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
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
  const [currentMonth, setCurrentMonth] = useState(DEFAULT_MONTH);
  /** Toronto day being played (set by time travel / ride pick); null = hour sampled across the month. */
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [currentHour, setCurrentHour] = useState(0);
  const [paused, setPaused] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [ridingNow, setRidingNow] = useState(0);
  const [debug, setDebug] = useState(false);
  const [mapFps, setMapFps] = useState<number | null>(null);
  const [mapBearing, setMapBearing] = useState(0);
  const [resetNorthNonce, setResetNorthNonce] = useState(0);
  /** Bumps when the user picks a time so the map clock snaps to `seekTimeMs` (or the top of the hour). */
  const [playbackResetNonce, setPlaybackResetNonce] = useState(0);
  const [seekTimeMs, setSeekTimeMs] = useState<number | null>(null);
  const [spotlightTrip, setSpotlightTrip] = useState<DeckTrip | null>(null);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [exploreOpenedAtMs, setExploreOpenedAtMs] = useState(0);
  const [stationPin, setStationPin] = useState<StationLocation | null>(null);
  const [mapFlyTo, setMapFlyTo] = useState<{ lng: number; lat: number; zoom?: number; id: number } | null>(null);
  const [hourly, setHourly] = useState<{ key: string; counts: number[] } | null>(null);
  const playbackTimeMsRef = useRef(0);
  /** A ride picked for an hour that is still loading: kept until that hour's trips arrive. */
  const pendingSpotlightRef = useRef<{ id: string; windowMin: number } | null>(null);
  const isNarrow = useIsNarrow();

  /** Ref + stable callback avoids TDZ / HMR edge cases around `useTripStream(..., cb)`. */
  const autoPickHourRef = useRef<(hour: number) => void>(() => {});
  autoPickHourRef.current = (hour: number) => {
    setCurrentHour(hour);
    setSeekTimeMs(null);
    setPlaybackResetNonce((n) => n + 1);
  };
  const notifyAutoPickHour = useCallback((hour: number) => {
    autoPickHourRef.current(hour);
  }, []);

  // Keep the initial view pinned to midnight Jan 1, 2025: the auto-pick fallback (for empty
  // hours in partial months) must not override the requested starting point on first load.
  const allowAutoPickEmptyHour = !(currentMonth === DEFAULT_MONTH && currentHour === 0);

  const { trips, isSampled, isLoading, loadingMessage, error, playbackWindow, prefetchHourForMonth } =
    useTripStream(currentMonth, currentHour, currentDay, allowAutoPickEmptyHour ? notifyAutoPickHour : undefined);

  /** Move playback to a month/day/hour, optionally starting at an exact moment inside it. */
  const goToSlice = useCallback(
    (slice: { month: string; day: number | null; hour: number }, atMs: number | null = null) => {
      setCurrentMonth(slice.month);
      setCurrentDay(slice.day);
      setCurrentHour(slice.hour);
      setSeekTimeMs(atMs);
      setPlaybackResetNonce((n) => n + 1);
    },
    [],
  );

  /** Next hour of playback; a day that runs past the last published month loops back to the 1st of this month. */
  const nextSlice = useMemo(() => {
    const next = nextPlaybackSlice({ month: currentMonth, day: currentDay, hour: currentHour });
    if (next.month !== currentMonth && !isPublishedParquetMonth(next.month)) {
      return { month: currentMonth, day: 1, hour: 0 };
    }
    return next;
  }, [currentMonth, currentDay, currentHour]);

  const handleWarmNextHour = useCallback(
    () => prefetchHourForMonth(nextSlice.month, nextSlice.hour, nextSlice.day),
    [nextSlice, prefetchHourForMonth],
  );

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

  // Rides per hour for the timeline: the real day, or the month's average day.
  const hourlyKey = `${currentMonth}|${currentDay ?? '*'}`;
  useEffect(() => {
    if (!isPublishedParquetMonth(currentMonth)) return;
    let cancelled = false;
    fetchHourlyRideCounts(currentMonth, currentDay)
      .then((counts) => {
        if (!cancelled) setHourly({ key: hourlyKey, counts });
      })
      .catch((e) => console.error('[BikeShare] hourly counts failed:', e));
    return () => {
      cancelled = true;
    };
  }, [currentMonth, currentDay, hourlyKey]);

  // Keep the followed ride in step with the loaded hour.
  useEffect(() => {
    if (!spotlightTrip || isLoading || trips.length === 0) return;
    const match = trips.find((t) => t.id === spotlightTrip.id);
    const pending = pendingSpotlightRef.current;
    if (pending && pending.id === spotlightTrip.id) {
      // Still showing the previous hour; wait for the ride's own hour to load.
      if (playbackWindow.min !== pending.windowMin) return;
      pendingSpotlightRef.current = null;
      // A ride outside this hour's random sample is still drawn from its own row.
      if (!match) return;
    }
    // Swap in this hour's copy: timestamps are relative to the playback hour, so a ride that
    // carries over into the next hour needs the new hour's version.
    if (!match) setSpotlightTrip(null);
    else if (match !== spotlightTrip) setSpotlightTrip(match);
  }, [trips, isLoading, spotlightTrip, playbackWindow.min]);

  const followRide = useCallback(
    (row: Record<string, unknown>, startedAtMs: number) => {
      const slice = torontoSliceAt(startedAtMs);
      const trip = deckTripFromDuckRow(row, slice.month, slice.hour, slice.day);
      if (!trip) return;
      const hourWindow = getPlaybackHourWindow(slice.month, slice.hour, slice.day);
      pendingSpotlightRef.current = { id: trip.id, windowMin: hourWindow.min };
      setSpotlightTrip(trip);
      goToSlice(slice, Math.max(hourWindow.min, startedAtMs - RIDE_LEAD_IN_MS));
    },
    [goToSlice],
  );

  const handlePickRide = useCallback(
    (ride: RideRow) => {
      setExploreOpen(false);
      setStationPin(null);
      followRide(ride.row, ride.startedAtMs);
    },
    [followRide],
  );

  const handleJumpToTime = useCallback(
    (atMs: number) => {
      const slice = torontoSliceAt(atMs);
      if (!isPublishedParquetMonth(slice.month)) return;
      setExploreOpen(false);
      setStationPin(null);
      setSpotlightTrip(null);
      goToSlice(slice, atMs);
    },
    [goToSlice],
  );

  const handleJumpToRideStart = useCallback(() => {
    if (!spotlightTrip) return;
    const slice = torontoSliceAt(spotlightTrip.startedAtMs);
    const hourWindow = getPlaybackHourWindow(slice.month, slice.hour, slice.day);
    pendingSpotlightRef.current = { id: spotlightTrip.id, windowMin: hourWindow.min };
    setPaused(false);
    goToSlice(slice, Math.max(hourWindow.min, spotlightTrip.startedAtMs - RIDE_LEAD_IN_MS));
  }, [spotlightTrip, goToSlice]);

  const handlePickHour = useCallback(
    (hour: number) => {
      setSpotlightTrip(null);
      goToSlice({ month: currentMonth, day: currentDay, hour });
    },
    [currentMonth, currentDay, goToSlice],
  );

  const handlePreviewStation = useCallback((s: StationLocation | null) => {
    setStationPin(s);
    if (s) setMapFlyTo({ lng: s.lng, lat: s.lat, zoom: 14.5, id: Date.now() });
  }, []);

  /** Prefer a ride that is on the map right now, so the card isn't for a ride that already ended. */
  const pickRandomTrip = useCallback(() => {
    if (trips.length === 0) return;
    const rel = playbackTimeMsRef.current - playbackWindow.min;
    const active = trips.filter((t) => {
      const ts = t.timestamps;
      return ts.length >= 2 && ts[0]! <= rel && rel < ts[ts.length - 1]! - 60000;
    });
    const pool = active.length > 0 ? active : trips;
    pendingSpotlightRef.current = null;
    setSpotlightTrip(pool[Math.floor(Math.random() * pool.length)]!);
  }, [trips, playbackWindow.min]);

  const openExplore = useCallback(() => {
    setExploreOpenedAtMs(playbackTimeMsRef.current || getPlaybackHourWindow(currentMonth, currentHour, currentDay).min);
    setExploreOpen(true);
  }, [currentMonth, currentHour, currentDay]);

  const closeExplore = useCallback(() => {
    setExploreOpen(false);
    setStationPin(null);
  }, []);

  const searchShortcut = useMemo(() => {
    if (typeof navigator === 'undefined') return '⌘K';
    return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? '⌘K' : 'Ctrl K';
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (exploreOpen) closeExplore();
        else openExplore();
        return;
      }

      // Esc closes the top-most layer first, and only then leaves the demo.
      if (e.key === 'Escape') {
        e.preventDefault();
        if (exploreOpen) closeExplore();
        else if (spotlightTrip) setSpotlightTrip(null);
        else onRequestProjectDetails?.();
        return;
      }

      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.code === 'Space' || e.key === ' ') {
        // Let a focused button handle its own Space press.
        if ((e.target as HTMLElement | null)?.tagName === 'BUTTON') return;
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (!isLoading) pickRandomTrip();
      } else if (e.key === 'd' || e.key === 'D') {
        setDebug((d) => !d);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exploreOpen, spotlightTrip, isLoading, pickRandomTrip, openExplore, closeExplore, onRequestProjectDetails]);

  const handleMapFps = useCallback((fps: number) => setMapFps(fps), []);
  const handleRidingNowChange = useCallback((count: number) => setRidingNow(count), []);
  const handleResetNorth = useCallback(() => setResetNorthNonce((n) => n + 1), []);

  const insights = useMemo(() => computeInsights(trips, playbackWindow), [trips, playbackWindow]);

  /** Keep flights and route fits clear of the sheet, the trip card and the dock. */
  const overlayPadding = useMemo(() => {
    if (isNarrow) {
      return exploreOpen
        ? { top: 70, bottom: Math.round(window.innerHeight * 0.62), left: 24, right: 24 }
        : { top: 80, bottom: 330, left: 24, right: 24 };
    }
    return { top: 90, bottom: 250, left: exploreOpen ? 420 : 60, right: 260 };
  }, [isNarrow, exploreOpen]);

  const hourlyCounts = hourly?.key === hourlyKey ? hourly.counts : null;

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
          exploreOpen ? 'bs-page--sheet-open' : '',
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
              onTripCountChange={handleRidingNowChange}
              playbackTimeMsRef={playbackTimeMsRef}
              paused={paused}
              onFpsChange={debug ? handleMapFps : undefined}
              playbackResetNonce={playbackResetNonce}
              seekTimeMs={seekTimeMs}
              onAdvanceHour={handleAdvanceHour}
              onWarmNextHour={handleWarmNextHour}
              spotlightTrip={spotlightTrip}
              flyTo={mapFlyTo}
              selectedStationPin={stationPin}
              onBearingChange={setMapBearing}
              speed={SPEEDS[speedIdx]}
              resetNorthNonce={resetNorthNonce}
              overlayPadding={overlayPadding}
            />

            <div className="bs-top-center">
              <MapClock timeMsRef={playbackTimeMsRef} monthWide={currentDay === null} hasTrips={trips.length > 0} />
              <LoadingPill isLoading={isLoading} message={loadingMessage} error={error} />
            </div>

            <div className="bs-panel-slot">
              <RidesPanel
                ridingNow={ridingNow}
                sampled={isSampled}
                monthWide={currentDay === null}
                insights={insights}
                bearing={mapBearing}
                onResetNorth={handleResetNorth}
                fps={debug ? mapFps : null}
              />
            </div>

            {spotlightTrip && (
              <TripCard
                trip={spotlightTrip}
                playbackTimeMsRef={playbackTimeMsRef}
                onClose={() => setSpotlightTrip(null)}
                onJumpToStart={handleJumpToRideStart}
              />
            )}

            <div className="bs-dock-slot">
              <TimelineDock
                hourlyCounts={hourlyCounts}
                averaged={currentDay === null}
                currentHour={currentHour}
                hourStartMs={playbackWindow.min}
                playbackTimeMsRef={playbackTimeMsRef}
                paused={paused}
                speed={SPEEDS[speedIdx]!}
                searchShortcut={searchShortcut}
                randomDisabled={trips.length === 0 || isLoading}
                onPickHour={handlePickHour}
                onTogglePause={() => setPaused((p) => !p)}
                onCycleSpeed={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
                onOpenSearch={() => (exploreOpen ? closeExplore() : openExplore())}
                onRandomTrip={pickRandomTrip}
              />
            </div>

            {exploreOpen && (
              <ExploreSheet
                initialTimeMs={exploreOpenedAtMs}
                dataRangeLabel={PUBLISHED_RANGE_LABEL}
                onClose={closeExplore}
                onJumpToTime={handleJumpToTime}
                onPickRide={handlePickRide}
                onPreviewStation={handlePreviewStation}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
