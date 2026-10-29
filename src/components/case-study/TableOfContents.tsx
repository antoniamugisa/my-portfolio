import { useEffect, useState, type RefObject } from 'react';

type Entry = { id: string; text: string; level: 2 | 3 };

/** Distance from the top of the viewport at which a heading counts as "being read". */
const ACTIVE_OFFSET_PX = 140;

function useHeadings(containerRef: RefObject<HTMLElement>): Entry[] {
  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const read = () =>
      setEntries(
        [...root.querySelectorAll<HTMLElement>('[data-toc]')].map((el) => ({
          id: el.id,
          text: el.textContent ?? '',
          level: el.dataset.toc === '3' ? 3 : 2,
        })),
      );
    read();
    // The case study loads lazily, so pick up headings once they render.
    const mo = new MutationObserver(read);
    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [containerRef]);
  return entries;
}

function useActiveId(entries: Entry[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (entries.length === 0) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      let current: string | null = entries[0]!.id;
      for (const e of entries) {
        const el = document.getElementById(e.id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET_PX) current = e.id;
      }
      // At the very bottom, the last heading may never reach the offset; mark it anyway.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = entries[entries.length - 1]!.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [entries]);
  return active;
}

function EntryLinks({ entries, active, onPick }: { entries: Entry[]; active: string | null; onPick?: () => void }) {
  return (
    <ul className="space-y-2">
      {entries.map((e) => (
        <li key={e.id} className={e.level === 3 ? 'pl-3' : ''}>
          <a
            href={`#${e.id}`}
            onClick={(ev) => {
              ev.preventDefault();
              // Scroll without touching the URL hash, which the project page uses to open the demo.
              document.getElementById(e.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              onPick?.();
            }}
            aria-current={active === e.id ? 'location' : undefined}
            className={`block leading-snug transition-colors ${
              active === e.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
            }`}
          >
            {e.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** "On this page": a sticky side menu on wide screens. */
export function TableOfContents({ containerRef }: { containerRef: RefObject<HTMLElement> }) {
  const entries = useHeadings(containerRef);
  const active = useActiveId(entries);
  if (entries.length < 3) return null;
  return (
    <nav aria-label="On this page" className="sticky top-28 text-[13px]">
      <div className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">On this page</div>
      <EntryLinks entries={entries} active={active} />
    </nav>
  );
}

/** The same menu, collapsed, for narrow screens. */
export function TableOfContentsCompact({ containerRef }: { containerRef: RefObject<HTMLElement> }) {
  const entries = useHeadings(containerRef);
  const active = useActiveId(entries);
  const [open, setOpen] = useState(false);
  if (entries.length < 3) return null;
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="mb-10 rounded-xl border border-border px-4 py-3 text-sm"
    >
      <summary className="cursor-pointer select-none text-foreground">On this page</summary>
      <div className="mt-3">
        <EntryLinks entries={entries} active={active} onPick={() => setOpen(false)} />
      </div>
    </details>
  );
}
