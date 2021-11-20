import type { RMap } from '../../collection-types/mod.ts';
import { ValuedGraphCustom, ValuedGraphElement } from '../../graph/mod.ts';
import type { Stream, Streamable } from '../../stream/mod.ts';
import type { EdgeValuedGraphBase } from '../graph-custom.ts';

/**
 * An type-invariant immutable valued edge (undirected) graph.
 * @typeparam N - the node type
 * @typeparam V - the connection value type
 */
export interface EdgeValuedGraph<N, V>
  extends EdgeValuedGraphBase<N, V, EdgeValuedGraph.Types> {}

export namespace EdgeValuedGraph {
  /**
   * A non-empty type-invariant immutable valued edge (undirected) graph.
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface NonEmpty<N, V>
    extends EdgeValuedGraphBase.NonEmpty<N, V, EdgeValuedGraph.Types>,
      Omit<
        EdgeValuedGraph<N, V>,
        keyof EdgeValuedGraphBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<ValuedGraphElement<N, V>> {
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
     * @example
     * EdgeValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     */
    stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
  }

  /**
   * A mutable `EdgeValuedGraph` builder used to efficiently create new immutable instances.
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface Builder<N, V>
    extends EdgeValuedGraphBase.Builder<N, V, EdgeValuedGraph.Types> {}

  /**
   * The EdgeValuedGraph's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends EdgeValuedGraphBase.Context<UN, EdgeValuedGraph.Types> {}

  export interface Types extends EdgeValuedGraphBase.Types {
    readonly normal: EdgeValuedGraph<this['_N'], this['_V']>;
    readonly nonEmpty: EdgeValuedGraph.NonEmpty<this['_N'], this['_V']>;
    readonly context: EdgeValuedGraph.Context<this['_N']>;
    readonly builder: EdgeValuedGraph.Builder<this['_N'], this['_V']>;
  }
}

export const EdgeValuedGraph = {
  /**
   * Returns a new EdgeValuedGraph context instance based on the given `options`.
   * @typeparam UN - the upper node type for which the context can create instances
   * @param options - an object containing the following properties:
   * * linkMapContext - the map context to use to maintain link maps
   * * linkConnectionsContext - the map context to use to maintain link connection maps
   */
  createContext<UN>(options: {
    linkMapContext: RMap.Context<UN>;
    linkConnectionsContext: RMap.Context<UN>;
  }): EdgeValuedGraph.Context<UN> {
    return new ValuedGraphCustom.ValuedGraphContext<
      UN,
      'ArrowValuedGraph',
      any
    >(
      true,
      'ArrowValuedGraph',
      options.linkMapContext,
      options.linkConnectionsContext
    );
  },
};
