import type { BiMultiMapBase } from '../../../bimultimap/custom/index.ts';
import type { HashBiMultiMap } from '../../../bimultimap/mod.ts';
import type { HashMultiMapHashValue } from '../../../multimap/mod.ts';

export namespace BiMultiMapHashed {
  export interface Creators
    extends BiMultiMapBase.Factory<unknown, unknown, HashBiMultiMap.Types> {
    /**
     * Returns a new HashBiMultiMap context instance based on the given `options`.
     * @typeparam UK - the upper key type for which the context can create instances
     * @typeparam UV - the upper value type for which the context can create instances
     * @param options - (optional) an object containing the following properties:<br/>
     * - keyValueMultiMapContext - (optional) the map context to use for key value multimaps<br/>
     * - valueKeyMultiMapContext - (optional) the set context to use for value key multimaps
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
