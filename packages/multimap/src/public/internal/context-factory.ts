import type { RMap, RSet } from '@rimbu/collection-types';
import type { MultiMap } from '@rimbu/multimap';

import type { MultiMapCreators } from '#multimap/creators';

import { Module } from '@rimbu/common/module';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import {
	MultiMapBuilder,
	MultiMapEmpty,
	MultiMapNonEmpty,
} from '#multimap/base';

export interface ContextImpl<UK, UV>
	extends MultiMap.Context<UK, UV>,
		MultiMapCreators {
	isNonEmptyInstance<K, V>(source: any): source is MultiMap.NonEmpty<K, V>;
	createBuilder<K extends UK, V extends UV>(
		source?: MultiMap.NonEmpty<K, V>,
	): MultiMap.Builder<K, V>;
	createNonEmpty<K extends UK, V extends UV>(
		keyMap: RMap.NonEmpty<K, RSet.NonEmpty<V>>,
		size: number,
	): MultiMap.NonEmpty<K, V>;
}

export function createMultiMapContextModule<UK, UV>(
	typeTag: string,
	options: {
		keyMapContext: RMap.Context<UK>;
		keyMapValuesContext: RSet.Context<UV>;
	},
	_defaultContext?: ContextImpl<UK, UV> | undefined,
): Module<ContextImpl<UK, UV>> {
	return Module.create<ContextImpl<UK, UV>>((mod) => ({
		createContext: (_options) => {
			return createMultiMapContextModule(
				typeTag,
				{
					get keyMapContext() {
						return _options?.keyMapContext ?? options.keyMapContext;
					},
					get keyMapValuesContext() {
						return _options?.keyMapValuesContext ?? options.keyMapValuesContext;
					},
				},
				mod as ContextImpl<any, any>,
			).build();
		},
		defaultContext: Module.lazy(() => _defaultContext ?? mod),

		typeTag,
		keyMapContext: Module.lazyGetter(() => options.keyMapContext),
		keyMapValuesContext: Module.lazyGetter(() => options.keyMapValuesContext),

		createBuilder: <K, V>(source?: MultiMap.NonEmpty<K, V>) =>
			new MultiMapBuilder(mod as unknown as ContextImpl<K, V>, source),
		createNonEmpty: <K, V>(
			keyMap: RMap.NonEmpty<K, RSet.NonEmpty<V>>,
			size: number,
		) =>
			new MultiMapNonEmpty(mod as unknown as ContextImpl<K, V>, keyMap, size),
		isNonEmptyInstance<K, V>(source: any): source is MultiMap.NonEmpty<K, V> {
			return source instanceof MultiMapNonEmpty;
		},

		empty: Module.lazy(<K, V>() =>
			Object.freeze(
				new MultiMapEmpty<K, V>(mod as unknown as ContextImpl<K, V>),
			),
		),
		of: (...entries) => mod.from(entries),
		from: <K extends UK, V extends UV>(
			...sources: StreamSource<readonly [K, V]>[]
		): any => {
			let builder = mod.builder<K, V>();

			let i = -1;
			const length = sources.length;

			while (++i < length) {
				const source = sources[i];

				if (Stream.isEmptyStreamSourceInstance(source)) continue;
				if (
					builder.isEmpty &&
					mod.isNonEmptyInstance<K, V>(source) &&
					source.context === (mod as any)
				) {
					if (i === length - 1) return source;
					builder = source.toBuilder();
					continue;
				}

				builder.addEntries(source);
			}

			return builder.build();
		},
		builder: <K, V>() =>
			new MultiMapBuilder(mod as unknown as ContextImpl<K, V>),
		reducer: <K extends UK, V extends UV>(
			source?: StreamSource<readonly [K, V]>,
		): Reducer<readonly [K, V], MultiMap<K, V>> => {
			return Reducer.create(
				() =>
					undefined === source
						? mod.builder<K, V>()
						: mod.from(source).toBuilder(),
				(builder, entry) => {
					builder.add(entry[0], entry[1]);
					return builder;
				},
				(builder) => builder.build(),
			);
		},
	}));
}
