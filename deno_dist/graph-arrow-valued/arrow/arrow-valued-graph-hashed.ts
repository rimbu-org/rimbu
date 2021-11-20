import type { OmitStrong } from '../../common/mod.ts';
import { ValuedGraphCustom, ValuedGraphElement } from '../../graph/mod.ts';
import { HashMap } from '../../hashed/mod.ts';
import type { Stream, Streamable } from '../../stream/mod.ts';
import type { ArrowValuedGraphBase } from '../graph-custom.ts';

/**
 * An type-invariant immutable valued arrow (directed) graph.
 * The nodes are internally maintained using HashMaps
 * @typeparam N - the node type
 * @typeparam V - the connection value type
 * @example
 * const g1 = ArrowValuedGraphHashed.empty<number, string>()
 * const g2 = ArrowValuedGraphHashed.of([1], [2, 3, 'a'], [2, 4, 'b'])
 */
export interface ArrowValuedGraphHashed<N, V>
  extends ArrowValuedGraphBase<N, V, ArrowValuedGraphHashed.Types> {}

export namespace ArrowValuedGraphHashed {
  /**
   * A non-empty type-invariant immutable valued arrow (directed) graph.
   * The nodes are internally maintained using HashMaps
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface NonEmpty<N, V>
    extends ArrowValuedGraphBase.NonEmpty<N, V, ArrowValuedGraphHashed.Types>,
      Omit<
        ArrowValuedGraphHashed<N, V>,
        keyof ArrowValuedGraphBase.NonEmpty<any, any, any>
      >,
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
   * A mutable `ArrowValuedGraphHashed` builder used to efficiently create new immutable instances.
   * @typeparam N - the node type
   * @typeparam V - the connection value type
   */
  export interface Builder<N, V>
    extends ArrowValuedGraphBase.Builder<N, V, ArrowValuedGraphHashed.Types> {}

  /**
   * The ArrowValuedGraphHashed's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UN - the upper type limit for node types for which this context can create instances
   */
  export interface Context<UN>
    extends ArrowValuedGraphBase.Context<UN, ArrowValuedGraphHashed.Types> {
    readonly typeTag: 'ArrowValuedGraphHashed';
  }

  export interface Types extends ArrowValuedGraphBase.Types {
    readonly normal: ArrowValuedGraphHashed<this['_N'], this['_V']>;
    readonly nonEmpty: ArrowValuedGraphHashed.NonEmpty<this['_N'], this['_V']>;
    readonly context: ArrowValuedGraphHashed.Context<this['_N']>;
    readonly builder: ArrowValuedGraphHashed.Builder<this['_N'], this['_V']>;
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
}): ArrowValuedGraphHashed.Context<UN> {
  return new ValuedGraphCustom.ValuedGraphContext<
    UN,
    'ArrowValuedGraphHashed',
    any
  >(
    true,
    'ArrowValuedGraphHashed',
    options?.linkMapContext ?? HashMap.defaultContext(),
    options?.linkConnectionsContext ?? HashMap.defaultContext()
  );
}

const _defaultContext: ArrowValuedGraphHashed.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new ArrowValuedGraphHashed context instance based on the given `options`.
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
  defaultContext<UN>(): ArrowValuedGraphHashed.Context<UN> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  ArrowValuedGraphHashed.Context<any>,
  'typeTag' | 'linkMapContext' | 'linkConnectionsContext' | 'isDirected'
> &
  typeof _contextHelpers;

export const ArrowValuedGraphHashed: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
