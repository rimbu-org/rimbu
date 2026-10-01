import type { MapCollection } from '@rimbu/collection-types/map';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { MultiMap } from '@rimbu/multimap';
import type { StreamSource } from '@rimbu/stream';

import { HashMap } from '@rimbu/hashed/map';
import { HashSet } from '@rimbu/hashed/set';
import { Stream } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { MultiMapBuilder } from '#multimap/builder';
import { MultiMapEmpty } from '#multimap/immutable/empty';
import { MultiMapNonEmpty } from '#multimap/immutable/non-empty';

export class MultiMapContextImpl<UK, UV> {
	/**
	 * The default context: hash keys, hash values. `createContext` is the way to
	 * get any other combination.
	 */
	static createDefault<UK, UV>(options?: {
		keyMapContext?:
			| MapCollection.Context<MapCollection.Advanced.Family<UK, any>>
			| undefined;
		keyMapValuesContext?:
			| SetCollection.Context<SetCollection.Advanced.Family<UV>>
			| undefined;
	}): MultiMapContextImpl<UK, UV> {
		const result: MultiMapContextImpl<UK, UV> = new MultiMapContextImpl(
			options?.keyMapContext,
			options?.keyMapValuesContext,
			() => result,
		);

		return result;
	}

	readonly typeTag = 'MultiMap' as const;

	#keyMapContext:
		| MapCollection.Context<MapCollection.Advanced.Family<UK, any>>
		| undefined;
	#keyMapValuesContext:
		| SetCollection.Context<SetCollection.Advanced.Family<UV>>
		| undefined;
	#getDefaultInstance: () => MultiMapContextImpl<any, any>;

	constructor(
		keyMapContext:
			| MapCollection.Context<MapCollection.Advanced.Family<UK, any>>
			| undefined,
		keyMapValuesContext:
			| SetCollection.Context<SetCollection.Advanced.Family<UV>>
			| undefined,
		getDefaultInstance: () => MultiMapContextImpl<any, any>,
	) {
		this.#keyMapContext = keyMapContext;
		this.#keyMapValuesContext = keyMapValuesContext;
		this.#getDefaultInstance = getDefaultInstance;
	}

	get keyMapContext(): MapCollection.Context<
		MapCollection.Advanced.Family<UK, any>
	> {
		if (undefined === this.#keyMapContext) {
			this.#keyMapContext = HashMap.createContext(
				{},
			) as unknown as MapCollection.Context<
				MapCollection.Advanced.Family<UK, any>
			>;
		}

		return this.#keyMapContext;
	}

	get keyMapValuesContext(): SetCollection.Context<
		SetCollection.Advanced.Family<UV>
	> {
		if (undefined === this.#keyMapValuesContext) {
			this.#keyMapValuesContext = HashSet.createContext(
				{},
			) as unknown as SetCollection.Context<SetCollection.Advanced.Family<UV>>;
		}

		return this.#keyMapValuesContext;
	}

	get keyedContext(): MultiMapContextImpl<UK, UV> {
		return this;
	}

	get defaultContext(): MultiMap.Context<UK, UV> {
		return this.#getDefaultInstance() as unknown as MultiMap.Context<UK, UV>;
	}

	createContext = <K, V>(options?: {
		keyMapContext?:
			| MapCollection.Context<MapCollection.Advanced.Family<K, any>>
			| undefined;
		keyMapValuesContext?:
			| SetCollection.Context<SetCollection.Advanced.Family<V>>
			| undefined;
	}): MultiMap.Context<K, V> => {
		return MultiMapContextImpl.createDefault<K, V>(
			options,
		) as unknown as MultiMap.Context<K, V>;
	};

	#empty: MultiMap<UK, any> | undefined;

	empty = <E extends readonly [UK, UV]>(): MultiMap<E[0], E[1]> => {
		if (undefined === this.#empty) {
			this.#empty = new MultiMapEmpty<UK, any>(
				this as unknown as MultiMapContextImpl<UK, any>,
			) as unknown as MultiMap<UK, any>;
		}

		return this.#empty as unknown as MultiMap<E[0], E[1]>;
	};

	builder = <E extends readonly [UK, UV]>(): MultiMap.Builder<E[0], E[1]> => {
		return new MultiMapBuilder(
			this as unknown as MultiMapContextImpl<E[0], E[1]>,
		) as unknown as MultiMap.Builder<E[0], E[1]>;
	};

	/**
	 * Implemented here rather than inherited from
	 * `ContextBaseWithAddEach`, which requires the family to extend
	 * `Collection.Advanced.Family` — an extends clause that cannot also carry the
	 * capability families (their `_BUILDER` slots are narrower, so the two bases
	 * disagree). See `multimap/AGENTS.md`.
	 */
	of = <E extends readonly [UK, UV]>(
		...entries: ArrayNonEmpty<E>
	): MultiMap.NonEmpty<E[0], E[1]> => {
		return this.from(entries);
	};

	from = <E extends readonly [UK, UV]>(
		...sources: ArrayNonEmpty<StreamSource<E>>
	): MultiMap.NonEmpty<E[0], E[1]> => {
		let builder = this.builder<E>();

		let i = -1;
		const length = sources.length;

		while (++i < length) {
			const source = sources[i];

			if (Stream.isEmptyStreamSourceInstance(source)) continue;
			if (
				builder.isEmpty &&
				this.isNonEmptyInstance<E>(source) &&
				(source as MultiMap<E[0], E[1]>).context === (this as unknown)
			) {
				if (i === length - 1) return source as MultiMap.NonEmpty<E[0], E[1]>;
				builder = (source as MultiMap<E[0], E[1]>).toBuilder();
				continue;
			}

			builder.addEach(source);
		}

		return builder.build() as unknown as MultiMap.NonEmpty<E[0], E[1]>;
	};

	reducer = <E2 extends readonly [UK, UV]>(
		source?: StreamSource<E2>,
	): Reducer<E2, MultiMap<E2[0], E2[1]>> => {
		return Reducer.create(
			() =>
				undefined === source
					? this.builder<E2>()
					: (
							this.from(source) as unknown as {
								toBuilder(): MultiMap.Builder<E2[0], E2[1]>;
							}
						).toBuilder(),
			(builder, entry: E2) => {
				builder.addTo(entry[0], entry[1]);
				return builder;
			},
			(builder) => builder.build(),
		) as unknown as Reducer<E2, MultiMap<E2[0], E2[1]>>;
	};

	isNonEmptyInstance<E extends readonly [UK, any]>(
		source: unknown,
	): source is MultiMap.NonEmpty<E[0], E[1]> {
		return source instanceof MultiMapNonEmpty;
	}

	createNonEmpty<K extends UK, V extends UV>(
		keyMap: MapCollection.NonEmpty<K, SetCollection.NonEmpty<V>>,
		size: number,
	): MultiMap.NonEmpty<K, V> {
		return new MultiMapNonEmpty<K, V>(
			this as unknown as MultiMapContextImpl<K, V>,
			keyMap,
			size,
		) as unknown as MultiMap.NonEmpty<K, V>;
	}

	createBuilder<K extends UK, V extends UV>(
		source?: MultiMap.NonEmpty<K, V>,
	): MultiMap.Builder<K, V> {
		return new MultiMapBuilder(
			this as unknown as MultiMapContextImpl<K, V>,
			source,
		) as unknown as MultiMap.Builder<K, V>;
	}

	/**
	 * The `merge*` family, all four implemented as a union of the given entry
	 * sources: every source is folded into one builder, so a key present in
	 * several sources accumulates the values of all of them.
	 *
	 * The declared types are widened on `ContextApi` (see the note there), so the
	 * `options.merge` callback is not honoured — this mirrors `BiMap`, which
	 * likewise unions its sources and ignores the merge function.
	 */
	#mergeAll = (
		sources: readonly StreamSource<readonly [UK, any]>[],
	): MultiMap<UK, any> => {
		const builder = this.builder<readonly [UK, any]>();

		for (const source of sources) {
			builder.addEach(source);
		}

		return builder.build();
	};

	mergeEachWith = (...args: any[]): any =>
		this.#mergeAll(args[0] as readonly StreamSource<readonly [UK, any]>[]);

	mergeEach = (...args: any[]): any => this.mergeEachWith(args[0]);

	mergeWith = (...args: any[]): any => this.mergeEachWith(args[0]);

	merge = (...args: any[]): any => this.mergeEachWith(args[0]);
}
