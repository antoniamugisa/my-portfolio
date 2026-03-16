import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BikeShareMap from './BikeShareMap';
import { Filters, HOUR_PROFILE, PERIOD_LABELS, STATIONS } from './types';
import { useTripsData, monthLabel } from './useTripsData';
import './bikeshare.css';

const SPEEDS = [1, 2, 4];
const ALL_FILTERS: Filters = { member: true, casual: true, ebike: true, classic: true };

export default function BikeShareTorontoPage() {
  const [currentHour, setCurrentHour] = useState(8);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [tripCount, setTripCount] = useState(0);

  const { data: tripsData, setMonth } = useTripsData(ALL_FILTERS);

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxHourVal = Math.max(...HOUR_PROFILE);

  const handleSetHour = useCallback((h: number) => {
    setCurrentHour(h);
  }, []);

  // Play/pause logic
  useEffect(() => {
    if (playing) {
      playIntervalRef.current = setInterval(() => {
        setCurrentHour(prev => (prev + 1) % 24);
      }, 1200 / SPEEDS[speedIdx]);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [playing, speedIdx]);

  const togglePlay = () => setPlaying(p => !p);

  const cycleSpeed = () => {
    setSpeedIdx(i => (i + 1) % SPEEDS.length);
  };

  const hh = String(currentHour).padStart(2, '0');
  const timeStr = `${hh}:00`;
  const periodLabel = PERIOD_LABELS[currentHour];

  const insights = useMemo(() => {
    const buckets = tripsData.hourlyBuckets;
    if (!buckets || buckets.length !== 24) return null;

    let peakHour = 0;
    let peakCount = 0;
    let totalMembers = 0;
    let totalEbike = 0;
    let totalSampled = 0;

    for (const b of buckets) {
      if (b.count > peakCount) {
        peakCount = b.count;
        peakHour = b.hour;
      }
      for (const t of b.trips) {
        totalSampled++;
        if (t.isMember) totalMembers++;
        if (t.isEbike) totalEbike++;
      }
    }

    const memberPct = totalSampled > 0 ? Math.round((totalMembers / totalSampled) * 100) : 0;
    const ebikePct = totalSampled > 0 ? Math.round((totalEbike / totalSampled) * 100) : 0;

    return { peakHour, peakCount, memberPct, ebikePct };
  }, [tripsData.hourlyBuckets]);

  return (
    <>
      <Helmet>
        <title>Bike Share Toronto — Antonia Mugisa</title>
        <meta
          name="description"
          content="Interactive flow map of Toronto Bike Share trips, visualizing how the city moves throughout the day."
        />
      </Helmet>

      {/* Full-viewport dark page — overrides portfolio nav layout */}
      <div className="bs-page">

        {/* Header */}
        <header className="bs-header">
          <div className="bs-logo">
            <div className="bs-logo-icon">🚲</div>
            <div>
              <div className="bs-title">BIKE SHARE TORONTO</div>
              <div className="bs-subtitle">
                Trip Flow Visualizer — {tripsData.currentMonth ? monthLabel(tripsData.currentMonth) : '2025'}
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
                {tripsData.totalTrips > 0 ? tripsData.totalTrips.toLocaleString() : '764K'}
              </div>
              <div className="bs-stat-label">Monthly Total</div>
            </div>
            <div className="bs-stat">
              <div className="bs-stat-value">
                {tripsData.stations.size > 0 ? tripsData.stations.size : STATIONS.length}
              </div>
              <div className="bs-stat-label">Stations</div>
            </div>
          </div>
        </header>

        {/* Main */}
        <div className="bs-main" style={{ position: 'relative' }}>
          <BikeShareMap
            currentHour={currentHour}
            onTripCountChange={setTripCount}
            hourlyBuckets={tripsData.hourlyBuckets}
          />

          {/* Loading overlay */}
          <div
            className="bs-loading-overlay"
            style={{ opacity: tripsData.isLoading ? 1 : 0, pointerEvents: tripsData.isLoading ? 'all' : 'none' }}
          >
            <div className="bs-loading-spinner" />
            <div className="bs-loading-text">{tripsData.loadingMessage}</div>
            {tripsData.error && <div className="bs-loading-error">{tripsData.error}</div>}
          </div>

          {/* Sidebar */}
          <aside className="bs-sidebar">

            {/* Time of Day */}
            <section className="bs-section">
              <h3 className="bs-section-title">Time of Day</h3>
              <div className="bs-time-display">{timeStr}</div>
              <div className="bs-time-label">{periodLabel}</div>

              {/* Hour bars */}
              <div className="bs-hour-bars">
                {HOUR_PROFILE.map((val, h) => {
                  const pct = val / maxHourVal;
                  const isEvening = h >= 17 && h <= 19;
                  const r = isEvening ? 255 : 0;
                  const g = isEvening ? 107 : 229;
                  const b = isEvening ? 53 : 255;
                  return (
                    <button
                      key={h}
                      className={`bs-hour-bar ${h === currentHour ? 'active' : ''}`}
                      style={{
                        height: `${pct * 100}%`,
                        background: `rgba(${r},${g},${b},${0.2 + pct * 0.8})`,
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
                  {playing ? '⏸ PAUSE' : '▶ PLAY'}
                </button>
                <button className="bs-btn" onClick={cycleSpeed}>
                  {SPEEDS[speedIdx]}×
                </button>
              </div>
            </section>

            {/* Data source */}
            <section className="bs-section">
              <h3 className="bs-section-title">Data</h3>
              {tripsData.availableMonths.length > 0 ? (
                <>
                  <select
                    className="bs-month-select"
                    value={tripsData.currentMonth}
                    onChange={e => setMonth(e.target.value)}
                    disabled={tripsData.isLoading}
                  >
                    {tripsData.availableMonths.map(m => (
                      <option key={m} value={m}>{monthLabel(m)}</option>
                    ))}
                  </select>
                  <div className="bs-data-status">
                    {tripsData.isLoading ? (
                      <span style={{ color: 'var(--bs-accent)' }}>● Loading...</span>
                    ) : tripsData.error ? (
                      <span style={{ color: 'var(--bs-accent2)' }}>● {tripsData.error}</span>
                    ) : (
                      <span style={{ color: '#00ff88' }}>✓ {tripsData.totalTrips.toLocaleString()} trips loaded</span>
                    )}
                  </div>
                </>
              ) : (
                <div className="bs-data-status" style={{ color: 'var(--bs-muted)' }}>
                  {tripsData.isLoading ? tripsData.loadingMessage : 'Synthetic data (fallback)'}
                </div>
              )}
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
                        background: h === currentHour ? 'var(--bs-accent)' : 'var(--bs-border)',
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
                  <div className="bs-insights-row">
                    <span className="bs-insights-label">Peak hour</span>
                    <span className="bs-insights-value">
                      {String(insights.peakHour).padStart(2, '0')}:00
                    </span>
                  </div>
                  <div className="bs-insights-row">
                    <span className="bs-insights-label" />
                    <span className="bs-insights-value" style={{ color: 'var(--bs-muted)', fontSize: 10 }}>
                      {insights.peakCount.toLocaleString()} trips
                    </span>
                  </div>

                  <div className="bs-insights-row" style={{ marginTop: 10 }}>
                    <span className="bs-insights-label">Rider split</span>
                  </div>
                  <div className="bs-insights-row">
                    <span className="bs-insights-label">Members</span>
                    <span className="bs-insights-value">~{insights.memberPct}%</span>
                  </div>
                  <div className="bs-stat-bar">
                    <div className="bs-stat-bar-fill" style={{ width: `${insights.memberPct}%` }} />
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
                <div className="bs-legend-dot" style={{ background: '#00e5ff' }} />
                <div>
                  <div className="bs-legend-text">Member trip</div>
                  <div className="bs-legend-sub">Annual pass holder</div>
                </div>
              </div>
              <div className="bs-legend-item">
                <div className="bs-legend-dot" style={{ background: '#ff6b35' }} />
                <div>
                  <div className="bs-legend-text">Casual trip</div>
                  <div className="bs-legend-sub">Pay-per-ride</div>
                </div>
              </div>
            </section>

          </aside>
        </div>

        {/* Bottom bar */}
        <footer className="bs-footer">
          <div className="bs-footer-note">
            <span className="bs-pulse" />
            {tripsData.totalTrips > 0
              ? `Real data — Open Toronto, ${tripsData.currentMonth ? monthLabel(tripsData.currentMonth) : '2025'} (${tripsData.totalTrips.toLocaleString()} trips)`
              : 'Representative sample — Open Toronto Data'}
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
