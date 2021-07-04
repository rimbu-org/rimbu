import type { RSet } from '../../../collection-types/mod.ts';
import type { OmitStrong } from '../../../common/mod.ts';
import { SortedMap, SortedSet } from '../../../sorted/mod.ts';
import type { Stream, Streamable } from '../../../stream/mod.ts';
import type { GraphElement } from '../../internal.ts';
import type { ArrowGraphBase } from '../graph-custom.ts';
import { GraphContext } from '../graph-custom.ts';

/**
 * An type-invariant immutable valued arrow (directed) graph.
 * The connections are internally maintained using sorted collections
 * @typeparam N - the node type
 * @example
 * const g1 = ArrowGraphSorted.empty<number>()
 * const g2 = ArrowGraphSorted.of([1], [2, 3], [2, 4])
 */
export interface ArrowGraphSorted<N>
  extends ArrowGraphBase<N, ArrowGraphSorted.Types> {}

export namespace ArrowGraphSorted {
  type NonEmptyBase<N> = ArrowGraphBase.NonEmpty<N, ArrowGraphSorted.Types> &
    ArrowGraphSorted<N>;

  /**
   * A non-empty type-invariant immutable valued arrow (directed) graph.
   * The connections are internally maintained using sorted collections
   * @typeparam N - the node type
   */
  export interface NonEmpty<N>
    extends NonEmptyBase<N>,
      Streamable.NonEmpty<GraphElement<N>> {
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
     * @example
     * ArrowValuedGraphSorted.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     */
    stream(): Stream.NonEmpty<GraphElement<N>>;
  }

  /**
   * A mutable `ArrowGraphSorted` builder used to efficiently create new immutable instances.
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

  export interface Types extends ArrowGraphBase.Types {
    readonly normal: ArrowGraphSorted<this['_N']>;
    readonly nonEmpty: ArrowGraphSorted.NonEmpty<this['_N']>;
    readonly context: ArrowGraphSorted.Context<this['_N']>;
    readonly builder: ArrowGraphSorted.Builder<this['_N']>;
    readonly linkMap: SortedMap<this['_N'], SortedSet<this['_N']>> &
      SortedMap<this['_N'], RSet<this['_N']>>;
    readonly linkMapNonEmpty: SortedMap.NonEmpty<
      this['_N'],
      SortedSet<this['_N']>
    > &
      SortedMap.NonEmpty<this['_N'], RSet<this['_N']>>;
    readonly linkMapContext: SortedMap.Context<this['_N']>;
    readonly linkConnectionsContext: SortedSet.Context<this['_N']>;
    readonly linkMapBuilder: SortedMap.Builder<
      this['_N'],
      SortedSet.Builder<this['_N']>
    > &
      SortedMap.Builder<this['_N'], RSet.Builder<this['_N']>>;
    readonly linkConnectionsBuilder: SortedSet.Builder<this['_N']>;
    readonly linkConnections: SortedSet<this['_N']>;
  }
}

interface TypesImpl extends ArrowGraphSorted.Types {
  readonly context: GraphContext<this['_N'], 'ArrowGraphSorted', true, any>;
}

function createContext<UN>(options?: {
  linkMapContext?: SortedMap.Context<UN>;
  linkConnectionsContext?: SortedSet.Context<UN>;
}): ArrowGraphSorted.Context<UN> {
  return new GraphContext<UN, 'ArrowGraphSorted', true, TypesImpl>(
    true,
    'ArrowGraphSorted',
    options?.linkMapContext ?? SortedMap.defaultContext(),
    options?.linkConnectionsContext ?? SortedSet.defaultContext()
  );
}

const _defaultContext: ArrowGraphSorted.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new ArrowValuedGraphSorted context instance based on the given `options`.
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
  defaultContext<UN>(): ArrowGraphSorted.Context<UN> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  ArrowGraphSorted.Context<any>,
  'typeTag' | 'linkMapContext' | 'linkConnectionsContext' | 'isDirected'
> &
  typeof _contextHelpers;

export const ArrowGraphSorted: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
