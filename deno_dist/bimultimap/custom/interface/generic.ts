import type { BiMultiMap } from '../../../bimultimap/mod.ts';

import type { MultiMap } from '../../../multimap/mod.ts';

export namespace BiMultiMapGeneric {
  /**
   * The BiMultiMap generic creators interface used to construct `BiMultiMap` contexts.
   */
  export interface Creators {
    /**
     * Returns a new BiMultiMap context instance based on the given `options`.
     * @typeparam UK - the upper key type for which the context can create instances
     * @typeparam UV - the upper value type for which the context can create instances
     * @param options - an object containing the following properties:<br/>
     * - keyValueMultiMapContext: the MultiMap context to use for key to value multimaps<br/>
     * - valueKeyMultiMapContext: the MultiMap context to use for value to key multimaps
     */
    createContext<UK, UV>(options: {
      keyValueMultiMapContext: MultiMap.Context<UK, UV>;
      valueKeyMultiMapContext: MultiMap.Context<UV, UK>;
    }): BiMultiMap.Context<UK, UV>;
  }
}
