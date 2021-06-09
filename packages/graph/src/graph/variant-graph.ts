import { Stream, Streamable } from '@rimbu/stream';
import type { GraphElement, Link } from '../internal';
import type { VariantGraphBase } from './graph-custom';

/**
 * An type-variant immutable graph.
 * @typeparam N - the node type
 */
export interface VariantGraph<N>
  extends VariantGraphBase<N, unknown, VariantGraph.Types> {}

export namespace VariantGraph {
  type NonEmptyBase<N> = VariantGraphBase.NonEmpty<N, VariantGraph.Types> &
    VariantGraph<N>;

  /**
   * A non-empty type-variant immutable graph.
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
    stream(): Stream.NonEmpty<[N] | Link<N>>;
  }

  export interface Types extends VariantGraphBase.Types {
    readonly normal: VariantGraph<this['_N']>;
    readonly nonEmpty: VariantGraph.NonEmpty<this['_N']>;
  }
}
