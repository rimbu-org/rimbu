import { expectTypeOf } from 'bun:test';

import type { MapCollection } from '@rimbu/collection-types/map';
import type { HashMap } from '@rimbu/hashed/map';
import type { MultiSet, MultiSetCollection } from '@rimbu/multiset';
import type { HashMultiSet } from '@rimbu/multiset/hashed';
import type { SortedMultiSet } from '@rimbu/multiset/sorted';
import type { SortedMap } from '@rimbu/sorted/map';

// Any map can define a concretely typed MultiSet kind with a one-line alias.
type HashMapMultiSet<T> = MultiSetCollection<
	T,
	HashMap.Advanced.Family<T, number>
>;
type SortedMapMultiSet<T> = MultiSetCollection<
	T,
	SortedMap.Advanced.Family<T, number>
>;

declare const h: HashMapMultiSet<number>;
declare const s: SortedMapMultiSet<number>;

// The count map is concretely typed for the chosen family.
expectTypeOf(h.countMap).toEqualTypeOf<HashMap<number, number>>();
expectTypeOf(s.countMap).toEqualTypeOf<SortedMap<number, number>>();
const hNonEmptyMap: HashMap.NonEmpty<number, number> =
	h.assumeNonEmpty().countMap;

// The context exposes the concrete count-map context.
const hContext: HashMap.Context<number> = h.context.countMapContext;
const sContext: SortedMap.Context<number> = s.context.countMapContext;

// The count-map kind survives filtering and count filtering.
const hFiltered: HashMapMultiSet<number> = h.filter((v) => v > 0);
const sFiltered: SortedMapMultiSet<number> = s.filter((v) => v > 0);
const hFilteredCounts: HashMapMultiSet<number> = h.filterWithCounts(() => true);

// The named variants are exactly the generic base at the corresponding family.
expectTypeOf<HashMultiSet<number>>().toEqualTypeOf<HashMapMultiSet<number>>();
expectTypeOf<SortedMultiSet<number>>().toEqualTypeOf<
	SortedMapMultiSet<number>
>();

// The default MultiSet stays typed as the generic MapCollection.
declare const generic: MultiSet<number>;
const genericMap: MapCollection<number, number> = generic.countMap;

// The root/advanced export of `MultiSetCollection` carries its namespace.
declare const neFromNamespace: MultiSetCollection.NonEmpty<
	number,
	HashMap.Advanced.Family<number, number>
>;
const neFromNamespaceMap: HashMap.NonEmpty<number, number> =
	neFromNamespace.countMap;

void hNonEmptyMap;
void hContext;
void sContext;
void hFiltered;
void sFiltered;
void hFilteredCounts;
void genericMap;
void neFromNamespaceMap;
