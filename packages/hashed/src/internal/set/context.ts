import type { Collection } from '@rimbu/collection-types/collection';
import type { HashSet } from '@rimbu/hashed';

import { type ArrayNonEmpty, Eq } from '@rimbu/common';
import { Hasher } from '@rimbu/hashed';
import { List } from '@rimbu/list';
import { Stream, type StreamSource } from '@rimbu/stream';
import { HashSetBlockBuilder, type SetBlockBuilderEntry } from './builder';
import {
	HashSetBlock,
	HashSetCollision,
	HashSetEmpty,
	HashSetNonEmptyBase,
	type SetEntrySet,
} from './immutable';

export class HashSetContext<
	F extends HashSet.Advanced.Family<any> = HashSet.Advanced.Family<any>,
> implements HashSet.Advanced.ContextApi<F>
{
	constructor(
		readonly hasher: Hasher<F['_UPPER_E']> = Hasher.defaultInstance,
		readonly eq: Eq<F['_UPPER_E']> = Eq.defaultInstance,
		readonly blockSizeBits: number = 5,
		readonly listContext = List.defaultContext,
	) {}

	#emptyBlock: HashSetBlock<F['_UPPER_E']> | undefined;

	emptyBlock<T extends F['_UPPER_E']>(): HashSetBlock<T> {
		if (undefined === this.#emptyBlock) {
			this.#emptyBlock = Object.freeze(
				new HashSetBlock<F['_UPPER_E']>(this, null, null, 0, 0),
			);
		}

		return this.#emptyBlock as any;
	}

	block<T extends F['_UPPER_E']>(
		entries: readonly T[] | null,
		entrySets: SetEntrySet<T>[] | null,
		size: number,
		level: number,
	): HashSetBlock<T> {
		return new HashSetBlock(this, entries, entrySets, size, level);
	}

	collision<T extends F['_UPPER_E']>(
		entries: List.NonEmpty<T>,
	): HashSetCollision<T> {
		return new HashSetCollision(this, entries);
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

	createBuilder<T extends F['_UPPER_E']>(
		source?: HashSet.NonEmpty<T>,
	): HashSet.Builder<T> {
		return new HashSetBlockBuilder<T>(this, source);
	}

	isHashSetBlockBuilder<T>(
		obj: SetBlockBuilderEntry<T>,
	): obj is HashSetBlockBuilder<T> {
		return obj instanceof HashSetBlockBuilder;
	}

	isNonEmptyInstance<T>(source: unknown): source is HashSet.NonEmpty<T> {
		return source instanceof HashSetNonEmptyBase;
	}

	empty = <T extends F['_UPPER_E']>() => new HashSetEmpty<T>(this);

	builder = <T extends F['_UPPER_E']>() => new HashSetBlockBuilder<T>(this);

	from = <T extends F['_UPPER_E']>(
		...sources: StreamSource<T>[]
	): Collection.Advanced.Types<F, T>['_NON_EMPTY'] => {
		let builder = this.builder<T>();

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
	};

	of = <T extends F['_UPPER_E']>(
		...elements: ArrayNonEmpty<T>
	): Collection.Advanced.Types<F, T>['_NON_EMPTY'] => this.from(elements);

	createContext = (options: any) => {
		return new HashSetContext();
	};
}
