import { BiMultiMap } from '@rimbu/bimultimap';
import { SortedMultiMapSortedValue } from '@rimbu/multimap/sorted-key/sorted-value';

/**
 * A sorted BiMultiMap context: the factory for `BiMultiMap` instances whose keys
 * and values are sorted in both directions.
 *
 * This is a {@link BiMultiMap.Context}, **not** a distinct collection type: the
 * collection type is `BiMultiMap<K, V>` whichever backing is chosen, and the
 * backing is fixed by the context. The two historical variants are now two
 * preconfigured contexts.
 * @example
 * ```ts
 * import { SortedBiMultiMap } from '@rimbu/bimultimap/sorted';
 * const s1 = SortedBiMultiMap.empty<number, string>();
 * const s2 = SortedBiMultiMap.of([1, 'a'], [1, 'b']);
 * console.log(s2.toArray()); // => [ [ 1, "a" ], [ 1, "b" ] ]
 * console.log(s2.getValues(1).toArray()); // => [ "a", "b" ]
 * console.log(s2.getKeys('a').toArray()); // => [ 1 ]
 * ```
 */
export const SortedBiMultiMap: BiMultiMap.Context<any, any> =
	BiMultiMap.createContext({
		keyValueMultiMapContext: SortedMultiMapSortedValue,
		valueKeyMultiMapContext: SortedMultiMapSortedValue,
	});
