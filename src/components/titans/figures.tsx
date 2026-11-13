import React from 'react';
import { HEAD_SCALE, NECK_TOP, type ScoutName, type TitanLook } from './anatomy';

export type { ScoutName, TitanLook } from './anatomy';

/**
 * Original ink-style figures for the titan town. Every colour is a CSS
 * variable set on the strip (see TitanStrip), mixed from the site's
 * foreground and background, so the whole scene follows light/dark mode.
 * Shapes are solid fills with a thin ink outline, like a manga panel.
 */

const C = {
  bg: 'var(--aot-bg)',
  titan: 'var(--aot-titan)',
  titanFar: 'var(--aot-titan-far)',
  titanLine: 'var(--aot-titan-line)',
  titanDetail: 'var(--aot-titan-detail)',
  ink: 'var(--aot-ink)',
  jacket: 'var(--aot-jacket)',
  pants: 'var(--aot-pants)',
  skin: 'var(--aot-skin)',
  cloak: 'var(--aot-cloak)',
  steel: 'var(--aot-steel)',
  blond: 'var(--aot-blond)',
  propBack: 'var(--aot-prop-back)',
  propLine: 'var(--aot-prop-line)',
  scarf: 'var(--aot-scarf)',
  cloud: 'var(--aot-cloud)',
  shifter: 'var(--aot-shifter)',
  shifterFar: 'var(--aot-shifter-far)',
  shifterLine: 'var(--aot-shifter-line)',
  shifterHair: 'var(--aot-shifter-hair)',
  shifterEye: 'var(--aot-shifter-eye)',
  cloudLine: 'var(--aot-cloud-line)',
};


/**
 * One pen for the whole scene: characters are outlined at 1px, scenery a
 * touch lighter so it sits behind them, and interior details (ribs, teeth,
 * creases) lighter still. Widths are screen pixels whatever the figure's size.
 */
const W = { figure: 1, scenery: 0.75, detail: 0.6, feature: 1.2 };

const line = (color: string, width = W.figure) => ({
  stroke: color,
  strokeWidth: width,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
  vectorEffect: 'non-scaling-stroke' as const,
});

/** A stroke that scales with the figure (for a scout's limbs drawn as thick lines). */
const limb = (color: string, width: number) => ({
  stroke: color,
  strokeWidth: width,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
  fill: 'none',
});

type Pt = { x: number; y: number };
const D2R = Math.PI / 180;
const n2 = (v: number) => Math.round(v * 100) / 100;

/** A tapered capsule from `a` (half-width `ra`) to `b` (half-width `rb`), with rounded ends. */
const capsule = (a: Pt, b: Pt, ra: number, rb: number) => {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  const [nx, ny] = [-uy, ux];
  const k = 1.8; // quadratic cap control distance, in half-widths: close to a semicircle
  return [
    `M${n2(a.x + nx * ra)} ${n2(a.y + ny * ra)}`,
    `L${n2(b.x + nx * rb)} ${n2(b.y + ny * rb)}`,
    `Q${n2(b.x + ux * rb * k)} ${n2(b.y + uy * rb * k)} ${n2(b.x - nx * rb)} ${n2(b.y - ny * rb)}`,
    `L${n2(a.x - nx * ra)} ${n2(a.y - ny * ra)}`,
    `Q${n2(a.x - ux * ra * k)} ${n2(a.y - uy * ra * k)} ${n2(a.x + nx * ra)} ${n2(a.y + ny * ra)}`,
    'Z',
  ].join(' ');
};

/**
 * Where a two-part limb's joint and end land. `a` is the upper part's angle
 * from straight down (positive swings toward -x, the way the figures face);
 * the lower part is turned back by `bend` (negative bends it forward, like an elbow).
 */
const joint = (root: Pt, a: number, bend: number, l1: number, l2: number) => {
  const mid = { x: root.x - Math.sin(a * D2R) * l1, y: root.y + Math.cos(a * D2R) * l1 };
  const end = { x: mid.x - Math.sin((a - bend) * D2R) * l2, y: mid.y + Math.cos((a - bend) * D2R) * l2 };
  return { mid, end, lower: a - bend };
};

/**
 * A jointed, tapered limb: the lower part is drawn first so the upper part's
 * rounded end sits over it and reads as the knee or elbow.
 */
const Limb: React.FC<{
  root: Pt;
  a: number;
  bend: number;
  l1: number;
  l2: number;
  r: [number, number, number];
  fill: string;
  stroke: string;
  /** Drawn on top of the lower part: a foot, hand or fist. */
  end?: (j: ReturnType<typeof joint>) => React.ReactNode;
}> = ({ root, a, bend, l1, l2, r, fill, stroke, end }) => {
  const j = joint(root, a, bend, l1, l2);
  return (
    <g>
      <path d={capsule(j.mid, j.end, r[1] * 0.92, r[2])} fill={fill} {...line(stroke)} />
      {end?.(j)}
      <path d={capsule(root, j.mid, r[0], r[1])} fill={fill} {...line(stroke)} />
    </g>
  );
};

/** A flat foot pointing forward (-x) from the ankle. */
const footAt = (ankle: Pt, size: number, fill: string, stroke: string) => (
  <path
    d={capsule({ x: ankle.x + size * 0.2, y: ankle.y + size * 0.2 }, { x: ankle.x - size * 1.9, y: ankle.y + size * 0.55 }, size * 0.75, size * 0.55)}
    fill={fill}
    {...line(stroke)}
  />
);

/* ------------------------------------------------------------------ titans */

const TORSO: Record<TitanLook['kind'], string> = {
  lanky:
    'M-8 -45 C-13 -52 -12 -62 -10 -70 C-9 -75 -9 -79 -6 -83 L-4.5 -90 L4.5 -90 L6 -85 C10 -83 13 -78 13 -70 C13 -60 11 -52 8 -45 Z',
  brute:
    'M-10 -45 C-15 -52 -16 -62 -15 -71 C-14 -77 -11 -81 -6 -83 L-4 -87 L4 -87 L7 -84 C13 -83 17 -78 16 -69 C15 -59 12 -51 9 -45 Z',
  grinner: 'M-7 -45 C-12 -51 -12 -61 -9 -67 C-7 -71 -5 -74 -3 -76 L4 -76 C8 -73 12 -68 11 -60 C11 -53 9 -48 7 -45 Z',
};

const TORSO_DETAIL: Record<TitanLook['kind'], string> = {
  // ribs showing through a thin chest, and a navel
  lanky: 'M-8 -67 Q-4 -65 0 -67 M-8 -63 Q-4 -61 0 -63 M-7.4 -59 Q-4 -57.4 -0.6 -59 M-9.4 -51 Q-8.4 -49.6 -7.4 -51',
  // pecs, abs and a collarbone
  brute: 'M-13 -73 Q-6 -68 1 -73 M-12 -65 L-12 -52 M-12 -59 Q-9 -58 -6 -59 M-6 -82 Q-1 -80 4 -82',
  // a sagging belly
  grinner: 'M-11 -55 Q-6 -50 0 -52 M-8.6 -58 Q-7.8 -57 -7 -58',
};

/** The head, centred on (0,0), facing left. */
const TitanHead: React.FC<{ look: TitanLook }> = ({ look }) => {
  const grin = look.kind === 'grinner';
  return (
    <g>
      {look.hair === 2 && (
        <path
          d="M-9 -8 C-6 -17 7 -18 12 -9 C15 -2 15 9 13 19 L9 17 L10 7 L7 -4 L-3 -8 Z"
          fill={C.titanDetail}
          {...line(C.titanLine)}
        />
      )}
      <ellipse cx={6} cy={1} rx={2.6} ry={3.6} fill={C.titan} {...line(C.titanLine)} />
      {/* skull, long jaw and a nose bump on the facing side */}
      <path
        d={
          grin
            ? 'M-12 -1 C-13 -10 -6 -14 1 -13.4 C8 -12.6 12 -7 11.4 1 C11 8 7 12.4 0 12.6 C-6 12.6 -11 10 -12.6 5 L-14.2 2.4 Z'
            : 'M-10.4 -2 C-11.4 -10 -6 -13.6 1 -13 C7.6 -12.4 11.4 -6.6 10.6 1 C10 8 6.4 13 0.6 13.4 C-4.6 13.6 -8.4 11 -10 6.4 L-12.6 3 L-10.6 1 Z'
        }
        fill={C.titan}
        {...line(C.titanLine)}
      />
      {/* deep-set eye under a heavy brow */}
      <path d="M-10 -5.4 Q-6.6 -7 -3 -5" fill="none" {...line(C.titanLine, W.feature)} />
      <ellipse cx={-6.4} cy={-2.6} rx={2.6} ry={1.9} fill={C.bg} {...line(C.titanLine, W.detail)} />
      <circle cx={-7} cy={-2.6} r={0.95} fill={C.titanLine} />
      {/* the grin: lips pulled back over rows of teeth */}
      <path
        d={grin ? 'M-13.4 3 Q-3 10.6 7.6 4.4 Q-2 13.4 -13 6.4 Z' : 'M-11.6 4.4 Q-4.6 8.6 3 5.6 Q-4 11.4 -11.2 6.8 Z'}
        fill={C.bg}
        {...line(C.titanLine)}
      />
      <path
        d={
          grin
            ? 'M-10.6 5.2 L-10.4 8 M-7.6 6.4 L-7.4 9.6 M-4.4 7.2 L-4.2 10.2 M-1.2 7.4 L-1 10 M2 6.8 L2.2 9.2 M5 5.4 L5 7.4'
            : 'M-9 5.8 L-8.8 7.8 M-6.6 6.6 L-6.4 8.8 M-4 7 L-3.8 9 M-1.4 6.8 L-1.2 8.6 M1 6.2 L1.2 7.6'
        }
        fill="none"
        {...line(C.titanLine, W.detail)}
      />
      {/* cheek crease */}
      <path d="M-4 1.2 Q-1.4 3.6 -2 6.4" fill="none" {...line(C.titanDetail, W.detail)} />
      {look.hair === 1 && (
        <path
          d="M-10 -5 C-9.4 -14 0 -16.4 8 -12.4 C12 -10 13.4 -4 12.4 2.4 L9.6 -1.6 L8.8 3.6 L5.6 -3.4 L3.4 0 L1.4 -6.4 L-2.6 -4.4 L-4.6 -9.4 L-7.4 -5 Z"
          fill={C.titanDetail}
          {...line(C.titanLine)}
        />
      )}
    </g>
  );
};

/** Limb thickness per titan kind: brutes are heavy-limbed, lanky ones stringy. */
const BUILD: Record<TitanLook['kind'], number> = { lanky: 0.9, brute: 1.25, grinner: 1 };

/**
 * A titan facing left, feet at (0,0), roughly 105 units tall. `phase` is the
 * walk cycle in radians and `stride` scales it (0 stands still): knees bend
 * as each leg swings through, arms swing a beat behind the legs, and the head
 * nods a beat behind that.
 */
export const TitanFigure: React.FC<{ look: TitanLook; phase: number; stride: number }> = ({
  look,
  phase,
  stride,
}) => {
  const hipY = -45;
  const shoulderY = NECK_TOP[look.kind] + 8;
  const armLen = (look.kind === 'grinner' ? 34 : 46) * look.arm;
  const hs = HEAD_SCALE[look.kind];
  const headY = NECK_TOP[look.kind] - 10 * hs;
  const b = BUILD[look.kind];

  const leg = (p: number, far: boolean) => {
    const fill = far ? C.titanFar : C.titan;
    return (
      <Limb
        root={{ x: far ? 1.5 : -1, y: hipY }}
        a={Math.sin(p) * 24 * stride}
        // the knee folds most while the leg swings forward under the body
        bend={4 + 32 * Math.max(0, Math.cos(p)) * stride}
        l1={23}
        l2={23}
        r={[6 * b, 4.2 * b, 3.1 * b]}
        fill={fill}
        stroke={C.titanLine}
        end={(j) => footAt(j.end, 4.2 * b, fill, C.titanLine)}
      />
    );
  };

  const arm = (p: number, far: boolean) => {
    const fill = far ? C.titanFar : C.titan;
    // swings opposite its leg, half a beat late, with the elbow loose
    const lagged = p - 0.45;
    return (
      <Limb
        root={{ x: far ? 3 : 0.5, y: shoulderY }}
        a={-Math.sin(lagged) * 16 * stride + (far ? 5 : 2)}
        bend={-(9 + 16 * Math.max(0, -Math.sin(lagged)) * stride)}
        l1={armLen * 0.47}
        l2={armLen * 0.5}
        r={[4.2 * b, 3.1 * b, 2.5 * b]}
        fill={fill}
        stroke={C.titanLine}
        end={(j) => (
          <g transform={`translate(${n2(j.end.x)} ${n2(j.end.y)}) rotate(${n2(-j.lower)})`}>
            {/* a big, slack hand with the fingers hanging */}
            <path
              d={`M${-3.2 * b} -1 C${-3.6 * b} ${3 * b} ${-2 * b} ${5.6 * b} 0 ${5.8 * b} C${2.2 * b} ${5.6 * b} ${3.4 * b} ${3 * b} ${3 * b} -1 Z`}
              fill={fill}
              {...line(C.titanLine)}
            />
            <path
              d={`M${-1.2 * b} ${2.4 * b} L${-1.1 * b} ${4.6 * b} M${0.6 * b} ${2.6 * b} L${0.7 * b} ${4.8 * b}`}
              fill="none"
              {...line(C.titanLine, W.detail)}
            />
          </g>
        )}
      />
    );
  };

  const nod = Math.sin(phase * 2 - 0.8) * 2.5 * stride;

  return (
    <g>
      {leg(phase + Math.PI, true)}
      {arm(phase, true)}
      <path d={TORSO[look.kind]} fill={C.titan} {...line(C.titanLine)} />
      <path d={TORSO_DETAIL[look.kind]} fill="none" {...line(C.titanDetail, W.detail)} />
      <g transform={`translate(-3 ${headY}) rotate(${n2(nod)} 3 ${10 * hs}) scale(${hs})`}>
        <TitanHead look={look} />
      </g>
      {leg(phase, false)}
      {arm(phase + Math.PI, false)}
    </g>
  );
};

/* ------------------------------------------------------- the attack titan */

/**
 * Eren's titan, facing left with feet at (0,0), about 120 units tall: lean
 * and muscled, long dark hair, pointed ears, a lipless jaw of bared teeth and
 * green eyes. `run` is the run-cycle phase in radians; `stride` scales the
 * motion (0 stands still).
 */
export const AttackTitanFigure: React.FC<{ run: number; stride: number }> = ({ run, stride }) => {
  const hip = { x: 0, y: -52 };
  const shoulder = { x: 1, y: -90 };
  const sw = Math.sin(run) * 38 * stride;
  const legBend = (p: number) => (12 + 70 * Math.max(0, Math.sin(p))) * stride + 4;
  const bob = Math.abs(Math.cos(run)) * 3 * stride;

  const leg = (a: number, bend: number, far: boolean) => {
    const fill = far ? C.shifterFar : C.shifter;
    return (
      <Limb
        root={{ x: hip.x + (far ? 2 : -1), y: hip.y }}
        a={a}
        bend={bend}
        l1={27}
        l2={27}
        r={[6.8, 4.6, 3.3]}
        fill={fill}
        stroke={C.shifterLine}
        end={(j) => footAt(j.end, 4.4, fill, C.shifterLine)}
      />
    );
  };
  const arm = (a: number, far: boolean) => {
    const fill = far ? C.shifterFar : C.shifter;
    return (
      <Limb
        root={{ x: shoulder.x + (far ? 3 : 0), y: shoulder.y }}
        a={a}
        bend={-(30 + 60 * stride)}
        l1={22}
        l2={21}
        r={[5, 3.8, 3]}
        fill={fill}
        stroke={C.shifterLine}
        end={(j) => <circle cx={n2(j.end.x)} cy={n2(j.end.y)} r={4.6} fill={fill} {...line(C.shifterLine)} />}
      />
    );
  };

  return (
    // lean into the run
    <g transform={`translate(0 ${n2(-bob)}) rotate(${n2(-14 * stride)} 0 -52)`}>
      {leg(-sw, legBend(run - Math.PI / 2), true)}
      {arm(sw * 0.9, true)}

      {/* long hair falling down the back */}
      <path
        d="M-2 -116 C8 -120 16 -112 16 -100 C17 -92 15 -84 12 -78 L8 -84 L7 -76 L3 -86 Z"
        fill={C.shifterHair}
        {...line(C.shifterLine)}
      />
      {/* lean, V-shaped torso */}
      <path
        d="M-9 -50 C-15 -60 -16 -74 -14 -84 C-11 -92 -5 -96 4 -96 C12 -95 17 -89 16 -79 C15 -67 11 -57 8 -50 Z"
        fill={C.shifter}
        {...line(C.shifterLine)}
      />
      <path
        d="M-13 -83 Q-6 -78 2 -83 M-12 -74 L-12 -56 M-12 -68 Q-9 -67 -6 -68 M-12 -62 Q-9 -61 -6 -62 M-5 -94 Q1 -92 7 -94"
        fill="none"
        {...line(C.shifterLine, W.detail)}
      />
      {/* neck */}
      <path d="M-5 -95 L-4 -103 L5 -103 L7 -95 Z" fill={C.shifter} {...line(C.shifterLine)} />
      {/* head */}
      <g transform="translate(-3 -112)">
        <path
          d="M-10 -2 C-11 -10 -5 -13 1 -12.6 C7.6 -12 11 -6.6 10.4 1 C10 7.6 6.4 12 0.6 12.4 C-4.6 12.6 -8.4 10.4 -10 6 L-11.6 2.6 L-10.2 1 Z"
          fill={C.shifter}
          {...line(C.shifterLine)}
        />
        {/* pointed ear */}
        <path d="M4 -2 L10.6 -9 L8 1 Z" fill={C.shifter} {...line(C.shifterLine)} />
        {/* heavy brow over a glowing green eye */}
        <path d="M-10 -5.6 L-2.6 -3.8" fill="none" {...line(C.shifterLine, W.feature)} />
        <ellipse cx={-6.4} cy={-2.4} rx={2.4} ry={1.5} fill={C.shifterEye} {...line(C.shifterLine, W.detail)} />
        {/* no lips: bared teeth and cheek muscle running back to the jaw */}
        <path d="M-11.4 3.4 L1.6 4.4 L1.4 8.8 L-10.4 8 Z" fill={C.bg} {...line(C.shifterLine)} />
        <path
          d="M-11 5.9 L1.5 6.6 M-8.6 3.6 L-8.4 8.2 M-6 3.8 L-5.8 8.4 M-3.4 4 L-3.2 8.6 M-0.8 4.2 L-0.6 8.7"
          fill="none"
          {...line(C.shifterLine, W.detail)}
        />
        <path d="M1.6 4.4 Q5 3 6.4 5.4 M1.4 8.8 Q4.6 9.8 6.2 7.4" fill="none" {...line(C.shifterLine, W.detail)} />
        {/* hair over the crown */}
        <path
          d="M-10 -4 C-10 -13 -2 -16.6 5 -14 C10 -12 12.6 -6.4 12 0 L9 -5 L8.4 2 L5.4 -6 L1 -7.4 L-4 -6.6 Z"
          fill={C.shifterHair}
          {...line(C.shifterLine)}
        />
      </g>

      {leg(sw, legBend(run + Math.PI / 2), false)}
      {arm(-sw * 0.9, false)}
    </g>
  );
};

/* ------------------------------------------------------------------ scouts */

const HAIR: Record<ScoutName, string> = {
  // chin-length straight bob
  mikasa: 'M-3.8 -12 C-4.3 -17.6 4.3 -17.6 3.8 -12 L4 -8.4 L2.6 -9.4 L-2.6 -9.4 L-4 -8.4 Z',
  // big round bowl cut
  armin: 'M-4.8 -11.4 C-5.6 -19.2 5.6 -19.2 4.8 -11.4 L5 -8.4 L3.2 -9.6 L-3.2 -9.6 L-5 -8.4 Z',
  // messy, spiky hair swept back
  eren: 'M-3.6 -12 L-5.4 -14.4 L-3.4 -15 L-4.2 -17.6 L-1.6 -16.2 L-0.8 -18.8 L0.8 -16.4 L3 -18.2 L2.8 -15.4 L5.2 -15.6 L3.6 -12 Z',
};

/** Head centred at (0,-12.5): face, then hair. */
const ScoutHead: React.FC<{ who: ScoutName }> = ({ who }) => (
  <g>
    <circle cx={0} cy={-12.5} r={3.1} fill={C.skin} {...line(C.ink)} />
    <path d={HAIR[who]} fill={who === 'armin' ? C.blond : C.ink} {...line(C.ink)} />
  </g>
);

/** Light trousers with an ink outline, and dark boots. */
const Leg: React.FC<{ d: string; boot: string }> = ({ d, boot }) => (
  <g>
    <path d={d} {...limb(C.ink, 3.1)} />
    <path d={d} {...limb(C.pants, 1.9)} />
    <path d={boot} {...limb(C.ink, 2.6)} />
  </g>
);

/**
 * In flight: origin at the waist, head pointing to -y (the strip rotates the
 * figure so the head leads the motion). Arms forward, legs trailing.
 */
const Flying: React.FC<{ who: ScoutName; w1: number; w2: number; lag: number }> = ({ who, w1, w2, lag }) => (
  <g>
    {/* cape and scarf hang from the shoulders and trail behind turns */}
    <g transform={`rotate(${n2(lag)} 0 -9)`}>
    {(
      <path
        d={`M-3.4 -9 C-6.4 -2 ${-7.4 + w1} 6 ${-6.4 + w2} 13 L${-1 + w1} 11 L${3 + w2} 14 C${5.4 + w1} 6 5.4 -2 3.4 -9 Z`}
        fill={C.cloak}
        {...line(C.ink)}
      />
    )}
    {who === 'mikasa' && (
      <path
        d={`M-2 -10 C${-4 + w1} -2 ${3 + w2} 6 ${-1 + w1} 14 C${-3 + w2} 18 ${2 + w1} 21 ${1 + w2} 24
            L${3 + w2} 23 C${4 + w1} 19 ${0 + w2} 16 ${2 + w1} 12 C${5 + w2} 5 ${-1 + w1} -3 2 -10 Z`}
        fill={C.scarf}
        {...line(C.ink)}
      />
    )}
    </g>
    <Leg d="M-1.3 1.4 L-1.7 10.6" boot="M-1.6 7.6 L-1.7 10.8" />
    <Leg d="M1.3 1.4 L1.5 10.6" boot="M1.5 7.6 L1.5 10.8" />
    {/* short jacket over a light shirt */}
    <path d="M-3 -9.2 L3 -9.2 L2.6 2 L-2.6 2 Z" fill={C.jacket} {...line(C.ink)} />
    <path d="M-0.9 -9.2 L0 -5.4 L0.9 -9.2" fill={C.pants} />
    {/* the gear harness belt */}
    <path d="M-2.7 -0.4 L2.7 -0.4" fill="none" {...line(C.ink, W.detail)} />
    {/* gear canisters on both hips */}
    <rect x={-6} y={-1.6} width={2.8} height={5} rx={0.9} fill={C.steel} {...line(C.ink)} />
    <rect x={3.2} y={-1.6} width={2.8} height={5} rx={0.9} fill={C.steel} {...line(C.ink)} />
    {/* arms forward, long blades */}
    <path d="M-2.6 -8 L-5.6 -12 M2.6 -8 L5.6 -12" {...limb(C.jacket, 1.8)} />
    <path d="M-5.6 -12 L-7.8 -21 M5.6 -12 L7.8 -21" {...limb(C.steel, 1)} />
    <ScoutHead who={who} />
    {who === 'mikasa' && <rect x={-2.8} y={-10.4} width={5.6} height={2.1} rx={1} fill={C.scarf} />}
  </g>
);

/**
 * Crouched on a rooftop or branch: origin at the feet, facing +x, blades
 * held low and back, ready to jump.
 */
const Perched: React.FC<{ who: ScoutName; w1: number; w2: number; lag: number }> = ({ who, w1, w2, lag }) => (
  <g>
    {/* cape and scarf hang from the shoulders; they flick up on landing and settle */}
    <g transform={`rotate(${n2(lag)} 1.2 -17)`}>
    {(
      <path
        d={`M2.8 -16.8 C-1.2 -15.6 ${-4.8 + w1 * 0.5} -10.6 ${-6.4 + w2 * 0.4} -5 L${-2 + w1 * 0.4} -6 C-1 -10 -0.6 -13.6 -0.4 -17.2 Z`}
        fill={C.cloak}
        {...line(C.ink)}
      />
    )}
    {who === 'mikasa' && (
      <path
        d={`M2 -18.2 C${-2 + w1 * 0.4} -18.8 ${-6 + w2 * 0.5} ${-16.2 + w1 * 0.4} ${-10.6 + w1 * 0.4} ${-17 + w2 * 0.5}
            L${-10.2 + w2 * 0.4} ${-15.2 + w1 * 0.4} C${-6 + w1 * 0.4} -14.4 ${-2 + w2 * 0.3} -16.4 1.6 -16.4 Z`}
        fill={C.scarf}
        {...line(C.ink)}
      />
    )}
    </g>
    <Leg d="M-1 -9 L-3.6 -4.6 L-2.6 -0.6" boot="M-3.4 -3.4 L-2.6 -0.4" />
    {/* jacket, leaning forward */}
    <path d="M-2.4 -8.2 L1.9 -8.2 L4 -17 L-0.3 -17.9 Z" fill={C.jacket} {...line(C.ink)} />
    <path d="M-2.2 -9.4 L2.2 -9.4" fill="none" {...line(C.ink, W.detail)} />
    <rect x={-4.8} y={-10.8} width={3.2} height={4.4} rx={0.9} fill={C.steel} {...line(C.ink)} />
    <Leg d="M0.4 -9 L3.4 -5 L1.8 -0.6" boot="M3 -3.6 L1.8 -0.4" />
    {/* arm down and back, blade trailing behind */}
    <path d="M2.6 -16 L0.8 -12 L-0.6 -11" {...limb(C.jacket, 1.8)} />
    <path d="M-0.6 -11 L-9.4 -9.2" {...limb(C.steel, 1)} />
    <g transform="translate(2.7 -8.2)">
      <ScoutHead who={who} />
      {who === 'mikasa' && <rect x={-2.8} y={-10.2} width={5.6} height={2.1} rx={1} fill={C.scarf} />}
    </g>
  </g>
);

export const ScoutFigure: React.FC<{
  who: ScoutName;
  wave: number;
  pose: 'fly' | 'perch';
  /** How far the cape and scarf swing from rest, in degrees (follow-through). */
  lag?: number;
}> = ({ who, wave, pose, lag = 0 }) => {
  const w1 = Math.sin(wave) * 2.2;
  const w2 = Math.sin(wave + 1.3) * 3;
  const size = who === 'eren' ? 1.06 : 1;
  return (
    <g transform={`scale(${size})`}>
      {pose === 'fly' ? (
        <Flying who={who} w1={w1} w2={w2} lag={lag} />
      ) : (
        <Perched who={who} w1={w1} w2={w2} lag={lag} />
      )}
    </g>
  );
};

/* ------------------------------------------------------------------- town */

/** A house with a pitched, tiled roof; origin at the bottom-left corner. */
export const House: React.FC<{ w: number; h: number; roof: number; chimney: boolean; fill: string }> = ({
  w,
  h,
  roof,
  chimney,
  fill,
}) => (
  <g>
    {chimney && (
      <rect
        x={w * 0.64}
        y={-h - roof * 0.92}
        width={w * 0.11}
        height={roof * 0.62}
        fill={fill}
        {...line(C.propLine, W.scenery)}
      />
    )}
    <rect x={0} y={-h} width={w} height={h} fill={fill} {...line(C.propLine, W.scenery)} />
    <path d={`M0 ${-h * 0.55} L${w} ${-h * 0.55}`} fill="none" {...line(C.propLine, W.detail)} />
    <path d={`M${-w * 0.08} ${-h} L${w / 2} ${-h - roof} L${w * 1.08} ${-h} Z`} fill={fill} {...line(C.propLine, W.scenery)} />
    {/* roof tiles */}
    <path
      d={`M${w * 0.12} ${-h - roof * 0.25} L${w * 0.88} ${-h - roof * 0.25} M${w * 0.28} ${-h - roof * 0.55} L${w * 0.72} ${-h - roof * 0.55}`}
      fill="none"
      {...line(C.propLine, W.detail)}
    />
    <rect x={w * 0.14} y={-h * 0.44} width={w * 0.16} height={h * 0.22} fill={C.bg} {...line(C.propLine, W.detail)} />
    <rect x={w * 0.7} y={-h * 0.44} width={w * 0.16} height={h * 0.22} fill={C.bg} {...line(C.propLine, W.detail)} />
    <rect x={w * 0.42} y={-h * 0.36} width={w * 0.16} height={h * 0.36} fill={C.bg} {...line(C.propLine, W.detail)} />
  </g>
);

/** A tall layered pine; origin at the base of the trunk. Scouts perch on the tip. */
export const Tree: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const tiers = [0, 1, 2, 3].map((i) => {
    const top = -h + i * h * 0.17;
    const bottom = top + h * 0.3;
    const hw = w * (0.24 + i * 0.09);
    return `M0 ${top} L${hw} ${bottom} Q${hw * 0.4} ${bottom - 2} 0 ${bottom + 1} Q${-hw * 0.4} ${bottom - 2} ${-hw} ${bottom} Z`;
  });
  return (
    <g>
      <rect
        x={-w * 0.07}
        y={-h * 0.32}
        width={w * 0.14}
        height={h * 0.32}
        fill={C.propBack}
        {...line(C.propLine, W.scenery)}
      />
      {tiers.map((d, i) => (
        <path key={i} d={d} fill={C.propBack} {...line(C.propLine, W.scenery)} />
      ))}
    </g>
  );
};

/** A puffy cloud, flat along the bottom; origin at its bottom-left corner. */
export const Cloud: React.FC<{ w: number; puff: number }> = ({ w, puff }) => {
  const h = w * 0.36;
  return (
    <path
      d={`M0 0 L${w} 0 C${w + h * 0.5} 0 ${w + h * 0.4} ${-h * 0.62} ${w * 0.84} ${-h * 0.56}
          C${w * 0.82} ${-h * (1.05 + puff * 0.2)} ${w * 0.56} ${-h * (1.12 + puff * 0.15)} ${w * 0.5} ${-h * 0.72}
          C${w * 0.44} ${-h * (1.3 - puff * 0.2)} ${w * 0.16} ${-h * 1.18} ${w * 0.2} ${-h * 0.58}
          C${-h * 0.2} ${-h * 0.7} ${-h * 0.4} 0 0 0 Z`}
      fill={C.cloud}
      {...line(C.cloudLine, W.scenery)}
    />
  );
};
