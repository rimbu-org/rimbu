import type { Streamable } from '../../stream/mod.ts';
import type { RMapBase } from '../custom-base.ts';

/**
 * A type-invariant immutable Map of key type K, and value type V.
 * In the Map, each key has exactly one value, and the Map cannot contain
 * duplicate keys.
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export interface RMap<K, V> extends RMapBase<K, V, RMap.Types> {}

export namespace RMap {
  /**
   * A non-empty type-invariant immutable Map of key type K, and value type V.
   * In the Map, each key has exactly one value, and the Map cannot contain
   * duplicate keys.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface NonEmpty<K, V>
    extends RMapBase.NonEmpty<K, V, RMap.Types>,
      Streamable.NonEmpty<readonly [K, V]> {}

  /**
   * A context instance for `RMap` implementations that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   */
  export interface Context<UK> extends RMapBase.Context<UK, RMap.Types> {}

  /**
   * A mutable `RMap` builder used to efficiently create new immutable instances.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V> extends RMapBase.Builder<K, V, RMap.Types> {}

  export interface Types extends RMapBase.Types {
    normal: RMap<this['_K'], this['_V']>;
    nonEmpty: RMap.NonEmpty<this['_K'], this['_V']>;
    context: RMap.Context<this['_K']>;
    builder: RMap.Builder<this['_K'], this['_V']>;
  }
}
