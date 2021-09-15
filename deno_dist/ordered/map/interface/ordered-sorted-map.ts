import type { OmitStrong } from '../../../common/mod.ts';
import { List } from '../../../list/mod.ts';
import { SortedMap } from '../../../sorted/mod.ts';
import type { Stream, Streamable } from '../../../stream/mod.ts';
import {
  OrderedMapBase,
  OrderedMapContextImpl,
  OrderedMapTypes,
} from '../../ordered-custom.ts';

/**
 * A type-invariant immutable Ordered SortedMap of key type K, and value type V.
 * In the Map, each key has exactly one value, and the Map cannot contain
 * duplicate keys.
 * * The OrderedSortedMap keeps maintains the insertion order of elements, thus
 * iterators and streams will also reflect this order.
 * * The OrderedSortedMap wraps around a SortedMap instance, thus has mostly the same time complexity
 * as the SortedMap.
 * * The OrderedSortedMap keeps the key insertion order in a List, thus its space complexity
 * is higher than a regular SortedMap.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * const m1 = OrderedSortedMap.empty<number, string>()
 * const m2 = OrderedSortedMap.of([1, 'a'], [2, 'b'])
 */
export interface OrderedSortedMap<K, V>
  extends OrderedMapBase<K, V, OrderedSortedMap.Types> {}

export namespace OrderedSortedMap {
  /**
   * A non-empty type-invariant immutable Ordered SortedMap of key type K, and value type V.
   * In the Map, each key has exactly one value, and the Map cannot contain
   * duplicate keys.
   * * The OrderedSortedMap keeps maintains the insertion order of elements, thus
   * iterators and streams will also reflect this order.
   * * The OrderedSortedMap wraps around a SortedMap instance, thus has mostly the same time complexity
   * as the SortedMap.
   * * The OrderedSortedMap keeps the key insertion order in a List, thus its space complexity
   * is higher than a regular SortedMap.
   * @typeparam K - the key type
   * @typeparam V - the value type
   * @example
   * const m1 = OrderedSortedMap.empty<number, string>()
   * const m2 = OrderedSortedMap.of([1, 'a'], [2, 'b'])
   */
  export interface NonEmpty<K, V>
    extends OrderedMapBase.NonEmpty<K, V, OrderedSortedMap.Types>,
      Omit<
        OrderedSortedMap<K, V>,
        keyof OrderedMapBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<readonly [K, V]> {
    stream(): Stream.NonEmpty<readonly [K, V]>;
  }

  /**
   * A mutable `OrderedSortedMap` builder used to efficiently create new immutable instances.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends OrderedMapBase.Builder<K, V, OrderedSortedMap.Types> {}

  /**
   * A context instance for an `OrderedSortedMap` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   */
  export interface Context<UK>
    extends OrderedMapBase.Context<UK, OrderedSortedMap.Types> {}

  export interface Types extends OrderedMapBase.Types {
    normal: OrderedSortedMap<this['_K'], this['_V']>;
    nonEmpty: OrderedSortedMap.NonEmpty<this['_K'], this['_V']>;
    context: OrderedSortedMap.Context<this['_K']>;
    builder: OrderedSortedMap.Builder<this['_K'], this['_V']>;
    sourceContext: SortedMap.Context<this['_K']>;
    sourceMap: SortedMap<this['_K'], this['_V']>;
    sourceMapNonEmpty: SortedMap.NonEmpty<this['_K'], this['_V']>;
  }
}

function createContext<UK>(options?: {
  listContext?: List.Context;
  mapContext?: SortedMap.Context<UK>;
}): OrderedSortedMap.Context<UK> {
  return new OrderedMapContextImpl<UK, OrderedMapTypes>(
    options?.listContext ?? List.defaultContext(),
    options?.mapContext ?? SortedMap.defaultContext()
  ) as any;
}

const _defaultContext: OrderedSortedMap.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new OrderedSortedMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * listContext - (optional) the list context to use for key ordering
   * * mapContext - (optional) the map context to use for key value mapping
   */
  createContext,
  /**
   * Returns the default context for OrderedSortedMaps.
   * @typeparam UK - the upper key type for which the context can create instances
   */
  defaultContext<UK>(): OrderedSortedMap.Context<UK> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  OrderedSortedMap.Context<any>,
  '_types' | 'isValidKey' | 'listContext' | 'mapContext' | 'typeTag'
> &
  typeof _contextHelpers;

export const OrderedSortedMap: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
