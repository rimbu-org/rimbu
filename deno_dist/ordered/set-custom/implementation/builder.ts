import { RimbuError } from '../../../base/mod.ts';
import type { WithElem } from '../../../collection-types/set-custom/index.ts';
import { type RelatedTo, TraverseState } from '../../../common/mod.ts';
import type { List } from '../../../list/mod.ts';
import { Stream, type StreamSource } from '../../../stream/mod.ts';

import type {
  OrderedSetBase,
  OrderedSetTypes,
} from '../../../ordered/set-custom/index.ts';

export class OrderedSetBuilder<
  T,
  Tp extends OrderedSetTypes = OrderedSetTypes,
  TpG extends WithElem<Tp, T> = WithElem<Tp, T>,
> implements OrderedSetBase.Builder<T, Tp>
{
  constructor(
    readonly context: TpG['context'],
    public source?: TpG['nonEmpty']
  ) {}

  _orderBuilder?: List.Builder<T>;
  _setBuilder?: TpG['sourceBuilder'];

  _lock = 0;

  checkLock(): void {
    if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
  }

  prepareMutate(): void {
    if (undefined === this._orderBuilder || undefined === this._setBuilder) {
      if (undefined !== this.source) {
        this._orderBuilder = this.source.order.toBuilder();
        this._setBuilder = this.source.sourceSet.toBuilder();
      } else {
        this._orderBuilder = this.context.listContext.builder();
        this._setBuilder = this.context.setContext.builder();
      }
    }
  }

  get orderBuilder(): List.Builder<T> {
    this.prepareMutate();
    return this._orderBuilder!;
  }

  get setBuilder(): TpG['sourceBuilder'] {
    this.prepareMutate();
    return this._setBuilder!;
  }

  get size(): number {
    return this.source?.size ?? this.orderBuilder.length;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  // prettier-ignore
  has = <U,>(value: RelatedTo<T, U>): boolean => {
    return this.source?.has(value) ?? this.setBuilder.has(value);
  };

  add = (value: T): boolean => {
    this.checkLock();

    const changed = this.setBuilder.add(value);

    if (changed) {
      this.source = undefined;
      this.orderBuilder.append(value);
    }

    return changed;
  };

  addAll = (source: StreamSource<T>): boolean => {
    this.checkLock();

    return Stream.from(source).filterPure({ pred: this.add }).count() > 0;
  };

  // prettier-ignore
  remove = <U,>(value: RelatedTo<T, U>): boolean => {
    this.checkLock();

    if (!this.context.setContext.isValidValue(value)) return false;

    const changed = this.setBuilder.remove(value);

    if (changed) {
      this.source = undefined;

      let index = -1;
      this.orderBuilder.forEach((v, i, halt): void => {
        if (Object.is(v, value)) {
          index = i;
          halt();
        }
      });
      this.orderBuilder.remove(index);
    }

    return changed;
  };

  // prettier-ignore
  removeAll = <U,>(values: StreamSource<RelatedTo<T, U>>): boolean => {
    this.checkLock();

    return Stream.from(values).filterPure({ pred: this.remove }).count() > 0;
  };

  forEach = (
    f: (value: T, index: number, halt: () => void) => void,
    options: { reversed?: boolean; state?: TraverseState } = {}
  ): void => {
    const { reversed = false, state = TraverseState() } = options;

    if (state.halted) return;

    this._lock++;

    if (undefined !== this.source) {
      this.source.order.forEach(f, { reversed, state });
    } else {
      this.orderBuilder.forEach(f, { reversed, state });
    }

    this._lock--;
  };

  build = (): TpG['normal'] => {
    if (undefined !== this.source) return this.source as any;
    if (this.size === 0) return this.context.empty();

    const order = this.orderBuilder.build().assumeNonEmpty();
    const sourceMap = this.setBuilder.build().assumeNonEmpty();

    return this.context.createNonEmpty(order, sourceMap);
  };
}
