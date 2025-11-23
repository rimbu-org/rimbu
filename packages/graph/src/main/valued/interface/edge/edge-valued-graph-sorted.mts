import type { Stream, Streamable } from '@rimbu/stream';
import { SortedMap } from '@rimbu/sorted';

import type {
  EdgeValuedGrapSortedCreators,
  ValuedGraphElement,
} from '@rimbu/graph/custom';
import {
  type EdgeValuedGraphBase,
  ValuedGraphContext,
} from '@rimbu/graph/custom';

/**
 * A type-invariant immutable valued edge (undirected) graph.
 * The nodes are internally maintained using SortedMaps
 * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeValuedGraphSorted API documentation](https://rimbu.org/api/rimbu/graph/EdgeValuedGraphSorted/interface)
 * @typeparam N - the node type
 * @typeparam V - the connection value type
 * @example
 * ```ts
 * const g1 = EdgeValuedGraphSorted.empty<number, string>()
 * const g2 = EdgeValuedGraphSorted.of([1], [2, 3, 'a'], [2, 4, 'b'])
 * ```
 */
export interface EdgeValuedGraphSorted<N, V>
  extends EdgeValuedGraphBase<N, V, EdgeValuedGraphSorted.Types> {}

export namespace EdgeValuedGraphSorted {
  /**
   * A non-empty type-invariant immutable valued edge (undirected) graph.
   * The nodes are internally maintained using SortedMaps
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeValuedGraphSorted API documentation](https://rimbu.org/api/rimbu/graph/EdgeValuedGraphSorted/interface)
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface NonEmpty<N, V>
    extends EdgeValuedGraphBase.NonEmpty<N, V, EdgeValuedGraphSorted.Types>,
      Omit<
        EdgeValuedGraphSorted<N, V>,
        keyof EdgeValuedGraphBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<ValuedGraphElement<N, V>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 3-valued tuples containing the source node, target node, and connection value for connections.
     * @example
     * ```ts
     * EdgeValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     * ```
     */
    stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
  }

  /**
   * A mutable `EdgeValuedGraphSorted` builder used to efficiently create new immutable instances.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeValuedGraphSorted.Builder API documentation](https://rimbu.org/api/rimbu/graph/EdgeValuedGraphSorted/Builder/interface)
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface Builder<N, V>
    extends EdgeValuedGraphBase.Builder<N, V, EdgeValuedGraphSorted.Types> {}

  /**
   * The EdgeValuedGraphSorted's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends EdgeValuedGraphBase.Context<UN, EdgeValuedGraphSorted.Types> {
    readonly typeTag: 'EdgeValuedGraphSorted';
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends EdgeValuedGraphBase.Types {
    readonly normal: EdgeValuedGraphSorted<this['_N'], this['_V']>;
    readonly nonEmpty: EdgeValuedGraphSorted.NonEmpty<this['_N'], this['_V']>;
    readonly context: EdgeValuedGraphSorted.Context<this['_N']>;
    readonly builder: EdgeValuedGraphSorted.Builder<this['_N'], this['_V']>;
    readonly linkMap: SortedMap<this['_N'], SortedMap<this['_N'], this['_V']>>;
    readonly linkMapNonEmpty: SortedMap.NonEmpty<
      this['_N'],
      SortedMap<this['_N'], this['_V']>
    >;
    readonly linkMapContext: SortedMap.Context<this['_N']>;
    readonly linkConnectionsContext: SortedMap.Context<this['_N']>;
    readonly linkMapBuilder: SortedMap.Builder<
      this['_N'],
      SortedMap.Builder<this['_N'], this['_V']>
    >;
    readonly linkConnectionsBuilder: SortedMap.Builder<this['_N'], this['_V']>;
    readonly linkConnections: SortedMap<this['_N'], this['_V']>;
  }
}

function createContext<UN>(options?: {
  linkMapContext?: SortedMap.Context<UN>;
  linkConnectionsContext?: SortedMap.Context<UN>;
}): EdgeValuedGraphSorted.Context<UN> {
  return Object.freeze(
    new ValuedGraphContext<UN, 'EdgeValuedGraphSorted', any>(
      false,
      'EdgeValuedGraphSorted',
      options?.linkMapContext ?? SortedMap.defaultContext(),
      options?.linkConnectionsContext ?? SortedMap.defaultContext()
    )
  );
}

const _defaultContext: EdgeValuedGraphSorted.Context<any> = createContext();

export const EdgeValuedGraphSorted: EdgeValuedGrapSortedCreators =
  Object.freeze({
    ..._defaultContext,
    createContext,
    defaultContext<UN>(): EdgeValuedGraphSorted.Context<UN> {
      return _defaultContext;
    },
  });
