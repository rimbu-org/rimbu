import { expectTypeOf } from 'bun:test';

import type { MapCollection } from '@rimbu/collection-types/map';
import type { MultiSet } from '@rimbu/multiset';

import { MultiSet as MultiSetCreators } from '@rimbu/multiset';
import { HashMultiSet } from '@rimbu/multiset/hashed';
import { SortedMultiSet } from '@rimbu/multiset/sorted';
import { SortedMap } from '@rimbu/sorted/map';

/**
 * The variants are **contexts**, not types. There is one collection type,
 * `MultiSet<T>`, and each context produces it — so these assertions are about the
 * factory dimension (`countMapContext`, `createContext`, `typeTag`), not about a
 * per-variant type. The method surface itself is covered once, in
 * `multiset.test-d.ts`.
 */

declare const hash: MultiSet<number>;
declare const sorted: MultiSet<number>;
declare const generic: MultiSet<number>;

expectTypeOf(hash).toEqualTypeOf<MultiSet<number>>();
expectTypeOf(sorted).toEqualTypeOf<MultiSet<number>>();

// `typeTag` is uniformly 'MultiSet': it describes the collection, not the backing.
expectTypeOf(HashMultiSet.typeTag).toEqualTypeOf<'MultiSet'>();
expectTypeOf(SortedMultiSet.typeTag).toEqualTypeOf<'MultiSet'>();
expectTypeOf(MultiSetCreators.typeTag).toEqualTypeOf<'MultiSet'>();

// The backing is a context, chosen per variant.
expectTypeOf(HashMultiSet.countMapContext).toExtend<
	MapCollection.Context<MapCollection.Advanced.Family<number, number>>
>();
expectTypeOf(SortedMultiSet.countMapContext).toExtend<
	MapCollection.Context<MapCollection.Advanced.Family<number, number>>
>();

// Contexts are interchangeable: any two MultiSets interoperate, hashed or sorted.
declare const hashNonEmpty: MultiSet.NonEmpty<number>;
declare const sortedNonEmpty: MultiSet.NonEmpty<number>;
expectTypeOf(hashNonEmpty.union(sortedNonEmpty)).toEqualTypeOf<
	MultiSet.NonEmpty<number>
>();
expectTypeOf(sortedNonEmpty.union(hashNonEmpty)).toEqualTypeOf<
	MultiSet.NonEmpty<number>
>();
expectTypeOf(hashNonEmpty.intersection(sorted)).toEqualTypeOf<
	MultiSet<number>
>();

// `createContext` is on the shared ContextApi, so every context has it.
// `createContext` is on the shared ContextApi, so every context has it, and its
// options are optional (defaulting to that context's own backing). Asserted by
// plain assignability rather than `expectTypeOf`: the ContextApi is wide enough
// that a structural comparison is brittle here, and assignability is the real
// contract.
const derived: MultiSet.Context<number> = HashMultiSet.createContext();
const derivedSorted: MultiSet.Context<number> = MultiSetCreators.createContext({
	countMapContext: SortedMap.collectionContext,
});
const derivedNoOptions: MultiSet.Context<number> =
	MultiSetCreators.createContext();

// A derived context still produces the one collection type.
const fromDerived: MultiSet.NonEmpty<1 | 2> = derived.of(1, 2);
const emptyFromDerived: MultiSet<number> = derived.empty();
void [derivedSorted, derivedNoOptions, fromDerived, emptyFromDerived];

// Invariance: a MultiSet is not a variant tier, so there is no covariant widening
// to compare against. `MultiSet<T>` must not accept a wider element type.
expectTypeOf(generic).not.toExtend<MultiSet<number | string>>();
expectTypeOf(hashNonEmpty).not.toExtend<MultiSet.NonEmpty<number | string>>();

// `countMap` is the generic `MapCollection` on every backing — the concrete
// `HashMap`/`SortedMap` is an implementation detail, as with `BiMap`'s delegates.
expectTypeOf(generic.countMap).toEqualTypeOf<MapCollection<number, number>>();
expectTypeOf(hashNonEmpty.countMap).toEqualTypeOf<
	MapCollection.NonEmpty<number, number>
>();
expectTypeOf(sortedNonEmpty.countMap).toEqualTypeOf<
	MapCollection.NonEmpty<number, number>
>();
