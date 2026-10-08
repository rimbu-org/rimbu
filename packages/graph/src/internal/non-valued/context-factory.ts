import type { MapCollection } from '@rimbu/collection-types/map';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { GraphCollection } from '@rimbu/graph/advanced/graph-base';
import type { GraphElement } from '@rimbu/graph/link';

import type { GraphBase } from '#graph/base';
import type { Graph } from '#graph/graph';

import { Module } from '@rimbu/common/module';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { GraphBuilder } from '#graph/non-valued/builder';
import { GraphEmpty } from '#graph/non-valued/empty';
import { GraphNonEmpty } from '#graph/non-valued/non-empty';

export interface GraphContextImpl<UN> extends GraphBase.Context<UN> {
	isNonEmptyInstance<N extends UN>(source: any): source is Graph.NonEmpty<N>;
	createNonEmpty<N extends UN>(
		linkMap: GraphCollection.Advanced.LinkMapTypeNonEmpty<N>,
		connectionSize: number,
	): Graph.NonEmpty<N>;
	createBuilder<N extends UN>(source?: Graph.NonEmpty<N>): Graph.Builder<N>;
	createContext<N extends UN>(options: {
		linkMapContext?: MapCollection.Context<
			GraphCollection.Advanced.LinkMapFamily<
				N,
				GraphCollection.Advanced.LinkConnectionsType<N>
			>
		>;
		linkConnectionsContext?: SetCollection.Context<
			GraphCollection.Advanced.LinkConnectionsFamily<N>
		>;
	}): Graph.Context<N>;
	defaultContext<N extends UN>(): Graph.Context<N>;
}

export function createGraphContextModule<UN>(
	typeTag: string,
	isDirected: boolean,
	options: {
		linkMapContext: MapCollection.Context<
			GraphCollection.Advanced.LinkMapFamily<
				UN,
				GraphCollection.Advanced.LinkConnectionsType<UN>
			>
		>;
		linkConnectionsContext: SetCollection.Context<
			GraphCollection.Advanced.LinkConnectionsFamily<UN>
		>;
	},
	_defaultContext?: GraphContextImpl<UN> | undefined,
): Module<GraphContextImpl<UN>> {
	return Module.create<GraphContextImpl<UN>>((mod) => ({
		createContext: (_options) => {
			return createGraphContextModule(
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
				mod as GraphContextImpl<any>,
			).build();
		},
		defaultContext: Module.lazy(
			(): Graph.Context<any> => _defaultContext ?? mod,
		),

		typeTag,
		isDirected,
		linkMapContext: Module.lazyGetter(() => options.linkMapContext),
		linkConnectionsContext: Module.lazyGetter(
			() => options.linkConnectionsContext,
		),
		_fixedType: undefined as any,

		empty: Module.lazy(<N>() =>
			Object.freeze(new GraphEmpty(mod as unknown as GraphContextImpl<N>)),
		),
		of: (...graphElements) => mod.from(graphElements),
		from: <N extends UN>(...sources: StreamSource<GraphElement<N>>[]): any => {
			let builder = mod.builder<N>();

			let i = -1;
			const length = sources.length;

			while (++i < length) {
				const source = sources[i];

				if (Stream.isEmptyStreamSourceInstance(source)) continue;
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
			new GraphBuilder(mod as unknown as GraphContextImpl<N>),

		createNonEmpty: <N extends UN>(
			linkMap: GraphCollection.Advanced.LinkMapTypeNonEmpty<N>,
			connectionSize: number,
		) => {
			return new GraphNonEmpty(
				mod as unknown as GraphContextImpl<N>,
				linkMap,
				connectionSize,
			);
		},
		createBuilder: <N>(source?: Graph.NonEmpty<N>) =>
			new GraphBuilder(mod as unknown as GraphContextImpl<N>, source),
		isNonEmptyInstance: (source) => source instanceof GraphNonEmpty,
	}));
}
