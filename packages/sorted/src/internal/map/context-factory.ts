// @ts-nocheck
import type { SortedMap } from '@rimbu/sorted/map';

import { Comp } from '@rimbu/common/comp';
import { ContextBaseWithAddAll } from '@rimbu/collection-types/advanced/collection-base';
import { KeyedCollectionContextBase } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';
import { Module } from '@rimbu/common/module';

import { SortedMapBuilder } from '#map/builder';
import {
  SortedMapEmpty,
  SortedMapInner,
  SortedMapLeaf,
  SortedMapNode,
} from '#map/immutable';

export class SortedMapContext<UK>
  extends ContextBaseWithAddAll<SortedMap.Advanced.Family<UK, any>>
  implements SortedMap.Advanced.ContextApi<UK, SortedMap.Advanced.Family<UK, any>>
{
  static createDefault<UK>(
    comp?: Comp<UK> | undefined,
    blockSizeBits: number = 5,
  ): SortedMapContext<UK> {
    const result: SortedMapContext<UK> = new SortedMapContext(
      comp,
      blockSizeBits,
      () => result,
    );
    return result;
  }

  constructor(
    readonly _comp: Comp<UK> | undefined = undefined,
    readonly blockSizeBits: number = 5,
    readonly getDefaultInstance: () => SortedMapContext<any> = () => this as any,
  ) {
    super();
    this.maxEntries = 1 << blockSizeBits;
    this.minEntries = 1 << (blockSizeBits - 1);
  }

  readonly maxEntries: number;
  readonly minEntries: number;

  get comp(): Comp<UK> {
    return (this._comp ?? Comp.defaultInstance) as Comp<UK>;
  }

  get typeTag(): 'SortedMap' {
    return 'SortedMap';
  }

  defaultContext<T>(): SortedMap.Context<T> {
    return this.getDefaultInstance() as any;
  }

  createContext = <K>(options: {
    comp?: Comp<K> | undefined;
    blockSizeBits?: number | undefined;
  } = {}): SortedMap.Context<K> => {
    return new SortedMapContext<K>(
      (options as any)?.comp as any,
      (options as any)?.blockSizeBits ?? this.blockSizeBits,
      this.getDefaultInstance as any,
    ) as any;
  };

  #keyedContext: SortedMapKeyedContext<UK> | undefined;
  get keyedContext(): SortedMapKeyedContext<UK> {
    if (undefined === this.#keyedContext) {
      this.#keyedContext = new SortedMapKeyedContext<UK>(this);
    }
    return this.#keyedContext;
  }

  isValidKey(key: unknown): key is UK {
    return this.comp.isComparable(key as UK);
  }

  findIndex(key: UK, entries: readonly (readonly [UK, unknown])[]): number {
    let start = 0;
    let end = entries.length - 1;

    while (start <= end) {
      const mid = (start + end) >>> 1;
      const midEntry = entries[mid];
      const comp = this.comp.compare(key, midEntry[0] as UK);

      if (comp < 0) end = mid - 1;
      else if (comp > 0) start = mid + 1;
      else return mid;
    }

    return -(start + 1);
  }

  leaf<V>(entries: readonly (readonly [UK, V])[]): SortedMapLeaf<UK, V> {
    return new SortedMapLeaf<UK, V>(this as any, entries);
  }

  inner<V>(
    entries: readonly (readonly [UK, V])[],
    children: readonly SortedMapNode<UK, V>[],
    size: number,
  ): SortedMapInner<UK, V> {
    return new SortedMapInner(this as any, entries, children, size);
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

  isNonEmptyInstance<K, V>(source: unknown): source is SortedMap.NonEmpty<K, V> {
    return source instanceof SortedMapNode;
  }

  isSortedMapNode<K, V>(obj: any): obj is SortedMapNode<K, V> {
    return obj instanceof SortedMapNode;
  }

  #empty: SortedMap<UK, any> | undefined;
  empty = <K extends UK, V>(): SortedMap<K, V> => {
    if (undefined === this.#empty) {
      this.#empty = Object.freeze(new SortedMapEmpty<any, any>(this as any));
    }
    return this.#empty as unknown as SortedMap<K, V>;
  };

  builder = <K extends UK, V>(): SortedMap.Builder<K, V> => {
    return new SortedMapBuilder<K, V>(this as any);
  };

  createBuilder<K extends UK, V>(source?: SortedMap<K, V>): SortedMapBuilder<K, V> {
    return new SortedMapBuilder<K, V>(this as any, source as any);
  }

  reducer = <K extends UK, V>(
    source?: StreamSource<readonly [K, V]>,
  ): Reducer<readonly [K, V], SortedMap<K, V>> => {
    return Reducer.create(
      () =>
        undefined === source
          ? this.builder<K, V>()
          : (this.from(source as any) as SortedMap<K, V>).toBuilder(),
      (builder, entry) => {
        builder.add(entry);
        return builder;
      },
      (builder) => builder.build(),
    );
  };
}

export class SortedMapKeyedContext<UK>
  extends KeyedCollectionContextBase<UK, any, SortedMap.Advanced.Family<any, any>>
  implements SortedMap.Advanced.KeyedContextApi<UK, SortedMap.Advanced.Family<UK, any>>
{
  constructor(readonly context: SortedMapContext<UK>) {
    super(context as any);
  }

  get collectionContext(): SortedMap.Context<UK> {
    return this.context as any;
  }

  defaultContext<T>(): SortedMap.Context<T> {
    return (this.context as any).defaultContext() as any;
  }

  createContext = <K>(options: {
    comp?: Comp<K> | undefined;
    blockSizeBits?: number | undefined;
  }): SortedMap.Context<K> => {
    return this.context.createContext(options) as any;
  };

  get reducer(): <K, V>(
    source?: StreamSource<readonly [K, V]>,
  ) => Reducer<readonly [K, V], SortedMap<K, V>> {
    return this.context.reducer as any;
  }

  mergeAllWith = (
    sources: readonly StreamSource<readonly [UK, any]>[],
    options: { fillValue?: any; merge: (key: UK, values: any) => any },
  ): SortedMap.NonEmpty<UK, any> => {
    const { fillValue = undefined, merge: mergeFun } = options;
    const builder = (this as any).builder<UK, any[]>();
    let i = -1;
    const length = sources.length;
    while (++i < sources.length) {
      let entry: readonly [UK, unknown] | undefined;
      const iter = Stream.from(sources[i])[Symbol.iterator]();
      while (undefined !== (entry = iter.fastNext())) {
        const key = entry[0];
        const value = entry[1];
        const index = i;
        builder.modifyAtKey(key, {
          ifNew: {
            create: (): unknown[] => {
              const row = Array(length).fill(fillValue);
              row[index] = value;
              return row;
            },
          },
          ifExists: {
            update: (row: unknown[]): unknown[] => {
              (row as any)[index] = value;
              return row;
            },
          },
        });
      }
    }
    return builder.buildMapValues((values: any, key: UK) => mergeFun(key, values)) as SortedMap.NonEmpty<UK, any>;
  };

  mergeAll = (
    sources: readonly StreamSource<readonly [UK, any]>[],
    options: { fillValue?: any } = {},
  ): SortedMap.NonEmpty<UK, any> => {
    return this.mergeAllWith(sources, {
      fillValue: options.fillValue,
      merge: (_key: UK, values: any) => values,
    });
  };

  mergeWith = (
    sources: readonly StreamSource<readonly [UK, any]>[],
    options: { merge: (key: UK, values: any) => any },
  ): SortedMap<UK, any> => {
    if (Stream.from(sources).some(Stream.isEmptyStreamSourceInstance)) {
      return (this as any).empty();
    }
    const { merge: mergeFun } = options;
    const builder = (this as any).builder<UK, unknown[]>();
    let i = -1;
    const length = sources.length;
    while (++i < sources.length) {
      let entry: readonly [UK, unknown] | undefined;
      const iter = Stream.from(sources[i])[Symbol.iterator]();
      while (undefined !== (entry = iter.fastNext())) {
        const key = entry[0];
        const value = entry[1];
        const index = i;
        builder.modifyAtKey(key, {
          ifNew: {
            create: (nothing: any): unknown[] | typeof nothing => {
              if (index > 0) return nothing;
              const row = [value];
              return row;
            },
          },
          ifExists: {
            update: (row: any, remove: any): unknown[] | typeof remove => {
              if (row.length !== index) return remove;
              row.push(value);
              return row;
            },
          },
        });
      }
    }
    const firstSource = sources[0];
    let entry: readonly [UK, unknown] | undefined;
    const iter = Stream.from(firstSource)[Symbol.iterator]();
    while (undefined !== (entry = iter.fastNext())) {
      const key = entry[0];
      builder.modifyAtKey(key, {
        ifExists: {
          update: (row: any, remove: any): unknown[] | typeof remove => {
            if (row.length !== length) return remove;
            return row;
          },
        },
      });
    }
    return builder.buildMapValues((row: any, key: UK) => mergeFun(key, row));
  };

  merge = (
    sources: readonly StreamSource<readonly [UK, any]>[],
  ): SortedMap<UK, any> => {
    return this.mergeWith(sources, {
      merge: (_key: UK, values: any) => values,
    });
  };
}

export type ContextImpl<UK> = SortedMapContext<UK>;

export function createSortedMapContextModule<UK>(
  options: {
    comp?: Comp<UK>;
    blockSizeBits?: number;
  } = {},
  _defaultContext?: SortedMap.Context<UK> | undefined,
): Module<SortedMapKeyedContext<UK>> {
  const context = new SortedMapContext<UK>(
    (options as any)?.comp,
    (options as any)?.blockSizeBits ?? 5,
    () => (_defaultContext as any) ?? context,
  );
  const keyedContext = context.keyedContext;
  return {
    getDefinition: () => ({} as any),
    build: () => keyedContext,
  } as any;
}
