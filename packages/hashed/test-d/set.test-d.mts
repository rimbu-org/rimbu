import type { RSet } from '@rimbu/collection-types';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { HashSet } from '@rimbu/hashed';
import type { FastIterator, Stream } from '@rimbu/stream';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';

type GE<T> = HashSet<T>;
type GNE<T> = HashSet.NonEmpty<T>;

type G_Empty = GE<number>;
type G_NonEmpty = GNE<number>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectAssignable<G_Empty>(genNonEmpty);
expectAssignable<G_NonEmpty>(genNonEmpty);
expectNotAssignable<G_NonEmpty>(genEmpty);

expectAssignable<RSet<number>>(genEmpty);
expectNotAssignable<RSet.NonEmpty<number>>(genEmpty);
expectAssignable<RSet<number>>(genNonEmpty);
expectAssignable<RSet.NonEmpty<number>>(genNonEmpty);

// Test variance
expectNotAssignable<GE<number | string>>(genEmpty);
expectNotAssignable<GNE<number | string>>(genNonEmpty);

let m!: any;

expectNotAssignable<G_Empty>(m as GE<number | string>);
expectNotAssignable<G_NonEmpty>(m as GNE<number | string>);

// Iterator
expectType<FastIterator<number>>(genEmpty[Symbol.iterator]());
expectType<FastIterator<number>>(genNonEmpty[Symbol.iterator]());

// .add(..)
expectType<G_NonEmpty>(genEmpty.add(1));
expectType<G_NonEmpty>(genNonEmpty.add(1));

// .addAll(..)
expectType<G_NonEmpty>(genEmpty.addAll([1, 2, 3]));
expectType<G_NonEmpty>(genNonEmpty.addAll([1, 2, 3]));

// .assumeNonEmpty()
expectType<G_NonEmpty>(genEmpty.assumeNonEmpty());
expectType<G_NonEmpty>(genNonEmpty.assumeNonEmpty());

// .context
expectType<HashSet.Context<number>>(genEmpty.context);
expectType<HashSet.Context<number>>(genNonEmpty.context);

// .difference(..)
expectType<G_Empty>(genEmpty.difference(genEmpty));
expectType<G_Empty>(genNonEmpty.difference(genEmpty));
expectType<G_Empty>(genEmpty.difference(genNonEmpty));
expectType<G_Empty>(genNonEmpty.difference(genNonEmpty));

// .filter(..)
expectType<G_Empty>(genEmpty.filter(() => true));
expectType<G_Empty>(genNonEmpty.filter(() => true));

// .intersect(..)
expectType<G_Empty>(genEmpty.intersect(genEmpty));
expectType<G_Empty>(genNonEmpty.intersect(genEmpty));
expectType<G_Empty>(genEmpty.intersect(genNonEmpty));
expectType<G_Empty>(genNonEmpty.intersect(genNonEmpty));

// .isEmpty
expectType<boolean>(genEmpty.isEmpty);
expectType<false>(genNonEmpty.isEmpty);

// .nonEmpty()
expectType<boolean>(genEmpty.nonEmpty());
expectType<true>(genNonEmpty.nonEmpty());

// .remove(..)
expectType<G_Empty>(genEmpty.remove(3));
expectType<G_Empty>(genNonEmpty.remove(3));

// .removeAll(..)
expectType<G_Empty>(genEmpty.removeAll([3, 4]));
expectType<G_Empty>(genNonEmpty.removeAll([3, 4]));

// .stream()
expectType<Stream<number>>(genEmpty.stream());
expectType<Stream.NonEmpty<number>>(genNonEmpty.stream());

// .symDifference(..)
expectType<G_Empty>(genEmpty.symDifference(genEmpty));
expectType<G_Empty>(genNonEmpty.symDifference(genEmpty));
expectType<G_Empty>(genEmpty.symDifference(genNonEmpty));
expectType<G_Empty>(genNonEmpty.symDifference(genNonEmpty));

// .toArray()
expectType<number[]>(genEmpty.toArray());
expectType<ArrayNonEmpty<number>>(genNonEmpty.toArray());

// .union(..)
expectType<G_Empty>(genEmpty.union(genEmpty));
expectType<G_NonEmpty>(genEmpty.union(genNonEmpty));
expectType<G_NonEmpty>(genNonEmpty.union(genEmpty));
expectType<G_NonEmpty>(genNonEmpty.union(genNonEmpty));

// From Builder
expectType<G_Empty>(genEmpty.toBuilder().build());
