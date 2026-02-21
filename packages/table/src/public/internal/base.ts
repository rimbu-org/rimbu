import type { RMap } from '@rimbu/collection-types';
import type { ArrayNonEmpty, RelatedTo, ToJSON } from '@rimbu/common/types';
import type { Table } from '@rimbu/table';

import type { ContextImpl } from '#table/context-factory';
import type { TableBase } from '#table/types';

import * as RimbuError from '@rimbu/base/rimbu-error';
import { Token } from '@rimbu/base/token';
import {
	EmptyBase,
	NonEmptyBase,
} from '@rimbu/collection-types/common/empty-base';
import { OptLazy, OptLazyOr } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Update } from '@rimbu/common/update';
import { Stream, type StreamSource } from '@rimbu/stream';

export class TableEmpty<R, C, V>
	extends EmptyBase
	implements TableBase<R, C, V>
{
	declare _NonEmptyType: Table.NonEmpty<R, C, V>;

	constructor(readonly context: ContextImpl<R, C>) {
		super();
	}

	set(row: R, column: C, value: V): Table.NonEmpty<R, C, V> {
		const columnMap = this.context.columnContext.of([column, value]);
		const rowMap = this.context.rowContext.of([row, columnMap]);

		return this.context.createNonEmpty(rowMap, 1) as any;
	}

	get rowMap(): RMap<R, RMap.NonEmpty<C, V>> {
		return this.context.rowContext.empty();
	}

	get amountRows(): 0 {
		return 0;
	}

	streamRows(): Stream<R> {
		return Stream.empty();
	}

	streamValues(): Stream<V> {
		return Stream.empty();
	}

	addEntry(entry: readonly [R, C, V]): Table.NonEmpty<R, C, V> {
		return this.set(entry[0], entry[1], entry[2]);
	}

	addEntries(entries: StreamSource<readonly [R, C, V]>): any {
		return this.context.from(entries);
	}

	remove(): this {
		return this;
	}

	removeRow(): this {
		return this;
	}

	removeRows(): this {
		return this;
	}

	removeAndGet(): undefined {
		return undefined;
	}

	removeRowAndGet(): undefined {
		return undefined;
	}

	removeEntries(): this {
		return this;
	}

	hasRowKey(): false {
		return false;
	}

	hasValueAt(): false {
		return false;
	}

	get<_, __, O>(_: R, __: C, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	getRow(): RMap<C, V> {
		return this.context.columnContext.empty();
	}

	modifyAt(
		row: R,
		column: C,
		options: { ifNew?: OptLazyOr<V, Token> },
	): Table<R, C, V> {
		if (undefined !== options.ifNew) {
			const value = OptLazyOr<V, Token>(options.ifNew, Token);
			if (Token === value) return this;

			return this.set(row, column, value);
		}
		return this;
	}

	updateAt(): this {
		return this;
	}

	filterRows(): this {
		return this;
	}

	mapValues<V2>(): Table<R, C, V2> {
		return this as unknown as Table<R, C, V2>;
	}

	toBuilder(): Table.Builder<R, C, V> {
		return this.context.builder();
	}

	toString(): string {
		return `${this.context.typeTag}()`;
	}

	toJSON(): ToJSON<[R, [C, V][]][]> {
		return {
			dataType: this.context.typeTag,
			value: [],
		};
	}
}

export class TableNonEmpty<R, C, V>
	extends NonEmptyBase<[R, C, V]>
	implements TableBase.NonEmpty<R, C, V>
{
	declare _NonEmptyType: Table.NonEmpty<R, C, V>;

	constructor(
		readonly context: ContextImpl<R, C>,
		readonly rowMap: RMap.NonEmpty<R, RMap.NonEmpty<C, V>>,
		readonly size: number,
	) {
		super();
	}

	assumeNonEmpty(): this {
		return this;
	}

	asNormal(): this {
		return this;
	}

	copy(
		rowMap: RMap.NonEmpty<R, RMap.NonEmpty<C, V>>,
		size: number,
	): Table.NonEmpty<R, C, V> {
		if (rowMap === this.rowMap) return this;
		return this.context.createNonEmpty(rowMap, size);
	}

	copyE(rowMap: RMap<R, RMap.NonEmpty<C, V>>, size: number): Table<R, C, V> {
		if (rowMap.nonEmpty()) {
			return this.copy(rowMap.assumeNonEmpty(), size);
		}
		return this.context.empty();
	}

	stream(): Stream.NonEmpty<[R, C, V]> {
		return this.rowMap
			.stream()
			.flatMap(
				([row, columns]): Stream.NonEmpty<[R, C, V]> =>
					columns
						.stream()
						.map(([column, value]): [R, C, V] => [row, column, value]),
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

	get amountRows(): number {
		return this.rowMap.size;
	}

	hasRowKey<UR>(row: RelatedTo<R, UR>): boolean {
		return this.rowMap.hasKey(row);
	}

	hasValueAt<UR, UC>(row: RelatedTo<R, UR>, column: RelatedTo<C, UC>): boolean {
		const token = Symbol();
		return token !== this.get(row, column, token);
	}

	get<UR, UC, O>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
		otherwise?: OptLazy<O>,
	): V | O {
		const token = Symbol();
		const result = this.rowMap.get(row, token);
		if (token === result) return OptLazy(otherwise) as O;
		return result.get(column, otherwise!);
	}

	getRow<UR>(row: RelatedTo<R, UR>): RMap<C, V> {
		return this.rowMap.get(row, this.context.columnContext.empty());
	}

	set(row: R, column: C, value: V): Table.NonEmpty<R, C, V> {
		return this.modifyAt(row, column, {
			ifNew: value,
			ifExists: (): V => value,
		}).assumeNonEmpty();
	}

	addEntry(entry: readonly [R, C, V]): Table.NonEmpty<R, C, V> {
		return this.set(entry[0], entry[1], entry[2]);
	}

	addEntries(
		entries: StreamSource<readonly [R, C, V]>,
	): Table.NonEmpty<R, C, V> {
		if (Stream.isEmptyStreamSourceInstance(entries)) return this;

		const builder = this.toBuilder();

		builder.addEntries(entries);
		return builder.build().assumeNonEmpty();
	}

	modifyAt(
		row: R,
		column: C,
		options: {
			ifNew?: OptLazyOr<V, Token>;
			ifExists?: ((value: V, remove: Token) => V | Token) | V;
		},
	): Table<R, C, V> {
		let newSize = this.size;

		const newRowMap = this.rowMap.modifyAt(row, {
			ifNew: (none) => {
				const { ifNew } = options;

				if (undefined === ifNew) {
					return none;
				}
				const value = OptLazyOr<V, Token>(ifNew, none);

				if (none === value) {
					return none;
				}

				newSize++;

				return this.context.columnContext.of([column, value]);
			},
			ifExists: (row, remove) => {
				const newRow = row.modifyAt(column, options);

				if (newRow === row) {
					return row;
				}

				if (!newRow.nonEmpty()) {
					return remove;
				}

				newSize += newRow.size - row.size;

				return newRow;
			},
		});

		return this.copyE(newRowMap, newSize);
	}

	updateAt<UR, UC>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
		update: Update<V>,
	): Table.NonEmpty<R, C, V> {
		if (!this.context.rowContext.isValidKey(row)) return this;
		if (!this.context.columnContext.isValidKey(column)) return this;

		return this.modifyAt(row, column, {
			ifExists: (value): V => Update(value, update),
		}).assumeNonEmpty();
	}

	remove<UR, UC>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
	): Table<R, C, V> {
		const resultOpt = this.removeAndGet(row, column);

		return resultOpt?.[0] ?? this;
	}

	removeRow<UR>(row: RelatedTo<R, UR>): Table<R, C, V> {
		const resultOpt = this.removeRowAndGet(row);

		return resultOpt?.[0] ?? this;
	}

	removeRows<UR>(rows: StreamSource<RelatedTo<R, UR>>): Table<R, C, V> {
		if (Stream.isEmptyStreamSourceInstance(rows)) return this;

		const builder = this.toBuilder();

		builder.removeRows(rows);
		return builder.build();
	}

	removeAndGet<UR, UC>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
	): [Table<R, C, V>, V] | undefined {
		if (!this.context.rowContext.isValidKey(row)) return undefined;
		if (!this.context.columnContext.isValidKey(column)) return undefined;

		let newSize = this.size;
		const token = Symbol();
		let removedValue: V | typeof token = token;

		const newRows = this.rowMap.modifyAt(row, {
			ifExists: (columns, remove): typeof columns | typeof remove => {
				const newColumns = columns.modifyAt(column, {
					ifExists: (currentValue, remove): typeof remove => {
						removedValue = currentValue;
						newSize--;
						return remove;
					},
				});

				if (newColumns.nonEmpty()) return newColumns;
				return remove;
			},
		});

		if (token === removedValue) return undefined;

		const newSelf = this.copyE(newRows, newSize);
		return [newSelf, removedValue];
	}

	removeRowAndGet<UR>(
		row: RelatedTo<R, UR>,
	): [Table<R, C, V>, RMap.NonEmpty<C, V>] | undefined {
		if (!this.context.rowContext.isValidKey(row)) return undefined;

		let newSize = this.size;
		let removedRow: RMap.NonEmpty<C, V> | undefined;

		const newRows = this.rowMap.modifyAt(row, {
			ifExists: (columns, remove): typeof remove => {
				removedRow = columns;
				newSize -= columns.size;
				return remove;
			},
		});

		if (undefined === removedRow) return undefined;

		const newSelf = this.copyE(newRows, newSize);
		return [newSelf, removedRow];
	}

	removeEntries<UR, UC>(
		entries: StreamSource<[RelatedTo<R, UR>, RelatedTo<C, UC>]>,
	): Table<R, C, V> {
		if (Stream.isEmptyStreamSourceInstance(entries)) return this;

		const builder = this.toBuilder();

		builder.removeEntries(entries);
		return builder.build();
	}

	forEach(
		f: (entry: [R, C, V], index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		const rowIt = this.rowMap[Symbol.iterator]();
		let rowEntry: readonly [R, RMap.NonEmpty<C, V>] | undefined;

		const { halt } = state;

		while (!state.halted && undefined !== (rowEntry = rowIt.fastNext())) {
			const columnIt = rowEntry[1][Symbol.iterator]();
			let columnEntry: readonly [C, V] | undefined;

			while (
				!state.halted &&
				undefined !== (columnEntry = columnIt.fastNext())
			) {
				f(
					[rowEntry[0], columnEntry[0], columnEntry[1]],
					state.nextIndex(),
					halt,
				);
			}
		}
	}

	filter(
		pred: (entry: [R, C, V], index: number, halt: () => void) => boolean,
		options: { negate?: boolean } = {},
	): Table<R, C, V> {
		const builder = this.context.builder<R, C, V>();

		builder.addEntries(this.stream().filter(pred, options));

		if (builder.size === this.size) return this;

		return builder.build();
	}

	filterRows(
		pred: (
			entry: readonly [R, RMap.NonEmpty<C, V>],
			index: number,
			halt: () => void,
		) => boolean,
		options: { negate?: boolean } = {},
	): Table<R, C, V> {
		const { negate = false } = options;

		let newSize = 0;
		const newRowMap = this.rowMap.filter((e, i, halt): boolean => {
			const result = pred(e, i, halt);
			if (result !== negate) newSize += e[1].size;
			return result;
		});

		return this.copyE(newRowMap, newSize);
	}

	mapValues<V2>(
		mapFun: (value: V, row: R, column: C) => V2,
	): Table.NonEmpty<R, C, V2> {
		return this.copy(
			this.rowMap.mapValues(
				(row, r): RMap.NonEmpty<C, V2> =>
					row.mapValues((v, c): V2 => mapFun(v, r, c)),
			) as any,
			this.size,
		) as any;
	}

	toArray(): ArrayNonEmpty<[R, C, V]> {
		const result: ArrayNonEmpty<[R, C, V]> = [] as any;

		const rowIt = this.rowMap.stream()[Symbol.iterator]();
		let rowEntry: readonly [R, RMap.NonEmpty<C, V>] | undefined;

		while (undefined !== (rowEntry = rowIt.fastNext())) {
			const columnIt = rowEntry[1].stream()[Symbol.iterator]();
			let columnEntry: readonly [C, V] | undefined;

			while (undefined !== (columnEntry = columnIt.fastNext())) {
				result.push([rowEntry[0], columnEntry[0], columnEntry[1]]);
			}
		}

		return result;
	}

	toString(): string {
		return this.stream().join({
			start: `${this.context.typeTag}(`,
			sep: `, `,
			end: `)`,
			valueToString: (entry) => `[${entry[0]}, ${entry[1]}] -> ${entry[2]}`,
		});
	}

	toJSON(): ToJSON<[R, [C, V][]][]> {
		return {
			dataType: this.context.typeTag,
			value: this.rowMap
				.stream()
				.map((entry) => [entry[0], entry[1].toJSON().value] as any)
				.toArray(),
		};
	}

	toBuilder(): Table.Builder<R, C, V> {
		return this.context.createBuilder(this as any);
	}
}

export class TableBuilder<R, C, V> implements TableBase.Builder<R, C, V> {
	_lock = 0;
	_size = 0;

	constructor(
		readonly context: ContextImpl<R, C>,
		public source?: Table.NonEmpty<R, C, V>,
	) {
		if (undefined !== source) this._size = source.size;
	}

	_rowMap?: RMap.Builder<R, RMap.Builder<C, V>>;

	get rowMap(): RMap.Builder<R, RMap.Builder<C, V>> {
		if (undefined === this._rowMap) {
			if (undefined === this.source) {
				this._rowMap = this.context.rowContext.builder();
			} else {
				this._rowMap = this.source.rowMap
					.mapValues((v) => v.toBuilder())
					.toBuilder();
			}
		}

		return this._rowMap;
	}

	checkLock(): void {
		if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
	}

	get size(): number {
		return this._size;
	}

	get isEmpty(): boolean {
		return this.size === 0;
	}

	get amountRows(): number {
		return this.source?.amountRows ?? this.rowMap.size;
	}

	get = <UR, UC, O>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
		otherwise?: OptLazy<O>,
	): V | O => {
		if (undefined !== this.source) {
			return this.source.get(row, column, otherwise!);
		}

		const token = Symbol();
		const result = this.rowMap.get(row, token);
		if (token === result) return OptLazy(otherwise) as O;
		return result.get<UC, O>(column, otherwise!);
	};

	getRow = <UR>(row: RelatedTo<R, UR>): RMap<C, V> => {
		if (undefined !== this.source) return this.source.getRow(row);

		const token = Symbol();
		const result = this.rowMap.get(row, token);
		if (token === result) return this.context.columnContext.empty();
		return result.build();
	};

	hasValueAt = <UR, UC>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
	): boolean => {
		if (undefined !== this.source) return this.source.hasValueAt(row, column);

		const token = Symbol();
		return token !== this.get(row, column, token);
	};

	hasRowKey = <UR>(row: RelatedTo<R, UR>): boolean => {
		return this.source?.hasRowKey(row) ?? this.rowMap.hasKey(row);
	};

	set = (row: R, column: C, value: V): boolean => {
		this.checkLock();

		let columnBuilder: RMap.Builder<C, V> = undefined as any;

		this.rowMap.modifyAt(row, {
			ifNew: (): RMap.Builder<C, V> => {
				columnBuilder = this.context.columnContext.builder();
				return columnBuilder;
			},
			ifExists: (b): RMap.Builder<C, V> => {
				columnBuilder = b;
				return b;
			},
		});

		let changed = true;

		columnBuilder.modifyAt(column, {
			ifNew: (): V => {
				this._size++;
				return value;
			},
			ifExists: (currentValue): V => {
				if (Object.is(currentValue, value)) changed = false;
				return value;
			},
		});

		if (changed) this.source = undefined;

		return changed;
	};

	addEntry = (entry: readonly [R, C, V]): boolean => {
		return this.set(entry[0], entry[1], entry[2]);
	};

	addEntries = (source: StreamSource<readonly [R, C, V]>): boolean => {
		this.checkLock();

		return Stream.applyFilter(source, { pred: this.set }).count() > 0;
	};

	remove = <UR, UC, O>(
		row: RelatedTo<R, UR>,
		column: RelatedTo<C, UC>,
		otherwise?: OptLazy<O>,
	): V | O => {
		this.checkLock();

		const columnMap = this.rowMap.get(row);
		if (undefined === columnMap) return OptLazy(otherwise) as O;

		if (!this.context.columnContext.isValidKey(column)) {
			return OptLazy(otherwise) as O;
		}

		let removedValue: V | Token = Token;

		columnMap.modifyAt(column, {
			ifExists: (currentValue, remove): typeof remove => {
				removedValue = currentValue;
				this._size--;
				return remove;
			},
		});

		if (columnMap.isEmpty) this.rowMap.removeKey(row);

		if (Token === removedValue) return OptLazy(otherwise) as O;

		this.source = undefined;

		return removedValue;
	};

	removeRow = <UR>(row: RelatedTo<R, UR>): boolean => {
		this.checkLock();

		if (!this.context.rowContext.isValidKey(row)) return false;

		return this.rowMap.modifyAt(row, {
			ifExists: (row, remove): typeof remove => {
				this.source = undefined;
				this._size -= row.size;
				return remove;
			},
		});
	};

	removeRows = <UR>(rows: StreamSource<RelatedTo<R, UR>>): boolean => {
		this.checkLock();

		return Stream.from(rows).filterPure({ pred: this.removeRow }).count() > 0;
	};

	removeEntries = <UR = R, UC = C>(
		entries: StreamSource<[RelatedTo<R, UR>, RelatedTo<C, UC>]>,
	): boolean => {
		this.checkLock();

		const notFound = Symbol();

		return (
			Stream.applyMap(entries, this.remove, notFound).countElement(notFound, {
				negate: true,
			}) > 0
		);
	};

	modifyAt = (
		row: R,
		column: C,
		options: {
			ifNew?: OptLazyOr<V, Token>;
			ifExists?: ((currentValue: V, remove: Token) => V | Token) | V;
		},
	): boolean => {
		this.checkLock();

		let changed = false;

		this.rowMap.modifyAt(row, {
			ifNew: (none) => {
				const { ifNew } = options;

				if (undefined === ifNew) {
					return none;
				}

				const newValue = OptLazyOr<V, Token>(ifNew, none);

				if (newValue === none) {
					return none;
				}

				const rowMap = this.context.columnContext.builder<C, V>();

				rowMap.set(column, newValue);

				changed = true;
				this._size++;

				return rowMap;
			},
			ifExists: (curMap, remove) => {
				const preSize = curMap.size;
				changed = curMap.modifyAt(column, options);

				if (changed) {
					const postSize = curMap.size;

					this._size += postSize - preSize;

					if (postSize <= 0) {
						return remove;
					}
				}

				return curMap;
			},
		});

		if (changed) {
			this.source = undefined;
		}

		return changed;
	};

	updateAt = <O>(
		row: R,
		column: C,
		update: Update<V>,
		otherwise?: OptLazy<O>,
	): V | O => {
		this.checkLock();

		let oldValue: V;
		let found = false;

		this.modifyAt(row, column, {
			ifExists: (value): V => {
				oldValue = value;
				found = true;
				return Update(value, update);
			},
		});

		if (!found) return OptLazy(otherwise) as O;

		this.source = undefined;

		return oldValue!;
	};

	forEach = (
		f: (entry: [R, C, V], index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void => {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		this._lock++;

		if (undefined !== this.source) {
			this.source.forEach(f, { state });
		} else {
			const { halt } = state;

			this.rowMap.forEach(([rowKey, column], _, rowHalt): void => {
				column.forEach(([columnKey, value], _, columnHalt): void => {
					f([rowKey, columnKey, value], state.nextIndex(), halt);
					if (state.halted) {
						rowHalt();
						columnHalt();
					}
				});
			});
		}

		this._lock--;
	};

	build = (): Table<R, C, V> => {
		if (undefined !== this.source) return this.source;

		if (this.isEmpty) return this.context.empty();

		return this.context.createNonEmpty<R, C, V>(
			this.rowMap
				.buildMapValues((row) => row.build().assumeNonEmpty())
				.assumeNonEmpty(),
			this.size,
		) as any;
	};

	buildMapValues = <V2>(
		mapFun: (value: V, row: R, column: C) => V2,
	): Table<R, C, V2> => {
		if (undefined !== this.source) return this.source.mapValues<V2>(mapFun);

		if (this.isEmpty) return this.context.empty();

		const newRowMap = this.rowMap
			.buildMapValues((row, rowKey) =>
				row
					.buildMapValues((value, columnKey) =>
						mapFun(value, rowKey, columnKey),
					)
					.assumeNonEmpty(),
			)
			.assumeNonEmpty();

		return this.context.createNonEmpty<R, C, V2>(newRowMap, this.size);
	};
}
