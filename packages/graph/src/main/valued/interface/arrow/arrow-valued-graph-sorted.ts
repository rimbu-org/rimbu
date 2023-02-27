import type { Stream, Streamable } from '@rimbu/stream';

import { SortedMap } from '@rimbu/sorted';

import type {
  ArrowValuedGraphSortedCreators,
  ValuedGraphElement,
} from '@rimbu/graph/custom';

import { ArrowValuedGraphBase, ValuedGraphContext } from '@rimbu/graph/custom';

/**
 * An type-invariant immutable valued arrow (directed) graph.
 * The nodes are internally maintained using SortedMaps
 * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ArrowValuedGraphSorted API documentation](https://rimbu.org/api/rimbu/graph/ArrowValuedGraphSorted/interface)
 * @typeparam N - the node type
 * @typeparam V - the connection value type
 * @example
 * ```ts
 * const g1 = ArrowValuedGraphSorted.empty<number, string>()
 * const g2 = ArrowValuedGraphSorted.of([1], [2, 3, 'a'], [2, 4, 'b'])
 * ```
 */
export interface ArrowValuedGraphSorted<N, V>
  extends ArrowValuedGraphBase<N, V, ArrowValuedGraphSorted.Types> {}

export namespace ArrowValuedGraphSorted {
  /**
   * A non-empty type-invariant immutable valued arrow (directed) graph.
   * The nodes are internally maintained using SortedMaps
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ArrowValuedGraphSorted API documentation](https://rimbu.org/api/rimbu/graph/ArrowValuedGraphSorted/interface)
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface NonEmpty<N, V>
    extends ArrowValuedGraphBase.NonEmpty<N, V, ArrowValuedGraphSorted.Types>,
      Omit<
        ArrowValuedGraphSorted<N, V>,
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
   * A mutable `ArrowValuedGraphSorted` builder used to efficiently create new immutable instances.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ArrowValuedGraphSorted.Builder API documentation](https://rimbu.org/api/rimbu/graph/ArrowValuedGraphSorted/Builder/interface)
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface Builder<N, V>
    extends ArrowValuedGraphBase.Builder<N, V, ArrowValuedGraphSorted.Types> {}

  /**
   * The ArrowValuedGraphSorted's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends ArrowValuedGraphBase.Context<UN, ArrowValuedGraphSorted.Types> {
    readonly typeTag: 'ArrowValuedGraphSorted';
  }

  export namespace Context {
    export interface Options<UN> {
      contextId?: string;
      linkMapContext?: SortedMap.Context<UN>;
      linkConnectionsContext?: SortedMap.Context<UN>;
    }
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends ArrowValuedGraphBase.Types {
    readonly normal: ArrowValuedGraphSorted<this['_N'], this['_V']>;
    readonly nonEmpty: ArrowValuedGraphSorted.NonEmpty<this['_N'], this['_V']>;
    readonly context: ArrowValuedGraphSorted.Context<this['_N']>;
    readonly builder: ArrowValuedGraphSorted.Builder<this['_N'], this['_V']>;
    readonly linkMap: SortedMap<this['_N'], SortedMap<this['_N'], this['_V']>>;
    readonly linkMapNonEmpty: SortedMap.NonEmpty<
      this['_N'],
      SortedMap<this['_N'], this['_V']>
    >;
    readonly linkMapContext: SortedMap.Context<this['_N']>;
    readonly linkConnectionsContext: SortedMap.Context<this['_N']>;
    readonly linkMapBuilder: SortedMap.Builder<
      this['_N'],
      SortedMap.Builder<this['_N'], this['_V']>
    >;
    readonly linkConnectionsBuilder: SortedMap.Builder<this['_N'], this['_V']>;
    readonly linkConnections: SortedMap<this['_N'], this['_V']>;
  }
}

function createContext<UN>(
  options?: ArrowValuedGraphSorted.Context.Options<UN>
): ArrowValuedGraphSorted.Context<UN> {
  return Object.freeze(
    new ValuedGraphContext<UN, 'ArrowValuedGraphSorted', any>(
      true,
      'ArrowValuedGraphSorted',
      options?.linkMapContext ?? SortedMap.defaultContext(),
      options?.linkConnectionsContext ?? SortedMap.defaultContext(),
      options?.contextId
    )
  );
}

const _defaultContext: ArrowValuedGraphSorted.Context<any> = createContext({
  contextId: 'default',
});

export const ArrowValuedGraphSorted: ArrowValuedGraphSortedCreators =
  Object.freeze({
    ..._defaultContext,
    createContext,
    defaultContext<UN>(): ArrowValuedGraphSorted.Context<UN> {
      return _defaultContext;
    },
  });
