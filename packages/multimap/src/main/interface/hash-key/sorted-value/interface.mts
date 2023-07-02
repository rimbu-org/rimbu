import { HashMap } from '@rimbu/hashed/map';
import { SortedSet } from '@rimbu/sorted/set';
import type { Stream, Streamable } from '@rimbu/stream';

import {
  type HashMultiMapSortedValueCreators,
  type MultiMapBase,
  MultiMapContext,
} from '#multimap/custom';

/**
 * A type-invariant immutable MultiMap of key type K, and value type V.
 * In the MultiMap, each key has at least one value.
 * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [HashMultiMapSortedValue API documentation](https://rimbu.org/api/rimbu/multimap/HashMultiMapSortedValue/interface)
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @note
 * - The `HashMultiMapSortedValue` uses the contexts' `HashMap` `keyContext` to hash
 * the keys
 * - The `HashMultiMapSortedValue` uses the contexts' `SortedSet` `valueContext` to collect
 * the values for each key.
 * @example
 * ```ts
 * const m1 = HashMultiMapSortedValue.empty<number, string>()
 * const m2 = HashMultiMapSortedValue.of([1, 'a'], [1, 'b'], [2, 'a'])
 * ```
 */
export interface HashMultiMapSortedValue<K, V>
  extends MultiMapBase<K, V, HashMultiMapSortedValue.Types> {}

export namespace HashMultiMapSortedValue {
  /**
   * A non-empty type-invariant immutable MultiMap of key type K, and value type V.
   * In the MultiMap, each key has at least one value.
   * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [HashMultiMapSortedValue API documentation](https://rimbu.org/api/rimbu/multimap/HashMultiMapSortedValue/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   * @note
   * - The `HashMultiMapSortedValue` uses the contexts' `HashMap` `keyContext` to hash
   * the keys
   * - The `HashMultiMapSortedValue` uses the contexts' `SortedSet` `valueContext` to collect
   * the values for each key.
   * @example
   * ```ts
   * const m1 = HashMultiMapSortedValue.empty<number, string>()
   * const m2 = HashMultiMapSortedValue.of([1, 'a'], [1, 'b'], [2, 'a'])
   * ```
   */
  export interface NonEmpty<K, V>
    extends MultiMapBase.NonEmpty<K, V, HashMultiMapSortedValue.Types>,
      Omit<
        HashMultiMapSortedValue<K, V>,
        keyof MultiMapBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<[K, V]> {
    stream(): Stream.NonEmpty<[K, V]>;
  }

  /**
   * A context instance for an `HashMultiMapSortedValue` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   * @typeparam UV - the upper value type bound for which the context can be used
   */
  export interface Context<UK, UV>
    extends MultiMapBase.Context<UK, UV, HashMultiMapSortedValue.Types> {
    readonly typeTag: 'HashMultiMapSortedValue';

    /**
     * The `HashMap` context used to create HashMaps to the key to value maps.
     */
    readonly keyMapContext: HashMap.Context<UK>;
    /**
     * The `SortedSet` context used to create HashSets for the value sets.
     */
    readonly keyMapValuesContext: SortedSet.Context<UV>;
  }

  /**
   * A mutable `HashMultiMapSortedValue` builder used to efficiently create new immutable instances.
   * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [HashMultiMapSortedValue.Builder API documentation](https://rimbu.org/api/rimbu/multimap/HashMultiMapSortedValue/Builder/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends MultiMapBase.Builder<K, V, HashMultiMapSortedValue.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends MultiMapBase.Types {
    readonly normal: HashMultiMapSortedValue<this['_K'], this['_V']>;
    readonly nonEmpty: HashMultiMapSortedValue.NonEmpty<this['_K'], this['_V']>;
    readonly context: HashMultiMapSortedValue.Context<this['_K'], this['_V']>;
    readonly builder: HashMultiMapSortedValue.Builder<this['_K'], this['_V']>;
    readonly keyMap: HashMap<this['_K'], SortedSet.NonEmpty<this['_V']>>;
    readonly keyMapNonEmpty: HashMap.NonEmpty<
      this['_K'],
      SortedSet.NonEmpty<this['_V']>
    >;
    readonly keyMapContext: HashMap.Context<this['_K']>;
    readonly keyMapValuesContext: SortedSet.Context<this['_V']>;
    readonly keyMapValues: SortedSet<this['_V']>;
    readonly keyMapValuesNonEmpty: SortedSet.NonEmpty<this['_V']>;
  }
}

function createContext<K, V>(options?: {
  keyMapContext?: HashMap.Context<K>;
  keyMapValuesContext?: SortedSet.Context<V>;
}): HashMultiMapSortedValue.Context<K, V> {
  return Object.freeze(
    new MultiMapContext<K, V, 'HashMultiMapSortedValue', any>(
      'HashMultiMapSortedValue',
      options?.keyMapContext ?? HashMap.defaultContext(),
      options?.keyMapValuesContext ?? SortedSet.defaultContext()
    )
  );
}

const _defaultContext: HashMultiMapSortedValue.Context<any, any> =
  createContext();

export const HashMultiMapSortedValue: HashMultiMapSortedValueCreators =
  Object.freeze({
    ..._defaultContext,
    createContext,
    defaultContext<UK, UV>(): HashMultiMapSortedValue.Context<UK, UV> {
      return _defaultContext;
    },
  });
