import type { Literal } from './internal.ts';

/**
 * An immutably typed version of given type T. Makes all properties or elements read only.
 * @typeparam T - the input type
 */
export type Immutable<T> = T extends (infer E)[]
  ? readonly Immutable<E>[]
  : T extends Literal.Obj
  ? { readonly [K in keyof T]: Immutable<T[K]> }
  : T extends boolean
  ? boolean
  : T;

/**
 * Returns the same value wrapped in the Immutable type
 * @param value - the value to wrap
 */
export function Immutable<T>(value: T): Immutable<T> {
  return value as any;
}
