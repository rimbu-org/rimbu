import { Arr, RimbuError } from '../../../../base/mod.ts';
import { IndexRange, TraverseState, Update } from '../../../../common/mod.ts';
import { Stream } from '../../../../stream/mod.ts';

import type {
  Block,
  BlockBuilder,
  ListContext,
  NonLeaf,
  NonLeafBuilder,
  NonLeafTree,
} from '../../../../list/custom/index.ts';

export class NonLeafBlock<T, C extends Block<T, C>>
  implements Block<T, NonLeafBlock<T, C>, C>, NonLeaf<T, Block<T>>
{
  constructor(
    readonly context: ListContext,
    public _length: number,
    readonly children: readonly C[],
    readonly level: number
  ) {}

  get length(): number {
    return this._length;
  }

  set length(value: number) {
    this._length = value;
  }

  get nrChildren(): number {
    return this.children.length;
  }

  get mutateChildren(): C[] {
    return this.children as C[];
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

  copy(children: readonly C[], length = this.length): NonLeafBlock<T, C> {
    if (children === this.children && length === this.length) return this;
    return this.context.nonLeafBlock(length, children, this.level);
  }

  copy2<T2, C2 extends Block<T2, C2>>(
    children: readonly C2[],
    length = this.length
  ): NonLeafBlock<T2, C2> {
    return this.context.nonLeafBlock(length, children, this.level);
  }

  stream(reversed = false): Stream.NonEmpty<T> {
    return Stream.fromArray(this.children, undefined, reversed).flatMap(
      (child): Stream.NonEmpty<T> => child.stream(reversed)
    ) as Stream.NonEmpty<T>;
  }

  streamRange(range: IndexRange, reversed = false): Stream<T> {
    const indexRange = IndexRange.getIndicesFor(range, this.length);

    if (indexRange === 'all') {
      return Stream.fromArray(this.children, undefined, reversed).flatMap(
        (child): Stream.NonEmpty<T> => child.stream(reversed)
      ) as Stream.NonEmpty<T>;
    }

    if (indexRange === 'empty') return Stream.empty();

    const [start, end] = indexRange;

    const [startChildIndex, inStartChildIndex] = this.getCoordinates(
      start,
      false,
      true
    );
    const [endChildIndex, inEndChildIndex] = this.getCoordinates(
      end,
      false,
      true
    );

    if (startChildIndex === endChildIndex) {
      const child = this.children[startChildIndex];

      return child.streamRange(
        {
          start: inStartChildIndex,
          end: inEndChildIndex,
        },
        reversed
      );
    }

    const startChild = this.children[startChildIndex];
    const endChild = this.children[endChildIndex];
    const childStream = Stream.fromArray(
      this.children,
      { start: startChildIndex, end: endChildIndex },
      reversed
    );

    return childStream.flatMap((child): Stream<T> => {
      if (child === startChild)
        return child.streamRange({ start: inStartChildIndex }, reversed);
      if (child === endChild)
        return child.streamRange({ end: inEndChildIndex }, reversed);
      return child.stream(reversed);
    });
  }

  get(index: number): T {
    const [childIndex, inChildIndex] = this.getCoordinates(index, false, false);

    return this.getChild(childIndex).get(
      inChildIndex,
      RimbuError.throwInvalidStateError
    );
  }

  prepend(child: C): NonLeaf<T, C> {
    if (this.canAddChild) return this.prependInternal(child);

    return this.context.nonLeafTree(
      this.copy([child], child.length),
      this,
      null,
      this.level
    );
  }

  append(child: C): NonLeaf<T, C> {
    if (this.canAddChild) return this.appendInternal(child);

    return this.context.nonLeafTree(
      this,
      this.copy([child], child.length),
      null,
      this.level
    );
  }

  dropFirst(): [NonLeafBlock<T, C> | null, C] {
    const firstChild = this.children[0];

    if (this.nrChildren === 1) return [null, firstChild];

    const newChildren = Arr.tail(this.children);
    const newLength = this.length - firstChild.length;
    const newSelf = this.copy(newChildren, newLength);

    return [newSelf, firstChild];
  }

  dropLast(): [NonLeafBlock<T, C> | null, C] {
    const lastChild = Arr.last(this.children);

    if (this.nrChildren === 1) return [null, lastChild];

    const newChildren = Arr.init(this.children);
    const newLength = this.length - lastChild.length;
    const newSelf = this.copy(newChildren, newLength);

    return [newSelf, lastChild];
  }

  concat<T2>(other: NonLeaf<T2, C>): NonLeaf<T | T2, C> {
    if (other.context.isNonLeafBlock<any>(other)) {
      if (other === this && this.children.length > this.context.minBlockSize) {
        return this.context.nonLeafTree<T | T2, any>(
          this as any,
          this as any,
          null,
          this.level
        );
      }

      return (this as any).concatBlock(other);
    }
    if (this.context.isNonLeafTree(other)) {
      return (this as any).concatTree(other);
    }

    RimbuError.throwInvalidStateError();
  }

  concatBlock(other: NonLeafBlock<T, C>): NonLeaf<T, C> {
    return this.concatChildren(other)._mutateNormalize();
  }

  concatTree(other: NonLeafTree<T, C>): NonLeaf<T, C> {
    if (this.nrChildren + other.left.nrChildren <= this.context.maxBlockSize) {
      const newLeft = this.concatChildren(other.left)._mutateRebalance();

      return other.copy(newLeft);
    }

    if (other.left.childrenInMin) {
      const newMiddle = other.prependMiddle(other.left);

      return other.copy(this, undefined, newMiddle);
    }

    const newLeft = this.concatChildren(other.left)._mutateRebalance();
    if (newLeft.childrenInMax) return other.copy(newLeft);

    const newSecond = newLeft._mutateSplitRight(
      newLeft.nrChildren - this.context.maxBlockSize
    );
    const newMiddle = other.prependMiddle(newSecond);

    return other.copy(newLeft, undefined, newMiddle);
  }

  prependInternal(child: C): NonLeafBlock<T, C> {
    const newChildren = Arr.prepend(this.children, child);
    return this.copy(newChildren, this.length + child.length);
  }

  appendInternal(child: C): NonLeafBlock<T, C> {
    const newChildren = Arr.append(this.children, child);
    return this.copy(newChildren, this.length + child.length);
  }

  takeChildren(childAmount: number): NonLeafBlock<T, C> | null {
    if (childAmount <= 0) return null;
    if (childAmount >= this.nrChildren) return this;

    const newChildren = Arr.splice(
      this.children,
      childAmount,
      this.context.maxBlockSize
    );

    const length = newChildren.reduce((l, c): number => l + c.length, 0);

    return this.copy(newChildren, length);
  }

  dropChildren(childAmount: number): NonLeafBlock<T, C> | null {
    if (childAmount <= 0) {
      return this;
    }
    if (childAmount >= this.nrChildren) {
      return null;
    }

    const newChildren = Arr.splice(this.children, 0, childAmount);

    const length = newChildren.reduce((l, c): number => l + c.length, 0);

    return this.copy(newChildren, length);
  }

  concatChildren(other: NonLeafBlock<T, C>): NonLeafBlock<T, C> {
    const newChildren = Arr.concat(this.children, other.children);

    return this.copy(newChildren, this.length + other.length); //._mutateRebalance();
  }

  takeInternal(amount: number): [NonLeafBlock<T, C> | null, C, number] {
    const [childIndex, inChildIndex] = this.getCoordinates(amount, true, false);

    if (childIndex >= this.nrChildren) {
      RimbuError.throwInvalidStateError();
    }

    const lastChild = this.getChild(childIndex);
    const newSelf = this.takeChildren(childIndex);

    return [newSelf, lastChild, inChildIndex];
  }

  // return remainer, first new child, and index in new child
  dropInternal(amount: number): [NonLeafBlock<T, C> | null, C, number] {
    const [childIndex, inChildIndex] = this.getCoordinates(
      amount,
      false,
      false
    );

    if (childIndex >= this.nrChildren) {
      RimbuError.throwInvalidStateError();
    }

    const firstChild = this.getChild(childIndex);
    const newSelf = this.dropChildren(childIndex + 1);

    return [newSelf, firstChild, inChildIndex];
  }

  getChild(childIndex: number): C {
    return this.children[childIndex];
  }

  updateAt(index: number, update: Update<T>): NonLeafBlock<T, C> {
    const [childIndex, inChildIndex] = this.getCoordinates(index, false, false);
    const newChildren = Arr.update(
      this.children,
      childIndex,
      (child): C => child.updateAt(inChildIndex, update)
    );
    return this.copy(newChildren);
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state: TraverseState
  ): void {
    if (state.halted) return;

    const length = this.children.length;
    let i = -1;
    const children = this.children;

    while (!state.halted && ++i < length) {
      children[i].forEach(f, state);
    }
  }

  mapPure<T2>(
    mapFun: (value: T) => T2,
    reversed = false,
    cacheMap = this.context.createCacheMap()
  ): NonLeafBlock<T2, Block<T2>> {
    const cachedThis = cacheMap.get(this);
    if (cachedThis) return cachedThis;

    const fn = reversed ? Arr.reverseMap : Arr.map;

    const newChildren = fn(this.children, (c: C): any =>
      c.mapPure(mapFun, reversed, cacheMap)
    );

    return cacheMap.setAndReturn(this, this.copy2(newChildren));
  }

  map<T2>(
    mapFun: (value: T, index: number) => T2,
    reversed = false,
    indexOffset = 0
  ): NonLeafBlock<T2, Block<T2>> {
    let offset = indexOffset;
    const children = this.children;

    if (reversed) {
      const newChildren: Block<T2, any, any>[] = [];

      let i = children.length;
      while (--i >= 0) {
        const child = children[i];
        newChildren.push(child.map(mapFun, true, offset));
        offset += child.length;
      }

      return this.copy2(newChildren);
    } else {
      const newChildren: Block<T2, any, any>[] = [];

      let i = -1;
      const length = children.length;
      while (++i < length) {
        const child = children[i];
        newChildren.push(child.map(mapFun, false, offset));
        offset += child.length;
      }

      return this.copy2(newChildren);
    }
  }

  reversed(cacheMap = this.context.createCacheMap()): NonLeafBlock<T, C> {
    const cachedThis = cacheMap.get(this);
    if (cachedThis !== undefined) return cachedThis;

    const newChildren = Arr.reverseMap(
      this.children,
      (child): C => child.reversed(cacheMap)
    );

    const reversedThis = this.copy(newChildren, this.length);
    return cacheMap.setAndReturn(this, reversedThis);
  }

  toArray(range?: IndexRange, reversed = false): T[] | any {
    let start = 0;
    let end = this.length - 1;

    if (undefined !== range) {
      const indexRange = IndexRange.getIndicesFor(range, this.length);
      if (indexRange === 'empty') return [];
      if (indexRange !== 'all') {
        start = indexRange[0];
        end = indexRange[1];
      }
    }

    const [startChildIndex, inStartChildIndex] = this.getCoordinates(
      start,
      false,
      true
    );
    const [endChildIndex, inEndChildIndex] = this.getCoordinates(
      end,
      false,
      true
    );

    const children = this.children;

    if (startChildIndex === endChildIndex) {
      const child = children[startChildIndex];

      return child.toArray(
        {
          start: inStartChildIndex,
          end: inEndChildIndex,
        },
        reversed
      );
    }

    const firstArray = children[startChildIndex].toArray(
      {
        start: inStartChildIndex,
      },
      reversed
    );

    const lastArray = children[endChildIndex].toArray(
      { end: inEndChildIndex },
      reversed
    );

    if (reversed) {
      let result: readonly T[] = lastArray;

      for (
        let childIndex = endChildIndex - 1;
        childIndex > startChildIndex;
        childIndex--
      ) {
        result = Arr.concat(
          result,
          children[childIndex].toArray(undefined, true)
        );
      }

      return Arr.concat(result, firstArray) as T[];
    }

    let result: readonly T[] = firstArray;

    for (
      let childIndex = startChildIndex + 1;
      childIndex < endChildIndex;
      childIndex++
    ) {
      result = Arr.concat(result, children[childIndex].toArray());
    }

    return Arr.concat(result, lastArray) as T[];
  }

  getCoordinates(
    index: number,
    forTake: boolean,
    noEmptyLast: boolean
  ): [number, number] {
    const offSet = forTake ? 1 : 0;
    let indexWithOffset = index - offSet;

    const nrChildren = this.nrChildren;
    const length = this.length;
    const children = this.children;

    if (indexWithOffset >= length) {
      // return the end
      if (noEmptyLast) {
        return [nrChildren - 1, Arr.last(children).length - 1];
      }

      return [nrChildren, 0];
    }

    const shiftBits = this.context.blockSizeBits << (this.level - 1);

    const regularSize = nrChildren << shiftBits;

    if (length === regularSize) {
      // regular blocks, calculate coordinates
      const mask = (1 << shiftBits) - 1;
      const childIndex = indexWithOffset >>> shiftBits;
      const inChildIndex = indexWithOffset & mask;

      return [childIndex, inChildIndex + offSet];
    }

    // not regular, need to search per child

    if (indexWithOffset <= length >>> 1) {
      // search from left to right
      for (let childIndex = 0; childIndex < nrChildren; childIndex++) {
        const childLength = children[childIndex].length;

        if (indexWithOffset < childLength) {
          return [childIndex, indexWithOffset + offSet];
        }

        indexWithOffset -= childLength;
      }
    } else {
      // search right to left
      let i = length - indexWithOffset;
      for (let childIndex = nrChildren - 1; childIndex >= 0; childIndex--) {
        const childLength = children[childIndex].length;

        if (i <= childLength) {
          return [childIndex, childLength - i + offSet];
        }

        i -= childLength;
      }
    }

    RimbuError.throwInvalidStateError();
  }

  _mutateRebalance(): NonLeafBlock<T, C> {
    let i = 0;

    const children = this.children;

    while (i < children.length - 1) {
      const child = children[i];
      const rightChild = children[i + 1];

      if (
        child.children.length + rightChild.children.length <=
        this.context.maxBlockSize
      ) {
        const newChild = child.concatChildren(rightChild);
        this.mutateChildren.splice(i, 2, newChild);
      } else i++;
    }

    return this;
  }

  _mutateNormalize(): NonLeaf<T> {
    if (this.childrenInMax) {
      return this;
    }

    const newRight = this._mutateSplitRight();

    return this.context.nonLeafTree(this, newRight, null, this.level);
  }

  _mutateSplitRight(
    childIndex = this.children.length >>> 1
  ): NonLeafBlock<T, C> {
    const rightChildren = this.mutateChildren.splice(childIndex);
    let rightLength = 0;

    for (let i = 0; i < rightChildren.length; i++) {
      rightLength += rightChildren[i].length;
    }

    this.length -= rightLength;

    return this.copy(rightChildren, rightLength);
  }

  structure(): string {
    const space = ' '.padEnd(this.level * 2);
    return `\n${space}<NLBlock(${this.level}) len:${this.length} c:${
      this.nrChildren
    } ${this.children.map((c): string => c.structure()).join(' ')}>`;
  }

  createBlockBuilder(): BlockBuilder<T, any> {
    return this.context.nonLeafBlockBuilderSource(this);
  }

  createNonLeafBuilder(): NonLeafBuilder<T, BlockBuilder<T, unknown>> {
    return this.context.nonLeafBlockBuilderSource(this);
  }
}
