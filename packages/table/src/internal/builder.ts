import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { RelatedTo } from '@rimbu/common/types';
import type { StreamSource } from '@rimbu/stream';
import type { Table } from '@rimbu/table';
import type { TableCollection } from '@rimbu/table/advanced/table-base';

import type { TableContext } from '#table/context';

import { Token } from '@rimbu/base/token';
import { CollectionBuilderBase } from '@rimbu/collection-types/advanced/collection-base';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { OptLazy as OptLazyValue } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream } from '@rimbu/stream';

type TableTypes<R, C, V> = Collection.Advanced.Types<
	Table.Advanced.Family<R, C, V>,
	readonly [R, C, V]
>;

/**
 * The mutable Table builder.
 *
 * Two invariants are load-bearing here and easy to lose in a rewrite:
 *
 * 1. **Copy-on-write against `source`.** While `source` is defined the builder
 *    has not been touched, so reads go straight to it and `build()` returns it
 *    unchanged. The first real mutation sets `source` to `undefined` and the
 *    lazily-built `rowMap` of row-builders takes over.
 * 2. **The traversal lock.** `forEach` brackets the traversal with
 *    `startIteration()` / `endIteration()` in a `try`/`finally`, and every mutator
 *    calls `checkLock()` first, so mutating the builder from inside its own
 *    traversal throws instead of corrupting the row-builders mid-iteration. The
 *    `finally` is load-bearing: `f` is user code, and the inherited
 *    `forEachIndexed` implements `halt()` by throwing a sentinel that it then
 *    swallows — without `finally` a legal `halt()` would leave the builder
 *    rejecting every later mutation.
 *
 * Members are arrow-function properties rather than prototype methods, so `this`
 * survives destructuring.
 */
export class TableBuilder<
		R,
		C,
		V,
		Tp extends TableTypes<R, C, V> = TableTypes<R, C, V>,
	>
	extends CollectionBuilderBase<readonly [R, C, V], Tp['_FAM'], Tp>
	implements Table.Builder<R, C, V>
{
	_size = 0;

	constructor(
		readonly context: TableContext<R, C>,
		public source?: Table.NonEmpty<R, C, V>,
	) {
		super();
		if (undefined !== source) this._size = source.size;
	}

	#rowMap:
		| TableCollection.Advanced.RowBuilder<
				R,
				TableCollection.Advanced.ColumnBuilder<C, V>
		  >
		| undefined;

	get rowMap(): TableCollection.Advanced.RowBuilder<
		R,
		TableCollection.Advanced.ColumnBuilder<C, V>
	> {
		if (undefined === this.#rowMap) {
			this.#rowMap = (
				undefined === this.source
					? this.context.rowContext.builder()
					: this.source.rowMap
							.mapValues((columns) => columns.toBuilder())
							.toBuilder()
			) as TableCollection.Advanced.RowBuilder<
				R,
				TableCollection.Advanced.ColumnBuilder<C, V>
			>;
		}

		return this.#rowMap;
	}

	get size(): number {
		return this._size;
	}

	get isEmpty(): boolean {
		return this._size === 0;
	}

	get amountRows(): number {
		return this.source?.amountRows ?? this.rowMap.size;
	}

	get<UR, UC, O>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
		otherwise?: OptLazy<O>,
	): V | O {
		if (undefined !== this.source) {
			return this.source.get(row, column, otherwise!);
		}

		const token = Symbol();
		const result = this.rowMap.get(row, token as any);
		if (token === result) return OptLazyValue(otherwise) as O;
		return (result as any).get(column, otherwise!);
	}

	getRow<UR>(row: RelatedTo<R, UR>): MapCollection<C, V> {
		if (undefined !== this.source) return this.source.getRow(row);

		const token = Symbol();
		const result = this.rowMap.get(row, token as any);
		if (token === result) return this.context.columnContext.empty() as any;
		return result.build() as any;
	}

	has = <UR, UC>(row: RelatedTo<R, UR>, column: RelatedTo<C, UC>): boolean => {
		if (undefined !== this.source) return this.source.has(row, column);

		const token = Symbol();
		return token !== this.get(row, column, token);
	};

	hasRow = <UR>(row: RelatedTo<R, UR>): boolean => {
		return this.source?.hasRow(row) ?? this.rowMap.has(row);
	};

	set = (row: R, column: C, value: V): boolean => {
		let columnBuilder: TableCollection.Advanced.ColumnBuilder<C, V> =
			undefined as any;

		this.rowMap.modifyAtKey(
			row as any,
			{
				ifNew: {
					create: (): TableCollection.Advanced.ColumnBuilder<C, V> => {
						columnBuilder = this.context.columnContext.builder() as any;
						return columnBuilder;
					},
				},
				ifExists: {
					update: (
						b: TableCollection.Advanced.ColumnBuilder<C, V>,
					): TableCollection.Advanced.ColumnBuilder<C, V> => {
						columnBuilder = b;
						return b;
					},
				},
			} as any,
		);

		let changed = true;

		columnBuilder.modifyAtKey(
			column as any,
			{
				ifNew: {
					create: (): V => {
						this._size++;
						return value;
					},
				},
				ifExists: {
					update: (currentValue: V): V => {
						// `Object.is` is what makes re-setting an identical value a
						// no-op, so `source` stays live and `build()` is free.
						if (Object.is(currentValue, value)) changed = false;
						return value;
					},
				},
			} as any,
		);

		if (changed) this.source = undefined;

		return changed;
	};

	add = (cell: readonly [R, C, V]): boolean => {
		return this.set(cell[0], cell[1], cell[2]);
	};

	addEach = (cells: StreamSource<readonly [R, C, V]>): boolean => {
		return Stream.applyFilter(cells, { pred: this.set }).count() > 0;
	};

	remove = <UR, UC, O>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
		otherwise?: OptLazy<O>,
	): V | O => {
		const columnMap = this.rowMap.get(row);
		if (undefined === columnMap) return OptLazyValue(otherwise) as O;

		if (!this.context.isValidColumn(column)) {
			return OptLazyValue(otherwise) as O;
		}

		let removedValue: V | Token = Token;

		columnMap.modifyAtKey(
			column as any,
			{
				ifExists: {
					update: (
						currentValue: V,
						remove: <REMOVE extends symbol>(m: REMOVE) => REMOVE,
					): V | typeof remove => {
						removedValue = currentValue;
						this._size--;
						return remove;
					},
				},
			} as any,
		);

		// Row-pruning invariant, third site: a builder row may not become empty.
		if (columnMap.isEmpty) this.rowMap.removeKey(row as any);

		if (Token === removedValue) return OptLazyValue(otherwise) as O;

		this.source = undefined;

		return removedValue;
	};

	removeRow = <UR>(row: RelatedTo<R, UR>): boolean => {
		if (!this.context.isValidRow(row)) return false;

		return this.rowMap.modifyAtKey(
			row as any,
			{
				ifExists: {
					update: (
						columns: TableCollection.Advanced.ColumnBuilder<C, V>,
						remove: <REMOVE extends symbol>(m: REMOVE) => REMOVE,
					): typeof remove => {
						this.source = undefined;
						this._size -= columns.size;
						return remove;
					},
				},
			} as any,
		);
	};

	removeRows = <UR>(rows: StreamSource<RelatedTo<R, UR>>): boolean => {
		return Stream.from(rows).filterPure({ pred: this.removeRow }).count() > 0;
	};

	removeEach = <UR, UC>(
		cells: StreamSource<readonly [RelatedTo<R, UR>, RelatedTo<C, UC>]>,
	): boolean => {
		const notFound = Symbol();

		return (
			Stream.applyMap(cells, this.remove, notFound).countElement(notFound, {
				negate: true,
			}) > 0
		);
	};

	modify = <UR, UC>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
		options: ModifyOptions<V>,
	): boolean => {
		// `checkLock()` first, before the empty-options early return: `modify` is a
		// mutator, so calling it during a traversal must be rejected even when the
		// options say there is nothing to do.
		this.checkLock();

		if (checkEmptyModifyOptions(options)) return false;

		let changed = false;

		this.rowMap.modifyAtKey(
			row as any,
			{
				ifNew: {
					create: <SKIP extends symbol>(skip: SKIP) => {
						const { ifNew } = options;
						if (undefined === ifNew) return skip;

						const { set, create } = ifNew;
						const token = Symbol();
						const newValue = create !== undefined ? create(token) : set;

						if (token === newValue) return skip;

						const rowMap = this.context.columnContext.builder() as any;

						rowMap.set(column as any, newValue);

						changed = true;
						this._size++;

						return rowMap;
					},
				},
				ifExists: {
					update: (
						curMap: TableCollection.Advanced.ColumnBuilder<C, V>,
						remove: <REMOVE extends symbol>(m: REMOVE) => REMOVE,
					) => {
						const preSize = curMap.size;
						changed = curMap.modifyAtKey(column as any, options as any);

						if (changed) {
							const postSize = curMap.size;

							this._size += postSize - preSize;

							// Row-pruning invariant, fourth site.
							if (postSize <= 0) {
								return remove;
							}
						}

						return curMap;
					},
				},
			} as any,
		);

		if (changed) {
			this.source = undefined;
		}

		return changed;
	};

	/**
	 * The builder traversal.
	 *
	 * `startIteration` / `endIteration` bracket the loop, and the `finally` is
	 * load-bearing: the inherited `forEachIndexed` implements `halt()` by throwing
	 * a sentinel and swallowing it, so without `finally` a legal `halt()` call
	 * would leave this builder permanently rejecting every mutation.
	 */
	forEach(f: (cell: readonly [R, C, V]) => void): void {
		this.startIteration();

		try {
			if (undefined !== this.source) {
				this.source.forEach(f);
				return;
			}

			this.rowMap.forEach((entry): void => {
				const [rowKey, column] = entry as readonly [
					R,
					TableCollection.Advanced.ColumnBuilder<C, V>,
				];

				column.forEach((cell): void => {
					const [columnKey, value] = cell as readonly [C, V];
					f([rowKey, columnKey, value]);
				});
			});
		} finally {
			this.endIteration();
		}
	}

	/**
	 * Overridden rather than inherited: the default walks `forEach`, which cannot
	 * stop the two nested map iterations it drives. Here `halt` is threaded into
	 * both levels so a traversal really does stop promptly.
	 */
	forEachIndexed(
		f: (cell: readonly [R, C, V], index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		const { halt } = state;

		this.startIteration();

		try {
			if (undefined !== this.source) {
				this.source.forEachIndexed(f, { state });
				return;
			}

			this.rowMap.forEachIndexed((rowEntry, _rowIndex, rowHalt): void => {
				const [rowKey, column] = rowEntry as readonly [
					R,
					TableCollection.Advanced.ColumnBuilder<C, V>,
				];

				column.forEachIndexed((cell, _columnIndex, columnHalt): void => {
					const [columnKey, value] = cell as readonly [C, V];

					f([rowKey, columnKey, value], state.nextIndex(), halt);

					if (state.halted) {
						rowHalt();
						columnHalt();
					}
				});
			});
		} finally {
			this.endIteration();
		}
	}

	update = <UR, UC, O>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
		update: (value: V) => V,
		otherwise?: OptLazy<O>,
	): V | O => {
		let oldValue: V;
		let found = false;

		this.modify(row, column, {
			ifExists: {
				update: (value): V => {
					oldValue = value;
					found = true;
					return update(value);
				},
			},
		});

		if (!found) return OptLazyValue(otherwise) as O;

		this.source = undefined;

		return oldValue!;
	};

	clear(): void {
		// Guarded like every other mutator: clearing mid-traversal would drop the
		// row-builders the traversal is walking.
		this.checkLock();

		this._size = 0;
		this.source = undefined;
		this.#rowMap = undefined as any;
	}

	build = (): Tp['_NORMAL'] => {
		if (undefined !== this.source) return this.source as any;

		if (this.isEmpty) return this.context.empty() as any;

		return this.context.createNonEmpty<R, C, V>(
			this.rowMap
				.buildMapValues((row) => row.build().assumeNonEmpty())
				.assumeNonEmpty() as any,
			this.size,
		) as any;
	};

	buildMapValues = <V2 extends Tp['_UPPER_V']>(
		mapFun: (value: V, row: R, column: C) => V2,
	): any => {
		if (undefined !== this.source) return this.source.mapValues(mapFun);

		if (this.isEmpty) return this.context.empty() as any;

		const newRowMap = this.rowMap
			.buildMapValues((row, rowKey) =>
				row
					.buildMapValues((value, columnKey) =>
						mapFun(value, rowKey, columnKey),
					)
					.assumeNonEmpty(),
			)
			.assumeNonEmpty() as any;

		return this.context.createNonEmpty<R, C, V2>(newRowMap, this.size);
	};
}
