import type { RMap } from 'https://deno.land/x/rimbu/collection-types/mod.ts';
import { ValuedGraphCustom, ValuedGraphElement } from 'https://deno.land/x/rimbu/graph/mod.ts';
import type { Stream, Streamable } from 'https://deno.land/x/rimbu/stream/mod.ts';
import type { ArrowValuedGraphBase } from '../graph-custom.ts';

/**
 * An type-invariant immutable valued arrow (directed) graph.
 * @typeparam N - the node type
 * @typeparam V - the connection value type
 */
export interface ArrowValuedGraph<N, V>
  extends ArrowValuedGraphBase<N, V, ArrowValuedGraph.Types> {}

export namespace ArrowValuedGraph {
  type NonEmptyBase<N, V> = ArrowValuedGraphBase.NonEmpty<
    N,
    V,
    ArrowValuedGraph.Types
  > &
    ArrowValuedGraph<N, V>;

  /**
   * A non-empty type-invariant immutable valued arrow (directed) graph.
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface NonEmpty<N, V>
    extends NonEmptyBase<N, V>,
      Streamable.NonEmpty<ValuedGraphElement<N, V>> {
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
     * @example
     * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     */
    stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
  }

  /**
   * A mutable `ArrowValuedGraph` builder used to efficiently create new immutable instances.
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface Builder<N, V>
    extends ArrowValuedGraphBase.Builder<N, V, ArrowValuedGraph.Types> {}

  /**
   * The ArrowValuedGraph's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends ArrowValuedGraphBase.Context<UN, ArrowValuedGraph.Types> {}

  export interface Types extends ArrowValuedGraphBase.Types {
    readonly normal: ArrowValuedGraph<this['_N'], this['_V']>;
    readonly nonEmpty: ArrowValuedGraph.NonEmpty<this['_N'], this['_V']>;
    readonly context: ArrowValuedGraph.Context<this['_N']>;
    readonly builder: ArrowValuedGraph.Builder<this['_N'], this['_V']>;
  }
}

interface TypesImpl extends ArrowValuedGraph.Types {
  readonly context: ValuedGraphCustom.ValuedGraphContext<
    this['_N'],
    string,
    any
  >;
}

export const ArrowValuedGraph = {
  /**
   * Returns a new ArrowValuedGraph context instance based on the given `options`.
   * @typeparam UN - the upper node type for which the context can create instances
   * @param options - an object containing the following properties:
   * * linkMapContext - the map context to use to maintain link maps
   * * linkConnectionsContext - the map context to use to maintain link connection maps
   */
  createContext<UN>(options: {
    linkMapContext: RMap.Context<UN>;
    linkConnectionsContext: RMap.Context<UN>;
  }): ArrowValuedGraph.Context<UN> {
    return new ValuedGraphCustom.ValuedGraphContext<
      UN,
      'ArrowValuedGraph',
      TypesImpl
    >(
      true,
      'ArrowValuedGraph',
      options.linkMapContext,
      options.linkConnectionsContext
    );
  },
};
