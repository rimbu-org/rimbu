import { SortedMap, SortedSet } from '@rimbu/sorted';
import type { Stream, Streamable } from '@rimbu/stream';

import type { EdgeGraphSortedCreators, GraphElement } from '#graph/custom';
import { type EdgeGraphBase, GraphContext } from '#graph/custom';

/**
 * An type-invariant immutable valued edge (undirected) graph.
 * The connections are internally maintained using sorted collections
 * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeGraphSorted API documentation](https://rimbu.org/api/rimbu/graph/EdgeGraphSorted/interface)
 * @typeparam N - the node type
 * @example
 * ```ts
 * const g1 = EdgeGraphSorted.empty<number>()
 * const g2 = EdgeGraphSorted.of([1], [2, 3], [2, 4])
 * ```
 */
export interface EdgeGraphSorted<N>
  extends EdgeGraphBase<N, EdgeGraphSorted.Types> {}

export namespace EdgeGraphSorted {
  /**
   * A non-empty type-invariant immutable valued edge (undirected) graph.
   * The connections are internally maintained using sorted collections
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeGraphSorted API documentation](https://rimbu.org/api/rimbu/graph/EdgeGraphSorted/interface)
   * @typeparam N - the node type
   */
  export interface NonEmpty<N>
    extends EdgeGraphBase.NonEmpty<N, EdgeGraphSorted.Types>,
      Omit<EdgeGraphSorted<N>, keyof EdgeGraphBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 2-valued tuples of nodes for connections.
     * @example
     * ```ts
     * EdgeGraphSorted.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     * ```
     */
    stream(): Stream.NonEmpty<GraphElement<N>>;
  }

  /**
   * A mutable `EdgeGraphSorted` builder used to efficiently create new immutable instances.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeGraphSorted.Builder API documentation](https://rimbu.org/api/rimbu/graph/EdgeGraphSorted/Builder/interface)
   * @typeparam N - the node type
   */
  export interface Builder<N>
    extends EdgeGraphBase.Builder<N, EdgeGraphSorted.Types> {}

  /**
   * The EdgeGraphSorted's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends EdgeGraphBase.Context<UN, EdgeGraphSorted.Types> {
    readonly typeTag: 'EdgeGraphSorted';
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends EdgeGraphBase.Types {
    readonly normal: EdgeGraphSorted<this['_N']>;
    readonly nonEmpty: EdgeGraphSorted.NonEmpty<this['_N']>;
    readonly context: EdgeGraphSorted.Context<this['_N']>;
    readonly builder: EdgeGraphSorted.Builder<this['_N']>;
    readonly linkMap: SortedMap<this['_N'], SortedSet<this['_N']>>;
    readonly linkMapNonEmpty: SortedMap.NonEmpty<
      this['_N'],
      SortedSet<this['_N']>
    >;
    readonly linkMapContext: SortedMap.Context<this['_N']>;
    readonly linkConnectionsContext: SortedSet.Context<this['_N']>;
    readonly linkMapBuilder: SortedMap.Builder<
      this['_N'],
      SortedSet.Builder<this['_N']>
    >;
    readonly linkConnectionsBuilder: SortedSet.Builder<this['_N']>;
    readonly linkConnections: SortedSet<this['_N']>;
  }
}

function createContext<UN>(options?: {
  linkMapContext?: SortedMap.Context<UN>;
  linkConnectionsContext?: SortedSet.Context<UN>;
}): EdgeGraphSorted.Context<UN> {
  return Object.freeze(
    new GraphContext<UN, 'EdgeGraphSorted', false, any>(
      false,
      'EdgeGraphSorted',
      options?.linkMapContext ?? SortedMap.defaultContext(),
      options?.linkConnectionsContext ?? SortedSet.defaultContext()
    )
  );
}

const _defaultContext: EdgeGraphSorted.Context<any> = createContext();

export const EdgeGraphSorted: EdgeGraphSortedCreators = Object.freeze({
  ..._defaultContext,
  createContext,
  defaultContext<UN>(): EdgeGraphSorted.Context<UN> {
    return _defaultContext;
  },
});
