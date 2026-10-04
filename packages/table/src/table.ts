import type { Collection } from '@rimbu/collection-types/collection';
import type { TableCollection } from '@rimbu/table/advanced/table-base';

import type { TableCreators } from '#table/creators';

import { TableCollectionContext } from '#table/context-factory';

export * from '@rimbu/table/advanced/table-base';

/**
 * A type-invariant immutable Table of row key type R, column key type C, and value type V.
 * In the Table, a combination of a row and column key has exactly one value.
 *
 * A table is a `Collection` whose element is a **cell**, `readonly [R, C, V]`. It
 * is deliberately not a keyed collection — see {@link TableCollection} for why,
 * and for the list of capabilities it adopts and bans.
 *
 * The row map and the column map are chosen independently by the context; see
 * `HashTableHashColumn`, `HashTableSortedColumn`, `SortedTableHashColumn` and
 * `SortedTableSortedColumn` for the four ready-made contexts.
 *
 * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [Table API documentation](https://rimbu.org/api/rimbu/table/Table/interface)
 * @typeparam R - the row key type
 * @typeparam C - the column key type
 * @typeparam V - the value type
 * @example
 * ```ts
 * import { HashTableHashColumn } from '@rimbu/table/hash-row/hash-column';
 *
 * const table = HashTableHashColumn.of<number, string, boolean>([1, 'a', true]);
 * console.log(table.get(1, 'a')); // => true
 * console.log(table.amountRows); // => 1
 * ```
 */
export interface Table<R, C, V>
	extends Table.Advanced.Api<
		R,
		C,
		V,
		Collection.Advanced.Types<
			Table.Advanced.Family<R, C, V>,
			readonly [R, C, V]
		>
	> {}

export namespace Table {
	/**
	 * A non-empty type-invariant immutable Table of row key type R, column key type C, and value type V.
	 * In the Table, a combination of a row and column key has exactly one value.
	 * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [Table API documentation](https://rimbu.org/api/rimbu/table/Table/interface)
	 * @typeparam R - the row key type
	 * @typeparam C - the column key type
	 * @typeparam V - the value type
	 * @example
	 * ```ts
	 * import { HashTableHashColumn } from '@rimbu/table/hash-row/hash-column';
	 *
	 * const table = HashTableHashColumn.of<number, string, boolean>([1, 'a', true]);
	 * console.log(table.isEmpty); // => false
	 * console.log(table.toArray()); // => [ [ 1, "a", true ] ]
	 * ```
	 */
	export interface NonEmpty<R, C, V>
		extends Table.Advanced.NonEmptyApi<
			R,
			C,
			V,
			Collection.Advanced.TypesNonEmpty<
				Table.Advanced.Family<R, C, V>,
				readonly [R, C, V]
			>
		> {}

	/**
	 * A context instance for Table implementations that acts as a factory for every instance of this
	 * type of collection.
	 * @typeparam UR - the upper row key type bound for which the context can be used
	 * @typeparam UC - the upper column key type bound for which the context can be used
	 */
	export interface Context<UR, UC>
		extends Table.Advanced.ContextApi<Table.Advanced.Family<UR, UC, any>> {}

	/**
	 * A mutable Table builder used to efficiently create new immutable instances.
	 * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [Table.Builder API documentation](https://rimbu.org/api/rimbu/table/Table/Builder/interface)
	 * @typeparam R - the row key type
	 * @typeparam C - the column key type
	 * @typeparam V - the value type
	 */
	export interface Builder<R, C, V>
		extends Table.Advanced.BuilderApi<
			R,
			C,
			V,
			Collection.Advanced.Types<
				Table.Advanced.Family<R, C, V>,
				readonly [R, C, V]
			>
		> {}

	/**
	 * A ready-made {@link Table.Context}: the type of the four exported constants.
	 * `HashTableHashColumn`, `HashTableSortedColumn`, `SortedTableHashColumn` and
	 * `SortedTableSortedColumn` are four `Table.CollectionContext` values with
	 * different row/column backings, **not** four collection types.
	 *
	 * Structurally this *is* {@link Table.Context}; it is named separately because
	 * the constants are also passed to `createContext`, which returns the same
	 * thing, and a distinct name documents that a context value is what you have.
	 */
	export interface CollectionContext<UR, UC> extends Table.Context<UR, UC> {}

	/**
	 * The concrete context implementation.
	 *
	 * Not part of the public API surface in practice — it carries the internal
	 * construction hooks — but it is what the four constants and
	 * `createContext` actually return.
	 */
	export type ContextImpl<UR, UC> = TableCollectionContext<
		UR,
		UC,
		Table.Advanced.Family<UR, UC, any>
	>;

	export namespace Advanced {
		export interface Api<
			R,
			C,
			V,
			Tp extends TableCollection.Advanced.TypesRecord<
				R,
				C,
				V,
				Table.Advanced.Family<R, C, V>
			>,
		> extends TableCollection.Advanced.Api<R, C, V, Tp> {}

		export interface NonEmptyApi<
			R,
			C,
			V,
			Tp extends Collection.Advanced.TypesNonEmpty<
				Table.Advanced.Family<R, C, V>,
				readonly [R, C, V]
			>,
		> extends TableCollection.Advanced.NonEmptyApi<R, C, V, Tp> {}

		export interface BuilderApi<
			R,
			C,
			V,
			Tp extends TableCollection.Advanced.TypesRecord<
				R,
				C,
				V,
				Table.Advanced.Family<R, C, V>
			>,
		> extends TableCollection.Advanced.BuilderApi<R, C, V, Tp> {}

		export interface ContextApi<
			FAM extends TableCollection.Advanced.FamilyBase<any, any, any>,
		> extends TableCollection.Advanced.ContextApi<FAM> {}

		/**
		 * The Table family. This is the concrete HKT record: it pins the slots that
		 * turn a re-typed cell into a concrete Table again.
		 *
		 * `_UPPER_E` is pinned to `readonly [any, any, any]` — the table analogue
		 * of `HashMap`'s `readonly [K, any]`. It is deliberately permissive: every
		 * operation that accepts a row uses `RelatedTo<R, UR>` so a *wider* row
		 * key type is still accepted, and bounding the row coordinate here would
		 * reject exactly those calls.
		 */
		export interface Family<R, C, V>
			extends TableCollection.Advanced.Family<R, C, V> {
			_NORMAL: Table<R, C, V>;
			_NON_EMPTY: Table.NonEmpty<R, C, V>;
			_BUILDER: Table.Builder<R, C, V>;
			_CONTEXT: Table.Context<R, C>;

			_ROW_CONTEXT: TableCollection.Advanced.RowMapContext<R>;
			_COLUMN_CONTEXT: TableCollection.Advanced.ColumnMapContext<C>;

			/**
			 * A Table is invariant in all three of its coordinates: `set(row, column,
			 * value)` puts `R`, `C` and `V` in contravariant position while
			 * `stream()` puts them in covariant position. Stated once, here, rather
			 * than repeated in each adopted capability family.
			 */
			_INVARIANT: (cell: readonly [R, C, V]) => readonly [R, C, V];

			/**
			 * The retyping pivot. `_UPPER_E` and the three coordinate slots are tied
			 * together **here** rather than in `TableCollection.Advanced.FamilyBase`:
			 * the base cannot index `_UPPER_E` (it is `unknown` there), and pinning
			 * it in the base would conflict with `Collection.Advanced.Family`, which
			 * the framework's own base classes require a family to extend.
			 *
			 * `readonly [any, any, any]` for `_UPPER_E` is the table analogue of
			 * `HashMap`'s `readonly [K, any]` — deliberately permissive so that
			 * `RelatedTo<R, UR>` widening keeps inferring at a context factory.
			 */
			_UPPER_E: readonly [any, any, any];

			_UPPER_R: this['_UPPER_E'][0];
			_UPPER_C: this['_UPPER_E'][1];
			// Pinned to `any` (not projected from `_UPPER_E`) so that
			// `mapValues<V2 extends Tp['_UPPER_V']>` accepts any value type and
			// genuinely re-types the result. Projecting would give
			// `readonly [any,any,any][2]` = `any` too, but stating it directly
			// documents that this bound is deliberately unconstrained.
			_UPPER_V: this['_UPPER_E'][2];

			_NEW_E: readonly [any, any, any];

			_NEW_R: this['_NEW_E'][0];
			_NEW_C: this['_NEW_E'][1];
			_NEW_V: this['_NEW_E'][2];

			_FAM: Family<R, C, V>;
			_NEW_FAMILY: Family<this['_NEW_R'], this['_NEW_C'], this['_NEW_V']>;
		}

		export type DefaultFactory = TableCreators;
	}
}

/**
 * The generic `Table` factory.
 *
 * A table has **no default backing** — which map backs rows and which backs
 * columns are independent choices — so this value exposes only `createContext`.
 * Use one of the four ready-made contexts (`HashTableHashColumn`,
 * `HashTableSortedColumn`, `SortedTableHashColumn`, `SortedTableSortedColumn`)
 * unless you specifically need a different combination.
 *
 * See the [Table documentation](https://rimbu.org/docs/collections/table) and the [Table API documentation](https://rimbu.org/api/rimbu/table/Table/interface).
 */
export const Table: TableCreators = Object.freeze({
	createContext<UR, UC>(options: {
		rowContext: Table.Advanced.Family<UR, UC, any>['_ROW_CONTEXT'];
		columnContext: Table.Advanced.Family<UR, UC, any>['_COLUMN_CONTEXT'];
	}): Table.CollectionContext<UR, UC> {
		return TableCollectionContext.create<
			UR,
			UC,
			Table.Advanced.Family<UR, UC, any>
		>(options);
	},
});
