import { Generation } from '../reference';

export function integerMultiply(...values: number[]): number {
  return values.reduce((acc, mult) => Math.floor(acc * mult), 1);
}

export function multiplyForGeneration(value: number, multiplier: number, generation: Generation): number {
  if (generation === 5 || generation >= 7 || generation === 'lgpe') {
    let preliminaryValue = value * to4096Numerator(multiplier);
    const requiresAdjustment = (preliminaryValue & 4095) > 2048;

    preliminaryValue >>= 12;

    return Math.fround(requiresAdjustment ? preliminaryValue + 1 : preliminaryValue);
  }

  return Math.fround(Math.floor(value * multiplier));
}

export function multiplyAllForGeneration(value: number, multipliers: number[], generation: Generation): number {
  return multipliers.reduce((acc, multiplier) => multiplyForGeneration(acc, multiplier, generation), value);
}

export function to4096Numerator(value: number): number {
  return Math.floor(value * 4096 + 0.5);
}

export function gamefreakPowerOfTwoPointFive(value: number): number {
  const rounded = Math.fround(value);

  return Math.fround(Math.fround(rounded * rounded) * Math.fround(Math.sqrt(rounded)));
}
