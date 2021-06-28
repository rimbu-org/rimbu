import type { Streamable } from 'https://deno.land/x/rimbu/stream/mod.ts';
import type { VariantTableBase } from '../../table-custom.ts';

/**
 * A type-variant immutable Table of row key type R, column key type C, and value type V.
 * In the Table, a combination of a row and column key has exactly one value.
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

  export interface Types extends VariantTableBase.Types {
    normal: VariantTable<this['_R'], this['_C'], this['_V']>;
    nonEmpty: VariantTable.NonEmpty<this['_R'], this['_C'], this['_V']>;
  }
}
