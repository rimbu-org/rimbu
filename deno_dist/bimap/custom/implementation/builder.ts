import { RimbuError } from '../../../base/mod.ts';
import type { BiMap } from '../../../bimap/mod.ts';
import type { BiMapContext, BiMapNonEmptyImpl } from '../../../bimap/custom/index.ts';
import type { RMap } from '../../../collection-types/map/index.ts';
import { OptLazy, RelatedTo, TraverseState } from '../../../common/mod.ts';
import { Stream, StreamSource } from '../../../stream/mod.ts';
import { isEmptyStreamSourceInstance } from '../../../stream/custom/index.ts';

export class BiMapBuilder<K, V> implements BiMap.Builder<K, V> {
  constructor(
    readonly context: BiMapContext<K, V>,
    public source?: BiMapNonEmptyImpl<K, V>
  ) {}

  _keyValueMap?: RMap.Builder<K, V>;
  _valueKeyMap?: RMap.Builder<V, K>;

  _lock = 0;

  checkLock(): void {
    if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
  }

  get keyValueMap(): RMap.Builder<K, V> {
    if (undefined === this._keyValueMap) {
      if (undefined === this.source) {
        this._keyValueMap = this.context.keyValueContext.builder();
        this._valueKeyMap = this.context.valueKeyContext.builder();
      } else {
        this._keyValueMap = this.source.keyValueMap.toBuilder();
        this._valueKeyMap = this.source.valueKeyMap.toBuilder();
      }
    }

    return this._keyValueMap;
  }

  get valueKeyMap(): RMap.Builder<V, K> {
    if (undefined === this._valueKeyMap) {
      if (undefined === this.source) {
        this._keyValueMap = this.context.keyValueContext.builder();
        this._valueKeyMap = this.context.valueKeyContext.builder();
      } else {
        this._keyValueMap = this.source.keyValueMap.toBuilder();
        this._valueKeyMap = this.source.valueKeyMap.toBuilder();
      }
    }

    return this._valueKeyMap;
  }

  get size(): number {
    return this.source?.size ?? this.keyValueMap.size;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  getValue = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
    if (undefined !== this.source) return this.source.getValue(key, otherwise);

    return this.keyValueMap.get(key, otherwise!);
  };

  hasKey = <UK>(key: RelatedTo<K, UK>): boolean => {
    const token = Symbol();
    return token !== this.getValue(key, token);
  };

  getKey = <UV, O>(value: RelatedTo<V, UV>, otherwise?: OptLazy<O>): K | O => {
    if (undefined !== this.source) return this.source.getKey(value, otherwise);
    return this.valueKeyMap.get(value, otherwise!);
  };

  hasValue = <UV>(value: RelatedTo<V, UV>): boolean => {
    const token = Symbol();
    return token !== this.getKey(value, token);
  };

  set = (key: K, value: V): boolean => {
    return this.addEntry([key, value]);
  };

  addEntry = (entry: readonly [K, V]): boolean => {
    this.checkLock();

    const [key, value] = entry;

    const token = Symbol();

    const oldValue = this.keyValueMap.get(key, token);
    const oldKey = this.valueKeyMap.get(value, token);

    if (token !== oldKey && token !== oldValue) {
      if (Object.is(oldKey, key) && Object.is(oldValue, value)) return false;

      this.keyValueMap.removeKey(oldKey);
      this.keyValueMap.addEntry(entry);

      this.valueKeyMap.removeKey(oldValue);
      this.valueKeyMap.set(value, key);
    } else if (token !== oldValue) {
      if (!Object.is(oldValue, value)) {
        this.valueKeyMap.removeKey(oldValue);
        this.valueKeyMap.set(value, key);
      }

      this.keyValueMap.addEntry(entry);
    } else if (token !== oldKey) {
      if (!Object.is(oldKey, key)) {
        this.keyValueMap.removeKey(oldKey);
        this.keyValueMap.addEntry(entry);
      }

      this.valueKeyMap.set(value, key);
    } else {
      this.keyValueMap.addEntry(entry);
      this.valueKeyMap.set(value, key);
    }

    this.source = undefined;
    return true;
  };

  addEntries = (source: StreamSource<readonly [K, V]>): boolean => {
    this.checkLock();

    return Stream.from(source).filterPure(this.addEntry).count() > 0;
  };

  removeKey = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
    this.checkLock();

    if (!this.context.keyValueContext.isValidKey(key)) {
      return OptLazy(otherwise) as O;
    }

    const token = Symbol();
    const value = this.keyValueMap.removeKey(key, token);

    if (token === value) return OptLazy(otherwise) as O;

    this.valueKeyMap.removeKey(value);

    this.source = undefined;

    return value;
  };

  removeKeys = <UK>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
    this.checkLock();

    if (isEmptyStreamSourceInstance(keys)) return false;

    const notFound = Symbol();

    return (
      Stream.from(keys)
        .mapPure(this.removeKey, notFound)
        .countNotElement(notFound) > 0
    );
  };

  removeValue = <UV, O>(
    value: RelatedTo<V, UV>,
    otherwise?: OptLazy<O>
  ): K | O => {
    this.checkLock();

    if (!this.context.valueKeyContext.isValidKey(value)) {
      return OptLazy(otherwise) as O;
    }

    const token = Symbol();

    const key = this.valueKeyMap.removeKey(value, token);

    if (token === key) return OptLazy(otherwise) as O;

    this.keyValueMap.removeKey(key);

    this.source = undefined;

    return key;
  };

  removeValues = <UV>(values: StreamSource<RelatedTo<V, UV>>): boolean => {
    this.checkLock();

    if (isEmptyStreamSourceInstance(values)) return false;

    const notFound = Symbol();

    return (
      Stream.from(values)
        .mapPure(this.removeValue, notFound)
        .countNotElement(notFound) > 0
    );
  };

  forEach = (
    f: (entry: readonly [K, V], index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void => {
    this._lock++;

    if (!this.isEmpty && !state.halted) {
      if (undefined !== this.source) this.source.forEach(f, state);
      else this.keyValueMap.forEach(f, state);
    }

    this._lock--;
  };

  build = (): BiMap<K, V> => {
    if (undefined !== this.source) return this.source;
    if (this.size === 0) return this.context.empty();

    return this.context.createNonEmptyImpl(
      this.keyValueMap.build().assumeNonEmpty(),
      this.valueKeyMap.build().assumeNonEmpty()
    );
  };
}
