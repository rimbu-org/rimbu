import type { RMap } from 'https://deno.land/x/rimbu/collection-types/mod.ts';
import type { OmitStrong } from 'https://deno.land/x/rimbu/common/mod.ts';
import { HashMap } from 'https://deno.land/x/rimbu/hashed/mod.ts';
import type { Streamable } from 'https://deno.land/x/rimbu/stream/mod.ts';
import { TableCustom } from 'https://deno.land/x/rimbu/table/mod.ts';

/**
 * A type-invariant immutable Table of row key type R, column key type C, and value type V.
 * In the Table, a combination of a row and column key has exactly one value.
 * * The HashTableHashColumn uses a HashMap to map row keys to column.
 * * The HashTableHashColumn uses HashMaps to map column keys to values.
 * @typeparam R - the row key type
 * @typeparam C - the column key type
 * @typeparam V - the value type
 * @example
 * const t1 = HashTableHashColumn.empty<number, string, boolean>()
 * const t2 = HashTableHashColumn.of([1, 'a', true], [2, 'a', false])
 */
export interface HashTableHashColumn<R, C, V>
  extends TableCustom.TableBase<R, C, V, HashTableHashColumn.Types> {}

export namespace HashTableHashColumn {
  /**
   * A non-empty type-invariant immutable Table of row key type R, column key type C, and value type V.
   * In the Table, a combination of a row and column key has exactly one value.
   * * The HashTableHashColumn uses a HashMap to map row keys to column.
   * * The HashTableHashColumn uses HashMaps to map column keys to values.
   * @typeparam R - the row key type
   * @typeparam C - the column key type
   * @typeparam V - the value type
   * @example
   * const t1 = HashTableHashColumn.empty<number, string, boolean>()
   * const t2 = HashTableHashColumn.of([1, 'a', true], [2, 'a', false])
   */
  export interface NonEmpty<R, C, V>
    extends TableCustom.TableBase.NonEmpty<R, C, V, HashTableHashColumn.Types>,
      Streamable.NonEmpty<[R, C, V]> {}

  export interface Context<UR, UC>
    extends TableCustom.TableBase.Context<UR, UC, HashTableHashColumn.Types> {}

  export interface Builder<R, C, V>
    extends TableCustom.TableBase.Builder<R, C, V, HashTableHashColumn.Types> {}

  export interface Types extends TableCustom.TableBase.Types {
    normal: HashTableHashColumn<this['_R'], this['_C'], this['_V']>;
    nonEmpty: HashTableHashColumn.NonEmpty<this['_R'], this['_C'], this['_V']>;
    row: HashMap<this['_C'], this['_V']>;
    rowNonEmpty: HashMap.NonEmpty<this['_C'], this['_V']>;
    rowMap: HashMap<this['_R'], HashMap.NonEmpty<this['_C'], this['_V']>> &
      HashMap<this['_R'], RMap.NonEmpty<this['_C'], this['_V']>>;
    rowMapNonEmpty: HashMap.NonEmpty<
      this['_R'],
      HashMap.NonEmpty<this['_C'], this['_V']>
    > &
      HashMap.NonEmpty<this['_R'], RMap.NonEmpty<this['_C'], this['_V']>>;
    context: HashTableHashColumn.Context<this['_R'], this['_C']>;
    builder: HashTableHashColumn.Builder<this['_R'], this['_C'], this['_V']>;
    rowContext: HashMap.Context<this['_R']>;
    columnContext: HashMap.Context<this['_C']>;
  }
}

interface TypesImpl extends HashTableHashColumn.Types {
  context: TableCustom.TableContext<
    this['_R'],
    this['_C'],
    'HashTableHashColumn',
    any
  >;
}

function createContext<UR, UC>(options?: {
  rowContext?: HashMap.Context<UR>;
  columnContext?: HashMap.Context<UC>;
}): HashTableHashColumn.Context<UR, UC> {
  return new TableCustom.TableContext<UR, UC, 'HashTableHashColumn', TypesImpl>(
    'HashTableHashColumn',
    options?.rowContext ?? HashMap.defaultContext(),
    options?.columnContext ?? HashMap.defaultContext()
  );
}

const _defaultContext: HashTableHashColumn.Context<any, any> = createContext();

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
  defaultContext<UR, UC>(): HashTableHashColumn.Context<UR, UC> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  HashTableHashColumn.Context<any, any>,
  '_types' | 'columnContext' | 'rowContext' | 'typeTag'
> &
  typeof _contextHelpers;

export const HashTableHashColumn: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
