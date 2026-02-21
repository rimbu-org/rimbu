import type { RMap, RSet } from '@rimbu/collection-types';
import type { ToJSON } from '@rimbu/common/types';
import type { Link } from '@rimbu/graph/link';

import type { GraphContextImpl } from '#graph/non-valued/context-factory';
import type { GraphBase } from '#private/base';
import type { Graph } from '#private/graph';

import { Stream, type StreamSource } from '@rimbu/stream';

import { GraphEmptyBase } from '#graph/common/base';

export class GraphEmpty<N> extends GraphEmptyBase implements GraphBase<N> {
	declare _NonEmptyType: Graph.NonEmpty<N>;

	constructor(
		readonly isDirected: boolean,
		readonly context: GraphContextImpl<N>,
	) {
		super();
	}

	get linkMap(): RMap<N, RSet<N>> {
		return this.context.linkMapContext.empty();
	}

	getConnectionsFrom(): RSet<N> {
		return this.context.linkConnectionsContext.empty<N>();
	}

	addNode(node: N): Graph.NonEmpty<N> {
		return this.context.createNonEmpty(
			this.linkMap.context.of([
				node,
				this.context.linkConnectionsContext.empty(),
			]),
			0,
		);
	}

	addNodes(nodes: StreamSource<N>): any {
		const emptyConnections = this.context.linkConnectionsContext.empty();

		const linkMap = this.context.linkMapContext.from<N, RSet<N>>(
			Stream.from(nodes).map(
				(node) => [node, emptyConnections] as [N, RSet<N>],
			),
		);

		if (!linkMap.nonEmpty()) return this;
		return this.context.createNonEmpty(linkMap, 0);
	}

	connect(node1: N, node2: N): Graph.NonEmpty<N> {
		const linkMap = this.context.linkMapContext.of([
			node1,
			this.context.linkConnectionsContext.of(node2) as RSet<N>,
		]);

		if (node1 === node2) return this.context.createNonEmpty(linkMap, 1);

		const linkConnections = this.isDirected
			? this.context.linkConnectionsContext.empty()
			: this.context.linkConnectionsContext.of(node1);

		return this.context.createNonEmpty(linkMap.set(node2, linkConnections), 1);
	}

	connectAll(links: StreamSource<Link<N>>): any {
		return this.context.from(links);
	}

	toString(): string {
		return `${this.context.typeTag}()`;
	}

	toJSON(): ToJSON<any[]> {
		return {
			dataType: this.context.typeTag,
			value: [],
		};
	}

	toBuilder(): Graph.Builder<N> {
		return this.context.builder();
	}
}
