import type {
  BiMultiMapBase,
  ContextTypesImpl,
} from '@rimbu/bimultimap/custom';

import {
  EmptyBase,
  NonEmptyBase,
  type WithKeyValue,
} from '@rimbu/collection-types/map-custom';
import type { RelatedTo, ToJSON, TraverseState } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

export class BiMultiMapEmpty<K, V, Tp extends ContextTypesImpl>
  extends EmptyBase
  implements BiMultiMapBase<K, V, Tp>
{
  declare _NonEmptyType: WithKeyValue<Tp, K, V>['nonEmpty'];

  constructor(readonly context: WithKeyValue<Tp, K, V>['context']) {
    super();
  }

  get keyValueMultiMap(): WithKeyValue<Tp, K, V>['keyValueMultiMap'] {
    return this.context.keyValueMultiMapContext.empty();
  }

  get valueKeyMultiMap(): WithKeyValue<Tp, K, V>['valueKeyMultiMap'] {
    return this.context.valueKeyMultiMapContext.empty();
  }

  get keySize(): 0 {
    return 0;
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

  hasValue(): false {
    return false;
  }

  hasEntry(): false {
    return false;
  }

  add(key: K, value: V): WithKeyValue<Tp, K, V>['nonEmpty'] {
    return this.context.createNonEmpty<K, V>(
      this.context.keyValueMultiMapContext.of([key, value]),
      this.context.valueKeyMultiMapContext.of([value, key])
    ) as WithKeyValue<Tp, K, V>['nonEmpty'];
  }

  addEntries(
    entries: StreamSource<readonly [K, V]>
  ): WithKeyValue<Tp, K, V>['nonEmpty'] {
    return this.context.from(entries) as WithKeyValue<Tp, K, V>['nonEmpty'];
  }

  setValues(
    key: K,
    values: StreamSource<V>
  ): WithKeyValue<Tp, K, V>['nonEmpty'] {
    return this.context.from<K, V>(
      Stream.from(values).map((value) => [key, value])
    ) as WithKeyValue<Tp, K, V>['nonEmpty'];
  }

  setKeys(value: V, keys: StreamSource<K>): WithKeyValue<Tp, K, V>['nonEmpty'] {
    return this.context.from<K, V>(
      Stream.from(keys).map((key) => [key, value])
    ) as WithKeyValue<Tp, K, V>['nonEmpty'];
  }

  getValues(): WithKeyValue<Tp, K, V>['keyMultiMapValues'] {
    return this.context.keyValueMultiMapContext.keyMapValuesContext.empty();
  }

  getKeys(): WithKeyValue<Tp, K, V>['valueMultiMapValues'] {
    return this.context.valueKeyMultiMapContext.keyMapValuesContext.empty();
  }

  removeKey(): WithKeyValue<Tp, K, V>['normal'] {
    return this as WithKeyValue<Tp, K, V>['normal'];
  }

  removeKeys(): WithKeyValue<Tp, K, V>['normal'] {
    return this as WithKeyValue<Tp, K, V>['normal'];
  }

  removeEntry(): WithKeyValue<Tp, K, V>['normal'] {
    return this as WithKeyValue<Tp, K, V>['normal'];
  }

  removeEntries(): WithKeyValue<Tp, K, V>['normal'] {
    return this as WithKeyValue<Tp, K, V>['normal'];
  }

  removeValue(): WithKeyValue<Tp, K, V>['normal'] {
    return this as WithKeyValue<Tp, K, V>['normal'];
  }

  removeValues(): WithKeyValue<Tp, K, V>['normal'] {
    return this as WithKeyValue<Tp, K, V>['normal'];
  }

  toString(): string {
    return `${this.context.typeTag}()`;
  }

  toJSON(): ToJSON<any[]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }

  toBuilder(): WithKeyValue<Tp, K, V>['builder'] {
    return this.context.builder();
  }
}

export class BiMultiMapNonEmpty<
    K,
    V,
    Tp extends ContextTypesImpl,
    TpG extends WithKeyValue<Tp, K, V> = WithKeyValue<Tp, K, V>,
  >
  extends NonEmptyBase<[K, V]>
  implements BiMultiMapBase.NonEmpty<K, V, Tp>
{
  declare _NonEmptyType: TpG['nonEmpty'];

  constructor(
    readonly context: WithKeyValue<Tp, K, V>['context'],
    readonly keyValueMultiMap: TpG['keyValueMultiMapNonEmpty'],
    readonly valueKeyMultiMap: TpG['valueKeyMultiMapNonEmpty']
  ) {
    super();
  }

  assumeNonEmpty(): any {
    return this;
  }

  asNormal(): any {
    return this;
  }

  get keySize(): number {
    return this.keyValueMultiMap.keySize;
  }

  get size(): number {
    return this.keyValueMultiMap.size;
  }

  stream(): Stream.NonEmpty<[K, V]> {
    return this.keyValueMultiMap.stream();
  }

  streamKeys(): Stream.NonEmpty<K> {
    return this.keyValueMultiMap.streamKeys();
  }

  streamValues(): Stream.NonEmpty<V> {
    return this.valueKeyMultiMap.streamKeys();
  }

  hasKey<UK = K>(key: RelatedTo<K, UK>): boolean {
    return this.keyValueMultiMap.hasKey(key);
  }

  hasValue<UV = V>(key: RelatedTo<V, UV>): boolean {
    return this.valueKeyMultiMap.hasKey(key);
  }

  hasEntry<UK = K, UV = V>(
    key: RelatedTo<K, UK>,
    value: RelatedTo<V, UV>
  ): boolean {
    return this.hasKey(key) && this.hasValue(value);
  }

  add(key: K, value: V): WithKeyValue<Tp, K, V>['nonEmpty'] {
    const newKeyValueMultiMap = this.keyValueMultiMap.add(key, value);

    if (newKeyValueMultiMap === this.keyValueMultiMap) return this as any;

    const newValueKeyMultiMap = this.valueKeyMultiMap.add(value, key);

    return this.context.createNonEmpty<K, V>(
      newKeyValueMultiMap,
      newValueKeyMultiMap
    ) as WithKeyValue<Tp, K, V>['nonEmpty'];
  }

  addEntries(
    entries: StreamSource<readonly [K, V]>
  ): WithKeyValue<Tp, K, V>['nonEmpty'] {
    const builder = this.toBuilder();
    builder.addEntries(entries);
    return builder.build() as WithKeyValue<Tp, K, V>['nonEmpty'];
  }

  setValues(
    key: K,
    values: StreamSource<V>
  ): WithKeyValue<Tp, K, V>['nonEmpty'] {
    const builder = this.toBuilder();
    builder.setValues(key, values);
    return builder.build() as WithKeyValue<Tp, K, V>['nonEmpty'];
  }

  setKeys(value: V, keys: StreamSource<K>): WithKeyValue<Tp, K, V>['nonEmpty'] {
    const builder = this.toBuilder();
    builder.setKeys(value, keys);
    return builder.build() as WithKeyValue<Tp, K, V>['nonEmpty'];
  }

  getValues<UK = K>(
    key: RelatedTo<K, UK>
  ): WithKeyValue<Tp, K, V>['keyMultiMapValues'] {
    return this.keyValueMultiMap.getValues(key) as any;
  }

  getKeys<UV = V>(
    value: RelatedTo<V, UV>
  ): WithKeyValue<Tp, K, V>['valueMultiMapValues'] {
    return this.valueKeyMultiMap.getValues(value) as any;
  }

  removeKey<UK = K>(key: RelatedTo<K, UK>): WithKeyValue<Tp, K, V>['normal'] {
    const result = this.keyValueMultiMap.removeKeyAndGet(key);

    if (undefined === result) {
      return this as WithKeyValue<Tp, K, V>['normal'];
    }

    const [newKeyValueMultiMap, oldValues] = result;

    if (!newKeyValueMultiMap.nonEmpty()) return this.context.empty();

    const newValueKeyMultiMap = this.valueKeyMultiMap
      .removeEntries(oldValues.stream().map((value) => [value, key] as [V, K]))
      .assumeNonEmpty();

    return this.context.createNonEmpty<K, V>(
      newKeyValueMultiMap,
      newValueKeyMultiMap
    ) as WithKeyValue<Tp, K, V>['normal'];
  }

  removeKeys<UK = K>(
    keys: StreamSource<RelatedTo<K, UK>>
  ): WithKeyValue<Tp, K, V>['normal'] {
    const builder = this.toBuilder();

    builder.removeKeys(keys);
    return builder.build();
  }

  removeValue<UV = V>(
    value: RelatedTo<V, UV>
  ): WithKeyValue<Tp, K, V>['normal'] {
    const result = this.valueKeyMultiMap.removeKeyAndGet(value);

    if (undefined === result) {
      return this as WithKeyValue<Tp, K, V>['normal'];
    }

    const [newValueKeyMultiMap, oldKeys] = result;

    if (!newValueKeyMultiMap.nonEmpty()) return this.context.empty();

    const newKeyValueMultiMap = this.keyValueMultiMap
      .removeEntries(oldKeys.stream().map((key) => [key, value] as [K, V]))
      .assumeNonEmpty();

    return this.context.createNonEmpty<K, V>(
      newKeyValueMultiMap,
      newValueKeyMultiMap
    ) as WithKeyValue<Tp, K, V>['normal'];
  }

  removeValues<UV = V>(
    values: StreamSource<RelatedTo<V, UV>>
  ): WithKeyValue<Tp, K, V>['normal'] {
    const builder = this.toBuilder();

    builder.removeValues(values);
    return builder.build();
  }

  removeEntry<UK = K>(
    key: RelatedTo<K, UK>,
    value: V
  ): WithKeyValue<Tp, K, V>['normal'] {
    const newKeyValueMultiMap = this.keyValueMultiMap.removeEntry(key, value);

    if (newKeyValueMultiMap === this.keyValueMultiMap)
      return this as WithKeyValue<Tp, K, V>['normal'];
    if (!newKeyValueMultiMap.nonEmpty()) return this.context.empty();

    const newValueKeyMultiMap = this.valueKeyMultiMap
      .removeEntry(value, key as any)
      .assumeNonEmpty();

    return this.context.createNonEmpty<K, V>(
      newKeyValueMultiMap,
      newValueKeyMultiMap
    ) as WithKeyValue<Tp, K, V>['normal'];
  }

  removeEntries<UK = K>(
    entries: StreamSource<[RelatedTo<K, UK>, V]>
  ): WithKeyValue<Tp, K, V>['normal'] {
    const builder = this.toBuilder();
    builder.removeEntries(entries);
    return builder.build();
  }

  forEach(
    f: (entry: [K, V], index: number, halt: () => void) => void,
    options: { state?: TraverseState } = {}
  ): void {
    this.keyValueMultiMap.forEach(f, options);
  }

  filter(
    pred: (entry: [K, V], index: number, halt: () => void) => boolean,
    options: { negate?: boolean } = {}
  ): WithKeyValue<Tp, K, V>['normal'] {
    const builder = this.context.builder<K, V>();

    builder.addEntries(this.stream().filter(pred, options));

    if (builder.size === this.size) return this as any;

    return builder.build() as WithKeyValue<Tp, K, V>['normal'];
  }

  toArray(): [K, V][] {
    return this.keyValueMultiMap.toArray();
  }

  toString(): string {
    return this.keyValueMultiMap.streamKeys().join({
      start: `${this.context.typeTag}(`,
      sep: ', ',
      end: ')',
      valueToString: (key: K) => {
        return `${key} <-> ${this.keyValueMultiMap
          .getValues(key)
          .stream()
          .join({ start: '(', sep: ', ', end: ')' })}`;
      },
    });
  }

  toJSON(): ToJSON<[K, V[]][], this['context']['typeTag']> {
    return {
      dataType: this.context.typeTag,
      value: this.keyValueMultiMap.toJSON().value,
    };
  }

  toBuilder(): WithKeyValue<Tp, K, V>['builder'] {
    return this.context.createBuilder<K, V>(this as any) as WithKeyValue<
      Tp,
      K,
      V
    >['builder'];
  }
}
