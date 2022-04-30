import type { RMap, VariantMap } from '@rimbu/collection-types';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { FastIterator, Stream } from '@rimbu/stream';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';
import type { MultiSet, VariantMultiSet } from '@rimbu/multiset';

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
expectType<G_NonEmpty>(genNonEmpty.add(1, 1));
expectType<G_Empty>(genEmpty.add(1, 0));
expectType<G_NonEmpty>(genNonEmpty.add(1, 0));
// TODO
// expectType<G_NonEmpty>(genEmpty.add(1, 1));

// .addAll(..)
expectType<G_NonEmpty>(genEmpty.addAll([1, 2, 3]));
expectType<G_NonEmpty>(genNonEmpty.addAll([1, 2, 3]));

// .addEntries(..)
expectType<G_Empty>(genEmpty.addEntries([]));
expectType<G_Empty>(genEmpty.addEntries([[1, 1]]));
expectType<G_NonEmpty>(genNonEmpty.addEntries([]));
expectType<G_NonEmpty>(genNonEmpty.addEntries([[1, 1]]));

// .assumeNonEmpty()
expectType<V_NonEmpty>(varEmpty.assumeNonEmpty());
expectType<V_NonEmpty>(varNonEmpty.assumeNonEmpty());
expectType<G_NonEmpty>(genEmpty.assumeNonEmpty());
expectType<G_NonEmpty>(genNonEmpty.assumeNonEmpty());

// .context
expectType<MultiSet.Context<number>>(genEmpty.context);
expectType<MultiSet.Context<number>>(genNonEmpty.context);

// .filterEntries
expectType<V_Empty>(varEmpty.filterEntries(() => true));
expectType<V_Empty>(varNonEmpty.filterEntries(() => true));
expectType<G_Empty>(genEmpty.filterEntries(() => true));
expectType<G_Empty>(genNonEmpty.filterEntries(() => true));

// .isEmpty
expectType<boolean>(varEmpty.isEmpty);
expectType<false>(varNonEmpty.isEmpty);
expectType<boolean>(genEmpty.isEmpty);
expectType<false>(genNonEmpty.isEmpty);

// .keyMap
expectType<VariantMap<number, number>>(varEmpty.countMap);
expectType<VariantMap.NonEmpty<number, number>>(varNonEmpty.countMap);
expectType<RMap<number, number>>(genEmpty.countMap);
expectAssignable<RMap.NonEmpty<number, number>>(genNonEmpty.countMap);

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

expectType<V_Empty>(varEmpty.remove(3, 3));
expectType<V_Empty>(varNonEmpty.remove(3, 3));
expectType<G_Empty>(genEmpty.remove(3, 3));
expectType<G_Empty>(genNonEmpty.remove(3, 3));

// .removeAll(..)
expectType<V_Empty>(varEmpty.removeAllEvery([3, 4]));
expectType<V_Empty>(varNonEmpty.removeAllEvery([3, 4]));
expectType<G_Empty>(genEmpty.removeAllEvery([3, 4]));
expectType<G_Empty>(genNonEmpty.removeAllEvery([3, 4]));

// .setCount(..)
expectType<G_Empty>(genEmpty.setCount(3, 3));
expectType<G_Empty>(genNonEmpty.setCount(3, 3));

// .stream()
expectType<Stream<number>>(varEmpty.stream());
expectType<Stream.NonEmpty<number>>(varNonEmpty.stream());
expectType<Stream<number>>(genEmpty.stream());
expectType<Stream.NonEmpty<number>>(genNonEmpty.stream());

// .streamDistinct();
expectType<Stream<number>>(varEmpty.streamDistinct());
expectType<Stream.NonEmpty<number>>(varNonEmpty.streamDistinct());
expectType<Stream<number>>(genEmpty.streamDistinct());
expectType<Stream.NonEmpty<number>>(genNonEmpty.streamDistinct());

// .toArray()
expectType<number[]>(varEmpty.toArray());
expectType<ArrayNonEmpty<number>>(varNonEmpty.toArray());
expectType<number[]>(genEmpty.toArray());
expectType<ArrayNonEmpty<number>>(genNonEmpty.toArray());

// .toBuilder()
expectType<MultiSet.Builder<number>>(genEmpty.toBuilder());
expectType<MultiSet.Builder<number>>(genNonEmpty.toBuilder());

// From Builder
expectType<G_Empty>(genEmpty.toBuilder().build());
