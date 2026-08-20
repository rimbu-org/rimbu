import type { HashSet } from '@rimbu/hashed';

import { type ArrayNonEmpty, Eq } from '@rimbu/common';
import { Hasher } from '@rimbu/hashed';
import { List } from '@rimbu/list';
import { Stream, type StreamSource } from '@rimbu/stream';

import { HashSetBlockBuilder, type SetBlockBuilderEntry } from '#set/builder';
import {
	HashSetBlock,
	HashSetCollision,
	HashSetEmpty,
	HashSetNonEmptyBase,
	type SetEntrySet,
} from '#set/immutable';

export class HashSetContext<UE>
	implements HashSet.Advanced.ContextApi<UE, HashSet.Advanced.Family<UE>>
{
	constructor(
		readonly hasher: Hasher<any> = Hasher.defaultInstance,
		readonly eq: Eq<any> = Eq.defaultInstance,
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

	readonly hash: (value: any) => number;

	#emptyBlock: HashSetBlock<any> | undefined;

	emptyBlock<T>(): HashSetBlock<T> {
		if (undefined === this.#emptyBlock) {
			this.#emptyBlock = Object.freeze(
				new HashSetBlock<any>(this, null, null, 0, 0),
			);
		}

		return this.#emptyBlock as any;
	}

	block<T>(
		entries: readonly T[] | null,
		entrySets: SetEntrySet<T>[] | null,
		size: number,
		level: number,
	): HashSetBlock<T> {
		return new HashSetBlock(this, entries, entrySets, size, level);
	}

	collision<T>(entries: List.NonEmpty<T>): HashSetCollision<T> {
		return new HashSetCollision<T>(this, entries);
	}

	isHashSetBlock<T>(
		obj: SetEntrySet<T> | StreamSource<T>,
	): obj is HashSetBlock<T> {
		return obj instanceof HashSetBlock;
	}

	isHashSetCollision<T>(
		obj: SetEntrySet<T> | StreamSource<T>,
	): obj is HashSetCollision<T> {
		return obj instanceof HashSetCollision;
	}

	createBuilder<T>(source?: HashSet.NonEmpty<T>): HashSet.Builder<T> {
		return new HashSetBlockBuilder<T>(this, source as HashSetBlock<T>);
	}

	isHashSetBlockBuilder<T>(
		obj: SetBlockBuilderEntry<T>,
	): obj is HashSetBlockBuilder<T> {
		return obj instanceof HashSetBlockBuilder;
	}

	isNonEmptyInstance<T>(source: unknown): source is HashSet.NonEmpty<T> {
		return source instanceof HashSetNonEmptyBase;
	}

	getKeyIndex(level: number, hash: number): number {
		const shift = this.blockSizeBits * level;
		return (hash >>> shift) & this.blockMask;
	}

	empty = <T>(): HashSet<T> => {
		return new HashSetEmpty<T>(this);
	};

	builder = <T>(): HashSet.Builder<T> => {
		return new HashSetBlockBuilder<T>(this);
	};

	from<T>(
		...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
	): HashSet.NonEmpty<T>;
	from<T>(...sources: ArrayNonEmpty<StreamSource<T>>): HashSet<T>;
	from<T>(...sources: StreamSource<T>[]): HashSet<T> {
		let builder: HashSet.Builder<T> = this.builder<T>();

		let i = -1;
		const length = sources.length;
		while (++i < length) {
			const source = sources[i];
			if (Stream.isEmptyStreamSourceInstance(source)) continue;
			if (
				builder.isEmpty &&
				this.isNonEmptyInstance<T>(source) &&
				source.context === this
			) {
				if (i === length - 1) return source;
				builder = source.toBuilder();
				continue;
			}
			builder.addAll(source);
		}

		return builder.build();
	}

	of = <T>(...elements: ArrayNonEmpty<T>): HashSet.NonEmpty<T> => {
		return this.from(elements) as HashSet.NonEmpty<T>;
	};

	createContext = <UT>(options: {
		hasher?: Hasher<UT> | undefined;
		eq?: Eq<UT> | undefined;
		blockSizeBits?: number | undefined;
		listContext?: List.Context | undefined;
	}): HashSetContext<UT> => {
		return new HashSetContext(
			options.hasher,
			options.eq,
			options.blockSizeBits,
			options.listContext,
		);
	};
}
