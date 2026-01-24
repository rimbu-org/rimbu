import type { BiMapContext } from '@rimbu/bimap/custom';
import type { BiMap } from '@rimbu/bimap';

import type { RMap } from '@rimbu/collection-types/map';
import { EmptyBase, NonEmptyBase } from '@rimbu/collection-types/map-custom';
import {
  type ArrayNonEmpty,
  OptLazy,
  type RelatedTo,
  type ToJSON,
  TraverseState,
  Update,
} from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';
import { isEmptyStreamSourceInstance } from '@rimbu/stream/custom';

export class BiMapEmpty<K = any, V = any>
  extends EmptyBase
  implements BiMap<K, V>
{
  declare _NonEmptyType: BiMap.NonEmpty<K, V>;

  constructor(readonly context: BiMapContext<K, V>) {
    super();
  }

  get size(): 0 {
    return 0;
  }

  get keyValueMap(): RMap<K, V> {
    return this.context.keyValueContext.empty();
  }

  get valueKeyMap(): RMap<V, K> {
    return this.context.valueKeyContext.empty();
  }

  hasKey(): false {
    return false;
  }

  hasValue(): false {
    return false;
  }

  getValue<_, O>(key: K, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  getKey<_, O>(value: V, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  set(key: K, value: V): BiMap.NonEmpty<K, V> {
    return this.addEntry([key, value]);
  }

  addEntry(entry: readonly [K, V]): BiMap.NonEmpty<K, V> {
    return new BiMapNonEmptyImpl(
      this.context,
      this.context.keyValueContext.of(entry),
      this.context.valueKeyContext.of([entry[1], entry[0]])
    );
  }

  addEntries(entries: StreamSource<readonly [K, V]>): BiMap.NonEmpty<K, V> {
    return this.context.from(entries);
  }

  removeKey(): this {
    return this;
  }

  removeKeyAndGet(): undefined {
    return undefined;
  }

  removeKeys(): this {
    return this;
  }

  removeValue(): this {
    return this;
  }

  removeValueAndGet(): undefined {
    return undefined;
  }

  removeValues(): this {
    return this;
  }

  updateKeyAtValue(): this {
    return this;
  }

  updateValueAtKey(): this {
    return this;
  }

  streamKeys(): Stream<K> {
    return Stream.empty();
  }

  streamValues(): Stream<V> {
    return Stream.empty();
  }

  toBuilder(): BiMap.Builder<K, V> {
    return this.context.builder();
  }

  toString(): string {
    return `BiMap()`;
  }

  toJSON(): ToJSON<(readonly [K, V])[], this['context']['typeTag']> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }
}

export class BiMapNonEmptyImpl<K, V>
  extends NonEmptyBase<readonly [K, V]>
  implements BiMap.NonEmpty<K, V>
{
  declare _NonEmptyType: BiMap.NonEmpty<K, V>;

  constructor(
    readonly context: BiMapContext<K, V>,
    readonly keyValueMap: RMap.NonEmpty<K, V>,
    readonly valueKeyMap: RMap.NonEmpty<V, K>
  ) {
    super();
  }

  copy(
    keyValueMap = this.keyValueMap,
    valueKeyMap = this.valueKeyMap
  ): BiMap.NonEmpty<K, V> {
    if (keyValueMap === this.keyValueMap && valueKeyMap === this.valueKeyMap)
      return this;
    return new BiMapNonEmptyImpl(this.context, keyValueMap, valueKeyMap);
  }

  copyE(
    keyValueMap: RMap<K, V> = this.keyValueMap,
    valueKeyMap: RMap<V, K> = this.valueKeyMap
  ): BiMap<K, V> {
    if (keyValueMap.nonEmpty() && valueKeyMap.nonEmpty()) {
      return new BiMapNonEmptyImpl(this.context, keyValueMap, valueKeyMap);
    }
    return this.context.empty();
  }

  get size(): number {
    return this.keyValueMap.size;
  }

  asNormal(): this {
    return this;
  }

  stream(): Stream.NonEmpty<readonly [K, V]> {
    return this.keyValueMap.stream();
  }

  streamKeys(): Stream.NonEmpty<K> {
    return this.keyValueMap.streamKeys();
  }

  streamValues(): Stream.NonEmpty<V> {
    return this.valueKeyMap.streamKeys();
  }

  hasKey<UK>(key: RelatedTo<K, UK>): boolean {
    const token = Symbol();
    return token !== this.getValue(key, token);
  }

  hasValue<UV>(value: RelatedTo<V, UV>): boolean {
    const token = Symbol();

    return token !== this.getKey(value, token);
  }

  getValue<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O {
    return this.keyValueMap.get(key, otherwise!);
  }

  getKey<UV, O>(value: RelatedTo<V, UV>, otherwise?: OptLazy<O>): K | O {
    return this.valueKeyMap.get(value, otherwise!);
  }

  set(key: K, value: V): BiMap.NonEmpty<K, V> {
    return this.addEntry([key, value]);
  }

  addEntry(entry: readonly [K, V]): BiMap.NonEmpty<K, V> {
    const [key, value] = entry;

    const removeKeyResult = this.keyValueMap.removeKeyAndGet(key);
    const removeValueResult = this.valueKeyMap.removeKeyAndGet(value);

    if (undefined === removeKeyResult && undefined === removeValueResult) {
      // key and value were not present
      return this.copy(
        this.keyValueMap.addEntry(entry),
        this.valueKeyMap.set(value, key)
      );
    }

    if (undefined !== removeKeyResult && undefined !== removeValueResult) {
      const [removedKeyValueMap, oldValue] = removeKeyResult;
      const [removedValueKeyMap, oldKey] = removeValueResult;

      // check if existing entry was not same
      if (Object.is(oldKey, key) && Object.is(oldValue, value)) return this;

      const newKeyValueMap = removedKeyValueMap
        .removeKey(oldKey)
        .addEntry(entry);
      const newValueKeyMap = removedValueKeyMap
        .removeKey(oldValue)
        .set(value, key);

      return this.copy(newKeyValueMap, newValueKeyMap);
    }

    const newKeyValueMap = (
      undefined === removeValueResult
        ? this.keyValueMap
        : this.keyValueMap.removeKey(removeValueResult[1])
    ).addEntry(entry);

    const newValueKeyMap = (
      undefined === removeKeyResult
        ? this.valueKeyMap
        : this.valueKeyMap.removeKey(removeKeyResult[1])
    ).set(value, key);

    return this.copy(newKeyValueMap, newValueKeyMap);
  }

  addEntries(entries: StreamSource<readonly [K, V]>): BiMap.NonEmpty<K, V> {
    if (isEmptyStreamSourceInstance(entries)) return this;

    const builder = this.toBuilder();

    builder.addEntries(entries);

    return builder.build() as BiMap.NonEmpty<K, V>;
  }

  removeKey<UK>(key: RelatedTo<K, UK>): BiMap<K, V> {
    const removeKeyResult = this.keyValueMap.removeKeyAndGet(key);

    if (undefined === removeKeyResult) return this;

    const [newKeyValueMap, oldValue] = removeKeyResult;

    if (this.size === 1) return this.context.empty();

    const newValueKeyMap = this.valueKeyMap.removeKey(oldValue!);

    return this.copy(
      newKeyValueMap.assumeNonEmpty(),
      newValueKeyMap.assumeNonEmpty()
    );
  }

  removeKeyAndGet<UK>(key: RelatedTo<K, UK>): [BiMap<K, V>, V] | undefined {
    const removeKeyResult = this.keyValueMap.removeKeyAndGet(key);

    if (undefined === removeKeyResult) return undefined;

    const [newKeyValueMap, oldValue] = removeKeyResult;

    if (this.size === 1) return [this.context.empty(), oldValue];

    const newValueKeyMap = this.valueKeyMap.removeKey(oldValue);

    return [
      this.copy(
        newKeyValueMap.assumeNonEmpty(),
        newValueKeyMap.assumeNonEmpty()
      ),
      oldValue,
    ];
  }

  removeKeys<UK>(keys: Stream<RelatedTo<K, UK>>): BiMap<K, V> {
    if (isEmptyStreamSourceInstance(keys)) return this;

    const builder = this.toBuilder();

    builder.removeKeys(keys);

    return builder.build();
  }

  removeValue<UV>(value: RelatedTo<V, UV>): BiMap<K, V> {
    const removeResult = this.valueKeyMap.removeKeyAndGet(value);

    if (undefined === removeResult) return this;

    const [newValueKeyMap, oldKey] = removeResult;

    if (this.size === 1) return this.context.empty();

    const newKeyValueMap = this.keyValueMap.removeKey(oldKey!);

    return this.copy(
      newKeyValueMap.assumeNonEmpty(),
      newValueKeyMap.assumeNonEmpty()
    );
  }

  removeValueAndGet<UV>(value: RelatedTo<V, UV>): [BiMap<K, V>, K] | undefined {
    const removeValueResult = this.valueKeyMap.removeKeyAndGet(value);

    if (undefined === removeValueResult) return undefined;

    const [newValueKeyMap, oldKey] = removeValueResult;

    if (this.size === 1) return [this.context.empty(), oldKey];

    const newKeyValueMap = this.keyValueMap.removeKey(oldKey);

    return [
      this.copy(
        newKeyValueMap.assumeNonEmpty(),
        newValueKeyMap.assumeNonEmpty()
      ),
      oldKey,
    ];
  }

  removeValues<UV>(values: Stream<RelatedTo<V, UV>>): BiMap<K, V> {
    if (isEmptyStreamSourceInstance(values)) return this;

    const builder = this.toBuilder();

    builder.removeValues(values);

    return builder.build();
  }

  updateValueAtKey(key: K, valueUpdate: Update<V>): BiMap.NonEmpty<K, V> {
    const token = Symbol();
    const currentValue = this.getValue(key, token);
    if (token === currentValue) return this;

    const newValue = Update(currentValue, valueUpdate);
    if (Object.is(newValue, currentValue)) return this;
    return this.set(key, newValue);
  }

  updateKeyAtValue(keyUpdate: Update<K>, value: V): BiMap.NonEmpty<K, V> {
    const token = Symbol();
    const result = this.getKey(value, token);
    if (token === result) return this;

    const newKey = Update(result, keyUpdate);
    if (Object.is(newKey, result)) return this;
    return this.set(newKey, value);
  }

  forEach(
    f: (entry: readonly [K, V], index: number, halt: () => void) => void,
    options: { state?: TraverseState } = {}
  ): void {
    const { state = TraverseState() } = options;

    if (state.halted) return;
    this.keyValueMap.forEach(f, { state });
  }

  filter(
    pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean,
    options: { negate?: boolean } = {}
  ): BiMap<K, V> {
    const builder = this.context.builder();

    builder.addEntries(this.stream().filter(pred, options));

    if (builder.size === this.size) return this;

    return builder.build();
  }

  toBuilder(): BiMap.Builder<K, V> {
    return this.context.createBuilder(this);
  }

  toArray(): ArrayNonEmpty<readonly [K, V]> {
    return this.keyValueMap.toArray();
  }

  toString(): string {
    return this.stream().join({
      start: `BiMap(`,
      sep: ', ',
      end: `)`,
      valueToString: (entry) => `${entry[0]} <-> ${entry[1]}`,
    });
  }

  toJSON(): ToJSON<(readonly [K, V])[], this['context']['typeTag']> {
    return {
      dataType: this.context.typeTag,
      value: this.toArray(),
    };
  }
}
