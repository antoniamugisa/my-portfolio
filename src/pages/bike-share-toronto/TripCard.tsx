import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { X } from 'lucide-react';
import type { DeckTrip } from './types';

const TORONTO_TZ = 'America/Toronto';

const clockFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TORONTO_TZ,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

function tripStats(trip: DeckTrip) {
  const durSec = Math.max(1, Math.round((trip.endedAtMs - trip.startedAtMs) / 1000));
  const km = trip.distanceM / 1000;
  const kmh = km / (durSec / 3600);
  return {
    durMin: Math.max(1, Math.round(durSec / 60)),
    kmLabel: km < 0.1 ? '<0.1' : km.toFixed(1),
    kmhLabel: Number.isFinite(kmh) && kmh > 1 && kmh < 80 ? kmh.toFixed(0) : null,
  };
}

type Phase =
  | { kind: 'before'; minutes: number }
  | { kind: 'riding'; progress: number; minutesLeft: number }
  | { kind: 'done' };

function phaseAt(trip: DeckTrip, nowMs: number): Phase {
  if (nowMs < trip.startedAtMs) {
    return { kind: 'before', minutes: Math.max(1, Math.ceil((trip.startedAtMs - nowMs) / 60000)) };
  }
  if (nowMs < trip.endedAtMs) {
    const span = Math.max(1, trip.endedAtMs - trip.startedAtMs);
    return {
      kind: 'riding',
      progress: (nowMs - trip.startedAtMs) / span,
      minutesLeft: Math.max(1, Math.ceil((trip.endedAtMs - nowMs) / 60000)),
    };
  }
  return { kind: 'done' };
}

function samePhase(a: Phase, b: Phase): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'before' && b.kind === 'before') return a.minutes === b.minutes;
  if (a.kind === 'riding' && b.kind === 'riding') {
    return a.minutesLeft === b.minutesLeft && Math.abs(a.progress - b.progress) < 0.01;
  }
  return true;
}

type TripCardProps = {
  trip: DeckTrip;
  playbackTimeMsRef: MutableRefObject<number>;
  onClose: () => void;
  onJumpToStart: () => void;
};

/** Details for the ride being followed, with where it is relative to the playback clock. */
export function TripCard({ trip, playbackTimeMsRef, onClose, onJumpToStart }: TripCardProps) {
  const stats = tripStats(trip);
  const [phase, setPhase] = useState<Phase>(() => phaseAt(trip, playbackTimeMsRef.current));
  const phaseRef = useRef(phase);

  useEffect(() => {
    const update = () => {
      const next = phaseAt(trip, playbackTimeMsRef.current);
      if (!samePhase(next, phaseRef.current)) {
        phaseRef.current = next;
        setPhase(next);
      }
    };
    update();
    const id = window.setInterval(update, 200);
    return () => window.clearInterval(id);
  }, [trip, playbackTimeMsRef]);

  const roundTrip = trip.startName === trip.endName;
  const rider = trip.memberCasual === 'member' ? 'Member' : 'Casual rider';

  return (
    <div className="bs-trip-card-wrap" role="dialog" aria-labelledby="bs-trip-card-title">
      <div className={`bs-trip-card bs-trip-card--${trip.memberCasual}`}>
        <button type="button" className="bs-icon-btn bs-trip-card__close" onClick={onClose} aria-label="Stop following this ride">
          <X aria-hidden />
        </button>

        <div className="bs-trip-card__eyebrow" id="bs-trip-card-title">
          <span className="bs-trip-card__dot" aria-hidden />
          {rider} · {trip.isEbike ? 'e-bike' : 'classic bike'}
        </div>

        {roundTrip ? (
          <p className="bs-trip-card__route">
            <span className="bs-trip-card__to">Round trip from</span>
            <span className="bs-trip-card__station">{trip.startName}</span>
          </p>
        ) : (
          <p className="bs-trip-card__route">
            <span className="bs-trip-card__station">{trip.startName}</span>
            <span className="bs-trip-card__to">to</span>
            <span className="bs-trip-card__station">{trip.endName}</span>
          </p>
        )}

        <div className="bs-trip-card__metrics">
          <span>
            {clockFormatter.format(trip.startedAtMs)} – {clockFormatter.format(trip.endedAtMs)}
          </span>
          <span>{stats.durMin} min</span>
          <span>{stats.kmLabel} km</span>
          {stats.kmhLabel && <span>{stats.kmhLabel} km/h</span>}
        </div>

        <div className="bs-trip-card__status">
          <div className="bs-trip-card__progress" aria-hidden>
            <span
              style={{
                width: `${phase.kind === 'riding' ? phase.progress * 100 : phase.kind === 'done' ? 100 : 0}%`,
              }}
            />
          </div>
          <div className="bs-trip-card__status-row">
            <span>
              {phase.kind === 'before' && `Starts in ${phase.minutes} min`}
              {phase.kind === 'riding' && `Riding · ${phase.minutesLeft} min to go`}
              {phase.kind === 'done' && 'Arrived'}
            </span>
            {phase.kind !== 'riding' && (
              <button type="button" className="bs-text-btn" onClick={onJumpToStart}>
                {phase.kind === 'done' ? 'Replay ride' : 'Jump to start'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
