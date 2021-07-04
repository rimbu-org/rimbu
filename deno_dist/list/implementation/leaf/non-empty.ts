import { Arr, RimbuError } from '../../../base/mod.ts';
import { CustomBase } from '../../../collection-types/mod.ts';
import {
  ArrayNonEmpty,
  CollectFun,
  IndexRange,
  OptLazy,
  SuperOf,
  ToJSON,
  TraverseState,
  Update,
} from '../../../common/mod.ts';
import { FastIterator, Stream, StreamSource } from '../../../stream/mod.ts';
import type { List } from '../../internal.ts';
import type { Block, ListContext, NonLeaf, Tree } from '../../list-custom.ts';
import {
  treeAppend,
  treeForEach,
  treeGet,
  treePrepend,
  treeStream,
  treeToArray,
  treeUpdate,
} from '../../list-custom.ts';

const _emptyObject = {};

export abstract class ListNonEmptyBase<T>
  extends CustomBase.NonEmptyBase<T>
  implements List.NonEmpty<T>
{
  abstract readonly context: ListContext;
  abstract readonly length: number;
  abstract stream(reversed?: boolean): Stream.NonEmpty<T>;
  abstract streamRange(range: IndexRange, reversed?: boolean): Stream<T>;
  abstract forEach(
    f: (value: T, index: number, halt: () => void) => void,
    traverseState?: TraverseState
  ): void;
  abstract get<O>(index: number, otherwise?: OptLazy<O>): T | O;
  abstract prepend(value: T): List.NonEmpty<T>;
  abstract append(value: T): List.NonEmpty<T>;
  abstract take(amount: number): List<T> | any;
  abstract drop(amount: number): List<T>;
  abstract concat(...sources: ArrayNonEmpty<StreamSource<T>>): List.NonEmpty<T>;
  abstract updateAt(index: number, update: Update<T>): List.NonEmpty<T>;
  abstract map<T2>(
    mapFun: (value: T, index: number) => T2,
    reversed?: boolean
  ): List.NonEmpty<T2>;
  abstract reversed(): List.NonEmpty<T>;
  abstract toArray(range?: IndexRange, reversed?: boolean): T[] | any;
  abstract structure(): string;

  [Symbol.iterator](): FastIterator<T> {
    return this.stream()[Symbol.iterator]();
  }

  get isEmpty(): false {
    return false;
  }

  nonEmpty(): true {
    return true;
  }

  assumeNonEmpty(): this {
    return this;
  }

  asNormal(): this {
    return this;
  }

  first(): T {
    return this.get(0, RimbuError.throwInvalidStateError);
  }

  last(): T {
    return this.get(this.length - 1, RimbuError.throwInvalidStateError);
  }

  slice(range: IndexRange, reversed: boolean): List<T> {
    const result = IndexRange.getIndicesFor(range, this.length);

    if (result === 'all') {
      if (reversed) return this.reversed();
      return this;
    }
    if (result === 'empty') return this.context.empty();

    const [start, end] = result;
    const values = this.drop(start).take(end - start + 1);

    if (!reversed) return values;
    return values.reversed();
  }

  splice({
    index = 0,
    remove = 0,
    insert,
  }: {
    index?: number;
    remove?: number;
    insert?: StreamSource<T>;
  } = _emptyObject): List<T> | any {
    if (index < 0) {
      return this.splice({ index: this.length + index, remove, insert });
    }

    if (undefined === insert) {
      if (remove <= 0) return this;
      return this.take(index).concat(this.drop(index + remove));
    }

    if (remove <= 0 && StreamSource.isEmptyInstance(insert)) return this;

    return this.take(index).concat(insert, this.drop(index + remove));
  }

  insert(index: number, values: StreamSource<T>): List<T> | any {
    return this.splice({ index, insert: values });
  }

  remove(index: number, amount = 1): List<T> {
    return this.splice({ index, remove: amount });
  }

  repeat(amount: number): List.NonEmpty<T> {
    if (amount <= -1) return this.reversed().repeat(-amount);
    if (amount <= 1) return this;

    const doubleTimes = amount >>> 1;
    const doubleResult = this.concat(this).repeat(doubleTimes);

    const remainTimes = amount % 2;
    if (remainTimes === 0) return doubleResult;
    return doubleResult.concat(this);
  }

  rotate(shiftRightAmount: number): List.NonEmpty<T> {
    let normalizedAmount = shiftRightAmount % this.length;

    if (normalizedAmount === 0) return this;

    if (normalizedAmount < 0) normalizedAmount += this.length;

    return this.take(-normalizedAmount)
      .concat(this.drop(-normalizedAmount))
      .assumeNonEmpty();
  }

  padTo(length: number, fill: T, positionPercentage = 0): List.NonEmpty<T> {
    if (this.length >= length) return this;

    const diff = length - this.length;
    const frac = Math.max(0, Math.min(100, positionPercentage)) / 100;
    const frontSize = Math.round(diff * frac);
    const pad = this.context.leafBlock([fill]).repeat(diff);
    return pad.splice({ index: frontSize, insert: this }).assumeNonEmpty();
  }

  filter(
    pred: (value: T, index: number, halt: () => void) => boolean,
    range?: IndexRange,
    reversed = false
  ): List<T> {
    const stream =
      undefined === range
        ? this.stream(reversed)
        : this.streamRange(range, reversed);

    const result: List<T> = this.context.from(stream.filter(pred));

    if (result.length !== this.length) return result;
    if (!reversed) return this;
    return this.reversed();
  }

  collect<T2>(
    collectFun: CollectFun<T, T2>,
    range?: IndexRange,
    reversed = false
  ): List<T2> {
    const stream =
      undefined === range
        ? this.stream(reversed)
        : this.streamRange(range, reversed);

    return this.context.from(stream.collect(collectFun));
  }

  flatMap<T2>(
    flatMapFun: (value: T, index: number) => StreamSource<T2>,
    range?: IndexRange,
    reversed = false
  ): List<T2> | any {
    let result = this.context.empty<T2>();

    const stream =
      undefined === range
        ? this.stream(reversed)
        : this.streamRange(range, reversed);
    const iterator = stream[Symbol.iterator]();

    let index = 0;
    const done = Symbol('Done');
    let value: T | typeof done;

    while (done !== (value = iterator.fastNext(done))) {
      result = result.concat(flatMapFun(value, index++));
    }

    return result;
  }

  toBuilder(): List.Builder<T> {
    return this.context.createBuilder<T>(this);
  }

  toString(): string {
    return this.stream().join({ start: 'List(', sep: ', ', end: ')' });
  }

  toJSON(): ToJSON<T[], this['context']['typeTag']> {
    return {
      dataType: this.context.typeTag,
      value: this.toArray(),
    };
  }

  extendType<T2>(): List.NonEmpty<SuperOf<T2, T>> {
    return this as any;
  }

  unzip<L extends number>(length: L): any {
    const streams = Stream.from(this).unzip(length) as any as Stream<any>[];

    return Stream.from(streams).mapPure(this.context.from);
  }

  flatten(): any {
    return this.flatMap((values: any) => values);
  }
}

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
    return new LeafBlock(this.context, children);
  }

  copy2<T2>(children: readonly T2[]): LeafBlock<T2> {
    return new LeafBlock(this.context, children);
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

  concat(...sources: ArrayNonEmpty<StreamSource<T>>): List.NonEmpty<T> {
    const asList: List<T> = this.context.from(...sources);

    if (asList.nonEmpty()) {
      if (this.context.isLeafBlock(asList)) return this.concatBlock(asList);
      if (this.context.isLeafTree(asList)) return this.concatTree(asList);
      RimbuError.throwInvalidStateError();
    }

    return this;
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

  reversed(): LeafBlock<T> {
    return this.context.reversedLeaf(this.children);
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
}

export class ReversedLeafBlock<T> extends LeafBlock<T> {
  copy(children: readonly T[]): LeafBlock<T> {
    if (children === this.children) return this;
    return new ReversedLeafBlock(this.context, children);
  }

  copy2<T2>(children: readonly T2[]): LeafBlock<T2> {
    return new ReversedLeafBlock(this.context, children);
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
    if (other instanceof ReversedLeafBlock) {
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

  reversed(): LeafBlock<T> {
    return this.context.leafBlock(this.children);
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

export class LeafTree<T>
  extends ListNonEmptyBase<T>
  implements Tree<T, LeafTree<T>, LeafBlock<T>, T>
{
  constructor(
    readonly context: ListContext,
    readonly left: LeafBlock<T>,
    readonly right: LeafBlock<T>,
    readonly middle: NonLeaf<T, LeafBlock<T>> | null,
    readonly length = left.length +
      right.length +
      (null === middle ? 0 : middle.length)
  ) {
    super();
  }

  getChildLength(): 1 {
    return 1;
  }

  copy(
    left = this.left,
    right = this.right,
    middle = this.middle
  ): LeafTree<T> {
    if (left === this.left && right === this.right && middle === this.middle)
      return this;
    return this.context.leafTree(left, right, middle);
  }

  copy2<T2>(
    left: LeafBlock<T2>,
    right: LeafBlock<T2>,
    middle: NonLeaf<T2, LeafBlock<T2>> | null
  ): LeafTree<T2> {
    return this.context.leafTree(left, right, middle);
  }

  stream(reversed = false): Stream.NonEmpty<T> {
    return treeStream<T, LeafTree<T>, LeafBlock<T>, T>(
      this,
      undefined,
      reversed
    ) as Stream.NonEmpty<T>;
  }

  streamRange(range: IndexRange, reversed = false): Stream<T> {
    return treeStream<T, LeafTree<T>, LeafBlock<T>, T>(this, range, reversed);
  }

  get<O>(index: number, otherwise?: OptLazy<O>): T | O {
    if (index >= this.length || -index > this.length) {
      return OptLazy(otherwise) as O;
    }
    if (index < 0) {
      return this.get(this.length + index, otherwise);
    }

    return treeGet<T, LeafTree<T>, LeafBlock<T>, T>(this, index);
  }

  prepend(value: T): LeafTree<T> {
    return treePrepend(this, value);
  }

  append(value: T): LeafTree<T> {
    return treeAppend(this, value);
  }

  prependMiddle(child: LeafBlock<T>): NonLeaf<T, LeafBlock<T>> {
    return (
      this.middle?.prepend(child) ??
      this.context.nonLeafBlock<T, LeafBlock<T>>(child.length, [child], 1)
    );
  }

  appendMiddle(child: LeafBlock<T>): NonLeaf<T, LeafBlock<T>> {
    return (
      this.middle?.append(child) ??
      this.context.nonLeafBlock<T, LeafBlock<T>>(child.length, [child], 1)
    );
  }

  take(amount: number): List<T> | any {
    if (amount === 0) return this.context.empty();
    if (amount >= this.length || -amount > this.length) return this;
    if (amount < 0) return this.drop(this.length + amount);

    const middleAmount = amount - this.left.length;

    if (middleAmount <= 0) return this.left.take(amount);

    if (null === this.middle) {
      return this.copy(
        undefined,
        this.right.takeChildren(middleAmount)
      )._normalize();
    }

    const rightAmount = middleAmount - this.middle.length;

    if (rightAmount > 0) {
      const newRight = this.right.takeChildren(rightAmount);
      return this.copy(undefined, newRight)._normalize();
    }

    const [newMiddle, upRight, inUpRight] =
      this.middle.takeInternal(middleAmount);

    const newRight = upRight.takeChildren(inUpRight);

    return this.copy(undefined, newRight, newMiddle)._normalize();
  }

  drop(amount: number): List<T> {
    if (amount === 0) return this;
    if (amount >= this.length || -amount > this.length)
      return this.context.empty();
    if (amount < 0) return this.take(this.length + amount);

    const middleAmount = amount - this.left.length;

    if (middleAmount < 0) {
      const newLeft = this.left.dropChildren(amount);
      return this.copy(newLeft)._normalize();
    }

    if (null === this.middle) {
      return this.right.drop(middleAmount);
    }

    const rightAmount = middleAmount - this.middle.length;

    if (rightAmount >= 0) {
      return this.right.drop(rightAmount);
    }

    const [newMiddle, upLeft, inUpLeft] =
      this.middle.dropInternal(middleAmount);
    const newLeft = upLeft.dropChildren(inUpLeft);

    return this.copy(newLeft, undefined, newMiddle)._normalize();
  }

  concat(...sources: ArrayNonEmpty<StreamSource<T>>): List.NonEmpty<T> {
    const asList: List<T> = this.context.from(...sources);

    if (asList.nonEmpty()) {
      if (this.context.isLeafBlock(asList)) return this.concatBlock(asList);
      else if (this.context.isLeafTree(asList)) return this.concatTree(asList);
      else RimbuError.throwInvalidStateError();
    }

    return this;
  }

  concatBlock(other: LeafBlock<T>): List.NonEmpty<T> {
    if (this.right.length + other.length <= this.context.maxBlockSize) {
      const newRight = this.right.concatChildren(other);
      return this.copy(undefined, newRight);
    }

    if (this.right.childrenInMin) {
      const newMiddle = this.appendMiddle(this.right);

      return this.copy(undefined, other, newMiddle);
    }

    const newRight = this.right.concatChildren(other);
    const newLast = newRight._mutateSplitRight(this.context.maxBlockSize);
    const newMiddle = this.appendMiddle(newRight);

    return this.copy(undefined, newLast, newMiddle);
  }

  concatTree(other: LeafTree<T>): LeafTree<T> {
    const jointLength = this.right.length + other.left.length;

    if (jointLength < this.context.minBlockSize) {
      if (null === this.middle) {
        // left + right > maxBlockSize
        const joint = this.left
          .concatChildren(this.right)
          .concatChildren(other.left);
        const toMiddle = joint._mutateSplitRight();
        const newMiddle = other.prependMiddle(toMiddle);

        return other.copy(joint, undefined, newMiddle);
      }

      const [newMiddle, toJoint] = this.middle.dropLast();
      const joint = toJoint
        .concatChildren(this.right)
        .concatChildren(other.left);

      if (joint.childrenInMax) {
        const m =
          null === newMiddle
            ? other.prependMiddle(joint)
            : newMiddle.concat(other.prependMiddle(joint));
        return this.copy(undefined, other.right, m);
      }

      const newOtherLeft = joint._mutateSplitRight();
      const newMiddle2 =
        null === newMiddle
          ? other.prependMiddle(newOtherLeft).prepend(joint)
          : null === other.middle
          ? newMiddle.append(joint).append(newOtherLeft)
          : newMiddle.append(joint).append(newOtherLeft).concat(other.middle);
      return this.copy(undefined, other.right, newMiddle2);
    }

    if (jointLength <= this.context.maxBlockSize) {
      const joint = this.right.concatChildren(other.left);
      const newThisMiddle = this.appendMiddle(joint);
      const newMiddle =
        null === other.middle
          ? newThisMiddle
          : newThisMiddle.concat(other.middle);
      return this.copy(undefined, other.right, newMiddle);
    }

    if (this.right.childrenInMin && other.left.childrenInMin) {
      const newThisMiddle = this.appendMiddle(this.right).append(other.left);
      const newMiddle =
        null === other.middle
          ? newThisMiddle
          : newThisMiddle.concat(other.middle);

      return this.copy(undefined, other.right, newMiddle);
    }

    const joint = this.right.concatChildren(other.left);
    const jointRight = joint._mutateSplitRight();

    const newThisMiddle = this.appendMiddle(joint).append(jointRight);
    const newMiddle =
      null === other.middle
        ? newThisMiddle
        : newThisMiddle.concat(other.middle);

    return this.copy(undefined, other.right, newMiddle);
  }

  updateAt(index: number, update: Update<T>): LeafTree<T> {
    if (index >= this.length || -index > this.length) return this;
    if (index < 0) return this.updateAt(this.length + index, update);

    return treeUpdate<T, LeafTree<T>, LeafBlock<T>, T>(this, index, update);
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    if (state.halted) return;

    treeForEach<T, LeafTree<T>, LeafBlock<T>, T>(this, f, state);
  }

  map<T2>(
    mapFun: (value: T, index: number) => T2,
    reversed = false,
    indexOffset = 0
  ): LeafTree<T2> {
    let offset = indexOffset;

    if (reversed) {
      const newLeft = this.right.map(mapFun, true, offset);
      offset += this.right.length;

      const newMiddle =
        null === this.middle ? null : this.middle.map(mapFun, true, offset);
      if (null !== this.middle) offset += this.middle.length;

      const newRight = this.left.map(mapFun, true, offset);

      return this.copy2(newLeft, newRight, newMiddle);
    }

    const newLeft = this.left.map(mapFun, false, offset);
    offset += this.left.length;

    const newMiddle =
      null === this.middle ? null : this.middle.map(mapFun, false, offset);

    if (null !== this.middle) offset += this.middle.length;

    const newRight = this.right.map(mapFun, false, offset);

    return this.copy2(newLeft, newRight, newMiddle);
  }

  reversed(): LeafTree<T> {
    return this.copy(
      this.right.reversed(),
      this.left.reversed(),
      null === this.middle ? null : this.middle.reversed()
    );
  }

  toArray(range?: IndexRange, reversed = false): T[] | any {
    return treeToArray<T, LeafTree<T>, LeafBlock<T>, T>(this, range, reversed);
  }

  _normalize(): List.NonEmpty<T> {
    if (null !== this.middle) {
      if (this.left.length + this.middle.length <= this.context.maxBlockSize) {
        const result = this.middle.dropFirst();
        const block = result[1];
        return this.copy(this.left.concatChildren(block), undefined, null);
      }
      if (this.right.length + this.middle.length <= this.context.maxBlockSize) {
        const result = this.middle.dropFirst();
        const block = result[1];
        return this.copy(undefined, block.concatChildren(this.right), null);
      }
    }
    if (this.length > this.context.maxBlockSize) return this;
    if (null === this.middle) return this.left.concatChildren(this.right);
    if (this.context.isNonLeafBlock(this.middle)) {
      const children = this.left.children.concat(
        this.middle.getChild(0).children,
        this.right.children
      );
      return this.left.copy(children);
    }

    RimbuError.throwInvalidStateError();
  }

  structure(): string {
    return `<LeafTree len:${this.length}\n l:${this.left.structure()}\n m: ${
      this.middle && this.middle.structure()
    }\n r:${this.right.structure()}\n>`;
  }
}
