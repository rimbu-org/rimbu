import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common/types';
import type { StreamSource } from '@rimbu/stream';
import type { Table } from '@rimbu/table';

import type { TableContext } from '#table/context';

import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { OptLazy as OptLazyValue } from '@rimbu/common/opt-lazy';
import { Stream } from '@rimbu/stream';

type TableTypesNonEmpty<R, C, V> = Collection.Advanced.TypesNonEmpty<
	Table.Advanced.Family<R, C, V>,
	readonly [R, C, V]
>;

/**
 * A table with at least one cell.
 *
 * The entire state is two fields: the nested row map and the **cell** count.
 * `amountRows` is `rowMap.size`, which is a different number — that is why the
 * two are separate.
 *
 * The inner maps are non-empty by construction: every path that could empty a
 * row prunes it instead. `copyE` relies on this when it walks into a row.
 */
export class TableNonEmptyBase<
		R,
		C,
		V,
		Tp extends TableTypesNonEmpty<R, C, V> = TableTypesNonEmpty<R, C, V>,
	>
	extends CollectionNonEmpty.Constructor<
		readonly [R, C, V],
		Table.Advanced.Family<R, C, V>,
		Tp
	>
	implements Table.NonEmpty<R, C, V>
{
	constructor(
		readonly context: TableContext<R, C>,
		readonly rowMap: MapCollection.NonEmpty<R, MapCollection.NonEmpty<C, V>>,
		readonly size: number,
	) {
		super(context);
	}

	copy(
		rowMap: MapCollection.NonEmpty<R, MapCollection.NonEmpty<C, V>>,
		size: number,
	): Table.NonEmpty<R, C, V> {
		if (rowMap === this.rowMap) return this as any;
		return this.context.createNonEmpty(rowMap, size);
	}

	copyE(
		rowMap: MapCollection<R, MapCollection.NonEmpty<C, V>>,
		size: number,
	): Table<R, C, V> {
		if (rowMap.nonEmpty()) {
			return this.copy(rowMap.assumeNonEmpty(), size);
		}
		return this.context.empty<readonly [R, C, V]>() as Table<R, C, V>;
	}

	get amountRows(): number {
		return this.rowMap.size;
	}

	stream(): Stream.NonEmpty<readonly [R, C, V]> {
		return this.rowMap
			.stream()
			.flatMap(
				([row, columns]): Stream.NonEmpty<readonly [R, C, V]> =>
					columns
						.stream()
						.map(([column, value]): readonly [R, C, V] => [row, column, value]),
			);
	}

	streamRows(): Stream.NonEmpty<R> {
		return this.rowMap.streamKeys();
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.rowMap
			.streamValues()
			.flatMap((columns): Stream.NonEmpty<V> => columns.streamValues());
	}

	hasRow<UR>(row: RelatedTo<R, UR>): boolean {
		return this.rowMap.has(row);
	}

	has<UR, UC>(row: RelatedTo<R, UR>, column: RelatedTo<C, UC>): boolean {
		const token = Symbol();
		return token !== this.get(row, column, token as any);
	}

	get<UR, UC, O>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
		otherwise?: OptLazy<O>,
	): V | O {
		const token = Symbol();
		const result = this.rowMap.get(row, token as any);
		if (token === result) return OptLazyValue(otherwise) as O;
		return result.get(column, otherwise!);
	}

	getRow<UR>(row: RelatedTo<R, UR>): MapCollection<C, V> {
		return this.rowMap.get(row, this.context.columnContext.empty()) as any;
	}

	set(row: R, column: C, value: V): Tp['_NON_EMPTY'] {
		return this.modify(row, column, {
			ifNew: { set: value },
			ifExists: { set: value },
		}) as any;
	}

	add(cell: readonly [R, C, V]): Tp['_NON_EMPTY'] {
		return this.set(cell[0], cell[1], cell[2]);
	}

	addEach(cells: StreamSource<readonly [R, C, V]>): Tp['_SELF'] {
		if (Stream.isEmptyStreamSourceInstance(cells)) return this as any;

		const builder = this.toBuilder();
		builder.addEach(cells);

		return builder.build() as any;
	}

	modify<UR, UC>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
		options: ModifyOptions<V>,
	): Tp['_NORMAL'] {
		if (checkEmptyModifyOptions(options)) return this as any;

		let newSize = this.size;
		const { ifNew } = options;

		// The nested options below drive the *inner* maps, whose API is an
		// intersection type. Annotating the callbacks fights that structural type,
		// and these calls are internal storage mechanics — the public contract lives
		// on `TableCollection.Capability` — so the options are passed as `any` and
		// the callbacks stay un-annotated.
		const rowMapOptions: any = {
			ifExists: {
				update: (rowMap: any, remove: any) => {
					const newRow = rowMap.modifyAtKey(column, options);

					if (newRow === rowMap) return rowMap;

					// The row-pruning invariant: a row is never allowed to become an
					// empty map, so a row whose last cell was removed is removed too.
					if (!newRow.nonEmpty()) {
						return remove;
					}

					newSize += newRow.size - rowMap.size;

					return newRow;
				},
			},
		};

		if (undefined !== ifNew) {
			rowMapOptions.ifNew = {
				create: (skip: any) => {
					const { ifNew } = options;

					if (undefined === ifNew) return skip;
					const { set, create } = ifNew;
					const token = Symbol();
					const newValue = create !== undefined ? create(token) : set;

					if (token === newValue) {
						return skip;
					}

					newSize++;

					return this.context.columnContext.of([column, newValue]);
				},
			};
		}

		const newRowMap = this.rowMap.modifyAtKey(row as R, rowMapOptions as any);

		return this.copyE(newRowMap, newSize) as any;
	}

	update<UR, UC>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
		update: (value: V) => V,
	): Tp['_NORMAL'] {
		if (!this.context.isValidRow(row)) return this as any;
		if (!this.context.isValidColumn(column)) return this as any;

		return this.modify(row, column, {
			ifExists: { update },
		}) as any;
	}

	remove<UR, UC>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
	): Tp['_NORMAL'] {
		const result = this.#removeAndReturn(row, column);

		return (result?.[0] ?? this) as Tp['_NORMAL'];
	}

	#removeAndReturn<UR, UC>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
	): [Table<R, C, V>, V | undefined, boolean] | undefined {
		if (!this.context.isValidRow(row)) return undefined;
		if (!this.context.isValidColumn(column)) return undefined;

		let newSize = this.size;
		const token = Symbol();
		let removedValue: V | typeof token = token;

		const newRows = this.rowMap.modifyAtKey(
			row as R,
			{
				ifExists: {
					update: (columns: any, remove: any) => {
						const newColumns = columns.modifyAtKey(column as C, {
							ifExists: {
								update: (currentValue: V, removeCell: any) => {
									removedValue = currentValue;
									newSize--;
									return removeCell;
								},
							},
						});

						// Row-pruning invariant, second site.
						if (newColumns.nonEmpty()) return newColumns;
						return remove;
					},
				},
			} as any,
		);

		if (token === removedValue) return undefined;

		return [this.copyE(newRows, newSize), removedValue, true];
	}

	removeRow<UR>(row: RelatedTo<R, UR>): Tp['_NORMAL'] {
		const result = this.#removeRowAndReturn(row);

		return (result?.[0] ?? this) as Tp['_NORMAL'];
	}

	#removeRowAndReturn<UR>(
		row: RelatedTo<R, UR>,
	):
		| [Table<R, C, V>, MapCollection.NonEmpty<C, V> | undefined, boolean]
		| undefined {
		if (!this.context.isValidRow(row)) return undefined;

		let newSize = this.size;
		let removedRow: MapCollection.NonEmpty<C, V> | undefined;

		const newRows = this.rowMap.modifyAtKey(
			row as R,
			{
				ifExists: {
					update: (columns: any, remove: any) => {
						removedRow = columns;
						newSize -= columns.size;
						return remove;
					},
				},
			} as any,
		);

		if (undefined === removedRow) return undefined;

		return [this.copyE(newRows, newSize), removedRow, true];
	}

	removeRows<UR>(rows: StreamSource<RelatedTo<R, UR>>): Tp['_NORMAL'] {
		if (Stream.isEmptyStreamSourceInstance(rows)) return this as any;

		const builder = this.toBuilder();

		builder.removeRows(rows);
		return builder.build() as any;
	}

	removeEach<UR, UC>(
		cells: StreamSource<readonly [RelatedTo<R, UR>, RelatedTo<C, UC>]>,
	): Tp['_NORMAL'] {
		if (Stream.isEmptyStreamSourceInstance(cells)) return this as any;

		const builder = this.toBuilder();

		builder.removeEach(cells);
		return builder.build() as any;
	}

	// Only the boolean overload is implemented: the two type-guard overloads are
	// declared by `Collection.Capability.WithFilter` on the interface and re-type
	// the *result*, which the implementation cannot do (it always returns
	// `Tp['_NORMAL']`). This is the same split `list` uses.
	filter(
		pred: (cell: readonly [R, C, V]) => boolean,
		options?: { negate?: boolean | undefined },
	): Tp['_NORMAL'] {
		const builder = this.context.builder<readonly [R, C, V]>();

		builder.addEach(this.stream().filter(pred, options));

		// No-op identity: if nothing was filtered out, hand back `this`.
		if (builder.size === this.size) return this as any;

		return builder.build() as any;
	}

	filterRows(
		pred: (row: R, rowMap: MapCollection<C, V>) => boolean,
		options?: { negate?: boolean | undefined },
	): Tp['_NORMAL'] {
		const negate = options?.negate ?? false;

		let newSize = 0;
		const newRowMap = this.rowMap.filter((entry): boolean => {
			const [row, columns] = entry as readonly [
				R,
				MapCollection.NonEmpty<C, V>,
			];

			const result = pred(row, columns as MapCollection<C, V>);
			if (result !== negate) newSize += columns.size;
			return result;
		}) as any;

		return this.copyE(newRowMap, newSize) as any;
	}

	mapValues<V2 extends Tp['_UPPER_V']>(
		mapFun: (value: V, row: R, column: C) => V2,
	): any {
		return this.copy(
			this.rowMap.mapValues(
				(columns, row): MapCollection.NonEmpty<C, V2> =>
					columns.mapValues(
						(value, column): V2 => mapFun(value, row, column),
					) as any,
			) as any,
			this.size,
		) as any;
	}

	forEach(f: (cell: readonly [R, C, V]) => void): void {
		const rowIt = this.rowMap[Symbol.iterator]();
		let rowEntry: readonly [R, MapCollection.NonEmpty<C, V>] | undefined;

		while (undefined !== (rowEntry = rowIt.fastNext())) {
			const [row, columns] = rowEntry;
			const columnIt = columns[Symbol.iterator]();
			let columnEntry: readonly [C, V] | undefined;

			while (undefined !== (columnEntry = columnIt.fastNext())) {
				f([row, columnEntry[0], columnEntry[1]]);
			}
		}
	}

	mutate(f: (builder: Table.Builder<R, C, V>) => void): Tp['_NORMAL'] {
		const builder = this.toBuilder();
		f(builder);
		return builder.build() as any;
	}

	toArray(): ArrayNonEmpty<readonly [R, C, V]> {
		const result: ArrayNonEmpty<readonly [R, C, V]> = [] as any;

		const rowIt = this.rowMap.stream()[Symbol.iterator]();
		let rowEntry: readonly [R, MapCollection.NonEmpty<C, V>] | undefined;

		while (undefined !== (rowEntry = rowIt.fastNext())) {
			const columnIt = rowEntry[1].stream()[Symbol.iterator]();
			let columnEntry: readonly [C, V] | undefined;

			while (undefined !== (columnEntry = columnIt.fastNext())) {
				result.push([rowEntry[0], columnEntry[0], columnEntry[1]]);
			}
		}

		return result;
	}

	toBuilder(): Table.Builder<R, C, V> {
		return this.context.createBuilder(this as any);
	}

	toString(): string {
		return this.stream().join({
			start: `${this.context.typeTag}(`,
			sep: ', ',
			end: ')',
			valueToString: (entry) => `[${entry[0]}, ${entry[1]}] -> ${entry[2]}`,
		});
	}
}
