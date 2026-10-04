import type { Table } from '@rimbu/table';

import { HashMap } from '@rimbu/hashed/map';
import { SortedMap } from '@rimbu/sorted/map';

import { TableCollectionContext } from '#table/context-factory';

/**
 * A `Table` whose rows are backed by a `HashMap` and whose columns are backed by
 * a `SortedMap`.
 *
 * This is a {@link Table.Context}, **not** a distinct collection type: the
 * collection type is `Table<R, C, V>` whichever backing is chosen. Row order is
 * unspecified; column order within each row is the comparator's order, so
 * `getRow(row)` returns columns in sorted order. Use
 * `Table.createContext({ rowContext, columnContext })` for any other
 * combination.
 * @example
 * ```ts
 * import { HashTableSortedColumn } from '@rimbu/table/hash-row/sorted-column';
 *
 * const table = HashTableSortedColumn.of<number, string, boolean>([1, 'b', true]);
 * console.log(table.get(1, 'b')); // => true
 * console.log(table.getRow(1).size); // => 1
 * ```
 */
export const HashTableSortedColumn: Table.CollectionContext<any, any> =
	TableCollectionContext.create<any, any, Table.Advanced.Family<any, any, any>>(
		{
			rowContext: HashMap.collectionContext,
			columnContext: SortedMap.collectionContext,
		},
	);
