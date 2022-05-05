import type { HashMap } from '../../../../../hashed/mod.ts';
import type { SortedMap } from '../../../../../sorted/mod.ts';

import type {
  EdgeValuedGraphHashed,
  EdgeValuedGraphSorted,
} from '../../../../../graph/mod.ts';
import type { ValuedGraphBase } from '../../../../../graph/custom/index.ts';

export interface EdgeValuedGraphHashedCreators
  extends ValuedGraphBase.Factory<EdgeValuedGraphHashed.Types> {
  /**
   * Returns a new EdgeValuedGraphHashed context instance based on the given `options`.
   * @typeparam UN - the upper node type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - linkMapContext - (optional) the map context to use to maintain link maps<br/>
   * - linkConnectionsContext - (optional) the map context to use to maintain link connection maps
   */
  createContext<UN>(options?: {
    linkMapContext?: HashMap.Context<UN>;
    linkConnectionsContext?: HashMap.Context<UN>;
  }): EdgeValuedGraphHashed.Context<UN>;
  /**
   * Returns the default context for this type of graph.
   * @typeparam UN - the upper node type that the context should accept
   */
  defaultContext<UN>(): EdgeValuedGraphHashed.Context<UN>;
}

export interface EdgeValuedGrapSortedCreators
  extends ValuedGraphBase.Factory<EdgeValuedGraphSorted.Types> {
  /**
   * Returns a new EdgeValuedGraph context instance based on the given `options`.
   * @typeparam UN - the upper node type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - linkMapContext - (optional) the map context to use to maintain link maps<br/>
   * - linkConnectionsContext - (optional) the map context to use to maintain link connection maps
   */
  createContext<UN>(options?: {
    linkMapContext?: SortedMap.Context<UN>;
    linkConnectionsContext?: SortedMap.Context<UN>;
  }): EdgeValuedGraphSorted.Context<UN>;
  /**
   * Returns the default context for this type of graph.
   * @typeparam UN - the upper node type that the context should accept
   */
  defaultContext<UN>(): EdgeValuedGraphSorted.Context<UN>;
}
