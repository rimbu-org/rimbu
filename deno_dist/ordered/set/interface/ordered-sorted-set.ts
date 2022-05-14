import { List } from '../../../list/mod.ts';
import {
  OrderedSetBase,
  OrderedSetContextImpl,
  OrderedSortedSetCreators,
} from '../../../ordered/set-custom/index.ts';
import { SortedSet } from '../../../sorted/set/index.ts';
import type { Stream, Streamable } from '../../../stream/mod.ts';

/**
 * A type-invariant immutable Ordered SortedSet of value type T.
 * In the Set, there are no duplicate values.
 * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [OrderedSortedSet API documentation](https://rimbu.org/api/rimbu/ordered/set/OrderedSortedSet/interface)
 * @typeparam T - the value type
 * @note
 * - The OrderedSortedSet keeps the insertion order of values, thus
 * iterators and stream will also reflect this order.
 * - The OrderedSortedSet wraps around a SortedSet instance, thus has the same time complexity
 * as the SortedSet.
 * - The OrderedSortedSet keeps the key insertion order in a List, thus its space
 * complexity is higher than a regular SortedSet.
 * @example
 * ```ts
 * const s1 = OrderedSortedSet.empty<string>()
 * const s2 = OrderedSortedSet.of('a', 'b', 'c')
 * ```
 */
export interface OrderedSortedSet<T>
  extends OrderedSetBase<T, OrderedSortedSet.Types> {}

export namespace OrderedSortedSet {
  /**
   * A non-empty type-invariant immutable Ordered SortedSet of value type T.
   * In the Set, there are no duplicate values.
   * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [OrderedSortedSet API documentation](https://rimbu.org/api/rimbu/ordered/set/OrderedSortedSet/interface)
   * @typeparam T - the value type
   * @note
   * - The OrderedSortedSet keeps the insertion order of values, thus
   * iterators and stream will also reflect this order.
   * - The OrderedSortedSet wraps around a SortedSet instance, thus has the same time complexity
   * as the SortedSet.
   * - The OrderedSortedSet keeps the key insertion order in a List, thus its space
   * complexity is higher than a regular SortedSet.
   * @example
   * ```ts
   * const s1 = OrderedSortedSet.empty<string>()
   * const s2 = OrderedSortedSet.of('a', 'b', 'c')
   * ```
   */
  export interface NonEmpty<T>
    extends OrderedSetBase.NonEmpty<T, OrderedSortedSet.Types>,
      Omit<OrderedSortedSet<T>, keyof OrderedSetBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<T> {
    stream(): Stream.NonEmpty<T>;
  }

  /**
   * A mutable `OrderedSortedSet` builder used to efficiently create new immutable instances.
   * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [OrderedSortedSet.Builder API documentation](https://rimbu.org/api/rimbu/ordered/set/OrderedSortedSet/Builder/interface)
   * @typeparam T - the value type
   */
  export interface Builder<T>
    extends OrderedSetBase.Builder<T, OrderedSortedSet.Types> {}

  /**
   * A context instance for an `OrderedSortedSet` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   */
  export interface Context<UT>
    extends OrderedSetBase.Context<UT, OrderedSortedSet.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends OrderedSetBase.Types {
    readonly normal: OrderedSortedSet<this['_T']>;
    readonly nonEmpty: OrderedSortedSet.NonEmpty<this['_T']>;
    readonly context: OrderedSortedSet.Context<this['_T']>;
    readonly builder: OrderedSortedSet.Builder<this['_T']>;
    readonly sourceContext: SortedSet.Context<this['_T']>;
    readonly sourceSet: SortedSet<this['_T']>;
    readonly sourceSetNonEmpty: SortedSet.NonEmpty<this['_T']>;
  }
}

function createContext<UT>(options?: {
  listContext?: List.Context;
  setContext?: SortedSet.Context<UT>;
}): OrderedSortedSet.Context<UT> {
  return Object.freeze(
    new OrderedSetContextImpl<UT>(
      options?.listContext ?? List.defaultContext(),
      options?.setContext ?? SortedSet.defaultContext<UT>()
    ) as any
  );
}

const _defaultContext: OrderedSortedSet.Context<any> = createContext();

export const OrderedSortedSet: OrderedSortedSetCreators = Object.freeze({
  ..._defaultContext,
  createContext,
  defaultContext<UT>(): OrderedSortedSet.Context<UT> {
    return _defaultContext;
  },
});
