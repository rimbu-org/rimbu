import type { ArrayNonEmpty } from '@rimbu/common';
import type { FastIterator, Stream } from '@rimbu/stream';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';

import type { RSet, VariantSet } from '../src/main/index.mjs';

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

expectAssignable<V_Empty>(varNonEmpty);
expectAssignable<V_Empty>(genEmpty);
expectAssignable<V_Empty>(genNonEmpty);

expectAssignable<V_NonEmpty>(genNonEmpty);
expectNotAssignable<V_NonEmpty>(varEmpty);
expectNotAssignable<V_NonEmpty>(genEmpty);

expectAssignable<G_Empty>(genNonEmpty);
expectNotAssignable<G_Empty>(varEmpty);
expectAssignable<G_NonEmpty>(genNonEmpty);
expectNotAssignable<G_NonEmpty>(varEmpty);

// Test variance
expectAssignable<VE<number | string>>(varEmpty);
expectAssignable<VNE<number | string>>(varNonEmpty);

expectAssignable<VE<number | string>>(genEmpty);
expectAssignable<VE<number | string>>(genNonEmpty);

expectNotAssignable<GE<number | string>>(genEmpty);
expectNotAssignable<GNE<number | string>>(genNonEmpty);

let m!: any;
expectNotAssignable<V_Empty>(m as VE<number | string>);
expectNotAssignable<V_NonEmpty>(m as VNE<number | string>);

expectNotAssignable<G_Empty>(m as GE<number | string>);
expectNotAssignable<G_NonEmpty>(m as GNE<number | string>);

// Iterator
expectType<FastIterator<number>>(varEmpty[Symbol.iterator]());
expectType<FastIterator<number>>(varNonEmpty[Symbol.iterator]());
expectType<FastIterator<number>>(genEmpty[Symbol.iterator]());
expectType<FastIterator<number>>(genNonEmpty[Symbol.iterator]());

// .add(..)
expectType<G_NonEmpty>(genEmpty.add(1));
expectType<G_NonEmpty>(genNonEmpty.add(1));

// .addAll(..)
expectType<G_NonEmpty>(genEmpty.addAll([1, 2, 3]));
expectType<G_NonEmpty>(genNonEmpty.addAll([1, 2, 3]));

// .assumeNonEmpty()
expectType<V_NonEmpty>(varEmpty.assumeNonEmpty());
expectType<V_NonEmpty>(varNonEmpty.assumeNonEmpty());
expectType<G_NonEmpty>(genEmpty.assumeNonEmpty());
expectType<G_NonEmpty>(genNonEmpty.assumeNonEmpty());

// .context
expectType<RSet.Context<number>>(genEmpty.context);
expectType<RSet.Context<number>>(genNonEmpty.context);

// .difference(..)
expectType<V_Empty>(varEmpty.difference(varEmpty));
expectType<V_Empty>(varNonEmpty.difference(varEmpty));
expectType<V_Empty>(varEmpty.difference(varNonEmpty));
expectType<V_Empty>(varNonEmpty.difference(genNonEmpty));

expectType<G_Empty>(genEmpty.difference(genEmpty));
expectType<G_Empty>(genNonEmpty.difference(genEmpty));
expectType<G_Empty>(genEmpty.difference(genNonEmpty));
expectType<G_Empty>(genNonEmpty.difference(genNonEmpty));

// .filter(..)
expectType<V_Empty>(varEmpty.filter(() => true));
expectType<V_Empty>(varNonEmpty.filter(() => true));
expectType<G_Empty>(genEmpty.filter(() => true));
expectType<G_Empty>(genNonEmpty.filter(() => true));

// .intersect(..)
expectType<V_Empty>(varEmpty.intersect(varEmpty));
expectType<V_Empty>(varNonEmpty.intersect(varEmpty));
expectType<V_Empty>(varEmpty.intersect(varNonEmpty));
expectType<V_Empty>(varNonEmpty.intersect(varNonEmpty));

expectType<G_Empty>(genEmpty.intersect(genEmpty));
expectType<G_Empty>(genNonEmpty.intersect(genEmpty));
expectType<G_Empty>(genEmpty.intersect(genNonEmpty));
expectType<G_Empty>(genNonEmpty.intersect(genNonEmpty));

// .isEmpty
expectType<boolean>(varEmpty.isEmpty);
expectType<false>(varNonEmpty.isEmpty);
expectType<boolean>(genEmpty.isEmpty);
expectType<false>(genNonEmpty.isEmpty);

// .nonEmpty()
expectType<boolean>(varEmpty.nonEmpty());
expectType<true>(varNonEmpty.nonEmpty());
expectType<boolean>(genEmpty.nonEmpty());
expectType<true>(genNonEmpty.nonEmpty());

// .remove(..)
expectType<V_Empty>(varEmpty.remove(3));
expectType<V_Empty>(varNonEmpty.remove(3));
expectType<G_Empty>(genEmpty.remove(3));
expectType<G_Empty>(genNonEmpty.remove(3));

// .removeAll(..)
expectType<V_Empty>(varEmpty.removeAll([3, 4]));
expectType<V_Empty>(varNonEmpty.removeAll([3, 4]));
expectType<G_Empty>(genEmpty.removeAll([3, 4]));
expectType<G_Empty>(genNonEmpty.removeAll([3, 4]));

// .stream()
expectType<Stream<number>>(varEmpty.stream());
expectType<Stream.NonEmpty<number>>(varNonEmpty.stream());
expectType<Stream<number>>(genEmpty.stream());
expectType<Stream.NonEmpty<number>>(genNonEmpty.stream());

// .symDifference(..)
expectType<G_Empty>(genEmpty.symDifference(genEmpty));
expectType<G_Empty>(genNonEmpty.symDifference(genEmpty));
expectType<G_Empty>(genEmpty.symDifference(genNonEmpty));
expectType<G_Empty>(genNonEmpty.symDifference(genNonEmpty));

// .toArray()
expectType<number[]>(varEmpty.toArray());
expectType<ArrayNonEmpty<number>>(varNonEmpty.toArray());
expectType<number[]>(genEmpty.toArray());
expectType<ArrayNonEmpty<number>>(genNonEmpty.toArray());

// .toBuilder()
expectType<RSet.Builder<number>>(genEmpty.toBuilder());
expectType<RSet.Builder<number>>(genNonEmpty.toBuilder());

// .union(..)
expectType<G_Empty>(genEmpty.union(genEmpty));
expectType<G_NonEmpty>(genEmpty.union(genNonEmpty));
expectType<G_NonEmpty>(genNonEmpty.union(genEmpty));
expectType<G_NonEmpty>(genNonEmpty.union(genNonEmpty));

// From Builder
expectType<G_Empty>(genEmpty.toBuilder().build());
