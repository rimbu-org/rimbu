import { RimbuError, Token } from '@rimbu/base';
import {
  OptLazy,
  OptLazyOr,
  RelatedTo,
  TraverseState,
  Update,
} from '@rimbu/common';
import type { List } from '@rimbu/list';
import { Stream, StreamSource } from '@rimbu/stream';
import type {
  OrderedMapBase,
  OrderedMapTypes,
} from '@rimbu/ordered/map-custom';
import type { WithKeyValue } from '@rimbu/collection-types/map-custom';

export class OrderedMapBuilder<
  K,
  V,
  Tp extends OrderedMapTypes = OrderedMapTypes,
  TpG extends WithKeyValue<Tp, K, V> = WithKeyValue<Tp, K, V>
> implements OrderedMapBase.Builder<K, V, Tp>
{
  constructor(
    readonly context: WithKeyValue<Tp, K, V>['context'],
    public source?: TpG['nonEmpty']
  ) {}

  _keyOrderBuilder?: List.Builder<K>;
  _mapBuilder?: TpG['sourceBuilder'];

  _lock = false;

  checkLock(): void {
    if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
  }

  prepareMutate(): void {
    if (undefined === this._keyOrderBuilder || undefined === this._mapBuilder) {
      if (undefined !== this.source) {
        this._keyOrderBuilder = this.source.keyOrder.toBuilder();
        this._mapBuilder = this.source.sourceMap.toBuilder();
      } else if (undefined === this._keyOrderBuilder) {
        this._keyOrderBuilder = this.context.listContext.builder();
        this._mapBuilder = this.context.mapContext.builder();
      }
    }
  }

  get keyOrderBuilder(): List.Builder<K> {
    this.prepareMutate();
    return this._keyOrderBuilder!;
  }

  get mapBuilder(): TpG['sourceBuilder'] {
    this.prepareMutate();
    return this._mapBuilder!;
  }

  get size(): number {
    return this.source?.size ?? this.keyOrderBuilder.length;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  hasKey = <UK>(key: RelatedTo<K, UK>): boolean => {
    return this.source?.hasKey(key) ?? this.mapBuilder.hasKey(key);
  };

  get = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
    if (undefined !== this.source) return this.source.get(key, otherwise!);

    return this.mapBuilder.get(key, otherwise!);
  };

  set = (key: K, value: V): boolean => {
    return this.addEntry([key, value]);
  };

  addEntry = (entry: readonly [K, V]): boolean => {
    this.checkLock();

    const preSize = this.mapBuilder.size;

    if (!this.mapBuilder.addEntry(entry)) return false;

    this.source = undefined;

    const diff = this.mapBuilder.size - preSize;

    if (diff > 0) this.keyOrderBuilder.append(entry[0]);

    return true;
  };

  addEntries = (entries: StreamSource<readonly [K, V]>): boolean => {
    this.checkLock();

    return Stream.from(entries).filterPure(this.addEntry).count() > 0;
  };

  removeKey = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
    this.checkLock();

    if (!this.context.mapContext.isValidKey(key)) {
      return OptLazy(otherwise) as O;
    }

    const token = Symbol();
    const removedValue = this.mapBuilder.removeKey(key, token);

    if (token === removedValue) {
      return OptLazy(otherwise) as O;
    }

    this.source = undefined;

    this.removeFromKeyOrderInternal(key as K);

    return removedValue;
  };

  removeKeys = <UK>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
    this.checkLock();

    const notFound = Symbol();

    return (
      Stream.from(keys)
        .mapPure(this.removeKey, notFound)
        .countNotElement(notFound) > 0
    );
  };

  updateAt = <O>(key: K, update: Update<V>, otherwise?: OptLazy<O>): V | O => {
    let oldValue: V;
    let found = false;

    this.modifyAt(key, {
      ifExists: (value): V => {
        oldValue = value;
        found = true;
        return Update(value, update);
      },
    });

    if (!found) return OptLazy(otherwise) as O;

    this.source = undefined;

    return oldValue!;
  };

  modifyAt = (
    key: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentValue: V, remove: Token) => V | Token;
    }
  ): boolean => {
    this.checkLock();

    const preSize = this.mapBuilder.size;
    const changed = this.mapBuilder.modifyAt(key, options);

    if (changed) this.source = undefined;

    const diff = this.mapBuilder.size - preSize;

    if (diff === 0) return changed;
    if (diff > 0) {
      this.keyOrderBuilder.append(key);
    } else {
      this.removeFromKeyOrderInternal(key);
    }
    return true;
  };

  forEach = (
    f: (entry: readonly [K, V], index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void => {
    if (state.halted) return;

    this._lock = true;

    if (undefined !== this.source) this.source.forEach(f, state);
    else {
      const { halt } = state;
      const mapBuilder = this.mapBuilder;

      this.keyOrderBuilder.forEach((key, _, outerHalt): void => {
        f(
          [key, mapBuilder.get(key, RimbuError.throwInvalidStateError)],
          state.nextIndex(),
          halt
        );
        if (state.halted) outerHalt();
      });
    }

    this._lock = false;
  };

  buildMapValues = <V2>(
    f: (value: V, key: K) => V2
  ): WithKeyValue<Tp, K, V2>['normal'] => {
    if (undefined !== this.source) return this.source.mapValues<V2>(f) as any;

    if (this.size === 0) return this.context.empty();

    const keyOrder = this.keyOrderBuilder.build().assumeNonEmpty();
    const sourceMap = this.mapBuilder.buildMapValues(f).assumeNonEmpty();

    return this.context.createNonEmpty<K, V2>(keyOrder, sourceMap) as any;
  };

  build = (): WithKeyValue<Tp, K, V>['normal'] => {
    if (undefined !== this.source) return this.source as any;
    if (this.size === 0) return this.context.empty();

    const keyOrder = this.keyOrderBuilder.build().assumeNonEmpty();
    const sourceMap = this.mapBuilder.build().assumeNonEmpty();

    return this.context.createNonEmpty<K, V>(keyOrder, sourceMap) as any;
  };

  removeFromKeyOrderInternal(key: K): void {
    let index = -1;
    this.keyOrderBuilder.forEach((k, i, halt): void => {
      if (Object.is(k, key)) {
        index = i;
        halt();
      }
    });
    this.keyOrderBuilder.remove(index);
  }
}
