import { ConfirmedNature, determinePossibleNatureTypesForStat, getPossibleNatureAdjustmentsForStat, NatureType, NATURE_MODIFIERS } from './nature';
import { Generation, IVRangeSet, Stat, IVRange, IVRangeNatureSet } from './reference';
import { calculateGen1Stat, calculateHP, calculateStat } from './stats';
import { range, rangesOverlap } from './utils/utils';

export interface StatValuePossibilitySet {
  /** The full set of unique stat values that are possible across all IVs and natures */
  possible: number[];
  /** The set of unique stat values that are possible given the calculated IV set and confirmed nature. */
  valid: number[];
}

/**
 * Calculate the value of a stat.
 *
 * @param stat - The name of the stat.
 * @param level - The current level of the Pokémon.
 * @param baseStat - The base stat of the Pokémon.
 * @param iv - The individual value of the Pokémon for the stat.
 * @param ev - The effort value of the Pokémon for the stat.
 * @param modifier - The nature modifier to apply to the stat.
 * @param generation - The generation formula to use.
 * @returns The calculated stat value.
 */
function calculateStatOrHP(stat: Stat, level: number, baseStat: number, iv: number, ev: number, modifier: number, generation: Generation): number {
  if (stat === 'hp') return calculateHP(level, baseStat, iv, ev, generation);
  if (generation <= 2) return calculateGen1Stat(level, baseStat, iv, ev);

  return calculateStat(level, baseStat, iv, ev, modifier);
}

/**
 * Get the list of possible stat values for a range of individual values given a nature modifier.
 *
 * @param stat - The name of the stat.
 * @param level - The current level of the Pokémon.
 * @param baseStat - The base stat of the Pokémon.
 * @param minIV - The lowest individual value in the range.
 * @param maxIV - The highest individual value in the range.
 * @param ev - The effort value of the Pokémon for the stat.
 * @param modifier - The nature modifier to apply to the stat.
 * @param generation - The generation formula to use.
 * @returns The list of calculated stat value.
 */
function calculatePossibleStatValuesForNature(
  stat: Stat,
  level: number,
  baseStat: number,
  minIV: number,
  maxIV: number,
  ev: number,
  modifier: number,
  generation: Generation,
): StatValuePossibilitySet {
  const possibleValues = range(0, 31).map(iv => (
    calculateStatOrHP(stat, level, baseStat, iv, ev, modifier, generation)
  ));

  const validValues = range(minIV, maxIV).map(iv => (
    calculateStatOrHP(stat, level, baseStat, iv, ev, modifier, generation)
  ));

  return {
    possible: Array.from(new Set(possibleValues)),
    valid: Array.from(new Set(validValues)),
  };
}

/**
 * Calculate the possible values for a stat at a level given the restricted list of IVs
 * calculated from the stat values of previous levels.
 *
 * @param stat - The name of the stat to calculate.
 * @param level - The current level of the Pokémon.
 * @param ivRanges - The calculated IV range set for the relevant stat as calculated from previously entered stats.
 * @param confirmedNature - Any confirmed negative or positive nature data.
 * @param baseStat - The base stat of the Pokémon.
 * @param evs - The effort value of the Pokémon for the stat at the current level.
 * @param generation - The generation formula to use.
 * @returns
 */
export function calculateAllPossibleStatValues(
  stat: Stat,
  level: number,
  ivRanges: IVRangeSet,
  confirmedNature: ConfirmedNature,
  baseStat: number,
  evs: number,
  generation: Generation,
): StatValuePossibilitySet {
  let relevantModifiers = stat === 'hp' ? [NATURE_MODIFIERS[1]] : NATURE_MODIFIERS;

  const possibleNatureTypes = determinePossibleNatureTypesForStat(stat, confirmedNature);

  relevantModifiers = relevantModifiers.filter(item => possibleNatureTypes.indexOf(item.key) !== -1);

  const { possible, valid } = relevantModifiers.reduce<StatValuePossibilitySet>((combinedSet, { key, modifier }) => {
    const values = ivRanges[key];

    if (!values) return combinedSet;

    const calculatedValues = calculatePossibleStatValuesForNature(
      stat,
      level,
      baseStat,
      values[0],
      values[1],
      evs,
      modifier,
      generation,
    );

    // console.log(stat, calculatedValues);

    return {
      possible: [...combinedSet.possible, ...calculatedValues.possible],
      valid: [...combinedSet.valid, ...calculatedValues.valid],
    };
  }, { possible: [], valid: [] } as StatValuePossibilitySet);

  return {
    possible: Array.from(new Set(possible)),
    valid: Array.from(new Set(valid)),
  };
}

interface CalculatePossibleIVRangeOptions {
  /** Hard override for the stat that is being boosted by nature. */
  positiveNatureStat?: Stat,
  /** Hard override for the stat that is being reduced by nature. */
  negativeNatureStat?: Stat,
  /** Hard override for the IV value. */
  staticIV?: number;
}

/**
 * Determine the possible individual values for a stat given the stat values at previous levels.
 *
 * @param stat - The name of the stat being calculated.
 * @param baseStatValues - The values of the base stat at each stage of evolution.
 * @param valuesAtPreviousLevels - Any known values of the stat at previous levels for each stage of evolution.
 * @param evsByLevel - A map of the effort value of the stat at each previous level.
 * @param generation - The generation formula to use.
 * @param options - Additonal options.
 * @returns The minimum and maximum possible IVs for each possible nature modifier.
 */
export function calculatePossibleIVRange(
  stat: Stat,
  baseStatValues: number[],
  valuesAtPreviousLevels: Record<number, number>[],
  evsByLevel: Record<number, number>,
  generation: Generation,
  options: CalculatePossibleIVRangeOptions = {},
): IVRangeSet {
  if (options.staticIV !== undefined) {
    const possibleNatureTypes = determinePossibleNatureTypesForStat(stat, [options.negativeNatureStat ?? null, options.positiveNatureStat ?? null]);

    return {
      positive: possibleNatureTypes.includes('positive') ? [options.staticIV, options.staticIV] : [-1, -1],
      neutral: possibleNatureTypes.includes('neutral') ? [options.staticIV, options.staticIV] : [-1, -1],
      negative: possibleNatureTypes.includes('negative') ? [options.staticIV, options.staticIV] : [-1, -1],
      combined: [options.staticIV, options.staticIV],
    };
  }

  const { negative, neutral, positive } = NATURE_MODIFIERS.reduce((modifierSet, { modifier, key }) => ({
    ...modifierSet,
    [key]: valuesAtPreviousLevels.reduce<[number, number]>((acc, previouStatValues, evolutionIndex) => {
      const baseStat = baseStatValues[evolutionIndex];
      
      return Object.entries(previouStatValues).reduce<[number, number]>(([min, max], [rawLevel, value]) => {
        const level = Number(rawLevel);
        
        if (!Number.isFinite(min) || !Number.isFinite(max) || min === -1) return [-1, -1];

        const matchingStats = range(min, max).filter(possibleIV => calculateStatOrHP(
          stat,
          level,
          baseStat,
          possibleIV,
          evsByLevel[level] ?? 0,
          modifier,
          generation,
        ) === value);

        if (matchingStats.length === 0) return [-1, -1];

        const minMatchingStat = Math.min(...matchingStats);
        const maxMatchingStat = Math.max(...matchingStats);

        return [Math.max(min, minMatchingStat), Math.min(max, maxMatchingStat)];
      }, acc);
    }, [0, 31]),
  }), {} as { negative: [number, number], neutral: [number, number], positive: [number, number]});

  return {
    positive,
    negative,
    neutral,
    combined: [
      Math.min(...[positive[0], negative[0], neutral[0]].filter(value => value !== -1)),
      Math.max(...[positive[1], negative[1], neutral[1]].filter(value => value !== -1)),
    ],
  };
}

function isIVWithinValues(calculatedValue: IVRange | undefined, ivRange: [number, number] | null): boolean {
  if (!calculatedValue) return false;

  return rangesOverlap([calculatedValue.from, calculatedValue.to], ivRange ?? [-1, -1]);
}

function isIVWithinRange(
  damageResult: IVRangeNatureSet,
  [confirmedNegative, confirmedPositive]: ConfirmedNature,
  stat: Stat,
  ivRanges: IVRangeSet,
): boolean {
  if (confirmedNegative === stat && confirmedPositive !== stat) {
    return isIVWithinValues(damageResult.negative, ivRanges.negative);
  }
  
  if (confirmedPositive === stat && confirmedNegative !== stat) {
    return isIVWithinValues(damageResult.positive, ivRanges.positive);
  }

  const [negative, neutral, positive] = getPossibleNatureAdjustmentsForStat(ivRanges, stat, [confirmedNegative, confirmedPositive]);
  
  return Object.entries({
    negative,
    neutral,
    positive,
  }).filter(([, value]) => value).some(([key]) => isIVWithinValues(damageResult[key as NatureType], ivRanges[key as NatureType]));
}

/**
 * Filter a set of damage calculation results to only those that intersect with an IV range set.
 *
 * @param results - The damage calculation results.
 * @param confirmedNature - The confirmed nature, if any.
 * @param stat - The stat relevant to the filter.
 * @param ivRanges - The calculated IV ranges.
 * @return The relevant damage results.
 */
export function filterToStatRange<T extends IVRangeNatureSet>(
  results: Record<string | number, T>,
  confirmedNature: ConfirmedNature,
  stat: Stat,
  ivRanges: IVRangeSet,
): Record<string | number, T> {
  return Object.entries(results).reduce((acc, [key, value]) => {
    if (isIVWithinRange(value, confirmedNature, stat, ivRanges)) {
      return {
        ...acc,
        [key]: value,
      };
    }

    return acc;
  }, {} as Record<string | number, T>);
}
