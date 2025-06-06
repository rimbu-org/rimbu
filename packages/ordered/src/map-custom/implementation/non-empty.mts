import { RimbuError, type Token } from '@rimbu/base';
import {
  NonEmptyBase,
  type WithKeyValue,
} from '@rimbu/collection-types/map-custom';
import {
  TraverseState,
  type ArrayNonEmpty,
  type OptLazy,
  type OptLazyOr,
  type RelatedTo,
  type ToJSON,
  type Update,
} from '@rimbu/common';
import type { List } from '@rimbu/list';
import type { Stream, StreamSource } from '@rimbu/stream';
import { isEmptyStreamSourceInstance } from '@rimbu/stream/custom';

import type {
  OrderedMapBase,
  OrderedMapTypes,
} from '@rimbu/ordered/map-custom';

export class OrderedMapNonEmpty<
    K,
    V,
    Tp extends OrderedMapTypes = OrderedMapTypes,
    TpG extends WithKeyValue<Tp, K, V> = WithKeyValue<Tp, K, V>,
  >
  extends NonEmptyBase<[K, V]>
  implements OrderedMapBase.NonEmpty<K, V, Tp>
{
  _NonEmptyType!: Tp['nonEmpty'];

  constructor(
    readonly context: TpG['context'],
    readonly keyOrder: List.NonEmpty<K>,
    readonly sourceMap: TpG['sourceMapNonEmpty']
  ) {
    super();
  }

  copy(keyOrder = this.keyOrder, sourceMap = this.sourceMap): TpG['nonEmpty'] {
    if (keyOrder === this.keyOrder && sourceMap === this.sourceMap) {
      return this as any;
    }

    return this.context.createNonEmpty<K, V>(keyOrder, sourceMap as any) as any;
  }

  get size(): number {
    return this.keyOrder.length;
  }

  stream(): Stream.NonEmpty<[K, V]> {
    return this.streamKeys().map((k): [K, V] => [
      k,
      this.sourceMap.get(k, RimbuError.throwInvalidStateError),
    ]);
  }

  streamKeys(): Stream.NonEmpty<K> {
    return this.keyOrder.stream();
  }

  streamValues(): Stream.NonEmpty<V> {
    return this.streamKeys().map(
      (k): V => this.sourceMap.get(k, RimbuError.throwInvalidStateError)
    );
  }

  hasKey<UK>(key: RelatedTo<K, UK>): boolean {
    return this.sourceMap.hasKey(key);
  }

  get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O {
    return this.sourceMap.get(key, otherwise!);
  }

  set(key: K, value: V): WithKeyValue<Tp, K, V>['nonEmpty'] {
    let newKeyOrder = this.keyOrder;
    const newSourceMap = this.sourceMap.modifyAt(key, {
      ifNew: (): V => {
        newKeyOrder = newKeyOrder.append(key);
        return value;
      },
      ifExists: () => value,
    });

    return this.copy(newKeyOrder, newSourceMap as any);
  }

  addEntry(entry: readonly [K, V]): WithKeyValue<Tp, K, V>['nonEmpty'] {
    return this.set(entry[0], entry[1]);
  }

  addEntries(
    entries: StreamSource<readonly [K, V]>
  ): OrderedMapBase<K, V, Tp> | any {
    if (isEmptyStreamSourceInstance(entries)) return this as any;

    const builder = this.toBuilder();
    builder.addEntries(entries);
    return builder.build().assumeNonEmpty();
  }

  removeKey<UK>(key: RelatedTo<K, UK>): TpG['normal'] {
    if (!this.context.mapContext.isValidKey(key)) return this as any;

    const newSourceMap = this.sourceMap.removeKey(key);

    if (newSourceMap === this.sourceMap) return this as any;

    if (newSourceMap.nonEmpty()) {
      const index = this.keyOrder.stream().indexOf(key as K)!;
      const newKeyOrder = this.keyOrder.remove(index);

      if (newKeyOrder.nonEmpty()) {
        return this.copy(newKeyOrder, newSourceMap) as any;
      }
    }

    return this.context.empty<K, V>();
  }

  removeKeys<UK>(keys: StreamSource<RelatedTo<K, UK>>): TpG['normal'] {
    if (isEmptyStreamSourceInstance(keys)) return this as any;

    const builder = this.toBuilder();
    builder.removeKeys(keys);
    return builder.build();
  }

  removeKeyAndGet<UK>(key: RelatedTo<K, UK>): [TpG['normal'], V] | undefined {
    if (!this.context.mapContext.isValidKey(key)) {
      return undefined;
    }

    const removeSourceResult = this.sourceMap.removeKeyAndGet(key);

    if (undefined === removeSourceResult) {
      return undefined;
    }

    const [newSourceMap, removedValue] = removeSourceResult;

    if (newSourceMap.nonEmpty()) {
      const index = this.keyOrder.stream().indexOf(key as K)!;
      const newKeyOrder = this.keyOrder.remove(index);

      if (newKeyOrder.nonEmpty()) {
        return [this.copy(newKeyOrder, newSourceMap) as any, removedValue!];
      }
    }

    return [this.context.empty<K, V>(), removedValue!];
  }

  modifyAt(
    key: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentValue: V, remove: Token) => V | Token;
    }
  ): TpG['normal'] {
    let newKeyOrder: List<K> = this.keyOrder;

    const result = this.sourceMap.modifyAt(key, options);
    if (result === this.sourceMap) return this as any;
    if (result.isEmpty) return this.context.empty<K, V>();

    if (result.size < this.sourceMap.size) {
      const index = this.keyOrder.stream().indexOf(key)!;
      newKeyOrder = newKeyOrder.remove(index);
    } else if (result.size > this.sourceMap.size) {
      newKeyOrder = newKeyOrder.append(key);
    }

    if (result.nonEmpty() && newKeyOrder.nonEmpty()) {
      return this.copy(newKeyOrder, result) as any;
    }

    return this.context.empty();
  }

  forEach(
    f: (entry: [K, V], index: number, halt: () => void) => void,
    options: { reversed?: boolean; state?: TraverseState } = {}
  ): void {
    const { reversed = false, state = TraverseState() } = options;

    if (state.halted) return;

    const keyIter = this.keyOrder.stream({ reversed })[Symbol.iterator]();

    const done = Symbol('Done');
    let key: K | typeof done;
    const sourceMap = this.sourceMap;
    const { halt } = state;

    while (!state.halted && done !== (key = keyIter.fastNext(done))) {
      f(
        [key, sourceMap.get(key, RimbuError.throwInvalidStateError)],
        state.nextIndex(),
        halt
      );
    }
  }

  filter(
    pred: (entry: [K, V], index: number, halt: () => void) => boolean,
    options: { negate?: boolean } = {}
  ): TpG['normal'] {
    const { negate = false } = options;

    const builder = this.context.builder<K, V>();

    builder.addEntries(this.stream().filter(pred, { negate }));

    if (builder.size === this.size) return this as any;

    return builder.build() as any;
  }

  mapValues<V2>(mapFun: (value: V, key: K) => V2): any {
    return this.context.createNonEmpty<K, V2>(
      this.keyOrder,
      this.sourceMap.mapValues(mapFun)
    );
  }

  updateAt<UK>(key: RelatedTo<K, UK>, update: Update<V>): any {
    return this.copy(this.keyOrder, this.sourceMap.updateAt(key, update));
  }

  toArray(): ArrayNonEmpty<[K, V]> {
    return this.stream().toArray();
  }

  toBuilder(): TpG['builder'] {
    return this.context.createBuilder(this as any) as any;
  }

  toString(): string {
    return this.stream().join({
      start: 'OrderedMap(',
      sep: ', ',
      end: ')',
      valueToString: (entry) => `${entry[0]} -> ${entry[1]}`,
    });
  }

  toJSON(): ToJSON<(readonly [K, V])[]> {
    return {
      dataType: this.context.typeTag,
      value: this.sourceMap.toJSON().value,
    };
  }
}
