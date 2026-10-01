import { HashMap } from '@rimbu/hashed/map';
import { MultiMap } from '@rimbu/multimap';
import { SortedSet } from '@rimbu/sorted/set';

/**
 * A `MultiMap` with hash keys, sorted values.
 *
 * This is a {@link MultiMap.Context}, **not** a distinct collection type: the
 * collection type is `MultiMap<K, V>` whichever backing is chosen, and the
 * backing is fixed by the context. The four historical variants are now four
 * preconfigured contexts.
 */
export const HashMultiMapSortedValue: MultiMap.Context<any, any> =
	MultiMap.createContext({
		keyMapContext: HashMap.collectionContext,
		keyMapValuesContext: SortedSet.createContext({}),
	});
