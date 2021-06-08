import { RimbuError } from '@rimbu/base';
import type {
  BlockBuilder,
  NonLeaf,
  NonLeafBlockBuilder,
  NonLeafTreeBuilder,
} from '../../list-custom';

export function createNonLeaf<T>(
  nonLeaf: NonLeaf<T>
): NonLeafBuilder<T, BlockBuilder<T>> {
  if (nonLeaf.context.isNonLeafBlock(nonLeaf)) {
    return nonLeaf.context.nonLeafBlockBuilderSource(nonLeaf);
  }

  if (nonLeaf.context.isNonLeafTree(nonLeaf)) {
    return nonLeaf.context.nonLeafTreeBuilderSource(nonLeaf);
  }

  RimbuError.throwInvalidStateError();
}

export type NonLeafBuilder<T, C extends BlockBuilder<T>> =
  | NonLeafBlockBuilder<T, C>
  | NonLeafTreeBuilder<T, C>;
