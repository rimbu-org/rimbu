import type { MapCollection } from '@rimbu/collection-types/map';
import type { RelatedTo, ToJSON } from '@rimbu/common/types';
import type { ValuedLink } from '@rimbu/graph/valued-link';

import type { ValuedGraphBase } from '#graph/valued/base';
import type { ValuedGraphContextImpl } from '#graph/valued/context-factory';
import type { ValuedGraph } from '#graph/valued/valued-graph';

import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream, type StreamSource } from '@rimbu/stream';

import { GraphEmptyBase } from '#graph/common/base';

export class ValuedGraphEmpty<N, V>
	extends GraphEmptyBase
	implements ValuedGraphBase<N, V>
{
	declare _NonEmptyType: ValuedGraph.NonEmpty<N, V>;

	constructor(
		readonly isDirected: boolean,
		readonly context: ValuedGraphContextImpl<N>,
	) {
		super();
	}

	get linkMap(): MapCollection<N, MapCollection<N, V>> {
		return this.context.linkMapContext.empty();
	}

	getValue<UN, O>(
		_: RelatedTo<N, UN>,
		__: RelatedTo<N, UN>,
		otherwise?: OptLazy<O>,
	): O {
		return OptLazy(otherwise!);
	}

	getConnectionsFrom(): MapCollection<N, V> {
		return this.context.linkConnectionsContext.empty();
	}

	addNode(node: N): ValuedGraph.NonEmpty<N, V> {
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

		const linkMap = this.context.linkMapContext.from(
			Stream.from(nodes).map((node) => [node, emptyConnections]),
		);

		if (linkMap.nonEmpty()) {
			return this.context.createNonEmpty(linkMap, 0);
		}

		return this;
	}

	connect(node1: N, node2: N, value: V): ValuedGraph.NonEmpty<N, V> {
		const linkMap = this.context.linkMapContext.of([
			node1,
			this.context.linkConnectionsContext.of([node2, value]) as MapCollection<
				N,
				V
			>,
		]) as MapCollection.NonEmpty<N, MapCollection<N, V>>;

		if (node1 === node2) return this.context.createNonEmpty(linkMap, 1);

		const linkConnections = this.isDirected
			? this.context.linkConnectionsContext.empty()
			: this.context.linkConnectionsContext.of([node1, value]);

		return this.context.createNonEmpty(linkMap.set(node2, linkConnections), 1);
	}

	connectAll(links: StreamSource<ValuedLink<N, V>>): any {
		return this.context.from(links);
	}

	modifyAt(node1: N, node2: N, options: ModifyOptions<V>): ValuedGraph<N, V> {
		if (checkEmptyModifyOptions(options)) return this;

		const { ifNew } = options;
		if (undefined === ifNew) return this;

		const { set, create } = ifNew;
		const token = Symbol();
		const newValue = undefined !== create ? create(token) : set;

		if (token === newValue) return this;

		return this.connect(node1, node2, newValue);
	}

	mapValues(): any {
		return this;
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

	toBuilder(): ValuedGraph.Builder<N, V> {
		return this.context.builder();
	}
}
