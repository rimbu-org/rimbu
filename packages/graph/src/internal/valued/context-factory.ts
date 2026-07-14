import type { RMap } from '@rimbu/collection-types';
import type { ValuedGraphElement } from '@rimbu/graph/valued-link';

import type { ValuedGraph } from '#graph/valued/valued-graph';

import { Module } from '@rimbu/common/module';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { ValuedGraphBuilder } from '#graph/valued/builder';
import { ValuedGraphEmpty } from '#graph/valued/empty';
import { ValuedGraphNonEmpty } from '#graph/valued/non-empty';

export interface ValuedGraphContextImpl<UN> extends ValuedGraph.Context<UN> {
	isNonEmptyInstance<N extends UN, V>(
		source: any,
	): source is ValuedGraph.NonEmpty<N, V>;
	createBuilder<N extends UN, V>(
		source?: ValuedGraph.NonEmpty<N, V>,
	): ValuedGraph.Builder<N, V>;
	createNonEmpty<N extends UN, V>(
		linkMap: RMap.NonEmpty<N, RMap<N, V>>,
		connectionSize: number,
	): ValuedGraph.NonEmpty<N, V>;
	createContext<N extends UN>(options: {
		linkMapContext?: RMap.Context<N>;
		linkConnectionsContext?: RMap.Context<N>;
	}): ValuedGraph.Context<N>;
	defaultContext<N extends UN>(): ValuedGraph.Context<N>;
}

export function createValuedGraphContextModule<UN>(
	typeTag: string,
	isDirected: boolean,
	options: {
		linkMapContext: RMap.Context<UN>;
		linkConnectionsContext: RMap.Context<UN>;
	},
	_defaultContext?: ValuedGraphContextImpl<UN> | undefined,
): Module<ValuedGraphContextImpl<UN>> {
	return Module.create<ValuedGraphContextImpl<UN>>((mod) => ({
		createContext: (_options) => {
			return createValuedGraphContextModule(
				typeTag,
				isDirected,
				{
					get linkMapContext() {
						return _options?.linkMapContext ?? options.linkMapContext;
					},
					get linkConnectionsContext() {
						return (
							_options?.linkConnectionsContext ?? options.linkConnectionsContext
						);
					},
				},
				mod as ValuedGraphContextImpl<any>,
			).build();
		},
		defaultContext: Module.lazy(
			(): ValuedGraph.Context<any> => _defaultContext ?? mod,
		),

		typeTag,
		isDirected,
		linkMapContext: Module.lazyGetter(() => options.linkMapContext),
		linkConnectionsContext: Module.lazyGetter(
			() => options.linkConnectionsContext,
		),

		_fixedType: undefined as any,

		empty: Module.lazy(
			<N extends UN, V>(): ValuedGraph<N, V> =>
				Object.freeze(
					new ValuedGraphEmpty<N, V>(
						isDirected,
						mod as unknown as ValuedGraphContextImpl<N>,
					),
				),
		),
		of: (...graphElements) => mod.from(graphElements),
		from: <N extends UN, V>(
			...sources: StreamSource<ValuedGraphElement<N, V>>[]
		): any => {
			let builder = mod.builder();

			let i = -1;
			const length = sources.length;

			while (++i < length) {
				const source = sources[i];

				if (Stream.isEmptyStreamSourceInstance(source)) continue;
				if (
					builder.isEmpty &&
					mod.isNonEmptyInstance(source) &&
					source.context === mod
				) {
					if (i === length - 1) return source;
					builder = source.toBuilder();
					continue;
				}

				builder.addGraphElements(source);
			}

			return builder.build();
		},
		reducer: <N extends UN, V>(
			source?: StreamSource<ValuedGraphElement<N, V>>,
		): Reducer<ValuedGraphElement<N, V>, ValuedGraph<N, V>> => {
			return Reducer.create(
				(): ValuedGraph.Builder<N, V> =>
					undefined === source ? mod.builder() : mod.from(source).toBuilder(),
				(builder, entry) => {
					builder.addGraphElement(entry);
					return builder;
				},
				(builder) => builder.build(),
			);
		},
		builder: <N extends UN, V>(): ValuedGraph.Builder<N, V> =>
			new ValuedGraphBuilder(
				mod.isDirected,
				mod as unknown as ValuedGraphContextImpl<N>,
			),

		isNonEmptyInstance: (source) => source instanceof ValuedGraphNonEmpty,
		createBuilder<N extends UN, V>(
			source?: ValuedGraph.NonEmpty<N, V>,
		): ValuedGraph.Builder<N, V> {
			return new ValuedGraphBuilder(
				mod.isDirected,
				mod as unknown as ValuedGraphContextImpl<N>,
				source,
			);
		},
		createNonEmpty<N extends UN, V>(
			linkMap: RMap.NonEmpty<N, RMap<N, V>>,
			connectionSize: number,
		): ValuedGraph.NonEmpty<N, V> {
			return new ValuedGraphNonEmpty<N, V>(
				mod.isDirected,
				mod as unknown as ValuedGraphContextImpl<N>,
				linkMap,
				connectionSize,
			);
		},
	}));
}
