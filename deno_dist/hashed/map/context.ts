import { CustomBase } from '../../collection-types/mod.ts';
import type { Eq } from '../../common/mod.ts';
import type { List } from '../../list/mod.ts';
import type { Hasher } from '../hasher.ts';
import {
  HashMapBlock,
  HashMapBlockBuilder,
  HashMapCollision,
  HashMapEmpty,
  HashMapNonEmptyBase,
  MapBlockBuilderEntry,
  MapEntrySet
} from '../hashmap-custom.ts';
import type { HashMap } from '../internal.ts';

export class HashMapContext<UK>
  extends CustomBase.RMapBase.ContextBase<UK, HashMap.Types>
  implements HashMap.Context<UK>
{
  readonly blockCapacity: number;
  readonly blockMask: number;
  readonly maxDepth: number;

  readonly _empty: HashMap<any, any>;
  readonly _emptyBlock: HashMapBlock<any, any>;

  constructor(
    readonly hasher: Hasher<UK>,
    readonly eq: Eq<UK>,
    readonly blockSizeBits: number,
    readonly listContext: List.Context
  ) {
    super();

    this.blockCapacity = 1 << blockSizeBits;
    this.blockMask = this.blockCapacity - 1;
    this.maxDepth = Math.ceil(32 / blockSizeBits);

    this._empty = new HashMapEmpty<any, any>(this);
    this._emptyBlock = new HashMapBlock(this, null, null, 0, 0);
  }

  readonly typeTag = 'HashMap';

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

  isHashMapBlock<K, V>(obj: MapEntrySet<K, V>): obj is HashMapBlock<K, V> {
    return obj instanceof HashMapBlock;
  }

  isHashMapBlockBuilder<K, V>(
    obj: MapBlockBuilderEntry<K, V>
  ): obj is HashMapBlockBuilder<K, V> {
    return obj instanceof HashMapBlockBuilder;
  }
}
