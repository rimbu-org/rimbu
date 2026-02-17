import { expectTypeOf } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { HashMap } from '@rimbu/hashed/map';
import type { HashMultiSet } from '@rimbu/multiset/hashed';
import type { FastIterator, Stream } from '@rimbu/stream';

type GE<T> = HashMultiSet<T>;
type GNE<T> = HashMultiSet.NonEmpty<T>;

type G_Empty = GE<number>;
type G_NonEmpty = GNE<number>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectTypeOf(genNonEmpty).toExtend<G_Empty>();
expectTypeOf(genNonEmpty).toExtend<G_NonEmpty>();
expectTypeOf(genEmpty).not.toExtend<G_NonEmpty>();

// Test variance
expectTypeOf(genEmpty).not.toExtend<GE<number | string>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number | string>>();

let m!: any;
expectTypeOf(m as GE<number | string>).not.toExtend<G_Empty>();
expectTypeOf(m as GNE<number | string>).not.toExtend<G_NonEmpty>();

// Iterator
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

// .addEntries(..)
expectTypeOf(genEmpty.addEntries([])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addEntries([[1, 1]])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.addEntries([])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntries([[1, 1]])).toEqualTypeOf<G_NonEmpty>();

// .assumeNonEmpty()
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<HashMultiSet.Context<number>>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<HashMultiSet.Context<number>>();

// .filterEntries
expectTypeOf(genEmpty.filterEntries(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filterEntries(() => true)).toEqualTypeOf<G_Empty>();

// .isEmpty
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();

// .countMap
expectTypeOf(genEmpty.countMap).toEqualTypeOf<HashMap<number, number>>();
expectTypeOf(genNonEmpty.countMap).toExtend<HashMap.NonEmpty<number, number>>();

// .nonEmpty()
expectTypeOf(genEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();

// .remove(..)

expectTypeOf(genEmpty.remove(3)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.remove(3)).toEqualTypeOf<G_Empty>();

expectTypeOf(genEmpty.remove(3, { amount: 3 })).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.remove(3, { amount: 3 })).toEqualTypeOf<G_Empty>();

// .removeAllEvery(..)
expectTypeOf(genEmpty.removeAllEvery([3, 4])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeAllEvery([3, 4])).toEqualTypeOf<G_Empty>();

// .removeAllSingle(..)
expectTypeOf(genEmpty.removeAllSingle([3, 4])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeAllSingle([3, 4])).toEqualTypeOf<G_Empty>();

// .setCount(..)
expectTypeOf(genEmpty.setCount(3, 3)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.setCount(3, 3)).toEqualTypeOf<G_Empty>();

// .stream()
expectTypeOf(genEmpty.stream()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .streamDistinct();
expectTypeOf(genEmpty.streamDistinct()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.streamDistinct()).toEqualTypeOf<
	Stream.NonEmpty<number>
>();

// .toArray()
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<number[]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<ArrayNonEmpty<number>>();

// .toBuilder()

expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<
	HashMultiSet.Builder<number>
>();
expectTypeOf(genNonEmpty.toBuilder()).toEqualTypeOf<
	HashMultiSet.Builder<number>
>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
