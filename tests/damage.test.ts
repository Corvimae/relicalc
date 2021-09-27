import { calculateDamageRanges, CalculateDamageRangesParameters, combineIdenticalLines, CompactRange } from '../src/damage';
import { formatDamageRange } from '../src/format';

function buildDamageRangeObject(ranges: Omit<CompactRange, 'damageRangeOutput' | 'minDamage' | 'maxDamage'>[]): Record<string, CompactRange> {
  return ranges.reduce((acc, range) => {
    const damageRangeOutput = formatDamageRange(range.damageValues);

    return {
      ...acc,
      [damageRangeOutput]: {
        ...range,
        damageRangeOutput,
        minDamage: Math.min(...range.damageValues),
        maxDamage: Math.max(...range.damageValues),
      },
    };
  }, {});
}

function statRange(from: number, to: number): { from: number; to: number; } {
  return { from, to };
}

describe('calculateDamageRanges (compacted)', () => {
  const basePrinplupOptions: CalculateDamageRangesParameters = {
    level: 25,
    baseStat: 81,
    evs: 16,
    combatStages: 0,
    stab: true,
    typeEffectiveness: 1,
    offensiveMode: true,
    movePower: 65,
    opponentStat: 62,
    generation: 4,
  };

  test('gen 4 level 25 prinplup bubblebeam with 16 evs +0 combat stages - vs - 62 spdef 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges(basePrinplupOptions))).toStrictEqual(buildDamageRangeObject([
      {
        statFrom: 41,
        statTo: 43,
        negative: statRange(0, 9),
        damageValues: [15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 18],
      },
      {
        statFrom: 44,
        statTo: 47,
        negative: statRange(10, 29),
        neutral: statRange(0, 5),
        damageValues: [16, 16, 16, 16, 16, 16, 16, 16, 18, 18, 18, 18, 18, 18, 18, 19],
      },
      {
        statFrom: 48,
        statTo: 51,
        negative: statRange(30, 31),
        neutral: statRange(6, 21),
        positive: statRange(0, 5),
        damageValues: [16, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 21],
      },
      {
        statFrom: 52,
        statTo: 55,
        neutral: statRange(22, 31),
        positive: statRange(6, 17),
        damageValues: [18, 18, 19, 19, 19, 19, 19, 19, 19, 21, 21, 21, 21, 21, 21, 22],
      },
      {
        statFrom: 56,
        statTo: 59,
        positive: statRange(18, 31),
        damageValues: [19, 19, 19, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 24],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs +1 combat stage - vs - 62 spdef 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      combatStages: 1,
    }))).toStrictEqual(buildDamageRangeObject([
      {
        statFrom: 41,
        statTo: 42,
        negative: statRange(0, 5),
        damageValues: [21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24, 25],
      },
      {
        statFrom: 43,
        statTo: 45,
        negative: statRange(6, 21),
        damageValues: [22, 22, 22, 22, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 27],
      },
      {
        statFrom: 46,
        statTo: 47,
        negative: statRange(22, 29),
        neutral: statRange(0, 5),
        damageValues: [24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 27, 27, 27, 27, 27, 28],
      },
      {
        statFrom: 48,
        statTo: 50,
        negative: statRange(30, 31),
        neutral: statRange(6, 17),
        positive: statRange(0, 1),
        damageValues: [25, 25, 25, 25, 25, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 30],
      },
      {
        statFrom: 51,
        statTo: 53,
        neutral: statRange(18, 29),
        positive: statRange(2, 13),
        damageValues: [25, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 30, 30, 30, 30, 31],
      },
      {
        statFrom: 54,
        statTo: 55,
        neutral: statRange(30, 31),
        positive: statRange(14, 17),
        damageValues: [27, 27, 28, 28, 28, 28, 30, 30, 30, 30, 30, 31, 31, 31, 31, 33],
      },
      {
        statFrom: 56,
        statTo: 58,
        positive: statRange(18, 29),
        damageValues: [28, 28, 30, 30, 30, 30, 30, 31, 31, 31, 31, 33, 33, 33, 33, 34],
      },
      {
        statFrom: 59,
        statTo: 59,
        positive: statRange(30, 31),
        damageValues: [30, 30, 30, 31, 31, 31, 31, 33, 33, 33, 33, 34, 34, 34, 34, 36],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs -1 combat stage - vs - 62 spdef 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      combatStages: -1,
    }))).toStrictEqual(buildDamageRangeObject([
      {
        statFrom: 41,
        statTo: 41,
        negative: statRange(0, 1),
        damageValues: [9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 12],
      },
      {
        statFrom: 42,
        statTo: 47,
        negative: statRange(2, 29),
        neutral: statRange(0, 5),
        damageValues: [10, 10, 10, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13],
      },
      {
        statFrom: 48,
        statTo: 53,
        negative: statRange(30, 31),
        neutral: statRange(6, 29),
        positive: statRange(0, 13),
        damageValues: [12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 15],
      },
      {
        statFrom: 54,
        statTo: 59,
        neutral: statRange(30, 31),
        positive: statRange(14, 31),
        damageValues: [13, 13, 13, 13, 13, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs - vs - 62 spdef 1x effectiveness +1 combat stage', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      opponentCombatStages: +1,
    }))).toStrictEqual(buildDamageRangeObject([
      {
        statFrom: 41,
        statTo: 41,
        negative: statRange(0, 1),
        damageValues: [9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 12],
      },
      {
        statFrom: 42,
        statTo: 47,
        negative: statRange(2, 29),
        neutral: statRange(0, 5),
        damageValues: [10, 10, 10, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13],
      },
      {
        statFrom: 48,
        statTo: 53,
        negative: statRange(30, 31),
        neutral: statRange(6, 29),
        positive: statRange(0, 13),
        damageValues: [12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 15],
      },
      {
        statFrom: 54,
        statTo: 59,
        neutral: statRange(30, 31),
        positive: statRange(14, 31),
        damageValues: [13, 13, 13, 13, 13, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs - vs - 62 spdef 1x effectiveness -1 combat stage', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      opponentCombatStages: -1,
    }))).toStrictEqual(buildDamageRangeObject([
      {
        statFrom: 41,
        statTo: 42,
        negative: statRange(0, 5),
        damageValues: [21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24, 25],
      },
      {
        statFrom: 43,
        statTo: 44,
        negative: statRange(6, 13),
        damageValues: [22, 22, 22, 22, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 27],
      },
      {
        statFrom: 45,
        statTo: 47,
        negative: statRange(14, 29),
        neutral: statRange(0, 5),
        damageValues: [24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 27, 27, 27, 27, 27, 28],
      },
      {
        statFrom: 48,
        statTo: 49,
        negative: statRange(30, 31),
        neutral: statRange(6, 13),
        damageValues: [25, 25, 25, 25, 25, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 30],
      },
      {
        statFrom: 50,
        statTo: 52,
        neutral: statRange(14, 25),
        positive: statRange(0, 9),
        damageValues: [25, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 30, 30, 30, 30, 31],
      },
      {
        statFrom: 53,
        statTo: 55,
        neutral: statRange(26, 31),
        positive: statRange(10, 17),
        damageValues: [27, 27, 28, 28, 28, 28, 30, 30, 30, 30, 30, 31, 31, 31, 31, 33],
      },
      {
        statFrom: 56,
        statTo: 57,
        positive: statRange(18, 25),
        damageValues: [28, 28, 30, 30, 30, 30, 30, 31, 31, 31, 31, 33, 33, 33, 33, 34],
      },
      {
        statFrom: 58,
        statTo: 59,
        positive: statRange(26, 31),
        damageValues: [30, 30, 30, 31, 31, 31, 31, 33, 33, 33, 33, 34, 34, 34, 34, 36],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs +1 combat stage - vs - 62 spdef 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      combatStages: 1,
    }))).toStrictEqual(buildDamageRangeObject([
      {
        statFrom: 41,
        statTo: 42,
        negative: statRange(0, 5),
        damageValues: [21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24, 25],
      },
      {
        statFrom: 43,
        statTo: 45,
        negative: statRange(6, 21),
        damageValues: [22, 22, 22, 22, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 27],
      },
      {
        statFrom: 46,
        statTo: 47,
        negative: statRange(22, 29),
        neutral: statRange(0, 5),
        damageValues: [24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 27, 27, 27, 27, 27, 28],
      },
      {
        statFrom: 48,
        statTo: 50,
        negative: statRange(30, 31),
        neutral: statRange(6, 17),
        positive: statRange(0, 1),
        damageValues: [25, 25, 25, 25, 25, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 30],
      },
      {
        statFrom: 51,
        statTo: 53,
        neutral: statRange(18, 29),
        positive: statRange(2, 13),
        damageValues: [25, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 30, 30, 30, 30, 31],
      },
      {
        statFrom: 54,
        statTo: 55,
        neutral: statRange(30, 31),
        positive: statRange(14, 17),
        damageValues: [27, 27, 28, 28, 28, 28, 30, 30, 30, 30, 30, 31, 31, 31, 31, 33],
      },
      {
        statFrom: 56,
        statTo: 58,
        positive: statRange(18, 29),
        damageValues: [28, 28, 30, 30, 30, 30, 30, 31, 31, 31, 31, 33, 33, 33, 33, 34],
      },
      {
        statFrom: 59,
        statTo: 59,
        positive: statRange(30, 31),
        damageValues: [30, 30, 30, 31, 31, 31, 31, 33, 33, 33, 33, 34, 34, 34, 34, 36],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs -1 combat stage - vs - 62 spdef 2x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      typeEffectiveness: 2,
    }))).toStrictEqual(buildDamageRangeObject([
      {
        statFrom: 41,
        statTo: 43,
        negative: statRange(0, 9),
        damageValues: [30, 30, 30, 30, 30, 30, 30, 32, 32, 32, 32, 32, 32, 32, 32, 36],
      },
      {
        statFrom: 44,
        statTo: 47,
        negative: statRange(10, 29),
        neutral: statRange(0, 5),
        damageValues: [32, 32, 32, 32, 32, 32, 32, 32, 36, 36, 36, 36, 36, 36, 36, 38],
      },
      {
        statFrom: 48,
        statTo: 51,
        negative: statRange(30, 31),
        neutral: statRange(6, 21),
        positive: statRange(0, 5),
        damageValues: [32, 36, 36, 36, 36, 36, 36, 36, 38, 38, 38, 38, 38, 38, 38, 42],
      },
      {
        statFrom: 52,
        statTo: 55,
        neutral: statRange(22, 31),
        positive: statRange(6, 17),
        damageValues: [36, 36, 38, 38, 38, 38, 38, 38, 38, 42, 42, 42, 42, 42, 42, 44],
      },
      {
        statFrom: 56,
        statTo: 59,
        positive: statRange(18, 31),
        damageValues: [38, 38, 38, 42, 42, 42, 42, 42, 42, 44, 44, 44, 44, 44, 44, 48],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs -1 combat stage - vs - 62 spdef 4x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      typeEffectiveness: 4,
    }))).toStrictEqual(buildDamageRangeObject([
      {
        statFrom: 41,
        statTo: 43,
        negative: statRange(0, 9),
        damageValues: [60, 60, 60, 60, 60, 60, 60, 64, 64, 64, 64, 64, 64, 64, 64, 72],
      },
      {
        statFrom: 44,
        statTo: 47,
        negative: statRange(10, 29),
        neutral: statRange(0, 5),
        damageValues: [64, 64, 64, 64, 64, 64, 64, 64, 72, 72, 72, 72, 72, 72, 72, 76],
      },
      {
        statFrom: 48,
        statTo: 51,
        negative: statRange(30, 31),
        neutral: statRange(6, 21),
        positive: statRange(0, 5),
        damageValues: [64, 72, 72, 72, 72, 72, 72, 72, 76, 76, 76, 76, 76, 76, 76, 84],
      },
      {
        statFrom: 52,
        statTo: 55,
        neutral: statRange(22, 31),
        positive: statRange(6, 17),
        damageValues: [72, 72, 76, 76, 76, 76, 76, 76, 76, 84, 84, 84, 84, 84, 84, 88],
      },
      {
        statFrom: 56,
        statTo: 59,
        positive: statRange(18, 31),
        damageValues: [76, 76, 76, 84, 84, 84, 84, 84, 84, 88, 88, 88, 88, 88, 88, 96],
      },
    ]));
  });
});
