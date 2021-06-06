import { RimbuError } from '@rimbu/base';
import {
  NonLeaf,
  NonLeafBlock,
  NonLeafTree,
} from '../../implementation/implementation-generic-custom';
import {
  BlockBuilder,
  NonLeafBlockBuilder,
  NonLeafTreeBuilder,
} from '../builder-generic-custom';

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
