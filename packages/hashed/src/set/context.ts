import { CustomBase } from '@rimbu/collection-types';
import type { Eq } from '@rimbu/common';
import type { List } from '@rimbu/list';
import type { StreamSource } from '@rimbu/stream';
import type { Hasher } from '../hasher';
import {
  HashSetBlock,
  HashSetBlockBuilder,
  HashSetCollision,
  HashSetEmpty,
  HashSetNonEmptyBase,
  SetBlockBuilderEntry,
  SetEntrySet,
} from '../hashset-custom';
import type { HashSet } from '../internal';

export class HashSetContext<UT>
  extends CustomBase.RSetBase.ContextBase<UT, HashSet.Types>
  implements HashSet.Context<UT>
{
  readonly blockCapacity: number;
  readonly blockMask: number;
  readonly maxDepth: number;

  readonly _empty: HashSet<any>;
  readonly _emptyBlock: HashSetBlock<any>;

  constructor(
    readonly hasher: Hasher<UT>,
    readonly eq: Eq<UT>,
    readonly blockSizeBits: number,
    readonly listContext: List.Context
  ) {
    super();

    this.blockCapacity = 1 << blockSizeBits;
    this.blockMask = this.blockCapacity - 1;
    this.maxDepth = Math.ceil(32 / blockSizeBits);

    this._empty = new HashSetEmpty<any>(this);
    this._emptyBlock = new HashSetBlock(this, null, null, 0, 0);
  }

  readonly typeTag = 'HashSet';

  isNonEmptyInstance(source: any): source is any {
    return source instanceof HashSetNonEmptyBase;
  }

  hash(value: UT): number {
    return this.hasher.hash(value);
  }

  getKeyIndex(level: number, hash: number): number {
    const shift = this.blockSizeBits * level;
    return (hash >>> shift) & this.blockMask;
  }

  emptyBlock(): HashSetBlock<UT> {
    return this._emptyBlock;
  }

  isValidValue(value: unknown): value is UT {
    return this.hasher.isValid(value);
  }

  builder = <T extends UT>(): HashSet.Builder<T> => {
    return new HashSetBlockBuilder<T>(this as any);
  };

  createBuilder<T extends UT>(
    source?: HashSet.NonEmpty<T>
  ): HashSet.Builder<T> {
    return new HashSetBlockBuilder<T>(this as any, source as any);
  }

  block(
    entries: readonly UT[] | null,
    entrySets: SetEntrySet<UT>[] | null,
    size: number,
    level: number
  ): HashSetBlock<UT> {
    return new HashSetBlock(
      this as unknown as HashSetContext<UT>,
      entries,
      entrySets,
      size,
      level
    );
  }

  collision(entries: List.NonEmpty<UT>): HashSetCollision<UT> {
    return new HashSetCollision(this as unknown as HashSetContext<UT>, entries);
  }

  isHashSetBlock<T>(
    obj: SetEntrySet<T> | StreamSource<T>
  ): obj is HashSetBlock<T> {
    return obj instanceof HashSetBlock;
  }

  isHashSetCollision<T>(
    obj: SetEntrySet<T> | StreamSource<T>
  ): obj is HashSetCollision<T> {
    return obj instanceof HashSetCollision;
  }

  isHashSetBlockBuilder<T>(
    obj: SetBlockBuilderEntry<T>
  ): obj is HashSetBlockBuilder<T> {
    return obj instanceof HashSetBlockBuilder;
  }
}
