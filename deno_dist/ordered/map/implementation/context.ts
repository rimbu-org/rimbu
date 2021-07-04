import { CustomBase } from '../../../collection-types/mod.ts';
import type { List } from '../../../list/mod.ts';
import {
  OrderedMapBase,
  OrderedMapBuilder,
  OrderedMapContext,
  OrderedMapEmpty,
  OrderedMapNonEmpty,
  OrderedMapTypes
} from '../../ordered-custom.ts';

export class OrderedMapContextImpl<UK, Tp extends OrderedMapTypes>
  extends CustomBase.RMapBase.ContextBase<UK, Tp>
  implements OrderedMapContext<UK, Tp>
{
  constructor(
    readonly listContext: List.Context,
    readonly mapContext: CustomBase.WithKeyValue<Tp, UK, any>['sourceContext']
  ) {
    super();
  }

  readonly typeTag = 'OrderedMap';
  readonly _empty: CustomBase.WithKeyValue<Tp, any, any>['normal'] =
    new OrderedMapEmpty<any, any, Tp>(this as any) as any;

  isNonEmptyInstance(source: any): source is any {
    return source instanceof OrderedMapNonEmpty;
  }

  isValidKey(key: any): key is UK {
    return this.mapContext.isValidKey(key);
  }

  builder = <K extends UK, V>(): CustomBase.WithKeyValue<
    Tp,
    K,
    V
  >['builder'] => {
    return new OrderedMapBuilder<K, V, Tp>(this as any) as any;
  };

  createBuilder<K extends UK, V>(
    source?: OrderedMapBase.NonEmpty<K, V>
  ): CustomBase.WithKeyValue<Tp, K, V>['builder'] {
    return new OrderedMapBuilder<K, V, Tp>(this as any, source as any) as any;
  }

  createNonEmpty<K extends UK, V>(
    order: List.NonEmpty<K>,
    sourceMap: CustomBase.WithKeyValue<Tp, K, V>['sourceMapNonEmpty']
  ): CustomBase.WithKeyValue<Tp, K, V>['nonEmpty'] {
    return new OrderedMapNonEmpty<K, V, Tp>(
      this as any,
      order,
      sourceMap
    ) as any;
  }
}
