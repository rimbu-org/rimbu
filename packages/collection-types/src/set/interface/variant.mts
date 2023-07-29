import type { VariantSetBase } from '@rimbu/collection-types/set-custom';

/**
 * A type-variant immutable Set of value type T.
 * In the Set, there are no duplicate values.
 * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [VariantSet API documentation](https://rimbu.org/api/rimbu/collection-types/set/VariantSet/interface)
 * @typeparam T - the value type
 * @note Type-variance means that both the value type
 * can be widened in a type-safe way without casting.
 * @note As a consequence of being variant, the type does not contain methods that (can) add new elements
 * to the collection.
 */
export interface VariantSet<T> extends VariantSetBase<T, VariantSet.Types> {}

export namespace VariantSet {
  /**
   * A non-empty type-variant immutable Set of value type T.
   * In the Set, there are no duplicate values.
   * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [VariantSet API documentation](https://rimbu.org/api/rimbu/collection-types/set/VariantSet/interface)
   * @typeparam T - the value type
   * @note Type-variance means that both the value type
   * can be widened in a type-safe way without casting.
   * @note As a consequence of being variant, the type does not contain methods that (can) add new elements
   * to the collection.
   */
  export interface NonEmpty<T>
    extends VariantSetBase.NonEmpty<T, VariantSet.Types>,
      Omit<VariantSet<T>, keyof VariantSetBase.NonEmpty<any, any>> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends VariantSetBase.Types {
    readonly normal: VariantSet<this['_T']>;
    readonly nonEmpty: VariantSet.NonEmpty<this['_T']>;
  }
}
