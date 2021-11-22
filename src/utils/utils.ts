export function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_value, key) => key + from);
}

export function rangesOverlap([fromA, toA]: [number, number], [fromB, toB]: [number, number]): boolean {
  return Math.max(fromA, fromB) <= Math.min(toA, toB);
}
