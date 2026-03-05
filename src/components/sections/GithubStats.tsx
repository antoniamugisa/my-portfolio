import React, { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';

const GITHUB_USERNAME = 'antoniamugisa';
const API_BASE = 'https://github-contributions-api.jogruber.de/v4';

// GitHub contribution level colors: [empty, level1, level2, level3, level4]
const LEVEL_COLORS_LIGHT = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
const LEVEL_COLORS_DARK = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

type Contribution = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

const parseDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short' });

function useIsNarrow() {
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false
  );
  useEffect(() => {
    const m = window.matchMedia('(max-width: 640px)');
    const onChange = () => setIsNarrow(m.matches);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);
  return isNarrow;
}

export default function GithubStats() {
  const { theme } = useTheme();
  const isNarrow = useIsNarrow();
  const levelColors = theme === 'dark' ? LEVEL_COLORS_DARK : LEVEL_COLORS_LIGHT;
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cellSize = isNarrow ? 6 : 10;
  const gap = isNarrow ? 2 : 3;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [res2025, res2026] = await Promise.all([
          fetch(`${API_BASE}/${GITHUB_USERNAME}?y=2025`),
          fetch(`${API_BASE}/${GITHUB_USERNAME}?y=2026`),
        ]);
        if (cancelled) return;
        if (!res2025.ok || !res2026.ok) {
          setError('Could not load contributions');
          setLoading(false);
          return;
        }
        const [data2025, data2026] = await Promise.all([
          res2025.json() as Promise<{ contributions: Contribution[] }>,
          res2026.json() as Promise<{ contributions: Contribution[] }>,
        ]);
        if (cancelled) return;
        const all = [...(data2025.contributions || []), ...(data2026.contributions || [])];
        setContributions(all);
      } catch {
        if (!cancelled) {
          setError('Could not load contributions');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const start = new Date(2025, 5, 1);   // Jun 1, 2025
  const end = new Date(2026, 4, 31);    // May 31, 2026
  const byDate = React.useMemo(() => {
    const map = new Map<string, Contribution>();
    contributions.forEach((c) => map.set(c.date, c));
    return map;
  }, [contributions]);

  const { grid, totalInRange, monthLabels } = React.useMemo(() => {
    const grid: (0 | 1 | 2 | 3 | 4)[][] = [];
    for (let row = 0; row < 7; row++) grid.push([]);

    const startTime = start.getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    let totalInRange = 0;
    const monthPositions: { month: string; xPx: number }[] = [];
    let lastMonth = -1;
    let col = 0;
    const step = cellSize + gap;

    for (let t = startTime; t <= end.getTime(); t += oneDay) {
      const d = new Date(t);
      const dateKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const c = byDate.get(dateKey);
      const level = (c?.level ?? 0) as 0 | 1 | 2 | 3 | 4;
      totalInRange += c?.count ?? 0;
      const row = d.getDay();
      grid[row].push(level);

      const month = d.getMonth();
      if (month !== lastMonth && (d.getDate() <= 7 || lastMonth === -1)) {
        monthPositions.push({ month: formatMonthLabel(d), xPx: col * step });
        lastMonth = month;
      }
      if (row === 6) col++;
    }

    const maxCols = Math.max(...grid.map((r) => r.length), 1);
    for (let row = 0; row < 7; row++) {
      while (grid[row].length < maxCols) grid[row].push(0);
    }

    return {
      grid,
      totalInRange,
      monthLabels: monthPositions,
    };
  }, [byDate, cellSize, gap]);

  const width = grid[0]?.length ? grid[0].length * (cellSize + gap) - gap : 0;
  const height = 7 * (cellSize + gap) - gap;
  const gridWidth = width;

  return (
    <section id="github-activity" className="py-8 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="mb-4 md:mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/60">
            GITHUB ACTIVITY
          </p>
        </div>

        <div className="rounded-lg border border-border/40 bg-card p-2 md:p-4 w-fit max-w-full overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center min-h-[120px] md:min-h-[200px] text-foreground/60">
              Loading…
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center min-h-[120px] md:min-h-[200px] text-destructive">
              {error}
            </div>
          )}
          {!loading && !error && grid[0]?.length > 0 && (
            <>
              <p className="text-sm text-foreground/80 mb-2 md:mb-3">
                <strong>{totalInRange.toLocaleString()} contributions</strong> from Jun 2025 – May 2026
              </p>
              <div className="overflow-x-auto overflow-y-hidden -mx-1 px-1 touch-pan-x" style={{ maxWidth: '100%' }}>
                <div className="inline-block min-w-0" style={{ width: gridWidth }}>
                  <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    className="min-w-0 block"
                  >
                    {grid.map((row, rowIndex) =>
                      row.map((level, colIndex) => (
                        <rect
                          key={`${rowIndex}-${colIndex}`}
                          x={colIndex * (cellSize + gap)}
                          y={rowIndex * (cellSize + gap)}
                          width={cellSize}
                          height={cellSize}
                          rx={isNarrow ? 1 : 2}
                          fill={levelColors[level]}
                        />
                      ))
                    )}
                  </svg>
                  <div className="min-h-[1rem] md:min-h-[1.25rem] relative mt-1 md:mt-2 text-[10px] md:text-xs text-foreground/50" style={{ width: gridWidth }}>
                    {monthLabels.map(({ month, xPx }) => (
                      <span
                        key={`${month}-${xPx}`}
                        className="absolute"
                        style={{ left: xPx }}
                      >
                        {month}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
