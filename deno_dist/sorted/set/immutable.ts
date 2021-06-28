import { Arr, RimbuError } from 'https://deno.land/x/rimbu/base/mod.ts';
import {
  ArrayNonEmpty,
  IndexRange,
  OptLazy,
  Range,
  RelatedTo,
  ToJSON,
  TraverseState,
} from 'https://deno.land/x/rimbu/common/mod.ts';
import { Stream, StreamSource } from 'https://deno.land/x/rimbu/stream/mod.ts';
import { SortedIndex, SortedSet } from '../internal.ts';
import {
  innerDeleteMax,
  innerDeleteMin,
  innerDropInternal,
  innerGetAtIndex,
  innerMutateGetFromLeft,
  innerMutateGetFromRight,
  innerMutateGiveToLeft,
  innerMutateGiveToRight,
  innerMutateJoinLeft,
  innerMutateJoinRight,
  innerMutateSplitRight,
  innerNormalizeDownsizeChild,
  innerNormalizeIncreaseChild,
  innerStreamSliceIndex,
  innerTakeInternal,
  leafDeleteMax,
  leafDeleteMin,
  leafMutateGetFromLeft,
  leafMutateGetFromRight,
  leafMutateGiveToLeft,
  leafMutateGiveToRight,
  leafMutateJoinLeft,
  leafMutateJoinRight,
  leafMutateSplitRight,
  SortedEmpty,
  SortedNonEmptyBase,
} from '../sorted-custom.ts';
import type { SortedSetContext } from '../sortedset-custom.ts';

export class SortedSetEmpty<T = any>
  extends SortedEmpty
  implements SortedSet<T>
{
  constructor(readonly context: SortedSetContext<T>) {
    super();
  }

  streamRange(): Stream<T> {
    return Stream.empty();
  }

  streamSliceIndex(): Stream<T> {
    return Stream.empty();
  }

  has(): false {
    return false;
  }

  add(value: T): SortedSet.NonEmpty<T> {
    return this.context.leaf([value]);
  }

  addAll(values: StreamSource<T>): SortedSet.NonEmpty<T> {
    return this.context.from(values);
  }

  remove(): this {
    return this;
  }

  removeAll(): this {
    return this;
  }

  slice(): this {
    return this;
  }

  union(other: StreamSource<T>): SortedSet<T> | any {
    if (other instanceof SortedSetLeaf || other instanceof SortedSetNode) {
      if (other.context === this.context) return other;
    }

    return this.context.from(other);
  }

  difference(): SortedSet<T> {
    return this.context.empty();
  }

  intersect(): SortedSet<T> {
    return this.context.empty();
  }

  symDifference(other: StreamSource<T>): SortedSet<T> {
    return this.union(other);
  }

  toBuilder(): SortedSet.Builder<T> {
    return this.context.builder();
  }

  toString(): string {
    return `SortedSet()`;
  }

  toJSON(): ToJSON<T[]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }
}

export abstract class SortedSetNode<T>
  extends SortedNonEmptyBase<T, SortedSetNode<T>>
  implements SortedSet.NonEmpty<T>
{
  abstract readonly context: SortedSetContext<T>;
  abstract readonly size: number;
  abstract stream(): Stream.NonEmpty<T>;
  abstract streamSliceIndex(range: IndexRange): Stream<T>;
  abstract forEach(
    f: (value: T, index: number, halt: () => void) => void,
    traverseState?: TraverseState
  ): void;
  abstract has<U>(value: RelatedTo<T, U>): boolean;
  abstract min(): T;
  abstract max(): T;
  abstract toArray(): ArrayNonEmpty<T>;

  // internal methods
  abstract addInternal(value: T): SortedSetNode<T>;
  abstract removeInternal(value: T): SortedSetNode<T>;
  abstract getInsertIndexOf(value: T): number;
  abstract normalize(): SortedSet<T>;

  asNormal(): this {
    return this;
  }

  getSliceRange(range: Range<T>): { startIndex: number; endIndex: number } {
    const { start, end } = Range.getNormalizedRange(range);
    let startIndex = 0;
    let endIndex = this.size - 1;

    if (undefined !== start) {
      const [startValue, startInclude] = start;
      startIndex = this.getInsertIndexOf(startValue);

      if (startIndex < 0) startIndex = SortedIndex.next(startIndex);
      else if (!startInclude) startIndex++;
    }
    if (undefined !== end) {
      const [endValue, endInclude] = end;
      endIndex = this.getInsertIndexOf(endValue);

      if (endIndex < 0) endIndex = SortedIndex.prev(endIndex);
      else if (!endInclude) endIndex--;
    }

    return { startIndex, endIndex };
  }

  streamRange(range: Range<T>): Stream<T> {
    const { startIndex, endIndex } = this.getSliceRange(range);

    return this.streamSliceIndex({
      start: [startIndex, true],
      end: [endIndex, true],
    });
  }

  add(value: T): SortedSet.NonEmpty<T> {
    return this.addInternal(value).normalize().assumeNonEmpty();
  }

  addAll(values: StreamSource<T>): SortedSet.NonEmpty<T> {
    if (StreamSource.isEmptyInstance(values)) return this;

    const builder = this.toBuilder();
    builder.addAll(values);
    return builder.build().assumeNonEmpty();
  }

  remove<U>(value: RelatedTo<T, U>): SortedSet<T> {
    if (!this.context.comp.isComparable(value)) return this;
    return this.removeInternal(value).normalize();
  }

  removeAll<U>(values: StreamSource<RelatedTo<T, U>>): SortedSet<T> {
    if (StreamSource.isEmptyInstance(values)) return this;

    const builder = this.toBuilder();
    builder.removeAll(values);
    return builder.build();
  }

  filter(
    pred: (value: T, index: number, halt: () => void) => boolean
  ): SortedSet<T> {
    const builder = this.context.builder();

    builder.addAll(this.stream().filter(pred));

    if (builder.size === this.size) return this;
    return builder.build();
  }

  take(amount: number): SortedSet<T> | any {
    if (amount === 0) return this.context.empty();
    if (amount >= this.size || -amount > this.size) return this;
    if (amount < 0) return this.drop(this.size + amount);

    return this.takeInternal(amount).normalize();
  }

  drop(amount: number): SortedSet<T> {
    if (amount === 0) return this;
    if (amount >= this.size || -amount > this.size) return this.context.empty();
    if (amount < 0) return this.take(this.size + amount);

    return this.dropInternal(amount).normalize();
  }

  sliceIndex(range: IndexRange): SortedSet<T> {
    const indexRange = IndexRange.getIndicesFor(range, this.size);

    if (indexRange === 'empty') return this.context.empty();
    if (indexRange === 'all') return this;

    const [start, end] = indexRange;

    return this.drop(start).take(end - start + 1);
  }

  slice(range: Range<T>): SortedSet<T> {
    const { startIndex, endIndex } = this.getSliceRange(range);

    return this.sliceIndex({
      start: [startIndex, true],
      end: [endIndex, true],
    });
  }

  union(other: StreamSource<T>): SortedSet<T> | any {
    if (other === this) return this;
    if (StreamSource.isEmptyInstance(other)) return this;

    const builder = this.toBuilder();
    builder.addAll(other);
    return builder.build();
  }

  difference(other: StreamSource<T>): SortedSet<T> {
    if (other === this) return this.context.empty();
    if (StreamSource.isEmptyInstance(other)) return this;

    const builder = this.toBuilder();
    builder.removeAll(other);
    return builder.build();
  }

  intersect(other: StreamSource<T>): SortedSet<T> {
    if (other === this) return this;
    if (StreamSource.isEmptyInstance(other)) return this.context.empty();

    const builder = this.context.builder();
    const otherIter = Stream.from(other)[Symbol.iterator]();
    const done = Symbol('Done');

    if (other instanceof SortedSetNode) {
      const thisIt = this[Symbol.iterator]();
      let thisValue: T | typeof done = thisIt.fastNext(done);
      let otherValue: T | typeof done = otherIter.fastNext(done);
      const comp = this.context.comp;

      while (true) {
        if (done === thisValue || done === otherValue) {
          break;
        }

        const result = comp.compare(thisValue, otherValue);
        if (result === 0) builder.add(thisValue);
        if (result <= 0) thisValue = thisIt.fastNext(done);
        if (result >= 0) otherValue = otherIter.fastNext(done);
      }
    } else {
      let value: T | typeof done;

      while (done !== (value = otherIter.fastNext(done))) {
        if (this.has(value)) builder.add(value);
      }
    }

    if (builder.size === this.size) return this;

    return builder.build();
  }

  symDifference(other: StreamSource<T>): SortedSet<T> {
    if (other === this) return this.context.empty();

    if (StreamSource.isEmptyInstance(other)) return this;

    const builder = this.toBuilder();

    Stream.from(other).filterNotPure(builder.remove).forEach(builder.add);

    return builder.build();
  }

  toBuilder(): SortedSet.Builder<T> {
    return this.context.createBuilder(this);
  }

  toString(): string {
    return this.stream().join({ start: 'SortedSet(', sep: ', ', end: ')' });
  }

  toJSON(): ToJSON<T[]> {
    return {
      dataType: this.context.typeTag,
      value: this.toArray(),
    };
  }
}

export class SortedSetLeaf<T> extends SortedSetNode<T> {
  constructor(
    readonly context: SortedSetContext<T>,
    public entries: readonly T[]
  ) {
    super();
  }

  copy(entries: readonly T[]): SortedSetLeaf<T> {
    if (entries === this.entries) return this;
    return this.context.leaf(entries);
  }

  get size(): number {
    return this.entries.length;
  }

  stream(): Stream.NonEmpty<T> {
    return Stream.fromArray(this.entries) as Stream.NonEmpty<T>;
  }

  streamSliceIndex(range: IndexRange): Stream<T> {
    return Stream.fromArray(this.entries, range);
  }

  min(): T {
    return this.entries[0];
  }

  max(): T {
    return Arr.last(this.entries);
  }

  has<U>(value: RelatedTo<T, U>): boolean {
    if (!this.context.comp.isComparable(value)) return false;
    return this.context.findIndex(value, this.entries) >= 0;
  }

  getAtIndex<O>(index: number, otherwise?: OptLazy<O>): T | O {
    if (index >= this.size || -index > this.size) {
      return OptLazy(otherwise) as O;
    }
    if (index < 0) {
      return this.getAtIndex(this.size + index, otherwise);
    }

    return this.entries[index];
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    if (state.halted) return;

    Arr.forEach(this.entries, f, state);
  }

  toArray(): ArrayNonEmpty<T> {
    return this.entries.slice() as ArrayNonEmpty<T>;
  }

  // internal methods

  getInsertIndexOf(value: T): number {
    return this.context.findIndex(value, this.entries);
  }

  addInternal(value: T): SortedSetNode<T> {
    const index = this.context.findIndex(value, this.entries);

    if (index >= 0) {
      const newEntries = Arr.update(this.entries, index, value);
      return this.copy(newEntries);
    }

    const insertIndex = SortedIndex.next(index);
    const newEntries = Arr.insert(this.entries, insertIndex, value);
    return this.copy(newEntries);
  }

  removeInternal(value: T): SortedSetNode<T> {
    const entryIndex = this.context.findIndex(value, this.entries);

    if (entryIndex < 0) return this;

    const currentValue = this.entries[entryIndex];

    if (currentValue !== value) return this;

    const newEntries = Arr.splice(this.mutateEntries, entryIndex, 1);
    return this.copy(newEntries);
  }

  takeInternal(amount: number): SortedSetLeaf<T> {
    return this.context.leaf(this.entries.slice(0, amount));
  }

  dropInternal(amount: number): SortedSetLeaf<T> {
    return this.context.leaf(this.entries.slice(amount));
  }

  deleteMin(): [T, SortedSetLeaf<T>] {
    return leafDeleteMin<SortedSetLeaf<T>, T>(this);
  }

  deleteMax(): [T, SortedSetLeaf<T>] {
    return leafDeleteMax<SortedSetLeaf<T>, T>(this);
  }

  mutateSplitRight(index?: number): [T, SortedSetLeaf<T>] {
    return leafMutateSplitRight<SortedSetLeaf<T>, T>(this, index);
  }

  mutateGiveToLeft(left: SortedSetLeaf<T>, toLeft: T): [T, SortedSetLeaf<T>] {
    return leafMutateGiveToLeft(this, left, toLeft);
  }

  mutateGiveToRight(
    right: SortedSetLeaf<T>,
    toRight: T
  ): [T, SortedSetLeaf<T>] {
    return leafMutateGiveToRight(this, right, toRight);
  }

  mutateGetFromLeft(left: SortedSetLeaf<T>, toMe: T): [T, SortedSetLeaf<T>] {
    return leafMutateGetFromLeft(this, left, toMe);
  }

  mutateGetFromRight(right: SortedSetLeaf<T>, toMe: T): [T, SortedSetLeaf<T>] {
    return leafMutateGetFromRight(this, right, toMe);
  }

  mutateJoinLeft(left: SortedSetLeaf<T>, entry: T): void {
    return leafMutateJoinLeft(this, left, entry);
  }

  mutateJoinRight(right: SortedSetLeaf<T>, entry: T): void {
    return leafMutateJoinRight(this, right, entry);
  }

  normalize(): SortedSet<T> {
    if (this.entries.length === 0) return this.context.empty();
    if (this.entries.length <= this.context.maxEntries) return this;
    const size = this.size;
    const [upEntry, rightNode] = this.mutateSplitRight();
    return this.context.inner([upEntry], [this, rightNode], size);
  }
}

export class SortedSetInner<T> extends SortedSetNode<T> {
  constructor(
    readonly context: SortedSetContext<T>,
    public entries: readonly T[],
    public children: readonly SortedSetNode<T>[],
    public size: number
  ) {
    super();
  }

  get mutateChildren(): SortedSetNode<T>[] {
    return this.children as SortedSetNode<T>[];
  }

  copy(
    entries: readonly T[] = this.entries,
    children: readonly SortedSetNode<T>[] = this.children,
    size: number = this.size
  ): SortedSetInner<T> {
    if (
      entries === this.entries &&
      children === this.children &&
      size === this.size
    )
      return this;
    return this.context.inner(entries, children, size);
  }

  stream(): Stream.NonEmpty<T> {
    const token = Symbol();
    return Stream.from(this.children)
      .zipAll(token, this.entries)
      .flatMap(([child, e]): Stream.NonEmpty<T> => {
        if (token === child) RimbuError.throwInvalidStateError();
        if (token === e) return child.stream();
        return child.stream().append(e);
      }) as Stream.NonEmpty<T>;
  }

  streamSliceIndex(range: IndexRange): Stream<T> {
    return innerStreamSliceIndex<T>(this, range);
  }

  min(): T {
    return this.children[0].min();
  }

  max(): T {
    return Arr.last(this.children).max();
  }

  has<U>(value: RelatedTo<T, U>): boolean {
    if (!this.context.comp.isComparable(value)) return false;

    const index = this.context.findIndex(value, this.entries);

    if (index >= 0) return true;

    const childIndex = SortedIndex.next(index);
    const child = this.children[childIndex];

    return child.has<U>(value);
  }

  getAtIndex<O>(index: number, otherwise?: OptLazy<O>): T | O {
    return innerGetAtIndex<T, O>(this, index, otherwise);
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    let i = -1;

    const { halt } = state;

    while (!state.halted && i < this.entries.length) {
      if (i >= 0) f(this.entries[i], state.nextIndex(), halt);
      else {
        const childIndex = SortedIndex.next(i);
        this.children[childIndex].forEach(f, state);
      }
      i = SortedIndex.next(i);
    }
  }

  toArray(): ArrayNonEmpty<T> {
    let i = -1;
    let result: T[] = [];

    while (i < this.entries.length) {
      if (i >= 0) result.push(this.entries[i]);
      else {
        const childIndex = SortedIndex.next(i);
        result = result.concat(this.children[childIndex].toArray());
      }
      i = SortedIndex.next(i);
    }

    return result as ArrayNonEmpty<T>;
  }

  // internal methods

  getInsertIndexOf(value: T): number {
    let index = 0;

    for (let i = 0; i < this.entries.length; i++) {
      const comp = this.context.comp.compare(value, this.entries[i]);
      const child = this.children[i];

      if (comp < 0) {
        const insertIndex = child.getInsertIndexOf(value);

        if (insertIndex < 0) return -index + insertIndex;
        return index + insertIndex;
      }

      index += child.size + 1;

      if (comp === 0) return index;
    }

    const insertIndex = Arr.last(this.children).getInsertIndexOf(value);

    if (insertIndex < 0) return -index + insertIndex;
    return index + insertIndex;
  }

  deleteMin(): [T, SortedSetInner<T>] {
    return innerDeleteMin<SortedSetInner<T>, T>(this);
  }

  deleteMax(): [T, SortedSetInner<T>] {
    return innerDeleteMax<SortedSetInner<T>, T>(this);
  }

  mutateSplitRight(index?: number): [T, SortedSetInner<T>] {
    return innerMutateSplitRight<SortedSetInner<T>, T>(this, index);
  }

  mutateGiveToLeft(left: SortedSetInner<T>, toLeft: T): [T, SortedSetInner<T>] {
    return innerMutateGiveToLeft(this, left, toLeft);
  }

  mutateGiveToRight(
    right: SortedSetInner<T>,
    toRight: T
  ): [T, SortedSetInner<T>] {
    return innerMutateGiveToRight(this, right, toRight);
  }

  mutateGetFromLeft(left: SortedSetInner<T>, toMe: T): [T, SortedSetInner<T>] {
    return innerMutateGetFromLeft(this, left, toMe);
  }

  mutateGetFromRight(
    right: SortedSetInner<T>,
    toMe: T
  ): [T, SortedSetInner<T>] {
    return innerMutateGetFromRight(this, right, toMe);
  }

  mutateJoinLeft(left: SortedSetInner<T>, entry: T): void {
    return innerMutateJoinLeft(this, left, entry);
  }

  mutateJoinRight(right: SortedSetInner<T>, entry: T): void {
    return innerMutateJoinRight(this, right, entry);
  }

  normalizeDownsizeChild(
    childIndex: number,
    newChild: SortedSetNode<T>,
    newSize: number
  ): SortedSetInner<T> {
    return innerNormalizeDownsizeChild<SortedSetInner<T>, T>(
      this,
      childIndex,
      newChild,
      newSize
    );
  }

  normalizeIncreaseChild(
    childIndex: number,
    newChild: SortedSetNode<T>,
    newSize: number
  ): SortedSetInner<T> {
    return innerNormalizeIncreaseChild<SortedSetInner<T>, T>(
      this,
      childIndex,
      newChild,
      newSize
    );
  }

  addInternal(value: T): SortedSetInner<T> {
    const entryIndex = this.context.findIndex(value, this.entries);

    if (entryIndex >= 0) {
      const newEntries = Arr.update(this.entries, entryIndex, value);
      return this.copy(newEntries);
    }

    const childIndex = SortedIndex.next(entryIndex);
    const child = this.children[childIndex];

    const newChild = child.addInternal(value);
    if (newChild === child) return this;

    const newSize = this.size + newChild.size - child.size;

    if (newChild.entries.length <= this.context.maxEntries) {
      // no need to shift
      const newChildren = Arr.update(this.children, childIndex, newChild);
      return this.copy(undefined, newChildren, newSize);
    }

    return this.normalizeDownsizeChild(childIndex, newChild, newSize);
  }

  removeInternal(value: T): SortedSetNode<T> {
    const entryIndex = this.context.findIndex(value, this.entries);

    if (entryIndex >= 0) {
      const currentValue = this.entries[entryIndex];

      if (!Object.is(currentValue, value)) return this;

      // remove inner entry
      const leftChild = this.children[entryIndex];
      const rightChild = this.children[entryIndex + 1];

      if (leftChild.entries.length >= rightChild.entries.length) {
        const [max, newLeft] = leftChild.deleteMax();
        const newEntries = Arr.update(this.entries, entryIndex, max);
        const newSelf = this.copy(newEntries);
        return newSelf.normalizeIncreaseChild(
          entryIndex,
          newLeft,
          this.size - 1
        );
      }

      const [min, newRight] = rightChild.deleteMin();
      const newEntries = Arr.update(this.entries, entryIndex, min);
      const newSelf = this.copy(newEntries);
      return newSelf.normalizeIncreaseChild(
        entryIndex + 1,
        newRight,
        this.size - 1
      );
    }

    const childIndex = SortedIndex.next(entryIndex);
    const child = this.children[childIndex];

    const newChild = child.removeInternal(value);
    const newSize = this.size + newChild.size - child.size;

    if (newChild.entries.length < this.context.minEntries) {
      return this.normalizeIncreaseChild(childIndex, newChild, newSize);
    }
    if (newChild.entries.length > this.context.maxEntries) {
      return this.normalizeDownsizeChild(childIndex, newChild, newSize);
    }

    const newChildren = Arr.update(this.children, childIndex, newChild);
    return this.copy(
      undefined,
      newChildren,
      this.size + newChild.size - child.size
    );
  }

  takeInternal(amount: number): SortedSetNode<T> {
    return innerTakeInternal<SortedSetInner<T>, T>(this, amount);
  }

  dropInternal(amount: number): SortedSetNode<T> {
    return innerDropInternal<SortedSetInner<T>, T>(this, amount);
  }

  normalize(): SortedSet<T> {
    if (this.entries.length === 0) return this.children[0].normalize();

    if (this.entries.length <= this.context.maxEntries) return this;

    const size = this.size;
    const [upEntry, rightNode] = this.mutateSplitRight();

    return this.copy([upEntry], [this, rightNode], size);
  }
}
