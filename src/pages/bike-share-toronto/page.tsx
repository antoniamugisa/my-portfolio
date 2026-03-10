import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BikeShareMap from './BikeShareMap';
import { Filters, HOUR_PROFILE, PERIOD_LABELS, STATIONS } from './types';
import './bikeshare.css';

const SPEEDS = [1, 2, 4];

export default function BikeShareTorontoPage() {
  const [currentHour, setCurrentHour] = useState(8);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [tripCount, setTripCount] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    member: true, casual: true, ebike: true, classic: true,
  });

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

  const toggleFilter = (key: keyof Filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hh = String(currentHour).padStart(2, '0');
  const timeStr = `${hh}:00`;
  const periodLabel = PERIOD_LABELS[currentHour];

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
              <div className="bs-subtitle">Trip Flow Visualizer — June 2024</div>
            </div>
          </div>

          <div className="bs-stats-row">
            <div className="bs-stat">
              <div className="bs-stat-value">{tripCount}</div>
              <div className="bs-stat-label">Active Trips</div>
            </div>
            <div className="bs-stat">
              <div className="bs-stat-value">764K</div>
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
          <BikeShareMap
            currentHour={currentHour}
            filters={filters}
            onTripCountChange={setTripCount}
          />

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

            {/* Filters */}
            <section className="bs-section">
              <h3 className="bs-section-title">Filters</h3>
              {(
                [
                  { key: 'member',  label: 'Member rides' },
                  { key: 'casual',  label: 'Casual rides' },
                  { key: 'ebike',   label: 'E-bikes' },
                  { key: 'classic', label: 'Classic bikes' },
                ] as { key: keyof Filters; label: string }[]
              ).map(({ key, label }) => (
                <div key={key} className="bs-toggle-row">
                  <span className="bs-toggle-label">{label}</span>
                  <button
                    className={`bs-toggle ${filters[key] ? 'on' : ''}`}
                    onClick={() => toggleFilter(key)}
                    aria-label={`Toggle ${label}`}
                  />
                </div>
              ))}
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
              <div className="bs-legend-item">
                <div className="bs-legend-dot" style={{ background: 'rgba(255,255,255,0.5)' }} />
                <div>
                  <div className="bs-legend-text">Station</div>
                  <div className="bs-legend-sub">Dot size = capacity</div>
                </div>
              </div>
            </section>

          </aside>
        </div>

        {/* Bottom bar */}
        <footer className="bs-footer">
          <div className="bs-footer-note">
            <span className="bs-pulse" />
            Representative sample — Open Toronto Data, June 2024 (~764K trips)
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
