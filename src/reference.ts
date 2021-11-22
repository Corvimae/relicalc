export type Generation = number | 'lgpe' | 'bdsp';

export const STATS = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'] as const;

export type Stat = typeof STATS[number];

export interface StatLine {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

/**
 * The possible IVs for each nature modifier given the previously entered stats.
 */
export interface IVRangeSet {
  /** The possible IVs for a negative nature. */
  negative: [number, number],
  /** The possible IVs for a neutral nature. */
  neutral: [number, number],
  /** The possible IVs for a positive nature. */
  positive: [number, number],
  /** The lowest and highest IV possible across all possible natures. */
  combined: [number, number],
}

export interface StatRange {
  stat: number;
  from: number;
  to: number;
}

export interface IVRange {
  from: number;
  to: number;
}

export interface IVRangeNatureSet {
  negative?: IVRange;
  neutral?: IVRange;
  positive?: IVRange;
}
