import type { OmitStrong } from '../../../../common/mod.ts';
import { SortedMap } from '../../../../sorted/mod.ts';
import type { Streamable } from '../../../../stream/mod.ts';
import { TableCustom } from '../../../../table/mod.ts';

/**
 * A type-invariant immutable Table of row key type R, column key type C, and value type V.
 * In the Table, a combination of a row and column key has exactly one value.
 * * The SortedTableSortedColumn uses a SortedhMap to map row keys to column.
 * * The SortedTableSortedColumn uses SortedMaps to map column keys to values.
 * @typeparam R - the row key type
 * @typeparam C - the column key type
 * @typeparam V - the value type
 * @example
 * const t1 = SortedTableSortedColumn.empty<number, string, boolean>()
 * const t2 = SortedTableSortedColumn.of([1, 'a', true], [2, 'a', false])
 */
export interface SortedTableSortedColumn<R, C, V>
  extends TableCustom.TableBase<R, C, V, SortedTableSortedColumn.Types> {}

export namespace SortedTableSortedColumn {
  /**
   * A non-empty type-invariant immutable Table of row key type R, column key type C, and value type V.
   * In the Table, a combination of a row and column key has exactly one value.
   * * The SortedTableSortedColumn uses a SortedMap to map row keys to column.
   * * The SortedTableSortedColumn uses SortedMaps to map column keys to values.
   * @typeparam R - the row key type
   * @typeparam C - the column key type
   * @typeparam V - the value type
   * @example
   * const t1 = SortedTableSortedColumn.empty<number, string, boolean>()
   * const t2 = SortedTableSortedColumn.of([1, 'a', true], [2, 'a', false])
   */
  export interface NonEmpty<R, C, V>
    extends TableCustom.TableBase.NonEmpty<
        R,
        C,
        V,
        SortedTableSortedColumn.Types
      >,
      Streamable.NonEmpty<[R, C, V]> {}

  export interface Context<UR, UC>
    extends TableCustom.TableBase.Context<
      UR,
      UC,
      SortedTableSortedColumn.Types
    > {
    readonly typeTag: 'SortedTableSortedColumn';
  }

  export interface Builder<R, C, V>
    extends TableCustom.TableBase.Builder<
      R,
      C,
      V,
      SortedTableSortedColumn.Types
    > {}

  export interface Types extends TableCustom.TableBase.Types {
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
  return new TableCustom.TableContext<UR, UC, 'SortedTableSortedColumn', any>(
    'SortedTableSortedColumn',
    options?.rowContext ?? SortedMap.defaultContext(),
    options?.columnContext ?? SortedMap.defaultContext()
  );
}

const _defaultContext: SortedTableSortedColumn.Context<any, any> =
  createContext();

const _contextHelpers = {
  /**
   * Returns a new HashTableHashColumn context instance based on the given `options`.
   * @typeparam UR - the upper row key type for which the context can create instances
   * @typeparam UC - the upper column key type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * rowContext - (optional) the map context to use to map row keys to columns
   * * columnContext - (optional) the map context to use to map column keys to values
   */
  createContext,
  /**
   * Returns the default context for HashTableHashColumns.
   * @typeparam UR - the upper row key type for which the context can create instances
   * @typeparam UC - the upper column key type for which the context can create instances
   */
  defaultContext<UR, UC>(): SortedTableSortedColumn.Context<UR, UC> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  SortedTableSortedColumn.Context<any, any>,
  '_types' | 'columnContext' | 'rowContext' | 'typeTag'
> &
  typeof _contextHelpers;

export const SortedTableSortedColumn: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
