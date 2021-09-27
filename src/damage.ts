import { applyCombatStages, calculateLGPEStat, calculateStat } from './stats';
import { NatureType, NATURE_MODIFIERS } from './nature';
import { CombinedIVResult, Generation, StatRange } from './reference';
import { formatDamageRange } from './format';

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
  return [...Array(16).keys()].map(randomValue => {
    const levelModifier = Math.trunc((2 * level) / 5) + 2;
    const adjustedPower = basePowerModifiers.reduce((acc, modifier) => Math.trunc(acc * modifier), power);
    const baseDamage = Math.trunc(Math.floor((levelModifier * adjustedPower * attack) / defense) / 50) + 2;

    return [...preRandModifiers, (85 + randomValue) / 100, ...postRandModifiers].reduce((acc, modifier) => (
      Math.trunc(acc * modifier)
    ), baseDamage);
  });
}

export interface RangeResult extends StatRange {
  damageValues: number[];
  damageRangeOutput: string;
  minDamage: number;
  maxDamage: number;
}

export interface DamageRangeNatureResult {
  name: string;
  rangeSegments: RangeResult[];
}

function getMultiTargetModifier(generation: Generation): number {
  return generation === 3 ? 0.5 : 0.75;
}

export interface CalculateDamageRangesParameters {
  level: number;
  baseStat: number;
  evs: number;
  combatStages: number;
  stab: boolean;
  typeEffectiveness: number;
  offensiveMode: boolean;
  movePower: number;
  criticalHit: boolean;
  torrent: boolean;
  multiTarget: boolean;
  weatherBoosted: boolean;
  weatherReduced: boolean;
  generation: Generation;
  otherModifier: number;
  opponentLevel: number;
  opponentStat: number;
  opponentCombatStages: number;
  friendship: number;
  screen: boolean;
  otherPowerModifier: number;
}

export function calculateDamageRanges({
  level,
  baseStat,
  evs,
  combatStages,
  stab,
  typeEffectiveness,
  offensiveMode,
  movePower,
  criticalHit,
  torrent,
  multiTarget,
  weatherBoosted,
  weatherReduced,
  generation,
  otherModifier,
  opponentLevel,
  opponentStat,
  opponentCombatStages,
  friendship,
  screen,
  otherPowerModifier,
}: CalculateDamageRangesParameters): DamageRangeNatureResult[] {
  return NATURE_MODIFIERS.map(natureModifierData => {
    const possibleStats = [...Array(32).keys()].map(possibleIV => {
      if (generation === 'lgpe') {
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
          offensiveMode ? level : opponentLevel,
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

export function mergeStatRanges(a: StatRange | undefined, b: StatRange): StatRange {
  if (!a) return b;
  if (!b) return a;

  return {
    stat: -1,
    from: Math.min(a.from, b.from),
    to: Math.max(a.to, b.to),
  };
}

export function combineIdenticalLines(results: DamageRangeNatureResult[]): Record<string, CompactRange> {
  const [negative, neutral, positive] = results;

  return (Object.entries({ negative, neutral, positive }) as [NatureType, DamageRangeNatureResult][])
    .reduce<Record<string, CompactRange>>((output, [key, { rangeSegments }]) => (
      rangeSegments.reduce((acc, result) => {
        const currentValue = acc[result.damageRangeOutput];

        return {
          ...acc,
          [result.damageRangeOutput]: {
            ...currentValue,
            damageValues: result.damageValues,
            damageRangeOutput: result.damageRangeOutput,
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
}

type CombinedRangeResult = RangeResult & CombinedIVResult;

export interface CompactRange extends CombinedRangeResult {
  statFrom: number;
  statTo: number;
}

export interface OneShotResult extends CombinedIVResult {
  successes: number;
  statFrom: number;
  statTo: number;
  componentResults: CompactRange[];
}

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
          negative: mergeStatRanges(currentValue?.negative, result.negative),
          neutral: mergeStatRanges(currentValue?.neutral, result.neutral),
          positive: mergeStatRanges(currentValue?.positive, result.positive),
          componentResults: [
            ...(currentValue?.componentResults || []),
            result,
          ],
        },
      };
    }, {});
}
