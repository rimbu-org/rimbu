/**
 * A potentially lazy value of type T.
 * @typeparam T - the value type
 * @typeparam A - (default: []) types of the argument array that can be passed in the lazy case
 */
export type OptLazy<T, A extends any[] = []> = T | ((...args: A) => T);

/**
 * Returns the value contained in an `OptLazy` instance of type T.
 * @param optLazy - the `OptLazy` value of type T
 * @param args - when needed, the extra arguments to pass to the lazy invocation
 * @typeparam T - the value type
 * @typeparam A - (default: []) types of the argument array that can be passed in the lazy case
 * @example
 * ```ts
 * OptLazy(1)              // => 1
 * OptLazy(() => 1)        // => 1
 * OptLazy(() => () => 1)  // => () => 1
 * ```
 */
export function OptLazy<T, A extends any[] = []>(
  optLazy: OptLazy<T, A>,
  ...args: A
): T {
  if (optLazy instanceof Function) return optLazy(...args);
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
 * @typeparam T - the value type
 * @typeparam O - the default value type
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
