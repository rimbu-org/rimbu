import type { RMap, RSet } from '@rimbu/collection-types';
import type { Stream, Streamable } from '@rimbu/stream';

import type { EdgeGraphCreators, GraphElement } from '#graph/custom';
import { type EdgeGraphBase, GraphContext } from '#graph/custom';

/**
 * An type-invariant immutable edge (undirected) graph.
 * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeGraph API documentation](https://rimbu.org/api/rimbu/graph/EdgeGraph/interface)
 * @typeparam N - the node type
 */
export interface EdgeGraph<N> extends EdgeGraphBase<N, EdgeGraph.Types> {}

export namespace EdgeGraph {
  /**
   * A non-empty type-invariant immutable edge (undirected) graph.
   * @typeparam N - the node type
   */
  export interface NonEmpty<N>
    extends EdgeGraphBase.NonEmpty<N, EdgeGraph.Types>,
      Omit<EdgeGraph<N>, keyof EdgeGraphBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 2-valued tuples of nodes for connections.
     * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeGraph API documentation](https://rimbu.org/api/rimbu/graph/EdgeGraph/interface)
     * @example
     * ```ts
     * EdgeGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     * ```
     */
    stream(): Stream.NonEmpty<GraphElement<N>>;
  }

  /**
   * A mutable `EdgeGraph` builder used to efficiently create new immutable instances.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeGraph.Builder API documentation](https://rimbu.org/api/rimbu/graph/EdgeGraph/Builder/interface)
   * @typeparam N - the node type
   */
  export interface Builder<N>
    extends EdgeGraphBase.Builder<N, EdgeGraph.Types> {}

  /**
   * The EdgeGraph's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends EdgeGraphBase.Context<UN, EdgeGraph.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends EdgeGraphBase.Types {
    readonly normal: EdgeGraph<this['_N']>;
    readonly nonEmpty: EdgeGraph.NonEmpty<this['_N']>;
    readonly context: EdgeGraph.Context<this['_N']>;
    readonly builder: EdgeGraph.Builder<this['_N']>;
  }
}

export const EdgeGraph: EdgeGraphCreators = Object.freeze({
  createContext<UN>(options: {
    linkMapContext: RMap.Context<UN>;
    linkConnectionsContext: RSet.Context<UN>;
  }): EdgeGraph.Context<UN> {
    return Object.freeze(
      new GraphContext<UN, 'EdgeGraph', false, any>(
        false,
        'EdgeGraph',
        options.linkMapContext,
        options.linkConnectionsContext
      )
    );
  },
});
