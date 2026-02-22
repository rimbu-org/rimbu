import type { BiMultiMap } from '@rimbu/bimultimap';
import type { MultiMap } from '@rimbu/multimap';

import type { BiMultiMapGeneric } from '#bimultimap/generic';

import { Module } from '@rimbu/common/module';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { BiMultiMapBuilder } from '#bimultimap/builder';
import { BiMultiMapEmpty, BiMultiMapNonEmpty } from '#bimultimap/immutable';

export interface ContextImpl<UK, UV>
	extends BiMultiMap.Context<UK, UV>,
		BiMultiMapGeneric.Creators {
	createNonEmpty<K, V>(
		keyValueMultiMap: MultiMap.NonEmpty<K, V>,
		valueKeyMultiMap: MultiMap.NonEmpty<V, K>,
	): BiMultiMap.NonEmpty<K, V>;
	createBuilder<K extends UK, V extends UV>(
		source?: BiMultiMap.NonEmpty<K, V>,
	): BiMultiMap.Builder<K, V>;
}

export function createBiMultiMapContextModule<UK, UV>(
	typeTag: string,
	options: {
		keyValueMultiMapContext: MultiMap.Context<UK, UV>;
		valueKeyMultiMapContext: MultiMap.Context<UV, UK>;
	},
	_defaultContext?: ContextImpl<any, any> | undefined,
): Module<ContextImpl<UK, UV>> {
	return Module.create<ContextImpl<UK, UV>>((mod) => ({
		createContext: (_options) =>
			createBiMultiMapContextModule(
				typeTag,
				{
					get keyValueMultiMapContext() {
						return (
							_options?.keyValueMultiMapContext ??
							options.keyValueMultiMapContext
						);
					},
					get valueKeyMultiMapContext() {
						return (
							_options?.valueKeyMultiMapContext ??
							options.valueKeyMultiMapContext
						);
					},
				},
				mod,
			).build(),
		defaultContext: Module.lazy<any>(() => _defaultContext ?? mod),

		typeTag,
		_fixTypes: undefined as any,
		_types: undefined as any,

		keyValueMultiMapContext: Module.lazyGetter(
			() => options.keyValueMultiMapContext,
		),
		valueKeyMultiMapContext: Module.lazyGetter(
			() => options.valueKeyMultiMapContext,
		),

		empty: Module.lazy(
			<K, V>(): BiMultiMap<K, V> =>
				Object.freeze(
					new BiMultiMapEmpty<K, V>(mod as unknown as ContextImpl<K, V>),
				),
		),
		of: (...entries) => mod.from(entries),
		from: <K extends UK, V extends UV>(
			...sources: StreamSource<readonly [K, V]>[]
		): any => {
			if (sources.length === 1) {
				const source = sources[0];
				if (source instanceof BiMultiMapNonEmpty && source.context === mod)
					return source;
			}

			let builder = mod.builder<K, V>();

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

				builder.addEntries(source);
			}

			return builder.build();
		},
		reducer: <K extends UK, V extends UV>(
			source?: StreamSource<readonly [K, V]>,
		) => {
			return Reducer.create(
				(): BiMultiMap.Builder<K, V> =>
					undefined === source ? mod.builder() : mod.from(source).toBuilder(),
				(builder, entry: readonly [K, V]) => {
					builder.add(entry[0], entry[1]);
					return builder;
				},
				(builder) => builder.build(),
			);
		},
		builder: <K, V>() =>
			new BiMultiMapBuilder(mod as unknown as ContextImpl<K, V>),
		createNonEmpty: <K, V>(
			keyValueMultiMap: MultiMap.NonEmpty<K, V>,
			valueKeyMultiMap: MultiMap.NonEmpty<V, K>,
		) => {
			return new BiMultiMapNonEmpty<K, V>(
				mod as unknown as ContextImpl<K, V>,
				keyValueMultiMap,
				valueKeyMultiMap,
			);
		},
		createBuilder: <K, V>(source?: BiMultiMap.NonEmpty<K, V>) =>
			new BiMultiMapBuilder(mod as unknown as ContextImpl<K, V>, source),
	}));
}
