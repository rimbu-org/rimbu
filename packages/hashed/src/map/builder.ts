import { Arr, RimbuError, Token } from '@rimbu/base';
import {
  OptLazy,
  OptLazyOr,
  RelatedTo,
  TraverseState,
  Update,
} from '@rimbu/common';
import { List } from '@rimbu/list';
import { Stream, StreamSource } from '@rimbu/stream';
import { BlockBuilderBase, CollisionBuilderBase } from '../hashed-custom';
import {
  HashMapBlock,
  HashMapCollision,
  HashMapContext,
  MapEntrySet,
} from '../hashmap-custom';
import { HashMap } from '../internal';

type MapBlockBuilderEntry<K, V> =
  | HashMapBlockBuilder<K, V>
  | HashMapCollisionBuilder<K, V>;

export class HashMapBlockBuilder<K, V>
  extends BlockBuilderBase<readonly [K, V]>
  implements HashMap.Builder<K, V> {
  constructor(
    readonly context: HashMapContext<K>,
    public source?: HashMapBlock<K, V>,
    public _entries?: (readonly [K, V])[],
    public _entrySets?: MapBlockBuilderEntry<K, V>[],
    public size = source?.size ?? 0,
    public level = source?.level ?? 0
  ) {
    super();
  }

  _lock = 0;

  checkLock(): void {
    if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
  }

  prepareMutate(): void {
    if (undefined === this._entries) {
      if (undefined !== this.source) {
        this._entries =
          null === this.source.entries
            ? []
            : Arr.copySparse(this.source.entries);
      } else {
        this._entries = [];
      }
    }

    if (undefined === this._entrySets) {
      if (undefined !== this.source) {
        this._entrySets =
          null === this.source.entrySets
            ? []
            : Arr.mapSparse(
                this.source.entrySets,
                (entrySet): MapBlockBuilderEntry<K, V> => {
                  if (entrySet instanceof HashMapBlock) {
                    return new HashMapBlockBuilder(this.context, entrySet);
                  }
                  return new HashMapCollisionBuilder(this.context, entrySet);
                }
              ) ?? [];
      } else {
        this._entrySets = [];
      }
    }
  }

  get entries(): (readonly [K, V])[] {
    this.prepareMutate();

    return this._entries!;
  }

  get entrySets(): MapBlockBuilderEntry<K, V>[] {
    this.prepareMutate();

    return this._entrySets!;
  }

  get = <UK, O>(
    key: RelatedTo<K, UK>,
    otherwise?: OptLazy<O>,
    hash?: number
  ): V | O => {
    if (undefined !== this.source) return this.source.get(key, otherwise);

    if (!this.context.hasher.isValid(key)) return OptLazy(otherwise) as O;

    const keyHash = hash ?? this.context.hash(key);

    const keyIndex = this.context.getKeyIndex(this.level, keyHash);

    if (keyIndex in this.entries) {
      const currentEntry = this.entries[keyIndex];

      if (this.context.eq(key, currentEntry[0])) return currentEntry[1];
      return OptLazy(otherwise) as O;
    }

    if (keyIndex in this.entrySets) {
      const currentEntrySet = this.entrySets[keyIndex];
      return currentEntrySet.get<UK, O>(key, otherwise, keyHash);
    }

    return OptLazy(otherwise) as O;
  };

  hasKey = <UK>(key: RelatedTo<K, UK>): boolean => {
    const token = Symbol();
    return token !== this.get(key, token);
  };

  addEntry = (entry: readonly [K, V]): boolean => {
    this.checkLock();

    return this.addEntryInternal(entry);
  };

  addEntries = (source: StreamSource<readonly [K, V]>): boolean => {
    this.checkLock();

    if (StreamSource.isEmptyInstance(source)) return false;

    return Stream.from(source).filter(this.addEntry).count() > 0;
  };

  addEntryInternal(
    entry: readonly [K, V],
    hash = this.context.hash(entry[0])
  ): boolean {
    const keyIndex = this.context.getKeyIndex(this.level, hash);

    if (keyIndex in this.entries) {
      const currentEntry = this.entries[keyIndex];

      if (this.context.eq(entry[0], currentEntry[0])) {
        if (Object.is(entry[1], currentEntry[1])) return false;

        this.source = undefined;

        this.entries[keyIndex] = entry;
        return true;
      }

      this.source = undefined;

      this.size++;

      delete this.entries[keyIndex];

      if (this.level < this.context.maxDepth) {
        const newEntrySet = new HashMapBlockBuilder<K, V>(
          this.context,
          undefined,
          undefined,
          undefined,
          0,
          this.level + 1
        );
        newEntrySet.addEntryInternal(currentEntry);
        newEntrySet.addEntryInternal(entry, hash);

        this.entrySets[keyIndex] = newEntrySet;
        return true;
      }

      const newEntries = List.builder<readonly [K, V]>();
      newEntries.append(currentEntry);
      newEntries.append(entry);

      const newEntrySet = new HashMapCollisionBuilder<K, V>(
        this.context,
        undefined,
        newEntries
      );
      this.entrySets[keyIndex] = newEntrySet;
      return true;
    }

    if (keyIndex in this.entrySets) {
      const currentEntrySet = this.entrySets[keyIndex];
      const preSize = currentEntrySet.size;
      const changed = currentEntrySet.addEntryInternal(entry, hash);

      if (changed) this.source = undefined;

      this.size += currentEntrySet.size - preSize;
      return changed;
    }

    this.source = undefined;

    this.size++;
    this.entries[keyIndex] = entry;
    return true;
  }

  set = (key: K, value: V): boolean => {
    this.checkLock();

    return this.addEntryInternal([key, value]);
  };

  modifyAt = (
    key: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentValue: V, remove: Token) => V | Token;
    },
    keyHash = this.context.hash(key)
  ): boolean => {
    this.checkLock();

    const keyIndex = this.context.getKeyIndex(this.level, keyHash);

    if (keyIndex in this.entries) {
      // potential match in entries

      const currentEntry = this.entries[keyIndex];
      const [currentKey, currentValue] = currentEntry;

      if (this.context.eq(key, currentKey)) {
        // exact match
        if (undefined === options.ifExists) return false;

        const newValue = options.ifExists(currentValue, Token);

        if (newValue === currentValue) {
          return false;
        }

        this.source = undefined;

        if (Token === newValue) {
          this.size--;
          delete this.entries[keyIndex];
          return true;
        }

        // replace current value
        const newEntry: [K, V] = [key, newValue];
        this.entries[keyIndex] = newEntry;
        return true;
      }

      if (undefined === options.ifNew) return false;

      // no match, replace entry with entryset containing both entries
      const newValue = OptLazyOr(options.ifNew, Token);

      if (Token === newValue) return false;

      this.source = undefined;

      this.size++;

      delete this.entries[keyIndex];

      const newEntrySet: MapBlockBuilderEntry<K, V> =
        this.level < this.context.maxDepth
          ? new HashMapBlockBuilder(
              this.context,
              undefined,
              undefined,
              undefined,
              0,
              this.level + 1
            )
          : new HashMapCollisionBuilder(this.context);

      newEntrySet.addEntryInternal(currentEntry);
      newEntrySet.addEntryInternal([key, newValue], keyHash);

      this.entrySets[keyIndex] = newEntrySet;
      return true;
    }

    if (keyIndex in this.entrySets) {
      // potential match in entrysets
      const entrySet = this.entrySets[keyIndex];
      const preSize = entrySet.size;
      const result = entrySet.modifyAt(key, options, keyHash);

      if (result) this.source = undefined;

      this.size += entrySet.size - preSize;

      if (entrySet.size > 1) return result;

      // single entry needs to be pulled up

      let first: readonly [K, V] = undefined as any;
      if (entrySet instanceof HashMapBlockBuilder) {
        for (const index in entrySet.entries) {
          first = entrySet.entries[index];
          break;
        }
      } else {
        first = entrySet.entries.get(0, RimbuError.throwInvalidStateError);
      }

      delete this.entrySets[keyIndex];
      this.entries[keyIndex] = first;
      return true;
    }

    if (undefined === options.ifNew) return false;

    // no matching entry or entrySet
    const newValue = OptLazyOr(options.ifNew, Token);

    if (Token === newValue) return false;

    this.source = undefined;

    this.size++;

    this.entries[keyIndex] = [key, newValue];
    return true;
  };

  updateAt = <O>(key: K, update: Update<V>, otherwise?: OptLazy<O>): V | O => {
    let result: V;
    let found = false;

    this.modifyAt(key, {
      ifExists: (value): V => {
        result = value;
        found = true;
        return Update(value, update);
      },
    });

    if (!found) return OptLazy(otherwise) as O;

    return result!;
  };

  removeKey = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
    this.checkLock();

    if (!this.context.hasher.isValid(key)) return OptLazy(otherwise) as O;

    let removedValue: V;
    let found = false;

    this.modifyAt(key, {
      ifExists: (currentValue, remove): typeof remove => {
        removedValue = currentValue;
        found = true;
        return remove;
      },
    });

    if (!found) return OptLazy(otherwise) as O;

    return removedValue!;
  };

  removeKeys = <UK>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
    this.checkLock();

    if (StreamSource.isEmptyInstance(keys)) return false;

    const notFound = Symbol();

    return (
      Stream.from(keys)
        .mapPure(this.removeKey, notFound)
        .countNotElement(notFound) > 0
    );
  };

  forEach = (
    f: (entry: readonly [K, V], index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void => {
    this._lock++;

    super.forEach(f, state);

    this._lock--;
  };

  build = (): HashMap<K, V> => {
    if (this.size === 0) return this.context.empty();

    return this.buildNE() as HashMap<K, V>;
  };

  buildNE(): HashMapBlock<K, V> {
    if (undefined !== this.source) return this.source;

    const entries =
      this.entries.length === 0 ? null : Arr.copySparse(this.entries);
    const entrySets =
      this.entrySets.length === 0
        ? null
        : Arr.mapSparse(this.entrySets, (entrySet) => entrySet.buildNE());

    return this.context.block(entries, entrySets, this.size, this.level);
  }

  buildMapValues = <V2>(f: (value: V, key: K) => V2): HashMap<K, V2> => {
    if (this.size === 0) {
      return (this.context.empty() as unknown) as HashMap<K, V2>;
    }
    if (undefined !== this.source) return this.source.mapValues(f);

    const entries =
      this.entries.length === 0
        ? null
        : Arr.mapSparse(this.entries, (e): readonly [K, V2] => [
            e[0],
            f(e[1], e[0]),
          ]);

    const entrySets =
      this.entrySets.length === 0
        ? null
        : Arr.mapSparse(
            this.entrySets,
            (entrySet): MapEntrySet<K, V2> =>
              entrySet.buildMapValues(f) as MapEntrySet<K, V2>
          );

    return this.context.block(entries, entrySets, this.size, this.level);
  };
}

export class HashMapCollisionBuilder<K, V> extends CollisionBuilderBase<
  readonly [K, V]
> {
  constructor(
    readonly context: HashMapContext<K>,
    public source?: HashMapCollision<K, V>,
    public _entries?: List.Builder<readonly [K, V]>
  ) {
    super();
  }

  get<UK, O>(
    key: RelatedTo<K, UK>,
    otherwise?: OptLazy<O>,
    hash?: number
  ): V | O {
    if (!this.context.hasher.isValid(key)) return OptLazy(otherwise) as O;

    if (undefined !== this.source) return this.source.get(key, otherwise);

    const token = Symbol();
    let result: V | typeof token = token;
    this.entries.forEach((e, _, halt): void => {
      if (this.context.eq(key, e[0])) {
        result = e[1];
        halt();
      }
    });

    if (token === result) return OptLazy(otherwise) as O;
    return result;
  }

  addEntryInternal(entry: readonly [K, V]): boolean {
    let index = -1;
    this.entries.forEach((e, i, halt) => {
      if (this.context.eq(e[0], entry[0])) {
        index = i;
        halt();
      }
    });

    if (index < 0) {
      this.source = undefined;

      this.entries.append(entry);
      return true;
    }

    const oldEntry = this.entries.updateAt(index, (currentEntry): readonly [
      K,
      V
    ] => {
      if (Object.is(currentEntry[1], entry[1])) return currentEntry;
      return entry;
    });

    const changed =
      undefined === oldEntry ||
      !Object.is(oldEntry[1], entry[1]) ||
      !Object.is(oldEntry[0], entry[0]);

    if (changed) {
      this.source = undefined;
    }

    return changed;
  }

  set(key: K, value: V): boolean {
    return this.addEntryInternal([key, value]);
  }

  modifyAt(
    atKey: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentEntry: V, remove: Token) => V | Token;
    }
  ): boolean {
    let index = -1;
    let foundEntry: readonly [K, V] | undefined = undefined;

    this.entries.forEach((e, i, halt) => {
      if (this.context.eq(e[0], atKey)) {
        index = i;
        foundEntry = e;
        halt();
      }
    });

    if (undefined === foundEntry) {
      if (undefined === options.ifNew) return false;

      const newValue = OptLazyOr(options.ifNew, Token);

      if (Token === newValue) return false;

      this.source = undefined;

      this.entries.append([atKey, newValue]);

      return true;
    }

    if (undefined === options.ifExists) return false;

    const newValue = options.ifExists(foundEntry[1], Token);

    if (Object.is(newValue, foundEntry[1])) return false;

    if (Token === newValue) {
      this.source = undefined;
      this.entries.remove(index);
      return true;
    }

    const result = this.entries.set(index, [atKey, newValue as V]);

    const changed = undefined !== result;

    if (changed) this.source = undefined;

    return changed;
  }

  buildNE(): HashMapCollision<K, V> {
    if (undefined !== this.source) return this.source;

    return this.context.collision(this.entries.build().assumeNonEmpty());
  }

  buildMapValues<V2>(f: (value: V, key: K) => V2): HashMap<K, V2> {
    if (undefined !== this.source) return this.source.mapValues(f);

    return this.context.collision(
      this.entries
        .buildMap((entry): readonly [K, V2] => [
          entry[0],
          f(entry[1], entry[0]),
        ])
        .assumeNonEmpty()
    );
  }
}
