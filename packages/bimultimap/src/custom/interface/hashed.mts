import type { BiMultiMapBase } from '@rimbu/bimultimap/custom';
import type { HashBiMultiMap } from '@rimbu/bimultimap';

import type { HashMultiMapHashValue } from '@rimbu/multimap';

export namespace BiMultiMapHashed {
  /**
   * The HashBiMultiMap creators interface that exposes factory methods and context helpers
   * for hashed BiMultiMap instances.
   */
  export interface Creators
    extends BiMultiMapBase.Factory<unknown, unknown, HashBiMultiMap.Types> {
    /**
     * Returns a new HashBiMultiMap context instance based on the given `options`.
     * @typeparam UK - the upper key type for which the context can create instances
     * @typeparam UV - the upper value type for which the context can create instances
     * @param options - (optional) an object containing the following properties:<br/>
     * - keyValueMultiMapContext: (optional) the MultiMap context to use for key to value multimaps<br/>
     * - valueKeyMultiMapContext: (optional) the MultiMap context to use for value to key multimaps
     */
    createContext<UK, UV>(options?: {
      keyValueMultiMapContext?: HashMultiMapHashValue.Context<UK, UV>;
      valueKeyMultiMapContext?: HashMultiMapHashValue.Context<UV, UK>;
    }): HashBiMultiMap.Context<UK, UV>;
    /**
     * Returns the default context for HashBiMultiMaps.
     * @typeparam UK - the upper key type for which the context can create instances
     * @typeparam UV - the upper value type for which the context can create instances
     */
    defaultContext<UK, UV>(): HashBiMultiMap.Context<UK, UV>;
  }
}
