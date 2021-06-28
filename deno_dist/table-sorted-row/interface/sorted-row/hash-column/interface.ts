import type { RMap } from 'https://deno.land/x/rimbu/collection-types/mod.ts';
import type { OmitStrong } from 'https://deno.land/x/rimbu/common/mod.ts';
import { HashMap } from 'https://deno.land/x/rimbu/hashed/mod.ts';
import { SortedMap } from 'https://deno.land/x/rimbu/sorted/mod.ts';
import type { Streamable } from 'https://deno.land/x/rimbu/stream/mod.ts';
import { TableCustom } from 'https://deno.land/x/rimbu/table/mod.ts';

/**
 * A type-invariant immutable Table of row key type R, column key type C, and value type V.
 * In the Table, a combination of a row and column key has exactly one value.
 * * The SortedTableHashColumn uses a SortedMap to map row keys to column.
 * * The SortedTableHashColumn uses HashMaps to map column keys to values.
 * @typeparam R - the row key type
 * @typeparam C - the column key type
 * @typeparam V - the value type
 * @example
 * const t1 = SortedTableHashColumn.empty<number, string, boolean>()
 * const t2 = SortedTableHashColumn.of([1, 'a', true], [2, 'a', false])
 */
export interface SortedTableHashColumn<R, C, V>
  extends TableCustom.TableBase<R, C, V, SortedTableHashColumn.Types> {}

export namespace SortedTableHashColumn {
  /**
   * A non-empty type-invariant immutable Table of row key type R, column key type C, and value type V.
   * In the Table, a combination of a row and column key has exactly one value.
   * * The SortedTableHashColumn uses a SortedMap to map row keys to column.
   * * The SortedTableHashColumn uses HashMaps to map column keys to values.
   * @typeparam R - the row key type
   * @typeparam C - the column key type
   * @typeparam V - the value type
   * @example
   * const t1 = SortedTableHashColumn.empty<number, string, boolean>()
   * const t2 = SortedTableHashColumn.of([1, 'a', true], [2, 'a', false])
   */
  export interface NonEmpty<R, C, V>
    extends TableCustom.TableBase.NonEmpty<
        R,
        C,
        V,
        SortedTableHashColumn.Types
      >,
      Streamable.NonEmpty<[R, C, V]> {}

  export interface Context<UR, UC>
    extends TableCustom.TableBase.Context<UR, UC, SortedTableHashColumn.Types> {
    readonly typeTag: 'SortedTableHashColumn';
  }

  export interface Builder<R, C, V>
    extends TableCustom.TableBase.Builder<
      R,
      C,
      V,
      SortedTableHashColumn.Types
    > {}

  export interface Types extends TableCustom.TableBase.Types {
    normal: SortedTableHashColumn<this['_R'], this['_C'], this['_V']>;
    nonEmpty: SortedTableHashColumn.NonEmpty<
      this['_R'],
      this['_C'],
      this['_V']
    >;
    row: HashMap<this['_C'], this['_V']>;
    rowNonEmpty: HashMap.NonEmpty<this['_C'], this['_V']>;
    rowMap: SortedMap<this['_R'], HashMap.NonEmpty<this['_C'], this['_V']>> &
      SortedMap<this['_R'], RMap.NonEmpty<this['_C'], this['_V']>>;
    rowMapNonEmpty: SortedMap.NonEmpty<
      this['_R'],
      HashMap.NonEmpty<this['_C'], this['_V']>
    > &
      SortedMap.NonEmpty<this['_R'], RMap.NonEmpty<this['_C'], this['_V']>>;
    context: SortedTableHashColumn.Context<this['_R'], this['_C']>;
    builder: SortedTableHashColumn.Builder<this['_R'], this['_C'], this['_V']>;
    rowContext: SortedMap.Context<this['_R']>;
    columnContext: HashMap.Context<this['_C']>;
  }
}

interface TypesImpl extends SortedTableHashColumn.Types {
  context: TableCustom.TableContext<
    this['_R'],
    this['_C'],
    'SortedTableHashColumn',
    any
  >;
}

function createContext<UR, UC>(options?: {
  rowContext?: SortedMap.Context<UR>;
  columnContext?: HashMap.Context<UC>;
}): SortedTableHashColumn.Context<UR, UC> {
  return new TableCustom.TableContext<
    UR,
    UC,
    'SortedTableHashColumn',
    TypesImpl
  >(
    'SortedTableHashColumn',
    options?.rowContext ?? SortedMap.defaultContext(),
    options?.columnContext ?? HashMap.defaultContext()
  );
}

const _defaultContext: SortedTableHashColumn.Context<any, any> =
  createContext();

const _contextHelpers = {
  /**
   * Returns a new SortedTableHashColumn context instance based on the given `options`.
   * @typeparam UR - the upper row key type for which the context can create instances
   * @typeparam UC - the upper column key type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * rowContext - (optional) the map context to use to map row keys to columns
   * * columnContext - (optional) the map context to use to map column keys to values
   */
  createContext,
  /**
   * Returns the default context for SortedTableHashColumns.
   * @typeparam UR - the upper row key type for which the context can create instances
   * @typeparam UC - the upper column key type for which the context can create instances
   */
  defaultContext<UR, UC>(): SortedTableHashColumn.Context<UR, UC> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  SortedTableHashColumn.Context<any, any>,
  '_types' | 'columnContext' | 'rowContext' | 'typeTag'
> &
  typeof _contextHelpers;

export const SortedTableHashColumn: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
