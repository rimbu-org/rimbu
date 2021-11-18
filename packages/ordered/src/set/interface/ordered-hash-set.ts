import type { OmitStrong } from '@rimbu/common';
import { HashSet } from '@rimbu/hashed';
import { List } from '@rimbu/list';
import type { Stream, Streamable } from '@rimbu/stream';
import type { OrderedSetBase } from '../../ordered-custom';
import { OrderedSetContextImpl } from '../implementation/context';
import type { OrderedSetTypes } from './base';

/**
 * A type-invariant immutable Ordered HashSet of value type T.
 * In the Set, there are no duplicate values.
 * @typeparam T - the value type
 * * The OrderedHashSet keeps the insertion order of values, thus
 * iterators and stream will also reflect this order.
 * * The OrderedHashSet wraps around a HashSet instance, thus has the same time complexity
 * as the HashSet.
 * * The OrderedHashSet keeps the key insertion order in a List, thus its space
 * complexity is higher than a regular HashSet.
 * @example
 * const s1 = OrderedHashSet.empty<string>()
 * const s2 = OrderedHashSet.of('a', 'b', 'c')
 */
export interface OrderedHashSet<T>
  extends OrderedSetBase<T, OrderedHashSet.Types> {}

export namespace OrderedHashSet {
  /**
   * A non-empty type-invariant immutable Ordered HashSet of value type T.
   * In the Set, there are no duplicate values.
   * @typeparam T - the value type
   * * The OrderedHashSet keeps the insertion order of values, thus
   * iterators and stream will also reflect this order.
   * * The OrderedHashSet wraps around a HashSet instance, thus has the same time complexity
   * as the HashSet.
   * * The OrderedHashSet keeps the key insertion order in a List, thus its space
   * complexity is higher than a regular HashSet.
   * @example
   * const s1 = OrderedHashSet.empty<string>()
   * const s2 = OrderedHashSet.of('a', 'b', 'c')
   */
  export interface NonEmpty<T>
    extends OrderedSetBase.NonEmpty<T, OrderedHashSet.Types>,
      Omit<OrderedHashSet<T>, keyof OrderedSetBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<T> {
    stream(): Stream.NonEmpty<T>;
  }

  /**
   * A mutable `OrderedHashSet` builder used to efficiently create new immutable instances.
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
  return new OrderedSetContextImpl<UT, OrderedSetTypes>(
    options?.listContext ?? List.defaultContext(),
    options?.setContext ?? HashSet.defaultContext()
  ) as any;
}

const _defaultContext: OrderedHashSet.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new OrderedHashSet context instance based on the given `options`.
   * @typeparam UT - the upper element type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * listContext - (optional) the list context to use for element ordering
   * * setContext - (optional) the set context to use for element sets
   */
  createContext,
  /**
   * Returns the default context for OrderedHashSets.
   * @typeparam UT - the upper element type for which the context can create instances
   */
  defaultContext<UT>(): OrderedHashSet.Context<UT> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  OrderedHashSet.Context<any>,
  '_types' | 'isValidValue' | 'listContext' | 'setContext' | 'typeTag'
> &
  typeof _contextHelpers;

export const OrderedHashSet: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
