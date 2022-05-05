import type { RMap } from '../../../../../collection-types/mod.ts';
import type { Stream, Streamable } from '../../../../../stream/mod.ts';

import type { ValuedGraphElement } from '../../../../../graph/custom/index.ts';

import { ArrowValuedGraphBase, ValuedGraphContext } from '../../../../../graph/custom/index.ts';

/**
 * An type-invariant immutable valued arrow (directed) graph.
 * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ArrowValuedGraph API documentation](https://rimbu.org/api/rimbu/graph/ArrowValuedGraph/interface)
 * @typeparam N - the node type
 * @typeparam V - the connection value type
 */
export interface ArrowValuedGraph<N, V>
  extends ArrowValuedGraphBase<N, V, ArrowValuedGraph.Types> {}

export namespace ArrowValuedGraph {
  /**
   * A non-empty type-invariant immutable valued arrow (directed) graph.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ArrowValuedGraph API documentation](https://rimbu.org/api/rimbu/graph/ArrowValuedGraph/interface)
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface NonEmpty<N, V>
    extends ArrowValuedGraphBase.NonEmpty<N, V, ArrowValuedGraph.Types>,
      Omit<
        ArrowValuedGraph<N, V>,
        keyof ArrowValuedGraphBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<ValuedGraphElement<N, V>> {
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
     * @example
     * ```ts
     * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     * ```
     */
    stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
  }

  /**
   * A mutable `ArrowValuedGraph` builder used to efficiently create new immutable instances.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ArrowValuedGraph.Builder API documentation](https://rimbu.org/api/rimbu/graph/ArrowValuedGraph/Builder/interface)
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

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends ArrowValuedGraphBase.Types {
    readonly normal: ArrowValuedGraph<this['_N'], this['_V']>;
    readonly nonEmpty: ArrowValuedGraph.NonEmpty<this['_N'], this['_V']>;
    readonly context: ArrowValuedGraph.Context<this['_N']>;
    readonly builder: ArrowValuedGraph.Builder<this['_N'], this['_V']>;
  }
}

export const ArrowValuedGraph = {
  /**
   * Returns a new ArrowValuedGraph context instance based on the given `options`.
   * @typeparam UN - the upper node type for which the context can create instances
   * @param options - an object containing the following properties:<br/>
   * - linkMapContext - the map context to use to maintain link maps<br/>
   * - linkConnectionsContext - the map context to use to maintain link connection maps
   */
  createContext<UN>(options: {
    linkMapContext: RMap.Context<UN>;
    linkConnectionsContext: RMap.Context<UN>;
  }): ArrowValuedGraph.Context<UN> {
    return new ValuedGraphContext<UN, 'ArrowValuedGraph', any>(
      true,
      'ArrowValuedGraph',
      options.linkMapContext,
      options.linkConnectionsContext
    );
  },
};
