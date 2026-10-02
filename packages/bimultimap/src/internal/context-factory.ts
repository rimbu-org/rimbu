import type { BiMultiMap } from '@rimbu/bimultimap';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { MultiMap } from '@rimbu/multimap';

import { Module } from '@rimbu/common/module';
import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { BiMultiMapBuilder } from '#bimultimap/builder';
import { BiMultiMapEmpty } from '#bimultimap/immutable/empty';
import { BiMultiMapNonEmpty } from '#bimultimap/immutable/non-empty';

export interface BiMultiMapContextImpl<UK, UV>
	extends BiMultiMap.Context<UK, UV> {
	/**
	 * Builds a non-empty collection from two exact inverses.
	 *
	 * There is no validation: passing maps that are not inverses of one another
	 * produces a collection that violates its own invariant, and every query on
	 * it — `getKeys`, `hasValue`, `invert` — will report accordingly. The
	 * alternative (recomputing the reverse map here) would be O(n) on every
	 * mutation, which is precisely the work the two-map representation exists to
	 * avoid.
	 */
	createNonEmpty<K, V>(
		keyValueMultiMap: MultiMap.NonEmpty<K, V>,
		valueKeyMultiMap: MultiMap.NonEmpty<V, K>,
	): BiMultiMap.NonEmpty<K, V>;
	createBuilder<K extends UK, V extends UV>(
		source?: BiMultiMap.NonEmpty<K, V>,
	): BiMultiMap.Builder<K, V>;
}

interface ContextOptions<UK, UV> {
	keyValueMultiMapContext: MultiMap.Context<UK, UV>;
	valueKeyMultiMapContext: MultiMap.Context<UV, UK>;
}

/**
 * Hoisted out of the module object because a single signature cannot satisfy
 * both `ContextApi.from` overloads, and the non-empty-preserving one has to be
 * declared **first** or a `StreamSource.NonEmpty` argument is matched by the
 * normal overload and the precise return type is lost (root `AGENTS.md` §1.1).
 */
function createFrom<UK, UV>(mod: BiMultiMapContextImpl<UK, UV>) {
	function from<K extends UK, V extends UV>(
		...sources: ArrayNonEmpty<StreamSource.NonEmpty<readonly [K, V]>>
	): BiMultiMap.NonEmpty<K, V>;
	function from<K extends UK, V extends UV>(
		...sources: ArrayNonEmpty<StreamSource<readonly [K, V]>>
	): BiMultiMap<K, V>;
	function from<K extends UK, V extends UV>(
		...sources: StreamSource<readonly [K, V]>[]
	): BiMultiMap<K, V> {
		if (sources.length === 1) {
			const source = sources[0];
			if (source instanceof BiMultiMapNonEmpty && source.context === mod)
				return source;
		}

		let builder = mod.createBuilder<K, V>();

		let i = -1;
		const length = sources.length;

		while (++i < length) {
			const source = sources[i];

			if (Stream.isEmptyStreamSourceInstance(source)) continue;
			if (
				builder.isEmpty &&
				source instanceof BiMultiMapNonEmpty &&
				source.context === mod
			) {
				if (i === length - 1) return source;
				builder = source.toBuilder();
				continue;
			}

			builder.addEach(source);
		}

		return builder.build();
	}

	return from;
}

function createContextModule<UK, UV>(
	options: ContextOptions<UK, UV>,
): Module<BiMultiMapContextImpl<UK, UV>> {
	return Module.create<BiMultiMapContextImpl<UK, UV>>((mod) => ({
		createContext: (
			_options?: Partial<ContextOptions<UK, UV>>,
		): BiMultiMapContextImpl<UK, UV> =>
			createContextModule({
				get keyValueMultiMapContext() {
					return (
						_options?.keyValueMultiMapContext ?? options.keyValueMultiMapContext
					);
				},
				get valueKeyMultiMapContext() {
					return (
						_options?.valueKeyMultiMapContext ?? options.valueKeyMultiMapContext
					);
				},
			}).build(),

		keyedContext: mod,
		collectionContext: mod,
		defaultContext: mod,

		typeTag: 'BiMultiMap',

		keyValueMultiMapContext: Module.lazyGetter(
			() => options.keyValueMultiMapContext,
		),
		valueKeyMultiMapContext: Module.lazyGetter(
			() => options.valueKeyMultiMapContext,
		),

		empty: Module.lazy(
			<E extends readonly [unknown, unknown]>(): BiMultiMap<E[0], E[1]> =>
				new BiMultiMapEmpty<E[0], E[1]>(
					mod as unknown as BiMultiMapContextImpl<E[0], E[1]>,
				),
		),
		of: (...entries) => mod.from(entries),
		from: createFrom(mod as unknown as BiMultiMapContextImpl<UK, UV>),
		reducer: <K extends UK, V extends UV>(
			source?: StreamSource<readonly [K, V]>,
		) =>
			Reducer.create(
				(): BiMultiMap.Builder<K, V> =>
					undefined === source
						? mod.builder<readonly [K, V]>()
						: mod.from<readonly [K, V]>(source).toBuilder(),
				(builder, entry: readonly [K, V]) => {
					builder.addTo(entry[0], entry[1]);
					return builder;
				},
				(builder) => builder.build(),
			),
		builder: <E extends readonly [unknown, unknown]>() =>
			new BiMultiMapBuilder<E[0], E[1]>(
				mod as unknown as BiMultiMapContextImpl<E[0], E[1]>,
			),

		createNonEmpty: <K, V>(
			keyValueMultiMap: MultiMap.NonEmpty<K, V>,
			valueKeyMultiMap: MultiMap.NonEmpty<V, K>,
		) =>
			new BiMultiMapNonEmpty<K, V>(
				mod as unknown as BiMultiMapContextImpl<K, V>,
				keyValueMultiMap,
				valueKeyMultiMap,
				keyValueMultiMap.size,
			),

		createBuilder: <K, V>(source?: BiMultiMap.NonEmpty<K, V>) =>
			new BiMultiMapBuilder<K, V>(
				mod as unknown as BiMultiMapContextImpl<K, V>,
				source,
			),
	}));
}

export const BiMultiMapContextImpl = {
	createDefault(): BiMultiMapContextImpl<unknown, unknown> {
		return createContextModule({
			keyValueMultiMapContext: HashMultiMapHashValue,
			valueKeyMultiMapContext: HashMultiMapHashValue,
		}).build() as unknown as BiMultiMapContextImpl<unknown, unknown>;
	},

	create<K2, V2>(
		keyValueMultiMapContext: MultiMap.Context<K2, V2>,
		valueKeyMultiMapContext: MultiMap.Context<V2, K2>,
	): BiMultiMapContextImpl<K2, V2> {
		return createContextModule({
			keyValueMultiMapContext,
			valueKeyMultiMapContext,
		}).build() as unknown as BiMultiMapContextImpl<K2, V2>;
	},
};
