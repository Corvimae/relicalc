import { capitalize } from './utils/format';
import { IVRangeSet, Stat } from './reference';

/**
 * The stat that is confirmed to be reduced by nature and the stat that is confirmed to be
 * increased by nature, respectively.
 */
export type ConfirmedNature = [Stat | null, Stat | null];

export type NatureType = 'negative' | 'neutral' | 'positive';

export interface NatureModifier {
  /** The unique key for the nature type */
  key: NatureType;
  /** The human-readable name of the nature type. */
  name: string;
  /** The stat multiplier applied by the nature.  */
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
  /** The name of the nature. */
  name: string;
  /** The stat that is boosted by this nature. */
  plus: Stat;
  /** The stat that is reduced by this nature. */
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

/**
 * Given the stats that are confirmed to be affected by nature, determine what nature modifications are
 * still possible for a stat.
 *
 * @param stat - The name of the stat.
 * @param confirmedNature - The stats confirmed to be reduced and increased by nature, respectively.
 * @returns The possible nature modifications for the stat.s
 */
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

/**
 * Determine what stats must be increased or reduced by the nature given the calculated
 * range of possible IVs.
 *
 * @param ivRanges - The calculated ranges of possible individual values.
 * @param options - Additional options.
 * @returns The stat that is reduced by the nature followed by the stat that is increased by the nature.
 */
export function calculatePossibleNature(
  ivRanges: Record<Stat, IVRangeSet>,
  options: CalculatePossibleNatureOptions = {},
): ConfirmedNature {
  const confirmedNegative = options.negativeNatureStat ? [options.negativeNatureStat] : (
    Object.entries(ivRanges).find(([stat, value]) => stat !== 'hp' && value.positive[0] === -1 && value.neutral[0] === -1)
  );
  const confirmedPositive = options?.positiveNatureStat ? [options.positiveNatureStat] : (
    Object.entries(ivRanges).find(([stat, value]) => stat !== 'hp' && value.negative[0] === -1 && value.neutral[0] === -1)
  );

  const possibleNegatives = Object.entries(ivRanges).filter(([stat, value]) => stat !== 'hp' && value.negative[0] !== -1);
  const possiblePositives = Object.entries(ivRanges).filter(([stat, value]) => stat !== 'hp' && value.positive[0] !== -1);

  if (possibleNegatives.length === 0 || possiblePositives.length === 0) return ['attack', 'attack'];

  const negativeByExclusion = confirmedPositive && possibleNegatives.length === 1 ? (possibleNegatives[0][0] as Stat) : null;
  const positiveByExclusion = confirmedNegative && possiblePositives.length === 1 ? (possiblePositives[0][0] as Stat) : null;

  return [
    confirmedNegative ? confirmedNegative[0] as Stat : negativeByExclusion,
    confirmedPositive ? confirmedPositive[0] as Stat : positiveByExclusion,
  ];
}

/**
 * Determine whether it is possible for a stat to be reduced, unaffected, or increased, respectively,
 * given the calculated ranges of individual values and the confirmed nature.
 *
 * @param rangeSet -  The calculated ranges of possible individual values.
 * @param stat - The stat for which to determine possible nature adjustments.
 * @param confirmedNature - The stats confirmed to be reduced and increased by nature, respectively.
 * @returns Whether it is possible for a stat to be reduced, unaffected, or increased, respectively.
 */
export function getPossibleNatureAdjustmentsForStat(
  rangeSet: IVRangeSet,
  stat: Stat,
  [confirmedNegative, confirmedPositive]: ConfirmedNature,
): [boolean, boolean, boolean] {
  const isNegativeValid = rangeSet.negative[0] !== -1;
  const isNeutralValid = rangeSet.neutral[0] !== -1;
  const isPositiveValid = rangeSet.positive[0] !== -1;

  if (confirmedPositive === stat && confirmedNegative !== stat) return [false, false, true];
  if (confirmedNegative === stat && confirmedPositive !== stat) return [true, false, false];
  
  return [
    isNegativeValid && confirmedNegative === null,
    isNeutralValid,
    isPositiveValid && confirmedPositive === null,
  ];
}

/**
 * Filter a set of values by whether  it is possible for a stat to be reduced, unaffected, or increased,
 * respectively, given the calculated ranges of individual values and the confirmed nature.
 *
 * @param rangeSet -  The calculated ranges of possible individual values.
 * @param stat - The stat for which to determine possible nature adjustments.
 * @param confirmedNature - The stats confirmed to be reduced and increased by nature, respectively.
 * @param values - The values to filter, in the order [negative, neutral, positive].
 * @returns The values that are still relevant.
 */
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

/**
 * Get the multiplier for a stat given a nature definition.
 *
 * @param stat - The stat for which to determine the multiplier.
 * @param nature - The nature definition.
 * @returns The multiplier for the stat.
 */
export function getNatureMultiplier(stat: Stat, nature: NatureDefinition): number {
  if (nature.plus === stat && nature.minus !== stat) return 1.1;
  if (nature.minus === stat && nature.plus !== stat) return 0.9;

  return 1;
}
