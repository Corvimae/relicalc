import { formatDamageRange, formatIVRange, formatIVRangeSet, formatStatRange } from '../../src/utils/format';

describe('formatDamageRange', () => {
  test('with low extreme and no high extreme', () => {
    expect(formatDamageRange([1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2])).toBe('(1) / 2');
  });

  test('with high extreme and no low extreme', () => {
    expect(formatDamageRange([2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3])).toBe('2 / (3)');
  });

  test('with both extremes', () => {
    expect(formatDamageRange([1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3])).toBe('(1) / 2 / (3)');
  });

  test('with middle range and no extremes', () => {
    expect(formatDamageRange([2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3])).toBe('2–3');
  });

  test('with middle range, low extreme, and no high extreme', () => {
    expect(formatDamageRange([1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3])).toBe('(1) / 2–3');
  });

  test('with middle range, high extreme, and no low extreme', () => {
    expect(formatDamageRange([2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4])).toBe('2–3 / (4)');
  });
  test('with middle range, high extreme, and  low extreme', () => {
    expect(formatDamageRange([1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4])).toBe('(1) / 2–3 / (4)');
  });
});

describe('formatIVRange', () => {
  test('from 0 to 31', () => {
    expect(formatIVRange({ from: 0, to: 31 })).toBe('0+');
  });
  
  test('only 0', () => {
    expect(formatIVRange({ from: 0, to: 0 })).toBe('0');
  });

  test('from 0 to 10', () => {
    expect(formatIVRange({ from: 0, to: 10 })).toBe('10-');
  });

  test('only 31', () => {
    expect(formatIVRange({ from: 31, to: 31 })).toBe('31');
  });

  test('from 10 to 31', () => {
    expect(formatIVRange({ from: 10, to: 31 })).toBe('10+');
  });

  test('only 10', () => {
    expect(formatIVRange({ from: 10, to: 10 })).toBe('10');
  });

  test('from 10 to 20', () => {
    expect(formatIVRange({ from: 10, to: 20 })).toBe('10–20');
  });
});

describe('formatIVRangeSet', () => {
  test('formats each segment correctly', () => {
    expect(formatIVRangeSet({
      negative: { from: 30, to: 31 },
      neutral: { from: 6, to: 21 },
      positive: { from: 0, to: 5 },
    })).toBe('30+ / 6–21 / 5-');
  });
});

describe('formatStatRange', () => {
  test('formats single value', () => {
    expect(formatStatRange(5, 5)).toBe('5');
  });

  test('formats range', () => {
    expect(formatStatRange(0, 5)).toBe('0–5');
  });
});
