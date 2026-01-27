import type { OptLazy } from '@rimbu/common/opt-lazy';

/**
 * A type that is either a value T or a promise yielding a value of type T.
 * @typeparam T - the value type
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * A potentially lazy and/or asynchronous value of type T.
 * @typeparam T - the value type
 * @typeparam A - (default: []) types of the argument array that can be passed in the lazy case
 */
export type AsyncOptLazy<T, A extends any[] = []> = OptLazy<MaybePromise<T>, A>;

export namespace AsyncOptLazy {
  /**
   * Returns the value or promised value contained in an `AsyncOptLazy` instance of type T.
   * @param optLazy - the `AsyncOptLazy` value of type T
   * @param args - when needed, the extra arguments to pass to the lazy invocation
   * @typeparam T - the value type
   * @typeparam A - (default: []) types of the argument array that can be passed in the lazy case
   * @example
   * ```ts
   * AsyncOptLazy.toMaybePromise(1)              // => 1
   * AsyncOptLazy.toMaybePromise(() => 1)        // => 1
   * AsyncOptLazy.toMaybePromise(() => () => 1)  // => () => 1
   * AsyncOptLazy.toMaybePromise(async () => 1)  // => Promise(1)
   * AsyncOptLazy.toMaybePromise(Promise.resolve(1))  // => Promise(1)
   * ```
   */
  export function toMaybePromise<T, A extends any[] = []>(
    optLazy: AsyncOptLazy<T, A>,
    ...args: A
  ): MaybePromise<T> {
    if (optLazy instanceof Function) return optLazy(...args);
    return optLazy;
  }

  /**
   * Returns the value contained in an `AsyncOptLazy` instance of type T as a promise.
   * @param optLazy - the `AsyncOptLazy` value of type T
   * @param args - when needed, the extra arguments to pass to the lazy invocation
   * @typeparam T - the value type
   * @typeparam A - (default: []) types of the argument array that can be passed in the lazy case
   * @example
   * ```ts
   * AsyncOptLazy.toPromise(1)              // => Promise(1)
   * AsyncOptLazy.toPromise(() => 1)        // => Promise(1)
   * AsyncOptLazy.toPromise(() => () => 1)  // => Promise(() => 1)
   * AsyncOptLazy.toPromise(async () => 1)  // => Promise(1)
   * AsyncOptLazy.toPromise(Promise.resolve(1))  // => Promise(1)
   * ```
   */
  export async function toPromise<T, A extends any[] = []>(
    optLazy: AsyncOptLazy<T, A>,
    ...args: A
  ): Promise<T> {
    if (optLazy instanceof Function) return optLazy(...args);
    return optLazy;
  }
}
