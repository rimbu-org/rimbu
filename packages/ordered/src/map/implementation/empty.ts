import { Token } from '@rimbu/base';
import { CustomBase } from '@rimbu/collection-types';
import { OptLazy, OptLazyOr, ToJSON } from '@rimbu/common';
import type { List } from '@rimbu/list';
import { Stream, StreamSource } from '@rimbu/stream';
import type { OrderedMapBase, OrderedMapTypes } from '../../ordered-custom';

export class OrderedMapEmpty<
    K = any,
    V = any,
    Tp extends OrderedMapTypes = OrderedMapTypes
  >
  extends CustomBase.EmptyBase
  implements OrderedMapBase<K, V, Tp>
{
  constructor(readonly context: CustomBase.WithKeyValue<Tp, K, V>['context']) {
    super();
  }

  get keyOrder(): List<K> {
    return this.context.listContext.empty();
  }

  get sourceMap(): CustomBase.WithKeyValue<Tp, K, V>['sourceMap'] {
    return this.context.mapContext.empty();
  }

  streamKeys(): Stream<K> {
    return Stream.empty();
  }

  streamValues(): Stream<V> {
    return Stream.empty();
  }

  hasKey(): false {
    return false;
  }

  get<O>(key: K, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  set(key: K, value: V): CustomBase.WithKeyValue<Tp, K, V>['nonEmpty'] {
    return this.addEntry([key, value]);
  }

  addEntry(
    entry: readonly [K, V]
  ): CustomBase.WithKeyValue<Tp, K, V>['nonEmpty'] {
    return this.context.createNonEmpty<K, V>(
      this.context.listContext.of(entry[0]),
      this.context.mapContext.of(entry)
    ) as any;
  }

  addEntries(
    entries: StreamSource<readonly [K, V]>
  ): CustomBase.WithKeyValue<Tp, K, V>['normal'] | any {
    if (StreamSource.isEmptyInstance(entries)) return this;

    return this.context.from(entries);
  }

  modifyAt(
    key: K,
    options: { ifNew?: OptLazyOr<V, Token> }
  ): CustomBase.WithKeyValue<Tp, K, V>['normal'] {
    if (undefined === options.ifNew) return this as any;

    const value = OptLazyOr(options.ifNew, Token);

    if (Token === value) return this as any;

    return this.addEntry([key, value]) as any;
  }

  removeKey(): CustomBase.WithKeyValue<Tp, K, V>['normal'] {
    return this as any;
  }

  removeKeys(): CustomBase.WithKeyValue<Tp, K, V>['normal'] {
    return this as any;
  }

  removeKeyAndGet(): undefined {
    return undefined;
  }

  mapValues(): any {
    return this;
  }

  updateAt(): any {
    return this;
  }

  toBuilder(): CustomBase.WithKeyValue<Tp, K, V>['builder'] {
    return this.context.builder() as any;
  }

  toString(): string {
    return 'OrderedMap()';
  }

  toJSON(): ToJSON<any[]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }

  extendValues(): any {
    return this;
  }

  mergeAll<O, I extends readonly [unknown, ...unknown[]]>(
    fillValue: O,
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ): any {
    return this.context.mergeAll(
      fillValue,
      this,
      ...(sources as any as [any, ...any[]])
    );
  }

  mergeAllWith<R, O, I extends readonly [unknown, ...unknown[]]>(
    fillValue: O,
    mergeFun: (
      key: K,
      value: V | O,
      ...values: { [KT in keyof I]: I[KT] | O }
    ) => R,
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ): any {
    return this.context.mergeAllWith(
      fillValue,
      mergeFun as any,
      this,
      ...(sources as any as [any, ...any[]])
    );
  }

  merge<I extends readonly [unknown, ...unknown[]]>(
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ): any {
    return this.context.merge(
      ((key: any, ...values: I): I => values) as any,
      this,
      ...(sources as any as [any, ...any[]])
    );
  }

  mergeWith<R, K, I extends readonly [unknown, ...unknown[]]>(
    mergeFun: (key: K, ...values: I) => R,
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ): any {
    return this.context.mergeWith(
      mergeFun as any,
      this as any,
      ...(sources as any as [any, ...any[]])
    );
  }
}
