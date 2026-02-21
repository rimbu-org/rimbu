import type { RMap, RSet } from '@rimbu/collection-types';
import type { GraphElement } from '@rimbu/graph/link';
import type { StreamSource } from '@rimbu/stream';

import type { GraphBase } from '#private/base';
import type { Graph } from '#private/graph';

import { Module } from '@rimbu/common/module';
import { StreamFactory } from '@rimbu/stream/internal/factory';
import { Reducer } from '@rimbu/stream/reducer';

import { GraphBuilder } from '#graph/non-valued/builder';
import { GraphEmpty } from '#graph/non-valued/empty';
import { GraphNonEmpty } from '#graph/non-valued/non-empty';

export interface GraphContextImpl<UN> extends GraphBase.Context<UN> {
	isNonEmptyInstance<N extends UN>(source: any): source is Graph.NonEmpty<N>;
	createNonEmpty<N extends UN>(
		linkMap: RMap.NonEmpty<N, RSet<N>>,
		connectionSize: number,
	): Graph.NonEmpty<N>;
	createBuilder<N extends UN>(source?: Graph.NonEmpty<N>): Graph.Builder<N>;
	createContext<N extends UN>(options: {
		linkMapContext?: RMap.Context<N>;
		linkConnectionsContext?: RSet.Context<N>;
	}): Graph.Context<N>;
	defaultContext<N extends UN>(): Graph.Context<N>;
}

export function createGraphContextModule<UN>(
	options: {
		typeTag: string;
		isDirected: boolean;
		linkMapContext: RMap.Context<UN>;
		linkConnectionsContext: RSet.Context<UN>;
	},
	_defaultContext?: GraphContextImpl<UN> | undefined,
): Module<GraphContextImpl<UN>> {
	const { typeTag, isDirected, linkMapContext, linkConnectionsContext } =
		options;

	return Module.create<GraphContextImpl<UN>>((mod) => ({
		createContext: (_options) => {
			const finalOptions = { ...options, ..._options };

			return createGraphContextModule(
				finalOptions,
				mod as GraphContextImpl<any>,
			).build();
		},
		defaultContext: Module.lazy(
			(): Graph.Context<any> => _defaultContext ?? mod,
		),

		typeTag,
		isDirected,
		linkMapContext,
		linkConnectionsContext,
		_fixedType: undefined as any,

		empty: Module.lazy(<N>() =>
			Object.freeze(
				new GraphEmpty(isDirected, mod as unknown as GraphContextImpl<N>),
			),
		),
		of: (...graphElements) => mod.from(graphElements),
		from: <N extends UN>(...sources: StreamSource<GraphElement<N>>[]): any => {
			let builder = mod.builder<N>();

			let i = -1;
			const length = sources.length;

			while (++i < length) {
				const source = sources[i];

				if (StreamFactory().isEmptyStreamSourceInstance(source)) continue;
				if (
					builder.isEmpty &&
					mod.isNonEmptyInstance<N>(source) &&
					source.context === (mod as unknown as GraphContextImpl<N>)
				) {
					if (i === length - 1) return source;
					builder = source.toBuilder();
					continue;
				}

				builder.addGraphElements(source);
			}

			return builder.build();
		},
		reducer: <N extends UN>(
			source?: StreamSource<GraphElement<N>>,
		): Reducer<GraphElement<N>, Graph<N>> => {
			return Reducer.create(
				(): Graph.Builder<N> =>
					undefined === source ? mod.builder() : mod.from(source).toBuilder(),
				(builder, entry) => {
					builder.addGraphElement(entry);
					return builder;
				},
				(builder) => builder.build(),
			);
		},
		builder: <N>(): Graph.Builder<N> =>
			new GraphBuilder(isDirected, mod as unknown as GraphContextImpl<N>),

		createNonEmpty: <N extends UN>(
			linkMap: RMap.NonEmpty<N, RSet<N>>,
			connectionSize: number,
		) => {
			return new GraphNonEmpty(
				isDirected,
				mod as unknown as GraphContextImpl<N>,
				linkMap,
				connectionSize,
			);
		},
		createBuilder: <N>(source?: Graph.NonEmpty<N>) =>
			new GraphBuilder(
				isDirected,
				mod as unknown as GraphContextImpl<N>,
				source,
			),
		isNonEmptyInstance: (source) => source instanceof GraphNonEmpty,
	}));
}
