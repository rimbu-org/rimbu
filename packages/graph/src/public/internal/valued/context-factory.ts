import type { RMap } from '@rimbu/collection-types';
import type { ValuedGraphElement } from '@rimbu/graph/valued-link';
import type { StreamSource } from '@rimbu/stream';

import type { ValuedGraph } from '#private/valued/valued-graph';

import { Module } from '@rimbu/common/module';
import { StreamFactory } from '@rimbu/stream/internal/factory';
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
		linkMapContext?: RMap.Context<UN>;
		linkConnectionsContext?: RMap.Context<UN>;
	}): ValuedGraph.Context<N>;
	defaultContext<N extends UN>(): ValuedGraph.Context<N>;
}

export function createValuedGraphContextModule<UN>(
	options: {
		typeTag: string;
		isDirected: boolean;
		linkMapContext: RMap.Context<UN>;
		linkConnectionsContext: RMap.Context<UN>;
	},
	_defaultContext?: ValuedGraphContextImpl<UN> | undefined,
): Module<ValuedGraphContextImpl<UN>> {
	const { typeTag, isDirected, linkMapContext, linkConnectionsContext } =
		options;

	return Module.create<ValuedGraphContextImpl<UN>>((mod) => ({
		createContext: (_options) => {
			const finalOptions = { ...options, ..._options };

			return createValuedGraphContextModule(
				finalOptions,
				mod as ValuedGraphContextImpl<any>,
			).build();
		},
		defaultContext: Module.lazy(
			(): ValuedGraph.Context<any> => _defaultContext ?? mod,
		),

		typeTag,
		isDirected,
		linkMapContext,
		linkConnectionsContext,

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

				if (StreamFactory().isEmptyStreamSourceInstance(source)) continue;
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
		): any => {
			return Reducer.create(
				(): ValuedGraph.Builder<N, V> =>
					undefined === source ? mod.builder() : mod.from(source).toBuilder(),
				(builder, entry: ValuedGraphElement<N, V>) => {
					builder.addGraphElement(entry);
					return builder;
				},
				(builder) => builder.build(),
			);
		},
		builder: () =>
			new ValuedGraphBuilder(
				mod.isDirected,
				mod as unknown as ValuedGraphContextImpl<any>,
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
