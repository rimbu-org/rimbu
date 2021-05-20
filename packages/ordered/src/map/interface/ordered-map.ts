import { RMap } from '@rimbu/collection-types';
import { List } from '@rimbu/list';
import { Stream, Streamable } from '@rimbu/stream';
import {
  OrderedMapBase,
  OrderedMapContextImpl,
  OrderedMapTypes,
} from '../../ordered-custom';

/**
 * A type-invariant immutable Ordered Map of key type K, and value type V.
 * In the Map, each key has exactly one value, and the Map cannot contain
 * duplicate keys.
 * * The OrderedMap keeps maintains the insertion order of elements, thus
 * iterators and streams will also reflect this order.
 * * The OrderedMap wraps around a Map instance, thus has mostly the same time complexity
 * as the contained Map.
 * * The OrderedMap keeps the key insertion order in a List, thus its space complexity
 * is higher than a regular Map.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * const m1 = OrderedHashMap.empty<number, string>()
 * const m2 = OrderedHashMap.of([1, 'a'], [2, 'b'])
 */
export interface OrderedMap<K, V>
  extends OrderedMapBase<K, V, OrderedMap.Types> {}

export namespace OrderedMap {
  type NonEmptyBase<K, V> = OrderedMapBase.NonEmpty<K, V, OrderedMap.Types> &
    OrderedMap<K, V>;

  /**
   * A non-empty type-invariant immutable Ordered Map of key type K, and value type V.
   * In the Map, each key has exactly one value, and the Map cannot contain
   * duplicate keys.
   * * The OrderedMap keeps maintains the insertion order of elements, thus
   * iterators and streams will also reflect this order.
   * * The OrderedMap wraps around a Map instance, thus has mostly the same time complexity
   * as the contained Map.
   * * The OrderedMap keeps the key insertion order in a List, thus its space complexity
   * is higher than a regular Map.
   * @typeparam K - the key type
   * @typeparam V - the value type
   * @example
   * const m1 = OrderedHashMap.empty<number, string>()
   * const m2 = OrderedHashMap.of([1, 'a'], [2, 'b'])
   */
  export interface NonEmpty<K, V>
    extends NonEmptyBase<K, V>,
      Streamable.NonEmpty<readonly [K, V]> {
    stream(): Stream.NonEmpty<readonly [K, V]>;
  }

  /**
   * A mutable `OrderedMap` builder used to efficiently create new immutable instances.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends OrderedMapBase.Builder<K, V, OrderedMap.Types> {}

  /**
   * A context instance for an `OrderedMap` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   */
  export interface Context<UK> extends OrderedMapBase.Context<UK> {}

  export interface Types extends OrderedMapBase.Types {
    normal: OrderedMap<this['_K'], this['_V']>;
    nonEmpty: OrderedMap.NonEmpty<this['_K'], this['_V']>;
    context: OrderedMap.Context<this['_K']>;
    builder: OrderedMap.Builder<this['_K'], this['_V']>;
    sourceContext: RMap.Context<this['_K']>;
    sourceMap: RMap<this['_K'], this['_V']>;
    sourceMapNonEmpty: RMap.NonEmpty<this['_K'], this['_V']>;
  }
}

export const OrderedMap = {
  /**
   * Returns a new OrderedMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @param options - an object containing the following properties:
   * * listContext - the list context to use for key ordering
   * * mapContext - the map context to use for key value mapping
   */
  createContext<UK>(options: {
    listContext?: List.Context;
    mapContext: RMap.Context<UK>;
  }): OrderedMap.Context<UK> {
    return new OrderedMapContextImpl<UK, OrderedMapTypes>(
      options.listContext ?? List.defaultContext(),
      options.mapContext
    ) as any;
  },
};
