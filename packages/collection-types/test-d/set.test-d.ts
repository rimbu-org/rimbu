import { expectTypeOf } from 'bun:test';

import type { RSet, VariantSet } from '@rimbu/collection-types';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { FastIterator, Stream } from '@rimbu/stream';

type VE<T> = VariantSet<T>;
type VNE<T> = VariantSet.NonEmpty<T>;
type GE<T> = RSet<T>;
type GNE<T> = RSet.NonEmpty<T>;

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

// .addAll(..)
expectTypeOf(genEmpty.addAll([1, 2, 3])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addAll([1, 2, 3])).toEqualTypeOf<G_NonEmpty>();

// .assumeNonEmpty()
expectTypeOf(varEmpty.assumeNonEmpty()).toEqualTypeOf<V_NonEmpty>();
expectTypeOf(varNonEmpty.assumeNonEmpty()).toEqualTypeOf<V_NonEmpty>();
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<RSet.Context<number>>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<RSet.Context<number>>();

// .difference(..)
expectTypeOf(varEmpty.difference(varEmpty)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.difference(varEmpty)).toEqualTypeOf<V_Empty>();
expectTypeOf(varEmpty.difference(varNonEmpty)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.difference(genNonEmpty)).toEqualTypeOf<V_Empty>();

expectTypeOf(genEmpty.difference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.difference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.difference(genNonEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.difference(genNonEmpty)).toEqualTypeOf<G_Empty>();

// .filter(..)
expectTypeOf(varEmpty.filter(() => true)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.filter(() => true)).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();

// .intersect(..)
expectTypeOf(varEmpty.intersect(varEmpty)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.intersect(varEmpty)).toEqualTypeOf<V_Empty>();
expectTypeOf(varEmpty.intersect(varNonEmpty)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.intersect(varNonEmpty)).toEqualTypeOf<V_Empty>();

expectTypeOf(genEmpty.intersect(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.intersect(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.intersect(genNonEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.intersect(genNonEmpty)).toEqualTypeOf<G_Empty>();

// .isEmpty
expectTypeOf(varEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(varNonEmpty.isEmpty).toEqualTypeOf<false>();
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();

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

// .removeAll(..)
expectTypeOf(varEmpty.removeAll([3, 4])).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.removeAll([3, 4])).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.removeAll([3, 4])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeAll([3, 4])).toEqualTypeOf<G_Empty>();

// .stream()
expectTypeOf(varEmpty.stream()).toEqualTypeOf<Stream<number>>();
expectTypeOf(varNonEmpty.stream()).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(genEmpty.stream()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .symDifference(..)
expectTypeOf(genEmpty.symDifference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.symDifference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.symDifference(genNonEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.symDifference(genNonEmpty)).toEqualTypeOf<G_Empty>();

// .toArray()
expectTypeOf(varEmpty.toArray()).toEqualTypeOf<number[]>();
expectTypeOf(varNonEmpty.toArray()).toEqualTypeOf<ArrayNonEmpty<number>>();
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<number[]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<ArrayNonEmpty<number>>();

// .toBuilder()
expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<RSet.Builder<number>>();
expectTypeOf(genNonEmpty.toBuilder()).toEqualTypeOf<RSet.Builder<number>>();

// .union(..)
expectTypeOf(genEmpty.union(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.union(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.union(genEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.union(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
