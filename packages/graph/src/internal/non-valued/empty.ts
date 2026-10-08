import type { ToJSON } from '@rimbu/common/types';
import type { GraphCollection } from '@rimbu/graph/advanced/graph-base';
import type { Link } from '@rimbu/graph/link';

import type { GraphBase } from '#graph/base';
import type { Graph } from '#graph/graph';
import type { GraphContextImpl } from '#graph/non-valued/context-factory';

import { Stream, type StreamSource } from '@rimbu/stream';

import { GraphEmptyBase } from '#graph/common/base';

export class GraphEmpty<N> extends GraphEmptyBase<N> implements GraphBase<N> {
	declare _NonEmptyType: Graph.NonEmpty<N>;

	get isDirected(): boolean {
		return this.context.isDirected;
	}

	constructor(readonly context: GraphContextImpl<N>) {
		super();
	}

	get linkMap(): GraphCollection.Advanced.LinkMapType<N> {
		return this.context.linkMapContext.empty();
	}

	getConnectionsFrom(): GraphCollection.Advanced.LinkConnectionsType<N> {
		return this.context.linkConnectionsContext.empty<N>();
	}

	// `MapCollection.Context<F>` is declared with `any` for its key and value type
	// arguments, so every factory on `linkMapContext` / `linkConnectionsContext`
	// returns an over-generic result that cannot be fed straight back into
	// `createNonEmpty`'s precisely-typed `linkMap` slot. Each boundary below is
	// therefore narrowed with a cast to the family-carrying alias — never `any`.

	addNode(node: N): Graph.NonEmpty<N> {
		return this.context.createNonEmpty(
			this.context.linkMapContext.of([
				node,
				this.context.linkConnectionsContext.empty(),
			]) as GraphCollection.Advanced.LinkMapTypeNonEmpty<N>,
			0,
		);
	}

	addNodes(nodes: StreamSource<N>): any {
		const emptyConnections: GraphCollection.Advanced.LinkConnectionsType<N> =
			this.context.linkConnectionsContext.empty();

		const linkMap = this.context.linkMapContext.from(
			Stream.from(nodes).map(
				(node) =>
					[node, emptyConnections] as [
						N,
						GraphCollection.Advanced.LinkConnectionsType<N>,
					],
			),
		) as GraphCollection.Advanced.LinkMapType<N>;

		if (!linkMap.nonEmpty()) return this;
		return this.context.createNonEmpty(linkMap, 0);
	}

	connect(node1: N, node2: N): Graph.NonEmpty<N> {
		const linkMap = this.context.linkMapContext.of([
			node1,
			this.context.linkConnectionsContext.of(
				node2,
			) as GraphCollection.Advanced.LinkConnectionsType<N>,
		]) as GraphCollection.Advanced.LinkMapTypeNonEmpty<N>;

		if (node1 === node2) return this.context.createNonEmpty(linkMap, 1);

		const linkConnections: GraphCollection.Advanced.LinkConnectionsType<N> =
			this.isDirected
				? this.context.linkConnectionsContext.empty()
				: this.context.linkConnectionsContext.of(node1);

		return this.context.createNonEmpty(linkMap.set(node2, linkConnections), 1);
	}

	connectEach(links: StreamSource<Link<N>>): any {
		return this.context.from(links);
	}

	toString(): string {
		return `${this.context.typeTag}()`;
	}

	toJSON(): ToJSON<[N, Link.Target<N>[]][]> {
		return {
			dataType: this.context.typeTag,
			value: [],
		};
	}

	toBuilder(): Graph.Builder<N> {
		return this.context.builder();
	}
}
