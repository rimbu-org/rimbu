/**
 * The distance between two values; a non-negative real number between:
 *
 * * 0 - meaning the two values are equal
 *
 * * `Number.POSITIVE_INFINITY` - the two values are so distant that can never match
 */
export type Distance = number;

/**
 * Measures the distance between two values.
 *
 * @returns The distance between its arguments, in a [`0`; `Number.POSITIVE_INFINITY`] range
 */
export type DistanceFunction<T> = (one: T, another: T) => Distance;

export namespace DistanceFunction {
  /**
   * Sensible default distance function, based on `===`
   *
   * @returns `0` if the two values satisfy `===`, `Number.POSITIVE_INFINITY` otherwise
   */
  export const defaultFunction: DistanceFunction<unknown> = (
    one: unknown,
    another: unknown
  ) => (one === another ? 0 : Number.POSITIVE_INFINITY);
}
