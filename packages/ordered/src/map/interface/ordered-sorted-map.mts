import { List } from '@rimbu/list';
import { SortedMap } from '@rimbu/sorted/map';
import type { Stream, Streamable } from '@rimbu/stream';

import {
  type OrderedMapBase,
  OrderedMapContextImpl,
  type OrderedSortedMapCreators,
} from '@rimbu/ordered/map-custom';

/**
 * A type-invariant immutable Ordered SortedMap of key type K, and value type V.
 * In the Map, each key has exactly one value, and the Map cannot contain
 * duplicate keys.
 * See the [Map documentation](https://rimbu.org/docs/collections/map) and the [OrderedSortedMap API documentation](https://rimbu.org/api/rimbu/ordered/map/OrderedSortedMap/interface)
 * @note
 * - The OrderedSortedMap keeps maintains the insertion order of elements, thus
 * iterators and streams will also reflect this order.
 * - The OrderedSortedMap wraps around a SortedMap instance, thus has mostly the same time complexity
 * as the SortedMap.
 * - The OrderedSortedMap keeps the key insertion order in a List, thus its space complexity
 * is higher than a regular SortedMap.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * ```ts
 * const m1 = OrderedSortedMap.empty<number, string>()
 * const m2 = OrderedSortedMap.of([1, 'a'], [2, 'b'])
 * ```
 */
export interface OrderedSortedMap<K, V>
  extends OrderedMapBase<K, V, OrderedSortedMap.Types> {}

export namespace OrderedSortedMap {
  /**
   * A non-empty type-invariant immutable Ordered SortedMap of key type K, and value type V.
   * In the Map, each key has exactly one value, and the Map cannot contain
   * duplicate keys.
   * See the [Map documentation](https://rimbu.org/docs/collections/map) and the [OrderedSortedMap API documentation](https://rimbu.org/api/rimbu/ordered/map/OrderedSortedMap/interface)
   * @note
   * - The OrderedSortedMap keeps maintains the insertion order of elements, thus
   * iterators and streams will also reflect this order.
   * - The OrderedSortedMap wraps around a SortedMap instance, thus has mostly the same time complexity
   * as the SortedMap.
   * - The OrderedSortedMap keeps the key insertion order in a List, thus its space complexity
   * is higher than a regular SortedMap.
   * @typeparam K - the key type
   * @typeparam V - the value type
   * @example
   * ```ts
   * const m1 = OrderedSortedMap.empty<number, string>()
   * const m2 = OrderedSortedMap.of([1, 'a'], [2, 'b'])
   * ```
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
   * See the [Map documentation](https://rimbu.org/docs/collections/map) and the [OrderedSortedMap.Builder API documentation](https://rimbu.org/api/rimbu/ordered/map/OrderedSortedMap/Builder/interface)
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

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends OrderedMapBase.Types {
    readonly normal: OrderedSortedMap<this['_K'], this['_V']>;
    readonly nonEmpty: OrderedSortedMap.NonEmpty<this['_K'], this['_V']>;
    readonly context: OrderedSortedMap.Context<this['_K']>;
    readonly builder: OrderedSortedMap.Builder<this['_K'], this['_V']>;
    readonly sourceContext: SortedMap.Context<this['_K']>;
    readonly sourceMap: SortedMap<this['_K'], this['_V']>;
    readonly sourceMapNonEmpty: SortedMap.NonEmpty<this['_K'], this['_V']>;
  }
}

function createContext<UK>(options?: {
  listContext?: List.Context;
  mapContext?: SortedMap.Context<UK>;
}): OrderedSortedMap.Context<UK> {
  return Object.freeze(
    new OrderedMapContextImpl<UK>(
      options?.listContext ?? List.defaultContext(),
      options?.mapContext ?? SortedMap.defaultContext()
    )
  ) as any;
}

const _defaultContext: OrderedSortedMap.Context<any> = createContext();

export const OrderedSortedMap: OrderedSortedMapCreators = Object.freeze({
  ..._defaultContext,
  createContext,
  defaultContext<UK>(): OrderedSortedMap.Context<UK> {
    return _defaultContext;
  },
});
