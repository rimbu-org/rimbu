import type { OptLazy } from '../../../../common/mod.ts';

import type {
  BlockBuilder,
  BuilderBase,
  ListContext,
  NonLeafBlockBuilder,
  NonLeafBuilder,
  NonLeafTree,
} from '../../../../list/custom/index.ts';
import { TreeBuilderBase } from '../tree/tree-builder.ts';

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
      this._left = this.source.left.createBlockBuilder() as any;
      this._right = this.source.right.createBlockBuilder() as any;
      this._middle =
        null === this.source.middle
          ? undefined
          : (this.source.middle.createNonLeafBuilder() as any);
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
    if (undefined !== delta) {
      this.length += delta;
    }

    return delta;
  }

  modifyLastChild(f: (child: C) => number | undefined): number | undefined {
    const delta = this.right.modifyLastChild(f);
    if (undefined !== delta) {
      this.length += delta;
    }

    return delta;
  }

  normalized(): NonLeafBuilder<T, C> {
    if (undefined !== this.middle) {
      // middle, nothing to normalize
      return this;
    }

    // no middle

    if (
      this.left.nrChildren + this.right.nrChildren <=
      this.context.maxBlockSize
    ) {
      // combine left and right
      this.left.concat(this.right);

      return this.left;
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
    if (undefined !== this.source) {
      return this.source.get(index);
    }

    return super.get(index, otherwise);
  }

  build(): NonLeafTree<T, any> {
    if (undefined !== this.source) {
      return this.source;
    }

    return this.context.nonLeafTree(
      this.left.build(),
      this.right.build(),
      this.middle?.build?.() ?? null,
      this.level
    );
  }

  buildMap<T2>(f: (value: T) => T2): NonLeafTree<T2, any> {
    if (undefined !== this.source) {
      return this.source.map(f);
    }

    return this.context.nonLeafTree(
      this.left.buildMap(f),
      this.right.buildMap(f),
      this.middle?.buildMap?.(f) ?? null,
      this.level
    );
  }
}
