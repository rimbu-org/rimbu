import type { SortedBiMultiMap } from '@rimbu/bimultimap/sorted';
import type { SortedMultiMapSortedValue } from '@rimbu/multimap/sorted-key/sorted-value';

import type { BiMultiMapBase } from '#bimultimap/base';

export namespace BiMultiMapSorted {
	/**
	 * The SortedBiMultiMap creators interface that exposes factory methods and context helpers
	 * for sorted BiMultiMap instances.
	 */
	export interface Creators
		extends BiMultiMapBase.Factory<unknown, unknown, SortedBiMultiMap.Types> {
		/**
		 * Returns a new SortedBiMultiMap context instance based on the given `options`.
		 * @typeparam UK - the upper key type for which the context can create instances
		 * @typeparam UV - the upper value type for which the context can create instances
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - keyValueMultiMapContext: (optional) the MultiMap context to use for key to value multimaps<br/>
		 * - valueKeyMultiMapContext: (optional) the MultiMap context to use for value to key multimaps
		 * @returns a new `SortedBiMultiMap.Context` configured with the provided options
		 */
		createContext<UK, UV>(options?: {
			keyValueMultiMapContext?: SortedMultiMapSortedValue.Context<UK, UV>;
			valueKeyMultiMapContext?: SortedMultiMapSortedValue.Context<UV, UK>;
		}): SortedBiMultiMap.Context<UK, UV>;
		/**
		 * Returns the default context for SortedBiMultiMap.
		 * @typeparam UK - the upper key type for which the context can create instances
		 * @typeparam UV - the upper value type for which the context can create instances
		 * @returns the default `SortedBiMultiMap.Context` for this environment
		 */
		defaultContext<UK, UV>(): SortedBiMultiMap.Context<UK, UV>;
	}
}