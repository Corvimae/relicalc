import { calculateHiddenPowerType, calculateHiddenPowerTypeFromIVs, calculateHiddenPowerBasePower, calculateHiddenPowerBasePowerFromIVs } from '../src/hiddenPower';
import { IVRangeSet, Stat } from '../src/reference';

function buildIVSetFromValues(
  hp: number,
  attack: number,
  defense: number,
  spAttack: number,
  spDefense: number,
  speed: number,
): Record<Stat, IVRangeSet> {
  return Object.entries({ hp, attack, defense, spAttack, spDefense, speed }).reduce((acc, [stat, value]) => ({
    ...acc,
    [stat as Stat]: {
      negative: [-1, -1],
      neutral: [value, value],
      positive: [-1, -1],
      combined: [value, value],
    },
  }), {} as Record<Stat, IVRangeSet>);
}

describe('calculateHiddenPowerTypeFromIVs ', () => {
  test('0/0/0/0/0/0', () => {
    expect(calculateHiddenPowerTypeFromIVs([0, 0, 0, 0, 0, 0])).toBe('fighting');
  });

  test('0/1/2/3/4/5', () => {
    expect(calculateHiddenPowerTypeFromIVs([0, 1, 2, 3, 4, 5])).toBe('ghost');
  });

  test('31/31/31/31/31/31', () => {
    expect(calculateHiddenPowerTypeFromIVs([31, 31, 31, 31, 31, 31])).toBe('dark');
  });
});

describe('calculateHiddenPowerType', () => {
  test('0/0/0/0/0/0', () => {
    expect(calculateHiddenPowerType(buildIVSetFromValues(0, 0, 0, 0, 0, 0), [null, null])).toBe('fighting');
  });

  test('0/1/2/3/4/5', () => {
    expect(calculateHiddenPowerType(buildIVSetFromValues(0, 1, 2, 3, 4, 5), [null, null])).toBe('ghost');
  });

  test('31/31/31/31/31/31', () => {
    expect(calculateHiddenPowerType(buildIVSetFromValues(31, 31, 31, 31, 31, 31), [null, null])).toBe('dark');
  });
});

describe('calculateHiddenPowerBasePowerFromIVs ', () => {
  test('0/0/0/0/0/0', () => {
    expect(calculateHiddenPowerBasePowerFromIVs([0, 0, 0, 0, 0, 0])).toBe(30);
  });

  test('0/1/2/3/4/5', () => {
    expect(calculateHiddenPowerBasePowerFromIVs([0, 1, 2, 3, 4, 5])).toBe(42);
  });

  test('31/31/31/31/31/31', () => {
    expect(calculateHiddenPowerBasePowerFromIVs([31, 31, 31, 31, 31, 31])).toBe(70);
  });
});

describe('calculateHiddenPowerBasePower', () => {
  test('0/0/0/0/0/0', () => {
    expect(calculateHiddenPowerBasePower(buildIVSetFromValues(0, 0, 0, 0, 0, 0), [null, null])).toBe(30);
  });

  test('0/1/2/3/4/5', () => {
    expect(calculateHiddenPowerBasePower(buildIVSetFromValues(0, 1, 2, 3, 4, 5), [null, null])).toBe(42);
  });

  test('31/31/31/31/31/31', () => {
    expect(calculateHiddenPowerBasePower(buildIVSetFromValues(31, 31, 31, 31, 31, 31), [null, null])).toBe(70);
  });
});
