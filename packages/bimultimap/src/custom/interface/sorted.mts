import type { BiMultiMapBase } from '@rimbu/bimultimap/custom';
import type { SortedBiMultiMap } from '@rimbu/bimultimap';

import type { SortedMultiMapSortedValue } from '@rimbu/multimap';

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
     */
    createContext<K, V>(options?: {
      keyValueMultiMapContext?: SortedMultiMapSortedValue.Context<K, V>;
      valueKeyMultiMapContext?: SortedMultiMapSortedValue.Context<V, K>;
    }): SortedBiMultiMap.Context<K, V>;
    /**
     * Returns the default context for SortedBiMultiMap.
     * @typeparam UK - the upper key type for which the context can create instances
     * @typeparam UV - the upper value type for which the context can create instances
     */
    defaultContext<UK, UV>(): SortedBiMultiMap.Context<UK, UV>;
  }
}
