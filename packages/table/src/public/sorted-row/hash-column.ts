import type { Streamable } from '@rimbu/stream';

import type { SortedTableHashColumnCreators } from '#table/creators';
import type { TableBase } from '#table/types';

import { HashMap } from '@rimbu/hashed/map';
import { SortedMap } from '@rimbu/sorted/map';

import { createTableContextModule } from '#table/context-factory';

/**
 * A type-invariant immutable Table of row key type R, column key type C, and value type V.
 * In the Table, a combination of a row and column key has exactly one value.
 * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [SortedTableHashColumn API documentation](https://rimbu.org/api/rimbu/table/sorted-row/SortedTableHashColumn/interface)
 * @note
 * - The SortedTableHashColumn uses a SortedMap to map row keys to column.
 * - The SortedTableHashColumn uses HashMaps to map column keys to values.
 * @typeparam R - the row key type
 * @typeparam C - the column key type
 * @typeparam V - the value type
 * @example
 * ```ts
 * import { SortedTableHashColumn } from '@rimbu/table/sorted-row/hash-column'
 * const t1 = SortedTableHashColumn.empty<number, string, boolean>()
 * const t2 = SortedTableHashColumn.of([1, 'a', true], [2, 'a', false])
 * ```
 */
export interface SortedTableHashColumn<R, C, V>
	extends TableBase<R, C, V, SortedTableHashColumn.Types> {}

export namespace SortedTableHashColumn {
	/**
	 * A non-empty type-invariant immutable Table of row key type R, column key type C, and value type V.
	 * In the Table, a combination of a row and column key has exactly one value.
	 * @note
	 * - The SortedTableHashColumn uses a SortedMap to map row keys to column.
	 * - The SortedTableHashColumn uses HashMaps to map column keys to values.
	 * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [SortedTableHashColumn API documentation](https://rimbu.org/api/rimbu/table/sorted-row/SortedTableHashColumn/interface)
	 * @typeparam R - the row key type
	 * @typeparam C - the column key type
	 * @typeparam V - the value type
	 * @example
	 * ```ts
	 * import { SortedTableHashColumn } from '@rimbu/table/sorted-row/hash-column'
	 * const t1 = SortedTableHashColumn.empty<number, string, boolean>()
	 * const t2 = SortedTableHashColumn.of([1, 'a', true], [2, 'a', false])
	 * ```
	 */
	export interface NonEmpty<R, C, V>
		extends TableBase.NonEmpty<R, C, V, SortedTableHashColumn.Types>,
			Omit<
				SortedTableHashColumn<R, C, V>,
				keyof TableBase.NonEmpty<any, any, any, any>
			>,
			Streamable.NonEmpty<[R, C, V]> {}

	export interface Context<UR, UC>
		extends TableBase.Context<UR, UC, SortedTableHashColumn.Types> {
		readonly typeTag: 'SortedTableHashColumn';
	}

	export interface Builder<R, C, V>
		extends TableBase.Builder<R, C, V, SortedTableHashColumn.Types> {}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends TableBase.Types {
		readonly normal: SortedTableHashColumn<this['_R'], this['_C'], this['_V']>;
		readonly nonEmpty: SortedTableHashColumn.NonEmpty<
			this['_R'],
			this['_C'],
			this['_V']
		>;
		readonly row: HashMap<this['_C'], this['_V']>;
		readonly rowNonEmpty: HashMap.NonEmpty<this['_C'], this['_V']>;
		readonly rowMap: SortedMap<
			this['_R'],
			HashMap.NonEmpty<this['_C'], this['_V']>
		>;
		readonly rowMapNonEmpty: SortedMap.NonEmpty<
			this['_R'],
			HashMap.NonEmpty<this['_C'], this['_V']>
		>;
		readonly context: SortedTableHashColumn.Context<this['_R'], this['_C']>;
		readonly builder: SortedTableHashColumn.Builder<
			this['_R'],
			this['_C'],
			this['_V']
		>;
		readonly rowContext: SortedMap.Context<this['_R']>;
		readonly columnContext: HashMap.Context<this['_C']>;
	}
}

/**
 * The default `SortedTableHashColumn` creators and context.
 *
 * Use this exported value to create and work with immutable `SortedTableHashColumn` instances.
 * See the [SortedTableHashColumn API documentation](https://rimbu.org/api/rimbu/table/sorted-row/SortedTableHashColumn/interface).
 * @expandType SortedTableHashColumnCreators
 */
export const SortedTableHashColumn: SortedTableHashColumnCreators =
	createTableContextModule('SortedTableHashColumn', {
		get rowContext() {
			return SortedMap.defaultContext();
		},
		get columnContext() {
			return HashMap.defaultContext();
		},
	}).build();
