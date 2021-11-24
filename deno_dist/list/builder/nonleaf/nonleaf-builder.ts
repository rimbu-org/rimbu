import type {
  BlockBuilder,
  NonLeafBlockBuilder,
  NonLeafTreeBuilder,
} from '../../list-custom.ts';

export type NonLeafBuilder<T, C extends BlockBuilder<T>> =
  | NonLeafBlockBuilder<T, C>
  | NonLeafTreeBuilder<T, C>;
