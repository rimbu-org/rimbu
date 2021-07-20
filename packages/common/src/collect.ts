import type { MaybePromise } from './internal';

/**
 * A function used in `collect` methods to collect values from a collection. This is basically a single-pass map and filter.
 * @param value - the input value
 * @param index - the index of the input value
 * @param skip - a token that can be returned to skip the value
 * @param halt - a function that, when called, ensures no more values are passed
 * @returns either a new value to collect, or the `skip` token indicating to skip the value
 */
export type CollectFun<T, R> = (
  value: T,
  index: number,
  skip: CollectFun.Skip,
  halt: () => void
) => R | CollectFun.Skip;

export namespace CollectFun {
  /**
   * Indicates, when returned from a collect function, to skip the vale.
   */
  export const Skip = Symbol('Skip');

  /**
   * Indicates, when returned from a collect function, to skip the vale.
   */
  export type Skip = typeof Skip;
}

export type AsyncCollectFun<T, R> = (
  value: T,
  index: number,
  skip: CollectFun.Skip,
  halt: () => void
) => MaybePromise<R | CollectFun.Skip>;
