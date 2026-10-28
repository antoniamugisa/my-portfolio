import { memo } from 'react';

export type HourInsights = {
  memberPct: number;
  ebikePct: number;
  medianMin: number;
  busiestStation: { name: string; starts: number } | null;
};

type RidesPanelProps = {
  ridingNow: number;
  /** Rides are a random sample of the hour, not every ride. */
  sampled: boolean;
  /** Every day of the month is overlaid, so the count is not one moment's riders. */
  monthWide: boolean;
  insights: HourInsights | null;
  bearing: number;
  onResetNorth: () => void;
  /** Shown only in debug mode (D). */
  fps: number | null;
};

function SplitBar({
  left,
  right,
  leftPct,
  variant,
}: {
  left: string;
  right: string;
  leftPct: number | null;
  variant: 'riders' | 'bikes';
}) {
  const pct = leftPct ?? 50;
  return (
    <div className={`bs-split bs-split--${variant}${leftPct == null ? ' bs-split--empty' : ''}`}>
      <div className="bs-split__labels">
        <span className="bs-split__label bs-split__label--left">
          <span className="bs-split__swatch" aria-hidden />
          {left}
          <b>{leftPct == null ? '–' : `${pct}%`}</b>
        </span>
        <span className="bs-split__label bs-split__label--right">
          <b>{leftPct == null ? '–' : `${100 - pct}%`}</b>
          {right}
          <span className="bs-split__swatch" aria-hidden />
        </span>
      </div>
      <div className="bs-split__bar" aria-hidden>
        <span className="bs-split__seg bs-split__seg--left" style={{ width: `${pct}%` }} />
        <span className="bs-split__seg bs-split__seg--right" />
      </div>
    </div>
  );
}

/** Top-right panel: rides on the map right now, and who is riding this hour. */
export const RidesPanel = memo(function RidesPanel({
  ridingNow,
  sampled,
  monthWide,
  insights,
  bearing,
  onResetNorth,
  fps,
}: RidesPanelProps) {
  const rotated = Math.abs(bearing) > 0.5;
  return (
    <section className="bs-panel" aria-label="Rides">
      <div className="bs-panel__head">
        <div>
          <div className="bs-panel__count">{ridingNow.toLocaleString()}</div>
          <div className="bs-panel__count-label">
            {monthWide ? 'on the map' : 'riding now'}
            {monthWide ? (
              <span
                className="bs-panel__sample"
                title="Every day of the month is overlaid at this time of day, so this adds up riders from many days."
              >
                all days
              </span>
            ) : sampled && (
              <span
                className="bs-panel__sample"
                title="This hour is drawn from a random sample of its rides, so the count is lower than the real number."
              >
                sample
              </span>
            )}
          </div>
          {fps != null && <div className="bs-panel__fps">{fps} fps</div>}
        </div>
        <button
          type="button"
          className={`bs-compass${rotated ? ' bs-compass--rotated' : ''}`}
          onClick={onResetNorth}
          title="Reset to north"
          aria-label="Reset map to north"
        >
          <svg viewBox="0 0 24 24" style={{ transform: `rotate(${-bearing}deg)` }} aria-hidden>
            <path d="M12 3 L15 12 L12 10.5 L9 12 Z" className="bs-compass__n" />
            <path d="M12 21 L15 12 L12 13.5 L9 12 Z" className="bs-compass__s" />
          </svg>
        </button>
      </div>

      <div className="bs-panel__section">
        <div className="bs-panel__title">This hour</div>
        <SplitBar
          variant="riders"
          left="Members"
          right="Casual"
          leftPct={insights ? insights.memberPct : null}
        />
        <SplitBar
          variant="bikes"
          left="Classic"
          right="E-bike"
          leftPct={insights ? 100 - insights.ebikePct : null}
        />
        <dl className="bs-panel__facts">
          <div>
            <dt>Typical ride</dt>
            <dd>{insights ? `${insights.medianMin} min` : '–'}</dd>
          </div>
          <div>
            <dt>Busiest start</dt>
            <dd title={insights?.busiestStation?.name}>
              {insights?.busiestStation ? insights.busiestStation.name : '–'}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
});
