import { expectTypeOf } from 'bun:test';

import type { MapCollection } from '@rimbu/collection-types/map';
import type { HashMap } from '@rimbu/hashed/map';
import type { MultiSet, MultiSetBase } from '@rimbu/multiset';
import type { HashMultiSet } from '@rimbu/multiset/hashed';
import type { SortedMultiSet } from '@rimbu/multiset/sorted';
import type { SortedMap } from '@rimbu/sorted/map';

// Any map can define a concretely typed MultiSet kind with a one-line alias.
type HashMapMultiSet<T> = MultiSetBase<T, HashMap.Advanced.Family<T, number>>;
type SortedMapMultiSet<T> = MultiSetBase<
	T,
	SortedMap.Advanced.Family<T, number>
>;

declare const h: HashMapMultiSet<number>;
declare const s: SortedMapMultiSet<number>;

// The count map is concretely typed for the chosen family.
expectTypeOf(h.countMap).toEqualTypeOf<HashMap<number, number>>();
expectTypeOf(s.countMap).toEqualTypeOf<SortedMap<number, number>>();
expectTypeOf(h.assumeNonEmpty().countMap).toEqualTypeOf<
	HashMap.NonEmpty<number, number>
>();

// The context exposes the concrete count-map context.
expectTypeOf(h.context.countMapContext).toEqualTypeOf<
	HashMap.Context<number>
>();
expectTypeOf(s.context.countMapContext).toEqualTypeOf<
	SortedMap.Context<number>
>();

// The count-map kind survives element retyping and filtering.
expectTypeOf(h.map((v) => String(v))).toEqualTypeOf<HashMapMultiSet<string>>();
expectTypeOf(s.filter((v) => v > 0)).toEqualTypeOf<SortedMapMultiSet<number>>();

// The named variants are exactly the generic base at the corresponding family.
expectTypeOf<HashMultiSet<number>>().toEqualTypeOf<HashMapMultiSet<number>>();
expectTypeOf<SortedMultiSet<number>>().toEqualTypeOf<
	SortedMapMultiSet<number>
>();

// The default MultiSet stays typed as the generic MapCollection.
expectTypeOf<MultiSet<number>['countMap']>().toEqualTypeOf<
	MapCollection<number, number>
>();
