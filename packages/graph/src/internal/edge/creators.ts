import type { RMap, RSet } from '@rimbu/collection-types';
import type { EdgeGraph } from '@rimbu/graph/edge-graph';
import type { EdgeGraphHashed } from '@rimbu/graph/non-valued/edge/hashed';
import type { EdgeGraphSorted } from '@rimbu/graph/non-valued/edge/sorted';
import type { HashMap } from '@rimbu/hashed/map';
import type { HashSet } from '@rimbu/hashed/set';
import type { SortedMap } from '@rimbu/sorted/map';
import type { SortedSet } from '@rimbu/sorted/set';

import type { GraphBase } from '#graph/base';

export interface EdgeGraphCreators {
	/**
	 * Returns a new EdgeGraph context instance based on the given `options`.
	 * @typeparam UN - the upper node type for which the context can create instances
	 * @param options - an object containing the following properties:<br/>
	 * - linkMapContext: the map context to use to maintain link maps<br/>
	 * - linkConnectionsContext: the set context to use to maintain link connection maps
	 */
	createContext<UN>(options: {
		linkMapContext: RMap.Context<UN>;
		linkConnectionsContext: RSet.Context<UN>;
	}): EdgeGraph.Context<UN>;
}

export interface EdgeGraphHashedCreators
	extends GraphBase.Factory<EdgeGraphHashed.Types> {
	/**
	 * Returns a new EdgeGraphHashed context instance based on the given `options`.
	 * @typeparam UN - the upper node type for which the context can create instances
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - linkMapContext: (optional) the map context to use to maintain link maps<br/>
	 * - linkConnectionsContext: (optional) the set context to use to maintain link connections
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
	 * - linkMapContext: (optional) the map context to use to maintain link maps<br/>
	 * - linkConnectionsContext: (optional) the set context to use to maintain link connections
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
