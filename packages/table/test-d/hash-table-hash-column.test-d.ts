import { expectTypeOf } from 'bun:test';

import type { ArrayNonEmpty, WithValueResult } from '@rimbu/common/types';
import type { HashMap } from '@rimbu/hashed/map';
import type { FastIterator, Stream } from '@rimbu/stream';
import type { HashTableHashColumn } from '@rimbu/table/hash-row/hash-column';

type GE<R, C, V> = HashTableHashColumn<R, C, V>;
type GNE<R, C, V> = HashTableHashColumn.NonEmpty<R, C, V>;

type G_Empty = GE<number, string, boolean>;
type G_NonEmpty = GNE<number, string, boolean>;

type Context = HashTableHashColumn.Context<number, string>;
type RowType = HashMap<string, boolean>;
type RowType_NE = HashMap.NonEmpty<string, boolean>;
type Builder = HashTableHashColumn.Builder<number, string, boolean>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectTypeOf(genNonEmpty).toExtend<G_Empty>();
expectTypeOf(genNonEmpty).toExtend<G_NonEmpty>();
expectTypeOf(genEmpty).not.toExtend<G_NonEmpty>();

// Test variance
expectTypeOf(genEmpty).not.toExtend<GE<number | string, string, boolean>>();
expectTypeOf(genEmpty).not.toExtend<GE<number, string | boolean, boolean>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number | string, string, boolean>>();
expectTypeOf(genNonEmpty).not.toExtend<
	GNE<number, string | boolean, boolean>
>();

let m!: any;
expectTypeOf(m as GE<number | string, string, boolean>).not.toExtend<G_Empty>();
expectTypeOf(m as GE<number, string | number, boolean>).not.toExtend<G_Empty>();
expectTypeOf(m as GE<number, string, boolean | number>).not.toExtend<G_Empty>();
expectTypeOf(
	m as GNE<number | string, string, boolean>,
).not.toExtend<G_NonEmpty>();
expectTypeOf(
	m as GNE<number, string | number, boolean>,
).not.toExtend<G_NonEmpty>();
expectTypeOf(
	m as GNE<number, string, boolean | number>,
).not.toExtend<G_NonEmpty>();

// Iterator
expectTypeOf<FastIterator<[number, string, boolean]>>(
	genEmpty[Symbol.iterator](),
);
expectTypeOf<FastIterator<[number, string, boolean]>>(
	genNonEmpty[Symbol.iterator](),
);

// .addEntries(..)
expectTypeOf(genEmpty.addEntries(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addEntries(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntries(genEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntries(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();

// .addEntry(..)
expectTypeOf(genEmpty.addEntry([1, 'a', true])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntry([1, 'a', true])).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<Context>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<Context>();

// .filter(..)
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();

// .filterRows(..)
expectTypeOf(genEmpty.filterRows(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filterRows(() => true)).toEqualTypeOf<G_Empty>();

// .get(..)
expectTypeOf(genEmpty.get(2, 'a')).toEqualTypeOf<boolean | undefined>();
expectTypeOf(genNonEmpty.get(2, 'a')).toEqualTypeOf<boolean | undefined>();
expectTypeOf(genEmpty.get(2, 'a', false)).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.get(2, 'a', false)).toEqualTypeOf<boolean>();

expectTypeOf(genEmpty.get(2, 'a', 'b' as string)).toEqualTypeOf<
	boolean | string
>();
expectTypeOf(genNonEmpty.get(2, 'a', 'b' as string)).toEqualTypeOf<
	boolean | string
>();

// .getRow(..)
expectTypeOf(genEmpty.getRow(2)).toEqualTypeOf<RowType>();
expectTypeOf(genNonEmpty.getRow(2)).toEqualTypeOf<RowType>();

// .isEmpty
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();

// .mapValues(..)
expectTypeOf(genEmpty.mapValues(() => 10)).toEqualTypeOf<
	GE<number, string, number>
>();
expectTypeOf(genNonEmpty.mapValues(() => 10)).toEqualTypeOf<
	GNE<number, string, number>
>();

// .modifyAt(..)
expectTypeOf(genEmpty.modifyAt(2, 'a', {})).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.modifyAt(2, 'a', {})).toEqualTypeOf<G_Empty>();

// .nonEmpty()
expectTypeOf(genEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();

// .remove(..)
expectTypeOf(genEmpty.remove(3, 'a')).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.remove(3, 'a')).toEqualTypeOf<G_Empty>();

// .removeAndGet(..)
expectTypeOf(genEmpty.removeAndGet(3, 'a')).toEqualTypeOf<
	WithValueResult<G_Empty, boolean>
>();
expectTypeOf(genNonEmpty.removeAndGet(3, 'a')).toEqualTypeOf<
	WithValueResult<G_Empty, boolean, G_NonEmpty>
>();

// .removeEntries(..)
expectTypeOf(genEmpty.removeEntries([[3, 'a']])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeEntries([[3, 'a']])).toEqualTypeOf<G_Empty>();

// .removeRow(..)
expectTypeOf(genEmpty.removeRow(3)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeRow(3)).toEqualTypeOf<G_Empty>();

// .removeRowAndGet(..)
expectTypeOf(genEmpty.removeRowAndGet(3)).toEqualTypeOf<
	WithValueResult<G_Empty, RowType_NE>
>();
expectTypeOf(genNonEmpty.removeRowAndGet(3)).toEqualTypeOf<
	WithValueResult<G_Empty, RowType_NE, G_NonEmpty>
>();

// .removeRows(..)
expectTypeOf(genEmpty.removeRows([3])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeRows([3])).toEqualTypeOf<G_Empty>();

// .rowMap
expectTypeOf(genEmpty.rowMap).toExtend<HashMap<number, RowType_NE>>();
expectTypeOf(genNonEmpty.rowMap).toExtend<
	HashMap.NonEmpty<number, RowType_NE>
>();

// .set(..)
expectTypeOf(genEmpty.set(1, 'a', true)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.set(1, 'a', true)).toEqualTypeOf<G_NonEmpty>();

// .stream()
expectTypeOf(genEmpty.stream()).toEqualTypeOf<
	Stream<[number, string, boolean]>
>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<[number, string, boolean]>
>();

// .streamRows()
expectTypeOf(genEmpty.streamRows()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.streamRows()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .streamValues()
expectTypeOf(genEmpty.streamValues()).toEqualTypeOf<Stream<boolean>>();
expectTypeOf(genNonEmpty.streamValues()).toEqualTypeOf<
	Stream.NonEmpty<boolean>
>();

// .toArray()
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<[number, string, boolean][]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<[number, string, boolean]>
>();

// .toBuilder()
expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<Builder>();
expectTypeOf(genNonEmpty.toBuilder()).toEqualTypeOf<Builder>();

// .updateAt(..)
expectTypeOf(genEmpty.updateAt(2, 'b', () => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(
	genNonEmpty.updateAt(2, 'b', () => true),
).toEqualTypeOf<G_NonEmpty>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
