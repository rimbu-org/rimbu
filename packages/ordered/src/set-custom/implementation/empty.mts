import { EmptyBase, type WithElem } from '@rimbu/collection-types/set-custom';
import type { ToJSON } from '@rimbu/common';
import type { List } from '@rimbu/list';
import type { StreamSource } from '@rimbu/stream';

import type {
  OrderedSetBase,
  OrderedSetTypes,
} from '@rimbu/ordered/set-custom';

export class OrderedSetEmpty<
    T,
    Tp extends OrderedSetTypes,
    TpG extends WithElem<Tp, T> = WithElem<Tp, T>,
  >
  extends EmptyBase
  implements OrderedSetBase<T, Tp>
{
  declare _NonEmptyType: Tp['nonEmpty'];

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
