import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { HashMap } from '@rimbu/hashed/map';
import type { StreamSource } from '@rimbu/stream';

import { CollectionContextBaseWithAddAll } from '@rimbu/collection-types/advanced/collection-base';
import { Eq } from '@rimbu/common';
import { Hasher } from '@rimbu/hashed';
import { List } from '@rimbu/list';
import { Reducer } from '@rimbu/stream/reducer';

import { HashMapBlock, type MapEntrySet } from '#map/immutable/block';
import { HashMapCollision } from '#map/immutable/collision';
import { HashMapEmpty } from '#map/immutable/empty';
import { HashMapNonEmptyBase } from '#map/immutable/non-empty';
import {
	HashMapBlockBuilder,
	type MapBlockBuilderEntry,
} from '#map/mutable/block-builder';

export class HashMapContext<UK>
	extends CollectionContextBaseWithAddAll<HashMap.Advanced.Family<UK, any>>
	implements HashMap.Advanced.ContextApi<UK, HashMap.Advanced.Family<UK, any>>
{
	constructor(
		readonly _hasher: Hasher<UK> | undefined = undefined,
		readonly _eq: Eq<UK> | undefined = undefined,
		readonly blockSizeBits: number = 5,
		readonly listContext = List.defaultContext,
	) {
		super();

		this.blockCapacity = 1 << blockSizeBits;
		this.blockMask = this.blockCapacity - 1;
		this.maxDepth = Math.ceil(32 / blockSizeBits);
	}

	readonly blockCapacity: number;
	readonly blockMask: number;
	readonly maxDepth: number;

	get keyedContext(): KeyedCollection.Advanced.KeyedContextApi<
		HashMap.Advanced.Family<UK, any>
	> {
		return this as any;
	}

	get hasher(): Hasher<UK> {
		return this._hasher ?? Hasher.defaultInstance;
	}

	get eq(): Eq<UK> {
		return this._eq ?? Eq.defaultInstance;
	}

	hash(value: UK): number {
		return this.hasher.hash(value);
	}

	isValidKey(key: unknown): key is UK {
		return this.hasher.isValid(key);
	}

	#emptyBlock: HashMapBlock<UK, any> | undefined;

	emptyBlock<V>(): HashMapBlock<UK, V> {
		if (undefined === this.#emptyBlock) {
			this.#emptyBlock = new HashMapBlock<UK, any>(this, null, null, 0, 0);
		}

		return this.#emptyBlock as HashMapBlock<UK, V>;
	}

	block<K extends UK, V>(
		entries: (readonly [K, V])[] | null,
		entrySets: MapEntrySet<K, V>[] | null,
		size: number,
		level: number,
	): HashMapBlock<K, V> {
		return new HashMapBlock<K, V>(
			this as unknown as HashMapContext<K>,
			entries,
			entrySets,
			size,
			level,
		);
	}

	collision<K extends UK, V>(
		entries: List.NonEmpty<readonly [K, V]>,
	): HashMapCollision<K, V> {
		return new HashMapCollision<K, V>(
			this as unknown as HashMapContext<K>,
			entries,
		);
	}

	isHashMapBlock<K, V>(obj: MapEntrySet<K, V>): obj is HashMapBlock<K, V> {
		return obj instanceof HashMapBlock;
	}

	createBuilder<K extends UK, V>(
		source?: HashMap.NonEmpty<K, V>,
	): HashMap.Builder<K, V> {
		return new HashMapBlockBuilder<K, V>(
			this as unknown as HashMapContext<K>,
			source as unknown as HashMapBlock<K, V>,
		);
	}

	isHashMapBlockBuilder<K, V>(
		obj: MapBlockBuilderEntry<K, V>,
	): obj is HashMapBlockBuilder<K, V> {
		return obj instanceof HashMapBlockBuilder;
	}

	isNonEmptyInstance<K extends UK, V>(
		source: unknown,
	): source is HashMap.NonEmpty<K, V> {
		return source instanceof HashMapNonEmptyBase;
	}

	getKeyIndex(level: number, hash: number): number {
		const shift = this.blockSizeBits * level;
		return (hash >>> shift) & this.blockMask;
	}

	#empty: HashMap<UK, any> | undefined;

	empty = <E extends readonly [UK, any]>(): HashMap<E[0], E[1]> => {
		if (undefined === this.#empty) {
			this.#empty = new HashMapEmpty<UK, any>(this);
		}

		return this.#empty;
	};

	builder = <E extends readonly [UK, any]>(): HashMap.Builder<E[0], E[1]> => {
		return new HashMapBlockBuilder(this);
	};

	reducer = <E2 extends readonly [UK, any]>(
		source?: StreamSource<E2>,
	): Reducer<E2, HashMap<E2[0], E2[1]>> => {
		return Reducer.create(
			() =>
				undefined === source
					? this.builder<E2>()
					: this.from(source).toBuilder(),
			(builder, entry) => {
				builder.add(entry);
				return builder;
			},
			(builder) => builder.build(),
		);
	};

	createContext = <K>(options: {
		hasher?: Hasher<K> | undefined;
		eq?: Eq<K> | undefined;
		blockSizeBits?: number | undefined;
		listContext?: List.Context | undefined;
	}): HashMap.Context<K> => {
		return new HashMapContext<K>(
			options.hasher,
			options.eq,
			options.blockSizeBits,
			options.listContext,
		);
	};
}
