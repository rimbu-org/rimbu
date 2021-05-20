import { CustomBase } from '@rimbu/collection-types';
import { Comp } from '@rimbu/common';
import { SortedSet } from '../internal';
import {
  SortedSetBuilder,
  SortedSetEmpty,
  SortedSetInner,
  SortedSetLeaf,
  SortedSetNode,
} from '../sortedset-custom';

export class SortedSetContext<UT>
  extends CustomBase.RSetBase.ContextBase<UT, SortedSet.Types>
  implements SortedSet.Context<UT> {
  constructor(readonly blockSizeBits: number, readonly comp: Comp<UT>) {
    super();
  }

  readonly typeTag = 'SortedSet';
  readonly maxEntries = 1 << this.blockSizeBits;
  readonly minEntries = this.maxEntries >>> 1;

  isNonEmptyInstance(source: any): source is any {
    return source instanceof SortedSetNode;
  }

  readonly _empty: SortedSet<any> = new SortedSetEmpty<any>(this);

  isValidValue(value: any): value is UT {
    return this.comp.isComparable(value);
  }

  builder = <T extends UT>(): SortedSetBuilder<T> => {
    return new SortedSetBuilder((this as unknown) as SortedSetContext<T>);
  };

  createBuilder<T extends UT>(source?: SortedSet<T>): SortedSetBuilder<T> {
    return new SortedSetBuilder(
      (this as unknown) as SortedSetContext<T>,
      source
    );
  }

  findIndex(value: UT, entries: readonly UT[]): number {
    let start = 0;
    let end = entries.length - 1;

    while (start <= end) {
      const mid = (start + end) >>> 1;
      const midEntry = entries[mid];
      const comp = this.comp.compare(value, midEntry);
      if (comp < 0) end = mid - 1;
      else if (comp > 0) start = mid + 1;
      else return mid;
    }

    return -(start + 1);
  }

  leaf(entries: readonly UT[]): SortedSetLeaf<UT> {
    return new SortedSetLeaf(
      (this as unknown) as SortedSetContext<UT>,
      entries
    );
  }

  inner(
    entries: readonly UT[],
    children: readonly SortedSetNode<UT>[],
    size: number
  ): SortedSetInner<UT> {
    return new SortedSetInner(
      (this as unknown) as SortedSetContext<UT>,
      entries,
      children,
      size
    );
  }
}
