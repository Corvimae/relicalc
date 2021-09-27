export type Generation = number | 'lgpe';

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
  negative: [number, number],
  neutral: [number, number],
  positive: [number, number],
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
