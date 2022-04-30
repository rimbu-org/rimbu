import type { RSetBase } from '@rimbu/collection-types/set-custom';
import type { HashSet } from '@rimbu/hashed';
import type { List } from '@rimbu/list';
import type { OrderedHashSet, OrderedSortedSet } from '@rimbu/ordered/set';
import type { SortedSet } from '@rimbu/sorted';

export interface OrderedHashSetCreators
  extends RSetBase.Factory<OrderedHashSet.Types> {
  /**
   * Returns a new OrderedHashSet context instance based on the given `options`.
   * @typeparam UT - the upper element type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - listContext - (optional) the list context to use for element ordering<br/>
   * - setContext - (optional) the set context to use for element sets
   */
  createContext<UT>(options?: {
    listContext?: List.Context;
    setContext?: HashSet.Context<UT>;
  }): OrderedHashSet.Context<UT>;
  /**
   * Returns the default context for OrderedHashSets.
   * @typeparam UT - the upper element type for which the context can create instances
   */
  defaultContext<UT>(): OrderedHashSet.Context<UT>;
}

export interface OrderedSortedSetCreators
  extends RSetBase.Factory<OrderedSortedSet.Types> {
  /**
   * Returns a new OrderedSortedSet context instance based on the given `options`.
   * @typeparam UT - the upper element type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - listContext - (optional) the list context to use for element ordering<br/>
   * - setContext - (optional) the set context to use for element sets
   */
  createContext<UT>(options?: {
    listContext?: List.Context;
    setContext?: SortedSet.Context<UT>;
  }): OrderedSortedSet.Context<UT>;
  /**
   * Returns the default context for OrderedSortedSet.
   * @typeparam UT - the upper element type for which the context can create instances
   */
  defaultContext<UT>(): OrderedSortedSet.Context<UT>;
}
