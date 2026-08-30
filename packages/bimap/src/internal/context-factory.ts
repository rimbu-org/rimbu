import type { BiMap } from '@rimbu/bimap';
import type { RMap } from '@rimbu/collection-types';

import { Module } from '@rimbu/common/module';
import { HashMap } from '@rimbu/hashed/map';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { BiMapBuilder } from '#bimap/builder';
import { BiMapEmpty, BiMapNonEmptyImpl } from '#bimap/immutable';

export interface ContextImpl<UK, UV> extends BiMap.Context<UK, UV> {
	createContext<UK, UV>(
		options?:
			| {
					keyValueContext?: RMap.Context<UK>;
					valueKeyContext?: RMap.Context<UV>;
			  }
			| undefined,
	): BiMap.Context<UK, UV>;
	defaultContext<K extends UK, V extends UV>(): BiMap.Context<K, V>;
	createNonEmptyImpl<K extends UK, V extends UV>(
		keyValueMap: RMap.NonEmpty<K, V>,
		valueKeyMap: RMap.NonEmpty<V, K>,
	): BiMapNonEmptyImpl<K, V>;
	createBuilder<K extends UK, V extends UV>(
		source?: BiMapNonEmptyImpl<K, V>,
	): BiMapBuilder<K, V>;
}

export function createBiMapContextModule<UK, UV>(
	options: {
		keyValueContext?: RMap.Context<UK>;
		valueKeyContext?: RMap.Context<UV>;
	} = {},
	_defaultContext?: BiMap.Context<UK, UV>,
): Module<ContextImpl<UK, UV>> {
	return Module.create<ContextImpl<UK, UV>>((mod) => ({
		createContext: (options) =>
			createBiMapContextModule(options, mod as ContextImpl<any, any>).build(),
		defaultContext: Module.lazy(
			() => (_defaultContext ?? mod) as BiMap.Context<any, any>,
		),

		// @ts-ignore legacy RMap.Context vs HashMap.Context after capability migration
		keyValueContext: Module.lazyGetter(
			() => options.keyValueContext ?? (HashMap.createContext as any)({}),
		),
		// @ts-ignore legacy RMap.Context vs HashMap.Context after capability migration
		valueKeyContext: Module.lazyGetter(
			() => options.valueKeyContext ?? (HashMap.createContext as any)({}),
		),

		typeTag: 'BiMap',
		_types: undefined as any,

		empty: Module.lazy(
			<K extends UK, V extends UV>(): BiMap<K, V> =>
				Object.freeze(new BiMapEmpty(mod as unknown as ContextImpl<K, V>)),
		),
		of(...entries) {
			return mod.from(entries);
		},
		from: <K extends UK, V extends UV>(
			...sources: StreamSource<readonly [K, V]>[]
		): any => {
			if (sources.length === 1) {
				const source = sources[0];
				if (source instanceof BiMapNonEmptyImpl && source.context === mod)
					return source;
			}

			let builder: BiMap.Builder<K, V> = mod.builder();

			let i = -1;
			const length = sources.length;

			while (++i < length) {
				const source = sources[i];

				if (Stream.isEmptyStreamSourceInstance(source)) continue;
				if (
					builder.isEmpty &&
					source instanceof BiMapNonEmptyImpl &&
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
		builder: <K extends UK, V extends UV>(): BiMap.Builder<K, V> => {
			return new BiMapBuilder(mod as unknown as ContextImpl<K, V>);
		},
		reducer: <K extends UK, V extends UV>(
			source?: StreamSource<readonly [K, V]>,
		): Reducer<readonly [K, V], BiMap<K, V>> => {
			return Reducer.create(
				() =>
					undefined === source
						? mod.builder<K, V>()
						: mod.from(source).toBuilder(),
				(builder, entry) => {
					builder.addEntry(entry);
					return builder;
				},
				(builder) => builder.build(),
			);
		},
		createNonEmptyImpl<K extends UK, V extends UV>(
			keyValueMap: RMap.NonEmpty<K, V>,
			valueKeyMap: RMap.NonEmpty<V, K>,
		): BiMapNonEmptyImpl<K, V> {
			return new BiMapNonEmptyImpl(
				mod as unknown as ContextImpl<K, V>,
				keyValueMap,
				valueKeyMap,
			);
		},
		createBuilder<K extends UK, V extends UV>(
			source?: BiMapNonEmptyImpl<K, V>,
		): BiMapBuilder<K, V> {
			return new BiMapBuilder<K, V>(
				mod as unknown as ContextImpl<K, V>,
				source,
			);
		},
	}));
}
