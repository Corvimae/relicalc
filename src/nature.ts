import { capitalize } from './utils/format';
import { IVRangeSet, Stat } from './reference';

export type ConfirmedNature = [Stat | null, Stat | null];

export type NatureType = 'negative' | 'neutral' | 'positive';

export interface NatureModifier {
  key: NatureType;
  name: string;
  modifier: number;
}

export const NATURE_MODIFIERS: NatureModifier[] = [
  {
    key: 'negative',
    name: 'Negative Nature',
    modifier: 0.9,
  },
  {
    key: 'neutral',
    name: 'Neutral Nature',
    modifier: 1,
  },
  {
    key: 'positive',
    name: 'Positive Nature',
    modifier: 1.1,
  },
];

export interface NatureDefinition {
  name: string;
  plus: Stat;
  minus: Stat;
}

const RAW_NATURES = {
  hardy: {
    plus: 'attack',
    minus: 'attack',
  },
  lonely: {
    plus: 'attack',
    minus: 'defense',
  },
  adamant: {
    plus: 'attack',
    minus: 'spAttack',
  },
  naughty: {
    plus: 'attack',
    minus: 'spDefense',
  },
  brave: {
    plus: 'attack',
    minus: 'speed',
  },
  bold: {
    plus: 'defense',
    minus: 'attack',
  },
  docile: {
    plus: 'defense',
    minus: 'defense',
  },
  impish: {
    plus: 'defense',
    minus: 'spAttack',
  },
  lax: {
    plus: 'defense',
    minus: 'spDefense',
  },
  relaxed: {
    plus: 'defense',
    minus: 'speed',
  },
  modest: {
    plus: 'spAttack',
    minus: 'attack',
  },
  mild: {
    plus: 'spAttack',
    minus: 'defense',
  },
  bashful: {
    plus: 'spAttack',
    minus: 'spAttack',
  },
  rash: {
    plus: 'spAttack',
    minus: 'spDefense',
  },
  quiet: {
    plus: 'spAttack',
    minus: 'speed',
  },
  calm: {
    plus: 'spDefense',
    minus: 'attack',
  },
  gentle: {
    plus: 'spDefense',
    minus: 'defense',
  },
  careful: {
    plus: 'spDefense',
    minus: 'spAttack',
  },
  quirky: {
    plus: 'spDefense',
    minus: 'spDefense',
  },
  sassy: {
    plus: 'spDefense',
    minus: 'speed',
  },
  timid: {
    plus: 'speed',
    minus: 'attack',
  },
  hasty: {
    plus: 'speed',
    minus: 'defense',
  },
  jolly: {
    plus: 'speed',
    minus: 'spAttack',
  },
  naive: {
    plus: 'speed',
    minus: 'spDefense',
  },
  serious: {
    plus: 'speed',
    minus: 'speed',
  },
} as const;

export type Nature = keyof typeof RAW_NATURES;

export const NATURES: Record<Nature, NatureDefinition> = Object.entries(RAW_NATURES).reduce((acc, [key, value]) => ({
  ...acc,
  [key]: {
    ...value,
    name: capitalize(key),
  },
}), {} as Record<Nature, NatureDefinition>);

export function determinePossibleNatureTypesForStat(stat: Stat, [negative, positive]: ConfirmedNature): NatureType[] {
  if (positive === stat && negative !== stat) return ['positive'];
  if (negative === stat && positive !== stat) return ['negative'];
  if (negative === stat && positive === stat) return ['neutral'];

  let relevantTypes = ['negative', 'neutral', 'positive'] as NatureType[];

  if (negative !== null && negative !== stat) {
    relevantTypes = relevantTypes.filter(type => type !== 'negative');
  }

  if (positive !== null && positive !== stat) {
    relevantTypes = relevantTypes.filter(type => type !== 'positive');
  }

  return relevantTypes;
}

interface CalculatePossibleNatureOptions {
  /** Hard override for the stat that is being boosted by nature. */
  positiveNatureStat?: Stat,
  /** Hard override for the stat that is being reduced by nature. */
  negativeNatureStat?: Stat,
}

export function calculatePossibleNature(
  ivRanges: Record<Stat, IVRangeSet>,
  options: CalculatePossibleNatureOptions = {},
): ConfirmedNature {
  const confirmedNegative = options.negativeNatureStat ? [options.negativeNatureStat] : (
    Object.entries(ivRanges).find(([stat, value]) => stat !== 'hp' && value.positive === null && value.neutral === null)
  );
  const confirmedPositive = options?.positiveNatureStat ? [options.positiveNatureStat] : (
    Object.entries(ivRanges).find(([stat, value]) => stat !== 'hp' && value.negative === null && value.neutral == null)
  );

  const possibleNegatives = Object.entries(ivRanges).filter(([stat, value]) => stat !== 'hp' && value.negative === null);
  const possiblePositives = Object.entries(ivRanges).filter(([stat, value]) => stat !== 'hp' && value.positive === null);

  if (possibleNegatives.length === 0 || possiblePositives.length === 0) return ['attack', 'attack'];

  const negativeByExclusion = confirmedPositive && possibleNegatives.length === 1 ? (possibleNegatives[0][0] as Stat) : null;
  const positiveByExclusion = confirmedNegative && possiblePositives.length === 1 ? (possiblePositives[0][0] as Stat) : null;

  return [
    confirmedNegative ? confirmedNegative[0] as Stat : negativeByExclusion,
    confirmedPositive ? confirmedPositive[0] as Stat : positiveByExclusion,
  ];
}

export function getPossibleNatureAdjustmentsForStat(
  rangeSet: IVRangeSet,
  stat: Stat,
  [confirmedNegative, confirmedPositive]: ConfirmedNature,
): [boolean, boolean, boolean] {
  const isNegativeValid = rangeSet.negative === null;
  const isNeutralValid = rangeSet.neutral === null;
  const isPositiveValid = rangeSet.positive === null;

  if (confirmedPositive === stat && confirmedNegative !== stat) return [false, false, true];
  if (confirmedNegative === stat && confirmedPositive !== stat) return [true, false, false];
  
  return [
    isNegativeValid && confirmedNegative === null,
    isNeutralValid,
    isPositiveValid && confirmedPositive === null,
  ];
}

export function filterByPossibleNatureAdjustmentsForStat<T>(
  rangeSet: IVRangeSet,
  stat: Stat,
  confirmedNature: ConfirmedNature,
  values: [T, T, T],
): T[] {
  const [negative, neutral, positive] = getPossibleNatureAdjustmentsForStat(rangeSet, stat, confirmedNature);
  
  return [
    negative ? values[0] : undefined,
    neutral ? values[1] : undefined,
    positive ? values[2] : undefined,
  ].filter(value => value !== undefined) as T[];
}
