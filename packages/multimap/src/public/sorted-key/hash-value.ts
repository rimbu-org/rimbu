import { HashSet } from '@rimbu/hashed/set';
import { MultiMap } from '@rimbu/multimap';
import { SortedMap } from '@rimbu/sorted/map';

/**
 * A `MultiMap` with sorted keys, hash values.
 *
 * This is a {@link MultiMap.Context}, **not** a distinct collection type: the
 * collection type is `MultiMap<K, V>` whichever backing is chosen, and the
 * backing is fixed by the context. The four historical variants are now four
 * preconfigured contexts.
 */
export const SortedMultiMapHashValue: MultiMap.Context<any, any> =
	MultiMap.createContext({
		keyMapContext: SortedMap.collectionContext,
		keyMapValuesContext: HashSet.createContext({}),
	});
