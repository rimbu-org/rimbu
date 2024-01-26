import type { OptLazy, TraverseState, Update } from '../../../common/mod.ts';

import type { BuilderBase } from '../../../list/custom/index.ts';

export interface BlockBuilder<T, C = unknown> extends BuilderBase<T, C> {
  level: number;
  nrChildren: number;
  children: C[];
  updateAt<O>(index: number, update: Update<T>, otherwise?: OptLazy<O>): T | O;
  remove(index: number): T;
  dropFirst(): C;
  dropLast(): C;
  copy(children: C[], length: number): BlockBuilder<T, C>;
  splitRight(index?: number): BlockBuilder<T, C>;
  concat(other: BlockBuilder<T, C>, prependOther?: boolean): void;
  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    options?: { reversed?: boolean; state?: TraverseState }
  ): void;
}
