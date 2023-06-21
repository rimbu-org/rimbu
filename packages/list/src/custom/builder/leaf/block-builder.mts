import { Arr } from '@rimbu/base';
import { OptLazy, TraverseState, Update } from '@rimbu/common';

import type {
  LeafBlock,
  BlockBuilder,
  LeafBuilder,
  ListContext,
} from '@rimbu/list/custom';

export class LeafBlockBuilder<T> implements LeafBuilder<T>, BlockBuilder<T> {
  constructor(
    readonly context: ListContext,
    public source?: LeafBlock<T>,
    public _children?: T[]
  ) {}

  get level(): number {
    return 0;
  }

  get children(): T[] {
    if (undefined === this._children) {
      if (undefined !== this.source) {
        if (this.context.isReversedLeafBlock(this.source)) {
          this._children = Arr.reverse(this.source.children);
        } else {
          this._children = (this.source as LeafBlock<T>).children.slice();
        }
      }
    }

    return this._children!;
  }

  set children(value: T[]) {
    this.source = undefined;

    this._children = value;
  }

  get length(): number {
    return this.source?.length ?? this.children.length;
  }

  get nrChildren(): number {
    return this.length;
  }

  copy(children: T[]): LeafBlockBuilder<T> {
    return this.context.leafBlockBuilder(children);
  }

  normalized(): LeafBuilder<T> | undefined {
    if (this.nrChildren <= 0) {
      // block is empty
      return undefined;
    }

    if (this.nrChildren <= this.context.maxBlockSize) {
      // block is normal
      return this;
    }

    // need to split block and create tree
    const newLength = this.length;
    const newRight = this.splitRight();

    return this.context.leafTreeBuilder(this, newRight, undefined, newLength);
  }

  get<O>(index: number, otherwise?: OptLazy<O>): T | O {
    if (undefined !== this.source) {
      return this.source.get(index, otherwise);
    }

    return this.children[index];
  }

  updateAt(index: number, update: Update<T>): T {
    const oldValue = this.children[index];
    const newValue = Update(oldValue, update);

    if (!Object.is(oldValue, newValue)) {
      // value changed
      this.children[index] = newValue;
      this.source = undefined;
    }

    return oldValue;
  }

  prepend(value: T): void {
    this.children.unshift(value);
    this.source = undefined;
  }

  append(value: T): void {
    this.children.push(value);
    this.source = undefined;
  }

  insert(index: number, value: T): void {
    this.children.splice(index, 0, value);
    this.source = undefined;
  }

  remove(index: number): T {
    const [removed] = this.children.splice(index, 1);
    this.source = undefined;
    return removed;
  }

  dropFirst(): T {
    const value = this.children.shift()!;
    this.source = undefined;
    return value;
  }

  dropLast(): T {
    const value = this.children.pop()!;
    this.source = undefined;
    return value;
  }

  build(): LeafBlock<T> {
    return this.source ?? this.context.leafBlock(this.children.slice());
  }

  buildMap<T2>(f: (value: T) => T2): LeafBlock<T2> {
    return this.source?.map(f) ?? this.context.leafBlock(this.children.map(f));
  }

  splitRight(index = this.nrChildren >>> 1): LeafBlockBuilder<T> {
    const rightChildren = this.children.splice(index);

    this.source = undefined;

    return this.copy(rightChildren);
  }

  concat(other: LeafBlockBuilder<T>, prependOther = false): void {
    this.children = prependOther
      ? other.children.concat(this.children)
      : this.children.concat(other.children);
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    Arr.forEach(this.children, f, state);
  }
}
