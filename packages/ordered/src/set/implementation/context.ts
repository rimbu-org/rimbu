import { CustomBase } from '@rimbu/collection-types';
import { List } from '@rimbu/list';
import {
  OrderedSetBase,
  OrderedSetBuilder,
  OrderedSetContext,
  OrderedSetEmpty,
  OrderedSetNonEmpty,
  OrderedSetTypes,
} from '../../ordered-custom';

export class OrderedSetContextImpl<UT, Tp extends OrderedSetTypes>
  extends CustomBase.RSetBase.ContextBase<UT, Tp>
  implements OrderedSetContext<UT, Tp> {
  constructor(
    readonly listContext: List.Context,
    readonly setContext: CustomBase.WithElem<Tp, UT>['sourceContext']
  ) {
    super();
  }

  readonly typeTag = 'OrderedSet';
  readonly _empty: OrderedSetBase<any, Tp> = new OrderedSetEmpty<any, Tp>(
    this as any
  );

  isNonEmptyInstance(source: any): source is any {
    return source instanceof OrderedSetNonEmpty;
  }

  isValidValue(value: any): value is UT {
    return this.setContext.isValidValue(value);
  }

  builder = <T extends UT>(): CustomBase.WithElem<Tp, T>['builder'] => {
    return new OrderedSetBuilder<T, Tp>(this as any) as any;
  };

  createBuilder<T extends UT>(
    source?: OrderedSetNonEmpty<T, Tp>
  ): CustomBase.WithElem<Tp, T>['builder'] {
    return new OrderedSetBuilder<T, Tp>(this as any, source as any) as any;
  }

  createNonEmpty<T extends UT>(
    order: List.NonEmpty<T>,
    sourceSet: any
  ): CustomBase.WithElem<Tp, T>['nonEmpty'] {
    return new OrderedSetNonEmpty<T, Tp>(this as any, order, sourceSet) as any;
  }
}
