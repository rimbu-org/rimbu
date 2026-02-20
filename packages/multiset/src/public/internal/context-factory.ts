import type { RMap } from '@rimbu/collection-types';
import type { MultiSet } from '@rimbu/multiset';
import type { StreamSource } from '@rimbu/stream';

import type { MultiSetCreators } from '#multiset/creators';
import type { MultiSetBase } from '#multiset/types';

import { Module } from '@rimbu/common/module';
import { StreamFactory } from '@rimbu/stream/internal/factory';
import { Reducer } from '@rimbu/stream/reducer';

import {
	MultiSetBuilder,
	MultiSetEmpty,
	MultiSetNonEmpty,
} from '#multiset/base';

export interface ContextImpl<UT>
	extends MultiSetBase.Context<UT>,
		MultiSetCreators {
	isNonEmptyInstance<T>(source: any): source is MultiSet.NonEmpty<T>;
	createNonEmpty<T extends UT>(
		countMap: RMap.NonEmpty<T, number>,
		size: number,
	): MultiSet.NonEmpty<T>;
}

export function createMultiSetContextModule<UT>(
	options: {
		typeTag: string;
		countMapContext: RMap.Context<UT>;
	},
	_defaultContext?: ContextImpl<UT> | undefined,
): Module<ContextImpl<UT>> {
	const { typeTag, countMapContext } = options;

	return Module.create<ContextImpl<UT>>((mod) => ({
		createContext: (_options) => {
			const finalOptions = { ...options, ..._options };
			return createMultiSetContextModule(
				finalOptions,
				mod as ContextImpl<any>,
			).build();
		},
		defaultContext: Module.lazy(() => _defaultContext ?? mod),

		typeTag,
		_types: undefined as any,

		countMapContext,

		isNonEmptyInstance<T>(source: any): source is MultiSet.NonEmpty<T> {
			return source instanceof MultiSetNonEmpty;
		},
		isValidElem(elm) {
			return mod.countMapContext.isValidKey(elm);
		},
		createNonEmpty<T extends UT>(
			countMap: RMap.NonEmpty<T, number>,
			size: number,
		) {
			return new MultiSetNonEmpty(
				mod as unknown as ContextImpl<T>,
				countMap,
				size,
			);
		},
		empty: Module.lazy(<T>() =>
			Object.freeze(new MultiSetEmpty(mod as unknown as ContextImpl<T>)),
		),
		from: <T extends UT>(...sources: StreamSource<T>[]): any => {
			let builder = mod.builder<T>();
			let i = -1;
			const length = sources.length;
			while (++i < length) {
				const source = sources[i];
				if (StreamFactory().isEmptyStreamSourceInstance(source)) continue;
				if (
					builder.isEmpty &&
					mod.isNonEmptyInstance<T>(source) &&
					source.context === (mod as any)
				) {
					if (i === length - 1) return source;
					builder = source.toBuilder();
					continue;
				}
				builder.addAll(source);
			}
			return builder.build();
		},
		of: (...values) => mod.from(values),
		builder: <T>() => new MultiSetBuilder(mod as unknown as ContextImpl<T>),
		reducer: <T extends UT>(
			source?: StreamSource<T>,
		): Reducer<T, MultiSet<T>> => {
			return Reducer.create(
				() =>
					undefined === source
						? mod.builder<T>()
						: mod.from(source).toBuilder(),
				(builder, value) => {
					builder.add(value);
					return builder;
				},
				(builder) => builder.build(),
			);
		},
	}));
}
