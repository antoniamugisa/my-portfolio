import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Check, Link2, Pause, Play, Search, Shuffle } from 'lucide-react';

const HOUR_LABELS: Record<number, string> = { 0: '12a', 6: '6a', 12: '12p', 18: '6p' };

function hourName(h: number): string {
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${suffix}`;
}

type TimelineDockProps = {
  /** Rides started in each Toronto hour; null while loading. */
  hourlyCounts: number[] | null;
  /** True when counts are the month's average day rather than one real day. */
  averaged: boolean;
  currentHour: number;
  /** Start of the playing hour (epoch ms) and the live sim clock, for the playhead. */
  hourStartMs: number;
  playbackTimeMsRef: MutableRefObject<number>;
  paused: boolean;
  speed: number;
  searchShortcut: string;
  randomDisabled: boolean;
  onPickHour: (hour: number) => void;
  onTogglePause: () => void;
  onCycleSpeed: () => void;
  onOpenSearch: () => void;
  onRandomTrip: () => void;
  /** Copies a link to the moment on screen. */
  onCopyLink: () => void;
  linkCopied: boolean;
};

/** Bottom dock: a day of rides per hour you can click to jump, plus the playback controls. */
export function TimelineDock({
  hourlyCounts,
  averaged,
  currentHour,
  hourStartMs,
  playbackTimeMsRef,
  paused,
  speed,
  searchShortcut,
  randomDisabled,
  onPickHour,
  onTogglePause,
  onCycleSpeed,
  onOpenSearch,
  onRandomTrip,
  onCopyLink,
  linkCopied,
}: TimelineDockProps) {
  const playheadRef = useRef<HTMLDivElement | null>(null);
  const [hoverHour, setHoverHour] = useState<number | null>(null);

  // Move the playhead from the animation clock without re-rendering React every frame.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = playheadRef.current;
      if (el) {
        const frac = Math.min(1, Math.max(0, (playbackTimeMsRef.current - hourStartMs) / 3600000));
        el.style.left = `${((currentHour + frac) / 24) * 100}%`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentHour, hourStartMs, playbackTimeMsRef]);

  const max = Math.max(1, ...(hourlyCounts ?? [1]));
  const focusHour = hoverHour ?? currentHour;
  const focusCount = hourlyCounts?.[focusHour];

  return (
    <div className="bs-dock" role="group" aria-label="Playback">
      <div className="bs-dock__buttons">
        <button
          type="button"
          className="bs-dock__btn"
          onClick={onTogglePause}
          title={paused ? 'Play (Space)' : 'Pause (Space)'}
          aria-label={paused ? 'Play' : 'Pause'}
        >
          {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
        </button>
        <button
          type="button"
          className="bs-dock__btn bs-dock__btn--speed"
          onClick={onCycleSpeed}
          title="Playback speed"
          aria-label={`Playback speed ${speed}×`}
        >
          {speed}×
        </button>
      </div>

      <div className="bs-timeline">
        <div className="bs-timeline__caption" aria-live="polite">
          <span>{hourName(focusHour)}</span>
          <span className="bs-timeline__caption-n">
            {focusCount == null
              ? ' '
              : `${focusCount.toLocaleString()} rides${averaged ? ' on an average day' : ''}`}
          </span>
        </div>
        <div className="bs-timeline__track" onMouseLeave={() => setHoverHour(null)}>
          {Array.from({ length: 24 }, (_, h) => {
            const n = hourlyCounts?.[h] ?? 0;
            const pct = hourlyCounts ? Math.max(4, (n / max) * 100) : 12;
            return (
              <button
                key={h}
                type="button"
                className={[
                  'bs-timeline__bar',
                  h === currentHour ? 'bs-timeline__bar--current' : '',
                  hourlyCounts ? '' : 'bs-timeline__bar--loading',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onPickHour(h)}
                onMouseEnter={() => setHoverHour(h)}
                onFocus={() => setHoverHour(h)}
                onBlur={() => setHoverHour(null)}
                aria-label={`Jump to ${hourName(h)}${hourlyCounts ? `, ${n} rides` : ''}`}
                aria-current={h === currentHour ? 'true' : undefined}
              >
                <span className="bs-timeline__fill" style={{ height: `${pct}%` }} />
              </button>
            );
          })}
          <div ref={playheadRef} className="bs-timeline__playhead" aria-hidden />
        </div>
        <div className="bs-timeline__axis" aria-hidden>
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h}>{HOUR_LABELS[h] ?? ''}</span>
          ))}
        </div>
      </div>

      <div className="bs-dock__buttons">
        <button
          type="button"
          className="bs-dock__btn"
          onClick={onOpenSearch}
          title={`Search times and rides (${searchShortcut})`}
          aria-label="Search times and rides"
        >
          <Search aria-hidden />
        </button>
        <button
          type="button"
          className="bs-dock__btn"
          onClick={onRandomTrip}
          disabled={randomDisabled}
          title="Follow a random ride (R)"
          aria-label="Follow a random ride"
        >
          <Shuffle aria-hidden />
        </button>
        <button
          type="button"
          className={`bs-dock__btn${linkCopied ? ' bs-dock__btn--done' : ''}`}
          onClick={onCopyLink}
          title={linkCopied ? 'Link copied' : 'Copy a link to this moment'}
          aria-label={linkCopied ? 'Link copied' : 'Copy a link to this moment'}
        >
          {linkCopied ? <Check aria-hidden /> : <Link2 aria-hidden />}
        </button>
      </div>
    </div>
  );
}
