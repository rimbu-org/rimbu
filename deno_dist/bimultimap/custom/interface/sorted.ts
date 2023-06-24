import type { BiMultiMapBase } from '../../../bimultimap/custom/index.ts';
import type { SortedBiMultiMap } from '../../../bimultimap/main/index.ts';

import type { SortedMultiMapSortedValue } from '../../../multimap/mod.ts';

export namespace BiMultiMapSorted {
  export interface Creators
    extends BiMultiMapBase.Factory<unknown, unknown, SortedBiMultiMap.Types> {
    /**
     * Returns a new SortedBiMultiMap context instance based on the given `options`.
     * @typeparam UK - the upper key type for which the context can create instances
     * @typeparam UV - the upper value type for which the context can create instances
     * @param options - (optional) an object containing the following properties:<br/>
     * - keyValueMultiMapContext - (optional) the map context to use for key value multimaps<br/>
     * - valueKeyMultiMapContext - (optional) the set context to use for value key multimaps
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
