import { OptLazy, TraverseState, Update } from 'https://deno.land/x/rimbu/common/mod.ts';
import type {
  BlockBuilder,
  BuilderBase,
  LeafBlockBuilder,
  LeafBuilder,
  LeafTree,
  ListContext,
  NonLeafBlockBuilder,
  NonLeafBuilder,
  NonLeafTree,
} from '../../list-custom.ts';
import { createFromBlock, createNonLeaf } from '../../list-custom.ts';

export abstract class TreeBuilderBase<T, C> {
  abstract readonly context: ListContext;
  abstract readonly level: number;
  abstract get left(): BlockBuilder<T, C>;
  abstract set left(value: BlockBuilder<T, C>);
  abstract get right(): BlockBuilder<T, C>;
  abstract set right(value: BlockBuilder<T, C>);
  abstract get middle(): NonLeafBuilder<T, BlockBuilder<T, C>> | undefined;
  abstract set middle(value: NonLeafBuilder<T, BlockBuilder<T, C>> | undefined);
  abstract length: number;
  abstract getChildLength(child: C): number;

  get<O>(index: number, otherwise?: OptLazy<O>): T | O {
    const middleIndex = index - this.left.length;

    if (middleIndex < 0) return this.left.get(index, otherwise);

    if (undefined === this.middle) {
      return this.right.get(middleIndex, otherwise);
    }

    const rightIndex = middleIndex - this.middle.length;
    if (rightIndex >= 0) return this.right.get(rightIndex, otherwise);

    return this.middle.get(middleIndex, otherwise);
  }

  updateAt<O>(index: number, update: Update<T>, otherwise?: OptLazy<O>): T | O {
    const middleIndex = index - this.left.length;

    if (middleIndex < 0) {
      return this.left.updateAt(index, update, otherwise);
    }

    if (undefined === this.middle) {
      return this.right.updateAt(middleIndex, update, otherwise);
    }

    const rightIndex = middleIndex - this.middle.length;
    if (rightIndex >= 0) {
      return this.right.updateAt(rightIndex, update, otherwise);
    }

    return this.middle.updateAt(middleIndex, update, otherwise);
  }

  prepend(child: C): void {
    this.length += this.getChildLength(child);

    if (this.left.nrChildren < this.context.maxBlockSize) {
      this.left.prepend(child);
      return;
    }

    if (undefined !== this.middle) {
      const delta = this.middle.modifyFirstChild(
        (firstChild): number | undefined => {
          if (firstChild.nrChildren < this.context.maxBlockSize) {
            const shiftChild = this.left.dropLast();
            this.left.prepend(child);
            firstChild.prepend(shiftChild);
            return this.getChildLength(shiftChild);
          }
          return;
        }
      );

      if (undefined !== delta) return;
    } else if (this.right.nrChildren < this.context.maxBlockSize) {
      const shiftChild = this.left.dropLast();
      this.left.prepend(child);
      this.right.prepend(shiftChild);
      return;
    }

    this.left.prepend(child);
    const toMiddle = this.left.splitRight(1);

    this.prependMiddle(toMiddle);
  }

  append(child: C): void {
    this.length += this.getChildLength(child);

    if (this.right.nrChildren < this.context.maxBlockSize) {
      this.right.append(child);
      return;
    }

    if (undefined !== this.middle) {
      // try to shift to last middle child
      const delta = this.middle.modifyLastChild(
        (lastChild): number | undefined => {
          if (lastChild.nrChildren < this.context.maxBlockSize) {
            const shiftChild = this.right.dropFirst();
            this.right.append(child);
            lastChild.append(shiftChild);
            return this.getChildLength(shiftChild);
          }
          return;
        }
      );

      if (undefined !== delta) return;
    } else if (this.left.nrChildren < this.context.maxBlockSize) {
      const shiftChild = this.right.dropFirst();
      this.right.append(child);
      this.left.append(shiftChild);
      return;
    }

    // append right to middle
    this.right.append(child);
    const newRight = this.right.splitRight(this.context.maxBlockSize);

    this.appendMiddle(this.right);
    this.right = newRight;
  }

  remove(index: number): T {
    this.length--;

    const middleIndex = index - this.left.length;

    if (middleIndex < 0) {
      // remove from left
      const oldValue = this.left.remove(index);

      if (this.left.nrChildren >= this.context.minBlockSize) return oldValue;
      // rebalancing is needed

      if (undefined !== this.middle) {
        // left borrows from middle
        const delta = this.middle.modifyFirstChild(
          (firstChild): number | undefined => {
            if (firstChild.nrChildren > this.context.minBlockSize) {
              // left borrows from middle's first grandChild
              const shiftChild = firstChild.dropFirst();
              this.left.append(shiftChild);
              return -this.getChildLength(shiftChild);
            }
            return;
          }
        );

        // if borrow was succesful
        if (undefined !== delta) return oldValue;

        // need to merge middle's first child with left
        const middleFirst = this.middle.dropFirst();
        this.middle = this.middle.normalized();
        this.left.concat(middleFirst);
      } else if (this.right.nrChildren > this.context.minBlockSize) {
        // left merges with right's first child
        const shiftChild = this.right.dropFirst();
        this.left.append(shiftChild);
      }

      return oldValue;
    }

    const rightIndex = middleIndex - (this.middle?.length ?? 0);

    if (undefined === this.middle || rightIndex >= 0) {
      // remove from right
      const oldValue = this.right.remove(rightIndex);

      if (this.right.nrChildren >= this.context.minBlockSize) return oldValue;
      // rebalancing is needed

      if (undefined !== this.middle) {
        // right borrows from middle
        const delta = this.middle.modifyLastChild(
          (lastChild): number | undefined => {
            if (lastChild.nrChildren > this.context.minBlockSize) {
              const shiftChild = lastChild.dropLast();
              this.right.prepend(shiftChild);
              return -this.getChildLength(shiftChild);
            }
            return;
          }
        );

        // if borrow was succesful
        if (undefined !== delta) return oldValue;

        // need to merge middle's last child with right
        const middleLast = this.middle.dropLast();
        this.middle = this.middle.normalized();
        middleLast.concat(this.right);
        this.right = middleLast;
      } else if (this.left.nrChildren > this.context.minBlockSize) {
        // right borrows from left
        const shiftChild = this.left.dropLast();
        this.right.prepend(shiftChild);
      }

      return oldValue;
    }

    // remove from middle
    const oldValue = this.middle.remove(middleIndex);
    this.middle = this.middle.normalized();
    return oldValue;
  }

  insert(index: number, value: T): void {
    this.length++;

    const middleIndex = index - this.left.length;

    if (middleIndex <= 0) {
      this.left.insert(index, value);

      if (this.left.nrChildren <= this.context.maxBlockSize) return;

      if (undefined !== this.middle) {
        // try shift to middle
        const delta = this.middle.modifyFirstChild(
          (firstChild): number | undefined => {
            if (firstChild.nrChildren < this.context.maxBlockSize) {
              const shiftChild = this.left.dropLast();
              firstChild.prepend(shiftChild);
              return this.getChildLength(shiftChild);
            }
            return;
          }
        );

        if (undefined !== delta) return;
      } else if (this.right.nrChildren < this.context.maxBlockSize) {
        // try to shift to right
        const shiftChild = this.left.dropLast();
        this.right.prepend(shiftChild);
        return;
      }

      // prepend block to middle
      const toMiddle = this.left.splitRight(1);
      this.prependMiddle(toMiddle);
      return;
    }

    const rightIndex = middleIndex - (this.middle?.length ?? 0);

    if (undefined === this.middle || rightIndex >= 0) {
      this.right.insert(rightIndex, value);

      if (this.right.nrChildren <= this.context.maxBlockSize) return;

      if (undefined !== this.middle) {
        // try to shift child to middle last
        const delta = this.middle.modifyLastChild(
          (lastChild): number | undefined => {
            if (lastChild.nrChildren < this.context.maxBlockSize) {
              const shiftChild = this.right.dropFirst();
              lastChild.append(shiftChild);
              return this.getChildLength(shiftChild);
            }
            return;
          }
        );

        if (undefined !== delta) return;
      } else if (this.left.nrChildren < this.context.maxBlockSize) {
        // try to shift child to left
        const shiftChild = this.right.dropFirst();
        this.left.append(shiftChild);
        return;
      }

      const newRight = this.right.splitRight(this.context.maxBlockSize);
      this.appendMiddle(this.right);
      this.right = newRight;
      return;
    }

    this.middle.insert(middleIndex, value);
    this.middle = this.middle.normalized();
  }

  prependMiddle(child: BlockBuilder<T, C>): void {
    if (undefined === this.middle) {
      this.middle = this.context.nonLeafBlockBuilder(
        this.level + 1,
        [child],
        child.length
      );
    } else if (this.context.isNonLeafBlockBuilder(this.middle)) {
      if (child.nrChildren < this.context.minBlockSize) {
        this.middle.length += child.length;
        const firstChild = this.middle.first();
        child.concat(firstChild);

        if (child.nrChildren <= this.context.maxBlockSize) {
          this.middle.children[0] = child;
          return;
        }

        const newRight = child.splitRight();
        this.middle.children.splice(0, 1, child, newRight);

        this.middle = this.middle.normalized();
      } else if (this.middle.nrChildren >= this.context.maxBlockSize) {
        const newLength = this.middle.length + child.length;
        this.middle.prepend(child);
        const newRight = this.middle.splitRight();
        this.middle = this.context.nonLeafTreeBuilder(
          this.level + 1,
          this.middle,
          newRight,
          undefined,
          newLength
        );
      } else {
        this.middle.prepend(child);
      }
    } else {
      this.middle.prepend(child);
    }
  }

  appendMiddle(child: BlockBuilder<T, C>): void {
    if (undefined === this.middle) {
      this.middle = this.context.nonLeafBlockBuilder(
        this.level + 1,
        [child],
        child.length
      );
    } else if (this.context.isNonLeafBlockBuilder(this.middle)) {
      if (child.nrChildren < this.context.minBlockSize) {
        const lastChild = this.middle.last();
        lastChild.concat(child);

        if (lastChild.nrChildren <= this.context.maxBlockSize) return;

        const newRight = lastChild.splitRight();
        this.middle.append(newRight);

        this.middle = this.middle.normalized();
      } else if (this.middle.nrChildren >= this.context.maxBlockSize) {
        const newLength = this.middle.length + child.length;
        this.middle.append(child);
        const newRight = this.middle.splitRight();
        this.middle = this.context.nonLeafTreeBuilder(
          this.level + 1,
          this.middle,
          newRight,
          undefined,
          newLength
        );
      } else {
        this.middle.append(child);
      }
    } else {
      this.middle.append(child);
    }
  }

  dropFirst(): C {
    const first = this.left.dropFirst();
    this.length -= this.getChildLength(first);
    if (this.left.nrChildren >= this.context.minBlockSize) return first;

    if (undefined !== this.middle) {
      const delta = this.middle.modifyFirstChild(
        (firstChild): number | undefined => {
          if (firstChild.nrChildren > this.context.minBlockSize) {
            const shiftChild = firstChild.dropFirst();
            this.left.append(shiftChild);
            return -this.getChildLength(shiftChild);
          }
          return;
        }
      );

      if (undefined !== delta) return first;

      const middleFirst = this.middle.dropFirst();
      this.middle = this.middle.normalized();
      this.left.concat(middleFirst);
      return first;
    }

    if (this.right.nrChildren > this.context.minBlockSize) {
      const shiftChild = this.right.dropFirst();
      this.left.append(shiftChild);
      return first;
    }

    // parent will normalize
    return first;
  }

  dropLast(): C {
    const last = this.right.dropLast();
    this.length -= this.getChildLength(last);
    if (this.right.nrChildren >= this.context.minBlockSize) return last;

    if (undefined !== this.middle) {
      const delta = this.middle.modifyLastChild(
        (lastChild): number | undefined => {
          if (lastChild.nrChildren > this.context.minBlockSize) {
            const shiftChild = lastChild.dropLast();
            this.right.prepend(shiftChild);
            return -this.getChildLength(shiftChild);
          }
          return;
        }
      );

      if (undefined !== delta) return last;

      const middleLast = this.middle.dropLast();
      middleLast.concat(this.right);
      this.middle = this.middle.normalized();
      this.right = middleLast;
      return last;
    }

    if (this.left.nrChildren > this.context.minBlockSize) {
      const shiftChild = this.left.dropLast();
      this.right.prepend(shiftChild);
      return last;
    }

    // parent will normalize
    return last;
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    if (state.halted) return;
    this.left.forEach(f, state);

    if (state.halted) return;

    if (undefined !== this.middle) {
      this.middle.forEach(f, state);
      if (state.halted) return;
    }

    this.right.forEach(f, state);
  }
}

export class LeafTreeBuilder<T>
  extends TreeBuilderBase<T, T>
  implements LeafBuilder<T>
{
  constructor(
    readonly context: ListContext,
    public source?: LeafTree<T>,
    public _left?: LeafBlockBuilder<T>,
    public _right?: LeafBlockBuilder<T>,
    public _middle?: NonLeafBuilder<T, LeafBlockBuilder<T>>,
    public length = source?.length ?? 0
  ) {
    super();
  }

  prepareMutate(): void {
    if (undefined !== this.source) {
      this._left = this.context.leafBlockBuilderSource(this.source.left);
      this._right = this.context.leafBlockBuilderSource(this.source.right);
      this._middle =
        null === this.source.middle
          ? undefined
          : (createNonLeaf<T>(this.source.middle) as any);
      this.source = undefined;
    }
  }

  get level(): 0 {
    return 0;
  }

  get left(): LeafBlockBuilder<T> {
    this.prepareMutate();
    return this._left!;
  }

  set left(value: LeafBlockBuilder<T>) {
    this.prepareMutate();
    this._left = value;
  }

  get right(): LeafBlockBuilder<T> {
    this.prepareMutate();
    return this._right!;
  }

  set right(value: LeafBlockBuilder<T>) {
    this.prepareMutate();
    this._right = value;
  }

  get middle(): NonLeafBuilder<T, LeafBlockBuilder<T>> | undefined {
    this.prepareMutate();
    return this._middle;
  }

  set middle(value: NonLeafBuilder<T, LeafBlockBuilder<T>> | undefined) {
    this.prepareMutate();
    this._middle = value;
  }

  getChildLength(): 1 {
    return 1;
  }

  appendChildren(children: T[], from: number): void {
    if (children.length === 0 || from >= children.length) return;

    if (this.right.nrChildren < this.context.maxBlockSize) {
      const items = children.slice(
        from,
        from + this.context.maxBlockSize - this.right.nrChildren
      );
      this.right.children = this.right.children.concat(items);
      this.length += items.length;
      this.appendChildren(children, from + items.length);
      return;
    }

    const block = children.slice(from, from + this.context.maxBlockSize);
    this.appendMiddle(this.right);
    this.right = this.context.leafBlockBuilder(block);
    this.length += block.length;
    this.appendChildren(children, from + block.length);
  }

  normalized(): LeafBuilder<T> {
    if (this.length <= this.context.maxBlockSize) {
      this.left.concat(this.right);
      return this.left;
    }

    if (undefined !== this.middle) {
      if (this.middle.length + this.left.length <= this.context.maxBlockSize) {
        this.left.concat(this.middle.first());
        this.middle = undefined;
      } else if (
        this.middle.length + this.right.length <=
        this.context.maxBlockSize
      ) {
        const newRight = this.middle.last();
        newRight.concat(this.right);
        this.right = newRight;
        this.middle = undefined;
      }
    }

    return this;
  }

  get<O>(index: number, otherwise?: OptLazy<O>): T | O {
    if (undefined !== this.source) return this.source.get(index, otherwise);

    return super.get(index, otherwise);
  }

  build(): LeafTree<T> {
    if (undefined !== this.source) return this.source;

    return this.context.leafTree(
      this.left.build(),
      this.right.build(),
      undefined === this.middle ? null : this.middle.build()
    );
  }

  buildMap<T2>(f: (value: T) => T2): LeafTree<T2> {
    if (undefined !== this.source) return this.source.map(f);

    return this.context.leafTree(
      this.left.buildMap(f),
      this.right.buildMap(f),
      undefined === this.middle ? null : (this.middle as any).buildMap(f)
    );
  }
}

export class NonLeafTreeBuilder<T, C extends BlockBuilder<T>>
  extends TreeBuilderBase<T, C>
  implements BuilderBase<T, C>
{
  constructor(
    readonly context: ListContext,
    readonly level: number,
    public source?: NonLeafTree<T, any>,
    public _left?: NonLeafBlockBuilder<T, C>,
    public _right?: NonLeafBlockBuilder<T, C>,
    public _middle?: NonLeafBuilder<T, NonLeafBlockBuilder<T, C>>,
    public length = source?.length ?? 0
  ) {
    super();
  }

  prepareMutate(): void {
    if (undefined !== this.source) {
      this._left = createFromBlock(this.source.left) as any;
      this._right = createFromBlock(this.source.right) as any;
      this._middle =
        null === this.source.middle
          ? undefined
          : (createNonLeaf(this.source.middle) as any);
      this.source = undefined;
    }
  }

  get left(): NonLeafBlockBuilder<T, C> {
    this.prepareMutate();
    return this._left!;
  }

  set left(value: NonLeafBlockBuilder<T, C>) {
    this.prepareMutate();
    this._left = value;
  }

  get right(): NonLeafBlockBuilder<T, C> {
    this.prepareMutate();
    return this._right!;
  }

  set right(value: NonLeafBlockBuilder<T, C>) {
    this.prepareMutate();
    this._right = value;
  }

  get middle(): NonLeafBuilder<T, NonLeafBlockBuilder<T, C>> | undefined {
    this.prepareMutate();
    return this._middle;
  }

  set middle(value: NonLeafBuilder<T, NonLeafBlockBuilder<T, C>> | undefined) {
    this.prepareMutate();
    this._middle = value;
  }

  getChildLength(child: C): number {
    return child.length;
  }

  modifyFirstChild(f: (child: C) => number | undefined): number | undefined {
    const delta = this.left.modifyFirstChild(f);
    if (undefined !== delta) this.length += delta;
    return delta;
  }

  modifyLastChild(f: (child: C) => number | undefined): number | undefined {
    const delta = this.right.modifyLastChild(f);
    if (undefined !== delta) this.length += delta;
    return delta;
  }

  normalized(): NonLeafBuilder<T, C> {
    if (undefined === this.middle) {
      if (
        this.left.nrChildren + this.right.nrChildren <=
        this.context.maxBlockSize
      ) {
        this.left.concat(this.right);
        return this.left;
      }
    } else {
      this.middle = this.middle.normalized();
    }

    return this;
  }

  first(): C {
    return this.left.first();
  }

  last(): C {
    return this.right.last();
  }

  get<O>(index: number, otherwise?: OptLazy<O>): T | O {
    if (undefined !== this.source) return this.source.get(index);

    return super.get(index, otherwise);
  }

  build(): NonLeafTree<T, any> {
    if (undefined !== this.source) return this.source;

    return this.context.nonLeafTree(
      this.left.build(),
      this.right.build(),
      undefined === this.middle ? null : this.middle.build(),
      this.level
    );
  }

  buildMap<T2>(f: (value: T) => T2): NonLeafTree<T2, any> {
    if (undefined !== this.source) return this.source.map(f);

    return this.context.nonLeafTree(
      this.left.buildMap(f),
      this.right.buildMap(f),
      undefined === this.middle ? null : (this.middle as any).buildMap(f),
      this.level
    );
  }
}
