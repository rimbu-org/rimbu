import type { RMapBase } from '@rimbu/collection-types/map-custom';
import type { Streamable } from '@rimbu/stream';

/**
 * A type-invariant immutable Map of key type K, and value type V.
 * In the Map, each key has exactly one value, and the Map cannot contain
 * duplicate keys.
 * See the [Map documentation](https://rimbu.org/docs/collections/map) and the [RMap API documentation](https://rimbu.org/api/rimbu/collection-types/map/RMap/interface)
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export interface RMap<K, V> extends RMapBase<K, V, RMap.Types> {}

export namespace RMap {
  /**
   * A non-empty type-invariant immutable Map of key type K, and value type V.
   * In the Map, each key has exactly one value, and the Map cannot contain
   * duplicate keys.
   * See the [Map documentation](https://rimbu.org/docs/collections/map) and the [RMap API documentation](https://rimbu.org/api/rimbu/collection-types/map/RMap/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface NonEmpty<K, V>
    extends RMapBase.NonEmpty<K, V, RMap.Types>,
      Omit<RMap<K, V>, keyof RMapBase<any, any, any>>,
      Streamable.NonEmpty<readonly [K, V]> {}

  /**
   * A context instance for `RMap` implementations that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   */
  export interface Context<UK> extends RMapBase.Context<UK, RMap.Types> {}

  /**
   * A mutable `RMap` builder used to efficiently create new immutable instances.
   * See the [Map documentation](https://rimbu.org/docs/collections/map) and the [RMap.Builder API documentation](https://rimbu.org/api/rimbu/collection-types/map/RMap/Builder/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V> extends RMapBase.Builder<K, V, RMap.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends RMapBase.Types {
    readonly normal: RMap<this['_K'], this['_V']>;
    readonly nonEmpty: RMap.NonEmpty<this['_K'], this['_V']>;
    readonly context: RMap.Context<this['_K']>;
    readonly builder: RMap.Builder<this['_K'], this['_V']>;
  }
}
