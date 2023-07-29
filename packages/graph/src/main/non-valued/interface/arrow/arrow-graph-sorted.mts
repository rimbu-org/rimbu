import { SortedMap, SortedSet } from '@rimbu/sorted';
import type { Stream, Streamable } from '@rimbu/stream';

import type {
  ArrowGraphSortedCreators,
  GraphElement,
} from '@rimbu/graph/custom';
import { type ArrowGraphBase, GraphContext } from '@rimbu/graph/custom';

/**
 * An type-invariant immutable valued arrow (directed) graph.
 * The connections are internally maintained using sorted collections
 * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ArrowGraphSorted API documentation](https://rimbu.org/api/rimbu/graph/ArrowGraphSorted/interface)
 * @typeparam N - the node type
 * @example
 * ```ts
 * const g1 = ArrowGraphSorted.empty<number>()
 * const g2 = ArrowGraphSorted.of([1], [2, 3], [2, 4])
 * ```
 */
export interface ArrowGraphSorted<N>
  extends ArrowGraphBase<N, ArrowGraphSorted.Types> {}

export namespace ArrowGraphSorted {
  /**
   * A non-empty type-invariant immutable valued arrow (directed) graph.
   * The connections are internally maintained using sorted collections
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ArrowGraphSorted API documentation](https://rimbu.org/api/rimbu/graph/ArrowGraphSorted/interface)
   * @typeparam N - the node type
   */
  export interface NonEmpty<N>
    extends ArrowGraphBase.NonEmpty<N, ArrowGraphSorted.Types>,
      Omit<ArrowGraphSorted<N>, keyof ArrowGraphBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
     * @example
     * ```ts
     * ArrowValuedGraphSorted.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     * ```
     */
    stream(): Stream.NonEmpty<GraphElement<N>>;
  }

  /**
   * A mutable `ArrowGraphSorted` builder used to efficiently create new immutable instances.
   * See the [Graph documentation](https://rimbu.org/docs/collections/graph) and the [ArrowGraphSorted.Builder API documentation](https://rimbu.org/api/rimbu/graph/ArrowGraphSorted/Builder/interface)
   * @typeparam N - the node type
   */
  export interface Builder<N>
    extends ArrowGraphBase.Builder<N, ArrowGraphSorted.Types> {}

  /**
   * The ArrowGraphSorted's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends ArrowGraphBase.Context<UN, ArrowGraphSorted.Types> {
    readonly typeTag: 'ArrowGraphSorted';
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends ArrowGraphBase.Types {
    readonly normal: ArrowGraphSorted<this['_N']>;
    readonly nonEmpty: ArrowGraphSorted.NonEmpty<this['_N']>;
    readonly context: ArrowGraphSorted.Context<this['_N']>;
    readonly builder: ArrowGraphSorted.Builder<this['_N']>;
    readonly linkMap: SortedMap<this['_N'], SortedSet<this['_N']>>;
    readonly linkMapNonEmpty: SortedMap.NonEmpty<
      this['_N'],
      SortedSet<this['_N']>
    >;
    readonly linkMapContext: SortedMap.Context<this['_N']>;
    readonly linkConnectionsContext: SortedSet.Context<this['_N']>;
    readonly linkMapBuilder: SortedMap.Builder<
      this['_N'],
      SortedSet.Builder<this['_N']>
    >;
    readonly linkConnectionsBuilder: SortedSet.Builder<this['_N']>;
    readonly linkConnections: SortedSet<this['_N']>;
  }
}

function createContext<UN>(options?: {
  linkMapContext?: SortedMap.Context<UN>;
  linkConnectionsContext?: SortedSet.Context<UN>;
}): ArrowGraphSorted.Context<UN> {
  return Object.freeze(
    new GraphContext<UN, 'ArrowGraphSorted', true, any>(
      true,
      'ArrowGraphSorted',
      options?.linkMapContext ?? SortedMap.defaultContext(),
      options?.linkConnectionsContext ?? SortedSet.defaultContext()
    )
  );
}

const _defaultContext: ArrowGraphSorted.Context<any> = createContext();

export const ArrowGraphSorted: ArrowGraphSortedCreators = Object.freeze({
  ..._defaultContext,
  createContext,
  defaultContext<UN>(): ArrowGraphSorted.Context<UN> {
    return _defaultContext;
  },
});
