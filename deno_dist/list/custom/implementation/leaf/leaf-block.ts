import { Arr, RimbuError } from '../../../../base/mod.ts';
import {
  ArrayNonEmpty,
  IndexRange,
  OptLazy,
  TraverseState,
  Update,
} from '../../../../common/mod.ts';
import { Stream, StreamSource } from '../../../../stream/mod.ts';

import type { List } from '../../../../list/mod.ts';
import type {
  Block,
  BlockBuilder,
  LeafTree,
  ListContext,
} from '../../../../list/custom/index.ts';
import { ListNonEmptyBase } from '../../../../list/custom/index.ts';

export class LeafBlock<T>
  extends ListNonEmptyBase<T>
  implements Block<T, LeafBlock<T>, T>
{
  constructor(readonly context: ListContext, readonly children: readonly T[]) {
    super();
  }

  get length(): number {
    return this.children.length;
  }

  get level(): 0 {
    return 0;
  }

  copy(children: readonly T[]): LeafBlock<T> {
    if (children === this.children) return this;
    return this.context.leafBlock(children);
  }

  copy2<T2>(children: readonly T2[]): LeafBlock<T2> {
    return this.context.leafBlock(children);
  }

  get mutateChildren(): T[] {
    return this.children as T[];
  }

  get childrenInMax(): boolean {
    return this.children.length <= this.context.maxBlockSize;
  }

  get childrenInMin(): boolean {
    return this.children.length >= this.context.minBlockSize;
  }

  get canAddChild(): boolean {
    return this.children.length < this.context.maxBlockSize;
  }

  stream(reversed = false): Stream.NonEmpty<T> {
    return Stream.fromArray(
      this.children,
      undefined,
      reversed
    ) as Stream.NonEmpty<T>;
  }

  streamRange(range: IndexRange, reversed = false): Stream<T> {
    return Stream.fromArray(
      this.children,
      range,
      reversed
    ) as Stream.NonEmpty<T>;
  }

  get<O>(index: number, otherwise?: OptLazy<O>): T | O {
    if (index >= this.length || -index > this.length) {
      return OptLazy(otherwise) as O;
    }
    if (index < 0) {
      return this.get(this.length + index, otherwise);
    }

    return this.children[index];
  }

  prepend(value: T): List.NonEmpty<T> {
    if (this.length === 1 && !this.context.isReversedLeafBlock<any>(this)) {
      return this.context.reversedLeaf([this.children[0], value]);
    }
    if (this.canAddChild) {
      return this.prependInternal(value);
    }

    return this.context.leafTree(this.copy([value]), this, null);
  }

  append(value: T): List.NonEmpty<T> {
    if (this.canAddChild) return this.appendInternal(value);

    return this.context.leafTree(this, this.copy([value]), null);
  }

  prependInternal(value: T): LeafBlock<T> {
    const newChildren = Arr.prepend(this.children, value);
    return this.copy(newChildren);
  }

  appendInternal(value: T): LeafBlock<T> {
    const newChildren = Arr.append(this.children, value);
    return this.copy(newChildren);
  }

  take(amount: number): List<T> | any {
    if (amount === 0) return this.context.empty();
    if (amount >= this.length || -amount > this.length) return this;
    if (amount < 0) return this.drop(this.length + amount);

    return this.takeChildren(amount);
  }

  drop(amount: number): List<T> {
    if (amount === 0) return this;
    if (amount >= this.length || -amount > this.length)
      return this.context.empty();
    if (amount < 0) return this.take(this.length + amount);

    return this.dropChildren(amount);
  }

  takeChildren(childAmount: number): LeafBlock<T> {
    if (childAmount >= this.length) return this;

    const newChildren = Arr.splice(
      this.children,
      childAmount,
      this.context.maxBlockSize
    );
    return this.copy(newChildren);
  }

  dropChildren(childAmount: number): LeafBlock<T> {
    if (childAmount <= 0) return this;

    const newChildren = Arr.splice(this.children, 0, childAmount);
    return this.copy(newChildren);
  }

  concatChildren(other: LeafBlock<T>): LeafBlock<T> {
    const addChildren = this.context.isReversedLeafBlock<any>(other)
      ? Arr.reverse(other.children)
      : other.children;

    const newChildren = this.children.concat(addChildren);

    return this.copy(newChildren);
  }

  concat<T2>(
    ...sources: ArrayNonEmpty<StreamSource<T2>>
  ): List.NonEmpty<T | T2> {
    const asList: List<T | T2> = this.context.from(...sources);

    if (asList.nonEmpty()) {
      if (this.context.isLeafBlock(asList)) {
        if (
          asList === this &&
          this.children.length > this.context.minBlockSize
        ) {
          return this.context.leafTree<T | T2>(this as any, this as any, null);
        }
        return (this as LeafBlock<T | T2>).concatBlock(asList);
      }
      if (this.context.isLeafTree(asList)) {
        return (this as LeafBlock<T | T2>).concatTree(asList);
      }
      RimbuError.throwInvalidStateError();
    }

    return this as List.NonEmpty<T | T2>;
  }

  concatBlock(other: LeafBlock<T>): List.NonEmpty<T> {
    return this.concatChildren(other)._mutateNormalize();
  }

  concatTree(other: LeafTree<T>): LeafTree<T> {
    if (this.length + other.left.length <= this.context.maxBlockSize) {
      const newLeft = this.concatChildren(other.left);

      return other.copy(newLeft);
    }

    if (other.left.childrenInMin) {
      const newMiddle = other.prependMiddle(other.left);

      return other.copy(this, undefined, newMiddle);
    }

    const newLeft = this.concatChildren(other.left);
    const newSecond = newLeft._mutateSplitRight(
      newLeft.length - this.context.maxBlockSize
    );
    const newMiddle = other.prependMiddle(newSecond);

    return other.copy(newLeft, undefined, newMiddle);
  }

  updateAt(index: number, update: Update<T>): LeafBlock<T> {
    if (index >= this.length || -index > this.length) return this;
    if (index < 0) return this.updateAt(this.length + index, update);

    const newChildren = Arr.update(this.children, index, (c) =>
      Update(c, update)
    );
    return this.copy(newChildren);
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    if (state.halted) return;

    Arr.forEach(
      this.children,
      f,
      state,
      this.context.isReversedLeafBlock(this)
    );
  }

  mapPure<T2>(
    mapFun: (value: T) => T2,
    reversed = false,
    cacheMap = this.context.createCacheMap()
  ): LeafBlock<T2> {
    const currentValue = cacheMap.get(this);
    if (currentValue) return currentValue;

    const fn = reversed ? Arr.reverseMap : Arr.map;

    const newChildren = fn(this.children, mapFun);
    return cacheMap.setAndReturn(this, this.copy2(newChildren));
  }

  map<T2>(
    mapFun: (value: T, index: number) => T2,
    reversed = false,
    indexOffset = 0
  ): LeafBlock<T2> {
    if (reversed) {
      const newChildren = Arr.reverseMap(this.children, mapFun, indexOffset);
      return this.copy2(newChildren);
    }

    const newChildren = Arr.map(this.children, mapFun, indexOffset);
    return this.copy2(newChildren);
  }

  reversed(cacheMap = this.context.createCacheMap()): LeafBlock<T> {
    if (this.length === 1) return this;

    const cachedThis = cacheMap.get(this);
    if (cachedThis !== undefined) return cachedThis;

    const reversedThis = this.context.reversedLeaf(this.children);
    return cacheMap.setAndReturn(this, reversedThis);
  }

  _mutateNormalize(): List.NonEmpty<T> {
    if (this.childrenInMax) return this;

    const newRight = this._mutateSplitRight();

    return this.context.leafTree(this, newRight, null);
  }

  _mutateSplitRight(childIndex = this.children.length >>> 1): LeafBlock<T> {
    const rightChildren = this.mutateChildren.splice(childIndex);

    return this.copy(rightChildren);
  }

  toArray(range?: IndexRange, reversed = false): T[] | any {
    let result: readonly T[];
    if (undefined === range) result = this.children;
    else {
      const indexRange = IndexRange.getIndicesFor(range, this.length);

      if (indexRange === 'all') result = this.children;
      else if (indexRange === 'empty') result = [];
      else {
        const [start, end] = indexRange;
        if (!reversed) return this.children.slice(start, end + 1);
        return Arr.reverse(this.children, start, end);
      }
    }

    if (reversed) return Arr.reverse(result);
    return result.slice();
  }

  structure(): string {
    return `<Leaf ${this.length}>`;
  }

  createBlockBuilder(): BlockBuilder<T, any> {
    return this.context.leafBlockBuilderSource(this);
  }
}

export class ReversedLeafBlock<T> extends LeafBlock<T> {
  copy(children: readonly T[]): LeafBlock<T> {
    if (children === this.children) return this;
    return this.context.reversedLeaf(children);
  }

  copy2<T2>(children: readonly T2[]): LeafBlock<T2> {
    return this.context.reversedLeaf(children);
  }

  stream(reversed = false): Stream.NonEmpty<T> {
    return Stream.fromArray(
      this.children,
      undefined,
      !reversed
    ) as Stream.NonEmpty<T>;
  }

  streamRange(range: IndexRange, reversed = false): Stream<T> {
    const indices = IndexRange.getIndicesFor(range, this.length);
    if (indices === 'empty') return Stream.empty();
    if (indices === 'all') return this.stream(reversed);

    const start = this.length - 1 - indices[1];
    const end = this.length - 1 - indices[0];
    return Stream.fromArray(this.children, { start, end }, !reversed);
  }

  get<O>(index: number, otherwise?: OptLazy<O>): T | O {
    if (index >= this.length || -index > this.length) {
      return OptLazy(otherwise) as O;
    }
    if (index < 0) {
      return this.get(this.length + index, otherwise);
    }

    return this.children[this.length - 1 - index];
  }

  prependInternal(value: T): LeafBlock<T> {
    return super.appendInternal(value);
  }

  appendInternal(value: T): LeafBlock<T> {
    return super.prependInternal(value);
  }

  takeChildren(childAmount: number): LeafBlock<T> {
    return super.dropChildren(this.length - childAmount);
  }

  dropChildren(childAmount: number): LeafBlock<T> {
    return super.takeChildren(this.length - childAmount);
  }

  concatChildren(other: LeafBlock<T>): LeafBlock<T> {
    if (other.context.isReversedLeafBlock<any>(other)) {
      return this.copy(other.children.concat(this.children));
    }

    return other.copy(Arr.reverse(this.children).concat(other.children));
  }

  updateAt(index: number, update: Update<T>): LeafBlock<T> {
    if (index >= this.length || -index > this.length) return this;
    if (index < 0) return this.updateAt(this.length + index, update);

    return super.updateAt(this.length - 1 - index, update);
  }

  map<T2>(
    mapFun: (value: T, index: number) => T2,
    reversed = false,
    indexOffset = 0
  ): LeafBlock<T2> {
    if (!reversed) {
      const newChildren = Arr.reverseMap(this.children, mapFun, indexOffset);
      return super.copy2(newChildren);
    }

    const newChildren = Arr.map(this.children, mapFun, indexOffset);
    return super.copy2(newChildren);
  }

  reversed(cacheMap = this.context.createCacheMap()): LeafBlock<T> {
    if (this.length === 1) return this;

    const cachedThis = cacheMap.get(this);
    if (cachedThis !== undefined) return cachedThis;

    const reversedThis = this.context.leafBlock(this.children);
    return cacheMap.setAndReturn(this, reversedThis);
  }

  toArray(range?: IndexRange, reversed = false): T[] | any {
    let result: readonly T[];

    if (undefined === range) result = this.children;
    else {
      const indexRange = IndexRange.getIndicesFor(range, this.length);

      if (indexRange === 'empty') return [];
      else if (indexRange === 'all') result = this.children;
      else {
        const [indexStart, indexEnd] = indexRange;
        const start = this.length - 1 - indexEnd;
        const end = this.length - 1 - indexStart;
        if (!reversed) return Arr.reverse(this.children, start, end);
        return this.children.slice(start, end + 1);
      }
    }

    if (!reversed) return Arr.reverse(result);
    return result.slice();
  }

  _mutateSplitRight(childIndex = this.children.length >>> 1): LeafBlock<T> {
    const rightChildren = this.mutateChildren.splice(0, childIndex);

    return this.copy(rightChildren);
  }

  structure(): string {
    return `<RLeaf ${this.length}>`;
  }
}
