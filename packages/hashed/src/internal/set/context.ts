import type { HashSet } from '@rimbu/hashed';

import { type ArrayNonEmpty, Eq } from '@rimbu/common';
import { Hasher } from '@rimbu/hashed';
import { List } from '@rimbu/list';
import { Stream, type StreamSource } from '@rimbu/stream';

import {
	HashSetBlockBuilder,
	type HashSetBuilderContext,
	type SetBlockBuilderEntry,
} from '#set/builder';
import {
	HashSetBlock,
	HashSetCollision,
	HashSetEmpty,
	type HashSetEmptyContext,
	HashSetNonEmptyBase,
	type HashSetNonEmptyContext,
	type SetEntrySet,
} from '#set/immutable';

export class HashSetContext<UE>
	implements HashSet.Advanced.ContextApi<UE, HashSet.Advanced.Family<UE>>
{
	constructor(
		readonly hasher: Hasher<UE> = Hasher.defaultInstance,
		readonly eq: Eq<UE> = Eq.defaultInstance,
		readonly blockSizeBits: number = 5,
		readonly listContext = List.defaultContext,
	) {
		this.blockCapacity = 1 << blockSizeBits;
		this.blockMask = this.blockCapacity - 1;
		this.maxDepth = Math.ceil(32 / blockSizeBits);

		this.hash = hasher.hash;
	}

	readonly blockCapacity: number;
	readonly blockMask: number;
	readonly maxDepth: number;

	readonly hash: (value: UE) => number;

	#emptyBlock: HashSetBlock<UE> | undefined;

	emptyBlock<T extends UE>(): HashSetBlock<T> {
		if (undefined === this.#emptyBlock) {
			this.#emptyBlock = Object.freeze(
				new HashSetBlock<UE>(
					this as unknown as HashSetNonEmptyContext<UE>,
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
			this as unknown as HashSetNonEmptyContext<T>,
			entries,
			entrySets,
			size,
			level,
		);
	}

	collision<T extends UE>(entries: List.NonEmpty<T>): HashSetCollision<T> {
		return new HashSetCollision<T>(
			this as unknown as HashSetNonEmptyContext<T>,
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
			this as unknown as HashSetBuilderContext<T>,
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

	empty = <T extends UE>(): HashSet<T> => {
		return new HashSetEmpty<T>(this as unknown as HashSetEmptyContext<T>);
	};

	builder = <T extends UE>(): HashSet.Builder<T> => {
		return new HashSetBlockBuilder<T>(
			this as unknown as HashSetBuilderContext<T>,
		);
	};

	from<T extends UE>(
		...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
	): HashSet.NonEmpty<T>;
	from<T extends UE>(...sources: ArrayNonEmpty<StreamSource<T>>): HashSet<T>;
	from<T extends UE>(...sources: StreamSource<T>[]): HashSet<T> {
		let builder: HashSet.Builder<T> = this.builder<T>();

		let i = -1;
		const length = sources.length;
		while (++i < length) {
			const source = sources[i];
			if (Stream.isEmptyStreamSourceInstance(source)) continue;
			if (
				builder.isEmpty &&
				this.isNonEmptyInstance<T>(source) &&
				source.context === (this as unknown as HashSet.Context<T>)
			) {
				if (i === length - 1) return source;
				builder = source.toBuilder();
				continue;
			}
			builder.addAll(source);
		}

		return builder.build();
	}

	of = <T extends UE>(...elements: ArrayNonEmpty<T>): HashSet.NonEmpty<T> => {
		return this.from(elements) as HashSet.NonEmpty<T>;
	};

	createContext = <T extends UE>(options: {
		hasher?: Hasher<T> | undefined;
		eq?: Eq<T> | undefined;
		blockSizeBits?: number | undefined;
		listContext?: List.Context | undefined;
	}): HashSetContext<T> => {
		return new HashSetContext<T>(
			options.hasher,
			options.eq,
			options.blockSizeBits,
			options.listContext,
		);
	};
}
