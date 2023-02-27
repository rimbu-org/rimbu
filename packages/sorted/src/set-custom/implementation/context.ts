import { RSetBase } from '@rimbu/collection-types/set-custom';
import { Comp, generateUUID } from '@rimbu/common';

import type { SortedSet } from '@rimbu/sorted/set';

import {
  SortedSetBuilder,
  SortedSetEmpty,
  SortedSetInner,
  SortedSetLeaf,
  SortedSetNode,
} from '@rimbu/sorted/set-custom';

export class SortedSetContext<UT>
  extends RSetBase.ContextBase<UT, SortedSet.Types>
  implements SortedSet.Context<UT>
{
  readonly maxEntries: number;
  readonly minEntries: number;

  readonly _empty: SortedSet<any>;

  constructor(
    options: SortedSet.Context.Options<UT> = {},
    readonly blockSizeBits = options.blockSizeBits ?? 5,
    readonly comp = options.comp ?? Comp.defaultComp(),
    readonly contextId = options.contextId ?? generateUUID()
  ) {
    super();

    this.maxEntries = 1 << this.blockSizeBits;
    this.minEntries = this.maxEntries >>> 1;

    this._empty = Object.freeze(new SortedSetEmpty<any>(this));
  }

  readonly typeTag = 'SortedSet';

  isNonEmptyInstance(source: any): source is any {
    return source instanceof SortedSetNode;
  }

  isValidValue(value: any): value is UT {
    return this.comp.isComparable(value);
  }

  readonly builder = <T extends UT>(): SortedSetBuilder<T> => {
    return new SortedSetBuilder(this as unknown as SortedSetContext<T>);
  };

  createBuilder<T extends UT>(source?: SortedSet<T>): SortedSetBuilder<T> {
    return new SortedSetBuilder(this as unknown as SortedSetContext<T>, source);
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
    return new SortedSetLeaf(this as unknown as SortedSetContext<UT>, entries);
  }

  inner(
    entries: readonly UT[],
    children: readonly SortedSetNode<UT>[],
    size: number
  ): SortedSetInner<UT> {
    return new SortedSetInner(
      this as unknown as SortedSetContext<UT>,
      entries,
      children,
      size
    );
  }

  isSortedSetEmpty(obj: any): obj is SortedSetEmpty {
    return obj instanceof SortedSetEmpty;
  }

  isSortedSetLeaf<T>(obj: any): obj is SortedSetLeaf<T> {
    return obj instanceof SortedSetLeaf;
  }

  isSortedSetInner<T>(obj: any): obj is SortedSetInner<T> {
    return obj instanceof SortedSetInner;
  }

  isSortedSetNode<T>(obj: any): obj is SortedSetNode<T> {
    return obj instanceof SortedSetNode;
  }

  toJSON(): SortedSet.Context.Serialized {
    return {
      typeTag: this.typeTag,
      contextId: this.contextId,
      compId: this.comp.id,
      blockSizeBits: this.blockSizeBits,
    };
  }
}

export function createSortedSetContext<UT>(
  options?: SortedSet.Context.Options<UT>
): SortedSet.Context<UT> {
  return Object.freeze(new SortedSetContext<UT>(options));
}
