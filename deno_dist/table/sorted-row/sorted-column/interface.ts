import { SortedMap } from '../../../sorted/map/index.ts';
import type { Streamable } from '../../../stream/mod.ts';
import {
  SortedTableSortedColumnCreators,
  TableBase,
  TableContext,
} from '../../../table/custom/index.ts';

/**
 * A type-invariant immutable Table of row key type R, column key type C, and value type V.
 * In the Table, a combination of a row and column key has exactly one value.
 * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [SortedTableSortedColumn API documentation](https://rimbu.org/api/rimbu/table/sorted-row/SortedTableSortedColumn/interface)
 * @note
 * - The SortedTableSortedColumn uses a SortedhMap to map row keys to column.
 * - The SortedTableSortedColumn uses SortedMaps to map column keys to values.
 * @typeparam R - the row key type
 * @typeparam C - the column key type
 * @typeparam V - the value type
 * @example
 * ```ts
 * const t1 = SortedTableSortedColumn.empty<number, string, boolean>()
 * const t2 = SortedTableSortedColumn.of([1, 'a', true], [2, 'a', false])
 * ```
 */
export interface SortedTableSortedColumn<R, C, V>
  extends TableBase<R, C, V, SortedTableSortedColumn.Types> {}

export namespace SortedTableSortedColumn {
  /**
   * A non-empty type-invariant immutable Table of row key type R, column key type C, and value type V.
   * In the Table, a combination of a row and column key has exactly one value.
   * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [SortedTableSortedColumn API documentation](https://rimbu.org/api/rimbu/table/sorted-row/SortedTableSortedColumn/interface)
   * @note
   * - The SortedTableSortedColumn uses a SortedMap to map row keys to column.
   * - The SortedTableSortedColumn uses SortedMaps to map column keys to values.
   * @typeparam R - the row key type
   * @typeparam C - the column key type
   * @typeparam V - the value type
   * @example
   * ```ts
   * const t1 = SortedTableSortedColumn.empty<number, string, boolean>()
   * const t2 = SortedTableSortedColumn.of([1, 'a', true], [2, 'a', false])
   * ```
   */
  export interface NonEmpty<R, C, V>
    extends TableBase.NonEmpty<R, C, V, SortedTableSortedColumn.Types>,
      Omit<
        SortedTableSortedColumn<R, C, V>,
        keyof TableBase.NonEmpty<any, any, any, any>
      >,
      Streamable.NonEmpty<[R, C, V]> {}

  export interface Context<UR, UC>
    extends TableBase.Context<UR, UC, SortedTableSortedColumn.Types> {
    readonly typeTag: 'SortedTableSortedColumn';
  }

  export interface Builder<R, C, V>
    extends TableBase.Builder<R, C, V, SortedTableSortedColumn.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends TableBase.Types {
    readonly normal: SortedTableSortedColumn<
      this['_R'],
      this['_C'],
      this['_V']
    >;
    readonly nonEmpty: SortedTableSortedColumn.NonEmpty<
      this['_R'],
      this['_C'],
      this['_V']
    >;
    readonly row: SortedMap<this['_C'], this['_V']>;
    readonly rowNonEmpty: SortedMap.NonEmpty<this['_C'], this['_V']>;
    readonly rowMap: SortedMap<
      this['_R'],
      SortedMap.NonEmpty<this['_C'], this['_V']>
    >;
    readonly rowMapNonEmpty: SortedMap.NonEmpty<
      this['_R'],
      SortedMap.NonEmpty<this['_C'], this['_V']>
    >;
    readonly context: SortedTableSortedColumn.Context<this['_R'], this['_C']>;
    readonly builder: SortedTableSortedColumn.Builder<
      this['_R'],
      this['_C'],
      this['_V']
    >;
    readonly rowContext: SortedMap.Context<this['_R']>;
    readonly columnContext: SortedMap.Context<this['_C']>;
  }
}

function createContext<UR, UC>(options?: {
  rowContext?: SortedMap.Context<UR>;
  columnContext?: SortedMap.Context<UC>;
}): SortedTableSortedColumn.Context<UR, UC> {
  return Object.freeze(
    new TableContext<UR, UC, 'SortedTableSortedColumn', any>(
      'SortedTableSortedColumn',
      options?.rowContext ?? SortedMap.defaultContext(),
      options?.columnContext ?? SortedMap.defaultContext()
    )
  );
}

const _defaultContext: SortedTableSortedColumn.Context<any, any> =
  createContext();

export const SortedTableSortedColumn: SortedTableSortedColumnCreators =
  Object.freeze({
    ..._defaultContext,
    createContext,
    defaultContext<UR, UC>(): SortedTableSortedColumn.Context<UR, UC> {
      return _defaultContext;
    },
  });
