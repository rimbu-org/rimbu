import type { Stream, Streamable } from '@rimbu/stream';

import type {
  ValuedGraphElement,
  VariantValuedGraphBase,
} from '@rimbu/graph/custom';

/**
 * A type-variant immutable valued graph.
 * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [VariantValuedGraph API documentation](https://rimbu.org/api/rimbu/graph/VariantValuedGraph/interface)
 * @typeparam N - the node type
 * @typeparam V - the connection value type
 */
export interface VariantValuedGraph<N, V>
  extends VariantValuedGraphBase<N, V, VariantValuedGraph.Types> {}

export namespace VariantValuedGraph {
  /**
   * A non-empty type-variant immutable valued graph.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [VariantValuedGraph API documentation](https://rimbu.org/api/rimbu/graph/VariantValuedGraph/interface)
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface NonEmpty<N, V>
    extends VariantValuedGraphBase.NonEmpty<N, V, VariantValuedGraph.Types>,
      Omit<
        VariantValuedGraph<N, V>,
        keyof VariantValuedGraphBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<ValuedGraphElement<N, V>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 3-valued tuples containing the source node, target node, and connection value for connections.
     * @example
     * ```ts
     * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     * ```
     */
    stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends VariantValuedGraphBase.Types {
    readonly normal: VariantValuedGraph<this['_N'], this['_V']>;
    readonly nonEmpty: VariantValuedGraph.NonEmpty<this['_N'], this['_V']>;
  }
}
