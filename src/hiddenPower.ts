import { CartesianProduct } from 'js-combinatorics';
import { ConfirmedNature } from './nature';
import { TypeName } from './pokemonTypes';
import { IVRangeSet, Stat } from './reference';
import { range } from './utils/utils';

const HIDDEN_POWER_TYPES: TypeName[] = [
  'fighting',
  'flying',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
];

function getIVValuesInSection(ivSet: [number, number] | null): number[] {
  if (!ivSet || ivSet[0] === -1 || ivSet[1] === -1) return [];

  return range(ivSet[0], ivSet[1]);
}

function getUniqueIVValuesInRangeSet(ivRange: IVRangeSet, stat: Stat, [negativeNature, positiveNature]: ConfirmedNature): number[] {
  if (negativeNature === stat) return getIVValuesInSection(ivRange.negative);
  if (positiveNature === stat) return getIVValuesInSection(ivRange.positive);

  return Array.from(new Set([
    ...(negativeNature === null ? getIVValuesInSection(ivRange.negative) : []),
    ...getIVValuesInSection(ivRange.neutral),
    ...(positiveNature === null ? getIVValuesInSection(ivRange.positive) : []),
  ]));
}

type ProbabilityExpectedValuePredicate = (value: number) => boolean;

function calculateOddnessProbababilityOfStat(
  ivRange: IVRangeSet,
  stat: Stat,
  confirmedNature: ConfirmedNature,
  predicate: ProbabilityExpectedValuePredicate,
  expectedPredicateValue: boolean,
): number {
  const values = getUniqueIVValuesInRangeSet(ivRange, stat, confirmedNature);
  
  if (values.length === 0) return 0;

  return values.filter(x => predicate(x) === expectedPredicateValue).length / values.length;
}

type StatLSBSet = [boolean, boolean, boolean, boolean, boolean, boolean];

function calculateHiddenPowerProbability(
  ivs: Record<Stat, IVRangeSet>,
  confirmedNature: ConfirmedNature,
  statProbabilityPredicate: ProbabilityExpectedValuePredicate,
  hpExpectedPredicateValue: boolean,
  attackExpectedPredicateValue: boolean,
  defenseExpectedPredicateValue: boolean,
  spAttackExpectedPredicateValue: boolean,
  spDefenseExpectedPredicateValue: boolean,
  speedExpectedPredicateValue: boolean,
): number {
  return calculateOddnessProbababilityOfStat(ivs.hp, 'hp', confirmedNature, statProbabilityPredicate, hpExpectedPredicateValue)
    * calculateOddnessProbababilityOfStat(ivs.attack, 'attack', confirmedNature, statProbabilityPredicate, attackExpectedPredicateValue)
    * calculateOddnessProbababilityOfStat(ivs.defense, 'defense', confirmedNature, statProbabilityPredicate, defenseExpectedPredicateValue)
    * calculateOddnessProbababilityOfStat(ivs.spAttack, 'spAttack', confirmedNature, statProbabilityPredicate, spAttackExpectedPredicateValue)
    * calculateOddnessProbababilityOfStat(ivs.spDefense, 'spDefense', confirmedNature, statProbabilityPredicate, spDefenseExpectedPredicateValue)
    * calculateOddnessProbababilityOfStat(ivs.speed, 'speed', confirmedNature, statProbabilityPredicate, speedExpectedPredicateValue);
}

function calculateMostProbableCombination(
  ivs: Record<Stat, IVRangeSet>,
  confirmedNature: ConfirmedNature,
  predicate: ProbabilityExpectedValuePredicate,
): StatLSBSet | null {
  const probabilities = (Array.from(new CartesianProduct(
    [false, true],
    [false, true],
    [false, true],
    [false, true],
    [false, true],
    [false, true],
  )) as StatLSBSet[]).map(combination => ({
    combination,
    probability: calculateHiddenPowerProbability(ivs, confirmedNature, predicate, ...combination),
  }));

  const mostProbableCombination = probabilities.reduce<{ probability: number; combination: StatLSBSet | null }>((acc, value) => (
    value.probability > acc.probability ? value : acc
  ), { probability: 0, combination: null });

  return mostProbableCombination.combination;
}

function hiddenPowerTypePredicate(value: number) {
  return value % 2 === 1;
}

function hiddenPowerBasePowerPredicate(value: number) {
  return value % 4 === 2 || value % 4 === 3;
}

function calculateHiddenPowerTypeFromLSBSet(lsbSet: StatLSBSet): TypeName {
  const [hp, atk, def, spAtk, spDef, speed] = lsbSet.map(value => value ? 1 : 0);

  return HIDDEN_POWER_TYPES[Math.floor(((hp + atk * 2 + def * 4 + speed * 8 + spAtk * 16 + spDef * 32) * 15) / 63)];
}

function calculateHiddenPowerBasePowerFromSecondLSBSet(secondLSBSet: StatLSBSet): number {
  const [hp, atk, def, spAtk, spDef, speed] = secondLSBSet.map(value => value ? 1 : 0);

  return Math.floor(((hp + atk * 2 + def * 4 + speed * 8 + spAtk * 16 + spDef * 32) * 40) / 63) + 30;
}

/**
 * Calculate the most probable type of Hidden Power given a specific set of IVs.
 *
 * @param ivs - The set of IVs.
 * @returns The Hidden Power type given the provided IVs.
 */
export function calculateHiddenPowerTypeFromIVs(ivs: [number, number, number, number, number, number]): TypeName {
  return calculateHiddenPowerTypeFromLSBSet(ivs.map(hiddenPowerTypePredicate) as StatLSBSet);
}

/**
 * Calculate the most probable type of Hidden Power given the calculated possible IVs of a Pokémon.
 *
 * @param ivs - The calculated IV ranges.
 * @param confirmedNature - The stats confirmed to be reduced and increased by the nature, respectively.
 * @returns The most likely Hidden Power type given the possible IVs.
 */
export function calculateHiddenPowerType(
  ivs: Record<Stat, IVRangeSet>,
  confirmedNature: ConfirmedNature,
): TypeName | null {
  const mostProbableCombination = calculateMostProbableCombination(ivs, confirmedNature, hiddenPowerTypePredicate);

  if (mostProbableCombination === null) return null;

  return calculateHiddenPowerTypeFromLSBSet(mostProbableCombination);
}

/**
 * Calculate the base power of Hidden Power given for Gen 3-5 a specific set of IVs.
 *
 * @param ivs - The set of IVs.
 * @returns The Hidden Power base power given the provided IVs.
 */
export function calculateHiddenPowerBasePowerFromIVs(ivs: [number, number, number, number, number, number]): number {
  return calculateHiddenPowerBasePowerFromSecondLSBSet(ivs.map(hiddenPowerBasePowerPredicate) as StatLSBSet);
}

/**
 * Calculate the most probable base power of Hidden Power for Gen 3-5 given the calculated
 * possible IVs of a Pokémon.
 *
 * @param ivs - The calculated IV ranges.
 * @param confirmedNature - The stats confirmed to be reduced and increased by the nature, respectively.
 * @returns The most likely Hidden Power base power given the possible IVs.
 */
export function calculateHiddenPowerBasePower(
  ivs: Record<Stat, IVRangeSet>,
  confirmedNature: ConfirmedNature,
): number | null {
  const mostProbableCombination = calculateMostProbableCombination(ivs, confirmedNature, hiddenPowerBasePowerPredicate);

  if (mostProbableCombination === null) return null;

  return calculateHiddenPowerBasePowerFromSecondLSBSet(mostProbableCombination);
}
