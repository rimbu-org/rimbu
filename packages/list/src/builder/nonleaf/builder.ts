import { RimbuError } from '@rimbu/base';
import type {
  BlockBuilder,
  NonLeaf,
  NonLeafBlockBuilder,
  NonLeafTreeBuilder,
} from '../../list-custom';
import { NonLeafBlock, NonLeafTree } from '../../list-custom';

export function createNonLeaf<T>(
  nonLeaf: NonLeaf<T>
): NonLeafBuilder<T, BlockBuilder<T>> {
  if (nonLeaf instanceof NonLeafBlock) {
    return nonLeaf.context.nonLeafBlockBuilderSource(nonLeaf);
  }

  if (nonLeaf instanceof NonLeafTree) {
    return nonLeaf.context.nonLeafTreeBuilderSource(nonLeaf);
  }

  RimbuError.throwInvalidStateError();
}

export type NonLeafBuilder<T, C extends BlockBuilder<T>> =
  | NonLeafBlockBuilder<T, C>
  | NonLeafTreeBuilder<T, C>;
