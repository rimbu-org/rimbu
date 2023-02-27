import { HashMap, HashSet } from '@rimbu/hashed';
import {
  HashMultiMapHashValueCreators,
  MultiMapBase,
  MultiMapContext,
} from '@rimbu/multimap/custom';
import type { Stream, Streamable } from '@rimbu/stream';

/**
 * A type-invariant immutable MultiMap of key type K, and value type V.
 * In the MultiMap, each key has at least one value.
 * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [HashMultiMapHashValue API documentation](https://rimbu.org/api/rimbu/multimap/HashMultiMapHashValue/interface)
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @note
 * - The `HashMultiMapHashValue` uses the contexts' `HashMap` `keyContext` to hash
 * the keys
 * - The `HashMultiMapHashValue` uses the contexts' `HashSet` `valueContext` to collect
 * the values for each key.
 * @example
 * ```ts
 * const m1 = HashMultiMapHashValue.empty<number, string>()
 * const m2 = HashMultiMapHashValue.of([1, 'a'], [1, 'b'], [2, 'a'])
 * ```
 */
export interface HashMultiMapHashValue<K, V>
  extends MultiMapBase<K, V, HashMultiMapHashValue.Types> {}

export namespace HashMultiMapHashValue {
  /**
   * A non-empty type-invariant immutable MultiMap of key type K, and value type V.
   * In the MultiMap, each key has at least one value.
   * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [HashMultiMapHashValue API documentation](https://rimbu.org/api/rimbu/multimap/HashMultiMapHashValue/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   * @note
   * - The `HashMultiMapHashValue` uses the contexts' `HashMap` `keyContext` to hash
   * the keys
   * - The `HashMultiMapHashValue` uses the contexts' `HashSet` `valueContext` to collect
   * the values for each key.
   * @example
   * ```ts
   * const m1 = HashMultiMapHashValue.empty<number, string>()
   * const m2 = HashMultiMapHashValue.of([1, 'a'], [1, 'b'], [2, 'a'])
   * ```
   */
  export interface NonEmpty<K, V>
    extends MultiMapBase.NonEmpty<K, V, HashMultiMapHashValue.Types>,
      Omit<
        HashMultiMapHashValue<K, V>,
        keyof MultiMapBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<[K, V]> {
    stream(): Stream.NonEmpty<[K, V]>;
  }

  /**
   * A context instance for an `HashMultiMapHashValue` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   * @typeparam UV - the upper value type bound for which the context can be used
   */
  export interface Context<UK, UV>
    extends MultiMapBase.Context<UK, UV, HashMultiMapHashValue.Types> {
    readonly typeTag: 'HashMultiMapHashValue';

    /**
     * The `HashMap` context used to create HashMaps to the key to value maps.
     */
    readonly keyMapContext: HashMap.Context<UK>;
    /**
     * The `HashSet` context used to create HashSets for the value sets.
     */
    readonly keyMapValuesContext: HashSet.Context<UV>;
  }

  export namespace Context {
    export interface Options<UK, UV>
      extends MultiMapBase.Context.Options<
        UK,
        UV,
        HashMultiMapHashValue.Types
      > {}
  }

  /**
   * A mutable `HashMultiMapHashValue` builder used to efficiently create new immutable instances.
   * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [HashMultiMapHashValue.Builder API documentation](https://rimbu.org/api/rimbu/multimap/HashMultiMapHashValue/Builder/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends MultiMapBase.Builder<K, V, HashMultiMapHashValue.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends MultiMapBase.Types {
    readonly normal: HashMultiMapHashValue<this['_K'], this['_V']>;
    readonly nonEmpty: HashMultiMapHashValue.NonEmpty<this['_K'], this['_V']>;
    readonly context: HashMultiMapHashValue.Context<this['_K'], this['_V']>;
    readonly builder: HashMultiMapHashValue.Builder<this['_K'], this['_V']>;
    readonly keyMap: HashMap<this['_K'], HashSet.NonEmpty<this['_V']>>;
    readonly keyMapNonEmpty: HashMap.NonEmpty<
      this['_K'],
      HashSet.NonEmpty<this['_V']>
    >;
    readonly keyMapContext: HashMap.Context<this['_K']>;
    readonly keyMapValuesContext: HashSet.Context<this['_V']>;
    readonly keyMapValues: HashSet<this['_V']>;
    readonly keyMapValuesNonEmpty: HashSet.NonEmpty<this['_V']>;
  }
}

function createContext<UK, UV>(
  options?: HashMultiMapHashValue.Context.Options<UK, UV>
): HashMultiMapHashValue.Context<UK, UV> {
  return Object.freeze(
    new MultiMapContext<UK, UV, 'HashMultiMapHashValue', any>(
      'HashMultiMapHashValue',
      options?.keyMapContext ?? HashMap.defaultContext(),
      options?.keyMapValuesContext ?? HashSet.defaultContext(),
      options?.contextId
    )
  );
}

const _defaultContext: HashMultiMapHashValue.Context<any, any> = createContext({
  contextId: 'default',
});

export const HashMultiMapHashValue: HashMultiMapHashValueCreators =
  Object.freeze({
    ..._defaultContext,
    createContext,
    defaultContext<UK, UV>(): HashMultiMapHashValue.Context<UK, UV> {
      return _defaultContext;
    },
  });
