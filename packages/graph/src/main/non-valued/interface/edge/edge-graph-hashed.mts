import { HashMap, HashSet } from '@rimbu/hashed';
import type { Stream, Streamable } from '@rimbu/stream';

import type {
  GraphElement,
  EdgeGraphHashedCreators,
} from '@rimbu/graph/custom';
import { type EdgeGraphBase, GraphContext } from '@rimbu/graph/custom';

/**
 * A type-invariant immutable edge (undirected) graph.
 * The connections are internally maintained using hashed collections.
 * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeGraphHashed API documentation](https://rimbu.org/api/rimbu/graph/EdgeGraphHashed/interface)
 * @typeparam N - the node type
 * @example
 * ```ts
 * const g1 = EdgeGraphHashed.empty<number>()
 * const g2 = EdgeGraphHashed.of([1], [2, 3], [2, 4])
 * ```
 */
export interface EdgeGraphHashed<N>
  extends EdgeGraphBase<N, EdgeGraphHashed.Types> {}

export namespace EdgeGraphHashed {
  /**
   * A non-empty type-invariant immutable edge (undirected) graph.
   * The connections are internally maintained using hashed collections.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeGraphHashed API documentation](https://rimbu.org/api/rimbu/graph/EdgeGraphHashed/interface)
   * @typeparam N - the node type
   */
  export interface NonEmpty<N>
    extends EdgeGraphBase.NonEmpty<N, EdgeGraphHashed.Types>,
      Omit<EdgeGraphHashed<N>, keyof EdgeGraphBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 2-valued tuples of nodes for connections.
     * @example
     * ```ts
     * EdgeGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     * ```
     */
    stream(): Stream.NonEmpty<GraphElement<N>>;
  }

  /**
   * A mutable `EdgeGraphHashed` builder used to efficiently create new immutable instances.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeGraphHashed.Builder API documentation](https://rimbu.org/api/rimbu/graph/EdgeGraphHashed/Builder/interface)
   * @typeparam N - the node type
   */
  export interface Builder<N>
    extends EdgeGraphBase.Builder<N, EdgeGraphHashed.Types> {}

  /**
   * The EdgeGraphHashed's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends EdgeGraphBase.Context<UN, EdgeGraphHashed.Types> {
    readonly typeTag: 'EdgeGraphHashed';
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends EdgeGraphBase.Types {
    readonly normal: EdgeGraphHashed<this['_N']>;
    readonly nonEmpty: EdgeGraphHashed.NonEmpty<this['_N']>;
    readonly context: EdgeGraphHashed.Context<this['_N']>;
    readonly builder: EdgeGraphHashed.Builder<this['_N']>;
    readonly linkMap: HashMap<this['_N'], HashSet<this['_N']>>;
    readonly linkMapNonEmpty: HashMap.NonEmpty<this['_N'], HashSet<this['_N']>>;
    readonly linkMapContext: HashMap.Context<this['_N']>;
    readonly linkConnectionsContext: HashSet.Context<this['_N']>;
    readonly linkMapBuilder: HashMap.Builder<
      this['_N'],
      HashSet.Builder<this['_N']>
    >;
    readonly linkConnectionsBuilder: HashSet.Builder<this['_N']>;
    readonly linkConnections: HashSet<this['_N']>;
  }
}

function createContext<UN>(options?: {
  linkMapContext?: HashMap.Context<UN>;
  linkConnectionsContext?: HashSet.Context<UN>;
}): EdgeGraphHashed.Context<UN> {
  return Object.freeze(
    new GraphContext<UN, 'EdgeGraphHashed', false, any>(
      false,
      'EdgeGraphHashed',
      options?.linkMapContext ?? HashMap.defaultContext(),
      options?.linkConnectionsContext ?? HashSet.defaultContext()
    )
  );
}

const _defaultContext: EdgeGraphHashed.Context<any> = createContext();

export const EdgeGraphHashed: EdgeGraphHashedCreators = Object.freeze({
  ..._defaultContext,
  createContext,
  defaultContext<UN>(): EdgeGraphHashed.Context<UN> {
    return _defaultContext;
  },
});
