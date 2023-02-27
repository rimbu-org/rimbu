import { RMapBase } from '@rimbu/collection-types/map-custom';
import { Comp, generateUUID } from '@rimbu/common';

import type { SortedMap } from '@rimbu/sorted/map';

import {
  SortedMapBuilder,
  SortedMapEmpty,
  SortedMapInner,
  SortedMapLeaf,
  SortedMapNode,
} from '@rimbu/sorted/map-custom';

export class SortedMapContext<UK>
  extends RMapBase.ContextBase<UK, SortedMap.Types>
  implements SortedMap.Context<UK>
{
  readonly maxEntries: number;
  readonly minEntries: number;

  readonly _empty: SortedMap<any, any>;

  constructor(
    options: SortedMap.Context.Options<UK> = {},
    readonly blockSizeBits = options.blockSizeBits ?? 5,
    readonly comp: Comp<UK> = options.comp ?? Comp.defaultComp(),
    readonly contextId = options.contextId ?? generateUUID()
  ) {
    super();

    this.maxEntries = 1 << blockSizeBits;
    this.minEntries = this.maxEntries >>> 1;

    this._empty = Object.freeze(new SortedMapEmpty<any, any>(this));
  }

  readonly typeTag = 'SortedMap';

  isNonEmptyInstance(source: any): source is any {
    return source instanceof SortedMapNode;
  }

  readonly builder = <K extends UK, V>(): SortedMapBuilder<K, V> => {
    return new SortedMapBuilder(this as any);
  };

  createBuilder<K extends UK, V>(
    source?: SortedMap<K, V>
  ): SortedMapBuilder<K, V> {
    return new SortedMapBuilder(this as any, source);
  }

  isValidKey(key: any): key is UK {
    return this.comp.isComparable(key);
  }

  findIndex(key: UK, entries: readonly (readonly [UK, unknown])[]): number {
    let start = 0;
    let end = entries.length - 1;

    while (start <= end) {
      const mid = (start + end) >>> 1;
      const midEntry = entries[mid];
      const comp = this.comp.compare(key, midEntry[0]);

      if (comp < 0) end = mid - 1;
      else if (comp > 0) start = mid + 1;
      else return mid;
    }

    return -(start + 1);
  }

  leaf<V>(entries: readonly (readonly [UK, V])[]): SortedMapLeaf<UK, V> {
    return new SortedMapLeaf<UK, V>(this, entries);
  }

  inner<V>(
    entries: readonly (readonly [UK, V])[],
    children: readonly SortedMapNode<UK, V>[],
    size: number
  ): SortedMapInner<UK, V> {
    return new SortedMapInner(this, entries, children, size);
  }

  isSortedMapEmpty(obj: any): obj is SortedMapEmpty {
    return obj instanceof SortedMapEmpty;
  }

  isSortedMapLeaf<K, V>(obj: any): obj is SortedMapLeaf<K, V> {
    return obj instanceof SortedMapLeaf;
  }

  isSortedMapInner<K, V>(obj: any): obj is SortedMapInner<K, V> {
    return obj instanceof SortedMapInner;
  }

  toJSON(): SortedMap.Context.Serialized {
    return {
      typeTag: this.typeTag,
      contextId: this.contextId,
      compId: this.comp.id,
      blockSizeBits: this.blockSizeBits,
    };
  }
}

export function createSortedMapContext<UK>(
  options?: SortedMap.Context.Options<UK>
): SortedMap.Context<UK> {
  return Object.freeze(new SortedMapContext<UK>(options));
}
