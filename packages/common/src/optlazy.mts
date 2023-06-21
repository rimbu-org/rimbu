/**
 * A potentially lazy value of type T.
 * @typeparam T - the value type
 */
export type OptLazy<T> = T | (() => T);

/**
 * Returns the value contained in an `OptLazy` instance of type T.
 * @param optLazy - the `OptLazy` value of type T
 * @example
 * ```ts
 * OptLazy(1)              // => 1
 * OptLazy(() => 1)        // => 1
 * OptLazy(() => () => 1)  // => () => 1
 * ```
 */
export function OptLazy<T>(optLazy: OptLazy<T>): T {
  if (optLazy instanceof Function) return optLazy();
  return optLazy;
}

/**
 * A potentially lazy value that, in case of a lazy function, received a default value
 * that it can return.
 * @typeparam T - the value type
 * @typeparam O - the default value type
 */
export type OptLazyOr<T, O> = T | ((none: O) => T | O);

/**
 * Returns the value contained in an `OptLazyOr` instance of type T, or the given
 * `otherValue` if the lazy function returns it.
 * @param optLazyOr - a value or a function returning a value or otherwise the received value
 * @param otherValue - the value to return if the optLazyOr does not return its own value
 * @example
 * ```ts
 * OptLazyOr(1, 'a')               // => 1
 * OptLazyOr(() => 1, 'a')         // => 1
 * OptLazyOr((none) => none, 'a')  // => 'a'
 * ```
 */
export function OptLazyOr<T, O>(
  optLazyOr: OptLazyOr<T, O>,
  otherValue: O
): T | O {
  if (optLazyOr instanceof Function) return optLazyOr(otherValue);
  return optLazyOr;
}
