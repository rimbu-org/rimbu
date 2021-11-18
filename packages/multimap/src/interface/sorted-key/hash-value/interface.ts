import type { OmitStrong } from '@rimbu/common';
import { HashSet } from '@rimbu/hashed';
import { SortedMap } from '@rimbu/sorted';
import type { Stream, Streamable } from '@rimbu/stream';
import { MultiMapBase, MultiMapContext } from '../../../multimap-custom';

/**
 * A type-invariant immutable MultiMap of key type K, and value type V.
 * In the MultiMap, each key has at least one value.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * * The `SortedMultiMapHashValue` uses the contexts' `SortedMap` `keyContext` to hash
 * the keys
 * * The `SortedMultiMapHashValue` uses the contexts' `HashSet` `valueContext` to collect
 * the values for each key.
 * @example
 * @example
 * const m1 = SortedMultiMapHashValue.empty<number, string>()
 * const m2 = SortedMultiMapHashValue.of([1, 'a'], [1, 'b'], [2, 'a'])
 */
export interface SortedMultiMapHashValue<K, V>
  extends MultiMapBase<K, V, SortedMultiMapHashValue.Types> {}

export namespace SortedMultiMapHashValue {
  /**
   * A non-empty type-invariant immutable MultiMap of key type K, and value type V.
   * In the MultiMap, each key has at least one value.
   * @typeparam K - the key type
   * @typeparam V - the value type
   * * The `SortedMultiMapHashValue` uses the contexts' `SortedMap` `keyContext` to hash
   * the keys
   * * The `SortedMultiMapHashValue` uses the contexts' `HashSet` `valueContext` to collect
   * the values for each key.
   */
  export interface NonEmpty<K, V>
    extends MultiMapBase.NonEmpty<K, V, SortedMultiMapHashValue.Types>,
      Omit<
        SortedMultiMapHashValue<K, V>,
        keyof MultiMapBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<[K, V]> {
    stream(): Stream.NonEmpty<[K, V]>;
  }

  /**
   * A context instance for an `SortedMultiMapHashValue` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   * @typeparam UV - the upper value type bound for which the context can be used
   */
  export interface Context<UK, UV>
    extends MultiMapBase.Context<UK, UV, SortedMultiMapHashValue.Types> {
    readonly typeTag: 'SortedMultiMapHashValue';
    /**
     * The `SortedMap` context used to create SortedMaps to the key to value maps.
     */
    readonly keyMapContext: SortedMap.Context<UK>;
    /**
     * The `HashSet` context used to create HashSets for the value sets.
     */
    readonly keyMapValuesContext: HashSet.Context<UV>;
  }

  /**
   * A mutable `SortedMultiMapHashValue` builder used to efficiently create new immutable instances.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends MultiMapBase.Builder<K, V, SortedMultiMapHashValue.Types> {}

  export interface Types extends MultiMapBase.Types {
    readonly normal: SortedMultiMapHashValue<this['_K'], this['_V']>;
    readonly nonEmpty: SortedMultiMapHashValue.NonEmpty<this['_K'], this['_V']>;
    readonly context: SortedMultiMapHashValue.Context<this['_K'], this['_V']>;
    readonly builder: SortedMultiMapHashValue.Builder<this['_K'], this['_V']>;
    readonly keyMap: SortedMap<this['_K'], HashSet.NonEmpty<this['_V']>>;
    readonly keyMapNonEmpty: SortedMap.NonEmpty<
      this['_K'],
      HashSet.NonEmpty<this['_V']>
    >;
    readonly keyMapContext: SortedMap.Context<this['_K']>;
    readonly keyMapValuesContext: HashSet.Context<this['_V']>;
    readonly keyMapValues: HashSet<this['_V']>;
    readonly keyMapValuesNonEmpty: HashSet.NonEmpty<this['_V']>;
  }
}

function createContext<K, V>(options?: {
  keyMapContext?: SortedMap.Context<K>;
  keyMapValuesContext?: HashSet.Context<V>;
}): SortedMultiMapHashValue.Context<K, V> {
  return new MultiMapContext<K, V, 'SortedMultiMapHashValue', any>(
    'SortedMultiMapHashValue',
    options?.keyMapContext ?? SortedMap.defaultContext(),
    options?.keyMapValuesContext ?? HashSet.defaultContext()
  );
}

const _defaultContext: SortedMultiMapHashValue.Context<any, any> =
  createContext();

const _contextHelpers = {
  /**
   * Returns a new SortedMultiMapHashValue context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * keyMapContext - (optional) the map context to use for key to valueset mappings
   * * keyMapValuesContext - (optional) the set context to use for value sets
   */
  createContext,
  /**
   * Returns the default context for SortedMultiMapHashValue.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   */
  defaultContext<K, V>(): SortedMultiMapHashValue.Context<K, V> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  SortedMultiMapHashValue.Context<any, any>,
  'keyMapContext' | 'typeTag' | 'keyMapValuesContext'
> &
  typeof _contextHelpers;

export const SortedMultiMapHashValue: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
