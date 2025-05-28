export type Index = number;
export type Positions = bigint;

export const EMPTY_POSITIONS = 0n;
export const FIRST_BIT_MASK = 1n;
export const SHIFT_ONE_BIT = 1n;

export function eachIndex(
  positions: Positions,
  callback: (index: Index) => void
): void {
  if (typeof positions !== 'bigint') {
    throw new TypeError(`Expected a bigint instead of ${positions}`);
  }
  if (positions < 0n) {
    throw new RangeError(`Negative positions are not allowed: ${positions}`);
  }

  let currentPosition = 0;
  while (positions) {
    if (positions & FIRST_BIT_MASK) {
      callback(currentPosition);
    }

    positions = positions >> SHIFT_ONE_BIT;
    currentPosition++;
  }
}
