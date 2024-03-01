import { RimbuError } from '../../../base/mod.ts';
import type { RMap, RSet } from '../../../collection-types/mod.ts';
import {
  EmptyBase,
  NonEmptyBase,
  type KeyValue,
  type WithKeyValue,
} from '../../../collection-types/map-custom/index.ts';
import {
  OptLazy,
  TraverseState,
  type ArrayNonEmpty,
  type RelatedTo,
  type ToJSON,
} from '../../../common/mod.ts';
import { Reducer, Stream, type StreamSource } from '../../../stream/mod.ts';
import { isEmptyStreamSourceInstance } from '../../../stream/custom/index.ts';

import type { MultiMap } from '../../../multimap/mod.ts';
import type { MultiMapBase } from '../../../multimap/custom/index.ts';

export interface ContextImplTypes extends MultiMapBase.Types {
  readonly context: MultiMapContext<this['_K'], this['_V'], string>;
}

export class MultiMapEmpty<K, V, Tp extends ContextImplTypes>
  extends EmptyBase
  implements MultiMapBase<K, V, Tp>
{
  constructor(readonly context: WithKeyValue<Tp, K, V>['context']) {
    super();
  }

  get keyMap(): WithKeyValue<Tp, K, V>['keyMap'] {
    return this.context.keyMapContext.empty();
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

  hasEntry(): false {
    return false;
  }

  add(key: K, value: V): WithKeyValue<Tp, K, V>['nonEmpty'] {
    const values = this.context.keyMapValuesContext.of(value);
    const keyMap = this.context.keyMapContext.of<K, RSet.NonEmpty<V>>([
      key,
      values,
    ]) as WithKeyValue<Tp, K, V>['keyMapNonEmpty'];

    return this.context.createNonEmpty(keyMap, 1);
  }

  addEntries(entries: StreamSource<readonly [K, V]>): any {
    return this.context.from(entries);
  }

  getValues(): WithKeyValue<Tp, K, V>['keyMapValues'] {
    return this.context.keyMapValuesContext.empty();
  }

  setValues(
    key: K,
    values: StreamSource<V>
  ): WithKeyValue<Tp, K, V>['nonEmpty'] {
    const valueSet: RSet<V> = this.context.keyMapValuesContext.from(values);

    if (!valueSet.nonEmpty()) return this as any;

    const keyMap = this.context.keyMapContext.of<K, RSet.NonEmpty<V>>([
      key,
      valueSet,
    ]) as WithKeyValue<Tp, K, V>['keyMapNonEmpty'];

    return this.context.createNonEmpty(keyMap, valueSet.size);
  }

  modifyAt(
    atKey: K,
    options: { ifNew?: OptLazy<StreamSource<V>> }
  ): WithKeyValue<Tp, K, V>['normal'] {
    if (undefined === options.ifNew) return this as any;

    return this.setValues(atKey, OptLazy(options.ifNew));
  }

  removeKey(): WithKeyValue<Tp, K, V>['normal'] {
    return this as any;
  }

  removeKeys(): WithKeyValue<Tp, K, V>['normal'] {
    return this as any;
  }

  removeKeyAndGet(): undefined {
    return undefined;
  }

  removeEntry(): WithKeyValue<Tp, K, V>['normal'] {
    return this as any;
  }

  removeEntries(): WithKeyValue<Tp, K, V>['normal'] {
    return this as any;
  }

  toBuilder(): WithKeyValue<Tp, K, V>['builder'] {
    return this.context.builder();
  }

  toString(): string {
    return `${this.context.typeTag}()`;
  }

  toJSON(): ToJSON<[K, V[]][]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }
}

export class MultiMapNonEmpty<
    K,
    V,
    Tp extends ContextImplTypes,
    TpG extends WithKeyValue<Tp, K, V> = WithKeyValue<Tp, K, V>
  >
  extends NonEmptyBase<[K, V]>
  implements MultiMapBase.NonEmpty<K, V, Tp>
{
  constructor(
    readonly context: TpG['context'],
    readonly keyMap: TpG['keyMapNonEmpty'],
    readonly size: number
  ) {
    super();
  }

  assumeNonEmpty(): any {
    return this;
  }

  asNormal(): any {
    return this;
  }

  copy(keyMap: TpG['keyMapNonEmpty'], size: number): TpG['nonEmpty'] {
    if (keyMap === this.keyMap) return this as any;
    return this.context.createNonEmpty<K, V>(keyMap as any, size);
  }

  copyE(keyMap: TpG['keyMap'], size: number): TpG['normal'] {
    if (keyMap.nonEmpty()) {
      return this.copy(keyMap.assumeNonEmpty(), size) as TpG['normal'];
    }

    return this.context.empty();
  }

  stream(): Stream.NonEmpty<[K, V]> {
    return this.keyMap
      .stream()
      .flatMap(
        ([key, values]): Stream.NonEmpty<[K, V]> =>
          values.stream().map((v): [K, V] => [key, v])
      );
  }

  streamKeys(): Stream.NonEmpty<K> {
    return this.keyMap.streamKeys();
  }

  streamValues(): Stream.NonEmpty<V> {
    return this.keyMap
      .streamValues()
      .flatMap((values): Stream.NonEmpty<V> => values.stream());
  }

  get keySize(): number {
    return this.keyMap.size;
  }

  hasKey<U>(key: RelatedTo<K, U>): boolean {
    return this.keyMap.hasKey<U>(key);
  }

  hasEntry<U>(key: RelatedTo<K, U>, value: V): boolean {
    const values = this.keyMap.get(key);

    return values?.has(value) ?? false;
  }

  getValues<U>(key: RelatedTo<K, U>): TpG['keyMapValues'] {
    return this.keyMap.get(key, this.context.keyMapValuesContext.empty());
  }

  add(key: K, value: V): TpG['nonEmpty'] {
    let newSize = this.size;

    const newKeyMap = this.keyMap
      .modifyAt(key, {
        ifNew: () => {
          newSize++;
          return this.context.keyMapValuesContext.of(value);
        },
        ifExists: (values) => {
          const newValues = values.add(value);

          if (newValues === values) return values;

          newSize -= values.size;
          newSize += newValues.size;

          return newValues;
        },
      })
      .assumeNonEmpty();

    return this.copy(newKeyMap, newSize);
  }

  addEntries(entries: StreamSource<readonly [K, V]>): TpG['nonEmpty'] {
    if (isEmptyStreamSourceInstance(entries)) return this as any;

    const builder = this.toBuilder();
    builder.addEntries(entries);
    return builder.build().assumeNonEmpty();
  }

  setValues(key: K, values: any): any {
    return this.modifyAt(key, { ifNew: values, ifExists: () => values });
  }

  removeKey<UK>(key: RelatedTo<K, UK>): TpG['normal'] {
    if (!this.context.keyMapContext.isValidKey(key)) return this as any;
    return this.modifyAt(key, { ifExists: () => [] });
  }

  removeKeys<UK>(keys: StreamSource<RelatedTo<K, UK>>): TpG['normal'] {
    if (isEmptyStreamSourceInstance(keys)) return this as any;

    const builder = this.toBuilder();
    builder.removeKeys(keys);
    return builder.build();
  }

  removeKeyAndGet<UK>(
    key: RelatedTo<K, UK>
  ): [TpG['normal'], TpG['keyMapValuesNonEmpty']] | undefined {
    if (!this.context.keyMapContext.isValidKey(key)) return undefined;

    let removed: TpG['keyMapValuesNonEmpty'] | undefined = undefined;

    const result = this.modifyAt(key, {
      ifExists: (values) => {
        removed = values;
        return [];
      },
    });

    if (undefined === removed) return undefined;

    return [result, removed];
  }

  removeEntry<UK, UV>(
    key: RelatedTo<K, UK>,
    value: RelatedTo<V, UV>
  ): TpG['normal'] {
    if (!this.context.keyMapContext.isValidKey(key)) return this as any;

    return this.modifyAt(key, {
      ifExists: (values: TpG['keyMapValuesNonEmpty']) => values.remove(value),
    });
  }

  removeEntries<UK, UV>(
    entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>
  ): TpG['normal'] {
    if (isEmptyStreamSourceInstance(entries)) return this as any;

    const builder = this.toBuilder();
    builder.removeEntries(entries);
    return builder.build();
  }

  filter(
    pred: (entry: [K, V], index: number, halt: () => void) => boolean,
    options: { negate?: boolean } = {}
  ): TpG['normal'] {
    const builder = this.context.builder();

    builder.addEntries(this.stream().filter(pred, options));

    if (builder.size === this.size) return this as any;
    return builder.build();
  }

  forEach(
    f: (entry: [K, V], index: number, halt: () => void) => void,
    options: { state?: TraverseState } = {}
  ): void {
    const { state = TraverseState() } = options;

    if (state.halted) return;

    this.stream().forEach(f, { state });
  }

  modifyAt(
    atKey: K,
    options: {
      ifNew?: OptLazy<StreamSource<V>>;
      ifExists?:
        | ((currentValues: TpG['keyMapValuesNonEmpty']) => StreamSource<V>)
        | StreamSource<V>;
    }
  ): TpG['normal'] {
    let newSize = this.size;

    const { ifNew, ifExists } = options;

    const newKeyMap = this.keyMap.modifyAt(atKey, {
      ifNew: (none) => {
        if (undefined === ifNew) return none;

        const newValueStream = OptLazy(ifNew);
        const newValues = this.context.keyMapValuesContext.from(newValueStream);

        if (!newValues.nonEmpty()) return none;

        newSize += newValues.size;

        return newValues;
      },
      ifExists: (currentValues, remove) => {
        if (undefined === ifExists) return currentValues;

        const newValueStream =
          ifExists instanceof Function ? ifExists(currentValues) : ifExists;
        const newValues = this.context.keyMapValuesContext.from(newValueStream);

        if (!newValues.nonEmpty()) {
          newSize -= currentValues.size;
          return remove;
        }

        newSize -= currentValues.size;
        newSize += newValues.size;

        return newValues;
      },
    });

    return this.copyE(newKeyMap, newSize);
  }

  toArray(): ArrayNonEmpty<[K, V]> {
    return this.stream().toArray();
  }

  toString(): string {
    return this.keyMap.stream().join({
      start: `${this.context.typeTag}(`,
      sep: ', ',
      end: ')',
      valueToString: ([key, values]) =>
        `${key} -> ${values
          .stream()
          .join({ start: '[', sep: ', ', end: ']' })}`,
    });
  }

  toJSON(): ToJSON<[K, V[]][]> {
    return {
      dataType: this.context.typeTag,
      value: this.keyMap
        .stream()
        .map((entry) => [entry[0], entry[1].toArray()] as [K, V[]])
        .toArray(),
    };
  }

  toBuilder(): TpG['builder'] {
    return this.context.createBuilder(this as any);
  }
}

export class MultiMapBuilder<
  K,
  V,
  Tp extends ContextImplTypes,
  TpG extends WithKeyValue<Tp, K, V> = WithKeyValue<Tp, K, V>
> implements MultiMapBase.Builder<K, V, Tp>
{
  _lock = 0;
  _size = 0;

  constructor(
    readonly context: TpG['context'],
    public source?: MultiMap.NonEmpty<K, V>
  ) {
    if (undefined !== source) this._size = source.size;
  }

  _keyMap?: RMap.Builder<K, RSet.Builder<V>>;

  get keyMap(): RMap.Builder<K, RSet.Builder<V>> {
    if (undefined === this._keyMap) {
      if (undefined === this.source) {
        this._keyMap = this.context.keyMapContext.builder();
      } else {
        this._keyMap = this.source.keyMap
          .mapValues((v) => v.toBuilder())
          .toBuilder();
      }
    }

    return this._keyMap;
  }

  checkLock(): void {
    if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  // prettier-ignore
  getValues = <UK,>(key: RelatedTo<K, UK>): any => {
    return (
      this.source?.getValues(key) ??
      this.keyMap.get(key)?.build() ??
      this.context.keyMapValuesContext.empty()
    );
  };

  // prettier-ignore
  hasKey = <UK,>(key: RelatedTo<K, UK>): boolean => {
    return this.source?.hasKey(key) ?? this.keyMap.hasKey(key);
  };

  // prettier-ignore
  hasEntry = <UK,>(key: RelatedTo<K, UK>, value: V): boolean => {
    return (
      this.source?.hasEntry(key, value) ??
      this.keyMap.get(key)?.has(value) ??
      false
    );
  };

  add = (key: K, value: V): boolean => {
    this.checkLock();

    let changed = true;

    this.keyMap.modifyAt(key, {
      ifNew: () => {
        this._size++;
        const valueBuilder = this.context.keyMapValuesContext.builder();
        valueBuilder.add(value);
        return valueBuilder;
      },
      ifExists: (valueBuilder) => {
        this._size -= valueBuilder.size;

        changed = valueBuilder.add(value);

        this._size += valueBuilder.size;
        return valueBuilder;
      },
    });

    if (changed) this.source = undefined;

    return changed;
  };

  addEntries = (source: StreamSource<readonly [K, V]>): boolean => {
    this.checkLock();

    return Stream.applyFilter(source, { pred: this.add }).count() > 0;
  };

  setValues = (key: K, source: StreamSource<V>): boolean => {
    this.checkLock();

    const values = this.context.keyMapValuesContext.from(source).toBuilder();
    const size = values.size;

    if (size <= 0) return this.removeKey(key);

    return this.keyMap.modifyAt(key, {
      ifNew: () => {
        this._size += size;

        this.source = undefined;

        return values;
      },
      ifExists: (oldValues) => {
        this._size -= oldValues.size;
        this._size += size;

        this.source = undefined;

        return values;
      },
    });
  };

  removeEntry = <UK, UV>(
    key: RelatedTo<K, UK>,
    value: RelatedTo<V, UV>
  ): boolean => {
    this.checkLock();

    if (!this.context.keyMapContext.isValidKey(key)) return false;

    let changed = false;

    this.keyMap.modifyAt(key, {
      ifExists: (valueBuilder, remove) => {
        if (valueBuilder.remove(value)) {
          this._size--;
          changed = true;
        }

        if (valueBuilder.size <= 0) return remove;
        return valueBuilder;
      },
    });

    if (changed) this.source = undefined;

    return changed;
  };

  removeEntries = <UK, UV>(
    entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>
  ): boolean => {
    this.checkLock();

    return Stream.applyFilter(entries, { pred: this.removeEntry }).count() > 0;
  };

  // prettier-ignore
  removeKey = <UK,>(key: RelatedTo<K, UK>): boolean => {
    this.checkLock();

    if (!this.context.keyMapContext.isValidKey(key)) return false;

    const changed = this.keyMap.modifyAt(key, {
      ifExists: (valueBuilder, remove) => {
        this._size -= valueBuilder.size;
        return remove;
      },
    });

    if (changed) this.source = undefined;

    return changed;
  };

  // prettier-ignore
  removeKeys = <UK,>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
    this.checkLock();

    return Stream.from(keys).filterPure({ pred: this.removeKey }).count() > 0;
  };

  forEach = (
    f: (entry: [K, V], index: number, halt: () => void) => void,
    options: { reversed?: boolean; state?: TraverseState } = {}
  ): void => {
    const { reversed = false, state = TraverseState() } = options;

    if (state.halted) return;

    this._lock++;

    this.keyMap.forEach(
      ([key, values], _, outerHalt): void => {
        values.forEach(
          (value, index, halt): void => f([key, value], index, halt),
          { reversed, state } as any
        );
        if (state.halted) outerHalt();
      },
      { reversed } as any
    );

    this._lock--;
  };

  build = (): TpG['normal'] => {
    if (undefined !== this.source) return this.source;

    if (this.isEmpty) return this.context.empty();

    return this.context.createNonEmpty(
      this.keyMap
        .buildMapValues((values) => values.build().assumeNonEmpty())
        .assumeNonEmpty(),
      this.size
    ) as TpG['normal'];
  };
}

export class MultiMapContext<
  UK,
  UV,
  N extends string,
  Tp extends ContextImplTypes = ContextImplTypes
> implements MultiMapBase.Context<UK, UV, Tp>
{
  constructor(
    readonly typeTag: N,
    readonly keyMapContext: (Tp & KeyValue<UK, UV>)['keyMapContext'],
    readonly keyMapValuesContext: (Tp & KeyValue<UK, UV>)['keyMapValuesContext']
  ) {}

  readonly _empty = Object.freeze(
    new MultiMapEmpty<UK, UV, Tp>(this as any) as WithKeyValue<
      Tp,
      UK,
      UV
    >['normal']
  );

  isNonEmptyInstance<K, V>(
    source: any
  ): source is WithKeyValue<Tp, K, V>['nonEmpty'] {
    return source instanceof MultiMapNonEmpty;
  }

  createNonEmpty<K extends UK, V extends UV>(
    keyMap: WithKeyValue<Tp, K, V>['keyMapNonEmpty'],
    size: number
  ): WithKeyValue<Tp, K, V>['nonEmpty'] {
    return new MultiMapNonEmpty<K, V, Tp>(
      this as any,
      keyMap,
      size
    ) as WithKeyValue<Tp, K, V>['nonEmpty'];
  }

  readonly empty = <K extends UK, V extends UV>(): WithKeyValue<
    Tp,
    K,
    V
  >['normal'] => {
    return this._empty;
  };

  readonly from: any = <K extends UK, V extends UV>(
    ...sources: ArrayNonEmpty<StreamSource<readonly [K, V]>>
  ): WithKeyValue<Tp, K, V>['normal'] => {
    let builder = this.builder<K, V>();

    let i = -1;
    const length = sources.length;

    while (++i < length) {
      const source = sources[i];

      if (isEmptyStreamSourceInstance(source)) continue;
      if (
        builder.isEmpty &&
        this.isNonEmptyInstance<K, V>(source) &&
        source.context === this
      ) {
        if (i === length - 1) return source;
        builder = source.toBuilder();
        continue;
      }

      builder.addEntries(source);
    }

    return builder.build();
  };

  readonly of = <K extends UK, V extends UV>(
    ...entries: ArrayNonEmpty<readonly [K, V]>
  ): [K, V] extends [UK, UV] ? WithKeyValue<Tp, K, V>['nonEmpty'] : never => {
    return this.from(entries);
  };

  readonly builder = <K extends UK, V extends UV>(): WithKeyValue<
    Tp,
    K,
    V
  >['builder'] => {
    return new MultiMapBuilder<K, V, Tp>(this as any) as WithKeyValue<
      Tp,
      K,
      V
    >['builder'];
  };

  readonly reducer = <K extends UK, V extends UV>(
    source?: StreamSource<readonly [K, V]>
  ): Reducer<readonly [K, V], WithKeyValue<Tp, K, V>['normal']> => {
    return Reducer.create(
      () =>
        undefined === source
          ? this.builder<K, V>()
          : (this.from(source) as WithKeyValue<Tp, K, V>['normal']).toBuilder(),
      (builder, entry) => {
        builder.add(entry[0], entry[1]);
        return builder;
      },
      (builder) => builder.build()
    );
  };

  createBuilder<K, V>(
    source?: MultiMap.NonEmpty<K, V>
  ): WithKeyValue<Tp, K, V>['builder'] {
    return new MultiMapBuilder<K, V, Tp>(this as any, source) as WithKeyValue<
      Tp,
      K,
      V
    >['builder'];
  }
}
