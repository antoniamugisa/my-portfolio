import React from 'react';
import './case-study.css';

/** Section heading that also feeds the "On this page" menu (level 2 = section, 3 = sub-section). */
export function CaseHeading({ id, level, children }: { id: string; level: 2 | 3; children: React.ReactNode }) {
  const Tag = level === 2 ? 'h2' : 'h3';
  return (
    <Tag
      id={id}
      data-toc={level}
      className={
        level === 2
          ? 'mt-16 mb-4 scroll-mt-28 text-lg md:text-xl font-normal text-foreground leading-snug first:mt-0'
          : 'mt-10 mb-3 scroll-mt-28 text-[15px] md:text-base font-medium text-foreground leading-snug'
      }
    >
      {children}
    </Tag>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[15px] md:text-base font-normal leading-relaxed text-foreground/70">{children}</p>;
}

/** Inline code or a station / column name. */
export function C({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted/60 px-1 py-0.5 font-mono text-[0.85em] text-foreground/90">{children}</code>;
}

/** A numbered figure: the visual, then "Fig. N. Title" and a one-line explanation. */
export function Figure({
  title,
  caption,
  children,
  bare = false,
}: {
  title: string;
  caption?: React.ReactNode;
  children: React.ReactNode;
  /** Skip the dotted canvas (for media that brings its own frame). */
  bare?: boolean;
}) {
  return (
    <figure className="case-figure my-10">
      <div className={bare ? 'overflow-hidden rounded-xl' : 'case-figure__canvas overflow-hidden rounded-xl border border-border p-5 md:p-8'}>
        {children}
      </div>
      <figcaption className="mt-3 px-1 text-sm leading-relaxed">
        <span className="text-foreground">
          <span className="case-figure__number mr-1.5" />
          {title}
        </span>
        {caption && <span className="mt-0.5 block text-muted-foreground">{caption}</span>}
      </figcaption>
    </figure>
  );
}

/** Before → after numbers. */
export function StatCompare({
  items,
}: {
  items: { label: string; before: string; after: string; note?: string }[];
}) {
  return (
    <div className={`grid gap-6 ${items.length > 1 ? 'sm:grid-cols-2' : ''}`}>
      {items.map((item) => (
        <div key={item.label}>
          <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.label}</div>
          <div className="mt-3 flex items-baseline gap-3 font-mono">
            <span className="text-xl text-muted-foreground line-through decoration-1">{item.before}</span>
            <span className="text-muted-foreground" aria-hidden>
              →
            </span>
            <span className="text-3xl text-foreground">{item.after}</span>
          </div>
          {item.note && <div className="mt-2 text-sm text-muted-foreground">{item.note}</div>}
        </div>
      ))}
    </div>
  );
}

/** A code or data snippet. Plain, theme-coloured, scrolls sideways on narrow screens. */
export function CodeBlock({ label, children }: { label?: string; children: string }) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-muted/40">
      {label && (
        <div className="border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">{label}</div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-foreground/85">
        <code>{children.trim()}</code>
      </pre>
    </div>
  );
}

/** Steps grouped into lanes (e.g. offline vs in the browser), with one step emphasised. */
export function StepLanes({
  lanes,
}: {
  lanes: { label: string; steps: { title: string; detail: string; active?: boolean }[] }[];
}) {
  return (
    <div className="space-y-6">
      {lanes.map((lane, laneIdx) => (
        <div key={lane.label}>
          <div className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">{lane.label}</div>
          <ol className="grid gap-2 sm:grid-cols-2">
            {lane.steps.map((step, i) => {
              const n = lanes.slice(0, laneIdx).reduce((sum, l) => sum + l.steps.length, 0) + i + 1;
              return (
                <li
                  key={step.title}
                  className={`flex gap-3 rounded-lg border px-3 py-2.5 ${
                    step.active
                      ? 'border-foreground/40 bg-background text-foreground shadow-subtle'
                      : 'border-border bg-background/70 text-foreground/60'
                  }`}
                >
                  <span className="mt-px font-mono text-xs text-muted-foreground">{String(n).padStart(2, '0')}</span>
                  <span>
                    <span className="block text-sm">{step.title}</span>
                    <span className="block text-xs text-muted-foreground">{step.detail}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
