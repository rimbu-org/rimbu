import type { SortedSet } from '@rimbu/sorted/set';

import { Comp } from '@rimbu/common/comp';
import { ContextBaseWithAddAll } from '@rimbu/collection-types/advanced/collection-base';
import { type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';
import { Module } from '@rimbu/common/module';

import { SortedSetBuilder } from '#set/builder';
import {
  SortedSetEmpty,
  SortedSetInner,
  SortedSetLeaf,
  SortedSetNode,
} from '#set/immutable';

export class SortedSetContext<UT>
  extends ContextBaseWithAddAll<SortedSet.Advanced.Family<UT>>
  implements SortedSet.Advanced.ContextApi<UT, SortedSet.Advanced.Family<UT>>
{
  static createDefault<UT>(
    comp?: Comp<UT> | undefined,
    blockSizeBits: number = 5,
  ): SortedSetContext<UT> {
    const result: SortedSetContext<UT> = new SortedSetContext(
      comp,
      blockSizeBits,
      () => result,
    );
    return result;
  }

  constructor(
    readonly _comp: Comp<UT> | undefined = undefined,
    readonly blockSizeBits: number = 5,
    readonly getDefaultInstance: () => SortedSetContext<any> = () => this as unknown as SortedSetContext<any>,
  ) {
    super();
    this.maxEntries = 1 << blockSizeBits;
    this.minEntries = 1 << (blockSizeBits - 1);
  }

  readonly maxEntries: number;
  readonly minEntries: number;

  get comp(): Comp<UT> {
    return (this._comp ?? Comp.defaultInstance) as Comp<UT>;
  }

  get typeTag(): 'SortedSet' {
    return 'SortedSet';
  }

  get defaultContext(): SortedSet.Context<UT> {
    return this.getDefaultInstance() as unknown as SortedSet.Context<UT>;
  }

  createContext = <T>(options: {
    comp?: Comp<T> | undefined;
    blockSizeBits?: number | undefined;
  } = {}): SortedSet.Context<T> => {
    return new SortedSetContext<T>(
      options.comp as Comp<T> | undefined,
      options.blockSizeBits ?? this.blockSizeBits,
      this.getDefaultInstance as unknown as () => SortedSetContext<any>,
    ) as unknown as SortedSet.Context<T>;
  };

  isValidValue(value: unknown): value is UT {
    return this.comp.isComparable(value as UT);
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
    size: number,
  ): SortedSetInner<UT> {
    return new SortedSetInner(this as unknown as SortedSetContext<UT>, entries, children, size);
  }

  isSortedSetEmpty(obj: unknown): obj is SortedSetEmpty<UT> {
    return obj instanceof SortedSetEmpty;
  }

  isSortedSetLeaf<T>(obj: unknown): obj is SortedSetLeaf<T> {
    return obj instanceof SortedSetLeaf;
  }

  isSortedSetInner<T>(obj: unknown): obj is SortedSetInner<T> {
    return obj instanceof SortedSetInner;
  }

  isSortedSetNode<T>(obj: unknown): obj is SortedSetNode<T> {
    return obj instanceof SortedSetNode;
  }

  isNonEmptyInstance<T extends UT>(source: unknown): source is SortedSet.NonEmpty<T> {
    return source instanceof SortedSetNode;
  }

  #empty: SortedSet<UT> | undefined;
  empty = <T extends UT>(): SortedSet<T> => {
    if (undefined === this.#empty) {
      this.#empty = Object.freeze(new SortedSetEmpty<T>(this as unknown as SortedSetContext<T>)) as unknown as SortedSet<UT>;
    }
    return this.#empty as unknown as SortedSet<T>;
  };

  builder = <T extends UT>(): SortedSet.Builder<T> => {
    return new SortedSetBuilder<T>(this as unknown as SortedSetContext<T>);
  };

  createBuilder<T extends UT>(source?: SortedSet<T>): SortedSet.Builder<T> {
    return new SortedSetBuilder<T>(this as unknown as SortedSetContext<T>, source as SortedSet<T>);
  }

  reducer = <E extends UT>(
    source?: StreamSource<E>,
  ): Reducer<E, SortedSet<E>> => {
    return Reducer.create(
      () =>
        undefined === source
          ? this.builder<E>()
          : (this.from(source as StreamSource<E>) as SortedSet<E>).toBuilder(),
      (builder, element) => {
        builder.add(element);
        return builder;
      },
      (builder) => builder.build(),
    );
  };
}

export type ContextImpl<UT> = SortedSetContext<UT>;

export function createSortedSetContextModule<UT>(
  options: {
    comp?: Comp<UT>;
    blockSizeBits?: number;
  } = {},
  _defaultContext?: SortedSet.Context<UT> | undefined,
): Module<SortedSetContext<UT>> {
  let context!: SortedSetContext<UT>;
  context = new SortedSetContext<UT>(
    options.comp as Comp<UT> | undefined,
    options.blockSizeBits ?? 5,
    () => (_defaultContext as unknown as SortedSetContext<UT>) ?? context,
  );
  return {
    getDefinition: () => ({} as unknown as ReturnType<Module<SortedSetContext<UT>>['getDefinition']>),
    build: () => context,
  } as unknown as Module<SortedSetContext<UT>>;
}
