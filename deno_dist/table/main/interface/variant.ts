import type { Streamable } from '../../../stream/mod.ts';
import type { VariantTableBase } from '../../../table/custom/index.ts';

/**
 * A type-variant immutable Table of row key type R, column key type C, and value type V.
 * In the Table, a combination of a row and column key has exactly one value.
 * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [VariantTable API documentation](https://rimbu.org/api/rimbu/table/VariantTable/interface)
 * @typeparam R - the row key type
 * @typeparam C - the column key type
 * @typeparam V - the value type
 * @note Type-variance means that both the key and value types
 * can be widened in a type-safe way without casting.
 * @note As a consequence of being variant, the type does not contain methods that (can) add new elements
 * to the collection.
 */
export interface VariantTable<R, C, V>
  extends VariantTableBase<R, C, V, VariantTable.Types> {}

export namespace VariantTable {
  /**
   * A non-empty type-variant immutable Table of row key type R, column key type C, and value type V.
   * In the Table, a combination of a row and column key has exactly one value.
   * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [VariantTable API documentation](https://rimbu.org/api/rimbu/table/VariantTable/interface)
   * @typeparam R - the row key type
   * @typeparam C - the column key type
   * @typeparam V - the value type
   * @note Type-variance means that both the key and value types
   * can be widened in a type-safe way without casting.
   * @note As a consequence of being variant, the type does not contain methods that (can) add new elements
   * to the collection.
   */
  export interface NonEmpty<R, C, V>
    extends VariantTableBase.NonEmpty<R, C, V, VariantTable.Types>,
      Streamable.NonEmpty<[R, C, V]> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends VariantTableBase.Types {
    readonly normal: VariantTable<this['_R'], this['_C'], this['_V']>;
    readonly nonEmpty: VariantTable.NonEmpty<
      this['_R'],
      this['_C'],
      this['_V']
    >;
  }
}
