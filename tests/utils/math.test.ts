import { gamefreakPowerOfTwoPointFive, integerMultiply, multiplyForGeneration, to4096Numerator } from '../../src/utils/math';

describe('integerMultiply', () => {
  test('two values rounds down', () => {
    expect(integerMultiply(3, 2.5)).toBe(7);
  });

  test('three values rounds down twice', () => {
    expect(integerMultiply(3, 2.5, 1.5)).toBe(10);
  });
});

describe('multiplyForGeneration', () => {
  test('gen 4', () => {
    expect(multiplyForGeneration(50, 1.35, 4)).toBe(67);
  });

  test('gen 5', () => {
    expect(multiplyForGeneration(50, 1.35, 5)).toBe(68);
  });

  test('gen 7', () => {
    expect(multiplyForGeneration(50, 1.35, 7)).toBe(68);
  });

  test('lgpe', () => {
    expect(multiplyForGeneration(50, 1.35, 'lgpe')).toBe(68);
  });
});

describe('to4096Numerator', () => {
  test('adds 0.5 and rounds down', () => {
    expect(to4096Numerator(1.35)).toBe(5530);
  });
});

describe('gameFreakPowerOfTwoPointFive', () => {
  test('does not round', () => {
    expect(gamefreakPowerOfTwoPointFive(15)).toBe(871.4212646484375);
  });
});
