import { EmptyBase, type WithElem } from '../../../collection-types/set-custom/index.ts';
import type { ToJSON } from '../../../common/mod.ts';
import type { List } from '../../../list/mod.ts';
import type { StreamSource } from '../../../stream/mod.ts';

import type { OrderedSetBase, OrderedSetTypes } from '../../../ordered/set-custom/index.ts';

export class OrderedSetEmpty<
    T,
    Tp extends OrderedSetTypes,
    TpG extends WithElem<Tp, T> = WithElem<Tp, T>
  >
  extends EmptyBase
  implements OrderedSetBase<T, Tp>
{
  constructor(readonly context: WithElem<Tp, T>['context']) {
    super();
  }

  get order(): List<T> {
    return this.context.listContext.empty();
  }

  get sourceSet(): TpG['sourceSet'] {
    return this.context.setContext.empty();
  }

  has(): false {
    return false;
  }

  add(value: T): TpG['nonEmpty'] {
    return this.context.createNonEmpty(
      this.context.listContext.of(value),
      this.context.setContext.of(value)
    );
  }

  addAll(values: StreamSource<T>): any {
    return this.context.from(values);
  }

  remove(): TpG['normal'] {
    return this as any;
  }

  removeAll(): TpG['normal'] {
    return this as any;
  }

  union(other: StreamSource<T>): TpG['normal'] | any {
    if (
      this.context.isNonEmptyInstance(other) &&
      (other as any).context === this.context
    ) {
      return other;
    }

    return this.context.from(other);
  }

  difference(): TpG['normal'] {
    return this.context.empty();
  }

  intersect(): TpG['normal'] {
    return this.context.empty();
  }

  symDifference(other: StreamSource<T>): TpG['normal'] {
    return this.union(other);
  }

  toBuilder(): TpG['builder'] {
    return this.context.builder();
  }

  toString(): string {
    return 'OrderedSet()';
  }

  toJSON(): ToJSON<any[]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }
}
