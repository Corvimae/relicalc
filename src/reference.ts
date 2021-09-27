export type Generation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 'lgpe';

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

export interface IVRangeSet {
  negative: [number, number] | null,
  neutral: [number, number] | null,
  positive: [number, number] | null,
  combined: [number, number] | null,
}

export interface StatRange {
  stat: number;
  from: number;
  to: number;
}

export interface CombinedIVResult {
  negative: StatRange;
  neutral: StatRange;
  positive: StatRange
}
