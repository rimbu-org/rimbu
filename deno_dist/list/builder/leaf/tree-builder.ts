import type { OptLazy } from '../../../common/mod.ts';
import type {
  LeafBlockBuilder,
  LeafBuilder,
  LeafTree,
  ListContext,
  NonLeafBuilder,
} from '../../list-custom.ts';
import { createNonLeaf, TreeBuilderBase } from '../../list-custom.ts';

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
