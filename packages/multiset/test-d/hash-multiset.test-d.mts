import type { ArrayNonEmpty } from '@rimbu/common';
import type { HashMap } from '@rimbu/hashed';
import type { FastIterator, Stream } from '@rimbu/stream';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';

import type { HashMultiSet } from '../src/main/index.mjs';

type GE<T> = HashMultiSet<T>;
type GNE<T> = HashMultiSet.NonEmpty<T>;

type G_Empty = GE<number>;
type G_NonEmpty = GNE<number>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectAssignable<G_Empty>(genNonEmpty);
expectAssignable<G_NonEmpty>(genNonEmpty);
expectNotAssignable<G_NonEmpty>(genEmpty);

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
expectType<G_NonEmpty>(genEmpty.assumeNonEmpty());
expectType<G_NonEmpty>(genNonEmpty.assumeNonEmpty());

// .context
expectType<HashMultiSet.Context<number>>(genEmpty.context);
expectType<HashMultiSet.Context<number>>(genNonEmpty.context);

// .filterEntries
expectType<G_Empty>(genEmpty.filterEntries(() => true));
expectType<G_Empty>(genNonEmpty.filterEntries(() => true));

// .isEmpty
expectType<boolean>(genEmpty.isEmpty);
expectType<false>(genNonEmpty.isEmpty);

// .countMap
expectType<HashMap<number, number>>(genEmpty.countMap);
expectAssignable<HashMap.NonEmpty<number, number>>(genNonEmpty.countMap);

// .nonEmpty()
expectType<boolean>(genEmpty.nonEmpty());
expectType<true>(genNonEmpty.nonEmpty());

// .remove(..)
expectType<G_Empty>(genEmpty.remove(3));
expectType<G_Empty>(genNonEmpty.remove(3));

expectType<G_Empty>(genEmpty.remove(3, { amount: 3 }));
expectType<G_Empty>(genNonEmpty.remove(3, { amount: 3 }));

// .removeAllEvery(..)
expectType<G_Empty>(genEmpty.removeAllEvery([3, 4]));
expectType<G_Empty>(genNonEmpty.removeAllEvery([3, 4]));

// .removeAllSingle(..)
expectType<G_Empty>(genEmpty.removeAllSingle([3, 4]));
expectType<G_Empty>(genNonEmpty.removeAllSingle([3, 4]));

// .setCount(..)
expectType<G_Empty>(genEmpty.setCount(3, 3));
expectType<G_Empty>(genNonEmpty.setCount(3, 3));

// .stream()
expectType<Stream<number>>(genEmpty.stream());
expectType<Stream.NonEmpty<number>>(genNonEmpty.stream());

// .streamDistinct();
expectType<Stream<number>>(genEmpty.streamDistinct());
expectType<Stream.NonEmpty<number>>(genNonEmpty.streamDistinct());

// .toArray()
expectType<number[]>(genEmpty.toArray());
expectType<ArrayNonEmpty<number>>(genNonEmpty.toArray());

// .toBuilder()
expectType<HashMultiSet.Builder<number>>(genEmpty.toBuilder());
expectType<HashMultiSet.Builder<number>>(genNonEmpty.toBuilder());

// From Builder
expectType<G_Empty>(genEmpty.toBuilder().build());
