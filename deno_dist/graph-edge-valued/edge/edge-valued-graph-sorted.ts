import type { RMap } from '../../collection-types/mod.ts';
import type { OmitStrong } from '../../common/mod.ts';
import { ValuedGraphCustom, ValuedGraphElement } from '../../graph/mod.ts';
import { SortedMap } from '../../sorted/mod.ts';
import type { Stream, Streamable } from '../../stream/mod.ts';
import type { EdgeValuedGraphBase } from '../graph-custom.ts';

/**
 * An type-invariant immutable valued edge (undirected) graph.
 * The nodes are internally maintained using SortedMaps
 * @typeparam N - the node type
 * @typeparam V - the connection value type
 * @example
 * const g1 = EdgeValuedGraphSorted.empty<number, string>()
 * const g2 = EdgeValuedGraphSorted.of([1], [2, 3, 'a'], [2, 4, 'b'])
 */
export interface EdgeValuedGraphSorted<N, V>
  extends EdgeValuedGraphBase<N, V, EdgeValuedGraphSorted.Types> {}

export namespace EdgeValuedGraphSorted {
  type NonEmptyBase<N, V> = EdgeValuedGraphBase.NonEmpty<
    N,
    V,
    EdgeValuedGraphSorted.Types
  > &
    EdgeValuedGraphSorted<N, V>;

  /**
   * A non-empty type-invariant immutable valued edge (undirected) graph.
   * The nodes are internally maintained using SortedMaps
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface NonEmpty<N, V>
    extends NonEmptyBase<N, V>,
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
   * A mutable `EdgeValuedGraphSorted` builder used to efficiently create new immutable instances.
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface Builder<N, V>
    extends EdgeValuedGraphBase.Builder<N, V, EdgeValuedGraphSorted.Types> {}

  /**
   * The EdgeValuedGraphSorted's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends EdgeValuedGraphBase.Context<UN, EdgeValuedGraphSorted.Types> {
    readonly typeTag: 'EdgeValuedGraphSorted';
  }

  export interface Types extends EdgeValuedGraphBase.Types {
    readonly normal: EdgeValuedGraphSorted<this['_N'], this['_V']>;
    readonly nonEmpty: EdgeValuedGraphSorted.NonEmpty<this['_N'], this['_V']>;
    readonly context: EdgeValuedGraphSorted.Context<this['_N']>;
    readonly builder: EdgeValuedGraphSorted.Builder<this['_N'], this['_V']>;
    readonly linkMap: SortedMap<this['_N'], SortedMap<this['_N'], this['_V']>> &
      SortedMap<this['_N'], RMap<this['_N'], this['_V']>>;
    readonly linkMapNonEmpty: SortedMap.NonEmpty<
      this['_N'],
      SortedMap<this['_N'], this['_V']>
    > &
      SortedMap.NonEmpty<this['_N'], RMap<this['_N'], this['_V']>>;
    readonly linkMapContext: SortedMap.Context<this['_N']>;
    readonly linkConnectionsContext: SortedMap.Context<this['_N']>;
    readonly linkMapBuilder: SortedMap.Builder<
      this['_N'],
      SortedMap.Builder<this['_N'], this['_V']>
    > &
      SortedMap.Builder<this['_N'], RMap.Builder<this['_N'], this['_V']>>;
    readonly linkConnectionsBuilder: SortedMap.Builder<this['_N'], this['_V']>;
    readonly linkConnections: SortedMap<this['_N'], this['_V']>;
  }
}

interface TypesImpl extends EdgeValuedGraphSorted.Types {
  readonly context: ValuedGraphCustom.ValuedGraphContext<
    this['_N'],
    'EdgeValuedGraphSorted',
    any
  >;
}

function createContext<UN>(options?: {
  linkMapContext?: SortedMap.Context<UN>;
  linkConnectionsContext?: SortedMap.Context<UN>;
}): EdgeValuedGraphSorted.Context<UN> {
  return new ValuedGraphCustom.ValuedGraphContext<
    UN,
    'EdgeValuedGraphSorted',
    TypesImpl
  >(
    false,
    'EdgeValuedGraphSorted',
    options?.linkMapContext ?? SortedMap.defaultContext(),
    options?.linkConnectionsContext ?? SortedMap.defaultContext()
  );
}

const _defaultContext: EdgeValuedGraphSorted.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new EdgeValuedGraph context instance based on the given `options`.
   * @typeparam UN - the upper node type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * linkMapContext - (optional) the map context to use to maintain link maps
   * * linkConnectionsContext - (optional) the map context to use to maintain link connection maps
   */
  createContext,
  /**
   * Returns the default context for this type of graph.
   * @typeparam UN - the upper node type that the context should accept
   */
  defaultContext<UN>(): EdgeValuedGraphSorted.Context<UN> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  EdgeValuedGraphSorted.Context<any>,
  'typeTag' | 'linkMapContext' | 'linkConnectionsContext' | 'isDirected'
> &
  typeof _contextHelpers;

export const EdgeValuedGraphSorted: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
