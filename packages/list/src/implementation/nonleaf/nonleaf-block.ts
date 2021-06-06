import { Arr, RimbuError } from '@rimbu/base';
import { IndexRange, TraverseState, Update } from '@rimbu/common';
import { Stream } from '@rimbu/stream';
import { ListContext } from '../../list-custom';
import { Block, NonLeaf, NonLeafTree } from '../implementation-generic-custom';

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
    return new NonLeafBlock(this.context, length, children, this.level);
  }

  copy2<T2, C2 extends Block<T2, C2>>(
    children: readonly C2[],
    length = this.length
  ): NonLeafBlock<T2, C2> {
    return new NonLeafBlock(this.context, length, children, this.level);
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

  concat(other: NonLeaf<T, C>): NonLeaf<T, C> {
    if (other instanceof NonLeafBlock) return this.concatBlock(other);
    if (other instanceof NonLeafTree) return this.concatTree(other);

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
    if (childAmount <= 0) return this;
    if (childAmount >= this.nrChildren) return null;

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

    const lastChild = this.getChild(childIndex);
    const newSelf = this.takeChildren(childIndex);

    return [newSelf, lastChild, inChildIndex];
  }

  dropInternal(amount: number): [NonLeafBlock<T, C> | null, C, number] {
    const [childIndex, inChildIndex] = this.getCoordinates(
      amount,
      false,
      false
    );

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
        newChildren.push(child.map(mapFun, true, offset));
        offset += child.length;
      }

      return this.copy2(newChildren);
    }
  }

  reversed(): NonLeafBlock<T, C> {
    const newChildren = Arr.reverseMap(
      this.children,
      (child): C => child.reversed()
    );
    return this.copy(newChildren, this.length);
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

    const shiftBits = this.context.blockSizeBits << (this.level - 1);

    const nrChildren = this.nrChildren;

    const regularSize = nrChildren << shiftBits;

    if (this.length === regularSize) {
      const mask = (1 << shiftBits) - 1;
      const childIndex = indexWithOffset >>> shiftBits;
      const inChildIndex = indexWithOffset & mask;

      return [childIndex, inChildIndex + offSet];
    }

    // not regular, need to search per child

    const children = this.children;

    for (let childIndex = 0; childIndex < nrChildren; childIndex++) {
      const childLength = children[childIndex].length;

      if (indexWithOffset < childLength) {
        return [childIndex, indexWithOffset + offSet];
      }

      indexWithOffset -= childLength;
    }

    if (noEmptyLast) {
      return [nrChildren - 1, Arr.last(children).length - 1];
    }

    return [nrChildren, 0];
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
    return `\n${space}<NLBlock len:${this.length} c:${
      this.nrChildren
    } ${this.children.map((c): string => c.structure()).join(' ')}>`;
  }
}
