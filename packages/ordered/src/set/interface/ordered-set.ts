import type { RSet } from '@rimbu/collection-types';
import { List } from '@rimbu/list';
import type { Stream, Streamable } from '@rimbu/stream';
import { OrderedSetBase, OrderedSetContextImpl } from '../../ordered-custom';

export interface OrderedSet<T> extends OrderedSetBase<T, OrderedSet.Types> {}

export namespace OrderedSet {
  export interface NonEmpty<T>
    extends OrderedSetBase.NonEmpty<T, OrderedSet.Types>,
      Omit<OrderedSet<T>, keyof OrderedSetBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<T> {
    stream(): Stream.NonEmpty<T>;
  }

  export interface Builder<T>
    extends OrderedSetBase.Builder<T, OrderedSet.Types> {}

  export interface Context<UT>
    extends OrderedSetBase.Context<UT, OrderedSet.Types> {}

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

export const OrderedSet = {
  /**
   * Returns a new OrderedSet context instance based on the given `options`.
   * @typeparam UT - the upper element type for which the context can create instances
   * @param options - an object containing the following properties:
   * * listContext - the list context to use for element ordering
   * * setContext - the set context to use for element sets
   */
  createContext<UT>(options: {
    listContext?: List.Context;
    setContext: RSet.Context<UT>;
  }): OrderedSet.Context<UT> {
    return new OrderedSetContextImpl<UT>(
      options.listContext ?? List.defaultContext(),
      options.setContext
    ) as any;
  },
};
