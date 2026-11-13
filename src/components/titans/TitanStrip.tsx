import React, { useEffect, useRef, useState } from 'react';
import './titans.css';
import { titanAnatomy } from './anatomy';
import { AttackTitanFigure, Cloud, House, ScoutFigure, TitanFigure, Tree } from './figures';

/**
 * Titans' poses are drawn "on twos", like hand-drawn animation: the walk and
 * run cycles step through a fixed set of poses while the body still glides
 * smoothly across the screen. That reads as drawn rather than tweened, and
 * because a memoised figure only redraws when its pose changes, it keeps the
 * many limb shapes from being restyled on every frame.
 */
const POSES_PER_CYCLE = 24;
const onTwos = (phase: number) => Math.round((phase * POSES_PER_CYCLE) / (Math.PI * 2)) * ((Math.PI * 2) / POSES_PER_CYCLE);
const TitanPose = React.memo(TitanFigure);
const AttackTitanPose = React.memo(AttackTitanFigure);
import {
  LAUNCH,
  RISE,
  SCOUT_SCALE,
  SHIFTER_SCALE,
  bob,
  landSquash,
  createSim,
  groundY,
  lift,
  mirror,
  sky,
  step,
  targetTitan,
  titanPoint,
  transform,
  type Prop,
  type Sim,
} from './sim';

/**
 * A little town at the bottom of every page (except Photos). Titans wander
 * through it behind the front row of houses, and scouts live on the rooftops
 * and treetops: they swing between perches, swoop down to cut a titan's nape,
 * land in the nearest tree, then hop back to a house. Every few kills a scout
 * swings off and another arrives.
 *
 * Clicking a titan sends the nearest scout after it. Clicking Eren turns him
 * into the Attack Titan, who runs off the way Eren was facing; he swings back
 * in as himself a moment later.
 *
 * This file only draws; the behaviour lives in sim.ts. Decorative: hidden
 * from screen readers, only titans and Eren take clicks, frozen for
 * reduced-motion users, paused when scrolled out of view.
 */


/** Static scenery only re-renders when it shakes. */
const PropView = React.memo(function PropView({ p, g, dx }: { p: Prop; g: number; dx: number }) {
  return p.kind === 'house' ? (
    <g transform={`translate(${p.x + dx} ${g})`}>
      <House
        w={p.w}
        h={p.h}
        roof={p.roof}
        chimney={p.chimney}
        fill={p.layer === 'front' ? 'var(--aot-prop-front)' : 'var(--aot-prop-back)'}
      />
    </g>
  ) : (
    <g transform={`translate(${p.x + dx} ${g}) rotate(${dx * 0.8})`}>
      <Tree w={p.w} h={p.h} />
    </g>
  );
});

const shakeOffset = (p: Prop) => (p.shake > 0 ? Math.sin(p.shake * 70) * 2.2 * (p.shake / 0.5) : 0);

const TitanStrip: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<Sim | null>(null);
  if (!simRef.current) {
    simRef.current = createSim(typeof document === 'undefined' ? 1200 : document.documentElement.clientWidth);
  }
  const [, setFrame] = useState(0);
  const redraw = () => setFrame((f) => (f + 1) % 1e6);

  // the town is laid out for its width, so rebuild it when that changes
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      if (w > 0 && w !== simRef.current!.W) {
        simRef.current = createSim(w);
        redraw();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let last = 0;
    // On a device that can't keep up, draw every other frame (a steady 30 fps)
    // rather than stutter. The simulation still steps every frame, so motion
    // speed is unchanged either way.
    let avgFrame = 1000 / 60;
    let halfRate = false;
    let tick = 0;
    let onScreen = false;

    const loop = (now: number) => {
      const gap = last ? now - last : 1000 / 60;
      const dt = Math.min(0.05, gap / 1000);
      last = now;
      if (simRef.current) step(simRef.current, dt);
      avgFrame += (gap - avgFrame) * 0.05;
      if (!halfRate && avgFrame > 21) halfRate = true;
      else if (halfRate && avgFrame < 15) halfRate = false;
      if (!halfRate || ++tick % 2 === 0) redraw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (raf || reduce.matches || document.hidden || !onScreen) return;
      last = 0;
      avgFrame = 1000 / 60;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => (reduce.matches || document.hidden || !onScreen ? stop() : start());

    // only animate while the town is on screen (and not hidden by the router cache)
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    if (wrapRef.current) io.observe(wrapRef.current);
    document.addEventListener('visibilitychange', sync);
    reduce.addEventListener('change', sync);
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reduce.removeEventListener('change', sync);
    };
  }, []);

  const sim = simRef.current;
  const { W, H, k } = sim;
  const g = groundY(sim);
  const animated = typeof window === 'undefined' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  const props = (layer: Prop['layer']) =>
    sim.props
      .filter((p) => p.layer === layer)
      .map((p) => <PropView key={p.id} p={p} g={g} dx={shakeOffset(p)} />);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="aot-scene pointer-events-none relative w-full select-none"
      // a sliver of empty sky above the highest cloud is left out of the layout
      style={{ height: H - sky(sim) }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute bottom-0 left-0 block overflow-visible">
        <defs>
          {/* nothing is drawn below the ground line */}
          <clipPath id="aot-above-ground">
            <rect x={-100} y={-H * 3} width={W + 200} height={H * 3 + g} />
          </clipPath>
        </defs>
        {sim.clouds.map((c) => (
          <g key={c.id} transform={`translate(${c.x} ${c.y})`}>
            <Cloud w={c.w} puff={c.puff} />
          </g>
        ))}
        <path d={sim.farPath} fill="var(--aot-far)" />
        {props('back')}

        <g clipPath="url(#aot-above-ground)">
        {sim.titans.map((t) => {
          const m = mirror(t);
          const clickable = animated && t.state === 'walk';
          const lit = clickable && (sim.hover === t.id || t.clicked);
          // as a titan topples, raise it by half its body depth so it ends up
          // lying on the ground rather than sinking through it
          const rest = 15 * t.s * t.sx * Math.sin((t.fall * Math.PI) / 180);
          return (
            <g
              key={t.id}
              opacity={t.opacity}
              transform={`translate(${t.x} ${g - bob(t) * t.s - rest}) rotate(${-t.fall * m}) scale(${m * t.s * t.sx} ${t.s})`}
              style={{
                ...(lit
                  ? ({ '--aot-titan': 'var(--aot-titan-lit)', '--aot-titan-far': 'var(--aot-titan-far-lit)' } as React.CSSProperties)
                  : null),
                ...(clickable ? { pointerEvents: 'visiblePainted', cursor: 'crosshair' } : null),
              }}
              onPointerDown={clickable ? () => targetTitan(sim, t.id) : undefined}
              onPointerEnter={clickable ? () => (sim.hover = t.id) : undefined}
              onPointerLeave={clickable ? () => (sim.hover = 0) : undefined}
            >
              <TitanPose look={t.look} phase={onTwos(t.phase)} stride={t.state === 'walk' ? 1 : 0} />
            </g>
          );
        })}
        {sim.shifter && (() => {
          const sh = sim.shifter;
          const grow = sh.stage === 'rise' ? 0.15 + 0.85 * (1 - (1 - sh.t / RISE) ** 3) : 1;
          const S = SHIFTER_SCALE * k * grow;
          const shake = sh.stage === 'roar' ? Math.sin(sh.t * 60) * 1.2 : 0;
          return (
            <g transform={`translate(${sh.x + shake} ${g}) scale(${-sh.dir * S} ${S})`}>
              <AttackTitanPose
                run={onTwos(sh.run)}
                stride={sh.stage === 'run' ? Math.round(Math.min(1, sh.t / 0.4) * 4) / 4 : 0}
              />
            </g>
          );
        })()}
        </g>

        {/* front of town: a low row of rooftops hides titans' feet, then the near houses */}
        <path d={sim.frontRowPath} fill="var(--aot-prop-back)" stroke="var(--aot-prop-line)" strokeWidth={0.6} />
        {props('front')}
        <line x1={0} y1={g} x2={W} y2={g} stroke="var(--aot-prop-line)" strokeWidth={1} />

        {sim.puffs.map((p) => {
          const q = p.t / p.life;
          return (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={p.r0 + (p.r1 - p.r0) * Math.sqrt(q)}
              fill="var(--aot-titan-detail)"
              opacity={p.o * (1 - q)}
            />
          );
        })}

        {sim.bolts.map((b) => {
          const q = b.t / 0.4;
          const flick = Math.sin(b.t * 80) > -0.3 ? 1 : 0.3;
          return (
            <g key={b.id} opacity={(1 - q) * flick}>
              <path d={b.d} fill="none" stroke="var(--aot-bolt)" strokeWidth={5} strokeOpacity={0.45} strokeLinejoin="round" />
              <path d={b.d} fill="none" stroke="var(--aot-bolt)" strokeWidth={1.8} strokeLinejoin="round" />
            </g>
          );
        })}

        {sim.slashes.map((s) => {
          const q = s.t / 0.5;
          const r = 15 * k;
          return (
            <path
              key={s.id}
              d={`M${s.x + s.m * r} ${s.y - r * 0.6} Q${s.x - s.m * r * 0.2} ${s.y + r * 0.4} ${s.x - s.m * r} ${s.y + r * 0.2}`}
              fill="none"
              stroke="var(--aot-ink)"
              strokeWidth={2.4 * (1 - q) + 0.4}
              strokeLinecap="round"
              opacity={0.9 * (1 - q)}
            />
          );
        })}

        {/* a bouncing marker over titans you've clicked */}
        {sim.titans
          .filter((t) => t.clicked && t.state === 'walk')
          .map((t) => {
            const c = titanPoint(sim, t, titanAnatomy(t.look).crown);
            const y = c.y - (10 + Math.abs(Math.sin(sim.time * 6)) * 5) * k;
            const s = 5 * k;
            return (
              <path key={`mark-${t.id}`} d={`M${c.x - s} ${y - s} L${c.x + s} ${y - s} L${c.x} ${y} Z`} fill="var(--aot-ink)" />
            );
          })}

        {sim.scouts.map((sc) => {
          if (sc.state === 'away') return null;
          const S = SCOUT_SCALE * k;
          const perched = sc.state === 'perch' || sc.state === 'launch';
          const crouch = sc.state === 'launch' ? Math.sin((sc.t / LAUNCH) * (Math.PI / 2)) : landSquash(sc.land);
          return (
            <g key={sc.who}>
              {sc.wires.map((w, i) => (
                <line
                  key={i}
                  x1={sc.pos.x}
                  y1={sc.pos.y - lift(sim)}
                  x2={w.x}
                  y2={w.y}
                  stroke="var(--aot-ink)"
                  strokeWidth={0.7}
                  strokeOpacity={0.6}
                />
              ))}
              {sc.state === 'perch' || sc.state === 'launch' ? (
                <g
                  transform={`translate(${sc.pos.x} ${sc.pos.y}) scale(${sc.face * S * (1 + crouch * 0.12)} ${S * (1 - crouch * 0.24)})`}
                >
                  <ScoutFigure who={sc.who} wave={sim.time * 5} pose="perch" lag={sc.capeLag} />
                </g>
              ) : (
                <g transform={`translate(${sc.pos.x} ${sc.pos.y - lift(sim)}) rotate(${sc.angle + sc.spin}) scale(${S})`}>
                  <ScoutFigure who={sc.who} wave={sim.time * 14} pose="fly" lag={sc.capeLag} />
                </g>
              )}
              {/* Eren can be clicked to transform: a generous invisible hit area */}
              {sc.who === 'eren' && animated && !sim.shifter && (
                <circle
                  cx={sc.pos.x}
                  cy={perched ? sc.pos.y - 12 * S : sc.pos.y - lift(sim)}
                  r={18 * Math.max(k, 0.8)}
                  fill="transparent"
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onPointerDown={() => transform(sim, sc)}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default TitanStrip;
