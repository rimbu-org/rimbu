import { expectTypeOf } from 'bun:test';

import type { RMap, VariantMap } from '@rimbu/collection-types';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { MultiSet } from '@rimbu/multiset';
import type { VariantMultiSet } from '@rimbu/multiset/variant';
import type { FastIterator, Stream } from '@rimbu/stream';

type VE<T> = VariantMultiSet<T>;
type VNE<T> = VariantMultiSet.NonEmpty<T>;
type GE<T> = MultiSet<T>;
type GNE<T> = MultiSet.NonEmpty<T>;

type V_Empty = VE<number>;
type V_NonEmpty = VNE<number>;
type G_Empty = GE<number>;
type G_NonEmpty = GNE<number>;

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

// Test variance
expectTypeOf(varEmpty).toExtend<VE<number | string>>();
expectTypeOf(varNonEmpty).toExtend<VNE<number | string>>();

expectTypeOf(genEmpty).toExtend<VE<number | string>>();
expectTypeOf(genNonEmpty).toExtend<VE<number | string>>();

expectTypeOf(genEmpty).not.toExtend<GE<number | string>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number | string>>();

let m!: any;
expectTypeOf(m as VE<number | string>).not.toExtend<V_Empty>();
expectTypeOf(m as VNE<number | string>).not.toExtend<V_NonEmpty>();

expectTypeOf(m as GE<number | string>).not.toExtend<G_Empty>();
expectTypeOf(m as GNE<number | string>).not.toExtend<G_NonEmpty>();

// Iterator
expectTypeOf(varEmpty[Symbol.iterator]()).toEqualTypeOf<FastIterator<number>>();
expectTypeOf(varNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<number>
>();
expectTypeOf(genEmpty[Symbol.iterator]()).toEqualTypeOf<FastIterator<number>>();
expectTypeOf(genNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<number>
>();

// .add(..)
expectTypeOf(genEmpty.add(1)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.add(1)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.add(1, 1)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genEmpty.add(1, 0)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.add(1, 0)).toEqualTypeOf<G_NonEmpty>();
// TODO
// expectType<G_NonEmpty>(genEmpty.add(1, 1));

// .addAll(..)
expectTypeOf(genEmpty.addAll([1, 2, 3])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addAll([1, 2, 3])).toEqualTypeOf<G_NonEmpty>();

// .addAllWithCounts(..)
expectTypeOf(genEmpty.addAllWithCounts([])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addAllWithCounts([[1, 1]])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.addAllWithCounts([])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addAllWithCounts([[1, 1]])).toEqualTypeOf<G_NonEmpty>();

// .assumeNonEmpty()
expectTypeOf(varEmpty.assumeNonEmpty()).toEqualTypeOf<V_NonEmpty>();
expectTypeOf(varNonEmpty.assumeNonEmpty()).toEqualTypeOf<V_NonEmpty>();
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<MultiSet.Context<number>>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<MultiSet.Context<number>>();

// .filterWithCounts
expectTypeOf(varEmpty.filterWithCounts(() => true)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.filterWithCounts(() => true)).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.filterWithCounts(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filterWithCounts(() => true)).toEqualTypeOf<G_Empty>();

// .isEmpty
expectTypeOf(varEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(varNonEmpty.isEmpty).toEqualTypeOf<false>();
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();

// .keyMap
expectTypeOf(varEmpty.countMap).toEqualTypeOf<VariantMap<number, number>>();
expectTypeOf(varNonEmpty.countMap).toEqualTypeOf<
	VariantMap.NonEmpty<number, number>
>();
expectTypeOf(genEmpty.countMap).toEqualTypeOf<RMap<number, number>>();
expectTypeOf(genNonEmpty.countMap).toExtend<RMap.NonEmpty<number, number>>();

// .nonEmpty()
expectTypeOf(varEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(varNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();

// .remove(..)

expectTypeOf(varEmpty.remove(3)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.remove(3)).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.remove(3)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.remove(3)).toEqualTypeOf<G_Empty>();

expectTypeOf(varEmpty.remove(3, { amount: 3 })).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.remove(3, { amount: 3 })).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.remove(3, { amount: 3 })).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.remove(3, { amount: 3 })).toEqualTypeOf<G_Empty>();

// .removeAll(..)
expectTypeOf(varEmpty.removeAll([3, 4])).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.removeAll([3, 4])).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.removeAll([3, 4])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeAll([3, 4])).toEqualTypeOf<G_Empty>();
expectTypeOf(varEmpty.removeAll([3, 4], { amount: 1 })).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.removeAll([3, 4], { amount: 1 })).toEqualTypeOf<G_Empty>();

// .setCount(..)
expectTypeOf(genEmpty.setCount(3, 3)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.setCount(3, 3)).toEqualTypeOf<G_Empty>();

// .stream()
expectTypeOf(varEmpty.stream()).toEqualTypeOf<Stream<number>>();
expectTypeOf(varNonEmpty.stream()).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(genEmpty.stream()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .streamDistinct();
expectTypeOf(varEmpty.streamDistinct()).toEqualTypeOf<Stream<number>>();
expectTypeOf(varNonEmpty.streamDistinct()).toEqualTypeOf<
	Stream.NonEmpty<number>
>();
expectTypeOf(genEmpty.streamDistinct()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.streamDistinct()).toEqualTypeOf<
	Stream.NonEmpty<number>
>();

// .streamWithCounts();
expectTypeOf(varEmpty.streamWithCounts()).toEqualTypeOf<
	Stream<readonly [number, number]>
>();
expectTypeOf(varNonEmpty.streamWithCounts()).toEqualTypeOf<
	Stream.NonEmpty<readonly [number, number]>
>();
expectTypeOf(genEmpty.streamWithCounts()).toEqualTypeOf<
	Stream<readonly [number, number]>
>();
expectTypeOf(genNonEmpty.streamWithCounts()).toEqualTypeOf<
	Stream.NonEmpty<readonly [number, number]>
>();

// .union(..)
expectTypeOf(genEmpty.union(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.union(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.union(genEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.union(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();

// .toArray()
expectTypeOf(varEmpty.toArray()).toEqualTypeOf<number[]>();
expectTypeOf(varNonEmpty.toArray()).toEqualTypeOf<ArrayNonEmpty<number>>();
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<number[]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<ArrayNonEmpty<number>>();

// .toBuilder()
expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<MultiSet.Builder<number>>();
expectTypeOf(genNonEmpty.toBuilder()).toEqualTypeOf<MultiSet.Builder<number>>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
