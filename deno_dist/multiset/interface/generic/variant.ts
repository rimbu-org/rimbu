import type { Streamable } from '../../../stream/mod.ts';
import type { VariantMultiSetBase } from '../../multiset-custom.ts';

/**
 * A type-variant immutable MultiSet of value type T.
 * In the MultiSet, each value can occur multiple times.
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
   * @typeparam T - the value type
   * @note Type-variance means that both the value type
   * can be widened in a type-safe way without casting.
   * @note As a consequence of being variant, the type does not contain methods that (can) add new elements
   * to the collection.
   */
  export interface NonEmpty<T>
    extends VariantMultiSetBase.NonEmpty<T, VariantMultiSet.Types>,
      Streamable.NonEmpty<T> {}

  export interface Types extends VariantMultiSetBase.Types {
    readonly normal: VariantMultiSet<this['_T']>;
    readonly nonEmpty: VariantMultiSet.NonEmpty<this['_T']>;
  }
}
