import type {
  BiMultiMapBase,
  ContextTypesImpl,
} from '@rimbu/bimultimap/custom';

import { RimbuError } from '@rimbu/base';
import type { RSet } from '@rimbu/collection-types';
import type { WithKeyValue } from '@rimbu/collection-types/map-custom';
import { TraverseState, type RelatedTo } from '@rimbu/common';
import type { MultiMap } from '@rimbu/multimap';
import { Stream, type StreamSource } from '@rimbu/stream';

export class BiMultiMapBuilder<
  K,
  V,
  Tp extends ContextTypesImpl,
  TpG extends WithKeyValue<Tp, K, V> = WithKeyValue<Tp, K, V>,
> implements BiMultiMapBase.Builder<K, V, Tp>
{
  _lock = 0;

  constructor(
    readonly context: TpG['context'],
    public source?: TpG['nonEmpty']
  ) {}

  _keyValueMultiMap?: MultiMap.Builder<K, V>;

  _valueKeyMultiMap?: MultiMap.Builder<V, K>;

  get keyValueMultiMap(): MultiMap.Builder<K, V> {
    if (undefined === this._keyValueMultiMap) {
      if (undefined === this.source) {
        this._keyValueMultiMap = this.context.keyValueMultiMapContext.builder();
        this._valueKeyMultiMap = this.context.valueKeyMultiMapContext.builder();
      } else {
        this._keyValueMultiMap = this.source.keyValueMultiMap.toBuilder();
        this._valueKeyMultiMap = this.source.valueKeyMultiMap.toBuilder();
      }
    }

    return this._keyValueMultiMap;
  }

  get valueKeyMultiMap(): MultiMap.Builder<V, K> {
    if (undefined === this._valueKeyMultiMap) {
      if (undefined === this.source) {
        this._keyValueMultiMap = this.context.keyValueMultiMapContext.builder();
        this._valueKeyMultiMap = this.context.valueKeyMultiMapContext.builder();
      } else {
        this._keyValueMultiMap = this.source.keyValueMultiMap.toBuilder();
        this._valueKeyMultiMap = this.source.valueKeyMultiMap.toBuilder();
      }
    }

    return this._valueKeyMultiMap;
  }

  checkLock(): void {
    if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
  }

  get size(): number {
    return this.source?.size ?? this.keyValueMultiMap.size;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  // prettier-ignore
  hasKey = <UK = K,>(key: RelatedTo<K, UK>): boolean => {
    return this.source?.hasKey(key) ?? this.keyValueMultiMap.hasKey(key);
  };

  // prettier-ignore
  hasValue = <UV = V,>(value: RelatedTo<V, UV>): boolean => {
    return this.source?.hasValue(value) ?? this.valueKeyMultiMap.hasKey(value);
  };

  hasEntry = <UK = K, UV = V>(
    key: RelatedTo<K, UK>,
    value: RelatedTo<V, UV>
  ): boolean => {
    return (
      this.source?.hasEntry(key, value) ??
      this.keyValueMultiMap.hasEntry(key, value as any)
    );
  };

  // prettier-ignore
  getValues = <UK = K,>(
    key: RelatedTo<K, UK>
  ): WithKeyValue<Tp, K, V>['keyMultiMapValues'] => {
    if (undefined !== this.source) {
      return this.source.getValues(key) as WithKeyValue<
        Tp,
        K,
        V
      >['keyMultiMapValues'];
    }

    return this.keyValueMultiMap.getValues(key) as WithKeyValue<
      Tp,
      K,
      V
    >['keyMultiMapValues'];
  };

  // prettier-ignore
  getKeys = <UV = V,>(
    value: RelatedTo<V, UV>
  ): WithKeyValue<Tp, K, V>['valueMultiMapValues'] => {
    if (undefined !== this.source) {
      return this.source.getKeys(value) as WithKeyValue<
        Tp,
        K,
        V
      >['valueMultiMapValues'];
    }

    return this.valueKeyMultiMap.getValues(value) as WithKeyValue<
      Tp,
      K,
      V
    >['valueMultiMapValues'];
  };

  setValues = (key: K, values: StreamSource<V>): boolean => {
    this.checkLock();

    const removed = this.removeKey(key);
    const added = this.addEntries(
      Stream.from(values).map((value) => [key, value])
    );

    return removed || added;
  };

  setKeys = (value: V, keys: StreamSource<K>): boolean => {
    this.checkLock();

    const removed = this.removeValue(value);
    const added = this.addEntries(Stream.from(keys).map((key) => [key, value]));

    return removed || added;
  };

  add = (key: K, value: V): boolean => {
    this.checkLock();

    if (!this.keyValueMultiMap.add(key, value)) return false;
    this.source = undefined;
    return this.valueKeyMultiMap.add(value, key);
  };

  addEntries = (entries: StreamSource<readonly [K, V]>): boolean => {
    this.checkLock();

    return Stream.applyFilter(entries, { pred: this.add }).count() > 0;
  };

  // prettier-ignore
  removeKey = <UK = K,>(key: RelatedTo<K, UK>): boolean => {
    this.checkLock();

    const values = this.getValues(key) as RSet<V>;

    if (values.isEmpty) return false;

    this.keyValueMultiMap.removeKey(key);

    this.source = undefined;

    return this.valueKeyMultiMap.removeEntries<V, UK>(
      values.stream().map((value) => [value, key])
    );
  };

  // prettier-ignore
  removeKeys = <UK = K,>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
    this.checkLock();

    return Stream.from(keys).filterPure({ pred: this.removeKey }).count() > 0;
  };

  // prettier-ignore
  removeValue = <UV = V,>(value: RelatedTo<V, UV>): boolean => {
    this.checkLock();

    const keys = this.getKeys(value) as RSet<K>;

    if (keys.isEmpty) return false;

    this.valueKeyMultiMap.removeKey(value);

    this.source = undefined;

    return this.keyValueMultiMap.removeEntries(
      keys.stream().map((key) => [key, value])
    );
  };

  // prettier-ignore
  removeValues = <UV = V,>(values: StreamSource<RelatedTo<V, UV>>): boolean => {
    this.checkLock();

    return Stream.from(values).filterPure({ pred: this.removeValue }).count() > 0;
  };

  removeEntry = <UK = K, UV = V>(
    key: RelatedTo<K, UK>,
    value: RelatedTo<V, UV>
  ): boolean => {
    this.checkLock();

    if (!this.keyValueMultiMap.removeEntry(key, value)) return false;

    this.source = undefined;

    return this.valueKeyMultiMap.removeEntry(value, key);
  };

  removeEntries = <UK = K, UV = V>(
    entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>
  ): boolean => {
    this.checkLock();

    return Stream.applyFilter(entries, { pred: this.removeEntry }).count() > 0;
  };

  forEach = (
    f: (entry: [K, V], index: number, halt: () => void) => void,
    options: { state?: TraverseState } = {}
  ): void => {
    const { state = TraverseState() } = options;

    this._lock++;

    this.keyValueMultiMap.forEach(f, { state });

    this._lock--;
  };

  build = (): WithKeyValue<Tp, K, V>['normal'] => {
    if (undefined !== this.source) return this.source;

    if (this.isEmpty) {
      return this.context.empty() as WithKeyValue<Tp, K, V>['normal'];
    }

    const keyValueMultiMap = this.keyValueMultiMap.build().assumeNonEmpty();
    const valueKeyMultiMap = this.valueKeyMultiMap.build().assumeNonEmpty();

    return this.context.createNonEmpty(
      keyValueMultiMap,
      valueKeyMultiMap
    ) as WithKeyValue<Tp, K, V>['normal'];
  };
}
