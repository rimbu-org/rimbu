import type { MultiMap } from '@rimbu/multimap';
import type { Streamable } from '@rimbu/stream';
import {
  BiMultiMapBase,
  BiMultiMapContext,
  BiMultiMapGeneric,
} from '@rimbu/bimultimap/custom';

/**
 * A type-invariant immutable bi-directional MultiMap where keys and values have a
 * many-to-many mapping.
 * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [BiMultiMap API documentation](https://rimbu.org/api/rimbu/bimultimap/BiMultiMap/interface)
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export interface BiMultiMap<K, V>
  extends BiMultiMapBase<K, V, BiMultiMap.Types> {}

export namespace BiMultiMap {
  /**
   * A non-empty type-invariant immutable bi-directional MultiMap where keys and values have a
   * many-to-many mapping.
   * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [BiMultiMap API documentation](https://rimbu.org/api/rimbu/bimultimap/BiMultiMap/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface NonEmpty<K, V>
    extends BiMultiMapBase.NonEmpty<K, V, BiMultiMap.Types>,
      Omit<BiMultiMap<K, V>, keyof BiMultiMapBase.NonEmpty<any, any, any>>,
      Streamable.NonEmpty<[K, V]> {}

  /**
   * The BiMultiMap's Context instance that serves as a factory for all related immutable instances and builders.
   */
  export interface Context<UK, UV>
    extends BiMultiMapBase.Context<UK, UV, BiMultiMap.Types> {}

  /**
   * A mutable `BiMultiMap` builder used to efficiently create new immutable instances.
   * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [BiMultiMap.Builder API documentation](https://rimbu.org/api/rimbu/bimultimap/BiMultiMap/Builder/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends BiMultiMapBase.Builder<K, V, BiMultiMap.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends BiMultiMapBase.Types {
    readonly context: BiMultiMap.Context<this['_K'], this['_V']>;
    readonly normal: BiMultiMap<this['_K'], this['_V']>;
    readonly nonEmpty: BiMultiMap.NonEmpty<this['_K'], this['_V']>;
    readonly builder: BiMultiMap.Builder<this['_K'], this['_V']>;
  }
}

export const BiMultiMap: BiMultiMapGeneric.Creators = {
  createContext<UK, UV>(options: {
    keyValueMultiMapContext: MultiMap.Context<UK, UV>;
    valueKeyMultiMapContext: MultiMap.Context<UV, UK>;
  }): BiMultiMap.Context<UK, UV> {
    return new BiMultiMapContext<UK, UV, 'BiMultiMap', any>(
      'BiMultiMap',
      options.keyValueMultiMapContext,
      options.valueKeyMultiMapContext
    );
  },
};
