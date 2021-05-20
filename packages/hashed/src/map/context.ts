import { CustomBase } from '@rimbu/collection-types';
import { Eq } from '@rimbu/common';
import { List } from '@rimbu/list';
import {
  HashMapBlock,
  HashMapBlockBuilder,
  HashMapCollision,
  HashMapEmpty,
  HashMapNonEmptyBase,
  MapEntrySet,
} from '../hashmap-custom';
import { Hasher, HashMap } from '../internal';

export class HashMapContext<UK>
  extends CustomBase.RMapBase.ContextBase<UK, HashMap.Types>
  implements HashMap.Context<UK> {
  constructor(
    readonly hasher: Hasher<UK>,
    readonly eq: Eq<UK>,
    readonly blockSizeBits: number,
    readonly listContext: List.Context
  ) {
    super();
  }

  readonly typeTag = 'HashMap';
  readonly blockCapacity = 1 << this.blockSizeBits;
  readonly blockMask = this.blockCapacity - 1;
  readonly maxDepth = Math.ceil(32 / this.blockSizeBits);

  readonly _empty = new HashMapEmpty<any, any>(this);
  readonly _emptyBlock: HashMapBlock<any, any> = new HashMapBlock(
    this,
    null,
    null,
    0,
    0
  );

  hash(value: UK): number {
    return this.hasher.hash(value);
  }

  getKeyIndex(level: number, hash: number): number {
    const shift = this.blockSizeBits * level;
    return (hash >>> shift) & this.blockMask;
  }

  isNonEmptyInstance(source: any): source is any {
    return source instanceof HashMapNonEmptyBase;
  }

  builder = <K extends UK, V>(): HashMap.Builder<K, V> => {
    return new HashMapBlockBuilder<K, V>(this as any);
  };

  createBuilder<K extends UK, V>(
    source?: HashMap.NonEmpty<K, V>
  ): HashMap.Builder<K, V> {
    return new HashMapBlockBuilder<K, V>(
      this as any,
      source as HashMapBlock<K, V> | undefined
    );
  }

  isValidKey(key: unknown): key is UK {
    return this.hasher.isValid(key);
  }

  emptyBlock<V>(): HashMapBlock<UK, V> {
    return this._emptyBlock;
  }

  block<V>(
    entries: (readonly [UK, V])[] | null,
    entrySets: MapEntrySet<UK, V>[] | null,
    size: number,
    level: number
  ): HashMapBlock<UK, V> {
    return new HashMapBlock(this, entries, entrySets, size, level);
  }

  collision<V>(
    entries: List.NonEmpty<readonly [UK, V]>
  ): HashMapCollision<UK, V> {
    return new HashMapCollision(this, entries);
  }
}
