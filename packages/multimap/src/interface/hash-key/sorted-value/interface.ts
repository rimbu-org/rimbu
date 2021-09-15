import type { RSet } from '@rimbu/collection-types';
import type { OmitStrong } from '@rimbu/common';
import { HashMap } from '@rimbu/hashed';
import { SortedSet } from '@rimbu/sorted';
import type { Stream, Streamable } from '@rimbu/stream';
import { MultiMapBase, MultiMapContext } from '../../../multimap-custom';

/**
 * A type-invariant immutable MultiMap of key type K, and value type V.
 * In the MultiMap, each key has at least one value.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * * The `HashMultiMapSortedValue` uses the contexts' `HashMap` `keyContext` to hash
 * the keys
 * * The `HashMultiMapSortedValue` uses the contexts' `SortedSet` `valueContext` to collect
 * the values for each key.
 * @example
 * const m1 = HashMultiMapSortedValue.empty<number, string>()
 * const m2 = HashMultiMapSortedValue.of([1, 'a'], [1, 'b'], [2, 'a'])
 */
export interface HashMultiMapSortedValue<K, V>
  extends MultiMapBase<K, V, HashMultiMapSortedValue.Types> {}

export namespace HashMultiMapSortedValue {
  /**
   * A non-empty type-invariant immutable MultiMap of key type K, and value type V.
   * In the MultiMap, each key has at least one value.
   * @typeparam K - the key type
   * @typeparam V - the value type
   * * The `HashMultiMapSortedValue` uses the contexts' `HashMap` `keyContext` to hash
   * the keys
   * * The `HashMultiMapSortedValue` uses the contexts' `SortedSet` `valueContext` to collect
   * the values for each key.
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
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends MultiMapBase.Builder<K, V, HashMultiMapSortedValue.Types> {}

  export interface Types extends MultiMapBase.Types {
    normal: HashMultiMapSortedValue<this['_K'], this['_V']>;
    nonEmpty: HashMultiMapSortedValue.NonEmpty<this['_K'], this['_V']>;
    context: HashMultiMapSortedValue.Context<this['_K'], this['_V']>;
    builder: HashMultiMapSortedValue.Builder<this['_K'], this['_V']>;
    keyMap: HashMap<this['_K'], SortedSet.NonEmpty<this['_V']>> &
      HashMap<this['_K'], RSet.NonEmpty<this['_V']>>;
    keyMapNonEmpty: HashMap.NonEmpty<
      this['_K'],
      SortedSet.NonEmpty<this['_V']>
    > &
      HashMap.NonEmpty<this['_K'], RSet.NonEmpty<this['_V']>>;
    keyMapContext: HashMap.Context<this['_K']>;
    keyMapValuesContext: SortedSet.Context<this['_V']>;
    keyMapValues: SortedSet<this['_V']>;
    keyMapValuesNonEmpty: SortedSet.NonEmpty<this['_V']>;
  }
}

interface TypesImpl extends HashMultiMapSortedValue.Types {
  context: MultiMapContext<
    this['_K'],
    this['_V'],
    'HashMultiMapSortedValue',
    any
  >;
}

function createContext<K, V>(options?: {
  keyMapContext?: HashMap.Context<K>;
  keyMapValuesContext?: SortedSet.Context<V>;
}): HashMultiMapSortedValue.Context<K, V> {
  return new MultiMapContext<K, V, 'HashMultiMapSortedValue', TypesImpl>(
    'HashMultiMapSortedValue',
    options?.keyMapContext ?? HashMap.defaultContext(),
    options?.keyMapValuesContext ?? SortedSet.defaultContext()
  );
}

const _defaultContext: HashMultiMapSortedValue.Context<any, any> =
  createContext();

const _contextHelpers = {
  /**
   * Returns a new HashMultiMapSortedValue context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * keyMapContext - (optional) the map context to use for key to valueset mappings
   * * keyMapValuesContext - (optional) the set context to use for value sets
   */
  createContext,
  /**
   * Returns the default context for HashMultiMapSortedValue.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   */
  defaultContext<UK, UV>(): HashMultiMapSortedValue.Context<UK, UV> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  HashMultiMapSortedValue.Context<any, any>,
  'keyMapContext' | 'typeTag' | 'keyMapValuesContext'
> &
  typeof _contextHelpers;

export const HashMultiMapSortedValue: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
