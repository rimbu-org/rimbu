import { MultiMap } from '@rimbu/multimap';
import { SortedMap } from '@rimbu/sorted/map';
import { SortedSet } from '@rimbu/sorted/set';

/**
 * A `MultiMap` with sorted keys, sorted values.
 *
 * This is a {@link MultiMap.Context}, **not** a distinct collection type: the
 * collection type is `MultiMap<K, V>` whichever backing is chosen, and the
 * backing is fixed by the context. The four historical variants are now four
 * preconfigured contexts.
 */
export const SortedMultiMapSortedValue: MultiMap.Context<any, any> =
	MultiMap.createContext({
		keyMapContext: SortedMap.collectionContext,
		keyMapValuesContext: SortedSet.createContext({}),
	});
