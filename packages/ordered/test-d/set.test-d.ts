import { expectTypeOf } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { OrderedSet } from '@rimbu/ordered/set';
import type { FastIterator, Stream } from '@rimbu/stream';

type GE<T> = OrderedSet<T>;
type GNE<T> = OrderedSet.NonEmpty<T>;

type G_Empty = GE<number>;
type G_NonEmpty = GNE<number>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectTypeOf(genNonEmpty).toExtend<G_Empty>();
expectTypeOf(genNonEmpty).toExtend<G_NonEmpty>();
expectTypeOf(genEmpty).not.toExtend<G_NonEmpty>();

// Iterator
expectTypeOf(genEmpty[Symbol.iterator]()).toEqualTypeOf<FastIterator<number>>();
expectTypeOf(genNonEmpty[Symbol.iterator]()).toEqualTypeOf<FastIterator<number>>();

// .add(..)
expectTypeOf(genEmpty.add(1)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.add(1)).toEqualTypeOf<G_NonEmpty>();

// .addAll(..)
expectTypeOf(genEmpty.addAll([])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addAll([1, 2, 3])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addAll([1, 2, 3])).toEqualTypeOf<G_NonEmpty>();

// .assumeNonEmpty()
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<OrderedSet.Context<number>>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<OrderedSet.Context<number>>();

// .difference(..)
expectTypeOf(genEmpty.difference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.difference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.difference(genNonEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.difference(genNonEmpty)).toEqualTypeOf<G_Empty>();

// .filter(..)
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();

// .has(..)
expectTypeOf(genEmpty.has(1)).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.has(1)).toEqualTypeOf<boolean>();

// .intersection(..)
expectTypeOf(genEmpty.intersection(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.intersection(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.intersection(genNonEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.intersection(genNonEmpty)).toEqualTypeOf<G_Empty>();

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

// .symmetricDifference(..)
expectTypeOf(genEmpty.symmetricDifference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.symmetricDifference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.symmetricDifference(genNonEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.symmetricDifference(genNonEmpty)).toEqualTypeOf<G_Empty>();

// .toArray()
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<number[]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<ArrayNonEmpty<number>>();

// .union(..)
expectTypeOf(genEmpty.union(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.union(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.union(genEmpty)).toExtend<G_NonEmpty>();
expectTypeOf(genNonEmpty.union(genNonEmpty)).toExtend<G_NonEmpty>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
