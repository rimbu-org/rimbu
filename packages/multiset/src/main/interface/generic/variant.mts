import type { Streamable } from '@rimbu/stream';

import type { VariantMultiSetBase } from '@rimbu/multiset/custom';

/**
 * A type-variant immutable MultiSet of value type T.
 * In the MultiSet, each value can occur multiple times.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [VariantMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/VariantMultiSet/interface)
 * @typeparam T - the value type
 * @note Type-variance means that both the value type
 * can be widened in a type-safe way without casting.
 * @note As a consequence of being variant, the type does not contain methods that (can) add new elements
 * to the collection.
 */
export interface VariantMultiSet<T>
  extends VariantMultiSetBase<T, VariantMultiSet.Types> {}

export namespace VariantMultiSet {
  /**
   * A non-empty type-variant immutable MultiSet of value type T.
   * In the MultiSet, each value can occur multiple times.
   * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [VariantMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/VariantMultiSet/interface)
   * @typeparam T - the value type
   * @note Type-variance means that both the value type
   * can be widened in a type-safe way without casting.
   * @note As a consequence of being variant, the type does not contain methods that (can) add new elements
   * to the collection.
   */
  export interface NonEmpty<T>
    extends VariantMultiSetBase.NonEmpty<T, VariantMultiSet.Types>,
      Omit<VariantMultiSet<T>, keyof VariantMultiSetBase<any, any>>,
      Streamable.NonEmpty<T> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends VariantMultiSetBase.Types {
    readonly normal: VariantMultiSet<this['_T']>;
    readonly nonEmpty: VariantMultiSet.NonEmpty<this['_T']>;
  }
}
