import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { RelatedTo } from '@rimbu/common/types';
import type { StreamSource } from '@rimbu/stream';
import type { Table } from '@rimbu/table';

import type { TableContext } from '#table/context';

import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { OptLazy as OptLazyValue } from '@rimbu/common/opt-lazy';
import { Stream } from '@rimbu/stream';

type TableTypes<R, C, V> = Collection.Advanced.Types<
	Table.Advanced.Family<R, C, V>,
	readonly [R, C, V]
>;

/**
 * The empty table.
 *
 * Every mutator is a no-op returning `this`, which is what lets the context hand
 * out a frozen singleton. The shared `CollectionEmpty` base supplies `isEmpty`,
 * `size`, `asNormal`, `nonEmpty`, `assumeNonEmpty`, `stream`, `forEach`,
 * `forEachIndexed`, `filter`, `filterIndexed`, `toArray`, `mutate` and
 * `toBuilder` — so only the 2-dimensional operations are implemented here.
 */
export class TableEmpty<
	R,
	C,
	V,
	Tp extends TableTypes<R, C, V> = TableTypes<R, C, V>,
> extends CollectionEmpty.Constructor<
	readonly [R, C, V],
	Table.Advanced.Family<R, C, V>,
	Tp
> {
	constructor(readonly context: TableContext<R, C>) {
		super(context);
	}

	set(row: R, column: C, value: V): Tp['_NON_EMPTY'] {
		const columnMap = this.context.createColumnMap<V>(column, value);
		const rowMap = this.context.createRowMap<V>(row, columnMap);

		// The single-cell case builds its row and column maps by hand rather than
		// through `modify`: the table is empty, so there is nothing to modify. The
		// row map is forced to its `NonEmpty` shape — one row with one column is
		// non-empty by construction — which is what makes the inner
		// `MapCollection.NonEmpty` in `rowMap` an invariant of the storage.
		//
		return this.context.createNonEmpty<R, C, V>(rowMap.assumeNonEmpty(), 1);
	}

	get rowMap(): MapCollection<R, MapCollection.NonEmpty<C, V>> {
		return this.context.rowContext.empty() as any;
	}

	get amountRows(): 0 {
		return 0;
	}

	streamRows(): Stream<R> {
		return Stream.empty();
	}

	/**
	 * The empty table has no cells, so no values.
	 *
	 * Note the shared `CollectionEmpty` base does **not** supply this: `streamValues`
	 * is part of the package-local `WithRowMap` capability, so every implementation
	 * has to provide it. That is exactly the kind of hole a capability declared only
	 * on the interface can open — `tsc` is satisfied while the runtime throws.
	 */
	streamValues(): Stream<V> {
		return Stream.empty();
	}

	get<UR, UC, O>(
		_row: RelatedTo<R, UR>,
		_column: RelatedTo<C, UC>,
		otherwise?: OptLazy<O>,
	): O {
		return OptLazyValue(otherwise) as O;
	}

	getRow<UR>(_row: RelatedTo<R, UR>): MapCollection<C, V> {
		return this.context.columnContext.empty() as any;
	}

	has(): false {
		return false;
	}

	hasRow(): false {
		return false;
	}

	add(cell: readonly [R, C, V]): Tp['_NON_EMPTY'] {
		return this.set(cell[0], cell[1], cell[2]);
	}

	addEach(cells: StreamSource<readonly [R, C, V]>): Tp['_SELF'] {
		return this.context.from(cells) as any;
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

	removeEach(): this {
		return this;
	}

	modify(row: R, column: C, options: ModifyOptions<V>): Tp['_NORMAL'] {
		if (checkEmptyModifyOptions(options)) return this as any;

		const { ifNew } = options;
		if (undefined === ifNew) return this as any;

		const { set, create } = ifNew;
		const token = Symbol();
		const newValue = create !== undefined ? create(token) : set;

		if (token === newValue) return this as any;

		return this.set(row, column, newValue) as any;
	}

	update(): this {
		return this;
	}

	filterRows(): this {
		return this;
	}

	mapValues<V2>(): Tp['_SELF'] {
		return this as any;
	}

	toBuilder(): Tp['_BUILDER'] {
		return this.context.builder<readonly [R, C, V]>() as any;
	}

	toString(): string {
		return `${this.context.typeTag}()`;
	}
}
