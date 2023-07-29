import type { RMap, RSet } from '@rimbu/collection-types';
import type { Stream, Streamable } from '@rimbu/stream';

import type { ArrowGraphCreators, Link } from '@rimbu/graph/custom';
import { type ArrowGraphBase, GraphContext } from '@rimbu/graph/custom';

/**
 * An type-invariant immutable arrow (directed) graph.
 * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ArrowGraph API documentation](https://rimbu.org/api/rimbu/graph/ArrowGraph/interface)
 * @typeparam N - the node type
 */
export interface ArrowGraph<N> extends ArrowGraphBase<N, ArrowGraph.Types> {}

export namespace ArrowGraph {
  /**
   * A non-empty type-invariant immutable arrow (directed) graph.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ArrowGraph API documentation](https://rimbu.org/api/rimbu/graph/ArrowGraph/interface)
   * @typeparam N - the node type
   */
  export interface NonEmpty<N>
    extends ArrowGraphBase.NonEmpty<N, ArrowGraph.Types>,
      Omit<ArrowGraph<N>, keyof ArrowGraphBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<[N] | Link<N>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 2-valued tuples of nodes for connections.
     * @example
     * ```ts
     * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     * ```
     */
    stream(): Stream.NonEmpty<[N] | Link<N>>;
  }

  /**
   * A mutable `ArrowGraph` builder used to efficiently create new immutable instances.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ArrowGraph.Builder API documentation](https://rimbu.org/api/rimbu/graph/ArrowGraph/Builder/interface)
   * @typeparam N - the node type
   */
  export interface Builder<N>
    extends ArrowGraphBase.Builder<N, ArrowGraph.Types> {}

  /**
   * The ArrowGraph's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends ArrowGraphBase.Context<UN, ArrowGraph.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends ArrowGraphBase.Types {
    readonly normal: ArrowGraph<this['_N']>;
    readonly nonEmpty: ArrowGraph.NonEmpty<this['_N']>;
    readonly context: ArrowGraph.Context<this['_N']>;
    readonly builder: ArrowGraph.Builder<this['_N']>;
  }
}

export const ArrowGraph: ArrowGraphCreators = Object.freeze({
  createContext<UN>(options: {
    linkMapContext: RMap.Context<UN>;
    linkConnectionsContext: RSet.Context<UN>;
  }): ArrowGraph.Context<UN> {
    return Object.freeze(
      new GraphContext<UN, 'ArrowGraph', true, any>(
        true,
        'ArrowGraph',
        options.linkMapContext,
        options.linkConnectionsContext
      )
    );
  },
});
