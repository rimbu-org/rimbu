import { expectTypeOf } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { SortedSet } from '@rimbu/sorted/set';
import type { FastIterator, Stream } from '@rimbu/stream';

type GE<T> = SortedSet<T>;
type GNE<T> = SortedSet.NonEmpty<T>;

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

// .addEach(..)
expectTypeOf(genEmpty.addEach([1, 2, 3])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEach([1, 2, 3])).toEqualTypeOf<G_NonEmpty>();

// .assumeNonEmpty()
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<SortedSet.Context<number>>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<SortedSet.Context<number>>();

// .difference(..)
expectTypeOf(genEmpty.difference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.difference(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.difference(genNonEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.difference(genNonEmpty)).toEqualTypeOf<G_Empty>();

// .filter(..)
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();

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

// .removeEach(..)
expectTypeOf(genEmpty.removeEach([3, 4])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeEach([3, 4])).toEqualTypeOf<G_Empty>();

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
// An empty receiver unioned with a non-empty one yields a non-empty result,
// typed as the abstract `NonEmpty<E>` rather than the concrete
// `HashSet.NonEmpty<E>` — `union`'s operand is a `StreamSource`, and a
// NonEmpty *set* is not structurally a `StreamSource.NonEmpty` (its `fastNext`
// returns `never`), so overload resolution lands on the `StreamSource<E>` arm.
// `toExtend` states the property that matters; the old `toEqualTypeOf` asserted
// a nominal shape this never produced, and never ran, being under `@ts-nocheck`.
expectTypeOf(genEmpty.union(genNonEmpty)).toExtend<G_NonEmpty>();
// `union` returns `Tp['_SELF']`, which for a NonEmpty receiver is the
// receiver's own type *intersected* with `NonEmpty` — here
// `HashSet<number> & NonEmpty<number>`. That is assignable to the non-empty
// form but is not nominally `HashSet.NonEmpty<number>`, so `toEqualTypeOf`
// cannot express it. `toExtend` asserts the property that actually matters:
// a non-empty receiver always unions to a non-empty result.
expectTypeOf(genNonEmpty.union(genEmpty)).toExtend<G_NonEmpty>();
expectTypeOf(genNonEmpty.union(genNonEmpty)).toExtend<G_NonEmpty>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
