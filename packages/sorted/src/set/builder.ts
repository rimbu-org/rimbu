import { RelatedTo } from '@rimbu/common';
import { Stream, StreamSource } from '@rimbu/stream';
import { SortedIndex, SortedSet } from '../internal';
import { SortedBuilder } from '../sorted-custom';
import {
  SortedSetContext,
  SortedSetEmpty,
  SortedSetInner,
  SortedSetLeaf,
  SortedSetNode,
} from '../sortedset-custom';

export class SortedSetBuilder<T> extends SortedBuilder<T> {
  constructor(
    readonly context: SortedSetContext<T>,
    public source?: SortedSet<T>,
    public _entries?: T[],
    public _children?: SortedSetBuilder<T>[],
    public size = source?.size ?? 0
  ) {
    super();
  }

  createNew(
    source?: SortedSet<T>,
    entries?: T[],
    children?: SortedSetBuilder<T>[],
    size?: number
  ): SortedSetBuilder<T> {
    return new SortedSetBuilder(this.context, source, entries, children, size);
  }

  prepareMutate(): void {
    if (undefined === this._entries) {
      if (undefined !== this.source) {
        if (this.source instanceof SortedSetEmpty) {
          this._entries = [];
          this._children = [];
        } else if (this.source instanceof SortedSetLeaf) {
          const leaf = this.source as SortedSetLeaf<T>;
          this._entries = leaf.entries.slice();
        } else if (this.source instanceof SortedSetInner) {
          const inner = this.source as SortedSetInner<T>;
          this._entries = inner.entries.slice();
          this._children = inner.children.map(
            (child): SortedSetBuilder<T> => this.createNew(child)
          );
        }
      }

      if (undefined === this._entries) this._entries = [];
    }
  }

  get children(): SortedSetBuilder<T>[] {
    this.prepareMutate();
    return this._children!;
  }

  set children(value: SortedSetBuilder<T>[]) {
    this.prepareMutate();
    this.source = undefined;
    this._children = value;
  }

  has = <U>(value: RelatedTo<T, U>): boolean => {
    if (!this.context.comp.isComparable(value)) return false;

    if (undefined !== this.source) return this.source.has<U>(value);

    const index = this.context.findIndex(value as T, this.entries);

    if (index >= 0) return true;

    if (!this.hasChildren) return false;

    const childIndex = SortedIndex.next(index);
    const child = this.children[childIndex];

    return child.has<U>(value);
  };

  add = (value: T): boolean => {
    this.checkLock();

    const result = this.addInternal(value);
    this.normalize();
    return result;
  };

  addAll = (source: StreamSource<T>): boolean => {
    this.checkLock();

    return Stream.from(source).filterPure(this.add).count() > 0;
  };

  remove = <U>(value: RelatedTo<T, U>): boolean => {
    this.checkLock();

    if (!this.context.comp.isComparable(value)) return false;

    const result = this.removeInternal(value);
    this.normalize();
    return result;
  };

  removeAll = <U>(values: StreamSource<RelatedTo<T, U>>): boolean => {
    this.checkLock();

    return Stream.from(values).filterPure(this.remove).count() > 0;
  };

  build = (): SortedSet<T> => {
    if (undefined !== this.source) return this.source;
    if (this.size === 0) return this.context.empty();
    if (!this.hasChildren) {
      return this.context.leaf(this.entries.slice());
    }
    return this.context.inner(
      this.entries.slice(),
      this.children.map(
        (child): SortedSetNode<T> => child.build() as SortedSetNode<T>
      ),
      this.size
    );
  };

  addInternal(value: T): boolean {
    const entryIndex = this.context.findIndex(value, this.entries);

    if (entryIndex >= 0) {
      if (Object.is(this.entries[entryIndex], value)) return false;

      this.source = undefined;

      this.entries[entryIndex] = value;
      return true;
    }

    const childIndex = SortedIndex.next(entryIndex);

    if (!this.hasChildren) {
      this.source = undefined;

      this.size++;

      this.entries.splice(childIndex, 0, value);
      return true;
    }

    const child = this.children[childIndex];
    const preSize = child.size;
    const changed = child.addInternal(value);

    if (!changed) return false;

    this.source = undefined;

    this.size += child.size - preSize;
    this.normalizeChildDecrease(childIndex);
    return changed;
  }

  removeInternal(value: T): boolean {
    if (this.size === 0) return false;

    const entryIndex = this.context.findIndex(value, this.entries);

    if (entryIndex >= 0) {
      this.source = undefined;

      this.size--;

      if (!this.hasChildren) {
        this.entries.splice(entryIndex, 1);
        return true;
      }

      const leftChild = this.children[entryIndex];
      const rightChild = this.children[entryIndex + 1];

      if (leftChild.size >= rightChild.size) {
        this.entries[entryIndex] = leftChild.deleteMax();
        this.normalizeChildIncrease(entryIndex);
      } else {
        this.entries[entryIndex] = rightChild.deleteMin();
        this.normalizeChildIncrease(entryIndex + 1);
      }

      return true;
    }

    if (!this.hasChildren) return false;

    const childIndex = SortedIndex.next(entryIndex);
    const child = this.children[childIndex];

    const preSize = child.size;
    const changed = child.removeInternal(value);

    if (!changed) return false;

    this.source = undefined;

    this.size += child.size - preSize;

    this.normalizeChildIncrease(childIndex);
    return true;
  }
}
