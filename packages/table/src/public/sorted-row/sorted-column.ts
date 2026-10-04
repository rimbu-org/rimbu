import type { Table } from '@rimbu/table';

import { SortedMap } from '@rimbu/sorted/map';

import { TableCollectionContext } from '#table/context-factory';

/**
 * A `Table` whose rows **and** columns are both backed by a `SortedMap`.
 *
 * This is a {@link Table.Context}, **not** a distinct collection type: the
 * collection type is `Table<R, C, V>` whichever backing is chosen. Both
 * `streamRows()` and the columns of `getRow(row)` come out in comparator order.
 * Use `Table.createContext({ rowContext, columnContext })` for any other
 * combination.
 * @example
 * ```ts
 * import { SortedTableSortedColumn } from '@rimbu/table/sorted-row/sorted-column';
 *
 * const table = SortedTableSortedColumn.of<number, string, boolean>([1, 'a', true]);
 * console.log(table.get(1, 'a')); // => true
 * console.log(table.amountRows); // => 1
 * ```
 */
export const SortedTableSortedColumn: Table.CollectionContext<any, any> =
	TableCollectionContext.create<any, any, Table.Advanced.Family<any, any, any>>(
		{
			rowContext: SortedMap.collectionContext,
			columnContext: SortedMap.collectionContext,
		},
	);
