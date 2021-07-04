import type { RMap, RSet } from '../../../collection-types/mod.ts';
import type { Stream, Streamable } from '../../../stream/mod.ts';
import type { Link } from '../../internal.ts';
import type { ArrowGraphBase } from '../graph-custom.ts';
import { GraphContext } from '../graph-custom.ts';

/**
 * An type-invariant immutable arrow (directed) graph.
 * @typeparam N - the node type
 */
export interface ArrowGraph<N> extends ArrowGraphBase<N, ArrowGraph.Types> {}

export namespace ArrowGraph {
  type NonEmptyBase<N> = ArrowGraphBase.NonEmpty<N, ArrowGraph.Types> &
    ArrowGraph<N>;

  /**
   * A non-empty type-invariant immutable arrow (directed) graph.
   * @typeparam N - the node type
   */
  export interface NonEmpty<N>
    extends NonEmptyBase<N>,
      Streamable.NonEmpty<[N] | Link<N>> {
    /**
     * Returns a non-empty `Stream` containing all graph elements of this collection as single tuples for isolated nodes
     * and 2-valued tuples of nodes for connections.
     * @example
     * ArrowGraphHashed.of([1], [2, 3]).stream().toArray()  // => [[1], [2, 3]]
     */
    stream(): Stream.NonEmpty<[N] | Link<N>>;
  }

  /**
   * A mutable `ArrowGraph` builder used to efficiently create new immutable instances.
   * @typeparam N - the node type
   */
  export interface Builder<N>
    extends ArrowGraphBase.Builder<N, ArrowGraph.Types> {}

  /**
   * The ArrowGraph's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends ArrowGraphBase.Context<UN, ArrowGraph.Types> {}

  export interface Types extends ArrowGraphBase.Types {
    readonly normal: ArrowGraph<this['_N']>;
    readonly nonEmpty: ArrowGraph.NonEmpty<this['_N']>;
    readonly context: ArrowGraph.Context<this['_N']>;
    readonly builder: ArrowGraph.Builder<this['_N']>;
  }
}

interface TypesImpl extends ArrowGraph.Types {
  readonly context: GraphContext<this['_N'], string, true, any>;
}

export const ArrowGraph = {
  /**
   * Returns a new ArrowGraph context instance based on the given `options`.
   * @typeparam UN - the upper node type for which the context can create instances
   * @param options - an object containing the following properties:
   * * linkMapContext - the map context to use to maintain link maps
   * * linkConnectionsContext - the set context to use to maintain link connection maps
   */
  createContext<UN>(options: {
    linkMapContext: RMap.Context<UN>;
    linkConnectionsContext: RSet.Context<UN>;
  }): ArrowGraph.Context<UN> {
    return new GraphContext<UN, 'ArrowGraph', true, TypesImpl>(
      true,
      'ArrowGraph',
      options.linkMapContext,
      options.linkConnectionsContext
    );
  },
};
