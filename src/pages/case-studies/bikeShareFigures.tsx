import { useState } from 'react';

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
