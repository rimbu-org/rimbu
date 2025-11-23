import type { Stream, Streamable } from '../../../../stream/mod.ts';

import type { GraphBase, GraphElement } from '../../../../graph/custom/index.ts';

/**
 * A type-invariant immutable graph.
 * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [Graph API documentation](https://rimbu.org/api/rimbu/graph/Graph/interface)
 * @typeparam N - the node type
 */
export interface Graph<N> extends GraphBase<N, Graph.Types> {}

export namespace Graph {
  /**
   * A non-empty type-invariant immutable graph.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [Graph API documentation](https://rimbu.org/api/rimbu/graph/Graph/interface)
   * @typeparam N - the node type
   */
  export interface NonEmpty<N>
    extends GraphBase.NonEmpty<N, Graph.Types>,
      Omit<Graph<N>, keyof GraphBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 2-valued tuples of nodes for connections.
     * @example
     * ```ts
     * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     * ```
     */
    stream(): Stream.NonEmpty<GraphElement<N>>;
  }

  /**
   * A mutable `Graph` builder used to efficiently create new immutable instances.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [Graph.Builder API documentation](https://rimbu.org/api/rimbu/graph/Graph/Builder/interface)
   * @typeparam N - the node type
   */
  export interface Builder<N> extends GraphBase.Builder<N, Graph.Types> {}

  /**
   * The Graph's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN> extends GraphBase.Context<UN, Graph.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends GraphBase.Types {
    readonly normal: Graph<this['_N']>;
    readonly nonEmpty: Graph.NonEmpty<this['_N']>;
    readonly context: Graph.Context<this['_N']>;
  }
}
