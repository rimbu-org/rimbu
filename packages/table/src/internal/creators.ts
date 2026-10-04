import type { Table } from '@rimbu/table';
import type { TableCollection } from '@rimbu/table/advanced/table-base';

/**
 * The creators a table context exposes beyond the standard factory methods.
 *
 * This is the shape of both the root {@link Table} value and each of the four
 * exported context constants. It adds only `createContext`, which derives a
 * sibling context with a different row and/or column backing.
 *
 * Note that `empty`, `of`, `from`, `builder`, `reducer` and `defaultContext` are
 * **not** declared here: they come from the shared
 * `Collection.Advanced.ContextApi`, so they are available on every table context
 * with consistent signatures across the whole library.
 */
export interface TableCreators {
	/**
	 * Derives a table context from the given row and column map contexts.
	 *
	 * Both are required — a table has no default backing, because which map backs
	 * rows and which backs columns are independent choices.
	 * @example
	 * ```ts
	 * import { Table } from '@rimbu/table';
	 * import { HashMap } from '@rimbu/hashed/map';
	 * import { SortedMap } from '@rimbu/sorted/map';
	 *
	 * const context = Table.createContext({
	 * 	rowContext: HashMap.collectionContext,
	 * 	columnContext: SortedMap.collectionContext,
	 * });
	 * console.log(context.of<number, string, boolean>([1, 'a', true]).size); // => 1
	 * ```
	 */
	createContext<UR, UC>(options: {
		rowContext: TableCollection.Advanced.RowMapContext<UR>;
		columnContext: TableCollection.Advanced.ColumnMapContext<UC>;
	}): TableCollection.Advanced.ContextApi<
		TableCollection.Advanced.Family<UR, UC, any>
	>;
}
