import type { OmitStrong } from '@rimbu/common';
import { HashMap } from '@rimbu/hashed';
import { List } from '@rimbu/list';
import type { Stream, Streamable } from '@rimbu/stream';
import type { OrderedMapBase } from '../../ordered-custom';
import { OrderedMapContextImpl } from '../implementation/context';
import type { OrderedMapTypes } from './base';

/**
 * A type-invariant immutable Ordered HashMap of key type K, and value type V.
 * In the Map, each key has exactly one value, and the Map cannot contain
 * duplicate keys.
 * * The OrderedHashMap keeps the insertion order of elements, thus
 * iterators and streams will also reflect this order.
 * * The OrderedHashMap wraps around a HashMap instance, thus has mostly the same time complexity
 * as the HashMap.
 * * The OrderedHashMap keeps the key insertion order in a List, thus its space
 * complexity is higher than a regular HashMap.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * const m1 = OrderedHashMap.empty<number, string>()
 * const m2 = OrderedHashMap.of([1, 'a'], [2, 'b'])
 */
export interface OrderedHashMap<K, V>
  extends OrderedMapBase<K, V, OrderedHashMap.Types> {}

export namespace OrderedHashMap {
  /**
   * A non-empty type-invariant immutable Ordered HashMap of key type K, and value type V.
   * In the Map, each key has exactly one value, and the Map cannot contain
   * duplicate keys.
   * * The OrderedHashMap keeps maintains the insertion order of elements, thus
   * iterators and streams will also reflect this order.
   * * The OrderedHashMap wraps around a HashMap instance, thus has mostly the same time complexity
   * as the HashMap.
   * * The OrderedHashMap keeps the key insertion order in a List, thus its space
   * complexity is higher than a regular HashMap.
   * @typeparam K - the key type
   * @typeparam V - the value type
   * @example
   * const m1 = OrderedHashMap.empty<number, string>()
   * const m2 = OrderedHashMap.of([1, 'a'], [2, 'b'])
   */
  export interface NonEmpty<K, V>
    extends OrderedMapBase.NonEmpty<K, V, OrderedHashMap.Types>,
      Omit<OrderedHashMap<K, V>, keyof OrderedMapBase.NonEmpty<any, any, any>>,
      Streamable.NonEmpty<readonly [K, V]> {
    stream(): Stream.NonEmpty<readonly [K, V]>;
  }

  /**
   * A mutable `OrderedHashMap` builder used to efficiently create new immutable instances.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends OrderedMapBase.Builder<K, V, OrderedHashMap.Types> {}

  /**
   * A context instance for an `OrderedHashMap` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   */
  export interface Context<UK>
    extends OrderedMapBase.Context<UK, OrderedHashMap.Types> {}

  export interface Types extends OrderedMapBase.Types {
    normal: OrderedHashMap<this['_K'], this['_V']>;
    nonEmpty: OrderedHashMap.NonEmpty<this['_K'], this['_V']>;
    context: OrderedHashMap.Context<this['_K']>;
    builder: OrderedHashMap.Builder<this['_K'], this['_V']>;
    sourceContext: HashMap.Context<this['_K']>;
    sourceMap: HashMap<this['_K'], this['_V']>;
    sourceMapNonEmpty: HashMap.NonEmpty<this['_K'], this['_V']>;
  }
}

function createContext<UK>(options?: {
  listContext?: List.Context;
  mapContext?: HashMap.Context<UK>;
}): OrderedHashMap.Context<UK> {
  return new OrderedMapContextImpl<UK, OrderedMapTypes>(
    options?.listContext ?? List.defaultContext(),
    options?.mapContext ?? HashMap.defaultContext()
  ) as any;
}

const _defaultContext: OrderedHashMap.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new OrderedHashMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * listContext - (optional) the list context to use for key ordering
   * * mapContext - (optional) the map context to use for key value mapping
   */
  createContext,
  /**
   * Returns the default context for OrderedHashMaps.
   * @typeparam UK - the upper key type for which the context can create instances
   */
  defaultContext<UK>(): OrderedHashMap.Context<UK> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  OrderedHashMap.Context<any>,
  '_types' | 'isValidKey' | 'listContext' | 'mapContext' | 'typeTag'
> &
  typeof _contextHelpers;

export const OrderedHashMap: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
