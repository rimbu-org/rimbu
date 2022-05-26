import type { IsPlainObj } from '@rimbu/base';

/**
 * A deep readonly typed version of given type T. Makes all properties or elements read only.
 * @typeparam T - the input type
 */
export type Protected<T> = T extends readonly (infer E)[]
  ? readonly Protected<E>[]
  : T extends Map<infer K, infer V>
  ? Map<Protected<K>, Protected<V>>
  : T extends Set<infer E>
  ? Set<Protected<E>>
  : T extends Promise<infer E>
  ? Promise<Protected<E>>
  : IsPlainObj<T> extends true
  ? { readonly [K in keyof T]: Protected<T[K]> }
  : T;

/**
 * Returns the same value wrapped in the Protected type
 * @param value - the value to wrap
 */
export function Protected<T>(value: T): Protected<T> {
  return value as any;
}
