import type { EdgeGraphHashed, EdgeGraphSorted } from '../../../../graph/mod.ts';
import type { GraphBase } from '../../../../graph/custom/index.ts';
import type { HashMap, HashSet } from '../../../../hashed/mod.ts';
import type { SortedMap, SortedSet } from '../../../../sorted/mod.ts';

export interface EdgeGraphHashedCreators
  extends GraphBase.Factory<EdgeGraphHashed.Types> {
  /**
   * Returns a new EdgeGraphHashed context instance based on the given `options`.
   * @typeparam UN - the upper node type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - linkMapContext - (optional) the map context to use to maintain link maps<br/>
   * - linkConnectionsContext - (optional) the set context to use to maintain link connections
   */
  createContext<UN>(options?: {
    linkMapContext?: HashMap.Context<UN>;
    linkConnectionsContext?: HashSet.Context<UN>;
  }): EdgeGraphHashed.Context<UN>;
  /**
   * Returns the default context for this type of graph.
   * @typeparam UN - the upper node type that the context should accept
   */
  defaultContext<UN>(): EdgeGraphHashed.Context<UN>;
}

export interface EdgeGraphSortedCreators
  extends GraphBase.Factory<EdgeGraphSorted.Types> {
  /**
   * Returns a new EdgeGraphSorted context instance based on the given `options`.
   * @typeparam UN - the upper node type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - linkMapContext - (optional) the map context to use to maintain link maps<br/>
   * - linkConnectionsContext - (optional) the set context to use to maintain link connections
   */
  createContext<UN>(options?: {
    linkMapContext?: SortedMap.Context<UN>;
    linkConnectionsContext?: SortedSet.Context<UN>;
  }): EdgeGraphSorted.Context<UN>;
  /**
   * Returns the default context for this type of graph.
   * @typeparam UN - the upper node type that the context should accept
   */
  defaultContext<UN>(): EdgeGraphSorted.Context<UN>;
}
