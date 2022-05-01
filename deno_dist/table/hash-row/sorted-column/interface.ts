import { HashMap } from '../../../hashed/map/index.ts';
import { SortedMap } from '../../../sorted/map/index.ts';
import type { Streamable } from '../../../stream/mod.ts';
import {
  HashTableSortedColumnCreators,
  TableBase,
  TableContext,
} from '../../../table/custom/index.ts';

/**
 * A type-invariant immutable Table of row key type R, column key type C, and value type V.
 * In the Table, a combination of a row and column key has exactly one value.
 * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [HashTableSortedColumn API documentation](https://rimbu.org/api/rimbu/table/hash-row/HashTableSortedColumn/interface)
 * @note
 * - The HashTableSortedColumn uses a HashMap to map row keys to column.
 * - The HashTableSortedColumn uses SortedMaps to map column keys to values.
 * @typeparam R - the row key type
 * @typeparam C - the column key type
 * @typeparam V - the value type
 * @example
 * ```ts
 * const t1 = HashTableSortedColumn.empty<number, string, boolean>()
 * const t2 = HashTableSortedColumn.of([1, 'a', true], [2, 'a', false])
 * ```
 */
export interface HashTableSortedColumn<R, C, V>
  extends TableBase<R, C, V, HashTableSortedColumn.Types> {}

export namespace HashTableSortedColumn {
  /**
   * A non-empty type-invariant immutable Table of row key type R, column key type C, and value type V.
   * In the Table, a combination of a row and column key has exactly one value.
   * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [HashTableSortedColumn API documentation](https://rimbu.org/api/rimbu/table/hash-row/HashTableSortedColumn/interface)
   * @note
   * - The HashTableSortedColumn uses a HashMap to map row keys to column.
   * - The HashTableSortedColumn uses SortedMaps to map column keys to values.
   * @typeparam R - the row key type
   * @typeparam C - the column key type
   * @typeparam V - the value type
   * @example
   * ```ts
   * const t1 = HashTableSortedColumn.empty<number, string, boolean>()
   * const t2 = HashTableSortedColumn.of([1, 'a', true], [2, 'a', false])
   * ```
   */
  export interface NonEmpty<R, C, V>
    extends TableBase.NonEmpty<R, C, V, HashTableSortedColumn.Types>,
      Omit<
        HashTableSortedColumn<R, C, V>,
        keyof TableBase.NonEmpty<any, any, any, any>
      >,
      Streamable.NonEmpty<[R, C, V]> {}

  export interface Context<UR, UC>
    extends TableBase.Context<UR, UC, HashTableSortedColumn.Types> {
    readonly typeTag: 'HashTableSortedColumn';
  }

  export interface Builder<R, C, V>
    extends TableBase.Builder<R, C, V, HashTableSortedColumn.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends TableBase.Types {
    readonly normal: HashTableSortedColumn<this['_R'], this['_C'], this['_V']>;
    readonly nonEmpty: HashTableSortedColumn.NonEmpty<
      this['_R'],
      this['_C'],
      this['_V']
    >;
    readonly row: SortedMap<this['_C'], this['_V']>;
    readonly rowNonEmpty: SortedMap.NonEmpty<this['_C'], this['_V']>;
    readonly rowMap: HashMap<
      this['_R'],
      SortedMap.NonEmpty<this['_C'], this['_V']>
    >;
    readonly rowMapNonEmpty: HashMap.NonEmpty<
      this['_R'],
      SortedMap.NonEmpty<this['_C'], this['_V']>
    >;
    readonly context: HashTableSortedColumn.Context<this['_R'], this['_C']>;
    readonly builder: HashTableSortedColumn.Builder<
      this['_R'],
      this['_C'],
      this['_V']
    >;
    readonly rowContext: HashMap.Context<this['_R']>;
    readonly columnContext: SortedMap.Context<this['_C']>;
  }
}

function createContext<UR, UC>(options?: {
  rowContext?: HashMap.Context<UR>;
  columnContext?: SortedMap.Context<UC>;
}): HashTableSortedColumn.Context<UR, UC> {
  return new TableContext<UR, UC, 'HashTableSortedColumn', any>(
    'HashTableSortedColumn',
    options?.rowContext ?? HashMap.defaultContext(),
    options?.columnContext ?? SortedMap.defaultContext()
  );
}

const _defaultContext: HashTableSortedColumn.Context<any, any> =
  createContext();

export const HashTableSortedColumn: HashTableSortedColumnCreators = {
  ..._defaultContext,
  createContext,
  defaultContext<UR, UC>(): HashTableSortedColumn.Context<UR, UC> {
    return _defaultContext;
  },
};
