import type { Block, ListContext, NonLeaf } from '../../../../list/custom/index.ts';

export interface Tree<
  T,
  TS extends Tree<T, TS, TB, C>,
  TB extends Block<T, TB, C>,
  C,
> {
  readonly context: ListContext;
  readonly left: TB;
  readonly middle: NonLeaf<T, TB> | null;
  readonly right: TB;
  readonly length: number;

  copy(left?: TB, right?: TB, middle?: NonLeaf<T, TB> | null): TS;
  prependMiddle(child: TB): NonLeaf<T, TB>;
  appendMiddle(child: TB): NonLeaf<T, TB>;
  getChildLength(child: C): number;
}
