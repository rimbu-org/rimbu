import type { RMap, RSet } from '@rimbu/collection-types';
import type { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed';
import type { ArrowGraphSorted } from '@rimbu/graph/non-valued/arrow/sorted';
import type { HashMap } from '@rimbu/hashed/map';
import type { HashSet } from '@rimbu/hashed/set';
import type { SortedMap } from '@rimbu/sorted/map';
import type { SortedSet } from '@rimbu/sorted/set';
import type { ArrowGraph } from 'entry/arrow-graph';

import type { GraphBase } from '#private/base';

export interface ArrowGraphCreators {
	/**
	 * Returns a new ArrowGraph context instance based on the given `options`.
	 * @typeparam UN - the upper node type for which the context can create instances
	 * @param options - an object containing the following properties:<br/>
	 * - linkMapContext: the map context to use to maintain link maps<br/>
	 * - linkConnectionsContext: the set context to use to maintain link connection maps
	 */
	createContext<UN>(options: {
		linkMapContext: RMap.Context<UN>;
		linkConnectionsContext: RSet.Context<UN>;
	}): ArrowGraph.Context<UN>;
}

export interface ArrowGraphHashedCreators
	extends GraphBase.Factory<ArrowGraphHashed.Types> {
	/**
	 * Returns a new ArrowValuedGraphHashed context instance based on the given `options`.
	 * @typeparam UN - the upper node type for which the context can create instances
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - linkMapContext: (optional) the map context to use to maintain link maps<br/>
	 * - linkConnectionsContext: (optional) the set context to use to maintain link connections
	 */
	createContext<UN>(options?: {
		linkMapContext?: HashMap.Context<UN>;
		linkConnectionsContext?: HashSet.Context<UN>;
	}): ArrowGraphHashed.Context<UN>;
	/**
	 * Returns the default context for this type of graph.
	 * @typeparam UN - the upper node type that the context should accept
	 */
	defaultContext<UN>(): ArrowGraphHashed.Context<UN>;
}

export interface ArrowGraphSortedCreators
	extends GraphBase.Factory<ArrowGraphSorted.Types> {
	/**
	 * Returns a new ArrowValuedGraphSorted context instance based on the given `options`.
	 * @typeparam UN - the upper node type for which the context can create instances
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - linkMapContext: (optional) the map context to use to maintain link maps<br/>
	 * - linkConnectionsContext: (optional) the set context to use to maintain link connections
	 */
	createContext<UN>(options?: {
		linkMapContext?: SortedMap.Context<UN>;
		linkConnectionsContext?: SortedSet.Context<UN>;
	}): ArrowGraphSorted.Context<UN>;
	/**
	 * Returns the default context for this type of graph.
	 * @typeparam UN - the upper node type that the context should accept
	 */
	defaultContext<UN>(): ArrowGraphSorted.Context<UN>;
}
