import type { IsAny, IsPlainObj } from '@rimbu/base';

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
  ? // to prevent infinite recursion, any will be any
    T
  : T extends readonly any[] & infer A
  ? // convert all keys to readonly and all values to `Protected`
    { readonly [K in keyof A]: Protected<A[K]> }
  : T extends Map<infer K, infer V>
  ? // return keys and values as `Protected` and omit mutable methods
    Omit<Map<Protected<K>, Protected<V>>, 'clear' | 'delete' | 'set'>
  : T extends Set<infer E>
  ? // return values as `Protected` and omit mutable methods
    Omit<Set<Protected<E>>, 'add' | 'clear' | 'delete'>
  : T extends Promise<infer E>
  ? // return promise value as `Protected`
    Promise<Protected<E>>
  : IsPlainObj<T> extends true
  ? // convert all keys to readonly and all values to `Protected`
    { readonly [K in keyof T]: Protected<T[K]> }
  : // nothing to do, just return `T`
    T;
