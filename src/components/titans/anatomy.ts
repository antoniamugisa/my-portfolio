/** Shared shapes and measurements for the titan town's characters. */

export type ScoutName = 'mikasa' | 'eren' | 'armin';

export interface TitanLook {
  /** lanky: thin and stooped; brute: wide and muscled; grinner: huge head, small body. */
  kind: 'lanky' | 'brute' | 'grinner';
  /** 0 bald, 1 shaggy hair, 2 long hair. */
  hair: 0 | 1 | 2;
  /** Arm length multiplier. */
  arm: number;
}

/** Height of the top of the neck for each titan kind (feet at 0, up is negative). */
export const NECK_TOP: Record<TitanLook['kind'], number> = { lanky: -90, brute: -87, grinner: -76 };
/** Head size for each titan kind. */
export const HEAD_SCALE: Record<TitanLook['kind'], number> = { lanky: 1, brute: 0.85, grinner: 1.4 };

/** Where the nape and the top of the head are, in titan-local units. */
export const titanAnatomy = (look: TitanLook) => {
  const hs = HEAD_SCALE[look.kind];
  const headY = NECK_TOP[look.kind] - 10 * hs;
  return {
    nape: { x: 7, y: NECK_TOP[look.kind] + 2 },
    crown: { x: -3, y: headY - 13 * hs },
    shoulder: { x: 3, y: NECK_TOP[look.kind] + 8 },
  };
};
