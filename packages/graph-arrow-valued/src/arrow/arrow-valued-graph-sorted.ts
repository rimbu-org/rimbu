import { RMap } from '@rimbu/collection-types';
import { OmitStrong } from '@rimbu/common';
import { CustomGraphNonValuedBase, ValuedGraphElement } from '@rimbu/graph';
import { SortedMap } from '@rimbu/sorted';
import { Stream, Streamable } from '@rimbu/stream';
import { ArrowValuedGraphBase } from '../graph-custom';

/**
 * An type-invariant immutable valued arrow (directed) graph.
 * The nodes are internally maintained using SortedMaps
 * @typeparam N - the node type
 * @typeparam V - the connection value type
 * @example
 * const g1 = ArrowValuedGraphSorted.empty<number, string>()
 * const g2 = ArrowValuedGraphSorted.of([1], [2, 3, 'a'], [2, 4, 'b'])
 */
export interface ArrowValuedGraphSorted<N, V>
  extends ArrowValuedGraphBase<N, V, ArrowValuedGraphSorted.Types> {}

export namespace ArrowValuedGraphSorted {
  type NonEmptyBase<N, V> = ArrowValuedGraphBase.NonEmpty<
    N,
    V,
    ArrowValuedGraphSorted.Types
  > &
    ArrowValuedGraphSorted<N, V>;

  /**
   * A non-empty type-invariant immutable valued arrow (directed) graph.
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
     * ArrowValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     */
    stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
  }

  /**
   * A mutable `ArrowValuedGraphSorted` builder used to efficiently create new immutable instances.
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

  export interface Types extends ArrowValuedGraphBase.Types {
    readonly normal: ArrowValuedGraphSorted<this['_N'], this['_V']>;
    readonly nonEmpty: ArrowValuedGraphSorted.NonEmpty<this['_N'], this['_V']>;
    readonly context: ArrowValuedGraphSorted.Context<this['_N']>;
    readonly builder: ArrowValuedGraphSorted.Builder<this['_N'], this['_V']>;
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

interface TypesImpl extends ArrowValuedGraphSorted.Types {
  readonly context: CustomGraphNonValuedBase.ValuedGraphContext<
    this['_N'],
    'ArrowValuedGraphSorted',
    any
  >;
}

function createContext<UN>(options?: {
  linkMapContext?: SortedMap.Context<UN>;
  linkConnectionsContext?: SortedMap.Context<UN>;
}): ArrowValuedGraphSorted.Context<UN> {
  return new CustomGraphNonValuedBase.ValuedGraphContext<
    UN,
    'ArrowValuedGraphSorted',
    TypesImpl
  >(
    true,
    'ArrowValuedGraphSorted',
    options?.linkMapContext ?? SortedMap.defaultContext(),
    options?.linkConnectionsContext ?? SortedMap.defaultContext()
  );
}

const _defaultContext: ArrowValuedGraphSorted.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new ArrowValuedGraphSorted context instance based on the given `options`.
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
  defaultContext<UN>(): ArrowValuedGraphSorted.Context<UN> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  ArrowValuedGraphSorted.Context<any>,
  'typeTag' | 'linkMapContext' | 'linkConnectionsContext' | 'isDirected'
> &
  typeof _contextHelpers;

export const ArrowValuedGraphSorted: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
