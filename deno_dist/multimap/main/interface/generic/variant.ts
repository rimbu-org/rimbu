import type { VariantMultiMapBase } from '../../../../multimap/custom/index.ts';
import type { Streamable } from '../../../../stream/mod.ts';

/**
 * A type-variant immutable MultiMap of key type K, and value type V.
 * In the Map, each key has at least one value.
 * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [VariantMultiMap API documentation](https://rimbu.org/api/rimbu/multimap/VariantMultiMap/interface)
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
   * See the [MultiMap documentation](https://rimbu.org/docs/collections/multimap) and the [VariantMultiMap API documentation](https://rimbu.org/api/rimbu/multimap/VariantMultiMap/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   * @note Type-variance means that both the key and value types
   * can be widened in a type-safe way without casting.
   * @note As a consequence of being variant, the type does not contain methods that (can) add new elements
   * to the collection.
   */
  export interface NonEmpty<K, V>
    extends VariantMultiMapBase.NonEmpty<K, V, VariantMultiMap.Types>,
      Omit<
        VariantMultiMap<K, V>,
        keyof VariantMultiMapBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<[K, V]> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends VariantMultiMapBase.Types {
    readonly normal: VariantMultiMap<this['_K'], this['_V']>;
    readonly nonEmpty: VariantMultiMap.NonEmpty<this['_K'], this['_V']>;
  }
}
