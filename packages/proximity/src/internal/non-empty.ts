import type { Token } from "@rimbu/base/token";
import type { TraverseState } from "@rimbu/common/traverse-state";
import type { ArrayNonEmpty, RelatedTo, ToJSON } from "@rimbu/common/types";
import type { HashMap } from "@rimbu/hashed/map";
import type { ProximityMap } from "@rimbu/proximity";
import type { FastIterator, Stream, StreamSource } from "@rimbu/stream";

import type { ContextImpl } from "#proximity/context-factory";

import { OptLazy, type OptLazyOr } from "@rimbu/common/opt-lazy";
import { findNearestKeyMatch } from "@rimbu/proximity/key-matching";

import { wrapHashMap } from "#proximity/wrapping";

const toStringBeginning = /^[^(]+/;

/**
 * Concrete non-empty implementation of {@link ProximityMap.NonEmpty}.<br/>
 * <br/>
 * It stores entries in a non-empty `HashMap` and applies the configured distance function
 * when resolving lookups via {@link ProximityMapNonEmpty.get}.
 *
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export class ProximityMapNonEmpty<K, V> implements ProximityMap.NonEmpty<K, V> {
  _NonEmptyType!: ProximityMap.NonEmpty<K, V>;

  readonly isEmpty = false;

  constructor(
    readonly context: ContextImpl<K>,
    private readonly internalMap: HashMap.NonEmpty<K, V>,
  ) {}

  private plugInternalMap(
    newInternalMap: HashMap.NonEmpty<K, V>,
  ): ProximityMap.NonEmpty<K, V>;
  private plugInternalMap(newInternalMap: HashMap<K, V>): ProximityMap<K, V>;
  private plugInternalMap(newInternalMap: HashMap<K, V>): ProximityMap<K, V> {
    if (newInternalMap === this.internalMap) {
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
    entries: StreamSource<readonly [K, V]>,
  ): ProximityMap.NonEmpty<K, V> {
    return this.plugInternalMap(this.internalMap.addEntries(entries));
  }

  updateAt<UK = K>(
    key: RelatedTo<K, UK>,
    update: (value: V) => V,
  ): ProximityMap.NonEmpty<K, V> {
    return this.plugInternalMap(this.internalMap.updateAt(key, update));
  }

  nonEmpty(): this is ProximityMap.NonEmpty<K, V> {
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

  mapKeys(
    mapFun: (key: K, value: V, index: number) => K,
  ): ProximityMap.NonEmpty<K, V> {
    return this.context.from(
      this.stream().map(([k, v], index) => [mapFun(k, v, index), v]),
    );
  }

  mapValues<V2>(
    mapFun: (value: V, key: K) => V2,
  ): ProximityMap.NonEmpty<K, V2> {
    return new ProximityMapNonEmpty(
      this.context,
      this.internalMap.mapValues(mapFun),
    );
  }

  mapEntries<V2>(
    mapFun: (entry: readonly [K, V], index: number) => readonly [K, V2],
  ): ProximityMap.NonEmpty<K, V2> {
    return this.context.from(this.stream().map(mapFun));
  }

  toArray(): ArrayNonEmpty<readonly [K, V]> {
    return this.internalMap.toArray();
  }

  get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
  get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
  get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O | undefined {
    const keyMatch = findNearestKeyMatch(
      this.context.distanceFunction,
      key as K,
      this.internalMap,
    );

    return keyMatch ? keyMatch.value : OptLazy(otherwise);
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
    key: RelatedTo<K, UK>,
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
    options: { state?: TraverseState } = {},
  ): void {
    this.internalMap.forEach(f, options);
  }

  filter(
    pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean,
    options: { negate?: boolean } = {},
  ): ProximityMap<K, V> {
    return this.plugInternalMap(this.internalMap.filter(pred, options));
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
        remove: Token,
      ) => V | Token;
    },
  ): ProximityMap<K, V> {
    return this.plugInternalMap(this.internalMap.modifyAt(atKey, options));
  }

  toBuilder(): ProximityMap.Builder<K, V> {
    return this.context.createBuilder<K, V>(this);
  }
}
