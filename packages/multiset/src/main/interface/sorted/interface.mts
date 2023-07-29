import { SortedMap } from '@rimbu/sorted/map';
import type { Stream, Streamable } from '@rimbu/stream';

import { type MultiSetBase, MultiSetContext } from '@rimbu/multiset/custom';
import type { SortedMultiSetCreators } from '@rimbu/multiset/custom';

/**
 * A type-invariant immutable MultiSet of value type T.
 * In the MultiSet, each value can occur multiple times.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [SortedMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/SortedMultiSet/interface)
 * @typeparam T - the value type
 * @note
 * - The `SortedMultiSet` uses the contexts' `SortedMap` `mapContext` to sort
 * the values.
 * @example
 * ```ts
 * const s1 = SortedMultiSet.empty<string>()
 * const s2 = SortedMultiSet.of('a', 'b', 'a', 'c')
 * ```
 */
export interface SortedMultiSet<T>
  extends MultiSetBase<T, SortedMultiSet.Types> {}

export namespace SortedMultiSet {
  /**
   * A type-invariant immutable MultiSet of value type T.
   * In the MultiSet, each value can occur multiple times.
   * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [SortedMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/SortedMultiSet/interface)
   * @typeparam T - the value type
   * @note
   * - The `SortedMultiSet` uses the contexts' `SortedMap` `mapContext` to sort
   * the values.
   * @example
   * ```ts
   * const s1 = SortedMultiSet.empty<string>()
   * const s2 = SortedMultiSet.of('a', 'b', 'a', 'c')
   * ```
   */
  export interface NonEmpty<T>
    extends MultiSetBase.NonEmpty<T, SortedMultiSet.Types>,
      Omit<SortedMultiSet<T>, keyof MultiSetBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<T> {
    stream(): Stream.NonEmpty<T>;
  }

  /**
   * A context instance for an `SortedMultiSet` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UT - the upper value type bound for which the context can be used
   */
  export interface Context<UT>
    extends MultiSetBase.Context<UT, SortedMultiSet.Types> {
    readonly typeTag: 'SortedMultiSet';
  }

  /**
   * A mutable `SortedMultiSet` builder used to efficiently create new immutable instances.
   * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [SortedMultiSet.Builder API documentation](https://rimbu.org/api/rimbu/multiset/SortedMultiSet/Builder/interface)
   * @typeparam T - the value type
   */
  export interface Builder<T>
    extends MultiSetBase.Builder<T, SortedMultiSet.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends MultiSetBase.Types {
    readonly normal: SortedMultiSet<this['_T']>;
    readonly nonEmpty: SortedMultiSet.NonEmpty<this['_T']>;
    readonly context: SortedMultiSet.Context<this['_T']>;
    readonly builder: SortedMultiSet.Builder<this['_T']>;
    readonly countMap: SortedMap<this['_T'], number>;
    readonly countMapNonEmpty: SortedMap.NonEmpty<this['_T'], number>;
    readonly countMapContext: SortedMap.Context<this['_T']>;
  }
}

function createContext<UT>(options?: {
  countMapContext?: SortedMap.Context<UT>;
}): SortedMultiSet.Context<UT> {
  return Object.freeze(
    new MultiSetContext<UT, 'SortedMultiSet', any>(
      'SortedMultiSet',
      options?.countMapContext ?? SortedMap.defaultContext()
    )
  );
}

const _defaultContext: SortedMultiSet.Context<any> = createContext();

export const SortedMultiSet: SortedMultiSetCreators = Object.freeze({
  ..._defaultContext,
  createContext,
  defaultContext<UT>(): SortedMultiSet.Context<UT> {
    return _defaultContext;
  },
});
