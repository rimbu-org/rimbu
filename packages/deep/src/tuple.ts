import { Arr } from '@rimbu/base';
import type { Update } from '@rimbu/common';

/**
 * A readonly array of fixed length and types.
 */
export type Tuple<T extends Tuple.Source> = Readonly<T>;

export namespace Tuple {
  /**
   * A non-empty readonly array that can serve as a source for a Tuple.
   */
  export type NonEmptySource = readonly [unknown, ...unknown[]];

  /**
   * A readonly array that can serve as a source for a Tuple.
   */
  export type Source = readonly unknown[];

  /**
   * Convenience method to type Tuple types
   * @param values - the values of the tuple
   * @example
   * const t = Tuple.of(1, 'a', true)
   * // type of t => Tuple<[number, string, boolean]>
   */
  export function of<T extends Tuple.NonEmptySource>(...values: T): Tuple<T> {
    return values as any;
  }

  /**
   * Returns the item at the given `index` in the givn `tuple`.
   * @param tuple - the tuple to get the item from
   * @param index - the index in of the tuple element
   * @example
   * const t = Tuple.of(1, 'a', true)
   * console.log(Tuple.getIndex(t, 1))
   * // => 'a'
   */
  export function getIndex<T extends Tuple.Source, K extends keyof T = keyof T>(
    tuple: T,
    index: K
  ): T[K] {
    return tuple[index];
  }

  /**
   * Returns the first element of a Tuple.
   * @param tuple - the source tuple
   * @example
   * const t = Tuple.of(1, 'a', true)
   * console.log(Tuple.first(t))
   * // => 1
   */
  export function first<T extends Tuple.Source>(tuple: T): T[0] {
    return tuple[0];
  }

  /**
   * Returns the second element of a Tuple.
   * @param tuple - the source tuple
   * @example
   * const t = Tuple.of(1, 'a', true)
   * console.log(Tuple.second(t))
   * // => 'a'
   */
  export function second<T extends Tuple.Source>(tuple: T): T[1] {
    return tuple[1];
  }

  /**
   * Returns the last element of a Tuple.
   * @param tuple - the source tuple
   * @example
   * const t = Tuple.of(1, 'a', true)
   * console.log(Tuple.last(t))
   * // => true
   */
  export function last<T extends readonly unknown[], R>(
    tuple: readonly [...T, R]
  ): R {
    return tuple[tuple.length - 1] as any;
  }

  /**
   * Returns a copy of the given `tuple` where the element at given `index` is updated with the
   * given `updater`.
   * @param tuple - the source tuple
   * @param index - the index in the tuple
   * @param updater - the updater for the value
   * @example
   * const t = Tuple.of(1, 'a', true)
   * console.log(Tuple.updateAt(t, 1, 'b'))
   * // => [1, 'b', true]
   */
  export function updateAt<T extends Tuple.Source, K extends keyof T = keyof T>(
    tuple: T,
    index: K,
    updater: Update<T[K]>
  ): T {
    return Arr.update(tuple, index as number, updater) as T;
  }

  /**
   * Returns the given `tuple` with the given `values` appended.
   * @param tuple - the source tuple
   * @param values - the values to append
   * @example
   * const t = Tuple.of(1, 'a')
   * console.log(Tuple.append(t, true, 5))
   * // => [1, 'a', true, 5]
   */
  export function append<
    T extends Tuple.Source,
    V extends readonly [unknown, ...unknown[]]
  >(tuple: T, ...values: V): readonly [...T, ...V] {
    return [...tuple, ...values];
  }

  /**
   * Returns a Tuple containing the elements of given `tuple1` followed by the elements
   * of given `tuple2`.
   * @param tuple1 - the first Tuple
   * @param tuple2 - the second Tuple
   * @example
   * const t1 = Tuple.of(1, 'a')
   * const t2 = Tuple.of(true, 5)
   * console.log(Tuple.concat(t1, t2))
   * // => [1, 'a', true, 5]
   */
  export function concat<T1 extends Tuple.Source, T2 extends Tuple.Source>(
    tuple1: T1,
    tuple2: T2
  ): readonly [...T1, ...T2] {
    return tuple1.concat(tuple2) as any;
  }

  /**
   * Returns a Tuple containing all but the last element of the given `tuple`.
   * @param tuple - the source tuple
   * @example
   * const t = Tuple.of(1, 'a', true)
   * console.log(Tuple.init(t))
   * // => [1, 'a']
   */
  export function init<T extends readonly unknown[]>(
    tuple: readonly [...T, unknown]
  ): Readonly<T> {
    return Arr.init(tuple) as any;
  }

  /**
   * Returns a Tuple containing all but the first element of the given `tuple`.
   * @param tuple - the source tuple
   * @example
   * const t = Tuple.of(1, 'a', true)
   * console.log(Tuple.tail(t))
   * // => ['a', true]
   */
  export function tail<T extends readonly [...unknown[]]>(
    tuple: readonly [unknown, ...T]
  ): Readonly<T> {
    return Arr.tail(tuple) as any;
  }
}
