import type {
  BlockBuilder,
  NonLeafBlockBuilder,
  NonLeafTreeBuilder,
} from '@rimbu/list/custom';

export type NonLeafBuilder<T, C extends BlockBuilder<T>> =
  | NonLeafBlockBuilder<T, C>
  | NonLeafTreeBuilder<T, C>;
