import { CartesianProduct, Combination } from 'js-combinatorics';
import { applyCombatStages, calculateLGPEStat, calculateStat } from './stats';
import { NatureType, NATURE_MODIFIERS } from './nature';
import { Generation, StatRange, IVRange, IVRangeNatureSet } from './reference';
import { formatDamageRange } from './utils/format';
import { range } from './utils/utils';

/**
 * Calculate the possible damage values that a move can roll.
 *
 * @param level - The level of the attacking Pokémon.
 * @param power - The base power of the move.
 * @param attack - The relevant offensive stat of the attacking Pokémon.
 * @param defense - The relevant defensive stat of the defending Pokémon.
 * @param basePowerModifiers - A list of modifiers to apply to the base power.
 * @param preRandModifiers - A list of modifiers to apply before the randomization factor.
 * @param postRandModifiers - A list of modifiers to apply after the randomization factor.
 * @returns The list of the sixteen possible damage values for the move.
 */
export function calculateDamageValues(
  level: number,
  power: number,
  attack: number,
  defense: number,
  basePowerModifiers: number[],
  preRandModifiers: number[],
  postRandModifiers: number[],
): number[] {
  return range(0, 15).map(randomValue => {
    const levelModifier = Math.trunc((2 * level) / 5) + 2;
    const adjustedPower = basePowerModifiers.reduce((acc, modifier) => Math.trunc(acc * modifier), power);
    const baseDamage = Math.trunc(Math.floor((levelModifier * adjustedPower * attack) / defense) / 50) + 2;

    return [...preRandModifiers, (85 + randomValue) / 100, ...postRandModifiers].reduce((acc, modifier) => (
      Math.trunc(acc * modifier)
    ), baseDamage);
  });
}

interface DamageRange {
  damageValues: number[];
  damageRangeOutput: string;
  minDamage: number;
  maxDamage: number;
}

export type RangeResult = DamageRange & StatRange;

export interface DamageRangeNatureResult {
  name: string;
  rangeSegments: RangeResult[];
}

function getMultiTargetModifier(generation: Generation): number {
  return generation === 3 ? 0.5 : 0.75;
}

interface AllCalculateDamageRangesParameters {
  /** The level of the owned Pokémon. */
  level: number;
  /** The base stat of the owned Pokémon. */
  baseStat: number;
  /** The effort value of the relevant stat of the owned Pokémon. */
  evs: number;
  /** The number of combat stages in the relevant stat for the owned Pokémon. */
  combatStages: number;
  /** Is the attacker benefitting from the same-type attack bonus? */
  stab: boolean;
  /** The type effectiveness multiplier of the move. */
  typeEffectiveness: number;
  /** Is the owned Pokémon attacking? */
  offensiveMode: boolean;
  /** The base power of the move. */
  movePower: number;
  /** Did the move critical hit? */
  criticalHit: boolean;
  /** Is the attacker affected by Torrent, Overgrow, or Blaze? */
  torrent: boolean;
  /** Does the move target more than one Pokémon and is the encounter a double or triple battle? */
  multiTarget: boolean;
  /** Is the move's damage boosted by the weather? */
  weatherBoosted: boolean;
  /** Is the move's damage reduced by the weather? */
  weatherReduced: boolean;
  /** The generation damage formula to use. */
  generation: Generation;
  /** An additional multiplier to apply at the end of the calculation. */
  otherModifier: number;
  /** The level of the opponent Pokémon. */
  opponentLevel: number;
  /** The value of opponent Pokémon's relevant stat  */
  opponentStat: number;
  /** The number of combat stages the opponent Pokémon has in the relevant stat */
  opponentCombatStages: number;
  /** The friendship of the Pokémon (only relevant for LGPE). */
  friendship: number;
  /** Is the defender protected by a screen move? */
  screen: boolean;
  /** An additional multiplier to apply to the base power of the move. */
  otherPowerModifier: number;
}

export type CalculateDamageRangesParameters = Partial<AllCalculateDamageRangesParameters>;

/**
 * Calculate the set of possible damage values dealt by a move for every possible IV.
 *
 * @param options - The configuration for the damage calculation.
 * @returns A list of possible damage rolls for every possible IV.
 */
export function calculateDamageRanges({
  level,
  baseStat,
  evs,
  combatStages = 0,
  stab,
  typeEffectiveness = 1,
  offensiveMode = true,
  movePower,
  criticalHit = false,
  torrent = false,
  multiTarget = false,
  weatherBoosted = false,
  weatherReduced = false,
  generation,
  otherModifier = 1,
  opponentLevel,
  opponentStat,
  opponentCombatStages = 0,
  friendship,
  screen = false,
  otherPowerModifier = 1,
}: CalculateDamageRangesParameters): DamageRangeNatureResult[] {
  if (!level) throw new Error('level parameter is required.');
  if (!baseStat) throw new Error('baseStat parameter is required');
  if (evs === undefined || evs === null) throw new Error('evs parameter is required');
  if (!opponentStat) throw new Error('opponentStat parameter is required');
  if (!generation) throw new Error('generation parameter is required');
  if (!movePower) throw new Error('movePower parameter is required');

  if (!offensiveMode && !opponentLevel) throw new Error('opponentLevel parameter is required when offensiveMode is false');

  return NATURE_MODIFIERS.map(natureModifierData => {
    const possibleStats = range(0, 31).map(possibleIV => {
      if (generation === 'lgpe') {
        if (!friendship) throw new Error('friendship parameter is required when generation is lgpe');
        return calculateLGPEStat(level, baseStat, possibleIV, evs, natureModifierData.modifier, friendship);
      }
      return calculateStat(level, baseStat, possibleIV, evs, natureModifierData.modifier);
    });

    // Combine stats into ranges of like values.
    const rangeSegments = possibleStats.reduce<StatRange[]>((acc, statValue, iv) => {
      const lastValue = acc[acc.length - 1];

      if (lastValue?.stat === statValue) {
        return [
          ...acc.slice(0, acc.length - 1),
          {
            ...lastValue,
            to: iv,
          },
        ];
      }

      return [
        ...acc,
        {
          stat: statValue,
          from: iv,
          to: iv,
        },
      ];
    }, []);

    return {
      name: natureModifierData.name,
      rangeSegments: rangeSegments.map(rangeSegment => {
        const playerStatAdjusted = applyCombatStages(rangeSegment.stat, combatStages);
        const opponentStatAdjusted = applyCombatStages(opponentStat, opponentCombatStages);

        const stabAndTypeEffectivenessModifier = [
          stab ? 1.5 : 1,
          typeEffectiveness,
        ];

        const critMultiplier = generation <= 5 ? 2.0 : 1.5;
        const offensiveStat = offensiveMode ? playerStatAdjusted : opponentStatAdjusted;
        const defensiveStat = offensiveMode ? opponentStatAdjusted : playerStatAdjusted;
        const baseScreenMultiplier = multiTarget ? (2 / 3) : 0.5;
        const screenModifier = screen && !criticalHit ? baseScreenMultiplier : 1;

        const damageValues = calculateDamageValues(
          offensiveMode ? level : (opponentLevel ?? 0),
          torrent && generation <= 4 ? movePower * 1.5 : movePower,
          torrent && generation >= 5 ? offensiveStat * 1.5 : offensiveStat,
          defensiveStat,
          [
            ...(generation === 4 ? [
              screenModifier,
              multiTarget ? getMultiTargetModifier(generation) : 1,
              weatherBoosted ? 1.5 : 1,
              weatherReduced ? 0.5 : 1,
            ] : []),
            otherPowerModifier,
          ],
          [
            ...((generation >= 5 || generation === 'lgpe') ? [
              multiTarget ? getMultiTargetModifier(generation) : 1,
              weatherBoosted ? 1.5 : 1,
              weatherReduced ? 0.5 : 1,
            ] : []),
            criticalHit ? critMultiplier : 1.0,
            ...(generation === 3 ? stabAndTypeEffectivenessModifier : []),
          ],
          [
            ...(generation === 3 ? [] : stabAndTypeEffectivenessModifier),
            ...(generation >= 5 ? [screenModifier] : []),
            otherModifier,
          ],
        );

        return {
          ...rangeSegment,
          damageValues,
          damageRangeOutput: formatDamageRange(damageValues),
          minDamage: Math.min(...damageValues),
          maxDamage: Math.max(...damageValues),
        };
      }),
    };
  });
}

function mergeStatRanges(a: IVRange | undefined, b: IVRange): IVRange {
  if (!a || a.from === -1 || a.to === -1) return b;
  if (!b || b.from === -1 || b.to === -1) return a;

  return {
    from: Math.min(a.from, b.from),
    to: Math.max(a.to, b.to),
  };
}

interface StatIVDefinition extends IVRangeNatureSet {
  statFrom: number;
  statTo: number;
}

export type CompactRange = DamageRange & StatIVDefinition

/**
 * Combine identical sets of possible damage roll values into a range of values.
 *
 * @param results - The results of a damage calculation.
 * @returns The compact ranges of possible rolls.
 */
export function combineIdenticalLines(results: DamageRangeNatureResult[]): CompactRange[] {
  const [negative, neutral, positive] = results;

  const segments = (Object.entries({ negative, neutral, positive }) as [NatureType, DamageRangeNatureResult][])
    .reduce<Record<string, CompactRange>>((output, [key, { rangeSegments }]) => (
      rangeSegments.reduce((acc, result) => {
        const currentValue = acc[result.damageRangeOutput];

        return {
          ...acc,
          [result.damageRangeOutput]: {
            ...currentValue,
            damageValues: result.damageValues,
            damageRangeOutput: result.damageRangeOutput,
            minDamage: Math.min(...result.damageValues),
            maxDamage: Math.max(...result.damageValues),
            statFrom: currentValue?.statFrom ?? result.stat,
            statTo: Math.max(result.stat, acc[result.damageRangeOutput]?.statTo ?? 0),
            [key]: {
              ...currentValue?.[key],
              from: (currentValue || {})[key]?.from ?? result.from,
              to: result.to,
            },
          },
        };
      }, output)
    ), {});

  return Object.values(segments).sort((a, b) => a.statFrom - b.statFrom);
}

export interface OneShotResult extends StatIVDefinition {
  /** The number of rolls that succeed to knock out the opponent in one hit. */
  successes: number;
  /** The list of compacted ranges that share the same likeliness to one-hit knockout. */
  componentResults: CompactRange[];
}

/**
 * Determine the number of values that succeed to knock out the opponent in one hit for each
 * possible damage result and combine them by matching success count.
 *
 * @param results - The results of a damage calculation.
 * @param healthThreshold - The total health of the defender.
 * @returns The compacted one-hit knockout range data.
 */
export function calculateKillRanges(results: DamageRangeNatureResult[], healthThreshold: number): Record<number, OneShotResult> {
  return Object.values(combineIdenticalLines(results))
    .reduce<Record<number, OneShotResult>>((acc, result) => {
      const successes = result.damageValues.filter(value => value >= healthThreshold).length;
      const currentValue = acc[successes];

      return {
        ...acc,
        [successes]: {
          successes,
          statFrom: Math.min(currentValue?.statFrom || Number.MAX_VALUE, result.statFrom),
          statTo: Math.max(currentValue?.statTo || Number.MIN_VALUE, result.statTo),
          negative: mergeStatRanges(currentValue?.negative, result.negative ?? { from: -1, to: -1 }),
          neutral: mergeStatRanges(currentValue?.neutral, result.neutral ?? { from: -1, to: -1 }),
          positive: mergeStatRanges(currentValue?.positive, result.positive ?? { from: -1, to: -1 }),
          componentResults: [
            ...(currentValue?.componentResults || []),
            result,
          ],
        },
      };
    }, {});
}

function factorial(value: number, sum = 1): number {
  if (!value || value <= 1) return sum;

  return factorial(value - 1, sum * value);
}

interface RollValue {
  value: number;
  adjusted: number;
  index: number;
  subIndex: number;
}

export interface CombinedDamageOdds {
  critCount: number;
  odds: number;
  binomialCoefficient: number;
  successes: number;
}

interface CalculateCombinedDamageOptions {
  /**
   * Critical hits ignore negative offensive combat stages and positive defensive combat stages.
   * If this is relevant, you can provide the rolls with neutral combat stages and they will be
   * used to calculate damage only for critical hits.
   */
  critAdjustedValues?: (number[] | null)[];
  /** The damage multiplier to use for a critical hit. */
  critMultiplier?: number;
  /** The denominator for the crit chance percent - 16 for Gen 6-, 24 for Gen 7+. */
  critChanceDenominator?: number;
}

/**
 * Determine the percentage of damage roll combinations that meet a threshold.
 *
 * @param rollSets - A list of the possible damage roll values for each attack.
 * @param hpThreshold - The target HP.
 * @param options - Additional options.
 * @returns The number of successes, total number of trials, and binomial coefficient for each number of crits rolled.
 */
export function calculateCombinedDamage(
  rollSets: number[][],
  hpThreshold: number,
  options: CalculateCombinedDamageOptions = {},
): CombinedDamageOdds[] {
  const valuesWithAdjustments: RollValue[][] = rollSets.map((rollSet, index) => (
    rollSet.slice(0, rollSets[0]?.length).map((value, subIndex) => ({
      value,
      adjusted: options.critAdjustedValues?.[index]?.[subIndex] ?? value,
      index,
      subIndex,
    }))
  ));

  const critResults = (Array.from(CartesianProduct.from(valuesWithAdjustments)) as RollValue[][]).reduce<number[][]>((critAcc, rolls) => [
    ...critAcc,
    range(0, rolls.length).reduce<number[]>((rollAcc, numCrits) => {
      const combinations = numCrits === rolls.length + 1 ? [rolls] : Array.from(new Combination(rolls, numCrits));

      const critSuccesses = combinations.reduce((combinationAcc, critValues) => {
        const nonCritValues = rolls.filter(roll => !critValues.some(critRoll => critRoll.index === roll.index && critRoll.subIndex === roll.subIndex));

        const nonCritDamage = nonCritValues.reduce((acc, { value }) => acc + value, 0);
        const critDamage = critValues.reduce((acc, { value, adjusted }) => acc + Math.trunc((adjusted || value) * (options.critMultiplier ?? 1.5)), 0);

        return combinationAcc + (nonCritDamage + critDamage >= hpThreshold ? 1 : 0);
      }, 0);

      return [
        ...rollAcc,
        critSuccesses,
      ];
    }, []),
  ], []);

  const trialSize = rollSets.length;
  const critChance = 1 / (options.critChanceDenominator ?? 16);

  const oddSets: CombinedDamageOdds[] = range(0, trialSize).map(numCrits => ({
    critCount: numCrits,
    odds: critChance ** numCrits * (1 - critChance) ** (trialSize - numCrits),
    binomialCoefficient: factorial(trialSize) / (factorial(numCrits) * factorial(trialSize - numCrits)),
    successes: 0,
  }));

  return critResults.reduce((acc, rollResults) => (
    rollResults.reduce((totals, successes, index) => {
      const updatedTotals = [...totals];

      updatedTotals[index].successes = (totals[index].successes || 0) + successes;

      return updatedTotals;
    }, acc)
  ), oddSets);
}
