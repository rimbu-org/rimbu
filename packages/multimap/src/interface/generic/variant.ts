import type { Streamable } from '@rimbu/stream';
import type { VariantMultiMapBase } from '../../multimap-custom';

/**
 * A type-variant immutable MultiMap of key type K, and value type V.
 * In the Map, each key has at least one value.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @note Type-variance means that both the key and value types
 * can be widened in a type-safe way without casting.
 * @note As a consequence of being variant, the type does not contain methods that (can) add new elements
 * to the collection.
 */
export interface VariantMultiMap<K, V>
  extends VariantMultiMapBase<K, V, VariantMultiMap.Types> {}

export namespace VariantMultiMap {
  /**
   * A non-empty type-variant immutable MultiMap of key type K, and value type V.
   * In the Map, each key has at least one value.
   * @typeparam K - the key type
   * @typeparam V - the value type
   * @note Type-variance means that both the key and value types
   * can be widened in a type-safe way without casting.
   * @note As a consequence of being variant, the type does not contain methods that (can) add new elements
   * to the collection.
   */
  export interface NonEmpty<K, V>
    extends VariantMultiMapBase.NonEmpty<K, V, VariantMultiMap.Types>,
      Streamable.NonEmpty<[K, V]> {}

  export interface Types extends VariantMultiMapBase.Types {
    readonly normal: VariantMultiMap<this['_K'], this['_V']>;
    readonly nonEmpty: VariantMultiMap.NonEmpty<this['_K'], this['_V']>;
  }
}
