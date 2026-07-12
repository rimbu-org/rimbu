import { expectTypeOf } from 'bun:test';

import type { RMap, VariantMap } from '@rimbu/collection-types';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { FastIterator, Stream } from '@rimbu/stream';
import type { Table, VariantTable } from '@rimbu/table';

type VE<R, C, V> = VariantTable<R, C, V>;
type VNE<R, C, V> = VariantTable.NonEmpty<R, C, V>;
type GE<R, C, V> = Table<R, C, V>;
type GNE<R, C, V> = Table.NonEmpty<R, C, V>;

type V_Empty = VE<number, string, boolean>;
type V_NonEmpty = VNE<number, string, boolean>;
type G_Empty = GE<number, string, boolean>;
type G_NonEmpty = GNE<number, string, boolean>;

const varEmpty: V_Empty = undefined as any;
const varNonEmpty: V_NonEmpty = undefined as any;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectTypeOf(varNonEmpty).toExtend<V_Empty>();
expectTypeOf(genEmpty).toExtend<V_Empty>();
expectTypeOf(genNonEmpty).toExtend<V_Empty>();

expectTypeOf(genNonEmpty).toExtend<V_NonEmpty>();
expectTypeOf(varEmpty).not.toExtend<V_NonEmpty>();
expectTypeOf(genEmpty).not.toExtend<V_NonEmpty>();

expectTypeOf(genNonEmpty).toExtend<G_Empty>();
expectTypeOf(varEmpty).not.toExtend<G_Empty>();
expectTypeOf(genNonEmpty).toExtend<G_NonEmpty>();
expectTypeOf(varEmpty).not.toExtend<G_NonEmpty>();
expectTypeOf(genEmpty).not.toExtend<G_NonEmpty>();

// Test variance
expectTypeOf(varEmpty).toExtend<VE<number | string, string, boolean>>();
expectTypeOf(varEmpty).toExtend<VE<number, string | boolean, boolean>>();
expectTypeOf(varEmpty).toExtend<
	VE<number | string, string, boolean | number>
>();
expectTypeOf(varEmpty).toExtend<
	VE<number | string, string | boolean, boolean | number>
>();
expectTypeOf(varNonEmpty).toExtend<VNE<number | string, string, boolean>>();
expectTypeOf(varNonEmpty).toExtend<VNE<number, string | boolean, boolean>>();
expectTypeOf(varNonEmpty).toExtend<
	VNE<number | string, string | boolean, boolean>
>();

expectTypeOf(genEmpty).toExtend<
	VE<number | string, string | boolean, boolean>
>();
expectTypeOf(genNonEmpty).toExtend<
	VE<number | string, string | boolean, boolean>
>();
expectTypeOf(genNonEmpty).toExtend<
	VNE<number | string, string | boolean, boolean>
>();

expectTypeOf(genEmpty).not.toExtend<GE<number | string, string, boolean>>();
expectTypeOf(genEmpty).not.toExtend<GE<number, string | boolean, boolean>>();
expectTypeOf(genEmpty).not.toExtend<GE<number, string, boolean | number>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number | string, string, boolean>>();
expectTypeOf(genNonEmpty).not.toExtend<
	GNE<number, string | boolean, boolean>
>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number, string, boolean | number>>();

let m!: any;
expectTypeOf(m as VE<number | string, string, boolean>).not.toExtend<V_Empty>();
expectTypeOf(m as VE<number, string | number, boolean>).not.toExtend<V_Empty>();
expectTypeOf(m as VE<number, string, boolean | number>).not.toExtend<V_Empty>();
expectTypeOf(
	m as VNE<number | string, string, boolean>,
).not.toExtend<V_NonEmpty>();
expectTypeOf(
	m as VNE<number, string | number, boolean>,
).not.toExtend<V_NonEmpty>();
expectTypeOf(
	m as VNE<number, string, boolean | number>,
).not.toExtend<V_NonEmpty>();

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
expectTypeOf(varEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<[number, string, boolean]>
>();
expectTypeOf(varNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<[number, string, boolean]>
>();
expectTypeOf(genEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<[number, string, boolean]>
>();
expectTypeOf(genNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<[number, string, boolean]>
>();

// .addEntries(..)
expectTypeOf(genEmpty.addEntries(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addEntries(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntries(genEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntries(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();

// .addEntry(..)
expectTypeOf(genEmpty.addEntry([1, 'a', true])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntry([1, 'a', true])).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<Table.Context<number, string>>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<
	Table.Context<number, string>
>();

// .filter(..)
expectTypeOf(varEmpty.filter(() => true)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.filter(() => true)).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();

// .filterRows(..)
expectTypeOf(varEmpty.filterRows(() => true)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.filterRows(() => true)).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.filterRows(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filterRows(() => true)).toEqualTypeOf<G_Empty>();

// .get(..)

expectTypeOf(varEmpty.get(2, 'a')).toEqualTypeOf<boolean | undefined>();
expectTypeOf(varNonEmpty.get(2, 'a')).toEqualTypeOf<boolean | undefined>();
expectTypeOf(varEmpty.get(2, 'a', false)).toEqualTypeOf<boolean>();
expectTypeOf(varNonEmpty.get(2, 'a', false)).toEqualTypeOf<boolean>();
expectTypeOf(genEmpty.get(2, 'a')).toEqualTypeOf<boolean | undefined>();
expectTypeOf(genNonEmpty.get(2, 'a')).toEqualTypeOf<boolean | undefined>();
expectTypeOf(genEmpty.get(2, 'a', false)).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.get(2, 'a', false)).toEqualTypeOf<boolean>();

expectTypeOf(varEmpty.get(2, 'a', 'b' as string)).toEqualTypeOf<
	boolean | string
>();
expectTypeOf(varNonEmpty.get(2, 'a', 'b' as string)).toEqualTypeOf<
	boolean | string
>();
expectTypeOf(genEmpty.get(2, 'a', 'b' as string)).toEqualTypeOf<
	boolean | string
>();
expectTypeOf(genNonEmpty.get(2, 'a', 'b' as string)).toEqualTypeOf<
	boolean | string
>();

// .getRow(..)
expectTypeOf(varEmpty.getRow(2)).toEqualTypeOf<VariantMap<string, boolean>>();
expectTypeOf(varNonEmpty.getRow(2)).toEqualTypeOf<
	VariantMap<string, boolean>
>();
expectTypeOf(genEmpty.getRow(2)).toEqualTypeOf<RMap<string, boolean>>();
expectTypeOf(genNonEmpty.getRow(2)).toEqualTypeOf<RMap<string, boolean>>();

// .isEmpty
expectTypeOf(varEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(varNonEmpty.isEmpty).toEqualTypeOf<false>();
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();

// .mapValues(..)
expectTypeOf(varEmpty.mapValues(() => 10)).toEqualTypeOf<
	VariantTable<number, string, number>
>();
expectTypeOf(varNonEmpty.mapValues(() => 10)).toEqualTypeOf<
	VariantTable.NonEmpty<number, string, number>
>();
expectTypeOf(genEmpty.mapValues(() => 10)).toEqualTypeOf<
	Table<number, string, number>
>();
expectTypeOf(genNonEmpty.mapValues(() => 10)).toEqualTypeOf<
	Table.NonEmpty<number, string, number>
>();

// .modifyAt(..)
expectTypeOf(genEmpty.modifyAt(2, 'a', {})).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.modifyAt(2, 'a', {})).toEqualTypeOf<G_Empty>();

// .nonEmpty()
expectTypeOf(varEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(varNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();

// .remove(..)
expectTypeOf(varEmpty.remove(3, 'a')).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.remove(3, 'a')).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.remove(3, 'a')).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.remove(3, 'a')).toEqualTypeOf<G_Empty>();

// .removeAndGet(..)
expectTypeOf(varEmpty.removeAndGet(3, 'a')).toEqualTypeOf<
	[V_Empty, boolean] | undefined
>();
expectTypeOf(varNonEmpty.removeAndGet(3, 'a')).toEqualTypeOf<
	[V_Empty, boolean] | undefined
>();
expectTypeOf(genEmpty.removeAndGet(3, 'a')).toEqualTypeOf<
	[G_Empty, boolean] | undefined
>();
expectTypeOf(genNonEmpty.removeAndGet(3, 'a')).toEqualTypeOf<
	[G_Empty, boolean] | undefined
>();

// .removeEntries(..)
expectTypeOf(varEmpty.removeEntries([[3, 'a']])).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.removeEntries([[3, 'a']])).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.removeEntries([[3, 'a']])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeEntries([[3, 'a']])).toEqualTypeOf<G_Empty>();

// .removeRow(..)
expectTypeOf(varEmpty.removeRow(3)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.removeRow(3)).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.removeRow(3)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeRow(3)).toEqualTypeOf<G_Empty>();

// .removeRowAndGet(..)
expectTypeOf(varEmpty.removeRowAndGet(3)).toEqualTypeOf<
	[V_Empty, VariantMap.NonEmpty<string, boolean>] | undefined
>();
expectTypeOf(varNonEmpty.removeRowAndGet(3)).toEqualTypeOf<
	[V_Empty, VariantMap.NonEmpty<string, boolean>] | undefined
>();
expectTypeOf(genEmpty.removeRowAndGet(3)).toEqualTypeOf<
	[G_Empty, RMap.NonEmpty<string, boolean>] | undefined
>();
expectTypeOf(genNonEmpty.removeRowAndGet(3)).toEqualTypeOf<
	[G_Empty, RMap.NonEmpty<string, boolean>] | undefined
>();

// .removeRows(..)
expectTypeOf(varEmpty.removeRows([3])).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.removeRows([3])).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.removeRows([3])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeRows([3])).toEqualTypeOf<G_Empty>();

// .rowMap
expectTypeOf(genEmpty.rowMap).toEqualTypeOf<
	RMap<number, RMap.NonEmpty<string, boolean>>
>();
expectTypeOf(genNonEmpty.rowMap).toExtend<
	RMap.NonEmpty<number, RMap.NonEmpty<string, boolean>>
>();

// .set(..)
expectTypeOf(genEmpty.set(1, 'a', true)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.set(1, 'a', true)).toEqualTypeOf<G_NonEmpty>();

// .stream()
expectTypeOf(varEmpty.stream()).toEqualTypeOf<
	Stream<[number, string, boolean]>
>();
expectTypeOf(varNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<[number, string, boolean]>
>();
expectTypeOf(genEmpty.stream()).toEqualTypeOf<
	Stream<[number, string, boolean]>
>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<[number, string, boolean]>
>();

// .streamRows()
expectTypeOf(varEmpty.streamRows()).toEqualTypeOf<Stream<number>>();
expectTypeOf(varNonEmpty.streamRows()).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(genEmpty.streamRows()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.streamRows()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .streamValues()
expectTypeOf(varEmpty.streamValues()).toEqualTypeOf<Stream<boolean>>();
expectTypeOf(varNonEmpty.streamValues()).toEqualTypeOf<
	Stream.NonEmpty<boolean>
>();
expectTypeOf(genEmpty.streamValues()).toEqualTypeOf<Stream<boolean>>();
expectTypeOf(genNonEmpty.streamValues()).toEqualTypeOf<
	Stream.NonEmpty<boolean>
>();

// .toArray()
expectTypeOf(varEmpty.toArray()).toEqualTypeOf<[number, string, boolean][]>();
expectTypeOf(varNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<[number, string, boolean]>
>();
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<[number, string, boolean][]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<[number, string, boolean]>
>();

// .toBuilder()
expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<
	Table.Builder<number, string, boolean>
>();
expectTypeOf(genNonEmpty.toBuilder()).toEqualTypeOf<
	Table.Builder<number, string, boolean>
>();

// .updateAt(..)
expectTypeOf(genEmpty.updateAt(2, 'b', () => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(
	genNonEmpty.updateAt(2, 'b', () => true),
).toEqualTypeOf<G_NonEmpty>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
