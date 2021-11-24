import type {
  BlockBuilder,
  NonLeafBlockBuilder,
  NonLeafTreeBuilder,
} from '../../list-custom';

export type NonLeafBuilder<T, C extends BlockBuilder<T>> =
  | NonLeafBlockBuilder<T, C>
  | NonLeafTreeBuilder<T, C>;
