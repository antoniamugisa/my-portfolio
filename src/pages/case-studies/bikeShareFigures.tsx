import { useState } from 'react';
import { STATIONS } from '../bike-share-toronto/types';
import { EXAMPLE_RIDE } from './bikeShareExampleRide';

/** Three real rows from the City's July 2025 file, and what each end-station ID actually is. */
const CSV_ROWS = [
  { startId: '7267', startName: 'Dundas St E / Pembroke St', endId: '7021', endName: 'Dundas St E / Pembroke St', realEnd: 'Bay St / Albert St' },
  { startId: '7240', startName: 'Bloor St W / Shaw St', endId: '7691', endName: 'Bloor St W / Shaw St', realEnd: 'Christie St / Dupont St' },
  { startId: '7712', startName: 'Queen St W / Shaw St', endId: '7929', endName: 'Queen St W / Shaw St', realEnd: 'Spadina Ave / Bulwer St' },
];

export function CsvBugFigure() {
  const [showFix, setShowFix] = useState(false);
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5 text-xs" role="radiogroup" aria-label="Which end station to show">
          {[
            { on: false, label: 'As published' },
            { on: true, label: 'Resolved from ID' },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={showFix === o.on}
              onClick={() => setShowFix(o.on)}
              className={`rounded-md px-2.5 py-1 transition-colors ${showFix === o.on ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse font-mono text-[12px]">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="pb-2 pr-3 font-normal">Start_Station_Id</th>
              <th className="pb-2 pr-3 font-normal">Start_Station_Name</th>
              <th className="pb-2 pr-3 font-normal">End_Station_Id</th>
              <th className="pb-2 font-normal">End_Station_Name</th>
            </tr>
          </thead>
          <tbody>
            {CSV_ROWS.map((r) => (
              <tr key={r.startId} className="border-t border-border text-foreground/80">
                <td className="py-2 pr-3">{r.startId}</td>
                <td className="py-2 pr-3">{r.startName}</td>
                <td className="py-2 pr-3">
                  <span className="rounded bg-emerald-500/15 px-1 text-foreground">{r.endId}</span>
                </td>
                <td className="py-2">
                  {showFix ? (
                    <span className="rounded bg-emerald-500/15 px-1 text-foreground">{r.realEnd}</span>
                  ) : (
                    <span className="rounded bg-red-500/15 px-1 text-foreground">{r.endName}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type Bar = { label: string; from: number; to: number; tone: 'app' | 'engine' | 'query' | 'file' | 'background' };

const TIMELINES: { label: string; total: string; bars: Bar[] }[] = [
  {
    label: 'Before',
    total: '17.5 s',
    bars: [
      { label: 'Site JavaScript', from: 0, to: 3.7, tone: 'app' },
      { label: 'Start DuckDB-WASM', from: 3.7, to: 7.8, tone: 'engine' },
      { label: 'Query a month of Parquet', from: 7.8, to: 17.5, tone: 'query' },
    ],
  },
  {
    label: 'After',
    total: '5.9 s',
    bars: [
      { label: 'Site JavaScript', from: 0, to: 3.7, tone: 'app' },
      { label: 'Static first hour', from: 4.3, to: 5.9, tone: 'file' },
      { label: 'DuckDB-WASM, in the background', from: 5.9, to: 18, tone: 'background' },
    ],
  },
];

const TONE: Record<Bar['tone'], string> = {
  app: 'bg-foreground/25',
  engine: 'bg-foreground/45',
  query: 'bg-foreground/70',
  file: 'bg-foreground',
  // Not on the critical path, and not timed: fade it out rather than give it an end.
  background: 'bg-gradient-to-r from-foreground/20 to-transparent',
};

const SCALE_S = 18;

export function LoadTimelineFigure() {
  return (
    <div className="space-y-6">
      {TIMELINES.map((t) => (
        <div key={t.label}>
          <div className="mb-2 flex items-baseline justify-between text-xs">
            <span className="uppercase tracking-[0.14em] text-muted-foreground">{t.label}</span>
            <span className="font-mono text-foreground">rides on screen at {t.total}</span>
          </div>
          <div className="space-y-1.5">
            {t.bars.map((b) => (
              <div key={b.label} className="relative h-6">
                <div
                  className={`absolute inset-y-0 rounded ${TONE[b.tone]}`}
                  style={{ left: `${(b.from / SCALE_S) * 100}%`, width: `${((b.to - b.from) / SCALE_S) * 100}%` }}
                />
                <span
                  className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pl-2 text-[11px] text-foreground/80"
                  style={
                    b.to / SCALE_S > 0.62
                      ? { right: `${100 - (b.from / SCALE_S) * 100}%`, paddingRight: 8, paddingLeft: 0 }
                      : { left: `${(b.to / SCALE_S) * 100}%` }
                  }
                >
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
        {[0, 3, 6, 9, 12, 15, 18].map((s) => (
          <span key={s}>{s}s</span>
        ))}
      </div>
    </div>
  );
}

/** Rides started per Toronto hour, from the published July 2024 data. */
const CANADA_DAY = [404, 235, 198, 126, 80, 73, 154, 236, 336, 564, 843, 1292, 1494, 1779, 1990, 2038, 2028, 2001, 2022, 1869, 1733, 1425, 1136, 768];
const ORDINARY_MONDAY = [247, 139, 94, 28, 59, 157, 427, 858, 1693, 956, 673, 740, 907, 918, 964, 1193, 1869, 2732, 2443, 1951, 1584, 1234, 741, 402];

function hourName(h: number): string {
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${h < 12 ? 'am' : 'pm'}`;
}

/** Canada Day 2024 against the Monday after it, hour by hour. Clicking an hour opens it in the demo. */
export function DayCompareFigure({ onOpenMoment }: { onOpenMoment?: (isoLocal: string) => void }) {
  const [hour, setHour] = useState(22);
  const max = Math.max(...CANADA_DAY, ...ORDINARY_MONDAY);
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-foreground" aria-hidden /> Canada Day, Mon 1 July
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-foreground/25" aria-hidden /> A normal Monday, 8 July
        </span>
      </div>

      <div className="flex h-40 items-end gap-[3px]" role="group" aria-label="Rides per hour">
        {CANADA_DAY.map((n, h) => (
          <button
            key={h}
            type="button"
            onClick={() => setHour(h)}
            onMouseEnter={() => setHour(h)}
            onFocus={() => setHour(h)}
            aria-label={`${hourName(h)}: ${n} rides on Canada Day, ${ORDINARY_MONDAY[h]} on a normal Monday`}
            aria-pressed={hour === h}
            className={`flex h-full flex-1 items-end gap-px rounded-sm transition-opacity ${hour === h ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
          >
            <span className="w-1/2 rounded-t-sm bg-foreground" style={{ height: `${(n / max) * 100}%` }} />
            <span className="w-1/2 rounded-t-sm bg-foreground/25" style={{ height: `${(ORDINARY_MONDAY[h]! / max) * 100}%` }} />
          </button>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-4 font-mono text-[10px] text-muted-foreground">
        <span>12am</span>
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
        <div className="text-foreground/80">
          <span className="text-foreground">{hourName(hour)}</span>
          <span className="mx-2 text-muted-foreground">·</span>
          {CANADA_DAY[hour]!.toLocaleString()} rides on Canada Day vs {ORDINARY_MONDAY[hour]!.toLocaleString()} on a normal Monday
        </div>
        {onOpenMoment && (
          <button
            type="button"
            onClick={() => onOpenMoment(`2024-07-01T${String(hour).padStart(2, '0')}:00`)}
            className="text-sm text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Watch {hourName(hour)} on Canada Day →
          </button>
        )}
      </div>
    </div>
  );
}

/** Metres between two [lng, lat] points. */
function haversineM(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** One real ride: its street route against the straight line between its stations, over nearby docks. */
export function RouteFigure({ onFollowRide }: { onFollowRide?: () => void }) {
  const path = EXAMPLE_RIDE.path;
  const start = path[0]!;
  const end = path[path.length - 1]!;
  const straightKm = haversineM(start, end) / 1000;
  const routedKm = EXAMPLE_RIDE.routedM / 1000;

  // Frame the ride with room around it, then project lng/lat to a flat, north-up box.
  const lngs = path.map((p) => p[0]);
  const lats = path.map((p) => p[1]);
  const padLng = (Math.max(...lngs) - Math.min(...lngs)) * 0.35;
  const padLat = (Math.max(...lats) - Math.min(...lats)) * 0.6;
  const minLng = Math.min(...lngs) - padLng;
  const maxLng = Math.max(...lngs) + padLng;
  const minLat = Math.min(...lats) - padLat;
  const maxLat = Math.max(...lats) + padLat;
  const kx = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
  const W = 600;
  const scale = W / ((maxLng - minLng) * kx);
  const H = (maxLat - minLat) * scale;
  const project = ([lng, lat]: [number, number]) => [(lng - minLng) * kx * scale, (maxLat - lat) * scale] as const;

  const docks = STATIONS.filter((s) => s.lng > minLng && s.lng < maxLng && s.lat > minLat && s.lat < maxLat);
  const routeD = path.map((p, i) => `${i === 0 ? 'M' : 'L'}${project(p)[0].toFixed(1)},${project(p)[1].toFixed(1)}`).join(' ');
  const [sx, sy] = project(start);
  const [ex, ey] = project(end);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H.toFixed(0)}`} className="h-auto w-full" role="img" aria-label={`Route from ${EXAMPLE_RIDE.startName} to ${EXAMPLE_RIDE.endName}`}>
        {docks.map((s) => {
          const [x, y] = project([s.lng, s.lat]);
          return <circle key={s.id} cx={x} cy={y} r={2.2} className="fill-foreground/20" />;
        })}
        <line x1={sx} y1={sy} x2={ex} y2={ey} className="stroke-foreground/45" strokeWidth={1.5} strokeDasharray="5 5" />
        <path d={routeD} fill="none" className="stroke-foreground" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={sx} cy={sy} r={6} className="fill-foreground stroke-background" strokeWidth={2} />
        <circle cx={ex} cy={ey} r={6} className="fill-background stroke-foreground" strokeWidth={2.5} />
        {/* Labels sit outside the route: the start below it, the end above it. */}
        <text x={sx - 6} y={sy + 26} className="fill-foreground text-[13px]">
          {EXAMPLE_RIDE.startName}
        </text>
        <text x={ex + 6} y={ey - 14} textAnchor="end" className="fill-foreground text-[13px]">
          {EXAMPLE_RIDE.endName}
        </text>
      </svg>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 bg-foreground" aria-hidden /> Routed: {routedKm.toFixed(1)} km
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed border-foreground/45" aria-hidden /> Straight line:{' '}
            {straightKm.toFixed(1)} km
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground/30" aria-hidden /> Docks
          </span>
        </div>
        {onFollowRide && (
          <button
            type="button"
            onClick={onFollowRide}
            className="text-sm text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Follow this ride →
          </button>
        )}
      </div>
    </div>
  );
}

/** The example ride's start, as epoch ms: the size of number a 32-bit float would have to hold. */
const FLOAT_DEMO_START_MS = Date.UTC(2024, 6, 18, 21, 24, 0);
const FLOAT_DEMO_SPAN_S = 240;
const FLOAT_DEMO_STEP_S = 4;

/**
 * Where a ride's clock lands when stored in 32 bits, computed with Math.fround (the GPU's rounding):
 * as time since 1970 it snaps to coarse steps; as time since the hour started it stays smooth.
 */
export function Float32Figure() {
  const seconds = Array.from({ length: FLOAT_DEMO_SPAN_S / FLOAT_DEMO_STEP_S + 1 }, (_, i) => i * FLOAT_DEMO_STEP_S);
  const base = Math.fround(FLOAT_DEMO_START_MS);
  const rows = [
    {
      label: 'Time since 1970',
      positions: seconds.map((s) => (Math.fround(FLOAT_DEMO_START_MS + s * 1000) - base) / 1000),
    },
    {
      label: 'Time since the hour started',
      positions: seconds.map((s) => Math.fround(s * 1000) / 1000),
    },
  ];
  const stepS = 2 ** (Math.floor(Math.log2(FLOAT_DEMO_START_MS)) - 23) / 1000;

  return (
    <div className="space-y-6">
      {rows.map((row) => {
        const distinct = new Set(row.positions.map((p) => p.toFixed(3))).size;
        return (
          <div key={row.label}>
            <div className="mb-2 flex items-baseline justify-between text-xs">
              <span className="uppercase tracking-[0.14em] text-muted-foreground">{row.label}</span>
              <span className="font-mono text-foreground/80">
                {distinct} distinct position{distinct === 1 ? '' : 's'} in {FLOAT_DEMO_SPAN_S / 60} minutes
              </span>
            </div>
            <div className="relative h-6 rounded bg-foreground/[0.06]">
              {row.positions.map((p, i) => (
                <span
                  key={i}
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/70"
                  style={{ left: `${Math.min(100, (p / FLOAT_DEMO_SPAN_S) * 100)}%` }}
                />
              ))}
            </div>
          </div>
        );
      })}
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>0 s</span>
        <span>1 min</span>
        <span>2 min</span>
        <span>3 min</span>
        <span>4 min</span>
      </div>
      <p className="text-xs text-muted-foreground">
        A ride's position every {FLOAT_DEMO_STEP_S} seconds. Near 1.7 trillion ms, a 32-bit float can only step every{' '}
        {stepS.toFixed(0)} seconds.
      </p>
    </div>
  );
}
