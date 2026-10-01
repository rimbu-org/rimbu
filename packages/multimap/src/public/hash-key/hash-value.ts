import { HashMap } from '@rimbu/hashed/map';
import { HashSet } from '@rimbu/hashed/set';
import { MultiMap } from '@rimbu/multimap';

/**
 * A `MultiMap` with hash keys, hash values.
 *
 * This is a {@link MultiMap.Context}, **not** a distinct collection type: the
 * collection type is `MultiMap<K, V>` whichever backing is chosen, and the
 * backing is fixed by the context. The four historical variants are now four
 * preconfigured contexts.
 */
export const HashMultiMapHashValue: MultiMap.Context<any, any> =
	MultiMap.createContext({
		keyMapContext: HashMap.collectionContext,
		keyMapValuesContext: HashSet.createContext({}),
	});
