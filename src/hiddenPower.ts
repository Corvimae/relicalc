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
  if (!ivSet) return [];

  return range(ivSet[0], ivSet[1]);
}

function getUniqueIVValuesInRangeSet(ivRange: IVRangeSet, stat: Stat, [negativeNature, positiveNature]: ConfirmedNature): number[] {
  if (negativeNature === stat) return getIVValuesInSection(ivRange.negative);
  if (positiveNature === stat) return getIVValuesInSection(ivRange.positive);

  return [...new Set([
    ...(negativeNature === null ? getIVValuesInSection(ivRange.negative) : []),
    ...getIVValuesInSection(ivRange.neutral),
    ...(positiveNature === null ? getIVValuesInSection(ivRange.positive) : []),
  ])];
}

function calculateOddnessProbababilityOfStat(ivRange: IVRangeSet, stat: Stat, confirmedNature: ConfirmedNature, odd: boolean): number {
  const values = getUniqueIVValuesInRangeSet(ivRange, stat, confirmedNature);
  
  if (values.length === 0) return 0;

  return values.filter(x => x % 2 === (odd ? 1 : 0)).length / values.length;
}

type StatLSBSet = [boolean, boolean, boolean, boolean, boolean, boolean];

function calculateHiddenPowerProbability(
  ivs: Record<Stat, IVRangeSet>,
  confirmedNature: ConfirmedNature,
  hpOdd: boolean,
  attackOdd: boolean,
  defenseOdd: boolean,
  spAttackOdd: boolean,
  spDefenseOdd: boolean,
  speedOdd: boolean,
): number {
  return calculateOddnessProbababilityOfStat(ivs.hp, 'hp', confirmedNature, hpOdd)
    * calculateOddnessProbababilityOfStat(ivs.attack, 'attack', confirmedNature, attackOdd)
    * calculateOddnessProbababilityOfStat(ivs.defense, 'defense', confirmedNature, defenseOdd)
    * calculateOddnessProbababilityOfStat(ivs.spAttack, 'spAttack', confirmedNature, spAttackOdd)
    * calculateOddnessProbababilityOfStat(ivs.spDefense, 'spDefense', confirmedNature, spDefenseOdd)
    * calculateOddnessProbababilityOfStat(ivs.speed, 'speed', confirmedNature, speedOdd);
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
  const probabilities = ([...new CartesianProduct(
    [false, true],
    [false, true],
    [false, true],
    [false, true],
    [false, true],
    [false, true],
  )] as StatLSBSet[]).map(combination => ({
    combination,
    probability: calculateHiddenPowerProbability(ivs, confirmedNature, ...combination),
  }));

  const mostProbableCombination = probabilities.reduce<{ probability: number; combination: StatLSBSet | null }>((acc, value) => (
    value.probability > acc.probability ? value : acc
  ), { probability: 0, combination: null });

  if (mostProbableCombination.combination === null) return null;

  const [hp, atk, def, spAtk, spDef, speed] = mostProbableCombination.combination.map(value => value ? 1 : 0);

  return HIDDEN_POWER_TYPES[Math.floor(((hp + atk * 2 + def * 4 + speed * 8 + spAtk * 16 + spDef * 32) * 15) / 63)];
}
