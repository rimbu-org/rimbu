import type {
  ArrowValuedGraphHashed,
  ArrowValuedGraphSorted,
} from '../../../../../graph/mod.ts';
import type { ValuedGraphBase } from '../../../../../graph/custom/index.ts';
import type { HashMap } from '../../../../../hashed/mod.ts';
import type { SortedMap } from '../../../../../sorted/mod.ts';

export interface ArrowValuedGraphHashedCreators
  extends ValuedGraphBase.Factory<ArrowValuedGraphHashed.Types> {
  /**
   * Returns a new ArrowValuedGraphHashed context instance based on the given `options`.
   * @typeparam UN - the upper node type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - linkMapContext - (optional) the map context to use to maintain link maps<br/>
   * - linkConnectionsContext - (optional) the map context to use to maintain link connection maps
   */
  createContext<UN>(options?: {
    linkMapContext?: HashMap.Context<UN>;
    linkConnectionsContext?: HashMap.Context<UN>;
  }): ArrowValuedGraphHashed.Context<UN>;
  /**
   * Returns the default context for this type of graph.
   * @typeparam UN - the upper node type that the context should accept
   */
  defaultContext<UN>(): ArrowValuedGraphHashed.Context<UN>;
}

export interface ArrowValuedGraphSortedCreators
  extends ValuedGraphBase.Factory<ArrowValuedGraphSorted.Types> {
  /**
   * Returns a new ArrowValuedGraphSorted context instance based on the given `options`.
   * @typeparam UN - the upper node type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - linkMapContext - (optional) the map context to use to maintain link maps<br/>
   * - linkConnectionsContext - (optional) the map context to use to maintain link connection maps
   */
  createContext<UN>(options?: {
    linkMapContext?: SortedMap.Context<UN>;
    linkConnectionsContext?: SortedMap.Context<UN>;
  }): ArrowValuedGraphSorted.Context<UN>;
  /**
   * Returns the default context for this type of graph.
   * @typeparam UN - the upper node type that the context should accept
   */
  defaultContext<UN>(): ArrowValuedGraphSorted.Context<UN>;
}
