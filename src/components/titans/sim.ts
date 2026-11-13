import { titanAnatomy, type ScoutName, type TitanLook } from './anatomy';

/**
 * The titan town's simulation: titans walking, scouts hopping between
 * perches and attacking, Eren's transformation, steam and dust. Pure data and
 * functions with no React, so TitanStrip can step it once per frame and draw it.
 */

const SCOUTS: ScoutName[] = ['mikasa', 'eren', 'armin'];

export type Vec = { x: number; y: number };

export interface Prop {
  id: number;
  kind: 'house' | 'tree';
  layer: 'back' | 'front';
  x: number;
  w: number;
  h: number;
  roof: number;
  chimney: boolean;
  perch: Vec;
  /** Seconds of shaking left after a titan lands on it. */
  shake: number;
}

export interface Titan {
  id: number;
  x: number;
  /** -1 walks left, 1 walks right. */
  dir: -1 | 1;
  speed: number;
  s: number;
  sx: number;
  look: TitanLook;
  phase: number;
  state: 'walk' | 'fall' | 'down';
  t: number;
  targeted: boolean;
  clicked: boolean;
  fall: number;
  opacity: number;
}

export interface Scout {
  who: ScoutName;
  /** 'away' means Eren is off being a titan. */
  state: 'perch' | 'launch' | 'swing' | 'approach' | 'slash' | 'away';
  perch: number;
  /** Destination perch while swinging; -1 means swinging off screen. */
  toPerch: number;
  /** What to do once the launch crouch finishes. */
  next: (() => void) | null;
  titanId: number;
  t: number;
  dur: number;
  from: Vec;
  ctrl: Vec;
  to: Vec;
  pos: Vec;
  angle: number;
  spin: number;
  face: 1 | -1;
  wires: Vec[];
  puffClock: number;
  rest: number;
  /** Seconds left of the landing squash. */
  land: number;
  kills: number;
  /** Just landed in a tree after a kill: next hop goes to a house. */
  afterKill: boolean;
}

interface Puff {
  id: number;
  x: number;
  y: number;
  r0: number;
  r1: number;
  vy: number;
  vx: number;
  t: number;
  life: number;
  o: number;
}

interface Slash {
  id: number;
  x: number;
  y: number;
  m: number;
  t: number;
}

interface CloudState {
  id: number;
  x: number;
  y: number;
  w: number;
  puff: number;
  /** px/s, always drifting left to right; bigger clouds are nearer and faster. */
  speed: number;
}

/** Eren's Attack Titan, from the moment he transforms until he runs off screen. */
interface Shifter {
  x: number;
  /** Direction he runs: -1 left, 1 right. */
  dir: -1 | 1;
  stage: 'rise' | 'roar' | 'run';
  t: number;
  run: number;
}

interface Bolt {
  id: number;
  d: string;
  t: number;
}

export interface Sim {
  W: number;
  H: number;
  k: number;
  props: Prop[];
  farPath: string;
  clouds: CloudState[];
  frontRowPath: string;
  titans: Titan[];
  scouts: Scout[];
  puffs: Puff[];
  slashes: Slash[];
  nextAttack: number;
  nextSpawn: number;
  hover: number;
  /** Who made the last automatic kill, so scouts take turns. */
  lastAttacker: ScoutName | null;
  shifter: Shifter | null;
  bolts: Bolt[];
  /** When Eren swings back in as himself, and from which side. */
  erenBack: number;
  erenFromLeft: boolean;
  time: number;
}

const SLASH = 0.36;
const FALL = 1.05;
const DOWN = 3.2;
export const LAUNCH = 0.16;
export const LAND = 0.22;
/** Scout drawing scale (times the strip scale k). */
export const SCOUT_SCALE = 1.5;

let uid = 0;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;
const bez = (a: Vec, c: Vec, b: Vec, t: number): Vec => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});
const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);


/**
 * Empty sky at the top of the drawing, left out of the layout height. It's no
 * more than the gap above the highest cloud, so nothing overlaps the content.
 */
export const sky = (sim: { k: number }) => (sim.k < 1 ? 14 : 22);

const dims = (W: number) => {
  const small = W < 640;
  return { W, H: small ? 145 : 205, k: small ? 0.62 : 1 };
};

export const groundY = (sim: { H: number }) => sim.H - 4;
/** Art faces left; mirror it for titans walking right. */
export const mirror = (t: Titan) => (t.dir === -1 ? 1 : -1);
export const bob = (t: Titan) => (t.state === 'walk' ? Math.abs(Math.cos(t.phase)) * 2 : 0);
/** Flying figures are drawn around the waist, which sits this far above the feet. */
export const lift = (sim: Sim) => 9 * SCOUT_SCALE * sim.k;

export const titanPoint = (sim: Sim, t: Titan, p: Vec): Vec => ({
  x: t.x + p.x * t.s * t.sx * mirror(t),
  y: groundY(sim) + (p.y - bob(t)) * t.s,
});
const nape = (sim: Sim, t: Titan) => titanPoint(sim, t, titanAnatomy(t.look).nape);

const titanCount = (W: number) => (W < 640 ? 1 : W < 1100 ? 2 : 3);
const scoutCount = (W: number) => (W < 900 ? 1 : 2);

function seeded(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/** Houses and tall trees spread across the width; every one is a perch. */
function buildScene(W: number, H: number, k: number): Prop[] {
  const g = groundY({ H });
  const r = seeded(11);
  const props: Prop[] = [];
  let x = (30 + r() * 30) * k;
  let i = 0;
  let houses = 0;
  while (x < W - 40 * k) {
    const kind: Prop['kind'] = i % 3 === 1 || (i > 2 && r() < 0.25) ? 'tree' : 'house';
    if (kind === 'house') {
      const w = (40 + r() * 18) * k;
      const h = (24 + r() * 10) * k;
      const roof = (15 + r() * 8) * k;
      // every other house stands in front of the titans
      const layer = houses++ % 2 === 0 ? 'front' : 'back';
      props.push({
        id: i,
        kind,
        layer,
        x,
        w,
        h,
        roof,
        chimney: r() < 0.5,
        perch: { x: x + w / 2, y: g - h - roof },
        shake: 0,
      });
      x += w;
    } else {
      const w = (30 + r() * 10) * k;
      const h = (95 + r() * 23) * k;
      const cx = x + w / 2;
      props.push({
        id: i,
        kind,
        layer: 'back',
        x: cx,
        w,
        h,
        roof: 0,
        chimney: false,
        perch: { x: cx, y: g - h + 3 * k },
        shake: 0,
      });
      x += w;
    }
    x += (80 + r() * 90) * k;
    i++;
  }
  return props;
}

/** A few clouds spread over the sky, high in the drawing. */
function makeClouds(W: number, H: number, k: number): CloudState[] {
  const n = Math.max(2, Math.round(W / 300));
  return Array.from({ length: n }, (_, i) => makeCloud(W, H, k, ((i + rand(0.1, 0.9)) * W) / n));
}

function makeCloud(W: number, H: number, k: number, x?: number): CloudState {
  const w = rand(46, 90) * k;
  return {
    id: ++uid,
    x: x ?? -w - rand(0, 80),
    // between the top of the drawing and just above the tallest trees
    y: rand(0.32, 0.47) * H,
    w,
    puff: Math.random(),
    speed: (w / (90 * k)) * rand(5, 9) * k,
  };
}

/** A row of rooftops; `low` makes the short front row that hides titans' feet. */
function rooftops(W: number, H: number, k: number, seed: number, low: boolean) {
  const g = groundY({ H });
  const r = seeded(seed);
  const parts: string[] = [];
  let x = -10;
  while (x < W + 10) {
    const w = (low ? 26 + r() * 30 : 22 + r() * 34) * k;
    const h = (low ? 6 + r() * 8 : 12 + r() * 20) * k;
    const roof = (low ? 5 + r() * 6 : 6 + r() * 9) * k;
    parts.push(`M${x} ${g} L${x} ${g - h} L${x + w / 2} ${g - h - roof} L${x + w} ${g - h} L${x + w} ${g} Z`);
    x += w + (low ? 2 + r() * 14 : r() * 10) * k;
  }
  return parts.join(' ');
}

function makeTitan(sim: Sim, x?: number): Titan {
  const d: -1 | 1 = Math.random() < 0.5 ? -1 : 1;
  const roll = Math.random();
  const kind: TitanLook['kind'] = roll < 0.45 ? 'lanky' : roll < 0.75 ? 'brute' : 'grinner';
  const s = rand(0.9, 1.22) * sim.k * (kind === 'grinner' ? 0.95 : 1);
  return {
    id: ++uid,
    x: x ?? (d === -1 ? sim.W + 70 * s : -70 * s),
    dir: d,
    speed: rand(17, 26) * sim.k,
    s,
    sx: kind === 'brute' ? rand(1.1, 1.25) : kind === 'grinner' ? rand(1.05, 1.2) : rand(0.92, 1.05),
    look: { kind, hair: Math.floor(Math.random() * 3) as 0 | 1 | 2, arm: kind === 'brute' ? 0.9 : rand(1, 1.2) },
    phase: rand(0, Math.PI * 2),
    state: 'walk',
    t: 0,
    targeted: false,
    clicked: false,
    fall: 0,
    opacity: 1,
  };
}

function shuffled<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeScout(who: ScoutName, pos: Vec, perch: number): Scout {
  return {
    who,
    state: 'perch',
    perch,
    toPerch: perch,
    next: null,
    titanId: 0,
    t: 0,
    dur: 1,
    from: { ...pos },
    ctrl: { ...pos },
    to: { ...pos },
    pos: { ...pos },
    angle: 0,
    spin: 0,
    face: 1,
    wires: [],
    puffClock: 0,
    rest: rand(1, 3),
    land: 0,
    kills: 0,
    afterKill: false,
  };
}

export function createSim(width: number): Sim {
  const { W, H, k } = dims(width);
  const props = buildScene(W, H, k);
  const sim: Sim = {
    W,
    H,
    k,
    props,
    farPath: rooftops(W, H, k, 7, false),
    frontRowPath: rooftops(W, H, k, 23, true),
    clouds: makeClouds(W, H, k),
    titans: [],
    scouts: [],
    puffs: [],
    slashes: [],
    nextAttack: 3,
    nextSpawn: 0,
    hover: 0,
    lastAttacker: null,
    shifter: null,
    bolts: [],
    erenBack: -1,
    erenFromLeft: true,
    time: 0,
  };
  const n = titanCount(W);
  for (let i = 0; i < n; i++) sim.titans.push(makeTitan(sim, (W * (i + 0.5)) / n + rand(-40, 40)));

  // start each scout on the house nearest its share of the screen
  const houses = props.map((p, i) => (p.kind === 'house' ? i : -1)).filter((i) => i >= 0);
  const who = shuffled(SCOUTS);
  const m = scoutCount(W);
  const used = new Set<number>();
  for (let i = 0; i < m; i++) {
    const want = (W * (i + 0.5)) / m;
    const best = houses
      .filter((h) => !used.has(h))
      .sort((a, b) => Math.abs(props[a].perch.x - want) - Math.abs(props[b].perch.x - want))[0];
    if (best === undefined) break;
    used.add(best);
    sim.scouts.push(makeScout(who[i], props[best].perch, best));
  }
  return sim;
}

function puff(sim: Sim, p: Omit<Puff, 'id' | 't'>) {
  if (sim.puffs.length > 180) return;
  sim.puffs.push({ ...p, id: ++uid, t: 0 });
}

function steam(sim: Sim, at: Vec, n: number, spread: number) {
  for (let i = 0; i < n; i++) {
    puff(sim, {
      x: at.x + rand(-spread, spread),
      y: at.y + rand(-4, 4),
      r0: rand(3, 6) * sim.k,
      r1: rand(12, 22) * sim.k,
      vx: rand(-6, 6),
      vy: rand(-22, -10),
      life: rand(1.4, 2.4),
      o: rand(0.14, 0.24),
    });
  }
}

/** Perches nobody is standing on or heading to. */
function freePerches(sim: Sim, self: Scout): number[] {
  const taken = new Set<number>();
  for (const s of sim.scouts) {
    if (s === self) continue;
    if (s.state === 'away') continue;
    taken.add(s.state === 'swing' ? s.toPerch : s.perch);
  }
  return sim.props.map((_, i) => i).filter((i) => !taken.has(i));
}

/** A pendulum swing: dips below the straight line between the two points. */
function swingCurve(sim: Sim, from: Vec, to: Vec): { ctrl: Vec; dur: number } {
  const d = dist(from, to);
  const dip = (26 + d * 0.24) * sim.k;
  return {
    ctrl: { x: (from.x + to.x) / 2, y: Math.min(Math.max(from.y, to.y) + dip, groundY(sim) - 16 * sim.k) },
    dur: clamp(0.5 + d / (470 * sim.k), 0.65, 1.5),
  };
}

/** Crouch for a beat before jumping, then run `then`. */
function launch(sc: Scout, then: () => void) {
  if (sc.state !== 'perch') return then();
  sc.state = 'launch';
  sc.t = 0;
  sc.next = then;
}

/** Swing to a perch, or (with `offTo`) off the edge of the screen. */
function swingTo(sim: Sim, sc: Scout, perch: number, offTo?: Vec, crouch = true) {
  const go = () => {
    const to = offTo ? { ...offTo } : { ...sim.props[perch].perch };
    const { ctrl, dur } = swingCurve(sim, sc.pos, to);
    Object.assign(sc, { state: 'swing', toPerch: offTo ? -1 : perch, t: 0, from: { ...sc.pos }, to, ctrl, dur, spin: 0 });
    sc.face = to.x >= sc.pos.x ? 1 : -1;
  };
  if (crouch) launch(sc, go);
  else go();
}

function attack(sim: Sim, sc: Scout, t: Titan) {
  t.targeted = true;
  launch(sc, () => {
    const n = nape(sim, t);
    const { dur } = swingCurve(sim, sc.pos, n);
    Object.assign(sc, { state: 'approach', titanId: t.id, t: 0, from: { ...sc.pos }, dur, spin: 0 });
    sc.face = n.x >= sc.pos.x ? 1 : -1;
  });
}

function nearestPerch(sim: Sim, sc: Scout, kind?: Prop['kind']): number {
  const free = freePerches(sim, sc).filter((i) => !kind || sim.props[i].kind === kind);
  const pool = free.length ? free : freePerches(sim, sc);
  return pool.sort((a, b) => dist(sim.props[a].perch, sc.pos) - dist(sim.props[b].perch, sc.pos))[0] ?? 0;
}

function pickTitan(sim: Sim, sc: Scout, clickedOnly: boolean): Titan | undefined {
  return sim.titans
    .filter((t) => {
      if (t.state !== 'walk' || t.targeted) return false;
      if (clickedOnly && !t.clicked) return false;
      const n = nape(sim, t);
      if (clickedOnly) return n.x > -30 && n.x < sim.W + 30;
      if (n.x < 10 || n.x > sim.W - 10) return false;
      return Math.abs(n.x - sc.pos.x) < 480 * sim.k;
    })
    .sort((a, b) => dist(nape(sim, a), sc.pos) - dist(nape(sim, b), sc.pos))[0];
}

/** What a perched scout does once it has rested. */
function decide(sim: Sim, sc: Scout) {
  const clicked = pickTitan(sim, sc, true);
  if (clicked) return attack(sim, sc, clicked);

  if (sc.afterKill) {
    // tree after the kill, then back over to a house
    sc.afterKill = false;
    const houses = freePerches(sim, sc).filter((i) => sim.props[i].kind === 'house' && i !== sc.perch);
    const pick = houses.sort((a, b) => dist(sim.props[a].perch, sc.pos) - dist(sim.props[b].perch, sc.pos))[
      Math.random() < 0.6 ? 0 : 1
    ];
    if (pick !== undefined) return swingTo(sim, sc, pick);
  }

  // take turns, unless the other scout can't find a titan for a while
  const myTurn = sim.scouts.length < 2 || sim.lastAttacker !== sc.who || sim.time > sim.nextAttack + 4;
  if (sim.time >= sim.nextAttack && myTurn) {
    const t = pickTitan(sim, sc, false);
    if (t) {
      sim.nextAttack = sim.time + rand(5, 9);
      sim.lastAttacker = sc.who;
      return attack(sim, sc, t);
    }
  }

  // otherwise hop to another perch nearby, back and forth across town
  const options = freePerches(sim, sc).filter((i) => {
    if (i === sc.perch) return false;
    const d = Math.abs(sim.props[i].perch.x - sc.pos.x);
    return d > 90 * sim.k && d < 420 * sim.k;
  });
  if (options.length) return swingTo(sim, sc, options[Math.floor(Math.random() * options.length)]);
  sc.rest = rand(1, 2);
}

/** After a kill: usually the nearest tree, but sometimes swing off and let someone else take over. */
function afterSlash(sim: Sim, sc: Scout) {
  sc.kills++;
  const benched = SCOUTS.filter((w) => !sim.scouts.some((s) => s.who === w));
  if (sc.kills >= 2 && benched.length && Math.random() < 0.55) {
    const left = sc.pos.x < sim.W / 2;
    const off = { x: left ? -40 * sim.k : sim.W + 40 * sim.k, y: rand(20, 60) * sim.k };
    return swingTo(sim, sc, -1, off, false);
  }
  sc.afterKill = true;
  swingTo(sim, sc, nearestPerch(sim, sc, 'tree'), undefined, false);
}

/** A scout who swung off screen is replaced by one who wasn't on duty. */
function swapIn(sim: Sim, sc: Scout) {
  const benched = shuffled(SCOUTS.filter((w) => !sim.scouts.some((s) => s.who === w)));
  const fresh = makeScout(benched[0] ?? sc.who, sc.pos, -1);
  sim.scouts[sim.scouts.indexOf(sc)] = fresh;
  const fromLeft = sc.pos.x < 0;
  const houses = freePerches(sim, fresh).filter((i) => sim.props[i].kind === 'house');
  const pick =
    houses.sort((a, b) =>
      fromLeft ? sim.props[a].perch.x - sim.props[b].perch.x : sim.props[b].perch.x - sim.props[a].perch.x,
    )[0] ?? 0;
  // swing straight in: they arrive already flying
  swingTo(sim, fresh, pick, undefined, false);
}

export const RISE = 0.7;
const ROAR = 0.75;
/** Attack Titan drawing scale (times k): a head taller than the others. */
export const SHIFTER_SCALE = 1.15;

/** A jagged bolt from above the scene down to the ground at x. */
function bolt(sim: Sim, x: number): Bolt {
  const g = groundY(sim);
  // starts at the top of the scene so it never crosses the page content
  const top = sky(sim);
  let d = `M${x + rand(-20, 20)} ${top}`;
  for (let y = top + 24; y < g; y += rand(16, 28)) d += ` L${x + rand(-12, 12)} ${y}`;
  return { id: ++uid, d: `${d} L${x} ${g}`, t: 0 };
}

/** Clicking Eren: lightning strikes, he becomes the Attack Titan and runs off. */
export function transform(sim: Sim, sc: Scout) {
  if (sc.who !== 'eren' || sc.state === 'away' || sim.shifter) return;
  if (sc.state === 'approach' || sc.state === 'slash') {
    const t = sim.titans.find((x) => x.id === sc.titanId);
    if (t) t.targeted = false;
  }
  const g = groundY(sim);
  const x = clamp(sc.pos.x, 30 * sim.k, sim.W - 30 * sim.k);
  sim.bolts.push(bolt(sim, x), bolt(sim, x));
  for (let i = 0; i < 16; i++) {
    puff(sim, {
      x: x + rand(-30, 30) * sim.k,
      y: g - rand(10, 90) * sim.k,
      r0: rand(6, 12) * sim.k,
      r1: rand(26, 46) * sim.k,
      vx: rand(-20, 20),
      vy: rand(-26, -8),
      life: rand(1.4, 2.4),
      o: rand(0.2, 0.32),
    });
  }
  // the blast rattles anything close by
  for (const p of sim.props) if (Math.abs(p.perch.x - x) < 90 * sim.k) p.shake = 0.5;
  sc.state = 'away';
  sc.wires = [];
  // the titan faces, and runs off, whichever way Eren was facing when clicked
  // (toward the titan he was watching, or the way he was swinging)
  sim.shifter = { x, dir: sc.face, stage: 'rise', t: 0, run: 0 };
}

function stepShifter(sim: Sim, dt: number) {
  for (const b of sim.bolts) b.t += dt;
  sim.bolts = sim.bolts.filter((b) => b.t < 0.4);

  const sh = sim.shifter;
  if (sh) {
    sh.t += dt;
    if (sh.stage === 'rise' && sh.t >= RISE) Object.assign(sh, { stage: 'roar', t: 0 });
    else if (sh.stage === 'roar' && sh.t >= ROAR) Object.assign(sh, { stage: 'run', t: 0 });
    else if (sh.stage === 'run') {
      const speed = Math.min(1, sh.t / 0.5) * 190 * sim.k;
      sh.x += sh.dir * speed * dt;
      sh.run += dt * 9;
      // kicks up dust as he goes
      if (Math.random() < dt * 10) {
        puff(sim, {
          x: sh.x - sh.dir * rand(0, 20) * sim.k,
          y: groundY(sim) - 6 * sim.k,
          r0: 3 * sim.k,
          r1: rand(10, 18) * sim.k,
          vx: -sh.dir * rand(10, 30),
          vy: rand(-10, -4),
          life: 0.9,
          o: 0.22,
        });
      }
      if (sh.x < -120 * sim.k || sh.x > sim.W + 120 * sim.k) {
        sim.shifter = null;
        sim.erenBack = sim.time + 2.2;
        sim.erenFromLeft = sh.dir === -1;
      }
    }
  }

  // a little later, Eren swings back in as himself from the side he left by
  if (sim.erenBack >= 0 && sim.time >= sim.erenBack) {
    sim.erenBack = -1;
    const sc = sim.scouts.find((s) => s.who === 'eren' && s.state === 'away');
    if (!sc) return;
    const left = sim.erenFromLeft;
    sc.pos = { x: left ? -40 * sim.k : sim.W + 40 * sim.k, y: rand(20, 50) * sim.k };
    sc.afterKill = false;
    const houses = freePerches(sim, sc).filter((i) => sim.props[i].kind === 'house');
    const pick =
      houses.sort((a, b) =>
        left ? sim.props[a].perch.x - sim.props[b].perch.x : sim.props[b].perch.x - sim.props[a].perch.x,
      )[0] ?? 0;
    swingTo(sim, sc, pick, undefined, false);
  }
}

/** A falling titan shakes whatever it lands on and kicks up dust. */
function crush(sim: Sim, t: Titan) {
  const g = groundY(sim);
  const len = 100 * t.s;
  const a = Math.min(t.x, t.x - mirror(t) * len);
  const b = Math.max(t.x, t.x - mirror(t) * len);
  sim.props.forEach((p, i) => {
    const left = p.kind === 'house' ? p.x : p.x - p.w / 2;
    const right = left + p.w;
    if (right < a || left > b) return;
    p.shake = 0.5;
    for (let j = 0; j < 4; j++) {
      puff(sim, {
        x: rand(left, right),
        y: p.kind === 'house' ? p.perch.y + p.roof * 0.6 : g - 10 * sim.k,
        r0: 2 * sim.k,
        r1: rand(8, 14) * sim.k,
        vx: rand(-14, 14),
        vy: rand(-12, -4),
        life: rand(0.7, 1.1),
        o: 0.3,
      });
    }
    // anyone standing there jumps off
    for (const s of sim.scouts) if (s.state === 'perch' && s.perch === i) s.rest = 0;
  });
  for (let i = 0; i < 7; i++) steam(sim, { x: t.x - (mirror(t) * len * i) / 6, y: g - 4 }, 1, 6);
}

export function step(sim: Sim, dt: number) {
  sim.time += dt;
  const g = groundY(sim);

  for (const p of sim.props) p.shake = Math.max(0, p.shake - dt);

  // clouds drift across and a new one rolls in when one leaves
  for (const c of sim.clouds) c.x += c.speed * dt;
  const gone = sim.clouds.filter((c) => c.x > sim.W + 20).length;
  if (gone) {
    sim.clouds = sim.clouds.filter((c) => c.x <= sim.W + 20);
    for (let i = 0; i < gone; i++) sim.clouds.push(makeCloud(sim.W, sim.H, sim.k));
  }

  // titans
  for (const t of sim.titans) {
    t.t += dt;
    if (t.state === 'walk') {
      t.x += t.speed * t.dir * dt;
      t.phase += (dt * t.speed * 0.13) / t.s;
    } else if (t.state === 'fall') {
      const p = Math.min(1, t.t / FALL);
      t.fall = 88 * p * p;
      if (p >= 1) {
        t.state = 'down';
        t.t = 0;
        crush(sim, t);
      }
    } else {
      if (Math.random() < dt * 5) steam(sim, { x: t.x - mirror(t) * rand(0, 95 * t.s), y: g - 6 * t.s }, 1, 4);
      t.opacity = t.t < DOWN - 1.6 ? 1 : Math.max(0, (DOWN - t.t) / 1.6);
    }
  }
  sim.titans = sim.titans.filter((t) => {
    if (t.state === 'down' && t.t >= DOWN) return false;
    if (t.state === 'walk') {
      const margin = 90 * t.s * t.sx;
      if ((t.dir === -1 && t.x < -margin) || (t.dir === 1 && t.x > sim.W + margin)) return false;
    }
    return true;
  });
  const alive = sim.titans.filter((t) => t.state === 'walk').length;
  if (alive < titanCount(sim.W) && sim.time >= sim.nextSpawn) {
    sim.titans.push(makeTitan(sim));
    sim.nextSpawn = sim.time + rand(2.5, 6);
  }

  stepShifter(sim, dt);

  // scouts (iterate a copy: swapIn replaces entries)
  for (const sc of [...sim.scouts]) {
    if (sc.state === 'away') continue;
    sc.t += dt;
    sc.land = Math.max(0, sc.land - dt);
    const prev = { ...sc.pos };

    if (sc.state === 'perch') {
      if (sc.perch >= 0) sc.pos = { ...sim.props[sc.perch].perch };
      sc.wires = [];
      // keep an eye on the nearest titan
      const watch = sim.titans
        .filter((t) => t.state === 'walk')
        .sort((a, b) => Math.abs(a.x - sc.pos.x) - Math.abs(b.x - sc.pos.x))[0];
      // only turn once the titan is clearly on the other side, so a titan
      // walking right underneath doesn't make them flip back and forth
      if (watch && Math.abs(watch.x - sc.pos.x) > 24 * sim.k) sc.face = watch.x > sc.pos.x ? 1 : -1;
      sc.rest -= dt;
      if (sc.rest <= 0) decide(sim, sc);
    } else if (sc.state === 'launch') {
      if (sc.t >= LAUNCH) {
        const next = sc.next;
        sc.next = null;
        sc.state = 'perch';
        next?.();
      }
    } else if (sc.state === 'swing') {
      const p = Math.min(1, sc.t / sc.dur);
      sc.pos = bez(sc.from, sc.ctrl, sc.to, ease(p));
      // wires hooked into the landing spot, reeled in just before touchdown
      const offscreen = sc.toPerch < 0;
      sc.wires =
        p < 0.82
          ? offscreen
            ? [{ x: sc.to.x, y: sc.to.y - 30 * sim.k }]
            : [
                { x: sc.to.x - 3 * sim.k, y: sc.to.y - 2 * sim.k },
                { x: sc.to.x + 3 * sim.k, y: sc.to.y - 5 * sim.k },
              ]
          : [];
      if (p >= 1) {
        if (offscreen) {
          swapIn(sim, sc);
          continue;
        }
        sc.state = 'perch';
        sc.perch = sc.toPerch;
        sc.land = LAND;
        const waiting = sim.titans.some((t) => t.clicked && !t.targeted);
        sc.rest = waiting ? 0.15 : sc.afterKill ? rand(0.7, 1.3) : rand(2.5, 5.5);
      }
    } else if (sc.state === 'approach') {
      const t = sim.titans.find((x) => x.id === sc.titanId);
      if (!t || t.state !== 'walk') {
        if (t) t.targeted = false;
        swingTo(sim, sc, nearestPerch(sim, sc), undefined, false);
      } else {
        const m = mirror(t);
        const n = nape(sim, t);
        // aim so the scout's body (drawn above `pos`) lands right on the nape
        const to = { x: n.x + m * 4 * sim.k, y: n.y + lift(sim) - 2 * sim.k };
        sc.ctrl = swingCurve(sim, sc.from, to).ctrl;
        const p = Math.min(1, sc.t / sc.dur);
        sc.pos = bez(sc.from, sc.ctrl, to, ease(p));
        const a = titanAnatomy(t.look);
        sc.wires = [titanPoint(sim, t, a.crown), titanPoint(sim, t, a.shoulder)];
        if (p >= 1) {
          sc.state = 'slash';
          sc.t = 0;
        }
      }
    } else if (sc.state === 'slash') {
      const t = sim.titans.find((x) => x.id === sc.titanId);
      const m = t ? mirror(t) : 1;
      if (t) {
        const n = nape(sim, t);
        sc.pos = { x: n.x + m * 4 * sim.k, y: n.y + lift(sim) - 2 * sim.k };
      }
      sc.wires = [];
      sc.spin = (sc.t / SLASH) * 720 * -m;
      if (sc.t >= SLASH) {
        if (t) {
          const n = nape(sim, t);
          sim.slashes.push({ id: ++uid, x: n.x, y: n.y, m, t: 0 });
          steam(sim, n, 6, 4);
          t.state = 'fall';
          t.t = 0;
          t.clicked = false;
        }
        sc.spin = 0;
        afterSlash(sim, sc);
      }
    }

    if (sc.state === 'swing' || sc.state === 'approach' || sc.state === 'slash') {
      const vx = sc.pos.x - prev.x;
      const vy = sc.pos.y - prev.y;
      if (vx * vx + vy * vy > 0.01) {
        // head leads the motion
        const target = (Math.atan2(vy, vx) * 180) / Math.PI + 90;
        const d = ((target - sc.angle + 540) % 360) - 180;
        sc.angle += d * Math.min(1, dt * 12);
      }
      if (sc.state !== 'slash') {
        sc.puffClock += dt;
        while (sc.puffClock > 0.045) {
          sc.puffClock -= 0.045;
          puff(sim, {
            x: sc.pos.x,
            y: sc.pos.y - lift(sim),
            r0: 1.2 * sim.k,
            r1: 5 * sim.k,
            vx: 0,
            vy: -4,
            life: 0.55,
            o: 0.3,
          });
        }
      }
    } else {
      sc.angle = 0;
    }
  }

  // effects
  for (const p of sim.puffs) {
    p.t += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  sim.puffs = sim.puffs.filter((p) => p.t < p.life);
  for (const s of sim.slashes) s.t += dt;
  sim.slashes = sim.slashes.filter((s) => s.t < 0.5);
}

/** Clicking a titan marks it, and the nearest perched scout goes for it at once. */
export function targetTitan(sim: Sim, id: number) {
  const t = sim.titans.find((x) => x.id === id);
  if (!t || t.state !== 'walk' || t.clicked) return;
  t.clicked = true;
  // busy scouts pick it up when they next land
  const perched = sim.scouts
    .filter((s) => s.state === 'perch')
    .sort((a, b) => Math.abs(a.pos.x - t.x) - Math.abs(b.pos.x - t.x))[0];
  if (perched) perched.rest = 0;
}
