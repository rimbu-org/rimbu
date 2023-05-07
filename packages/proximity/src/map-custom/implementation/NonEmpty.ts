import type { HashMap } from '@rimbu/hashed/map';
import type { Token } from '@rimbu/base';
import type { RMapBase } from '@rimbu/collection-types/map-custom';
import {
  RelatedTo,
  ArrayNonEmpty,
  OptLazy,
  TraverseState,
  ToJSON,
  OptLazyOr,
} from '@rimbu/common';
import type { Stream, StreamSource, FastIterator } from '@rimbu/stream';
import { wrapHashMap } from '../wrapping';
import type { ProximityMap } from '../../map';
import { getValueWithNearestKey } from '../../common';

const toStringBeginning = /^[^(]+/;

export class ProximityMapNonEmpty<K, V> implements ProximityMap.NonEmpty<K, V> {
  readonly isEmpty = false;

  constructor(
    readonly context: ProximityMap.Context<K>,
    private readonly internalMap: HashMap.NonEmpty<K, V>
  ) {}

  private plugInternalMap(
    newInternalMap: HashMap.NonEmpty<K, V>
  ): ProximityMap.NonEmpty<K, V>;
  private plugInternalMap(newInternalMap: HashMap<K, V>): ProximityMap<K, V>;
  private plugInternalMap(newInternalMap: HashMap<K, V>): ProximityMap<K, V> {
    if (newInternalMap == this.internalMap) {
      return this;
    }

    return wrapHashMap(this.context, newInternalMap);
  }

  get size(): number {
    return this.internalMap.size;
  }

  stream(): Stream.NonEmpty<readonly [K, V]> {
    return this.internalMap.stream();
  }

  addEntries(
    entries: StreamSource<readonly [K, V]>
  ): ProximityMap.NonEmpty<K, V> {
    return this.plugInternalMap(this.internalMap.addEntries(entries));
  }

  updateAt<UK = K>(
    key: RelatedTo<K, UK>,
    update: RMapBase.Update<V>
  ): ProximityMap.NonEmpty<K, V> {
    return this.plugInternalMap(this.internalMap.updateAt(key, update));
  }

  nonEmpty(): true {
    return true;
  }

  assumeNonEmpty(): this {
    return this;
  }

  asNormal(): ProximityMap<K, V> {
    return this;
  }

  streamKeys(): Stream.NonEmpty<K> {
    return this.internalMap.streamKeys();
  }

  streamValues(): Stream.NonEmpty<V> {
    return this.internalMap.streamValues();
  }

  mapValues<V2>(
    mapFun: (value: V, key: K) => V2
  ): ProximityMap.NonEmpty<K, V2> {
    return new ProximityMapNonEmpty(
      this.context,
      this.internalMap.mapValues(mapFun)
    );
  }

  toArray(): ArrayNonEmpty<readonly [K, V]> {
    return this.internalMap.toArray();
  }

  /**
   * Applies `getValueWithNearestKey()` to its entries
   */
  get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
  get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
  get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O | undefined {
    const bestValue = getValueWithNearestKey(
      this.context.distanceFunction,
      key as K,
      this.internalMap
    );

    return bestValue ?? OptLazy(otherwise);
  }

  hasKey<UK = K>(key: RelatedTo<K, UK>): boolean {
    return this.internalMap.hasKey(key);
  }

  removeKey<UK = K>(key: RelatedTo<K, UK>): ProximityMap<K, V> {
    return this.plugInternalMap(this.internalMap.removeKey(key));
  }

  removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): ProximityMap<K, V> {
    return this.plugInternalMap(this.internalMap.removeKeys(keys));
  }

  removeKeyAndGet<UK = K>(
    key: RelatedTo<K, UK>
  ): [ProximityMap<K, V>, V] | undefined {
    const internalResult = this.internalMap.removeKeyAndGet(key);

    if (!internalResult) {
      return undefined;
    }

    const [newInternalMap, value] = internalResult;

    return [this.plugInternalMap(newInternalMap), value];
  }

  forEach(
    f: (entry: readonly [K, V], index: number, halt: () => void) => void,
    state?: TraverseState | undefined
  ): void {
    return this.internalMap.forEach(f, state);
  }

  filter(
    pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean
  ): ProximityMap<K, V> {
    return this.plugInternalMap(this.internalMap.filter(pred));
  }

  toString(): string {
    return this.internalMap
      .toString()
      .replace(toStringBeginning, this.context.typeTag);
  }

  toJSON(): ToJSON<(readonly [K, V])[], string> {
    return {
      dataType: this.context.typeTag,
      value: this.toArray(),
    };
  }

  [Symbol.iterator](): FastIterator<readonly [K, V]> {
    return this.internalMap[Symbol.iterator]();
  }

  set(key: K, value: V): ProximityMap.NonEmpty<K, V> {
    return this.plugInternalMap(this.internalMap.set(key, value));
  }

  addEntry(entry: readonly [K, V]): ProximityMap.NonEmpty<K, V> {
    return this.plugInternalMap(this.internalMap.addEntry(entry));
  }

  modifyAt(
    atKey: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: <V2 extends V = V>(
        currentEntry: V & V2,
        remove: Token
      ) => V | Token;
    }
  ): ProximityMap<K, V> {
    return this.plugInternalMap(this.internalMap.modifyAt(atKey, options));
  }

  toBuilder(): ProximityMap.Builder<K, V> {
    return this.context.createBuilder<K, V>(this);
  }
}
