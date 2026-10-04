import type { Collection } from '@rimbu/collection-types/collection';
import type { Table } from '@rimbu/table';
import type { TableCollection } from '@rimbu/table/advanced/table-base';

/**
 * The context an empty/non-empty table and the builder hold.
 *
 * A structural alias rather than an interface, so that passing a
 * `TableCollectionContext` to a constructor requires no cast: the empty seed's
 * base constructor takes `Tp['_CONTEXT']`, which resolves to the *structural*
 * `ContextApi` surface, and naming that surface here lets the concrete context
 * satisfy it directly.
 *
 * ## Why the value type is not a parameter
 *
 * A table's value type is fixed by the collection it is paired with, not by the
 * context: one context produces `Table<R, C, number>` and `Table<R, C, string>`
 * alike. So the context is deliberately **not** parameterised by `V`, and the
 * construction hooks are generic in the value type they produce or accept.
 *
 * That matters for variance. Parameterising the context by `V` would make it
 * invariant in `V` — the family's `_NORMAL` pins `Table<R, C, V>` and `modify`
 * writes a `V` — so a context built for one `V` would reject every other `V`,
 * and `TableCollectionContext.empty<R, C, V>()` could not hand its context to a
 * `TableEmpty` instantiated at a different `V`. `multiset` faces the same
 * constraint and solves it the same way: its `isNonEmptyInstance` takes a
 * predicate over `any`, which keeps the context's value position covariant.
 */
export type TableContext<R, C> = TableCollection.Advanced.ContextApi<
	Table.Advanced.Family<R, C, any>
> & {
	/**
	 * The row-map context, re-typed so that `of([row, columns])` produces a
	 * `MapCollection.NonEmpty` row map rather than the generic
	 * `MapCollection` whose value type the context cannot know.
	 */
	readonly rowContext: TableCollection.Advanced.RowMapContext<R>;
	/** The context for a table's inner (column) maps. */
	readonly columnContext: TableCollection.Advanced.ColumnMapContext<C>;

	/**
	 * Builds the single-row, single-column row map that `TableEmpty.set` needs.
	 *
	 * This is on the context rather than constructed inline because
	 * `rowContext.of([row, columnMap])` is only well-typed when the row context's
	 * value type is known to be a non-empty column map — which the generic
	 * `MapCollection.Context` alias cannot express. Routing through here keeps that
	 * constraint in one place instead of at every call site.
	 */
	createRowMap<V>(
		row: R,
		columnMap: TableCollection.Advanced.ColumnMapTypeNonEmpty<C, V>,
	): TableCollection.Advanced.RowMapTypeNonEmpty<R, C, V>;

	/**
	 * A context that produces a single row's columns at value type `V`.
	 *
	 * Split out from `columnContext` (which is value-type-agnostic) because
	 * `ColumnMapTypeNonEmpty<C, V>` is only obtainable from a `V`-parameterised
	 * context: `of([column, value])` is non-empty by virtue of the caller passing
	 * exactly one entry.
	 */
	columnContextFor<V>(): TableCollection.Advanced.ColumnMapContextFor<C, V>;

	/**
	 * Builds a single-entry, non-empty column map.
	 *
	 * Wraps `of([column, value])` on a `V`-parameterised context, whose result is
	 * non-empty *because the caller supplies exactly one entry*. Stating that here
	 * is what lets the row-pruning invariant (`a row is never empty`) be expressed
	 * as a type rather than as a comment.
	 */
	createColumnMap<V>(
		column: C,
		value: V,
	): TableCollection.Advanced.ColumnMapTypeNonEmpty<C, V>;

	isNonEmptyInstance<E extends readonly [R, C, any]>(
		source: unknown,
	): source is Collection.Advanced.FamToTypes<
		Table.Advanced.Family<R, C, any>,
		E
	>['_NON_EMPTY'];
	createNonEmpty<R2, C2, V>(
		rowMap: TableCollection.Advanced.RowMapTypeNonEmpty<R2, C2, V>,
		size: number,
	): Table.NonEmpty<R2, C2, V>;
	/**
	 * The empty table for this context, at any value type.
	 *
	 * Generic in `V` for the same reason the context itself is not: one context
	 * serves every value type.
	 */
	empty<V>(): Table<R, C, V>;
	createBuilder<R2, C2, V>(
		source?: Table.NonEmpty<R2, C2, V> | undefined,
	): Table.Builder<R2, C2, V>;
};
