import { RSet } from '@rimbu/collection-types';
import { OmitStrong } from '@rimbu/common';
import { HashMap, HashSet } from '@rimbu/hashed';
import { Stream, Streamable } from '@rimbu/stream';
import { ArrowGraphBase, GraphContext } from '../../graph-custom';
import { GraphElement } from '../../internal';

/**
 * An type-invariant immutable valued arrow (directed) graph.
 * The connections are internally maintained using hashed collections
 * @typeparam N - the node type
 * @example
 * const g1 = ArrowGraphHashed.empty<number>()
 * const g2 = ArrowGraphHashed.of([1], [2, 3], [2, 4])
 */
export interface ArrowGraphHashed<N>
  extends ArrowGraphBase<N, ArrowGraphHashed.Types> {}

export namespace ArrowGraphHashed {
  type NonEmptyBase<N> = ArrowGraphBase.NonEmpty<N, ArrowGraphHashed.Types> &
    ArrowGraphHashed<N>;

  /**
   * A non-empty type-invariant immutable valued arrow (directed) graph.
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
     * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     */
    stream(): Stream.NonEmpty<GraphElement<N>>;
  }

  /**
   * A mutable `ArrowGraphHashed` builder used to efficiently create new immutable instances.
   * @typeparam N - the node type
   */
  export interface Builder<N>
    extends ArrowGraphBase.Builder<N, ArrowGraphHashed.Types> {}

  /**
   * The ArrowGraphHashed's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends ArrowGraphBase.Context<UN, ArrowGraphHashed.Types> {
    readonly typeTag: 'ArrowGraphHashed';
  }

  export interface Types extends ArrowGraphBase.Types {
    normal: ArrowGraphHashed<this['_N']>;
    nonEmpty: ArrowGraphHashed.NonEmpty<this['_N']>;
    context: ArrowGraphHashed.Context<this['_N']>;
    builder: ArrowGraphHashed.Builder<this['_N']>;
    linkMap: HashMap<this['_N'], HashSet<this['_N']>> &
      HashMap<this['_N'], RSet<this['_N']>>;
    linkMapNonEmpty: HashMap.NonEmpty<this['_N'], HashSet<this['_N']>> &
      HashMap.NonEmpty<this['_N'], RSet<this['_N']>>;
    linkMapContext: HashMap.Context<this['_N']>;
    linkConnectionsContext: HashSet.Context<this['_N']>;
    linkMapBuilder: HashMap.Builder<this['_N'], HashSet.Builder<this['_N']>> &
      HashMap.Builder<this['_N'], RSet.Builder<this['_N']>>;
    linkConnectionsBuilder: HashSet.Builder<this['_N']>;
    linkConnections: HashSet<this['_N']>;
  }
}

interface TypesImpl extends ArrowGraphHashed.Types {
  context: GraphContext<this['_N'], 'ArrowGraphHashed', true, any>;
}

function createContext<UN>(options?: {
  linkMapContext?: HashMap.Context<UN>;
  linkConnectionsContext?: HashSet.Context<UN>;
}): ArrowGraphHashed.Context<UN> {
  return new GraphContext<UN, 'ArrowGraphHashed', true, TypesImpl>(
    true,
    'ArrowGraphHashed',
    options?.linkMapContext ?? HashMap.defaultContext(),
    options?.linkConnectionsContext ?? HashSet.defaultContext()
  );
}

const _defaultContext: ArrowGraphHashed.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new ArrowValuedGraphHashed context instance based on the given `options`.
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
  defaultContext<UN>(): ArrowGraphHashed.Context<UN> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  ArrowGraphHashed.Context<any>,
  'typeTag' | 'linkMapContext' | 'linkConnectionsContext' | 'isDirected'
> &
  typeof _contextHelpers;

export const ArrowGraphHashed: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
