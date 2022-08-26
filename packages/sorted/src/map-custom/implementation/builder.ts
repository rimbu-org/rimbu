import { Token } from '@rimbu/base';
import { OptLazy, OptLazyOr, RelatedTo, Update } from '@rimbu/common';
import { Stream, StreamSource } from '@rimbu/stream';
import { isEmptyStreamSourceInstance } from '@rimbu/stream/custom';

import type { SortedMap } from '@rimbu/sorted/map';
import type { SortedMapNode, SortedMapContext } from '@rimbu/sorted/map-custom';

import { SortedIndex, SortedBuilder } from '../../common';

export class SortedMapBuilder<K, V>
  extends SortedBuilder<readonly [K, V]>
  implements SortedMap.Builder<K, V>
{
  constructor(
    readonly context: SortedMapContext<K>,
    public source?: undefined | SortedMap<K, V>,
    public _entries?: undefined | (readonly [K, V])[],
    public _children?: undefined | SortedMapBuilder<K, V>[],
    public size = source?.size ?? 0
  ) {
    super();
  }

  createNew(
    source?: undefined | SortedMap<K, V>,
    _entries?: undefined | (readonly [K, V])[],
    _children?: undefined | SortedMapBuilder<K, V>[],
    size?: undefined | number
  ): SortedMapBuilder<K, V> {
    return new SortedMapBuilder(
      this.context,
      source,
      _entries,
      _children,
      size
    );
  }

  prepareMutate(): void {
    if (undefined === this._entries) {
      if (undefined !== this.source) {
        if (this.context.isSortedMapEmpty(this.source)) {
          this._entries = [];
          this._children = [];
        } else if (this.context.isSortedMapLeaf<K, V>(this.source)) {
          this._entries = this.source.entries.slice();
        } else if (this.context.isSortedMapInner<K, V>(this.source)) {
          this._entries = this.source.entries.slice();
          this._children = this.source.children.map(
            (child): SortedMapBuilder<K, V> => this.createNew(child)
          );
        }
      }

      if (undefined === this._entries) {
        this._entries = [];
      }
    }
  }

  get children(): SortedMapBuilder<K, V>[] {
    this.prepareMutate();
    return this._children!;
  }

  set children(value: SortedMapBuilder<K, V>[]) {
    this.prepareMutate();
    this.source = undefined;
    this._children = value;
  }

  get = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
    if (!this.context.comp.isComparable(key)) return OptLazy(otherwise) as O;

    if (undefined !== this.source) return this.source.get(key, otherwise!);

    const entryIndex = this.context.findIndex(key, this.entries);

    if (entryIndex >= 0) {
      return this.entries[entryIndex][1];
    }

    if (this.hasChildren) {
      const childIndex = SortedIndex.next(entryIndex);
      const child = this.children[childIndex];

      return child.get(key, otherwise);
    }

    return OptLazy(otherwise) as O;
  };

  hasKey = <UK>(key: RelatedTo<K, UK>): boolean => {
    return Token !== this.get(key, Token);
  };

  addEntry = (entry: readonly [K, V]): boolean => {
    this.checkLock();

    const result = this.addEntryInternal(entry);
    this.normalize();
    return result;
  };

  addEntries = (source: StreamSource<readonly [K, V]>): boolean => {
    this.checkLock();

    return Stream.from(source).filterPure(this.addEntry).count() > 0;
  };

  set = (key: K, value: V): boolean => {
    return this.addEntry([key, value]);
  };

  removeKey = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
    this.checkLock();

    if (!this.context.comp.isComparable(key)) return OptLazy(otherwise) as O;

    const result = this.removeInternal(key, otherwise);
    this.normalize();
    return result;
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

  modifyAt = (
    key: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentValue: V, remove: Token) => V | Token;
    }
  ): boolean => {
    this.checkLock();

    const result = this.modifyAtInternal(key, options);
    this.normalize();
    return result;
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

  build = (): SortedMap<K, V> => {
    if (undefined !== this.source) return this.source;
    if (this.size === 0) return this.context.empty();
    if (!this.hasChildren) {
      return this.context.leaf(this.entries.slice());
    }
    return this.context.inner(
      this.entries.slice(),
      this.children.map(
        (child): SortedMapNode<K, V> => child.build() as SortedMapNode<K, V>
      ),
      this.size
    );
  };

  buildMapValues = <V2>(f: (value: V, key: K) => V2): SortedMap<K, V2> => {
    if (undefined !== this.source) return this.source.mapValues(f);
    if (this.size === 0) return this.context.empty();

    const newEntries = this.entries.map((entry): [K, V2] => [
      entry[0],
      f(entry[1], entry[0]),
    ]);

    if (!this.hasChildren) {
      return this.context.leaf(newEntries);
    }

    return this.context.inner(
      newEntries,
      this.children.map(
        (c): SortedMapNode<K, V2> => c.buildMapValues(f) as SortedMapNode<K, V2>
      ),
      this.size
    );
  };

  addEntryInternal(entry: readonly [K, V]): boolean {
    const entryIndex = this.context.findIndex(entry[0], this.entries);

    if (entryIndex >= 0) {
      const currentEntry = this.entries[entryIndex];
      if (Object.is(currentEntry[1], entry[1])) return false;

      this.source = undefined;

      this.entries[entryIndex] = entry;
      return true;
    }

    const childIndex = SortedIndex.next(entryIndex);

    if (!this.hasChildren) {
      this.source = undefined;

      this.size++;

      this.entries.splice(childIndex, 0, entry);
      return true;
    }

    const child = this.children[childIndex];

    const preSize = child.size;
    const changed = child.addEntryInternal(entry);

    if (!changed) return false;

    this.source = undefined;

    this.size += child.size - preSize;

    this.normalizeChildDecrease(childIndex);
    return true;
  }

  removeInternal<O>(key: K, otherwise?: OptLazy<O>): V | O {
    if (this.size === 0) return OptLazy(otherwise) as O;

    const entryIndex = this.context.findIndex(key, this.entries);

    if (entryIndex >= 0) {
      this.source = undefined;

      this.size--;

      if (!this.hasChildren) {
        const removed = this.entries.splice(entryIndex, 1);
        return removed[0][1];
      }

      const leftChild = this.children[entryIndex];
      const rightChild = this.children[entryIndex + 1];

      const removed = this.entries[entryIndex];

      if (leftChild.size >= rightChild.size) {
        this.entries[entryIndex] = leftChild.deleteMax();
        this.normalizeChildIncrease(entryIndex);
      } else {
        this.entries[entryIndex] = rightChild.deleteMin();
        this.normalizeChildIncrease(entryIndex + 1);
      }

      return removed[1];
    }

    if (!this.hasChildren) return OptLazy(otherwise) as O;

    const childIndex = SortedIndex.next(entryIndex);
    const child = this.children[childIndex];

    const preSize = child.size;
    const token = Symbol();
    const oldValue = child.removeInternal(key, token);

    if (token === oldValue) return OptLazy(otherwise) as O;

    this.source = undefined;

    this.size += child.size - preSize;

    this.normalizeChildIncrease(childIndex);
    return oldValue;
  }

  modifyAtInternal(
    key: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentValue: V, remove: Token) => V | Token;
    }
  ): boolean {
    const entryIndex = this.context.findIndex(key, this.entries);

    if (entryIndex >= 0) {
      if (undefined === options.ifExists) return false;

      const currentEntry = this.entries[entryIndex];
      const currentValue = currentEntry[1];
      const newValue = options.ifExists(currentValue, Token);

      if (newValue === currentValue) return false;

      if (Token === newValue) {
        return Token !== this.removeInternal(key, Token);
      }

      this.source = undefined;

      const newEntry: [K, V] = [key, newValue];
      this.entries[entryIndex] = newEntry;
      return true;
    }

    const childIndex = SortedIndex.next(entryIndex);

    if (!this.hasChildren) {
      if (undefined === options.ifNew) return false;

      const newValue = OptLazyOr(options.ifNew, Token);

      if (Token === newValue) return false;

      this.source = undefined;

      this.size++;

      this.entries.splice(childIndex, 0, [key, newValue]);
      return true;
    }

    const child = this.children[childIndex];

    const preSize = child.size;
    const changed = child.modifyAtInternal(key, options);

    if (!changed) return false;

    this.source = undefined;

    this.size += child.size - preSize;

    this.normalizeChildDecrease(childIndex);
    this.normalizeChildIncrease(childIndex);
    return changed;
  }
}
