export function range(from: number, to: number): number[] {
  return [...Array(to - from + 1).keys()].map(value => value + from);
}

export function rangesOverlap([fromA, toA]: [number, number], [fromB, toB]: [number, number]): boolean {
  return Math.max(fromA, fromB) <= Math.min(toA, toB);
}

export type ErrorableResult<T> = { error: false, value: T } | { error: true, message: string };

export function evaluateAsThrowableOptional<T>(callback: () => T): ErrorableResult<T> {
  try {
    return {
      error: false,
      value: callback(),
    };
  } catch (e) {
    return {
      error: true,
      message: (e as Error).message,
    };
  }
}
