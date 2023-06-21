import type { RMapBase } from '@rimbu/collection-types/map-custom';
import type { Eq } from '@rimbu/common';
import type { List } from '@rimbu/list';

import type { HashMap } from '@rimbu/hashed/map';
import type { Hasher } from '../common';

export interface HashMapCreators extends RMapBase.Factory<HashMap.Types> {
  /**
   * Returns a new HashMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - hasher - (optional) a `Hasher` instance used to hash the map keys<br/>
   * - eq - (optional) an `Eq` instance used to determine key equality<br/>
   * - blockSizeBits - (optional) determines the maximum block size as 2 to the power of `blockSizeBits`<br/>
   * - listContext - (optional) the context to use to create list instances (for collisions)
   */
  createContext<UK>(options?: {
    hasher?: Hasher<UK>;
    eq?: Eq<UK>;
    blockSizeBits?: number;
    listContext?: List.Context;
  }): HashMap.Context<UK>;
  /**
   * Returns the default context for HashMaps.
   * @typeparam UK - the upper key type for which the context can create instances
   */
  defaultContext<UK>(): HashMap.Context<UK>;
}
