import type { HashMap } from '@rimbu/hashed';
import type { SortedMap } from '@rimbu/sorted';
import type { RMap } from '@rimbu/collection-types';

import type {
  EdgeValuedGraph,
  EdgeValuedGraphHashed,
  EdgeValuedGraphSorted,
} from '@rimbu/graph';
import type { ValuedGraphBase } from '@rimbu/graph/custom';

export interface EdgeValuedGraphCreators {
  /**
   * Returns a new EdgeValuedGraph context instance based on the given `options`.
   * @typeparam UN - the upper node type for which the context can create instances
   * @param options - an object containing the following properties:<br/>
   * - linkMapContext - the map context to use to maintain link maps<br/>
   * - linkConnectionsContext - the map context to use to maintain link connection maps
   */
  createContext<UN>(options: {
    linkMapContext: RMap.Context<UN>;
    linkConnectionsContext: RMap.Context<UN>;
  }): EdgeValuedGraph.Context<UN>;
}

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
