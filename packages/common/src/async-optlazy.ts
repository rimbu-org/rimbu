import { MaybePromise, OptLazy } from './internal';

/**
 * A potentially lazy and/or asynchronous value of type T.
 * @typeparam T - the value type
 */
export type AsyncOptLazy<T> = OptLazy<MaybePromise<T>>;

export namespace AsyncOptLazy {
  /**
   * Returns the value or promised value contained in an `AsyncOptLazy` instance of type T.
   * @param optLazy - the `AsyncOptLazy` value of type T
   * @example
   * AsyncOptLazy.toMaybePromise(1)              // => 1
   * AsyncOptLazy.toMaybePromise(() => 1)        // => 1
   * AsyncOptLazy.toMaybePromise(() => () => 1)  // => () => 1
   * AsyncOptLazy.toMaybePromise(async () => 1)  // => Promise(1)
   * AsyncOptLazy.toMaybePromise(Promise.resolve(1))  // => Promise(1)
   */
  export const toMaybePromise: <T>(
    optLazy: AsyncOptLazy<T>
  ) => MaybePromise<T> = OptLazy;

  /**
   * Returns the value contained in an `AsyncOptLazy` instance of type T as a promise.
   * @param optLazy - the `AsyncOptLazy` value of type T
   * @example
   * AsyncOptLazy.toPromise(1)              // => Promise(1)
   * AsyncOptLazy.toPromise(() => 1)        // => Promise(1)
   * AsyncOptLazy.toPromise(() => () => 1)  // => Promise(() => 1)
   * AsyncOptLazy.toPromise(async () => 1)  // => Promise(1)
   * AsyncOptLazy.toPromise(Promise.resolve(1))  // => Promise(1)
   */
  export async function toPromise<T>(optLazy: AsyncOptLazy<T>): Promise<T> {
    if (optLazy instanceof Function) return optLazy();
    return optLazy;
  }
}
