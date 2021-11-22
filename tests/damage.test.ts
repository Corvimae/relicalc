import { calculateDamageRanges, CalculateDamageRangesParameters, combineIdenticalLines, CompactRange } from '../src/damage';
import { formatDamageRange } from '../src/utils/format';

function expandDamageRanges(ranges: Omit<CompactRange, 'damageRangeOutput' | 'minDamage' | 'maxDamage'>[]): CompactRange[] {
  return ranges.reduce<CompactRange[]>((acc, range) => {
    const damageRangeOutput = formatDamageRange(range.damageValues);

    return [
      ...acc,
      {
        ...range,
        damageRangeOutput,
        minDamage: Math.min(...range.damageValues),
        maxDamage: Math.max(...range.damageValues),
      },
    ];
  }, []);
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
    expect(combineIdenticalLines(calculateDamageRanges(basePrinplupOptions))).toStrictEqual(expandDamageRanges([
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
    }))).toStrictEqual(expandDamageRanges([
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
    }))).toStrictEqual(expandDamageRanges([
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
    }))).toStrictEqual(expandDamageRanges([
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
    }))).toStrictEqual(expandDamageRanges([
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
    }))).toStrictEqual(expandDamageRanges([
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

  test('gen 4 level 25 prinplup bubblebeam with 16 evs 0 combat stages - vs - 62 spdef 0.25x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      typeEffectiveness: 0.25,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 41,
        statTo: 43,
        negative: statRange(0, 9),
        damageValues: [3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      },
      {
        statFrom: 44,
        statTo: 47,
        negative: statRange(10, 29),
        neutral: statRange(0, 5),
        damageValues: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      },
      {
        statFrom: 48,
        statTo: 51,
        negative: statRange(30, 31),
        neutral: statRange(6, 21),
        positive: statRange(0, 5),
        damageValues: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5],
      },
      {
        statFrom: 52,
        statTo: 55,
        neutral: statRange(22, 31),
        positive: statRange(6, 17),
        damageValues: [4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5],
      },
      {
        statFrom: 56,
        statTo: 59,
        positive: statRange(18, 31),
        damageValues: [4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
      },
    ]));
  });
  test('gen 4 level 25 prinplup bubblebeam with 16 evs 0 combat stages - vs - 62 spdef 0.5x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      typeEffectiveness: 0.5,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 41,
        statTo: 43,
        negative: statRange(0, 9),
        damageValues: [7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 9],
      },
      {
        statFrom: 44,
        statTo: 47,
        negative: statRange(10, 29),
        neutral: statRange(0, 5),
        damageValues: [8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9],
      },
      {
        statFrom: 48,
        statTo: 51,
        negative: statRange(30, 31),
        neutral: statRange(6, 21),
        positive: statRange(0, 5),
        damageValues: [8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10],
      },
      {
        statFrom: 52,
        statTo: 55,
        neutral: statRange(22, 31),
        positive: statRange(6, 17),
        damageValues: [9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 11],
      },
      {
        statFrom: 56,
        statTo: 59,
        positive: statRange(18, 31),
        damageValues: [9, 9, 9, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 12],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs 0 combat stages - vs - 62 spdef 2x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      typeEffectiveness: 2,
    }))).toStrictEqual(expandDamageRanges([
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

  test('gen 4 level 25 prinplup bubblebeam with 16 evs 0 combat stages - vs - 62 spdef 4x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      typeEffectiveness: 4,
    }))).toStrictEqual(expandDamageRanges([
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

  test('gen 4 level 30 prinplup bubblebeam with 16 evs 0 combat stages - vs - 62 spdef 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      level: 30,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 48,
        statTo: 51,
        negative: statRange(0, 10),
        damageValues: [19, 19, 19, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 24],
      },
      {
        statFrom: 52,
        statTo: 54,
        negative: statRange(11, 23),
        neutral: statRange(0, 0),
        damageValues: [21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24, 25],
      },
      {
        statFrom: 55,
        statTo: 57,
        negative: statRange(24, 31),
        neutral: statRange(1, 10),
        damageValues: [22, 22, 22, 22, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 27],
      },
      {
        statFrom: 58,
        statTo: 61,
        neutral: statRange(11, 23),
        positive: statRange(0, 7),
        damageValues: [24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 27, 27, 27, 27, 27, 28],
      },
      {
        statFrom: 62,
        statTo: 64,
        neutral: statRange(24, 31),
        positive: statRange(8, 17),
        damageValues: [25, 25, 25, 25, 25, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 30],
      },
      {
        statFrom: 66,
        statTo: 68,
        positive: statRange(18, 27),
        damageValues: [25, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 30, 30, 30, 30, 31],
      },
      {
        statFrom: 69,
        statTo: 70,
        positive: statRange(28, 31),
        damageValues: [27, 27, 28, 28, 28, 28, 30, 30, 30, 30, 30, 31, 31, 31, 31, 33],
      },
    ]));
  });

  test('gen 4 level 25 prinplup tackle with 16 evs 0 combat stages - vs - 50 def 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      baseStat: 66,
      movePower: 40,
      opponentStat: 50,
      stab: false,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 35,
        statTo: 36,
        negative: statRange(0, 11),
        damageValues: [6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8],
      },
      {
        statFrom: 37,
        statTo: 41,
        negative: statRange(12, 31),
        neutral: statRange(0, 11),
        damageValues: [7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9],
      },
      {
        statFrom: 42,
        statTo: 46,
        neutral: statRange(12, 31),
        positive: statRange(0, 15),
        damageValues: [8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10],
      },
      {
        statFrom: 47,
        statTo: 50,
        positive: statRange(16, 31),
        damageValues: [9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 0 evs 0 combat stages - vs - 62 def 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      evs: 0,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 40,
        statTo: 43,
        negative: statRange(0, 13),
        damageValues: [15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 18],
      },
      {
        statFrom: 44,
        statTo: 47,
        negative: statRange(14, 31),
        neutral: statRange(0, 9),
        damageValues: [16, 16, 16, 16, 16, 16, 16, 16, 18, 18, 18, 18, 18, 18, 18, 19],
      },
      {
        statFrom: 48,
        statTo: 51,
        neutral: statRange(10, 25),
        positive: statRange(0, 9),
        damageValues: [16, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 21],
      },
      {
        statFrom: 52,
        statTo: 55,
        neutral: statRange(26, 31),
        positive: statRange(10, 21),
        damageValues: [18, 18, 19, 19, 19, 19, 19, 19, 19, 21, 21, 21, 21, 21, 21, 22],
      },
      {
        statFrom: 56,
        statTo: 58,
        positive: statRange(22, 31),
        damageValues: [19, 19, 19, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 24],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs 0 combat stages holding mystic water - vs - 62 def 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      otherPowerModifier: 1.2,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 41,
        statTo: 43,
        negative: statRange(0, 9),
        damageValues: [16, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 21],
      },
      {
        statFrom: 44,
        statTo: 46,
        negative: statRange(10, 25),
        neutral: statRange(0, 1),
        damageValues: [18, 18, 19, 19, 19, 19, 19, 19, 19, 21, 21, 21, 21, 21, 21, 22],
      },
      {
        statFrom: 47,
        statTo: 49,
        negative: statRange(26, 31),
        neutral: statRange(2, 13),
        damageValues: [19, 19, 19, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 24],
      },
      {
        statFrom: 50,
        statTo: 52,
        neutral: statRange(14, 25),
        positive: statRange(0, 9),
        damageValues: [21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24, 25],
      },
      {
        statFrom: 53,
        statTo: 56,
        neutral: statRange(26, 31),
        positive: statRange(10, 21),
        damageValues: [22, 22, 22, 22, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 27],
      },
      {
        statFrom: 57,
        statTo: 59,
        positive: statRange(22, 31),
        damageValues: [24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 27, 27, 27, 27, 27, 28],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs 0 combat stages in torrent - vs - 62 def 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      torrent: true,
    }))).toStrictEqual(expandDamageRanges([
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

  test('gen 4 level 25 prinplup bubblebeam with 16 evs +0 combat stages critical hit - vs - 62 spdef 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      criticalHit: true,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 41,
        statTo: 43,
        negative: statRange(0, 9),
        damageValues: [30, 30, 30, 31, 31, 31, 31, 33, 33, 33, 33, 34, 34, 34, 34, 36],
      },
      {
        statFrom: 44,
        statTo: 47,
        negative: statRange(10, 29),
        neutral: statRange(0, 5),
        damageValues: [33, 33, 33, 33, 34, 34, 34, 34, 36, 36, 36, 36, 37, 37, 37, 39],
      },
      {
        statFrom: 48,
        statTo: 51,
        negative: statRange(30, 31),
        neutral: statRange(6, 21),
        positive: statRange(0, 5),
        damageValues: [34, 36, 36, 36, 36, 37, 37, 37, 39, 39, 39, 39, 40, 40, 40, 42],
      },
      {
        statFrom: 52,
        statTo: 55,
        neutral: statRange(22, 31),
        positive: statRange(6, 17),
        damageValues: [37, 37, 39, 39, 39, 40, 40, 40, 40, 42, 42, 42, 43, 43, 43, 45],
      },
      {
        statFrom: 56,
        statTo: 59,
        positive: statRange(18, 31),
        damageValues: [40, 40, 40, 42, 42, 42, 43, 43, 43, 45, 45, 45, 46, 46, 46, 48],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs +0 combat stages - vs - 62 spdef 1x effectiveness w/ light screen', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      screen: true,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 41,
        statTo: 48,
        negative: statRange(0, 31),
        neutral: statRange(0, 9),
        damageValues: [7, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10],
      },
      {
        statFrom: 49,
        statTo: 56,
        neutral: statRange(10, 31),
        positive: statRange(0, 21),
        damageValues: [9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 12],
      },
      {
        statFrom: 57,
        statTo: 59,
        positive: statRange(22, 31),
        damageValues: [10, 10, 10, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13],
      },
    ]));
  });

  test('gen 5 level 25 prinplup bubblebeam with 16 evs +0 combat stages - vs - 62 spdef 1x effectiveness w/ light screen', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      screen: true,
      generation: 5,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 41,
        statTo: 43,
        negative: statRange(0, 9),
        damageValues: [7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 9],
      },
      {
        statFrom: 44,
        statTo: 47,
        negative: statRange(10, 29),
        neutral: statRange(0, 5),
        damageValues: [8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9],
      },
      {
        statFrom: 48,
        statTo: 51,
        negative: statRange(30, 31),
        neutral: statRange(6, 21),
        positive: statRange(0, 5),
        damageValues: [8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10],
      },
      {
        statFrom: 52,
        statTo: 55,
        neutral: statRange(22, 31),
        positive: statRange(6, 17),
        damageValues: [9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 11],
      },
      {
        statFrom: 56,
        statTo: 59,
        positive: statRange(18, 31),
        damageValues: [9, 9, 9, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 12],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs 0 combat stages in rain - vs - 62 def 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      weatherBoosted: true,
    }))).toStrictEqual(expandDamageRanges([
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

  test('gen 5 level 25 prinplup bubblebeam with 16 evs +0 combat stages in rain - vs - 62 spdef 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      weatherBoosted: true,
      generation: 5,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 41,
        statTo: 43,
        negative: statRange(0, 9),
        damageValues: [22, 22, 22, 22, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 27],
      },
      {
        statFrom: 44,
        statTo: 47,
        negative: statRange(10, 29),
        neutral: statRange(0, 5),
        damageValues: [24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 27, 27, 27, 27, 27, 28],
      },
      {
        statFrom: 48,
        statTo: 51,
        negative: statRange(30, 31),
        neutral: statRange(6, 21),
        positive: statRange(0, 5),
        damageValues: [25, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 30, 30, 30, 30, 31],
      },
      {
        statFrom: 52,
        statTo: 55,
        neutral: statRange(22, 31),
        positive: statRange(6, 17),
        damageValues: [27, 27, 28, 28, 28, 28, 30, 30, 30, 30, 30, 31, 31, 31, 31, 33],
      },
      {
        statFrom: 56,
        statTo: 59,
        positive: statRange(18, 31),
        damageValues: [30, 30, 30, 31, 31, 31, 31, 33, 33, 33, 33, 34, 34, 34, 34, 36],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs +0 combat stages in harsh sunlight - vs - 62 spdef 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      weatherReduced: true,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 41,
        statTo: 48,
        negative: statRange(0, 31),
        neutral: statRange(0, 9),
        damageValues: [7, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10],
      },
      {
        statFrom: 49,
        statTo: 56,
        neutral: statRange(10, 31),
        positive: statRange(0, 21),
        damageValues: [9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 12],
      },
      {
        statFrom: 57,
        statTo: 59,
        positive: statRange(22, 31),
        damageValues: [10, 10, 10, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13],
      },
    ]));
  });

  test('gen 5 level 25 prinplup bubblebeam with 16 evs +0 combat stages in harsh sunlight - vs - 62 spdef 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      weatherReduced: true,
      generation: 5,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 41,
        statTo: 47,
        negative: statRange(0, 29),
        neutral: statRange(0, 5),
        damageValues: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 9],
      },
      {
        statFrom: 48,
        statTo: 55,
        negative: statRange(30, 31),
        neutral: statRange(6, 31),
        positive: statRange(0, 17),
        damageValues: [7, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10],
      },
      {
        statFrom: 56,
        statTo: 59,
        positive: statRange(18, 31),
        damageValues: [9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 12],
      },
    ]));
  });

  test('gen 4 level 25 prinplup surf with 16 evs +0 combat stages - vs multiple targets - 62 spdef 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      movePower: 95,
      multiTarget: true,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 41,
        statTo: 43,
        negative: statRange(0, 9),
        damageValues: [16, 16, 16, 16, 16, 16, 16, 16, 18, 18, 18, 18, 18, 18, 18, 19],
      },
      {
        statFrom: 44,
        statTo: 47,
        negative: statRange(10, 29),
        neutral: statRange(0, 5),
        damageValues: [16, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 21],
      },
      {
        statFrom: 48,
        statTo: 50,
        negative: statRange(30, 31),
        neutral: statRange(6, 17),
        positive: statRange(0, 1),
        damageValues: [18, 18, 19, 19, 19, 19, 19, 19, 19, 21, 21, 21, 21, 21, 21, 22],
      },
      {
        statFrom: 51,
        statTo: 54,
        neutral: statRange(18, 31),
        positive: statRange(2, 13),
        damageValues: [19, 19, 19, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 24],
      },
      {
        statFrom: 55,
        statTo: 58,
        positive: statRange(14, 29),
        damageValues: [21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24, 25],
      },
      {
        statFrom: 59,
        statTo: 59,
        positive: statRange(30, 31),
        damageValues: [22, 22, 22, 22, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 27],
      },
    ]));
  });

  test('gen 5 level 25 prinplup surf with 16 evs +0 combat stages - vs multiple targets - 62 spdef 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      movePower: 95,
      multiTarget: true,
      generation: 5,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 41,
        statTo: 43,
        negative: statRange(0, 9),
        damageValues: [15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 18],
      },
      {
        statFrom: 44,
        statTo: 46,
        negative: statRange(10, 25),
        neutral: statRange(0, 1),
        damageValues: [16, 16, 16, 16, 16, 16, 16, 16, 18, 18, 18, 18, 18, 18, 18, 19],
      },
      {
        statFrom: 47,
        statTo: 48,
        negative: statRange(26, 31),
        neutral: statRange(2, 9),
        damageValues: [16, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 21],
      },
      {
        statFrom: 49,
        statTo: 54,
        neutral: statRange(10, 31),
        positive: statRange(0, 13),
        damageValues: [18, 18, 19, 19, 19, 19, 19, 19, 19, 21, 21, 21, 21, 21, 21, 22],
      },
      {
        statFrom: 55,
        statTo: 57,
        positive: statRange(14, 25),
        damageValues: [19, 19, 19, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 24],
      },
      {
        statFrom: 58,
        statTo: 59,
        positive: statRange(26, 31),
        damageValues: [21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 24, 24, 24, 24, 24, 25],
      },
    ]));
  });

  test('gen 4 level 25 prinplup bubblebeam with 16 evs +0 combat stages with 1.2x other modifier - vs - 62 spdef 1x effectiveness', () => {
    expect(combineIdenticalLines(calculateDamageRanges({
      ...basePrinplupOptions,
      otherModifier: 1.2,
    }))).toStrictEqual(expandDamageRanges([
      {
        statFrom: 41,
        statTo: 43,
        negative: statRange(0, 9),
        damageValues: [18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 21],
      },
      {
        statFrom: 44,
        statTo: 47,
        negative: statRange(10, 29),
        neutral: statRange(0, 5),
        damageValues: [19, 19, 19, 19, 19, 19, 19, 19, 21, 21, 21, 21, 21, 21, 21, 22],
      },
      {
        statFrom: 48,
        statTo: 51,
        negative: statRange(30, 31),
        neutral: statRange(6, 21),
        positive: statRange(0, 5),
        damageValues: [19, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 25],
      },
      {
        statFrom: 52,
        statTo: 55,
        neutral: statRange(22, 31),
        positive: statRange(6, 17),
        damageValues: [21, 21, 22, 22, 22, 22, 22, 22, 22, 25, 25, 25, 25, 25, 25, 26],
      },
      {
        statFrom: 56,
        statTo: 59,
        positive: statRange(18, 31),
        damageValues: [22, 22, 22, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 28],
      },
    ]));
  });
});
