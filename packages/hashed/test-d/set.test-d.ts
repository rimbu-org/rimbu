import { expectTypeOf } from 'bun:test';

import type { RSet } from '@rimbu/collection-types';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { HashSet } from '@rimbu/hashed/set';
import type { FastIterator, Stream } from '@rimbu/stream';

type GE<T> = HashSet<T>;
type GNE<T> = HashSet.NonEmpty<T>;

type G_Empty = GE<number>;
type G_NonEmpty = GNE<number>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectTypeOf(genNonEmpty).toExtend<G_Empty>();
expectTypeOf(genNonEmpty).toExtend<G_NonEmpty>();
expectTypeOf(genEmpty).not.toExtend<G_NonEmpty>();

expectTypeOf(genEmpty).toExtend<RSet<number>>();
expectTypeOf(genEmpty).not.toExtend<RSet.NonEmpty<number>>();
expectTypeOf(genNonEmpty).toExtend<RSet<number>>();
expectTypeOf(genNonEmpty).toExtend<RSet.NonEmpty<number>>();

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

// .addAll(..)
expectTypeOf(genEmpty.addAll([1, 2, 3])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addAll([1, 2, 3])).toEqualTypeOf<G_NonEmpty>();

// .assumeNonEmpty()
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<HashSet.Context<number>>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<HashSet.Context<number>>();

// .difference(..)
expectTypeOf(genEmpty.difference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.difference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.difference(genNonEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.difference(genNonEmpty)).toEqualTypeOf<G_Empty>();

// .filter(..)
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();

// .intersect(..)
expectTypeOf(genEmpty.intersect(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.intersect(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.intersect(genNonEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.intersect(genNonEmpty)).toEqualTypeOf<G_Empty>();

// .isEmpty
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();

// .nonEmpty()
expectTypeOf(genEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();

// .remove(..)
expectTypeOf(genEmpty.remove(3)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.remove(3)).toEqualTypeOf<G_Empty>();

// .removeAll(..)
expectTypeOf(genEmpty.removeAll([3, 4])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeAll([3, 4])).toEqualTypeOf<G_Empty>();

// .stream()
expectTypeOf(genEmpty.stream()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .symDifference(..)
expectTypeOf(genEmpty.symDifference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.symDifference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.symDifference(genNonEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.symDifference(genNonEmpty)).toEqualTypeOf<G_Empty>();

// .toArray()
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<number[]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<ArrayNonEmpty<number>>();

// .union(..)
expectTypeOf(genEmpty.union(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.union(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.union(genEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.union(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
