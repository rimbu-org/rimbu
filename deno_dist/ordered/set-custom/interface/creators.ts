import type { RSet } from '../../../collection-types/mod.ts';
import type { RSetBase } from '../../../collection-types/set-custom/index.ts';
import type { HashSet } from '../../../hashed/mod.ts';
import type { List } from '../../../list/mod.ts';
import type { SortedSet } from '../../../sorted/mod.ts';

import type {
  OrderedHashSet,
  OrderedSet,
  OrderedSortedSet,
} from '../../../ordered/set/index.ts';

export interface OrderedSetCreators {
  /**
   * Returns a new OrderedSet context instance based on the given `options`.
   * @typeparam UT - the upper element type for which the context can create instances
   * @param options - an object containing the following properties:<br/>
   * - listContext: the list context to use for element ordering<br/>
   * - setContext: the set context to use for element sets
   */
  createContext<UT>(options: {
    listContext?: List.Context;
    setContext: RSet.Context<UT>;
  }): OrderedSet.Context<UT>;
}

export interface OrderedHashSetCreators
  extends RSetBase.Factory<OrderedHashSet.Types> {
  /**
   * Returns a new OrderedHashSet context instance based on the given `options`.
   * @typeparam UT - the upper element type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - listContext: (optional) the list context to use for element ordering<br/>
   * - setContext: (optional) the set context to use for element sets
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
   * - listContext: (optional) the list context to use for element ordering<br/>
   * - setContext: (optional) the set context to use for element sets
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
