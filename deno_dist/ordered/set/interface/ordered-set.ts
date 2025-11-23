import type { RSet } from '../../../collection-types/set/index.ts';
import { List } from '../../../list/mod.ts';
import type { Stream, Streamable } from '../../../stream/mod.ts';

import {
  type OrderedSetBase,
  OrderedSetContextImpl,
  type OrderedSetCreators,
} from '../../../ordered/set-custom/index.ts';

/**
 * A type-invariant immutable Ordered Set of value type T.
 * In the Set, there are no duplicate values.
 * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [OrderedSet API documentation](https://rimbu.org/api/rimbu/ordered/set/OrderedSet/interface)
 * @typeparam T - the value type
 * @note
 * - The OrderedSet keeps the insertion order of values, thus
 * iterators and stream will also reflect this order.
 * - The OrderedSet wraps around an RSet instance, thus has the same time complexity
 * as the source set.
 * - The OrderedSet keeps the key insertion order in a List, thus its space
 * complexity is higher than the source set.
 * @example
 * ```ts
 * const s1 = OrderedSet.empty<string>()
 * const s2 = OrderedSet.of('a', 'b', 'c')
 * ```
 */
export interface OrderedSet<T> extends OrderedSetBase<T, OrderedSet.Types> {}

export namespace OrderedSet {
  /**
   * A non-empty type-invariant immutable Ordered Set of value type T.
   * In the Set, there are no duplicate values.
   * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [OrderedSet API documentation](https://rimbu.org/api/rimbu/ordered/set/OrderedSet/interface)
   * @typeparam T - the value type
   * @note
   * - The OrderedSet keeps the insertion order of values, thus
   * iterators and stream will also reflect this order.
   * - The OrderedSet wraps around an RSet instance, thus has the same time complexity
   * as the source set.
   * - The OrderedSet keeps the key insertion order in a List, thus its space
   * complexity is higher than the source set.
   * @example
   * ```ts
   * const s1 = OrderedSet.empty<string>()
   * const s2 = OrderedSet.of('a', 'b', 'c')
   * ```
   */
  export interface NonEmpty<T>
    extends OrderedSetBase.NonEmpty<T, OrderedSet.Types>,
      Omit<OrderedSet<T>, keyof OrderedSetBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<T> {
    stream(): Stream.NonEmpty<T>;
  }

  /**
   * A mutable `OrderedSet` builder used to efficiently create new immutable instances.
   * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [OrderedSet.Builder API documentation](https://rimbu.org/api/rimbu/ordered/set/OrderedSet/Builder/interface)
   * @typeparam T - the value type
   */
  export interface Builder<T>
    extends OrderedSetBase.Builder<T, OrderedSet.Types> {}

  /**
   * A context instance for an `OrderedSet` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UT - the upper element type bound for which the context can be used
   */
  export interface Context<UT>
    extends OrderedSetBase.Context<UT, OrderedSet.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends OrderedSetBase.Types {
    readonly normal: OrderedSet<this['_T']>;
    readonly nonEmpty: OrderedSet.NonEmpty<this['_T']>;
    readonly context: OrderedSet.Context<this['_T']>;
    readonly builder: OrderedSet.Builder<this['_T']>;
    readonly sourceContext: RSet.Context<this['_T']>;
    readonly sourceSet: RSet<this['_T']>;
    readonly sourceSetNonEmpty: RSet.NonEmpty<this['_T']>;
  }
}

export const OrderedSet: OrderedSetCreators = Object.freeze({
  createContext<UT>(options: {
    listContext?: List.Context;
    setContext: RSet.Context<UT>;
  }): OrderedSet.Context<UT> {
    return Object.freeze(
      new OrderedSetContextImpl<UT>(
        options.listContext ?? List.defaultContext(),
        options.setContext
      ) as any
    );
  },
});
