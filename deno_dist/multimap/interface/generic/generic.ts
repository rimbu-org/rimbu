import type { RMap, RSet } from '../../../collection-types/mod.ts';
import type { Streamable } from '../../../stream/mod.ts';
import { MultiMapBase, MultiMapContext } from '../../multimap-custom.ts';

/**
 * A type-invariant immutable MultiMap of key type K, and value type V.
 * In the Map, each key has at least one value.
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export interface MultiMap<K, V> extends MultiMapBase<K, V, MultiMap.Types> {}

export namespace MultiMap {
  /**
   * A non-empty type-invariant immutable MultiMap of key type K, and value type V.
   * In the Map, each key has at least one value.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface NonEmpty<K, V>
    extends MultiMapBase.NonEmpty<K, V, MultiMap.Types>,
      Streamable.NonEmpty<[K, V]> {}

  /**
   * A context instance for `MultiMap` implementations that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   * @typeparam UV - the upper value type bound for which th context can be used
   */
  export interface Context<UK, UV>
    extends MultiMapBase.Context<UK, UV, MultiMap.Types> {}

  /**
   * A mutable `MultiMap` builder used to efficiently create new immutable instances.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends MultiMapBase.Builder<K, V, MultiMap.Types> {}

  export interface Types extends MultiMapBase.Types {
    readonly normal: MultiMap<this['_K'], this['_V']>;
    readonly nonEmpty: MultiMap.NonEmpty<this['_K'], this['_V']>;
    readonly context: MultiMap.Context<this['_K'], this['_V']>;
    readonly builder: MultiMap.Builder<this['_K'], this['_V']>;
  }
}

export const MultiMap = {
  /**
   * Returns a new MultiMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   * @param options - an object containing the following properties:
   * * keyMapContext - the map context to use for key to valueset mappings
   * * keyMapValuesContext - the set context to use for value sets
   */
  createContext<UK, UV>(options: {
    keyMapContext: RMap.Context<UK>;
    keyMapValuesContext: RSet.Context<UV>;
  }): MultiMap.Context<UK, UV> {
    return new MultiMapContext<UK, UV, 'MultiMap', any>(
      'MultiMap',
      options.keyMapContext,
      options.keyMapValuesContext
    );
  },
};
