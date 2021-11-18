import type { OmitStrong } from '@rimbu/common';
import { List } from '@rimbu/list';
import { SortedSet } from '@rimbu/sorted';
import type { Stream, Streamable } from '@rimbu/stream';
import {
  OrderedSetBase,
  OrderedSetContextImpl,
  OrderedSetTypes,
} from '../../ordered-custom';

/**
 * A type-invariant immutable Ordered SortedSet of value type T.
 * In the Set, there are no duplicate values.
 * @typeparam T - the value type
 * * The OrderedSortedSet keeps the insertion order of values, thus
 * iterators and stream will also reflect this order.
 * * The OrderedSortedSet wraps around a SortedSet instance, thus has the same time complexity
 * as the SortedSet.
 * * The OrderedSortedSet keeps the key insertion order in a List, thus its space
 * complexity is higher than a regular SortedSet.
 * @example
 * const s1 = OrderedSortedSet.empty<string>()
 * const s2 = OrderedSortedSet.of('a', 'b', 'c')
 */
export interface OrderedSortedSet<T>
  extends OrderedSetBase<T, OrderedSortedSet.Types> {}

export namespace OrderedSortedSet {
  /**
   * A non-empty type-invariant immutable Ordered SortedSet of value type T.
   * In the Set, there are no duplicate values.
   * @typeparam T - the value type
   * * The OrderedSortedSet keeps the insertion order of values, thus
   * iterators and stream will also reflect this order.
   * * The OrderedSortedSet wraps around a SortedSet instance, thus has the same time complexity
   * as the SortedSet.
   * * The OrderedSortedSet keeps the key insertion order in a List, thus its space
   * complexity is higher than a regular SortedSet.
   * @example
   * const s1 = OrderedSortedSet.empty<string>()
   * const s2 = OrderedSortedSet.of('a', 'b', 'c')
   */
  export interface NonEmpty<T>
    extends OrderedSetBase.NonEmpty<T, OrderedSortedSet.Types>,
      Omit<OrderedSortedSet<T>, keyof OrderedSetBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<T> {
    stream(): Stream.NonEmpty<T>;
  }

  /**
   * A mutable `OrderedSortedSet` builder used to efficiently create new immutable instances.
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
  return new OrderedSetContextImpl<UT, OrderedSetTypes>(
    options?.listContext ?? List.defaultContext(),
    options?.setContext ?? SortedSet.defaultContext<UT>()
  ) as any;
}

const _defaultContext: OrderedSortedSet.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new OrderedSortedSet context instance based on the given `options`.
   * @typeparam UT - the upper element type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * listContext - (optional) the list context to use for element ordering
   * * setContext - (optional) the set context to use for element sets
   */
  createContext,
  /**
   * Returns the default context for OrderedSortedSet.
   * @typeparam UT - the upper element type for which the context can create instances
   */
  defaultContext<UT>(): OrderedSortedSet.Context<UT> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  OrderedSortedSet.Context<any>,
  '_types' | 'isValidValue' | 'listContext' | 'setContext' | 'typeTag'
> &
  typeof _contextHelpers;

export const OrderedSortedSet: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
