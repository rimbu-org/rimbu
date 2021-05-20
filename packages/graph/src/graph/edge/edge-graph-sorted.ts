import { RSet } from '@rimbu/collection-types';
import { OmitStrong } from '@rimbu/common';
import { SortedMap, SortedSet } from '@rimbu/sorted';
import { Stream, Streamable } from '@rimbu/stream';
import { EdgeGraphBase, GraphContext } from '../../graph-custom';
import { GraphElement } from '../../internal';

/**
 * An type-invariant immutable valued edge (undirected) graph.
 * The connections are internally maintained using sorted collections
 * @typeparam N - the node type
 * @example
 * const g1 = EdgeGraphSorted.empty<number>()
 * const g2 = EdgeGraphSorted.of([1], [2, 3], [2, 4])
 */
export interface EdgeGraphSorted<N>
  extends EdgeGraphBase<N, EdgeGraphSorted.Types> {}

export namespace EdgeGraphSorted {
  type NonEmptyBase<N> = EdgeGraphBase.NonEmpty<N, EdgeGraphSorted.Types> &
    EdgeGraphSorted<N>;

  /**
   * A non-empty type-invariant immutable valued edge (undirected) graph.
   * The connections are internally maintained using sorted collections
   * @typeparam N - the node type
   */
  export interface NonEmpty<N>
    extends NonEmptyBase<N>,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 2-valued tuples of nodes for connections.
     * @example
     * EdgeGraphSorted.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     */
    stream(): Stream.NonEmpty<GraphElement<N>>;
  }

  /**
   * A mutable `EdgeGraphSorted` builder used to efficiently create new immutable instances.
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

  export interface Types extends EdgeGraphBase.Types {
    normal: EdgeGraphSorted<this['_N']>;
    nonEmpty: EdgeGraphSorted.NonEmpty<this['_N']>;
    context: EdgeGraphSorted.Context<this['_N']>;
    builder: EdgeGraphSorted.Builder<this['_N']>;
    linkMap: SortedMap<this['_N'], SortedSet<this['_N']>> &
      SortedMap<this['_N'], RSet<this['_N']>>;
    linkMapNonEmpty: SortedMap.NonEmpty<this['_N'], SortedSet<this['_N']>> &
      SortedMap.NonEmpty<this['_N'], RSet<this['_N']>>;
    linkMapContext: SortedMap.Context<this['_N']>;
    linkConnectionsContext: SortedSet.Context<this['_N']>;
    linkMapBuilder: SortedMap.Builder<
      this['_N'],
      SortedSet.Builder<this['_N']>
    > &
      SortedMap.Builder<this['_N'], RSet.Builder<this['_N']>>;
    linkConnectionsBuilder: SortedSet.Builder<this['_N']>;
    linkConnections: SortedSet<this['_N']>;
  }
}

interface TypesImpl extends EdgeGraphSorted.Types {
  context: GraphContext<this['_N'], 'EdgeGraphSorted', false, any>;
}

function createContext<UN>(options?: {
  linkMapContext?: SortedMap.Context<UN>;
  linkConnectionsContext?: SortedSet.Context<UN>;
}): EdgeGraphSorted.Context<UN> {
  return new GraphContext<UN, 'EdgeGraphSorted', false, TypesImpl>(
    false,
    'EdgeGraphSorted',
    options?.linkMapContext ?? SortedMap.defaultContext(),
    options?.linkConnectionsContext ?? SortedSet.defaultContext()
  );
}

const _defaultContext: EdgeGraphSorted.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new EdgeGraphSorted context instance based on the given `options`.
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
  defaultContext<UN>(): EdgeGraphSorted.Context<UN> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  EdgeGraphSorted.Context<any>,
  'typeTag' | 'linkMapContext' | 'linkConnectionsContext' | 'isDirected'
> &
  typeof _contextHelpers;

export const EdgeGraphSorted: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
