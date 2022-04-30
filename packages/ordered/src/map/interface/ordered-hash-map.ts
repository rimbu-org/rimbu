import { HashMap } from '@rimbu/hashed/map';
import { List } from '@rimbu/list';
import type { OrderedMapBase } from '@rimbu/ordered/map-custom';
import { OrderedMapContextImpl } from '@rimbu/ordered/map-custom';
import type { Stream, Streamable } from '@rimbu/stream';
import type { OrderedHashMapCreators } from '@rimbu/ordered/map-custom';

/**
 * A type-invariant immutable Ordered HashMap of key type K, and value type V.
 * In the Map, each key has exactly one value, and the Map cannot contain
 * duplicate keys.
 * See the [Map documentation](https://rimbu.org/docs/collections/map) and the [OrderedHashMap API documentation](https://rimbu.org/api/rimbu/ordered/map/OrderedHashMap/interface)
 * @note
 * - The OrderedHashMap keeps the insertion order of elements, thus
 * iterators and streams will also reflect this order.
 * - The OrderedHashMap wraps around a HashMap instance, thus has mostly the same time complexity
 * as the HashMap.
 * - The OrderedHashMap keeps the key insertion order in a List, thus its space
 * complexity is higher than a regular HashMap.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * ```ts
 * const m1 = OrderedHashMap.empty<number, string>()
 * const m2 = OrderedHashMap.of([1, 'a'], [2, 'b'])
 * ```
 */
export interface OrderedHashMap<K, V>
  extends OrderedMapBase<K, V, OrderedHashMap.Types> {}

export namespace OrderedHashMap {
  /**
   * A non-empty type-invariant immutable Ordered HashMap of key type K, and value type V.
   * In the Map, each key has exactly one value, and the Map cannot contain
   * duplicate keys.
   * See the [Map documentation](https://rimbu.org/docs/collections/map) and the [OrderedHashMap API documentation](https://rimbu.org/api/rimbu/ordered/map/OrderedHashMap/interface)
   * @note
   * - The OrderedHashMap keeps maintains the insertion order of elements, thus
   * iterators and streams will also reflect this order.
   * - The OrderedHashMap wraps around a HashMap instance, thus has mostly the same time complexity
   * as the HashMap.
   * - The OrderedHashMap keeps the key insertion order in a List, thus its space
   * complexity is higher than a regular HashMap.
   * @typeparam K - the key type
   * @typeparam V - the value type
   * @example
   * ```ts
   * const m1 = OrderedHashMap.empty<number, string>()
   * const m2 = OrderedHashMap.of([1, 'a'], [2, 'b'])
   * ```
   */
  export interface NonEmpty<K, V>
    extends OrderedMapBase.NonEmpty<K, V, OrderedHashMap.Types>,
      Omit<OrderedHashMap<K, V>, keyof OrderedMapBase.NonEmpty<any, any, any>>,
      Streamable.NonEmpty<readonly [K, V]> {
    stream(): Stream.NonEmpty<readonly [K, V]>;
  }

  /**
   * A mutable `OrderedHashMap` builder used to efficiently create new immutable instances.
   * See the [Map documentation](https://rimbu.org/docs/collections/map) and the [OrderedHashMap.Builder API documentation](https://rimbu.org/api/rimbu/ordered/map/OrderedHashMap/Builder/interface)
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

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends OrderedMapBase.Types {
    readonly normal: OrderedHashMap<this['_K'], this['_V']>;
    readonly nonEmpty: OrderedHashMap.NonEmpty<this['_K'], this['_V']>;
    readonly context: OrderedHashMap.Context<this['_K']>;
    readonly builder: OrderedHashMap.Builder<this['_K'], this['_V']>;
    readonly sourceContext: HashMap.Context<this['_K']>;
    readonly sourceMap: HashMap<this['_K'], this['_V']>;
    readonly sourceMapNonEmpty: HashMap.NonEmpty<this['_K'], this['_V']>;
  }
}

function createContext<UK>(options?: {
  listContext?: List.Context;
  mapContext?: HashMap.Context<UK>;
}): OrderedHashMap.Context<UK> {
  return new OrderedMapContextImpl<UK>(
    options?.listContext ?? List.defaultContext(),
    options?.mapContext ?? HashMap.defaultContext()
  ) as any;
}

const _defaultContext: OrderedHashMap.Context<any> = createContext();

export const OrderedHashMap: OrderedHashMapCreators = {
  ..._defaultContext,
  createContext,
  defaultContext<UK>(): OrderedHashMap.Context<UK> {
    return _defaultContext;
  },
};
