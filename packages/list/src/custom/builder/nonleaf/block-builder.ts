import { Arr, RimbuError } from '@rimbu/base';
import { OptLazy, TraverseState, Update } from '@rimbu/common';

import type { List } from '@rimbu/list';
import type {
  BlockBuilder,
  ListContext,
  NonLeaf,
  NonLeafBlock,
  NonLeafBuilder,
} from '@rimbu/list/custom';

export class NonLeafBlockBuilder<T, C extends BlockBuilder<T>>
  implements BlockBuilder<T, C>
{
  constructor(
    readonly context: ListContext,
    readonly level: number,
    public source?: NonLeafBlock<T, any>,
    public _children?: C[],
    public length: number = source?.length ?? 0
  ) {}

  get children(): C[] {
    if (undefined !== this.source) {
      this._children = this.source.children.map(
        (c): C => c.createBlockBuilder()
      );
      this.source = undefined;
    }

    return this._children!;
  }

  set children(value: C[]) {
    if (undefined !== this.source) {
      this._children = this.source.children.map(
        (c): C => c.createBlockBuilder()
      );
      this.source = undefined;
    }
    this._children = value;
  }

  get nrChildren(): number {
    return this.source?.nrChildren ?? this.children.length;
  }

  copy(children: C[], length: number): NonLeafBlockBuilder<T, C> {
    return this.context.nonLeafBlockBuilder(this.level, children, length);
  }

  getCoordinates(index: number): [number, number] {
    const nrChildren = this.nrChildren;
    const length = this.length;

    if (index >= length) {
      // always return end of last child
      const lastChild = Arr.last(this.children);
      return [nrChildren - 1, lastChild.length];
    }

    const shiftBits = this.context.blockSizeBits << (this.level - 1);

    const regularSize = nrChildren << shiftBits;

    if (length === regularSize) {
      // regular blocks, calculate coordinates
      const childSize = 1 << shiftBits;
      const mask = childSize - 1;
      const childIndex = index >>> shiftBits;

      const inChildIndex = index & mask;
      return [childIndex, inChildIndex];
    }

    // not regular, need to search per child
    const children = this.children;

    if (index <= length >>> 1) {
      // search left to right
      let i = index;
      for (let childIndex = 0; childIndex < nrChildren; childIndex++) {
        const childLength = children[childIndex].length;

        if (i < childLength) {
          return [childIndex, i];
        }

        i -= childLength;
      }
    } else {
      // search right to left
      let i = length - index;
      for (let childIndex = nrChildren - 1; childIndex >= 0; childIndex--) {
        const childLength = children[childIndex].length;

        if (i <= childLength) {
          return [childIndex, childLength - i];
        }

        i -= childLength;
      }
    }

    RimbuError.throwInvalidStateError();
  }

  normalized(): NonLeafBuilder<T, C> | undefined {
    if (this.nrChildren === 0) {
      // empty
      return undefined;
    }

    const context = this.context;

    const maxBlockSize = context.maxBlockSize;

    if (this.nrChildren > maxBlockSize) {
      // too many children, needs to split
      const middleLength = this.length;

      return context.nonLeafTreeBuilder(
        this.level,
        this,
        this.splitRight(),
        undefined,
        middleLength
      );
    }

    // already normalized
    return this;
  }

  get(index: number): T {
    if (undefined !== this.source) {
      return this.source.get(index);
    }

    const [childIndex, inChildIndex] = this.getCoordinates(index);

    return this.children[childIndex].get(
      inChildIndex,
      RimbuError.throwInvalidStateError
    );
  }

  updateAt<O>(index: number, update: Update<T>, otherwise?: OptLazy<O>): T | O {
    const [childIndex, inChildIndex] = this.getCoordinates(index);
    return this.children[childIndex].updateAt(inChildIndex, update, otherwise);
  }

  prepend(child: C): void {
    this.length += child.length;

    this.children.unshift(child);
  }

  append(child: C): void {
    this.length += child.length;

    this.children.push(child);
  }

  insert(index: number, value: T): void {
    const [childIndex, inChildIndex] = this.getCoordinates(index);

    this.length++;

    // insert into child
    const child = this.children[childIndex];

    child.insert(inChildIndex, value);

    if (child.nrChildren <= this.context.maxBlockSize) {
      // no need to normalize
      return;
    }

    // child is too large
    const leftChild = this.children[childIndex - 1];
    if (
      undefined !== leftChild &&
      leftChild.nrChildren < this.context.maxBlockSize
    ) {
      // shift to leftChild
      const shiftChild = child.dropFirst();
      leftChild.append(shiftChild);
      return;
    }

    const rightChild = this.children[childIndex + 1];
    if (
      undefined !== rightChild &&
      rightChild.nrChildren < this.context.maxBlockSize
    ) {
      // shift to rightChild
      const shiftChild = child.dropLast();
      rightChild.prepend(shiftChild);
      return;
    }

    // cannot shift, split child
    const newRightChild = child.splitRight();
    this.children.splice(childIndex + 1, 0, newRightChild as C);
  }

  remove(index: number): T {
    const [childIndex, inChildIndex] = this.getCoordinates(index);

    this.length--;

    // remove from child
    const child = this.children[childIndex];

    const oldValue = child.remove(inChildIndex);

    if (child.nrChildren >= this.context.minBlockSize || this.nrChildren <= 1) {
      // no need to normalize
      return oldValue;
    }

    const leftChild = this.children[childIndex - 1];
    if (
      undefined !== leftChild &&
      leftChild.nrChildren > this.context.minBlockSize
    ) {
      // can shift from left
      const shiftChild = leftChild.dropLast();
      child.prepend(shiftChild);
      return oldValue;
    }

    const rightChild = this.children[childIndex + 1];
    if (
      undefined !== rightChild &&
      rightChild.nrChildren > this.context.minBlockSize
    ) {
      // can shift from right
      const shiftChild = rightChild.dropFirst();
      child.append(shiftChild);
      return oldValue;
    }

    if (undefined !== leftChild) {
      // merge with left
      leftChild.concat(child);
      this.children.splice(childIndex, 1);
      return oldValue;
    }

    // merge with right
    child.concat(rightChild);
    this.children.splice(childIndex + 1, 1);
    return oldValue;
  }

  dropFirst(): C {
    const first = this.children.shift()!;
    this.length -= first.length;
    return first;
  }

  dropLast(): C {
    const last = this.children.pop()!;
    this.length -= last.length;
    return last;
  }

  modifyFirstChild(f: (child: C) => number | undefined): number | undefined {
    const delta = f(this.first());
    if (undefined !== delta) this.length += delta;
    return delta;
  }

  modifyLastChild(f: (child: C) => number | undefined): number | undefined {
    const delta = f(this.last());
    if (undefined !== delta) this.length += delta;
    return delta;
  }

  first(): C {
    return this.children[0];
  }

  last(): C {
    return Arr.last(this.children);
  }

  splitRight(index = this.nrChildren >>> 1): NonLeafBlockBuilder<T, C> {
    const rightChildren = this.children.splice(
      index,
      this.context.maxBlockSize
    );
    const oldLength = this.length;
    this.length = 0;
    for (let i = 0; i < this.nrChildren; i++) {
      this.length += this.children[i].length;
    }
    const rightLength = oldLength - this.length;
    return this.copy(rightChildren, rightLength);
  }

  concat(other: NonLeafBlockBuilder<T, C>, prependOther = false): void {
    this.children = prependOther
      ? other.children.concat(this.children)
      : this.children.concat(other.children);
    this.length += other.length;
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    if (state.halted) return;

    let i = -1;
    const length = this.children.length;
    while (!state.halted && ++i < length) {
      this.children[i].forEach(f, state);
    }
  }

  build(): NonLeafBlock<T, any> {
    if (undefined !== this.source) {
      return this.source;
    }

    return this.context.nonLeafBlock<T, any>(
      this.length,
      this.children.map((c): List<T> | NonLeaf<T, any> => c.build()),
      this.level
    );
  }

  buildMap<T2>(f: (value: T) => T2): NonLeafBlock<T2, any> {
    if (undefined !== this.source) {
      return this.source.map(f);
    }

    return this.context.nonLeafBlock<T2, any>(
      this.length,
      this.children.map((c): List<T2> | NonLeaf<T2, any> => c.buildMap(f)),
      this.level
    );
  }
}
