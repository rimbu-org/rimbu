import type { OmitStrong } from '../../common/mod.ts';
import { ValuedGraphCustom, ValuedGraphElement } from '../../graph/mod.ts';
import { HashMap } from '../../hashed/mod.ts';
import type { Stream, Streamable } from '../../stream/mod.ts';
import type { EdgeValuedGraphBase } from '../graph-custom.ts';

/**
 * An type-invariant immutable valued edge (undirected) graph.
 * The nodes are internally maintained using HashMaps
 * @typeparam N - the node type
 * @typeparam V - the connection value type
 * @example
 * const g1 = EdgeValuedGraphHashed.empty<number, string>()
 * const g2 = EdgeValuedGraphHashed.of([1], [2, 3, 'a'], [2, 4, 'b'])
 */
export interface EdgeValuedGraphHashed<N, V>
  extends EdgeValuedGraphBase<N, V, EdgeValuedGraphHashed.Types> {}

export namespace EdgeValuedGraphHashed {
  /**
   * A non-empty type-invariant immutable valued edge (undirected) graph.
   * The nodes are internally maintained using HashMaps
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
     * EdgeValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']).stream().toArray()
     * // => [[1, 2, 'a'], [2, 3, 'b']]
     */
    stream(): Stream.NonEmpty<ValuedGraphElement<N, V>>;
  }

  /**
   * A mutable `EdgeValuedGraphHashed` builder used to efficiently create new immutable instances.
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
  return new ValuedGraphCustom.ValuedGraphContext<
    UN,
    'EdgeValuedGraphHashed',
    any
  >(
    false,
    'EdgeValuedGraphHashed',
    options?.linkMapContext ?? HashMap.defaultContext(),
    options?.linkConnectionsContext ?? HashMap.defaultContext()
  );
}

const _defaultContext: EdgeValuedGraphHashed.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new EdgeValuedGraphHashed context instance based on the given `options`.
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
  defaultContext<UN>(): EdgeValuedGraphHashed.Context<UN> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  EdgeValuedGraphHashed.Context<any>,
  'typeTag' | 'linkMapContext' | 'linkConnectionsContext' | 'isDirected'
> &
  typeof _contextHelpers;

export const EdgeValuedGraphHashed: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
