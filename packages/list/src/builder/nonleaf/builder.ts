import { RimbuError } from '@rimbu/base';
import {
  BlockBuilder,
  NonLeaf,
  NonLeafBlock,
  NonLeafBlockBuilder,
  NonLeafTree,
  NonLeafTreeBuilder,
} from '../../list-custom';

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
