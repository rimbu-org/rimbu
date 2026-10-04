import type { Table } from '@rimbu/table';

import { HashMap } from '@rimbu/hashed/map';

import { TableCollectionContext } from '#table/context-factory';

/**
 * A `Table` whose rows **and** columns are both backed by a `HashMap`.
 *
 * This is a {@link Table.Context}, **not** a distinct collection type: the
 * collection type is `Table<R, C, V>` whichever backing is chosen, and the
 * backing is fixed by the context. Row order and column order are both
 * unspecified. Use `Table.createContext({ rowContext, columnContext })` for any
 * other combination.
 *
 * Note that `rowMap` is the **generic** `MapCollection<R, MapCollection.NonEmpty<C, V>>`
 * — the concrete `HashMap` backing is an implementation detail.
 * @example
 * ```ts
 * import { HashTableHashColumn } from '@rimbu/table/hash-row/hash-column';
 *
 * const table = HashTableHashColumn.of<number, string, boolean>([1, 'a', true]);
 * console.log(table.get(1, 'a')); // => true
 * console.log(table.get(1, 'b', 'fallback')); // => 'fallback'
 * console.log(table.amountRows); // => 1
 * ```
 */
export const HashTableHashColumn: Table.CollectionContext<any, any> =
	TableCollectionContext.create<any, any, Table.Advanced.Family<any, any, any>>(
		{
			rowContext: HashMap.collectionContext,
			columnContext: HashMap.collectionContext,
		},
	);
