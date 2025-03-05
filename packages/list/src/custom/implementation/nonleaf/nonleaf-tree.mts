import { RimbuError } from '@rimbu/base';
import type { IndexRange, TraverseState, Update } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';

import type {
  Block,
  BlockBuilder,
  CacheMap,
  ListContext,
  NonLeaf,
  NonLeafBlock,
  NonLeafBuilder,
  Tree,
} from '@rimbu/list/custom';
import {
  treeAppend,
  treeForEach,
  treeGet,
  treePrepend,
  treeStream,
  treeToArray,
  treeUpdate,
} from '../tree/operations.mjs';

export class NonLeafTree<T, C extends Block<T, C>>
  implements Tree<T, NonLeafTree<T, C>, NonLeafBlock<T, C>, C>, NonLeaf<T>
{
  constructor(
    readonly context: ListContext,
    readonly left: NonLeafBlock<T, C>,
    readonly right: NonLeafBlock<T, C>,
    readonly middle: NonLeaf<T, NonLeafBlock<T, C>> | null,
    readonly level: number,
    readonly length: number = left.length + right.length + (middle?.length ?? 0)
  ) {}

  getChildLength(child: C): number {
    return child.length;
  }

  copy(
    left = this.left,
    right = this.right,
    middle = this.middle
  ): NonLeafTree<T, C> {
    if (left === this.left && right === this.right && middle === this.middle) {
      return this;
    }

    return this.context.nonLeafTree(left, right, middle, this.level);
  }

  copy2<T2, C2 extends Block<T2, C2>>(
    left: NonLeafBlock<T2, C2>,
    right: NonLeafBlock<T2, C2>,
    middle: NonLeaf<T2, NonLeafBlock<T2, C2>> | null
  ): NonLeafTree<T2, C2> {
    return this.context.nonLeafTree(left, right, middle, this.level);
  }

  stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
    const { reversed = false } = options;

    return treeStream(this, undefined, reversed) as Stream.NonEmpty<T>;
  }

  streamRange(
    range: IndexRange,
    options: { reversed?: boolean } = {}
  ): Stream<T> {
    const { reversed = false } = options;

    return treeStream(this, range, reversed);
  }

  get(index: number): T {
    return treeGet(this, index);
  }

  prepend(child: C): NonLeafTree<T, C> {
    return treePrepend(this, child);
  }

  append(child: C): NonLeafTree<T, C> {
    return treeAppend(this, child);
  }

  prependMiddle(child: NonLeafBlock<T, C>): NonLeaf<T, NonLeafBlock<T, C>> {
    if (child.level !== this.level) {
      RimbuError.throwInvalidStateError();
    }

    return (
      this.middle?.prepend(child) ??
      this.context.nonLeafBlock<T, NonLeafBlock<T, C>>(
        child.length,
        [child],
        this.level + 1
      )
    );
  }

  appendMiddle(child: NonLeafBlock<T, C>): NonLeaf<T, NonLeafBlock<T, C>> {
    if (child.level !== this.level) {
      RimbuError.throwInvalidStateError();
    }

    return (
      this.middle?.append(child) ??
      this.context.nonLeafBlock<T, NonLeafBlock<T, C>>(
        child.length,
        [child],
        this.level + 1
      )
    );
  }

  dropFirst(): [NonLeaf<T, C> | null, C] {
    const [newLeft, firstChild] = this.left.dropFirst();

    if (null === newLeft) {
      if (null === this.middle) {
        return [this.right, firstChild];
      }

      const [newMiddle, toLeft] = this.middle.dropFirst();
      const newSelf = this.copy(toLeft, undefined, newMiddle)._normalize();

      return [newSelf, firstChild];
    }

    const newSelf = this.copy(newLeft)._normalize();

    return [newSelf, firstChild];
  }

  dropLast(): [NonLeaf<T, C> | null, C] {
    // drop last from the right block
    const [newRight, lastChild] = this.right.dropLast();

    if (null === newRight) {
      if (null === this.middle) {
        // drop right
        return [this.left, lastChild];
      }

      // move last middle to right
      const [newMiddle, toRight] = this.middle.dropLast();
      const newSelf = this.copy(undefined, toRight, newMiddle)._normalize();

      return [newSelf, lastChild];
    }

    // set the new right to right
    const newSelf = this.copy(undefined, newRight)._normalize();

    return [newSelf, lastChild];
  }

  takeInternal(amount: number): [NonLeaf<T, C> | null, C, number] {
    const middleAmount = amount - this.left.length;

    if (middleAmount <= 0) {
      // only left remains
      return this.left.takeInternal(amount);
    }

    if (null === this.middle) {
      // update with take from right, no middle
      const [newRight, up, upAmount] = this.right.takeInternal(middleAmount);

      if (null === newRight) {
        // no right remains
        return [this.left, up, upAmount];
      }

      // combine left with remaining right
      return [this.left.concat(newRight), up, upAmount];
    }

    const rightAmount = middleAmount - this.middle.length;

    if (rightAmount > 0) {
      const [newRight, up, upAmount] = this.right.takeInternal(rightAmount);

      if (null === newRight) {
        // no right remains, move last middle up
        const [newMiddle, toRight] = this.middle.dropLast();
        const newSelf = this.copy(undefined, toRight, newMiddle)._normalize();

        return [newSelf, up, upAmount];
      }

      // some right remains, update and normalize
      const newSelf = this.copy(undefined, newRight)._normalize();

      return [newSelf, up, upAmount];
    }

    // take from middle
    const [newMiddle, upRight] = this.middle.takeInternal(middleAmount);

    const newSelf = this.copy(undefined, upRight, newMiddle)._normalize();
    return newSelf.takeInternal(amount);
  }

  dropInternal(amount: number): [NonLeaf<T, C> | null, C, number] {
    const middleAmount = amount - this.left.length;

    if (null === this.middle) {
      if (middleAmount < 0) {
        // drop only from left no middle
        const [newLeft, upLeft, upLeftAmount] = this.left.dropInternal(amount);

        const newSelf =
          null === newLeft ? this.right : newLeft.concat(this.right);

        return [newSelf, upLeft, upLeftAmount];
      } else {
        // drop only from right
        return this.right.dropInternal(middleAmount);
      }
    }

    if (middleAmount < 0) {
      // drop only from left with middle
      const [newLeft, upLeft, upLeftAmount] = this.left.dropInternal(amount);

      if (null === newLeft) {
        // all of left gone
        const [newMiddle, toLeft] = this.middle.dropFirst();
        const newSelf = this.copy(toLeft, undefined, newMiddle)._normalize();

        return [newSelf, upLeft, upLeftAmount];
      }

      // left remaining
      const newSelf = this.copy(newLeft);

      return [newSelf, upLeft, upLeftAmount];
    }

    const rightAmount = middleAmount - this.middle.length;

    if (rightAmount >= 0) {
      // drop only from right
      return this.right.dropInternal(rightAmount);
    }

    // drop from middle
    const [newMiddle, upLeft, inUpLeft] =
      this.middle.dropInternal(middleAmount);
    const newSelf = this.copy(upLeft, undefined, newMiddle)._normalize();

    return newSelf.dropInternal(inUpLeft);
  }

  concat<T2>(other: NonLeaf<T2, C>): NonLeaf<T | T2, C> {
    if (this.context.isNonLeafBlock(other)) {
      return (this as any).concatBlock(other);
    }
    if (this.context.isNonLeafTree(other)) {
      return (this as any).concatTree(other);
    }

    RimbuError.throwInvalidStateError();
  }

  concatBlock(other: NonLeafBlock<T, C>): NonLeaf<T, C> {
    if (other.level !== this.level) {
      RimbuError.throwInvalidStateError();
    }

    if (this.right.nrChildren + other.nrChildren <= this.context.maxBlockSize) {
      // append to right
      const newRight = this.right.concatChildren(other);

      return this.copy(undefined, newRight);
    }

    if (this.right.childrenInMin) {
      // move current right to middle
      const newMiddle = this.appendMiddle(this.right);

      return this.copy(undefined, other, newMiddle)._normalize();
    }

    // split new right
    const newRight = this.right.concatChildren(other);
    const newLast = newRight._mutateSplitRight(this.context.maxBlockSize);
    const newMiddle = this.appendMiddle(newRight);

    return this.copy(undefined, newLast, newMiddle)._normalize();
  }

  concatTree(other: NonLeafTree<T, C>): NonLeaf<T, C> {
    if (
      this.right.nrChildren + other.left.nrChildren <=
      this.context.maxBlockSize
    ) {
      // merge right and left
      const joint = this.right.concatChildren(other.left);

      const newThisMiddle = this.appendMiddle(joint);
      const newMiddle =
        null === other.middle
          ? newThisMiddle
          : newThisMiddle.concat(other.middle);

      return this.copy(undefined, other.right, newMiddle)._normalize();
    }

    if (this.right.childrenInMin && other.left.childrenInMin) {
      // append both
      const newThisMiddle = this.appendMiddle(this.right).append(other.left);
      const newMiddle =
        null === other.middle
          ? newThisMiddle
          : newThisMiddle.concat(other.middle);

      return this.copy(undefined, other.right, newMiddle)._normalize();
    }

    // merge and split
    const joint = this.right.concatChildren(other.left);
    const jointRight = joint._mutateSplitRight();

    const newThisMiddle = this.appendMiddle(joint).append(jointRight);
    const newMiddle =
      null === other.middle
        ? newThisMiddle
        : newThisMiddle.concat(other.middle);

    return this.copy(undefined, other.right, newMiddle)._normalize();
  }

  updateAt(index: number, update: Update<T>): NonLeafTree<T, C> {
    return treeUpdate<T, NonLeafTree<T, C>, NonLeafBlock<T, C>, C>(
      this,
      index,
      update
    );
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    options: { reversed: boolean; state: TraverseState }
  ): void {
    const { state } = options;

    if (state.halted) return;

    treeForEach(this, f, options);
  }

  mapPure<T2>(
    mapFun: (value: T) => T2,
    options: { reversed?: boolean; cacheMap?: CacheMap } = {}
  ): NonLeafTree<T2, any> {
    const { reversed = false, cacheMap = this.context.createCacheMap() } =
      options;

    const cachedThis = cacheMap.get(this);
    if (cachedThis) return cachedThis;

    const mappedLeft = this.left.mapPure(mapFun, { reversed, cacheMap });
    const mappedMiddle =
      null === this.middle
        ? null
        : this.middle.mapPure(mapFun, { reversed, cacheMap });
    const mappedRight = this.right.mapPure(mapFun, { reversed, cacheMap });

    const result = reversed
      ? this.copy2(mappedRight, mappedLeft, mappedMiddle)
      : this.copy2(mappedLeft, mappedRight, mappedMiddle);

    return cacheMap.setAndReturn(this, result);
  }

  map<T2>(
    mapFun: (value: T, index: number) => T2,
    options: { reversed?: boolean; indexOffset?: number } = {}
  ): NonLeafTree<T2, any> {
    const { reversed = false, indexOffset = 0 } = options;

    let offset = indexOffset;

    const left = this.left;
    const middle = this.middle;
    const right = this.right;

    if (reversed) {
      const newLeft = right.map(mapFun, {
        reversed: true,
        indexOffset: offset,
      });
      offset += right.length;

      const newMiddle =
        null === middle
          ? null
          : middle.map(mapFun, { reversed: true, indexOffset: offset });
      if (null !== middle) offset += middle.length;

      const newRight = left.map(mapFun, {
        reversed: true,
        indexOffset: offset,
      });

      return this.copy2(newLeft, newRight, newMiddle);
    }

    const newLeft = left.map(mapFun, { indexOffset: offset });
    offset += left.length;

    const newMiddle =
      null === middle ? null : middle.map(mapFun, { indexOffset: offset });
    if (null !== middle) offset += middle.length;

    const newRight = right.map(mapFun, { indexOffset: offset });

    return this.copy2(newLeft, newRight, newMiddle);
  }

  reversed(
    cacheMap: CacheMap = this.context.createCacheMap()
  ): NonLeafTree<T, C> {
    const cachedThis = cacheMap.get(this);
    if (cachedThis !== undefined) return cachedThis;

    const newMid = this.middle?.reversed(cacheMap) ?? null;
    const newLeft = this.right.reversed(cacheMap);
    const newRight =
      this.left === this.right ? newLeft : this.left.reversed(cacheMap);

    const reversedThis = this.copy(newLeft, newRight, newMid);
    return cacheMap.setAndReturn(this, reversedThis);
  }

  _normalize(): NonLeaf<T, C> {
    if (null === this.middle) {
      if (
        this.left.nrChildren + this.right.nrChildren <=
        this.context.maxBlockSize
      ) {
        // can merge left and right
        return this.left.concatChildren(this.right);
      }
    } else if (this.context.isNonLeafBlock(this.middle)) {
      const firstChild = this.middle.getChild(0);

      if (
        this.left.nrChildren + firstChild.nrChildren <=
        this.context.maxBlockSize
      ) {
        // first middle child can be merged with left
        const result = this.middle.dropFirst();
        const newMiddle = result[0];
        const block = result[1];
        return this.copy(this.left.concatChildren(block), undefined, newMiddle);
      }

      const lastChild = this.middle.getChild(this.middle.nrChildren - 1);

      if (
        this.right.nrChildren + lastChild.nrChildren <=
        this.context.maxBlockSize
      ) {
        // last middle child can be merged with right
        const result = this.middle.dropLast();
        const newMiddle = result[0];
        const block = result[1];
        return this.copy(
          undefined,
          block.concatChildren(this.right),
          newMiddle
        );
      }
    }

    return this;
  }

  toArray(
    options: { range?: IndexRange | undefined; reversed?: boolean } = {}
  ): T[] | any {
    const { range, reversed = false } = options;

    return treeToArray(this, range, reversed);
  }

  structure(): string {
    const space = ' '.padEnd(this.level * 2);
    return `\n${space}<NLTree(${this.level}) len:${
      this.length
    }\n  l:${this.left.structure()}\n  m:${
      this.middle && this.middle.structure()
    }\n  r:${this.right.structure()}\n>`;
  }

  createNonLeafBuilder(): NonLeafBuilder<T, BlockBuilder<T, unknown>> {
    return this.context.nonLeafTreeBuilderSource(this);
  }
}
