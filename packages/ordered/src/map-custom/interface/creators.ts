import type { RMapBase } from '@rimbu/collection-types/map-custom';
import type { HashMap } from '@rimbu/hashed';
import type { List } from '@rimbu/list';
import type { OrderedHashMap, OrderedSortedMap } from '@rimbu/ordered/map';
import type { SortedMap } from '@rimbu/sorted';

export interface OrderedHashMapCreators
  extends RMapBase.Factory<OrderedHashMap.Types> {
  /**
   * Returns a new OrderedHashMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - listContext - (optional) the list context to use for key ordering<br/>
   * - mapContext - (optional) the map context to use for key value mapping
   */
  createContext<UK>(options?: {
    listContext?: List.Context;
    mapContext?: HashMap.Context<UK>;
  }): OrderedHashMap.Context<UK>;
  /**
   * Returns the default context for OrderedHashMaps.
   * @typeparam UK - the upper key type for which the context can create instances
   */
  defaultContext<UK>(): OrderedHashMap.Context<UK>;
}

export interface OrderedSortedMapCreators
  extends RMapBase.Factory<OrderedSortedMap.Types> {
  /**
   * Returns a new OrderedSortedMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - listContext - (optional) the list context to use for key ordering<br/>
   * - mapContext - (optional) the map context to use for key value mapping
   */
  createContext<UK>(options?: {
    listContext?: List.Context;
    mapContext?: SortedMap.Context<UK>;
  }): OrderedSortedMap.Context<UK>;
  /**
   * Returns the default context for OrderedSortedMaps.
   * @typeparam UK - the upper key type for which the context can create instances
   */
  defaultContext<UK>(): OrderedSortedMap.Context<UK>;
}
