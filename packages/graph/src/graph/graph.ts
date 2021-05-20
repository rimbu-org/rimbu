import { Stream, Streamable } from '@rimbu/stream';
import { GraphElement } from '../common/utils';
import { GraphBase } from '../graph-custom';

/**
 * An type-invariant immutable graph.
 * @typeparam N - the node type
 */
export interface Graph<N> extends GraphBase<N, Graph.Types> {}

export namespace Graph {
  type NonEmptyBase<N> = GraphBase.NonEmpty<N, Graph.Types> & Graph<N>;

  /**
   * A non-empty type-invariant immutable graph.
   * @typeparam N - the node type
   */
  export interface NonEmpty<N>
    extends NonEmptyBase<N>,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 2-valued tuples of nodes for connections.
     * @example
     * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     */
    stream(): Stream.NonEmpty<GraphElement<N>>;
  }

  /**
   * A mutable `Graph` builder used to efficiently create new immutable instances.
   * @typeparam N - the node type
   */
  export interface Builder<N> extends GraphBase.Builder<N, Graph.Types> {}

  /**
   * The EdgeValuedGraGraphphSorted's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN> extends GraphBase.Context<UN, Graph.Types> {}

  export interface Types extends GraphBase.Types {
    normal: Graph<this['_N']>;
    nonEmpty: Graph.NonEmpty<this['_N']>;
    context: Graph.Context<this['_N']>;
  }
}
