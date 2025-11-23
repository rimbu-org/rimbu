import type { RMap, RSet } from '../../../../collection-types/mod.ts';
import type { Streamable } from '../../../../stream/mod.ts';

import {
  type MultiMapBase,
  MultiMapContext,
  type MultiMapCreators,
} from '../../../../multimap/custom/index.ts';

/**
 * A type-invariant immutable MultiMap of key type K, and value type V.
 * In the Map, each key has at least one value.
 * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [MultiMap API documentation](https://rimbu.org/api/rimbu/multimap/MultiMap/interface)
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export interface MultiMap<K, V> extends MultiMapBase<K, V, MultiMap.Types> {}

export namespace MultiMap {
  /**
   * A non-empty type-invariant immutable MultiMap of key type K, and value type V.
   * In the Map, each key has at least one value.
   * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [MultiMap API documentation](https://rimbu.org/api/rimbu/multimap/MultiMap/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface NonEmpty<K, V>
    extends MultiMapBase.NonEmpty<K, V, MultiMap.Types>,
      Omit<MultiMap<K, V>, keyof MultiMapBase.NonEmpty<any, any, any>>,
      Streamable.NonEmpty<[K, V]> {}

  /**
   * A context instance for `MultiMap` implementations that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   * @typeparam UV - the upper value type bound for which the context can be used
   */
  export interface Context<UK, UV>
    extends MultiMapBase.Context<UK, UV, MultiMap.Types> {}

  /**
   * A mutable `MultiMap` builder used to efficiently create new immutable instances.
   * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [MultiMap.Builder API documentation](https://rimbu.org/api/rimbu/multimap/MultiMap/Builder/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends MultiMapBase.Builder<K, V, MultiMap.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends MultiMapBase.Types {
    readonly normal: MultiMap<this['_K'], this['_V']>;
    readonly nonEmpty: MultiMap.NonEmpty<this['_K'], this['_V']>;
    readonly context: MultiMap.Context<this['_K'], this['_V']>;
    readonly builder: MultiMap.Builder<this['_K'], this['_V']>;
  }
}

/**
 * The default `MultiMap` creators and context.
 *
 * Use this exported value to create and work with immutable `MultiMap` instances.
 * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [MultiMap API documentation](https://rimbu.org/api/rimbu/multimap/MultiMap/interface).
 */
export const MultiMap: MultiMapCreators = Object.freeze({
  createContext<UK, UV>(options: {
    keyMapContext: RMap.Context<UK>;
    keyMapValuesContext: RSet.Context<UV>;
  }): MultiMap.Context<UK, UV> {
    return Object.freeze(
      new MultiMapContext<UK, UV, 'MultiMap', any>(
        'MultiMap',
        options.keyMapContext,
        options.keyMapValuesContext
      )
    );
  },
});
