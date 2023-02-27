import { HashMap } from '@rimbu/hashed/map';
import type { Streamable } from '@rimbu/stream';
import {
  HashTableHashColumnCreators,
  TableBase,
  TableContext,
} from '@rimbu/table/custom';
/**
 * A type-invariant immutable Table of row key type R, column key type C, and value type V.
 * In the Table, a combination of a row and column key has exactly one value.
 * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [HashTableHashColumn API documentation](https://rimbu.org/api/rimbu/table/hash-row/HashTableHashColumn/interface)
 * @note
 * - The HashTableHashColumn uses a HashMap to map row keys to column.
 * - The HashTableHashColumn uses HashMaps to map column keys to values.
 * @typeparam R - the row key type
 * @typeparam C - the column key type
 * @typeparam V - the value type
 * @example
 * ```ts
 * const t1 = HashTableHashColumn.empty<number, string, boolean>()
 * const t2 = HashTableHashColumn.of([1, 'a', true], [2, 'a', false])
 * ```
 */
export interface HashTableHashColumn<R, C, V>
  extends TableBase<R, C, V, HashTableHashColumn.Types> {}

export namespace HashTableHashColumn {
  /**
   * A non-empty type-invariant immutable Table of row key type R, column key type C, and value type V.
   * In the Table, a combination of a row and column key has exactly one value.
   * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [HashTableHashColumn API documentation](https://rimbu.org/api/rimbu/table/hash-row/HashTableHashColumn/interface)
   * @note
   * - The HashTableHashColumn uses a HashMap to map row keys to column.
   * - The HashTableHashColumn uses HashMaps to map column keys to values.
   * @typeparam R - the row key type
   * @typeparam C - the column key type
   * @typeparam V - the value type
   * @example
   * ```ts
   * const t1 = HashTableHashColumn.empty<number, string, boolean>()
   * const t2 = HashTableHashColumn.of([1, 'a', true], [2, 'a', false])
   * ```
   */
  export interface NonEmpty<R, C, V>
    extends TableBase.NonEmpty<R, C, V, HashTableHashColumn.Types>,
      Omit<
        HashTableHashColumn<R, C, V>,
        keyof TableBase.NonEmpty<any, any, any, any>
      >,
      Streamable.NonEmpty<[R, C, V]> {}

  export interface Context<UR, UC>
    extends TableBase.Context<UR, UC, HashTableHashColumn.Types> {}

  export namespace Context {
    export interface Options<UR, UC> {
      contextId?: string;
      rowContext?: HashMap.Context<UR>;
      columnContext?: HashMap.Context<UC>;
    }
  }

  export interface Builder<R, C, V>
    extends TableBase.Builder<R, C, V, HashTableHashColumn.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends TableBase.Types {
    readonly normal: HashTableHashColumn<this['_R'], this['_C'], this['_V']>;
    readonly nonEmpty: HashTableHashColumn.NonEmpty<
      this['_R'],
      this['_C'],
      this['_V']
    >;
    readonly row: HashMap<this['_C'], this['_V']>;
    readonly rowNonEmpty: HashMap.NonEmpty<this['_C'], this['_V']>;
    readonly rowMap: HashMap<
      this['_R'],
      HashMap.NonEmpty<this['_C'], this['_V']>
    >;
    readonly rowMapNonEmpty: HashMap.NonEmpty<
      this['_R'],
      HashMap.NonEmpty<this['_C'], this['_V']>
    >;
    readonly context: HashTableHashColumn.Context<this['_R'], this['_C']>;
    readonly builder: HashTableHashColumn.Builder<
      this['_R'],
      this['_C'],
      this['_V']
    >;
    readonly rowContext: HashMap.Context<this['_R']>;
    readonly columnContext: HashMap.Context<this['_C']>;
  }
}

function createContext<UR, UC>(
  options?: HashTableHashColumn.Context.Options<UR, UC>
): HashTableHashColumn.Context<UR, UC> {
  return Object.freeze(
    new TableContext<UR, UC, 'HashTableHashColumn', any>(
      'HashTableHashColumn',
      {
        ...options,
        rowContext: options?.rowContext ?? HashMap.defaultContext(),
        columnContext: options?.columnContext ?? HashMap.defaultContext(),
      }
    )
  );
}

const _defaultContext: HashTableHashColumn.Context<any, any> = createContext({
  contextId: 'default',
});

export const HashTableHashColumn: HashTableHashColumnCreators = Object.freeze({
  ..._defaultContext,
  createContext,
  defaultContext<UR, UC>(): HashTableHashColumn.Context<UR, UC> {
    return _defaultContext;
  },
});
