import type { IsAny, IsPlainObj } from '../base/mod.ts';

/**
 * A deep readonly typed version of given type T. Makes all properties or elements read only.
 * It maps types using the following rules:
 * - arrays and tuples become readonly counterparts, and all element types are wrapped in `Protected` if applicable
 * - Maps of key type K and value type V become Maps of key type `Protected<K>` and value type `Protected<V>`
 * - Sets of element type E become Sets of element type `Protected<E>`
 * - Promises of value type E become Promises of value type `Protected<E>`
 * - Objects that have only simple properties (no functions or iterators) will have all the properties as Protected if applicable
 * - Any other type will not be mapped
 * @typeparam T - the input type
 */
export type Protected<T> = IsAny<T> extends true
  ? T
  : T extends readonly any[] & infer A
  ? { readonly [K in keyof A]: Protected<A[K]> }
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
 * Returns the same value wrapped in the `Protected` type.
 * @param value - the value to wrap
 * @note does not perform any runtime protection, it is only a utility to easily add the `Protected`
 * type to a value
 * @example
 * ```ts
 * const obj = Protected({ a: 1, b: { c: true, d: [1] } })
 * obj.a = 2        // compiler error: a is readonly
 * obj.b.c = false  // compiler error: c is readonly
 * obj.b.d.push(2)  // compiler error: d is a readonly array
 * (obj as any).b.d.push(2)  // will actually mutate the object
 * ```
 */
export function Protected<T>(value: T): Protected<T> {
  return value as any;
}
