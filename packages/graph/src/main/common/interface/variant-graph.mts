import type { VariantMap, VariantSet } from '@rimbu/collection-types';
import type { Stream, Streamable } from '@rimbu/stream';

import type { GraphElement, Link, VariantGraphBase } from '@rimbu/graph/custom';

/**
 * An type-variant immutable graph.
 * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [VariantGraph API documentation](https://rimbu.org/api/rimbu/graph/VariantGraph/interface)
 * @typeparam N - the node type
 */
export interface VariantGraph<N>
  extends VariantGraphBase<N, unknown, VariantGraph.Types> {
  /**
   * Returns the nested Map representation of the graph connections.
   * @example
   * ```ts
   * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).linkMap.toArray()
   * // => [[1, HashMap(2 -> 'a')], [2, HashMap(3 -> 'b')]]
   * ```
   */
  readonly linkMap: VariantMap<N, VariantSet<N>>;
}

export namespace VariantGraph {
  /**
   * A non-empty type-variant immutable graph.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [VariantGraph API documentation](https://rimbu.org/api/rimbu/graph/VariantGraph/interface)
   * @typeparam N - the node type
   */
  export interface NonEmpty<N>
    extends VariantGraphBase.NonEmpty<N, VariantGraph.Types>,
      Omit<VariantGraph<N>, keyof VariantGraphBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns the nested Map representation of the graph connections.
     * @example
     * ```ts
     * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).linkMap.toArray()
     * // => [[1, HashMap(2 -> 'a')], [2, HashMap(3 -> 'b')]]
     * ```
     */
    readonly linkMap: VariantMap.NonEmpty<N, VariantSet<N>>;

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
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends VariantGraphBase.Types {
    readonly normal: VariantGraph<this['_N']>;
    readonly nonEmpty: VariantGraph.NonEmpty<this['_N']>;
  }
}
