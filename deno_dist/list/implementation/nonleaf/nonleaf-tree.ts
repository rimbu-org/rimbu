import { RimbuError } from '../../../base/mod.ts';
import type { IndexRange, TraverseState, Update } from '../../../common/mod.ts';
import type { Stream } from '../../../stream/mod.ts';
import type {
  Block,
  ListContext,
  NonLeaf,
  NonLeafBlock,
  Tree,
} from '../../list-custom.ts';
import {
  treeAppend,
  treeForEach,
  treeGet,
  treePrepend,
  treeStream,
  treeToArray,
  treeUpdate,
} from '../../list-custom.ts';

export class NonLeafTree<T, C extends Block<T, C>>
  implements Tree<T, NonLeafTree<T, C>, NonLeafBlock<T, C>, C>, NonLeaf<T>
{
  constructor(
    readonly context: ListContext,
    readonly left: NonLeafBlock<T, C>,
    readonly right: NonLeafBlock<T, C>,
    readonly middle: NonLeaf<T, NonLeafBlock<T, C>> | null,
    readonly level: number,
    readonly length = left.length +
      right.length +
      (null === middle ? 0 : middle.length)
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
    return new NonLeafTree(this.context, left, right, middle, this.level);
  }

  copy2<T2, C2 extends Block<T2, C2>>(
    left: NonLeafBlock<T2, C2>,
    right: NonLeafBlock<T2, C2>,
    middle: NonLeaf<T2, NonLeafBlock<T2, C2>> | null
  ): NonLeafTree<T2, C2> {
    return new NonLeafTree(this.context, left, right, middle, this.level);
  }

  stream(reversed = false): Stream.NonEmpty<T> {
    return treeStream(this, undefined, reversed) as Stream.NonEmpty<T>;
  }

  streamRange(range: IndexRange, reversed = false): Stream<T> {
    return treeStream(this, range, reversed);
  }

  get(index: number): T {
    return treeGet(this, index);
  }

  prepend(child: C): NonLeaf<T, C> {
    return treePrepend(this, child);
  }

  append(child: C): NonLeafTree<T, C> {
    return treeAppend(this, child);
  }

  prependMiddle(child: NonLeafBlock<T, C>): NonLeaf<T, NonLeafBlock<T, C>> {
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
      if (null === this.middle) return [this.right, firstChild];

      const [newMiddle, toLeft] = this.middle.dropFirst();
      const newSelf = this.copy(toLeft, undefined, newMiddle)._normalize();

      return [newSelf, firstChild];
    }

    const newSelf = this.copy(newLeft)._normalize();

    return [newSelf, firstChild];
  }

  dropLast(): [NonLeaf<T, C> | null, C] {
    const [newRight, lastChild] = this.right.dropLast();

    if (null === newRight) {
      if (null === this.middle) return [this.left, lastChild];

      const [newMiddle, toRight] = this.middle.dropLast();
      const newSelf = this.copy(undefined, toRight, newMiddle)._normalize();

      return [newSelf, lastChild];
    }

    const newSelf = this.copy(undefined, newRight)._normalize();

    return [newSelf, lastChild];
  }

  takeInternal(amount: number): [NonLeaf<T, C> | null, C, number] {
    const middleAmount = amount - this.left.length;

    if (middleAmount <= 0) {
      return this.left.takeInternal(amount);
    }

    if (null === this.middle) {
      const [newRight, up, upAmount] = this.right.takeInternal(middleAmount);

      if (null === newRight) return [this.left, up, upAmount];

      return [this.left.concat(newRight), up, upAmount];
    }

    const rightAmount = middleAmount - this.middle.length;

    if (rightAmount > 0) {
      const [newRight, up, upAmount] = this.right.takeInternal(rightAmount);

      if (null === newRight) {
        const [newMiddle, toRight] = this.middle.dropLast();
        const newSelf = this.copy(undefined, toRight, newMiddle)._normalize();

        return [newSelf, up, upAmount];
      }

      const newSelf = this.copy(undefined, newRight)._normalize();

      return [newSelf, up, upAmount];
    }

    const [newMiddle, upRight] = this.middle.takeInternal(middleAmount);

    const newSelf = this.copy(undefined, upRight, newMiddle)._normalize();
    return newSelf.takeInternal(amount);
  }

  dropInternal(amount: number): [NonLeaf<T, C> | null, C, number] {
    const middleAmount = amount - this.left.length;

    if (null === this.middle) {
      if (middleAmount < 0) {
        const [newLeft, upLeft, upLeftAmount] = this.left.dropInternal(amount);

        const newSelf =
          null === newLeft ? this.right : newLeft.concat(this.right);

        return [newSelf, upLeft, upLeftAmount];
      } else {
        return this.right.dropInternal(middleAmount);
      }
    }

    if (middleAmount < 0) {
      const [newLeft, upLeft, upLeftAmount] = this.left.dropInternal(amount);

      if (null === newLeft) {
        const [newMiddle, toLeft] = this.middle.dropFirst();
        const newSelf = this.copy(toLeft, undefined, newMiddle)._normalize();

        return [newSelf, upLeft, upLeftAmount];
      }

      const newSelf = this.copy(newLeft);

      return [newSelf, upLeft, upLeftAmount];
    }

    const rightAmount = middleAmount - this.middle.length;

    if (rightAmount >= 0) {
      return this.right.dropInternal(rightAmount);
    }

    const [newMiddle, upLeft, inUpLeft] =
      this.middle.dropInternal(middleAmount);
    const newSelf = this.copy(upLeft, undefined, newMiddle)._normalize();

    return newSelf.dropInternal(inUpLeft);
  }

  concat<T2>(other: NonLeaf<T2, C>): NonLeaf<T | T2, C> {
    if (this.context.isNonLeafBlock(other))
      return (this as any).concatBlock(other);
    if (this.context.isNonLeafTree(other))
      return (this as any).concatTree(other);

    RimbuError.throwInvalidStateError();
  }

  concatBlock(other: NonLeafBlock<T, C>): NonLeaf<T, C> {
    if (this.right.nrChildren + other.nrChildren <= this.context.maxBlockSize) {
      const newRight = this.right.concatChildren(other);

      return this.copy(undefined, newRight);
    }

    if (this.right.childrenInMin) {
      const newMiddle = this.appendMiddle(this.right);

      return this.copy(undefined, other, newMiddle)._normalize();
    }

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
      const joint = this.right.concatChildren(other.left);

      const newThisMiddle = this.appendMiddle(joint);
      const newMiddle =
        null === other.middle
          ? newThisMiddle
          : newThisMiddle.concat(other.middle);

      return this.copy(undefined, other.right, newMiddle)._normalize();
    }

    if (this.right.childrenInMin && other.left.childrenInMin) {
      const newThisMiddle = this.appendMiddle(this.right).append(other.left);
      const newMiddle =
        null === other.middle
          ? newThisMiddle
          : newThisMiddle.concat(other.middle);

      return this.copy(undefined, other.right, newMiddle)._normalize();
    }

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
    state: TraverseState
  ): void {
    if (state.halted) return;

    treeForEach(this, f, state);
  }

  map<T2>(
    mapFun: (value: T, index: number) => T2,
    reversed = false,
    indexOffset = 0
  ): NonLeafTree<T2, any> {
    let offset = indexOffset;

    const left = this.left;
    const middle = this.middle;
    const right = this.right;

    if (reversed) {
      const newLeft = right.map(mapFun, true, offset);
      offset += right.length;

      const newMiddle =
        null === middle ? null : middle.map(mapFun, true, offset);
      if (null !== middle) offset += middle.length;

      const newRight = left.map(mapFun, true, offset);

      return this.copy2(newLeft, newRight, newMiddle);
    }

    const newLeft = left.map(mapFun, false, offset);
    offset += left.length;

    const newMiddle =
      null === middle ? null : middle.map(mapFun, false, offset);
    if (null !== middle) offset += middle.length;

    const newRight = right.map(mapFun, false, offset);

    return this.copy2(newLeft, newRight, newMiddle);
  }

  reversed(): NonLeafTree<T, C> {
    return this.copy(
      this.right.reversed(),
      this.left.reversed(),
      null === this.middle ? null : this.middle.reversed()
    );
  }

  _normalize(): NonLeaf<T, C> {
    const leftRightNrChildren = this.left.nrChildren + this.right.nrChildren;
    if (leftRightNrChildren > this.context.maxBlockSize) return this;

    if (null === this.middle) return this.left.concat(this.right);

    if (
      this.context.isNonLeafBlock(this.middle) &&
      this.middle.nrChildren === 1
    ) {
      const tMiddle: NonLeafBlock<T, NonLeafBlock<T, C>> = this.middle;
      const middleChild = tMiddle.children[0];
      if (
        leftRightNrChildren + middleChild.nrChildren <=
        this.context.maxBlockSize
      ) {
        return this.left.concat(middleChild).concat(this.right);
      }
    }

    return this;
  }

  toArray(range?: IndexRange, reversed = false): T[] | any {
    return treeToArray(this, range, reversed);
  }

  structure(): string {
    const space = ' '.padEnd(this.level * 2);
    return `\n${space}<NLTree len:${
      this.length
    }\n  l:${this.left.structure()}\n  m:${
      this.middle && this.middle.structure()
    }\n  r:${this.right.structure()}\n>`;
  }
}
