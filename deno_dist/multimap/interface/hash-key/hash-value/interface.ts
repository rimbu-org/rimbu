import type { RSet } from '../../../../collection-types/mod.ts';
import type { OmitStrong } from '../../../../common/mod.ts';
import { HashMap, HashSet } from '../../../../hashed/mod.ts';
import type { Stream, Streamable } from '../../../../stream/mod.ts';
import { MultiMapBase, MultiMapContext } from '../../../multimap-custom.ts';

/**
 * A type-invariant immutable MultiMap of key type K, and value type V.
 * In the MultiMap, each key has at least one value.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * * The `HashMultiMapHashValue` uses the contexts' `HashMap` `keyContext` to hash
 * the keys
 * * The `HashMultiMapHashValue` uses the contexts' `HashSet` `valueContext` to collect
 * the values for each key.
 * @example
 * const m1 = HashMultiMapHashValue.empty<number, string>()
 * const m2 = HashMultiMapHashValue.of([1, 'a'], [1, 'b'], [2, 'a'])
 */
export interface HashMultiMapHashValue<K, V>
  extends MultiMapBase<K, V, HashMultiMapHashValue.Types> {}

export namespace HashMultiMapHashValue {
  /**
   * A non-empty type-invariant immutable MultiMap of key type K, and value type V.
   * In the MultiMap, each key has at least one value.
   * @typeparam K - the key type
   * @typeparam V - the value type
   * * The `HashMultiMapHashValue` uses the contexts' `HashMap` `keyContext` to hash
   * the keys
   * * The `HashMultiMapHashValue` uses the contexts' `HashSet` `valueContext` to collect
   * the values for each key.
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

  /**
   * A mutable `HashMultiMapHashValue` builder used to efficiently create new immutable instances.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends MultiMapBase.Builder<K, V, HashMultiMapHashValue.Types> {}

  export interface Types extends MultiMapBase.Types {
    normal: HashMultiMapHashValue<this['_K'], this['_V']>;
    nonEmpty: HashMultiMapHashValue.NonEmpty<this['_K'], this['_V']>;
    context: HashMultiMapHashValue.Context<this['_K'], this['_V']>;
    builder: HashMultiMapHashValue.Builder<this['_K'], this['_V']>;
    keyMap: HashMap<this['_K'], HashSet.NonEmpty<this['_V']>> &
      HashMap<this['_K'], RSet.NonEmpty<this['_V']>>;
    keyMapNonEmpty: HashMap.NonEmpty<this['_K'], HashSet.NonEmpty<this['_V']>> &
      HashMap.NonEmpty<this['_K'], RSet.NonEmpty<this['_V']>>;
    keyMapContext: HashMap.Context<this['_K']>;
    keyMapValuesContext: HashSet.Context<this['_V']>;
    keyMapValues: HashSet<this['_V']>;
    keyMapValuesNonEmpty: HashSet.NonEmpty<this['_V']>;
  }
}

interface TypesImpl extends HashMultiMapHashValue.Types {
  context: MultiMapContext<
    this['_K'],
    this['_V'],
    'HashMultiMapHashValue',
    any
  >;
}

function createContext<UK, UV>(options?: {
  keyMapContext?: HashMap.Context<UK>;
  keyMapValuesContext?: HashSet.Context<UV>;
}): HashMultiMapHashValue.Context<UK, UV> {
  return new MultiMapContext<UK, UV, 'HashMultiMapHashValue', TypesImpl>(
    'HashMultiMapHashValue',
    options?.keyMapContext ?? HashMap.defaultContext(),
    options?.keyMapValuesContext ?? HashSet.defaultContext()
  );
}

const _defaultContext: HashMultiMapHashValue.Context<any, any> =
  createContext();

const _contextHelpers = {
  /**
   * Returns a new HashMultiMapHashValue context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * keyMapContext - (optional) the map context to use for key to valueset mappings
   * * keyMapValuesContext - (optional) the set context to use for value sets
   */
  createContext,
  /**
   * Returns the default context for HashMultiMapHashValue.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   */
  defaultContext<UK, UV>(): HashMultiMapHashValue.Context<UK, UV> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  HashMultiMapHashValue.Context<any, any>,
  'typeTag' | 'keyMapContext' | 'keyMapValuesContext'
> &
  typeof _contextHelpers;

export const HashMultiMapHashValue: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
