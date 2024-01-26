import { HashSet } from '@rimbu/hashed/set';
import { List } from '@rimbu/list';
import type { Stream, Streamable } from '@rimbu/stream';

import type {
  OrderedHashSetCreators,
  OrderedSetBase,
} from '@rimbu/ordered/set-custom';
import { OrderedSetContextImpl } from '@rimbu/ordered/set-custom';

/**
 * A type-invariant immutable Ordered HashSet of value type T.
 * In the Set, there are no duplicate values.
 * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [OrderedHashSet API documentation](https://rimbu.org/api/rimbu/ordered/set/OrderedHashSet/interface)
 * @typeparam T - the value type
 * @note
 * - The OrderedHashSet keeps the insertion order of values, thus
 * iterators and stream will also reflect this order.
 * - The OrderedHashSet wraps around a HashSet instance, thus has the same time complexity
 * as the HashSet.
 * - The OrderedHashSet keeps the key insertion order in a List, thus its space
 * complexity is higher than a regular HashSet.
 * @example
 * ```ts
 * const s1 = OrderedHashSet.empty<string>()
 * const s2 = OrderedHashSet.of('a', 'b', 'c')
 * ```
 */
export interface OrderedHashSet<T>
  extends OrderedSetBase<T, OrderedHashSet.Types> {}

export namespace OrderedHashSet {
  /**
   * A non-empty type-invariant immutable Ordered HashSet of value type T.
   * In the Set, there are no duplicate values.
   * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [OrderedHashSet API documentation](https://rimbu.org/api/rimbu/ordered/set/OrderedHashSet/interface)
   * @typeparam T - the value type
   * @note
   * - The OrderedHashSet keeps the insertion order of values, thus
   * iterators and stream will also reflect this order.
   * - The OrderedHashSet wraps around a HashSet instance, thus has the same time complexity
   * as the HashSet.
   * - The OrderedHashSet keeps the key insertion order in a List, thus its space
   * complexity is higher than a regular HashSet.
   * @example
   * ```ts
   * const s1 = OrderedHashSet.empty<string>()
   * const s2 = OrderedHashSet.of('a', 'b', 'c')
   * ```
   */
  export interface NonEmpty<T>
    extends OrderedSetBase.NonEmpty<T, OrderedHashSet.Types>,
      Omit<OrderedHashSet<T>, keyof OrderedSetBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<T> {
    stream(options?: { reverse?: boolean }): Stream.NonEmpty<T>;
  }

  /**
   * A mutable `OrderedHashSet` builder used to efficiently create new immutable instances.
   * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [OrderedHashSet.Builder API documentation](https://rimbu.org/api/rimbu/ordered/set/OrderedHashSet/Builder/interface)
   * @typeparam T - the value type
   */
  export interface Builder<T>
    extends OrderedSetBase.Builder<T, OrderedHashSet.Types> {}

  /**
   * A context instance for an `OrderedHashSet` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   */
  export interface Context<UT>
    extends OrderedSetBase.Context<UT, OrderedHashSet.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends OrderedSetBase.Types {
    readonly normal: OrderedHashSet<this['_T']>;
    readonly nonEmpty: OrderedHashSet.NonEmpty<this['_T']>;
    readonly context: OrderedHashSet.Context<this['_T']>;
    readonly builder: OrderedHashSet.Builder<this['_T']>;
    readonly sourceContext: HashSet.Context<this['_T']>;
    readonly sourceSet: HashSet<this['_T']>;
    readonly sourceSetNonEmpty: HashSet.NonEmpty<this['_T']>;
  }
}

function createContext<UT>(options?: {
  listContext?: List.Context;
  setContext?: HashSet.Context<UT>;
}): OrderedHashSet.Context<UT> {
  return Object.freeze(
    new OrderedSetContextImpl<UT>(
      options?.listContext ?? List.defaultContext(),
      options?.setContext ?? HashSet.defaultContext()
    )
  ) as any;
}

const _defaultContext: OrderedHashSet.Context<any> = createContext();

export const OrderedHashSet: OrderedHashSetCreators = Object.freeze({
  ..._defaultContext,
  createContext,
  defaultContext<UT>(): OrderedHashSet.Context<UT> {
    return _defaultContext;
  },
});
