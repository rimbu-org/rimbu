import type { Stream, Streamable } from '@rimbu/stream';
import { HashMap } from '@rimbu/hashed';

import type {
  EdgeValuedGraphHashedCreators,
  ValuedGraphElement,
} from '@rimbu/graph/custom';
import {
  type EdgeValuedGraphBase,
  ValuedGraphContext,
} from '@rimbu/graph/custom';

/**
 * An type-invariant immutable valued edge (undirected) graph.
 * The nodes are internally maintained using HashMaps
 * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeValuedGraphHashed API documentation](https://rimbu.org/api/rimbu/graph/EdgeValuedGraphHashed/interface)
 * @typeparam N - the node type
 * @typeparam V - the connection value type
 * @example
 * ```ts
 * const g1 = EdgeValuedGraphHashed.empty<number, string>()
 * const g2 = EdgeValuedGraphHashed.of([1], [2, 3, 'a'], [2, 4, 'b'])
 * ```
 */
export interface EdgeValuedGraphHashed<N, V>
  extends EdgeValuedGraphBase<N, V, EdgeValuedGraphHashed.Types> {}

export namespace EdgeValuedGraphHashed {
  /**
   * A non-empty type-invariant immutable valued edge (undirected) graph.
   * The nodes are internally maintained using HashMaps
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeValuedGraphHashed API documentation](https://rimbu.org/api/rimbu/graph/EdgeValuedGraphHashed/interface)
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface NonEmpty<N, V>
    extends EdgeValuedGraphBase.NonEmpty<N, V, EdgeValuedGraphHashed.Types>,
      Omit<
        EdgeValuedGraphHashed<N, V>,
        keyof EdgeValuedGraphBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<ValuedGraphElement<N, V>> {
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
     * @example
     * ```ts
     * EdgeValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     * ```
     */
    stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
  }

  /**
   * A mutable `EdgeValuedGraphHashed` builder used to efficiently create new immutable instances.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [EdgeValuedGraphHashed.Builder API documentation](https://rimbu.org/api/rimbu/graph/EdgeValuedGraphHashed/Builder/interface)
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface Builder<N, V>
    extends EdgeValuedGraphBase.Builder<N, V, EdgeValuedGraphHashed.Types> {}

  /**
   * The EdgeValuedGraphHashed's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends EdgeValuedGraphBase.Context<UN, EdgeValuedGraphHashed.Types> {
    readonly typeTag: 'EdgeValuedGraphHashed';
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends EdgeValuedGraphBase.Types {
    readonly normal: EdgeValuedGraphHashed<this['_N'], this['_V']>;
    readonly nonEmpty: EdgeValuedGraphHashed.NonEmpty<this['_N'], this['_V']>;
    readonly context: EdgeValuedGraphHashed.Context<this['_N']>;
    readonly builder: EdgeValuedGraphHashed.Builder<this['_N'], this['_V']>;
    readonly linkMap: HashMap<this['_N'], HashMap<this['_N'], this['_V']>>;
    readonly linkMapNonEmpty: HashMap.NonEmpty<
      this['_N'],
      HashMap<this['_N'], this['_V']>
    >;
    readonly linkMapContext: HashMap.Context<this['_N']>;
    readonly linkConnectionsContext: HashMap.Context<this['_N']>;
    readonly linkMapBuilder: HashMap.Builder<
      this['_N'],
      HashMap.Builder<this['_N'], this['_V']>
    >;
    readonly linkConnectionsBuilder: HashMap.Builder<this['_N'], this['_V']>;
    readonly linkConnections: HashMap<this['_N'], this['_V']>;
  }
}

function createContext<UN>(options?: {
  linkMapContext?: HashMap.Context<UN>;
  linkConnectionsContext?: HashMap.Context<UN>;
}): EdgeValuedGraphHashed.Context<UN> {
  return Object.freeze(
    new ValuedGraphContext<UN, 'EdgeValuedGraphHashed', any>(
      false,
      'EdgeValuedGraphHashed',
      options?.linkMapContext ?? HashMap.defaultContext(),
      options?.linkConnectionsContext ?? HashMap.defaultContext()
    )
  );
}

const _defaultContext: EdgeValuedGraphHashed.Context<any> = createContext();

export const EdgeValuedGraphHashed: EdgeValuedGraphHashedCreators =
  Object.freeze({
    ..._defaultContext,
    createContext,
    defaultContext<UN>(): EdgeValuedGraphHashed.Context<UN> {
      return _defaultContext;
    },
  });
