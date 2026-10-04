import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { StreamSource } from '@rimbu/stream';
import type { Table } from '@rimbu/table';
import type { TableCollection } from '@rimbu/table/advanced/table-base';

import { ContextBaseWithAddEach } from '@rimbu/collection-types/advanced/collection-base';
import { Reducer } from '@rimbu/stream/reducer';

import { TableBuilder } from '#table/builder';
import { TableEmpty } from '#table/immutable/empty';
import { TableNonEmptyBase } from '#table/immutable/non-empty';

/**
 * A Table context.
 *
 * A table needs **two** map contexts — one for rows, one for columns — and both
 * are required. There is no sensible default, because which map backs rows and
 * which backs columns are independent choices: `HashMap`/`SortedMap` for rows
 * crossed with `HashMap`/`SortedMap` for columns gives the four contexts this
 * package ships. That is also why the root `Table` value exposes only
 * `createContext` rather than a `defaultContext`.
 */
export interface ContextImpl<
	UR,
	UC,
	FAM extends Table.Advanced.Family<UR, UC, any>,
> extends TableCollection.Advanced.ContextApi<FAM> {
	isNonEmptyInstance<E extends readonly [UR, UC, any]>(
		source: unknown,
	): source is Collection.Advanced.FamToTypes<FAM, E>['_NON_EMPTY'];
	createContext<UR2, UC2>(options: {
		rowContext: TableCollection.Advanced.RowMapContext<UR2>;
		columnContext: TableCollection.Advanced.ColumnMapContext<UC2>;
	}): TableCollection.Advanced.ContextApi<
		TableCollection.Advanced.Family<UR2, UC2, any>
	>;
	createNonEmpty<R, C, V>(
		rowMap: MapCollection.NonEmpty<R, MapCollection.NonEmpty<C, V>>,
		size: number,
	): Table.NonEmpty<R, C, V>;
	createBuilder<R, C, V>(
		source?: Table.NonEmpty<R, C, V> | undefined,
	): Table.Builder<R, C, V>;
}

/**
 * The concrete context implementation.
 *
 * Frozen on construction: a context is shared by every collection it produces,
 * and a mutable one would let a caller swap a backing out from under live
 * collections.
 */
/**
 * The `ContextBaseWithAddEach` argument.
 *
 * `ContextBaseWithAddEach` constrains its family to
 * `Family<any> & WithToBuilder<any> & WithAddEach<any>`, which is satisfied by
 * families that *literally extend* those capability families (multiset, hashed).
 * `Table.Advanced.Family` deliberately does not: it pins `_UPPER_E` / `_NEW_E`
 * to cell triples, and those conflict with the unpinned `unknown` the capability
 * families declare (TS2320). Every member the base actually needs — `addEach`,
 * `toBuilder`, `isNonEmptyInstance`, `builder`, `empty`, `defaultContext` — is
 * present and implemented below, so the base class is instantiated with the
 * capability shape asserted rather than structurally derived. The cast is
 * confined to this one argument; `Table.Advanced.Family` itself stays free of the
 * conflicting declarations.
 */
type ContextFamily<FAM> = FAM &
	Collection.Advanced.Family<any> &
	Collection.Capability.WithAddEach<any> &
	Collection.Capability.WithToBuilder<any>;

export class TableCollectionContext<
		UR,
		UC,
		FAM extends Table.Advanced.Family<UR, UC, any>,
	>
	extends ContextBaseWithAddEach<ContextFamily<FAM> & unknown>
	implements ContextImpl<UR, UC, FAM>
{
	/**
	 * Fixed rather than a constructor parameter: the tag describes the
	 * collection, and there is only one collection type. The backing is chosen by
	 * `rowContext` / `columnContext` and is no longer visible in `toString()`.
	 */
	readonly typeTag: 'Table' = 'Table';

	constructor(
		readonly rowContext: FAM['_ROW_CONTEXT'],
		readonly columnContext: FAM['_COLUMN_CONTEXT'],
		readonly getDefaultInstance: () => TableCollectionContext<UR, UC, FAM>,
	) {
		super();
	}

	static create<
		UR,
		UC,
		FAM extends Table.Advanced.Family<UR, UC, any>,
	>(options: {
		rowContext: FAM['_ROW_CONTEXT'];
		columnContext: FAM['_COLUMN_CONTEXT'];
	}): TableCollectionContext<UR, UC, FAM> {
		let result: TableCollectionContext<UR, UC, FAM>;

		result = new TableCollectionContext<UR, UC, FAM>(
			options.rowContext,
			options.columnContext,
			// Self-reference, resolved lazily: `defaultContext` must point back at
			// this instance without the constructor needing the finished object.
			() => result,
		);

		Object.freeze(result);

		return result;
	}

	get defaultContext(): FAM['_CONTEXT'] {
		return this.getDefaultInstance() as any;
	}

	isValidRow(row: unknown): boolean {
		return this.rowContext.isValidKey(row);
	}

	isValidColumn(column: unknown): boolean {
		return this.columnContext.isValidKey(column);
	}

	columnContextFor<V>(): TableCollection.Advanced.ColumnMapContextFor<UC, V> {
		return this.columnContext as any;
	}

	createColumnMap<V>(
		column: UC,
		value: V,
	): TableCollection.Advanced.ColumnMapTypeNonEmpty<UC, V> {
		// One entry, so the result is non-empty by construction.
		return (this.columnContext as any).of([
			column,
			value,
		]) as TableCollection.Advanced.ColumnMapTypeNonEmpty<UC, V>;
	}

	createRowMap<V>(
		row: UR,
		columnMap: TableCollection.Advanced.ColumnMapTypeNonEmpty<UC, V>,
	): TableCollection.Advanced.RowMapTypeNonEmpty<UR, UC, V> {
		// One entry, so the result is non-empty by construction.
		return (this.rowContext as any).of([
			row,
			columnMap,
		]) as TableCollection.Advanced.RowMapTypeNonEmpty<UR, UC, V>;
	}

	isNonEmptyInstance<E extends readonly [UR, UC, any]>(
		source: unknown,
	): source is Collection.Advanced.FamToTypes<FAM, E>['_NON_EMPTY'] {
		return source instanceof TableNonEmptyBase;
	}

	#empty: unknown;

	empty = <E extends FAM['_UPPER_E']>(): Collection.Advanced.FamToTypes<
		FAM,
		E
	>['_NORMAL'] => {
		if (undefined === this.#empty) {
			this.#empty = Object.freeze(new TableEmpty<any, any, any>(this as any));
		}

		return this.#empty as any;
	};

	builder = <E extends FAM['_UPPER_E']>(): Collection.Advanced.FamToTypes<
		FAM,
		E
	>['_BUILDER'] => {
		return new TableBuilder<any, any, any>(this as any) as any;
	};

	createNonEmpty<R, C, V>(
		rowMap: MapCollection.NonEmpty<R, MapCollection.NonEmpty<C, V>>,
		size: number,
	): Table.NonEmpty<R, C, V> {
		return new TableNonEmptyBase<R, C, V>(this as any, rowMap, size) as any;
	}

	createBuilder<R, C, V>(
		source?: Table.NonEmpty<R, C, V> | undefined,
	): Table.Builder<R, C, V> {
		return new TableBuilder<R, C, V>(this as any, source);
	}

	reducer = <E extends FAM['_UPPER_E']>(
		source?: StreamSource<E> | undefined,
	): Reducer<E, Collection.Advanced.FamToTypes<FAM, E>['_NORMAL']> => {
		return Reducer.create(
			() =>
				undefined === source
					? this.builder<E>()
					: (this.from(source as any) as any).toBuilder(),
			(builder, cell) => {
				builder.add(cell as any);
				return builder;
			},
			(builder) => builder.build(),
		) as any;
	};

	createContext = <UR2, UC2>(options: {
		rowContext: TableCollection.Advanced.RowMapContext<UR2>;
		columnContext: TableCollection.Advanced.ColumnMapContext<UC2>;
	}): Table.CollectionContext<UR2, UC2> => {
		// A derived context is a `TableCollectionContext` with the new backings;
		// the public return type is the context *interface*, which it satisfies.
		return TableCollectionContext.create<
			UR2,
			UC2,
			Table.Advanced.Family<UR2, UC2, any>
		>(options);
	};
}
