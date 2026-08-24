import type { HashSet } from '@rimbu/hashed';
import type { StreamSource } from '@rimbu/stream';

import { CollectionContextBaseWithAddAll } from '@rimbu/collection-types/advanced/collection-base';
import { Eq } from '@rimbu/common';
import { Hasher } from '@rimbu/hashed';
import { List } from '@rimbu/list';
import { Reducer } from '@rimbu/stream/reducer';
import { HashSetEmpty } from './immutable/empty';
import { HashSetNonEmptyBase } from './immutable/non-empty';

import { HashSetBlockBuilder, type SetBlockBuilderEntry } from '#set/builder';
import { HashSetBlock, type SetEntrySet } from '#set/immutable/block';
import { HashSetCollision } from '#set/immutable/collision';

export class HashSetContext<UE>
	extends CollectionContextBaseWithAddAll<HashSet.Advanced.Family<UE>>
	implements HashSet.Advanced.ContextApi<UE, HashSet.Advanced.Family<UE>>
{
	static createDefault<UE>(
		hasher?: Hasher<UE> | undefined,
		eq?: Eq<UE> | undefined,
		blockSizeBits?: number,
		listContext?: List.Context | undefined,
	) {
		const result: HashSetContext<UE> = new HashSetContext(
			hasher,
			eq,
			blockSizeBits,
			listContext,
			() => result,
		);

		return result;
	}

	private constructor(
		readonly _hasher: Hasher<UE> | undefined = undefined,
		readonly _eq: Eq<UE> | undefined = undefined,
		readonly blockSizeBits: number = 5,
		readonly listContext = List.defaultContext,
		readonly getDefaultInstance: () => HashSetContext<any>,
	) {
		super();
		this.blockCapacity = 1 << blockSizeBits;
		this.blockMask = this.blockCapacity - 1;
		this.maxDepth = Math.ceil(32 / blockSizeBits);
	}

	get defaultContext(): HashSetContext<any> {
		return this.getDefaultInstance();
	}

	readonly blockCapacity: number;
	readonly blockMask: number;
	readonly maxDepth: number;

	get hasher(): Hasher<UE> {
		return this._hasher ?? Hasher.defaultInstance;
	}

	get eq(): Eq<UE> {
		return this._eq ?? Eq.defaultInstance;
	}

	hash(value: UE) {
		return this.hasher.hash(value);
	}

	#emptyBlock: HashSetBlock<UE> | undefined;

	emptyBlock<T extends UE>(): HashSetBlock<T> {
		if (undefined === this.#emptyBlock) {
			this.#emptyBlock = Object.freeze(
				new HashSetBlock<UE>(
					this as unknown as HashSetContext<UE>,
					null,
					null,
					0,
					0,
				),
			);
		}

		return this.#emptyBlock as HashSetBlock<any>;
	}

	block<T extends UE>(
		entries: readonly T[] | null,
		entrySets: SetEntrySet<T>[] | null,
		size: number,
		level: number,
	): HashSetBlock<T> {
		return new HashSetBlock<T>(
			this as unknown as HashSetContext<T>,
			entries,
			entrySets,
			size,
			level,
		);
	}

	collision<T extends UE>(entries: List.NonEmpty<T>): HashSetCollision<T> {
		return new HashSetCollision<T>(
			this as unknown as HashSetContext<T>,
			entries,
		);
	}

	isHashSetBlock<T extends UE>(
		obj: SetEntrySet<T> | StreamSource<T>,
	): obj is HashSetBlock<T> {
		return obj instanceof HashSetBlock;
	}

	isHashSetCollision<T extends UE>(
		obj: SetEntrySet<T> | StreamSource<T>,
	): obj is HashSetCollision<T> {
		return obj instanceof HashSetCollision;
	}

	createBuilder<T extends UE>(
		source?: HashSet.NonEmpty<T>,
	): HashSet.Builder<T> {
		return new HashSetBlockBuilder<T>(
			this as unknown as HashSetContext<T>,
			source as unknown as HashSetBlock<T>,
		);
	}

	isHashSetBlockBuilder<T extends UE>(
		obj: SetBlockBuilderEntry<T>,
	): obj is HashSetBlockBuilder<T> {
		return obj instanceof HashSetBlockBuilder;
	}

	isNonEmptyInstance<T extends UE>(
		source: unknown,
	): source is HashSet.NonEmpty<T> {
		return source instanceof HashSetNonEmptyBase;
	}

	getKeyIndex(level: number, hash: number): number {
		const shift = this.blockSizeBits * level;
		return (hash >>> shift) & this.blockMask;
	}

	#empty: HashSet<UE> | undefined;

	empty = <T extends UE>(): HashSet<T> => {
		if (undefined === this.#empty) {
			this.#empty = Object.freeze(
				new HashSetEmpty<UE>(this as unknown as HashSetContext<UE>),
			);
		}

		return this.#empty as unknown as HashSet<T>;
	};

	builder = <T extends UE>(): HashSet.Builder<T> => {
		return new HashSetBlockBuilder<T>(this as unknown as HashSetContext<T>);
	};

	reducer = <E extends UE>(
		source?: StreamSource<E>,
	): Reducer<E, HashSet<E>> => {
		return Reducer.create(
			() =>
				undefined === source
					? this.builder<E>()
					: this.from(source).toBuilder(),
			(builder, element) => {
				builder.add(element);
				return builder;
			},
			(builder) => builder.build(),
		);
	};

	createContext = <T>(options: {
		hasher?: Hasher<T> | undefined;
		eq?: Eq<T> | undefined;
		blockSizeBits?: number | undefined;
		listContext?: List.Context | undefined;
	}): HashSet.Context<T> => {
		return new HashSetContext<T>(
			options.hasher,
			options.eq,
			options.blockSizeBits,
			options.listContext,
			this.getDefaultInstance,
		);
	};
}
