import { RSetBase, WithElem } from '@rimbu/collection-types/set-custom';
import type { List } from '@rimbu/list';
import {
  OrderedSetBase,
  OrderedSetBuilder,
  OrderedSetEmpty,
  OrderedSetNonEmpty,
} from '@rimbu/ordered/set-custom';

export interface OrderedSetTypes extends OrderedSetBase.Types {
  readonly context: OrderedSetContextImpl<this['_T']>;
}

export class OrderedSetContextImpl<
    UT,
    Tp extends OrderedSetTypes = OrderedSetTypes
  >
  extends RSetBase.ContextBase<UT, Tp>
  implements OrderedSetBase.Context<UT, Tp>
{
  constructor(
    readonly listContext: List.Context,
    readonly setContext: WithElem<Tp, UT>['sourceContext']
  ) {
    super();
  }

  readonly typeTag = 'OrderedSet';
  readonly _empty: OrderedSetBase<any, Tp> = Object.freeze(
    new OrderedSetEmpty<any, Tp>(this as any)
  );

  isNonEmptyInstance(source: any): source is any {
    return source instanceof OrderedSetNonEmpty;
  }

  isValidValue(value: any): value is UT {
    return this.setContext.isValidValue(value);
  }

  readonly builder = <T extends UT>(): WithElem<Tp, T>['builder'] => {
    return new OrderedSetBuilder<T, Tp>(this as any) as any;
  };

  createBuilder<T extends UT>(
    source?: OrderedSetNonEmpty<T, Tp>
  ): WithElem<Tp, T>['builder'] {
    return new OrderedSetBuilder<T, Tp>(this as any, source as any) as any;
  }

  createNonEmpty<T extends UT>(
    order: List.NonEmpty<T>,
    sourceSet: any
  ): WithElem<Tp, T>['nonEmpty'] {
    return new OrderedSetNonEmpty<T, Tp>(this as any, order, sourceSet) as any;
  }
}
