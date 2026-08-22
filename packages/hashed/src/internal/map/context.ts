// @ts-nocheck
import type { HashMap } from '@rimbu/hashed/map';

import { type ArrayNonEmpty, Eq } from '@rimbu/common';
import { Hasher } from '@rimbu/hashed';
import { List } from '@rimbu/list';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import {
	HashMapBlockBuilder,
	type HashMapBuilderContext,
	type MapBlockBuilderEntry,
} from '#map/builder';
import {
	HashMapBlock,
	HashMapCollision,
	HashMapEmpty,
	type HashMapEmptyContext,
	HashMapNonEmptyBase,
	type HashMapNonEmptyContext,
	type MapEntrySet,
} from '#map/immutable';

export class HashMapContext<UK>
	implements HashMap.Advanced.ContextApi<UK, HashMap.Advanced.Family<UK, any>>
{
	constructor(
		readonly _hasher: Hasher<UK> | undefined = undefined,
		readonly _eq: Eq<UK> | undefined = undefined,
		readonly blockSizeBits: number = 5,
		readonly listContext = List.defaultContext,
	) {
		this.blockCapacity = 1 << blockSizeBits;
		this.blockMask = this.blockCapacity - 1;
		this.maxDepth = Math.ceil(32 / blockSizeBits);
	}

	readonly blockCapacity: number;
	readonly blockMask: number;
	readonly maxDepth: number;

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
			this.#emptyBlock = new HashMapBlock<UK, any>(
				this as unknown as HashMapNonEmptyContext<UK, any>,
				null,
				null,
				0,
				0,
			);
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
			this as unknown as HashMapNonEmptyContext<K, V>,
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
			this as unknown as HashMapNonEmptyContext<K, V>,
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
			this as unknown as HashMapBuilderContext<K, V>,
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

	empty = <K extends UK, V>(): HashMap<K, V> => {
		if (undefined === this.#empty) {
			this.#empty = new HashMapEmpty<K, V>(
				this as unknown as HashMapEmptyContext<K, V>,
			);
		}
		return this.#empty as unknown as HashMap<K, V>;
	};

	builder = <K extends UK, V>(): HashMap.Builder<K, V> => {
		return new HashMapBlockBuilder<K, V>(
			this as unknown as HashMapBuilderContext<K, V>,
		);
	};

	from = <K extends UK, V>(
		...sources: StreamSource<readonly [K, V]>[]
	): HashMap<K, V> => {
		let builder = this.builder<K, V>();

		const length = sources.length;
		let i = -1;

		while (++i < length) {
			const source = sources[i];
			if (Stream.isEmptyStreamSourceInstance(source)) continue;
			if (
				builder.isEmpty &&
				this.isNonEmptyInstance<K, V>(source) &&
				source.context === this
			) {
				if (i === length - 1) return source;
				builder = source.toBuilder();
				continue;
			}
			builder.setAll(source);
		}

		return builder.build();
	};

	of = <K extends UK, V>(
		...entries: ArrayNonEmpty<readonly [K, V]>
	): HashMap.NonEmpty<K, V> => {
		return this.from(...entries);
	};

	reducer = <K extends UK, V>(
		source?: StreamSource<readonly [K, V]>,
	): Reducer<readonly [K, V], HashMap<K, V>> => {
		return Reducer.create(
			() =>
				undefined === source
					? this.builder<K, V>()
					: this.from(source).toBuilder(),
			(builder, entry) => {
				builder.setEntry(entry);
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
