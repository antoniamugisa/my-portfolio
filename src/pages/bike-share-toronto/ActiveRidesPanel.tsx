import {
  forwardRef,
  memo,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { GRAPH_MIN_SCALE, SIM_GRAPH_WINDOW_SIZE_MS } from './activeRidesConfig';
import type { GraphDataPoint } from './types';

type ActiveRidesPanelProps = {
  graphData: GraphDataPoint[];
  simTimeMs: number;
  bearing: number;
  ridesCount: number;
  fps: number | null;
};

export type ActiveRidesPanelRef = {
  fps: HTMLDivElement | null;
  rides: HTMLSpanElement | null;
  mobileFps: HTMLDivElement | null;
  mobileRides: HTMLSpanElement | null;
};

const GRAPH_WIDTH = 176;
const GRAPH_HEIGHT = 52;
const PADDING = { top: 4, right: 4, bottom: 14, left: 4 };

export const ActiveRidesPanel = memo(
  forwardRef<ActiveRidesPanelRef, ActiveRidesPanelProps>(
    function ActiveRidesPanel(
      { graphData, simTimeMs, bearing, ridesCount, fps },
      ref,
    ) {
      const fpsRef = useRef<HTMLDivElement>(null);
      const ridesRef = useRef<HTMLSpanElement>(null);
      const mobileFpsRef = useRef<HTMLDivElement>(null);
      const mobileRidesRef = useRef<HTMLSpanElement>(null);
      const gradId = useId().replace(/:/g, '');

      useImperativeHandle(ref, () => ({
        fps: fpsRef.current,
        rides: ridesRef.current,
        mobileFps: mobileFpsRef.current,
        mobileRides: mobileRidesRef.current,
      }));

      const { linePath, areaPath, maxCount, lastPoint } = useMemo(() => {
        if (graphData.length === 0) {
          return {
            linePath: '',
            areaPath: '',
            maxCount: 0,
            lastPoint: null as { x: number; y: number } | null,
          };
        }

        const simWindowStartMs = simTimeMs - SIM_GRAPH_WINDOW_SIZE_MS;
        const simWindowEndMs = simTimeMs;
        const windowSpan = Math.max(1, simWindowEndMs - simWindowStartMs);

        const windowData = graphData.filter(
          (d) => d.simTimeMs >= simWindowStartMs && d.simTimeMs <= simWindowEndMs,
        );
        if (windowData.length === 0) {
          return {
            linePath: '',
            areaPath: '',
            maxCount: 0,
            lastPoint: null as { x: number; y: number } | null,
          };
        }

        const maxCount = Math.max(
          GRAPH_MIN_SCALE,
          ...windowData.map((d) => d.count),
        );

        const chartWidth = GRAPH_WIDTH - PADDING.left - PADDING.right;
        const chartHeight = GRAPH_HEIGHT - PADDING.top - PADDING.bottom;

        const scaleX = (t: number) =>
          PADDING.left + ((t - simWindowStartMs) / windowSpan) * chartWidth;

        const scaleY = (count: number) =>
          PADDING.top +
          chartHeight -
          (count / (maxCount * 1.1)) * chartHeight;

        const points = windowData.map((d) => ({
          x: scaleX(d.simTimeMs),
          y: scaleY(d.count),
        }));

        const linePath = points
          .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
          .join(' ');

        const last = points[points.length - 1]!;
        const areaPath =
          linePath +
          ` L ${last.x} ${GRAPH_HEIGHT - PADDING.bottom}` +
          ` L ${points[0]!.x} ${GRAPH_HEIGHT - PADDING.bottom}` +
          ` Z`;

        return {
          linePath,
          areaPath,
          maxCount,
          lastPoint: last,
        };
      }, [graphData, simTimeMs]);

      const hasData = linePath.length > 0;
      const fpsLabel = fps == null ? '—' : `${fps} FPS`;

      return (
        <>
          {/* In-flow mobile card — sits in the bottom banners strip (not fixed over the exit button). */}
          <div className="bs-active-rides-mobile">
            <div className="bs-active-rides-mobile__stats">
              <div className="bs-active-rides-mobile__rides">
                <span ref={mobileRidesRef} className="bs-active-rides-mobile__rides-n">
                  {ridesCount}
                </span>
                <span className="bs-active-rides-mobile__rides-l">rides</span>
              </div>
              <div ref={mobileFpsRef} className="bs-active-rides-mobile__fps">
                {fps == null ? '— fps' : `${fps} fps`}
              </div>
            </div>
            <svg
              width="100%"
              height={36}
              viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
              preserveAspectRatio="none"
              className="bs-active-rides-mobile__spark"
              role="img"
              aria-hidden
            >
              {hasData ? (
                <path
                  d={linePath}
                  fill="none"
                  stroke="rgba(125, 207, 255, 0.9)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ) : (
                <text
                  x={GRAPH_WIDTH / 2}
                  y={GRAPH_HEIGHT / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(255, 255, 255, 0.3)"
                  fontSize={9}
                >
                  No data
                </text>
              )}
            </svg>
          </div>

          <div className="bs-active-rides-desktop bg-black/45 backdrop-blur-md text-white/90 px-3 py-2 rounded-xl border border-white/10 shadow-[0_0_24px_rgba(0,0,0,0.6)] w-[200px] relative">
            <div
              className="absolute top-2 right-2"
              style={{ transform: `rotate(${-bearing}deg)` }}
              aria-hidden
            >
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle
                  cx="20"
                  cy="20"
                  r="14"
                  fill="none"
                  stroke="rgba(125, 207, 255, 0.2)"
                  strokeWidth="1"
                />
                <path
                  d="M20 9 L22 20 L20 18 L18 20 Z"
                  fill="rgba(125, 207, 255, 0.9)"
                />
                <path
                  d="M20 31 L22 20 L20 22 L18 20 Z"
                  fill="rgba(125, 207, 255, 0.3)"
                />
                <circle cx="20" cy="20" r="1.5" fill="rgba(125, 207, 255, 0.6)" />
                <text
                  x="20"
                  y="7"
                  textAnchor="middle"
                  fontSize="8"
                  fill="rgba(125, 207, 255, 0.7)"
                  fontWeight="500"
                >
                  N
                </text>
                <text
                  x="20"
                  y="39"
                  textAnchor="middle"
                  fontSize="8"
                  fill="rgba(125, 207, 255, 0.4)"
                  fontWeight="500"
                >
                  S
                </text>
                <text
                  x="4"
                  y="22"
                  textAnchor="middle"
                  fontSize="8"
                  fill="rgba(125, 207, 255, 0.4)"
                  fontWeight="500"
                >
                  W
                </text>
                <text
                  x="36"
                  y="22"
                  textAnchor="middle"
                  fontSize="8"
                  fill="rgba(125, 207, 255, 0.4)"
                  fontWeight="500"
                >
                  E
                </text>
              </svg>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5 text-left pr-10">
              <span
                ref={ridesRef}
                className="text-xl font-semibold tabular-nums tracking-tight"
              >
                {ridesCount}
              </span>
              <span className="text-[10px] tracking-wide text-white/70">RIDES</span>
            </div>
            <div
              ref={fpsRef}
              className="mt-0.5 text-[10px] tracking-wide text-white/50 text-left"
            >
              {fpsLabel}
            </div>
            <div className="mt-2">
              <svg
                width={GRAPH_WIDTH}
                height={GRAPH_HEIGHT}
                viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
                className="overflow-visible"
                role="img"
                aria-hidden
              >
                <defs>
                  <linearGradient
                    id={`graph-gradient-${gradId}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="rgba(125, 207, 255, 0.4)" />
                    <stop offset="100%" stopColor="rgba(125, 207, 255, 0)" />
                  </linearGradient>
                </defs>

                <text
                  x={PADDING.left}
                  y={GRAPH_HEIGHT - 2}
                  textAnchor="start"
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize={8}
                >
                  -3h
                </text>
                <text
                  x={PADDING.left + (GRAPH_WIDTH - PADDING.left - PADDING.right) / 3}
                  y={GRAPH_HEIGHT - 2}
                  textAnchor="middle"
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize={8}
                >
                  -2h
                </text>
                <text
                  x={
                    PADDING.left +
                    (2 * (GRAPH_WIDTH - PADDING.left - PADDING.right)) / 3
                  }
                  y={GRAPH_HEIGHT - 2}
                  textAnchor="middle"
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize={8}
                >
                  -1h
                </text>
                <text
                  x={GRAPH_WIDTH - PADDING.right}
                  y={GRAPH_HEIGHT - 2}
                  textAnchor="end"
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize={8}
                >
                  Now
                </text>

                {hasData ? (
                  <>
                    <path
                      d={areaPath}
                      fill={`url(#graph-gradient-${gradId})`}
                    />
                    <path
                      d={linePath}
                      fill="none"
                      stroke="rgba(125, 207, 255, 0.9)"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {lastPoint ? (
                      <circle
                        cx={lastPoint.x}
                        cy={lastPoint.y}
                        r={2.5}
                        fill="rgba(125, 207, 255, 1)"
                      />
                    ) : null}
                  </>
                ) : (
                  <text
                    x={GRAPH_WIDTH / 2}
                    y={(GRAPH_HEIGHT - PADDING.bottom) / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(255, 255, 255, 0.3)"
                    fontSize={9}
                  >
                    No data
                  </text>
                )}
              </svg>
            </div>
          </div>
        </>
      );
    },
  ),
);
