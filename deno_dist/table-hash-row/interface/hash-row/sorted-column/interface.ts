import type { RMap } from '../../../../collection-types/mod.ts';
import type { OmitStrong } from '../../../../common/mod.ts';
import { HashMap } from '../../../../hashed/mod.ts';
import { SortedMap } from '../../../../sorted/mod.ts';
import type { Streamable } from '../../../../stream/mod.ts';
import { TableCustom } from '../../../../table/mod.ts';

/**
 * A type-invariant immutable Table of row key type R, column key type C, and value type V.
 * In the Table, a combination of a row and column key has exactly one value.
 * * The HashTableSortedColumn uses a HashMap to map row keys to column.
 * * The HashTableSortedColumn uses SortedMaps to map column keys to values.
 * @typeparam R - the row key type
 * @typeparam C - the column key type
 * @typeparam V - the value type
 * @example
 * const t1 = HashTableSortedColumn.empty<number, string, boolean>()
 * const t2 = HashTableSortedColumn.of([1, 'a', true], [2, 'a', false])
 */
export interface HashTableSortedColumn<R, C, V>
  extends TableCustom.TableBase<R, C, V, HashTableSortedColumn.Types> {}

export namespace HashTableSortedColumn {
  /**
   * A non-empty type-invariant immutable Table of row key type R, column key type C, and value type V.
   * In the Table, a combination of a row and column key has exactly one value.
   * * The HashTableSortedColumn uses a HashMap to map row keys to column.
   * * The HashTableSortedColumn uses SortedMaps to map column keys to values.
   * @typeparam R - the row key type
   * @typeparam C - the column key type
   * @typeparam V - the value type
   * @example
   * const t1 = HashTableSortedColumn.empty<number, string, boolean>()
   * const t2 = HashTableSortedColumn.of([1, 'a', true], [2, 'a', false])
   */
  export interface NonEmpty<R, C, V>
    extends TableCustom.TableBase.NonEmpty<
        R,
        C,
        V,
        HashTableSortedColumn.Types
      >,
      Streamable.NonEmpty<[R, C, V]> {}

  export interface Context<UR, UC>
    extends TableCustom.TableBase.Context<UR, UC, HashTableSortedColumn.Types> {
    readonly typeTag: 'HashTableSortedColumn';
  }

  export interface Builder<R, C, V>
    extends TableCustom.TableBase.Builder<
      R,
      C,
      V,
      HashTableSortedColumn.Types
    > {}

  export interface Types extends TableCustom.TableBase.Types {
    normal: HashTableSortedColumn<this['_R'], this['_C'], this['_V']>;
    nonEmpty: HashTableSortedColumn.NonEmpty<
      this['_R'],
      this['_C'],
      this['_V']
    >;
    row: SortedMap<this['_C'], this['_V']>;
    rowNonEmpty: SortedMap.NonEmpty<this['_C'], this['_V']>;
    rowMap: HashMap<this['_R'], SortedMap.NonEmpty<this['_C'], this['_V']>> &
      HashMap<this['_R'], RMap.NonEmpty<this['_C'], this['_V']>>;
    rowMapNonEmpty: HashMap.NonEmpty<
      this['_R'],
      SortedMap.NonEmpty<this['_C'], this['_V']>
    > &
      HashMap.NonEmpty<this['_R'], RMap.NonEmpty<this['_C'], this['_V']>>;
    context: HashTableSortedColumn.Context<this['_R'], this['_C']>;
    builder: HashTableSortedColumn.Builder<this['_R'], this['_C'], this['_V']>;
    rowContext: HashMap.Context<this['_R']>;
    columnContext: SortedMap.Context<this['_C']>;
  }
}

interface TypesImpl extends HashTableSortedColumn.Types {
  context: TableCustom.TableContext<
    this['_R'],
    this['_C'],
    'HashTableSortedColumn',
    any
  >;
}

function createContext<UR, UC>(options?: {
  rowContext?: HashMap.Context<UR>;
  columnContext?: SortedMap.Context<UC>;
}): HashTableSortedColumn.Context<UR, UC> {
  return new TableCustom.TableContext<
    UR,
    UC,
    'HashTableSortedColumn',
    TypesImpl
  >(
    'HashTableSortedColumn',
    options?.rowContext ?? HashMap.defaultContext(),
    options?.columnContext ?? SortedMap.defaultContext()
  );
}

const _defaultContext: HashTableSortedColumn.Context<any, any> =
  createContext();

const _contextHelpers = {
  /**
   * Returns a new HashTableSortedColumn context instance based on the given `options`.
   * @typeparam UR - the upper row key type for which the context can create instances
   * @typeparam UC - the upper column key type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * rowContext - (optional) the map context to use to map row keys to columns
   * * columnContext - (optional) the map context to use to map column keys to values
   */
  createContext,
  /**
   * Returns the default context for HashTableSortedColumns.
   * @typeparam UR - the upper row key type for which the context can create instances
   * @typeparam UC - the upper column key type for which the context can create instances
   */
  defaultContext<UR, UC>(): HashTableSortedColumn.Context<UR, UC> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  HashTableSortedColumn.Context<any, any>,
  '_types' | 'columnContext' | 'rowContext' | 'typeTag'
> &
  typeof _contextHelpers;

export const HashTableSortedColumn: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
