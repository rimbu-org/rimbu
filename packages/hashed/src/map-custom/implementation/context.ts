import { RMapBase } from '@rimbu/collection-types/map-custom';
import { Eq, generateUUID } from '@rimbu/common';
import { List } from '@rimbu/list';

import type { HashMap } from '@rimbu/hashed/map';
import type {
  MapBlockBuilderEntry,
  MapEntrySet,
} from '@rimbu/hashed/map-custom';

import { Hasher } from '../../common';
import {
  HashMapNonEmptyBase,
  HashMapEmpty,
  HashMapBlock,
  HashMapCollision,
  HashMapBlockBuilder,
} from '@rimbu/hashed/map-custom';

export class HashMapContext<UK>
  extends RMapBase.ContextBase<UK, HashMap.Types>
  implements HashMap.Context<UK>
{
  readonly blockCapacity: number;
  readonly blockMask: number;
  readonly maxDepth: number;

  readonly _empty: HashMap<any, any>;
  readonly _emptyBlock: HashMapBlock<any, any>;

  constructor(
    options: HashMap.Context.Options<UK> = {},
    readonly hasher = options.hasher ?? Hasher.defaultHasher(),
    readonly eq = options.eq ?? Eq.defaultEq(),
    readonly blockSizeBits = options.blockSizeBits ?? 5,
    readonly listContext = options.listContext ?? List.defaultContext(),
    readonly contextId = options.contextId ?? generateUUID()
  ) {
    super();

    this.blockCapacity = 1 << blockSizeBits;
    this.blockMask = this.blockCapacity - 1;
    this.maxDepth = Math.ceil(32 / blockSizeBits);

    this._empty = Object.freeze(new HashMapEmpty<any, any>(this));
    this._emptyBlock = Object.freeze(new HashMapBlock(this, null, null, 0, 0));
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

  readonly builder = <K extends UK, V>(): HashMap.Builder<K, V> => {
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

  toJSON(): HashMap.Context.Serialized {
    return {
      typeTag: this.typeTag,
      contextId: this.contextId,
      hasherId: this.hasher.id,
      eqId: this.eq.id,
      blockSizeBits: this.blockSizeBits,
      listContext: this.listContext.toJSON(),
    };
  }
}

export function createHashMapContext<UK>(
  options?: HashMap.Context.Options<UK>
): HashMap.Context<UK> {
  return Object.freeze(new HashMapContext(options));
}
