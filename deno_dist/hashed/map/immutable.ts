import { Arr, Entry, RimbuError, Token } from '../../base/mod.ts';
import { CustomBase } from '../../collection-types/mod.ts';
import {
  ArrayNonEmpty,
  OptLazy,
  OptLazyOr,
  RelatedTo,
  ToJSON,
  TraverseState,
  Update,
} from '../../common/mod.ts';
import type { List } from '../../list/mod.ts';
import { Stream, StreamSource } from '../../stream/mod.ts';
import type { HashMapContext } from '../hashmap-custom.ts';
import type { HashMap } from '../internal.ts';

export class HashMapEmpty<K = any, V = any>
  extends CustomBase.EmptyBase
  implements HashMap<K, V>
{
  constructor(readonly context: HashMapContext<K>) {
    super();
  }

  streamKeys(): Stream<K> {
    return Stream.empty();
  }

  streamValues(): Stream<V> {
    return Stream.empty();
  }

  get<_, O>(key: K, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  hasKey(): false {
    return false;
  }

  set(key: K, value: V): HashMap.NonEmpty<K, V> {
    return this.context.emptyBlock<V>().set(key, value);
  }

  addEntry(entry: readonly [K, V]): HashMap.NonEmpty<K, V> {
    return this.context.emptyBlock().addEntry(entry);
  }

  addEntries(entries: StreamSource<readonly [K, V]>): HashMap.NonEmpty<K, V> {
    return this.context.from(entries) as HashMap.NonEmpty<K, V>;
  }

  removeKeyAndGet(): undefined {
    return undefined;
  }

  removeKey(): HashMap<K, V> {
    return this;
  }

  removeKeys(): HashMap<K, V> {
    return this;
  }

  modifyAt(
    atKey: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
    }
  ): HashMap<K, V> {
    if (undefined !== options.ifNew) {
      const value = OptLazyOr(options.ifNew, Token);

      if (Token === value) return this;

      return this.set(atKey, value);
    }
    return this;
  }

  mapValues<V2>(): HashMap<K, V2> {
    return this as any;
  }

  updateAt(): HashMap<K, V> {
    return this;
  }

  toBuilder(): HashMap.Builder<K, V> {
    return this.context.builder();
  }

  toString(): string {
    return `HashMap()`;
  }

  toJSON(): ToJSON<(readonly [K, V])[]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }

  extendValues(): any {
    return this;
  }

  mergeAll<O>(fillValue: O, ...sources: any): any {
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
    ...sources: any
  ): any {
    return this.context.mergeAllWith(
      fillValue,
      mergeFun as any,
      this,
      ...(sources as any as [any, ...any[]])
    );
  }

  merge(...sources: any): any {
    return this.context.merge(this, ...(sources as any as any[]));
  }

  mergeWith<R, K, I extends readonly [unknown, ...unknown[]]>(
    mergeFun: (key: K, ...values: I) => R,
    ...sources: any
  ): any {
    return this.context.mergeWith(
      mergeFun as any,
      this as any,
      ...(sources as any as [any, ...any[]])
    );
  }
}

export abstract class HashMapNonEmptyBase<K, V>
  extends CustomBase.NonEmptyBase<readonly [K, V]>
  implements HashMap.NonEmpty<K, V>
{
  abstract get context(): HashMapContext<K>;
  abstract get size(): number;
  abstract get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O;
  abstract addEntry(
    entry: readonly [K, V],
    hash?: number
  ): HashMap.NonEmpty<K, V>;
  abstract forEach(
    f: (entry: readonly [K, V], index: number, halt: () => void) => void,
    traverseState?: TraverseState
  ): void;
  abstract modifyAt(
    atKey: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentEntry: V, remove: Token) => V | Token;
    }
  ): HashMap<K, V> | any;
  abstract mapValues<V2>(
    mapFun: (value: V, key: K) => V2
  ): HashMap.NonEmpty<K, V2>;
  abstract toArray(): ArrayNonEmpty<readonly [K, V]>;

  asNormal(): this {
    return this;
  }

  streamKeys(): Stream.NonEmpty<K> {
    return this.stream().map(Entry.first);
  }

  streamValues(): Stream.NonEmpty<V> {
    return this.stream().map(Entry.second);
  }

  hasKey<U>(key: RelatedTo<K, U>): boolean {
    const token = Symbol();
    return token !== this.get(key, token);
  }

  set(key: K, value: V): HashMap.NonEmpty<K, V> {
    return this.addEntry([key, value]);
  }

  addEntries(entries: StreamSource<readonly [K, V]>): HashMap.NonEmpty<K, V> {
    if (StreamSource.isEmptyInstance(entries)) return this;

    const builder = this.toBuilder();
    builder.addEntries(entries);
    return builder.build().assumeNonEmpty();
  }

  removeKeys<UK>(keys: StreamSource<RelatedTo<K, UK>>): HashMap<K, V> {
    if (StreamSource.isEmptyInstance(keys)) return this;

    const builder = this.toBuilder();
    builder.removeKeys(keys);
    return builder.build();
  }

  updateAt<UK>(
    key: RelatedTo<K, UK>,
    update: Update<V>
  ): HashMap.NonEmpty<K, V> {
    if (!this.context.isValidKey(key)) return this;
    return this.modifyAt(key, {
      ifExists: (value): V => Update(value, update),
    });
  }

  removeKey<UK>(key: RelatedTo<K, UK>): HashMap<K, V> {
    if (!this.context.hasher.isValid(key)) return this;
    return this.modifyAt(key, {
      ifExists: (_, remove): typeof remove => remove,
    });
  }

  removeKeyAndGet<UK>(key: RelatedTo<K, UK>): [HashMap<K, V>, V] | undefined {
    if (!this.context.hasher.isValid(key)) return undefined;

    const token = Symbol();
    let currentValue: V | typeof token = token;

    const newMap = this.modifyAt(key, {
      ifExists: (value, remove): V | typeof remove => {
        currentValue = value;
        return remove;
      },
    });

    if (token === currentValue) return undefined;

    return [newMap, currentValue];
  }

  filter(
    pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean
  ): HashMap<K, V> {
    const builder = this.context.builder<K, V>();

    builder.addEntries(this.stream().filter(pred));

    if (builder.size === this.size) return this;

    return builder.build();
  }

  toBuilder(): HashMap.Builder<K, V> {
    return this.context.createBuilder(this);
  }

  toString(): string {
    return this.stream().join({
      start: 'HashMap(',
      sep: ', ',
      end: ')',
      valueToString: (entry) => `${entry[0]} -> ${entry[1]}`,
    });
  }

  toJSON(): ToJSON<(readonly [K, V])[]> {
    return {
      dataType: this.context.typeTag,
      value: this.toArray(),
    };
  }

  extendValues(): any {
    return this;
  }

  mergeAll<O>(fillValue: O, ...sources: any): any {
    return this.context.mergeAll(
      fillValue,
      this,
      ...(sources as any as [any, ...any[]])
    );
  }

  mergeAllWith<R, O>(
    fillValue: O,
    mergeFun: (key: K, value: V | O, ...values: any) => R,
    ...sources: any
  ): any {
    return this.context.mergeAllWith(
      fillValue,
      mergeFun as any,
      this,
      ...(sources as any as [any, ...any[]])
    );
  }

  merge(...sources: any): any {
    return this.context.merge(this, ...(sources as any as any[]));
  }

  mergeWith<R, K, I extends readonly [unknown, ...unknown[]]>(
    mergeFun: (key: K, ...values: I) => R,
    ...sources: any
  ): any {
    return this.context.mergeWith(
      mergeFun as any,
      this as any,
      ...(sources as any as [any, ...any[]])
    );
  }
}

export type MapEntrySet<K, V> = HashMapBlock<K, V> | HashMapCollision<K, V>;

export class HashMapBlock<K, V> extends HashMapNonEmptyBase<K, V> {
  constructor(
    readonly context: HashMapContext<K>,
    readonly entries: readonly (readonly [K, V])[] | null,
    readonly entrySets: readonly MapEntrySet<K, V>[] | null,
    readonly size: number,
    readonly level: number
  ) {
    super();
  }

  copy(
    entries = this.entries,
    entrySets = this.entrySets,
    size = this.size
  ): HashMapBlock<K, V> {
    if (
      entries === this.entries &&
      entrySets === this.entrySets &&
      size === this.size
    ) {
      return this;
    }
    return new HashMapBlock(this.context, entries, entrySets, size, this.level);
  }

  stream(): Stream.NonEmpty<readonly [K, V]> {
    if (null !== this.entries) {
      if (null === this.entrySets)
        return Stream.fromObjectValues(this.entries) as Stream.NonEmpty<[K, V]>;

      return Stream.fromObjectValues(this.entries).concat(
        Stream.fromObjectValues(this.entrySets).flatMap(
          (entrySet): Stream.NonEmpty<readonly [K, V]> => entrySet.stream()
        )
      ) as Stream.NonEmpty<readonly [K, V]>;
    }

    if (null === this.entrySets) RimbuError.throwInvalidStateError();

    return Stream.fromObjectValues(this.entrySets).flatMap(
      (entrySet): Stream.NonEmpty<readonly [K, V]> => entrySet.stream()
    ) as Stream.NonEmpty<readonly [K, V]>;
  }

  get<UK, O>(
    key: RelatedTo<K, UK>,
    otherwise?: OptLazy<O>,
    hash?: number
  ): V | O {
    if (!this.context.hasher.isValid(key)) return OptLazy(otherwise) as O;
    const keyHash = hash ?? this.context.hash(key);

    const atKeyIndex = this.context.getKeyIndex(this.level, keyHash);

    if (null !== this.entries && atKeyIndex in this.entries) {
      const entry = this.entries[atKeyIndex];
      if (this.context.eq(entry[0], key)) return entry[1];
      return OptLazy(otherwise) as O;
    }

    if (null !== this.entrySets && atKeyIndex in this.entrySets) {
      const entrySet = this.entrySets[atKeyIndex];
      return entrySet.get(key, otherwise, keyHash);
    }

    return OptLazy(otherwise) as O;
  }

  addEntry(
    entry: readonly [K, V],
    hash = this.context.hash(entry[0])
  ): HashMap<K, V> | any {
    const atKeyIndex = this.context.getKeyIndex(this.level, hash);

    if (null !== this.entries && atKeyIndex in this.entries) {
      const currentEntry = this.entries[atKeyIndex];

      if (this.context.eq(entry[0], currentEntry[0])) {
        if (Object.is(entry[1], currentEntry[1])) return this;

        const newEntries = Arr.copySparse(this.entries);
        newEntries[atKeyIndex] = entry;
        return this.copy(newEntries);
      }

      let newEntries: (readonly [K, V])[] | null = Arr.copySparse(this.entries);
      delete newEntries[atKeyIndex];

      let isEmpty = true;
      for (const _ in newEntries) {
        isEmpty = false;
        break;
      }
      if (isEmpty) newEntries = null;

      if (this.level < this.context.maxDepth) {
        const newEntrySet = this.context
          .block(null, null, 0, this.level + 1)
          .addEntry(currentEntry)
          .addEntry(entry, hash);

        const newEntrySets =
          null === this.entrySets ? [] : Arr.copySparse(this.entrySets);
        newEntrySets[atKeyIndex] = newEntrySet as MapEntrySet<K, V>;

        return this.copy(newEntries, newEntrySets, this.size + 1);
      }

      const newEntrySet = this.context.collision(
        this.context.listContext.of(currentEntry, entry)
      );
      const newEntrySets =
        null === this.entrySets ? [] : Arr.copySparse(this.entrySets);
      newEntrySets[atKeyIndex] = newEntrySet;

      return this.copy(newEntries, newEntrySets, this.size + 1);
    }

    if (null !== this.entrySets && atKeyIndex in this.entrySets) {
      const currentEntrySet = this.entrySets[atKeyIndex];
      const newEntrySet = currentEntrySet.addEntry(entry, hash) as MapEntrySet<
        K,
        V
      >;
      if (newEntrySet === currentEntrySet) return this;

      const newEntrySets = Arr.copySparse(this.entrySets);
      newEntrySets[atKeyIndex] = newEntrySet;

      return this.copy(
        undefined,
        newEntrySets,
        this.size + newEntrySet.size - currentEntrySet.size
      );
    }

    const newEntries =
      null === this.entries ? [] : Arr.copySparse(this.entries);
    newEntries[atKeyIndex] = entry;

    return this.copy(newEntries, undefined, this.size + 1);
  }

  modifyAt(
    atKey: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentEntry: V, remove: Token) => V | Token;
    },
    atKeyHash = this.context.hash(atKey)
  ): HashMap<K, V> {
    const atKeyIndex = this.context.getKeyIndex(this.level, atKeyHash);

    if (null !== this.entries && atKeyIndex in this.entries) {
      const currentEntry = this.entries[atKeyIndex];

      if (this.context.eq(atKey, currentEntry[0])) {
        // exact key match
        if (undefined === options.ifExists) return this;

        const currentValue = currentEntry[1];
        const newValue = options.ifExists(currentValue, Token);

        if (Object.is(newValue, currentValue)) return this;

        const newEntries = Arr.copySparse(this.entries);

        if (Token === newValue) {
          delete newEntries[atKeyIndex];

          for (const _ in newEntries) {
            return this.copy(newEntries, undefined, this.size - 1);
          }

          if (this.size === 1) return this.context.empty();

          return this.copy(null, undefined, this.size - 1);
        }

        newEntries[atKeyIndex] = [atKey, newValue];
        return this.copy(newEntries);
      }

      // no exact match, but key collision
      if (undefined === options.ifNew) return this;

      const newValue = OptLazyOr(options.ifNew, Token);

      if (Token === newValue) return this;

      let newEntries: (readonly [K, V])[] | null = Arr.copySparse(this.entries);
      delete newEntries[atKeyIndex];

      let isEmpty = true;
      for (const _ in newEntries) {
        isEmpty = false;
        break;
      }
      if (isEmpty) newEntries = null;

      if (this.level < this.context.maxDepth) {
        // create next level block
        const newEntrySet = this.context
          .block(null, null, 0, this.level + 1)
          .addEntry(currentEntry)
          .set(atKey, newValue) as MapEntrySet<K, V>;

        const newEntrySets =
          null === this.entrySets ? [] : Arr.copySparse(this.entrySets);
        newEntrySets[atKeyIndex] = newEntrySet;

        return this.copy(newEntries, newEntrySets, this.size + 1);
      }

      // create collision
      const newEntry: [K, V] = [atKey, newValue];
      const newEntrySet = this.context.collision(
        this.context.listContext.of(currentEntry, newEntry)
      );
      const newEntrySets =
        null === this.entrySets ? [] : Arr.copySparse(this.entrySets);
      newEntrySets[atKeyIndex] = newEntrySet;

      return this.copy(newEntries, newEntrySets, this.size + 1);
    }

    if (null !== this.entrySets && atKeyIndex in this.entrySets) {
      // key is in entrySet
      const currentEntrySet = this.entrySets[atKeyIndex];
      const newEntrySet = currentEntrySet.modifyAt(atKey, options, atKeyHash);

      if (newEntrySet === currentEntrySet) return this;

      if (newEntrySet.size === 1) {
        let firstEntry: readonly [K, V] = undefined as any;

        if (this.context.isHashMapBlock<K, V>(newEntrySet)) {
          for (const key in newEntrySet.entries!) {
            firstEntry = newEntrySet.entries![key];
            break;
          }
        } else {
          firstEntry = newEntrySet.entries.first();
        }

        const newEntries =
          null === this.entries ? [] : Arr.copySparse(this.entries);
        newEntries[atKeyIndex] = firstEntry;

        const newEntrySets = Arr.copySparse(this.entrySets);
        delete newEntrySets[atKeyIndex];

        return this.copy(newEntries, newEntrySets, this.size - 1);
      }

      const newEntrySets = Arr.copySparse(this.entrySets);
      newEntrySets[atKeyIndex] = newEntrySet;

      return this.copy(
        undefined,
        newEntrySets,
        this.size + newEntrySet.size - currentEntrySet.size
      );
    }

    if (undefined === options.ifNew) return this;

    const newValue = OptLazyOr(options.ifNew, Token);

    if (Token === newValue) return this;

    const newEntry: [K, V] = [atKey, newValue];

    const newEntries =
      null === this.entries ? [] : Arr.copySparse(this.entries);
    newEntries[atKeyIndex] = newEntry;

    return this.copy(newEntries, undefined, this.size + 1);
  }

  forEach(
    f: (entry: readonly [K, V], index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    if (state.halted) return;

    const { halt } = state;

    if (null !== this.entries) {
      for (const key in this.entries) {
        f(this.entries[key], state.nextIndex(), halt);
        if (state.halted) return;
      }
    }
    if (null !== this.entrySets) {
      for (const key in this.entrySets) {
        this.entrySets[key].forEach(f, state);
        if (state.halted) return;
      }
    }
  }

  mapValues<V2>(mapFun: (value: V, key: K) => V2): HashMap.NonEmpty<K, V2> {
    const newEntries =
      null === this.entries
        ? null
        : Arr.mapSparse(this.entries, (e): [K, V2] => [
            e[0],
            mapFun(e[1], e[0]),
          ]);
    const newEntrySets =
      null === this.entrySets
        ? null
        : Arr.mapSparse(
            this.entrySets,
            (es: MapEntrySet<K, V>): MapEntrySet<K, V2> =>
              es.mapValues(mapFun) as MapEntrySet<K, V2>
          );

    return new HashMapBlock<K, V2>(
      this.context as any,
      newEntries,
      newEntrySets,
      this.size,
      this.level
    );
  }

  toArray(): ArrayNonEmpty<[K, V]> {
    let result: (readonly [K, V])[] = [];

    if (null !== this.entries) {
      result = Stream.fromObjectValues(this.entries).toArray();
    }
    if (null !== this.entrySets) {
      Stream.fromObjectValues(this.entrySets).forEach((entrySet): void => {
        result = result.concat(entrySet.toArray());
      });
    }

    return result as ArrayNonEmpty<[K, V]>;
  }
}

export class HashMapCollision<K, V> extends HashMapNonEmptyBase<K, V> {
  constructor(
    readonly context: HashMapContext<K>,
    readonly entries: List.NonEmpty<readonly [K, V]>
  ) {
    super();
  }

  get size(): number {
    return this.entries.length;
  }

  copy(entries = this.entries): HashMapCollision<K, V> {
    if (entries === this.entries) return this;
    return new HashMapCollision(this.context, entries);
  }

  stream(): Stream.NonEmpty<readonly [K, V]> {
    return this.entries.stream();
  }

  get<U, O>(
    key: RelatedTo<K, U>,
    otherwise?: OptLazy<O>,
    keyHash?: number
  ): V | O {
    if (!this.context.hasher.isValid(key)) return OptLazy(otherwise) as O;

    const token = Symbol();
    const stream = this.stream();
    const foundEntry = stream.find(
      (entry): boolean => entry[0] === key,
      undefined,
      token
    );

    if (token === foundEntry) return OptLazy(otherwise) as O;

    return foundEntry[1];
  }

  addEntry(entry: readonly [K, V], hash?: number): HashMapCollision<K, V> {
    const currentIndex = this.stream().indexWhere(
      (currentEntry): boolean => currentEntry[0] === entry[0]
    );

    if (undefined === currentIndex) {
      return this.copy(this.entries.append(entry));
    }

    return this.copy(
      this.entries.updateAt(currentIndex, (currentEntry): readonly [K, V] => {
        if (currentEntry[1] === entry[1]) return currentEntry;
        return entry;
      })
    );
  }

  modifyAt(
    atKey: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentValue: V, remove: Token) => V | Token;
    },
    atKeyHash?: number
  ): HashMap<K, V> | any {
    const currentIndex = this.stream().indexWhere(
      (entry): boolean => entry[0] === atKey
    );

    if (undefined === currentIndex) {
      if (undefined === options.ifNew) return this;

      const newValue = OptLazyOr(options.ifNew, Token);

      if (Token === newValue) return this;

      const newEntries = this.entries.append([atKey, newValue]);
      return this.copy(newEntries);
    }

    if (undefined === options.ifExists) return this;

    const currentEntry = this.entries.get(
      currentIndex,
      RimbuError.throwInvalidStateError
    );
    const currentValue = currentEntry[1];
    const newValue = options.ifExists(currentValue, Token);

    if (Token === newValue) {
      const newEntries = this.entries.remove(currentIndex, 1).assumeNonEmpty();
      return this.copy(newEntries);
    }

    if (Object.is(newValue, currentValue)) return this;

    const newEntry: [K, V] = [atKey, newValue];
    const newEntries = this.entries.updateAt(currentIndex, newEntry);
    return this.copy(newEntries);
  }

  forEach(
    f: (entry: readonly [K, V], index: number, halt: () => void) => void,
    state: TraverseState
  ): void {
    if (state.halted) return;

    this.entries.forEach(f, state);
  }

  mapValues<V2>(mapFun: (value: V, key: K) => V2): HashMap.NonEmpty<K, V2> {
    const newEntries = this.entries.map((e): readonly [K, V2] => [
      e[0],
      mapFun(e[1], e[0]),
    ]);
    return new HashMapCollision(this.context as any, newEntries);
  }

  toArray(): ArrayNonEmpty<readonly [K, V]> {
    return this.entries.toArray();
  }
}
