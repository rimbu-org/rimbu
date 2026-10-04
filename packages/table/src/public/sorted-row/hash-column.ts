import type { Table } from '@rimbu/table';

import { HashMap } from '@rimbu/hashed/map';
import { SortedMap } from '@rimbu/sorted/map';

import { TableCollectionContext } from '#table/context-factory';

/**
 * A `Table` whose rows are backed by a `SortedMap` and whose columns are backed
 * by a `HashMap`.
 *
 * This is a {@link Table.Context}, **not** a distinct collection type: the
 * collection type is `Table<R, C, V>` whichever backing is chosen. Rows come out
 * in comparator order, so `streamRows()` is sorted; column order within a row is
 * unspecified. Use `Table.createContext({ rowContext, columnContext })` for any
 * other combination.
 * @example
 * ```ts
 * import { SortedTableHashColumn } from '@rimbu/table/sorted-row/hash-column';
 *
 * const table = SortedTableHashColumn.of<number, string, boolean>([2, 'b', true]);
 * console.log(table.get(2, 'b')); // => true
 * console.log(table.streamRows().toArray()); // => [ 2 ]
 * ```
 */
export const SortedTableHashColumn: Table.CollectionContext<any, any> =
	TableCollectionContext.create<any, any, Table.Advanced.Family<any, any, any>>(
		{
			rowContext: SortedMap.collectionContext,
			columnContext: HashMap.collectionContext,
		},
	);
