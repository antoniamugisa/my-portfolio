import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type MutableRefObject,
} from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, ChevronRight, Dices } from 'lucide-react';
import MapView from './MapView';
import { type DeckTrip, HOUR_PROFILE, PERIOD_LABELS, STATIONS } from './types';
import { PUBLISHED_MONTHS } from './publishedMonths';
import { useTripStream, monthLabel } from './useTripStream';
import './bikeshare.css';

const SPEEDS = [1, 2, 4];
const TORONTO_TZ = 'America/Toronto';

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

const AVAILABLE_MONTHS = [...PUBLISHED_MONTHS];

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

export default function BikeShareTorontoPage() {
  const [currentHour, setCurrentHour] = useState(8);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [tripCount, setTripCount] = useState(0);
  const [currentMonth, setCurrentMonth] = useState('2025-07');
  const [mapTimelinePaused, setMapTimelinePaused] = useState(false);
  const [mapFps, setMapFps] = useState(0);
  /** Bumps when the user picks a month/hour so the map clock snaps to that window (not when the hour auto-advances). */
  const [playbackResetNonce, setPlaybackResetNonce] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [spotlightTrip, setSpotlightTrip] = useState<DeckTrip | null>(null);

  const { trips, totalTrips, isLoading, loadingMessage, error, playbackWindow } =
    useTripStream(currentMonth, currentHour);

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackTimeMsRef = useRef(0);

  const bumpPlaybackReset = useCallback(() => {
    setPlaybackResetNonce((n) => n + 1);
  }, []);

  const handleAdvanceHour = useCallback(() => {
    setCurrentHour((h) => (h + 1) % 24);
  }, []);

  const handleMapFps = useCallback((fps: number) => {
    setMapFps(fps);
  }, []);

  const pickRandomTrip = useCallback(() => {
    if (trips.length === 0) return;
    setSpotlightTrip(trips[Math.floor(Math.random() * trips.length)]!);
  }, [trips]);

  useEffect(() => {
    if (isLoading) setSpotlightTrip(null);
  }, [isLoading]);

  useEffect(() => {
    if (!spotlightTrip) return;
    if (!trips.some((t) => t.id === spotlightTrip.id)) {
      setSpotlightTrip(null);
    }
  }, [trips, spotlightTrip]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (!spotlightTrip) return;
      e.preventDefault();
      setSpotlightTrip(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [spotlightTrip]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      const el = e.target as HTMLElement | null;
      if (!el) return;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      setMapTimelinePaused((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
      <Helmet>
        <title>Bike Share Toronto — Antonia Mugisa</title>
        <meta
          name="description"
          content="Interactive flow map of Toronto Bike Share trips, visualizing how the city moves throughout the day."
        />
      </Helmet>

      <div className="bs-page">

        {/* Header */}
        <header className="bs-header">
          <div className="bs-logo">
            <div className="bs-logo-icon">🚲</div>
            <div>
              <div className="bs-title">BIKE SHARE TORONTO</div>
              <div className="bs-subtitle">
                Trip Flow Visualizer — {monthLabel(currentMonth)}
              </div>
            </div>
          </div>

          <div className="bs-stats-row">
            <div className="bs-stat">
              <div className="bs-stat-value">{tripCount}</div>
              <div className="bs-stat-label">Active Trips</div>
            </div>
            <div className="bs-stat">
              <div className="bs-stat-value">
                {totalTrips > 0 ? totalTrips.toLocaleString() : '—'}
              </div>
              <div className="bs-stat-label">Monthly Total</div>
            </div>
            <div className="bs-stat">
              <div className="bs-stat-value">{STATIONS.length}</div>
              <div className="bs-stat-label">Stations</div>
            </div>
          </div>
        </header>

        {/* Main */}
        <div className="bs-main">
          <div className="bs-map-stage">
          <MapView
            trips={trips}
            playbackWindow={playbackWindow}
            onTripCountChange={setTripCount}
            playbackTimeMsRef={playbackTimeMsRef}
            paused={mapTimelinePaused}
            onFpsChange={handleMapFps}
            playbackResetNonce={playbackResetNonce}
            onAdvanceHour={handleAdvanceHour}
            spotlightTrip={spotlightTrip}
          />

          <div className="bs-map-hud">
            <div className="bs-map-hud-left">
              <button
                type="button"
                className="bs-map-hud-btn"
                onClick={() => setMapTimelinePaused((p) => !p)}
                title={mapTimelinePaused ? 'Resume map animation (Space)' : 'Pause map animation (Space)'}
              >
                {mapTimelinePaused ? '▶' : '⏸'}
              </button>
              <span className="bs-map-hud-kbd">Space</span>
              <button
                type="button"
                className="bs-map-hud-btn"
                onClick={pickRandomTrip}
                disabled={trips.length === 0 || isLoading}
                title="Random trip — show route and details"
                aria-label="Random trip"
              >
                <Dices className="bs-map-hud-icon" strokeWidth={2} />
              </button>
            </div>
            <MapFloatingClock
              timeMsRef={playbackTimeMsRef}
              hasTrips={trips.length > 0}
              isLoading={isLoading}
              loadError={error}
            />
            <div className="bs-map-hud-right">
              <div className="bs-map-hud-stat">
                <span className="bs-map-hud-stat-val">{tripCount}</span>
                <span className="bs-map-hud-stat-lbl">trips</span>
              </div>
              <div className="bs-map-hud-stat">
                <span className="bs-map-hud-stat-val">{trips.length > 0 ? mapFps : '—'}</span>
                <span className="bs-map-hud-stat-lbl">FPS</span>
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
                    <kbd className="bs-kbd">Esc</kbd> to dismiss
                  </span>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Loading overlay */}
          <div
            className="bs-loading-overlay"
            style={{ opacity: isLoading ? 1 : 0, pointerEvents: isLoading ? 'all' : 'none' }}
          >
            <div className="bs-loading-spinner" />
            <div className="bs-loading-text">{loadingMessage}</div>
            {error && <div className="bs-loading-error">{error}</div>}
          </div>

          <div
            className={`bs-sidebar-shell${sidebarOpen ? '' : ' bs-sidebar-shell--collapsed'}`}
          >
            <button
              type="button"
              className="bs-sidebar-toggle"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-expanded={sidebarOpen}
              aria-controls="bs-controls-panel"
              aria-label={sidebarOpen ? 'Collapse controls panel' : 'Expand controls panel'}
            >
              {sidebarOpen ? (
                <ChevronRight className="bs-sidebar-toggle-icon" strokeWidth={2} />
              ) : (
                <ChevronLeft className="bs-sidebar-toggle-icon" strokeWidth={2} />
              )}
            </button>
            <div className="bs-sidebar-clip">
            <aside
              id="bs-controls-panel"
              className="bs-sidebar"
              aria-hidden={!sidebarOpen}
            >

            {/* Time of Day */}
            <section className="bs-section">
              <h3 className="bs-section-title">Time of Day</h3>
              <div className="bs-sidebar-live-hint">
                <span className="bs-time-label" style={{ marginBottom: 8 }}>
                  {PERIOD_LABELS[currentHour]}
                </span>
                <span className="bs-muted-small">
                  Clock runs forward across the day; Space pauses · pick hour/month to jump
                </span>
              </div>

              <div className="bs-random-trip-block">
                <button
                  type="button"
                  className="bs-btn bs-btn-primary bs-btn-block"
                  onClick={pickRandomTrip}
                  disabled={trips.length === 0 || isLoading}
                >
                  Random trip
                </button>
                <p className="bs-random-trip-hint">
                  Highlights one route and opens details. Esc or × to close.
                </p>
              </div>

              {/* Hour bars */}
              <div className="bs-hour-bars">
                {HOUR_PROFILE.map((val, h) => {
                  const pct = val / maxHourVal;
                  const alpha = 0.12 + pct * 0.55;
                  return (
                    <button
                      key={h}
                      className={`bs-hour-bar ${h === currentHour ? 'active' : ''}`}
                      style={{
                        height: `${pct * 100}%`,
                        background: `rgba(255,255,255,${alpha})`,
                      }}
                      onClick={() => handleSetHour(h)}
                      title={`${String(h).padStart(2,'0')}:00`}
                    />
                  );
                })}
              </div>

              {/* Slider */}
              <input
                type="range"
                className="bs-slider"
                min={0}
                max={23}
                value={currentHour}
                onChange={e => handleSetHour(Number(e.target.value))}
              />

              {/* Play controls */}
              <div className="bs-play-row">
                <button className="bs-btn bs-btn-primary" onClick={togglePlay}>
                  {playing ? '⏸ HOUR' : '▶ HOUR'}
                </button>
                <button className="bs-btn" onClick={cycleSpeed}>
                  {SPEEDS[speedIdx]}×
                </button>
              </div>
            </section>

            {/* Data source */}
            <section className="bs-section">
              <h3 className="bs-section-title">Data</h3>
              <select
                className="bs-month-select"
                value={currentMonth}
                onChange={e => {
                  setCurrentMonth(e.target.value);
                  bumpPlaybackReset();
                }}
                disabled={isLoading}
              >
                {AVAILABLE_MONTHS.map(m => (
                  <option key={m} value={m}>{monthLabel(m)}</option>
                ))}
              </select>
              <div className="bs-data-status">
                {isLoading ? (
                  <span className="bs-data-status-loading">Loading…</span>
                ) : error ? (
                  <span className="bs-data-status-error">{error}</span>
                ) : (
                  <span className="bs-data-status-ok">
                    {totalTrips.toLocaleString()} trips loaded
                  </span>
                )}
              </div>
            </section>

            {/* 24h Activity */}
            <section className="bs-section">
              <h3 className="bs-section-title">24h Activity</h3>
              <div className="bs-activity-chart">
                {HOUR_PROFILE.map((val, h) => {
                  const pct = val / maxHourVal;
                  return (
                    <div
                      key={h}
                      className="bs-activity-bar"
                      style={{
                        height: `${Math.max(4, pct * 100)}%`,
                        background: h === currentHour
                          ? 'var(--bs-chart-active)'
                          : 'var(--bs-chart-inactive)',
                      }}
                    />
                  );
                })}
              </div>
            </section>

            {/* Data Insights */}
            <section className="bs-section">
              <h3 className="bs-section-title">Data Insights</h3>
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
                    <div className="bs-stat-bar-fill casual" style={{ width: `${100 - insights.memberPct}%` }} />
                  </div>

                  <div className="bs-insights-row" style={{ marginTop: 10 }}>
                    <span className="bs-insights-label">Bike type</span>
                  </div>
                  <div className="bs-insights-row">
                    <span className="bs-insights-label">Classic</span>
                    <span className="bs-insights-value">~{100 - insights.ebikePct}%</span>
                  </div>
                  <div className="bs-stat-bar">
                    <div className="bs-stat-bar-fill" style={{ width: `${100 - insights.ebikePct}%` }} />
                  </div>
                  <div className="bs-insights-row">
                    <span className="bs-insights-label">E-bike</span>
                    <span className="bs-insights-value">~{insights.ebikePct}%</span>
                  </div>
                  <div className="bs-stat-bar">
                    <div className="bs-stat-bar-fill ebike" style={{ width: `${insights.ebikePct}%` }} />
                  </div>
                </>
              ) : (
                <>
                  <div className="bs-stat-bar"><div className="bs-stat-bar-fill" style={{ width: '0%' }} /></div>
                  <div className="bs-stat-bar"><div className="bs-stat-bar-fill" style={{ width: '0%' }} /></div>
                  <div className="bs-stat-bar"><div className="bs-stat-bar-fill" style={{ width: '0%' }} /></div>
                </>
              )}
            </section>

            {/* Legend */}
            <section className="bs-section">
              <h3 className="bs-section-title">Legend</h3>
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
            </section>

            </aside>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <footer className="bs-footer">
          <div className="bs-footer-note">
            <span className="bs-pulse" />
            {totalTrips > 0
              ? `Real data — Open Toronto, ${monthLabel(currentMonth)} (${totalTrips.toLocaleString()} trips)`
              : 'Loading trip data...'}
          </div>
          <div className="bs-footer-right">
            <span className="bs-footer-note">Drag to pan · Scroll to zoom</span>
            <Link to="/projects" className="bs-back-link">← Projects</Link>
          </div>
        </footer>

      </div>
    </>
  );
}
