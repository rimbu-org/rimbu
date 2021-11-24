import { RimbuError } from '../base/mod.ts';
import type { ArrayNonEmpty } from '../common/mod.ts';
import { Reducer } from '../common/mod.ts';
import { Stream, StreamSource } from '../stream/mod.ts';
import type { List } from './internal.ts';
import type {
  Block,
  BlockBuilder,
  LeafBuilder,
  NonLeaf,
  NonLeafBuilder,
} from './list-custom.ts';
import {
  Empty,
  GenBuilder,
  LeafBlock,
  LeafBlockBuilder,
  LeafTree,
  LeafTreeBuilder,
  ListNonEmptyBase,
  NonLeafBlock,
  NonLeafBlockBuilder,
  NonLeafTree,
  NonLeafTreeBuilder,
  ReversedLeafBlock,
} from './list-custom.ts';

export class ListContext implements List.Context {
  readonly maxBlockSize: number;
  readonly minBlockSize: number;

  constructor(readonly blockSizeBits: number) {
    if (blockSizeBits < 2) {
      RimbuError.throwInvalidUsageError(
        'List: blockSizeBits should be at least 2'
      );
    }

    this.maxBlockSize = 1 << blockSizeBits;
    this.minBlockSize = this.maxBlockSize >>> 1;
  }

  get typeTag(): 'List' {
    return 'List';
  }

  get _types(): List.Types {
    return undefined as any;
  }

  builder = <T>(): GenBuilder<T> => {
    return new GenBuilder<T>(this);
  };

  createBuilder<T>(source?: List<T>): GenBuilder<T> {
    if (undefined === source || source.isEmpty) return new GenBuilder<T>(this);

    if (source instanceof LeafBlock) {
      const builder = this.leafBlockBuilderSource<T>(source);
      return new GenBuilder<T>(this, builder);
    }

    if (source instanceof LeafTree) {
      const builder = this.leafTreeBuilderSource<T>(source);
      return new GenBuilder<T>(this, builder);
    }

    RimbuError.throwInvalidStateError();
  }

  readonly _empty: List<any> = new Empty(this);

  empty = <T>(): List<T> => {
    return this._empty;
  };

  of = <T>(...values: ArrayNonEmpty<T>): List.NonEmpty<T> => {
    if (values.length <= this.maxBlockSize) return this.leafBlock(values);
    return this.from(values);
  };

  from = <T>(...sources: ArrayNonEmpty<StreamSource<T>>): any => {
    if (sources.length === 1) {
      const source = sources[0];
      if (source instanceof ListNonEmptyBase && source.context === this)
        return source;
    }

    let result: List<T> | null = null;

    let i = -1;
    const length = sources.length;

    while (++i < length) {
      const source = sources[i];

      if (!StreamSource.isEmptyInstance(source)) {
        if (source instanceof ListNonEmptyBase && source.context === this) {
          if (null === result) result = source as any as List<T>;
          else result = result.concat(source);
        } else {
          const builder = this.builder<T>();

          if (Array.isArray(source)) builder.appendArray(source);
          else builder.appendAll(source);

          if (!builder.isEmpty) {
            const build = builder.build();
            if (null === result) result = build;
            else result = result.concat(build);
          }
        }
      }
    }

    if (null === result) return this.empty();
    return result;
  };

  fromString = (...sources: ArrayNonEmpty<string>): any => {
    return this.from(...sources);
  };

  reducer = <T>(source?: StreamSource<T>): Reducer<T, List<T>> => {
    return Reducer.create(
      () =>
        undefined === source
          ? this.builder<T>()
          : this.from(source).toBuilder(),
      (builder, value) => {
        builder.append(value);
        return builder;
      },
      (builder) => builder.build()
    );
  };

  flatten = (source: any): any => this.from(source).flatMap((s: any) => s);

  unzip = (source: any, length: number): any => {
    const streams = Stream.unzip(source, length) as any as Stream<any>[];

    return Stream.from(streams).mapPure(this.from) as any;
  };

  leafBlock<T>(children: readonly T[]): LeafBlock<T> {
    return new LeafBlock(this, children);
  }

  reversedLeaf<T>(children: readonly T[]): ReversedLeafBlock<T> {
    return new ReversedLeafBlock(this, children);
  }

  leafTree<T>(
    left: LeafBlock<T>,
    right: LeafBlock<T>,
    middle: NonLeaf<T, LeafBlock<T>> | null
  ): LeafTree<T> {
    return new LeafTree(this, left, right, middle);
  }

  nonLeafBlock<T, C extends Block<T, C>>(
    length: number,
    children: readonly C[],
    level: number
  ): NonLeafBlock<T, C> {
    return new NonLeafBlock(this, length, children, level);
  }

  nonLeafTree<T, C extends Block<T, C>>(
    left: NonLeafBlock<T, C>,
    right: NonLeafBlock<T, C>,
    middle: NonLeaf<T, NonLeafBlock<T, C>> | null,
    level: number
  ): NonLeafTree<T, C> {
    return new NonLeafTree(this, left, right, middle, level);
  }

  leafBlockBuilderSource<T>(source: LeafBlock<T>): LeafBlockBuilder<T> {
    return new LeafBlockBuilder(this, source);
  }

  leafBlockBuilder<T>(children: T[]): LeafBlockBuilder<T> {
    return new LeafBlockBuilder(this, undefined, children);
  }

  leafTreeBuilderSource<T>(source: LeafTree<T>): LeafTreeBuilder<T> {
    return new LeafTreeBuilder(this, source);
  }

  leafTreeBuilder<T>(
    left: LeafBlockBuilder<T>,
    right: LeafBlockBuilder<T>,
    middle?: NonLeafBuilder<T, LeafBlockBuilder<T>>,
    length?: number
  ): LeafTreeBuilder<T> {
    return new LeafTreeBuilder(this, undefined, left, right, middle, length);
  }

  nonLeafBlockBuilderSource<T, C extends BlockBuilder<T>>(
    source: NonLeafBlock<T, any>
  ): NonLeafBlockBuilder<T, C> {
    return new NonLeafBlockBuilder(this, source.level, source);
  }

  nonLeafBlockBuilder<T, C extends BlockBuilder<T>>(
    level: number,
    children: C[],
    length: number
  ): NonLeafBlockBuilder<T, C> {
    return new NonLeafBlockBuilder(this, level, undefined, children, length);
  }

  nonLeafTreeBuilderSource<T, C extends BlockBuilder<T>>(
    source: NonLeafTree<T, any>
  ): NonLeafTreeBuilder<T, C> {
    return new NonLeafTreeBuilder(this, source.level, source);
  }

  nonLeafTreeBuilder<T, C extends BlockBuilder<T>>(
    level: number,
    left: NonLeafBlockBuilder<T, C>,
    right: NonLeafBlockBuilder<T, C>,
    middle?: NonLeafBuilder<T, NonLeafBlockBuilder<T, C>>,
    length?: number
  ): NonLeafTreeBuilder<T, C> {
    return new NonLeafTreeBuilder(
      this,
      level,
      undefined,
      left,
      right,
      middle,
      length
    );
  }

  isLeafBlock<T>(obj: List<T> | Block<T>): obj is LeafBlock<T> {
    return obj instanceof LeafBlock;
  }

  isReversedLeafBlock<T>(obj: List<T> | Block<T>): obj is ReversedLeafBlock<T> {
    return obj instanceof ReversedLeafBlock;
  }

  isNonLeafBlock<T>(
    obj: List<T> | Block<T> | NonLeaf<T>
  ): obj is NonLeafBlock<T, any> {
    return obj instanceof NonLeafBlock;
  }

  isLeafTree<T>(obj: List<T>): obj is LeafTree<T> {
    return obj instanceof LeafTree;
  }

  isNonLeafTree<T>(obj: NonLeaf<T>): obj is NonLeafTree<T, any> {
    return obj instanceof NonLeafTree;
  }

  isLeafBlockBuilder<T>(obj: LeafBuilder<T>): obj is LeafBlockBuilder<T> {
    return obj instanceof LeafBlockBuilder;
  }

  isLeafTreeBuilder<T>(obj: LeafBuilder<T>): obj is LeafTreeBuilder<T> {
    return obj instanceof LeafTreeBuilder;
  }

  isNonLeafBlockBuilder<T>(
    obj: NonLeafBuilder<T, any>
  ): obj is NonLeafBlockBuilder<T, any> {
    return obj instanceof NonLeafBlockBuilder;
  }
}
