import type { RSetBase } from '@rimbu/collection-types/set-custom';
import type { Eq } from '@rimbu/common';
import type { List } from '@rimbu/list';

import type { Hasher, HashSet } from '@rimbu/hashed/set';

export interface HashSetCreators extends RSetBase.Factory<HashSet.Types> {
  /**
   * Returns a new HashSet context instance based on the given `options`.
   * @typeparam UT - the upper element type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/.
   * - hasher - (optional) a `Hasher` instance used to hash the map keys<br/>
   * - eq - (optional) an `Eq` instance used to determine key equality<br/>
   * - blockSizeBits - (optional) determines the maximum block size as 2 to the power of `blockSizeBits`<br/>
   * - listContext - (optional) the context to use to create list instances (for collisions)
   */
  createContext<UT>(options?: {
    hasher?: Hasher<UT>;
    eq?: Eq<UT>;
    blockSizeBits?: number;
    listContext?: List.Context;
  }): HashSet.Context<UT>;
  /**
   * Returns the default context for HashSets.
   * @typeparam UT - the upper element type for which the context can create instances
   */
  defaultContext<UT>(): HashSet.Context<UT>;
}
