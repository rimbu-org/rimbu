import type { RSet } from '@rimbu/collection-types';
import type { OmitStrong } from '@rimbu/common';
import { HashMap, HashSet } from '@rimbu/hashed';
import type { Stream, Streamable } from '@rimbu/stream';
import type { GraphElement } from '../../internal';
import type { EdgeGraphBase } from '../graph-custom';
import { GraphContext } from '../graph-custom';

/**
 * An type-invariant immutable valued edge (undirected) graph.
 * The connections are internally maintained using hashed collections
 * @typeparam N - the node type
 * @example
 * const g1 = EdgeGraphHashed.empty<number>()
 * const g2 = EdgeGraphHashed.of([1], [2, 3], [2, 4])
 */
export interface EdgeGraphHashed<N>
  extends EdgeGraphBase<N, EdgeGraphHashed.Types> {}

export namespace EdgeGraphHashed {
  type NonEmptyBase<N> = EdgeGraphBase.NonEmpty<N, EdgeGraphHashed.Types> &
    EdgeGraphHashed<N>;

  /**
   * A non-empty type-invariant immutable valued edge (undirected) graph.
   * The connections are internally maintained using hashed collections
   * @typeparam N - the node type
   */
  export interface NonEmpty<N>
    extends NonEmptyBase<N>,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 2-valued tuples of nodes for connections.
     * @example
     * EdgeGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     */
    stream(): Stream.NonEmpty<GraphElement<N>>;
  }

  /**
   * A mutable `EdgeGraphHashed` builder used to efficiently create new immutable instances.
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

  export interface Types extends EdgeGraphBase.Types {
    readonly normal: EdgeGraphHashed<this['_N']>;
    readonly nonEmpty: EdgeGraphHashed.NonEmpty<this['_N']>;
    readonly context: EdgeGraphHashed.Context<this['_N']>;
    readonly builder: EdgeGraphHashed.Builder<this['_N']>;
    readonly linkMap: HashMap<this['_N'], HashSet<this['_N']>> &
      HashMap<this['_N'], RSet<this['_N']>>;
    readonly linkMapNonEmpty: HashMap.NonEmpty<
      this['_N'],
      HashSet<this['_N']>
    > &
      HashMap.NonEmpty<this['_N'], RSet<this['_N']>>;
    readonly linkMapContext: HashMap.Context<this['_N']>;
    readonly linkConnectionsContext: HashSet.Context<this['_N']>;
    readonly linkMapBuilder: HashMap.Builder<
      this['_N'],
      HashSet.Builder<this['_N']>
    > &
      HashMap.Builder<this['_N'], RSet.Builder<this['_N']>>;
    readonly linkConnectionsBuilder: HashSet.Builder<this['_N']>;
    readonly linkConnections: HashSet<this['_N']>;
  }
}

interface TypesImpl extends EdgeGraphHashed.Types {
  readonly context: GraphContext<this['_N'], 'EdgeGraphHashed', false, any>;
}

function createContext<UN>(options?: {
  linkMapContext?: HashMap.Context<UN>;
  linkConnectionsContext?: HashSet.Context<UN>;
}): EdgeGraphHashed.Context<UN> {
  return new GraphContext<UN, 'EdgeGraphHashed', false, TypesImpl>(
    false,
    'EdgeGraphHashed',
    options?.linkMapContext ?? HashMap.defaultContext(),
    options?.linkConnectionsContext ?? HashSet.defaultContext()
  );
}

const _defaultContext: EdgeGraphHashed.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new EdgeGraphHashed context instance based on the given `options`.
   * @typeparam UN - the upper node type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * linkMapContext - (optional) the map context to use to maintain link maps
   * * linkConnectionsContext - (optional) the set context to use to maintain link connections
   */
  createContext,
  /**
   * Returns the default context for this type of graph.
   * @typeparam UN - the upper node type that the context should accept
   */
  defaultContext<UN>(): EdgeGraphHashed.Context<UN> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  EdgeGraphHashed.Context<any>,
  'typeTag' | 'linkMapContext' | 'linkConnectionsContext' | 'isDirected'
> &
  typeof _contextHelpers;

export const EdgeGraphHashed: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
