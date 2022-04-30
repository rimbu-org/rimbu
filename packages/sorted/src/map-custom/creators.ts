import type { RMapBase } from '@rimbu/collection-types/map-custom';
import type { Comp } from '@rimbu/common';
import type { SortedMap } from '@rimbu/sorted/map';

export interface SortedMapCreators extends RMapBase.Factory<SortedMap.Types> {
  /**
   * Returns a new SortedMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - comp - (optional) the comparator instance for keys<br/>
   * - blockSizeBits - (default: 5) the power of 2 to to `blockSizeBits` to use as block size for all instances that are created from the context.
   */
  createContext<UK>(options?: {
    comp?: Comp<UK>;
    blockSizeBits?: number;
  }): SortedMap.Context<UK>;
  /**
   * Returns the default context for SortedMaps.
   * @typeparam UK - the upper key type for which the context can create instances
   */
  defaultContext<UK>(): SortedMap.Context<UK>;
}
