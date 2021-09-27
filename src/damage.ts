import { applyCombatStages, calculateLGPEStat, calculateStat } from './stats';
import { NatureType, NATURE_MODIFIERS } from './nature';
import { Generation, StatRange } from './reference';
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

export type CalculateDamageRangesParameters = Partial<AllCalculateDamageRangesParameters>;

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
  if (!evs) throw new Error('evs parameter is required');
  if (!opponentStat) throw new Error('opponentStat parameter is required');
  if (!generation) throw new Error('generation parameter is required');
  if (!movePower) throw new Error('movePower parameter is required');

  if (!offensiveMode && !opponentLevel) throw new Error('opponentLevel parameter is required when offensiveMode is false');

  return NATURE_MODIFIERS.map(natureModifierData => {
    const possibleStats = [...Array(32).keys()].map(possibleIV => {
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

export function mergeStatRanges(a: IVRange | undefined, b: IVRange): IVRange {
  if (!a) return b;
  if (!b) return a;

  return {
    from: Math.min(a.from, b.from),
    to: Math.max(a.to, b.to),
  };
}

export type IVRange = { from: number; to: number; };

interface StatIVDefinition {
  statFrom: number;
  statTo: number;
  negative?: IVRange;
  neutral?: IVRange;
  positive?: IVRange;
}

export type CompactRange = DamageRange & StatIVDefinition

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
}

export interface OneShotResult extends StatIVDefinition {
  successes: number;
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
