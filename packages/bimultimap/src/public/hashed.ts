import { BiMultiMap } from '@rimbu/bimultimap';
import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';

/**
 * A hashed BiMultiMap context: the factory for `BiMultiMap` instances whose keys
 * and values are hashed in both directions.
 *
 * This is a {@link BiMultiMap.Context}, **not** a distinct collection type: the
 * collection type is `BiMultiMap<K, V>` whichever backing is chosen, and the
 * backing is fixed by the context. The two historical variants are now two
 * preconfigured contexts.
 * @example
 * ```ts
 * import { HashBiMultiMap } from '@rimbu/bimultimap/hashed';
 * const h1 = HashBiMultiMap.empty<number, string>();
 * const h2 = HashBiMultiMap.of([1, 'a'], [1, 'b']);
 * console.log(h2.toArray()); // => [ [ 1, "a" ], [ 1, "b" ] ]
 * console.log(h2.getValues(1).toArray()); // => [ "a", "b" ]
 * console.log(h2.getKeys('a').toArray()); // => [ 1 ]
 * ```
 */
export const HashBiMultiMap: BiMultiMap.Context<any, any> =
	BiMultiMap.createContext({
		keyValueMultiMapContext: HashMultiMapHashValue,
		valueKeyMultiMapContext: HashMultiMapHashValue,
	});
