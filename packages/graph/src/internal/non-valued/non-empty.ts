import type { RMap, RSet } from '@rimbu/collection-types';
import type { RelatedTo, ToJSON } from '@rimbu/common/types';
import type { GraphElement, Link } from '@rimbu/graph/link';

import type { GraphBase } from '#graph/base';
import type { Graph } from '#graph/graph';
import type { GraphContextImpl } from '#graph/non-valued/context-factory';

import { NonEmptyBase } from '@rimbu/collection-types/advanced/common/empty-base';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

export class GraphNonEmpty<N>
	extends NonEmptyBase<GraphElement<N>>
	implements GraphBase.NonEmpty<N>
{
	declare _NonEmptyType: Graph.NonEmpty<N>;

	constructor(
		readonly isDirected: boolean,
		readonly context: GraphContextImpl<N>,
		readonly linkMap: RMap.NonEmpty<N, RSet<N>>,
		readonly connectionSize: number,
	) {
		super();
	}

	copy(
		linkMap: RMap.NonEmpty<N, RSet<N>>,
		connectionSize: number,
	): Graph.NonEmpty<N> {
		if (linkMap === this.linkMap && connectionSize === this.connectionSize)
			return this;
		return this.context.createNonEmpty(linkMap, connectionSize);
	}

	copyE(linkMap: RMap<N, RSet<N>>, connectionSize: number): Graph<N> {
		if (linkMap.nonEmpty()) return this.copy(linkMap, connectionSize);
		return this.context.empty();
	}

	assumeNonEmpty(): this {
		return this;
	}

	asNormal(): this {
		return this;
	}

	forEach(
		f: (node: GraphElement<N>, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		const mapIter = this.linkMap[Symbol.iterator]();
		const done = Symbol();
		let targetsEntry: readonly [N, RSet<N>] | typeof done;

		while (!state.halted && done !== (targetsEntry = mapIter.fastNext(done))) {
			const [node, targets] = targetsEntry;

			if (targets.isEmpty) {
				f([node], state.nextIndex(), state.halt);
			} else {
				const targetsIter = targets[Symbol.iterator]();
				let target: N | typeof done;

				while (
					!state.halted &&
					done !== (target = targetsIter.fastNext(done))
				) {
					f([node, target], state.nextIndex(), state.halt);
				}
			}
		}
	}

	stream(): Stream.NonEmpty<GraphElement<N>> {
		return this.linkMap.stream().flatMap(([node, targets]) => {
			if (!targets.nonEmpty()) return [[node]];
			return targets
				.stream()
				.map((target) => [node, target] as GraphElement<N>);
		});
	}

	get nodeSize(): number {
		return this.linkMap.size;
	}

	streamNodes(): Stream.NonEmpty<N> {
		return this.linkMap.streamKeys();
	}

	streamConnections(): Stream<Link<N>> {
		return this.linkMap
			.stream()
			.flatMap(([node1, targets]) =>
				targets.stream().map((node2) => [node1, node2] as [N, N]),
			);
	}

	hasNode<UN = N>(node: RelatedTo<N, UN>): boolean {
		return this.linkMap.hasKey(node);
	}

	hasConnection<UN = N>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
	): boolean {
		const targets = this.linkMap.at(node1);

		return targets?.has(node2) ?? false;
	}

	getConnectionStreamFrom<UN = N>(node1: RelatedTo<N, UN>): Stream<Link<N>> {
		const targets = this.linkMap.at(node1);

		if (undefined === targets) return Stream.empty();

		return targets.stream().map((node2) => [node1, node2] as [N, N]);
	}

	getConnectionStreamTo<UN = N>(node: RelatedTo<N, UN>): any {
		if (this.isDirected) {
			return this.linkMap.stream().collect(([source, targets], _, skip) => {
				if (!targets?.has(node)) return skip;
				return [source, node];
			});
		}

		const targets = this.linkMap.at(node);

		if (undefined === targets) return Stream.empty();

		return targets.stream().map((node1) => [node1, node]);
	}

	getConnectionsFrom<UN = N>(node1: RelatedTo<N, UN>): RSet<N> {
		return this.linkMap.at(
			node1,
			this.context.linkConnectionsContext.empty<N>(),
		);
	}

	isSink<UN = N>(node: RelatedTo<N, UN>): boolean {
		const targets = this.linkMap.at(node);

		return targets?.isEmpty ?? false;
	}

	isSource<UN>(node: RelatedTo<N, UN>): boolean {
		return (
			this.linkMap.hasKey(node) &&
			this.linkMap.streamValues().every((targets) => !targets.has(node))
		);
	}

	addNode(node: N): Graph.NonEmpty<N> {
		return this.copy(
			this.linkMap
				.modifyAt(node, {
					ifNew: { create: this.context.linkConnectionsContext.empty },
				})
				.assumeNonEmpty(),
			this.connectionSize,
		);
	}

	addNodes(nodes: StreamSource<N>): Graph.NonEmpty<N> {
		const builder = this.toBuilder();
		builder.addNodes(nodes);
		return builder.build().assumeNonEmpty();
	}

	removeNode<UN = N>(node: RelatedTo<N, UN>): Graph<N> {
		const builder = this.toBuilder();
		builder.removeNode(node);
		return builder.build();
	}

	removeNodes<UN>(nodes: StreamSource<RelatedTo<N, UN>>): Graph<N> {
		const builder = this.toBuilder();
		builder.removeNodes(nodes);
		return builder.build();
	}

	connect(node1: N, node2: N): Graph.NonEmpty<N> {
		const newLinkMap = this.linkMap.modifyAt(node1, {
			ifNew: { create: () => this.context.linkConnectionsContext.of(node2) },
			ifExists: { update: (targets) => targets.add(node2) },
		});

		if (newLinkMap === this.linkMap) return this;

		const newConnectionSize = this.connectionSize + 1;

		if (node1 === node2) {
			return this.context.createNonEmpty(
				newLinkMap.assumeNonEmpty(),
				newConnectionSize,
			);
		}

		if (this.isDirected) {
			return this.copy(
				newLinkMap
					.modifyAt(node2, {
						ifNew: {
							create: () => this.context.linkConnectionsContext.empty(),
						},
					})
					.assumeNonEmpty(),
				newConnectionSize,
			);
		}

		return this.copy(
			newLinkMap
				.modifyAt(node2, {
					ifNew: {
						create: () => this.context.linkConnectionsContext.of(node1),
					},
					ifExists: { update: (targets) => targets.add(node1) },
				})
				.assumeNonEmpty(),
			newConnectionSize,
		);
	}

	connectAll(links: StreamSource<Link<N>>): Graph.NonEmpty<N> {
		const builder = this.toBuilder();
		builder.connectAll(links);
		return builder.build().assumeNonEmpty();
	}

	disconnect<UN>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
	): Graph.NonEmpty<N> {
		if (
			!this.linkMap.context.isValidKey(node1) ||
			!this.linkMap.context.isValidKey(node2)
		)
			return this;

		const newLinkMap = this.linkMap.updateAt(node1, (targets) =>
			targets.remove(node2),
		);

		if (newLinkMap === this.linkMap) return this;

		const newConnectionSize = this.connectionSize - 1;

		if (this.isDirected) {
			return this.copy(newLinkMap, newConnectionSize);
		}

		return this.copy(
			newLinkMap.updateAt(node2, (targets) => targets.remove(node1)),
			newConnectionSize,
		);
	}

	disconnectAll<UN>(
		links: StreamSource<Link<RelatedTo<N, UN>>>,
	): Graph.NonEmpty<N> {
		const builder = this.toBuilder();
		builder.disconnectAll(links);
		return builder.build().assumeNonEmpty();
	}

	removeUnconnectedNodes(): Graph<N> {
		if (!this.isDirected) {
			const newLinkMap = this.linkMap.filter(([_, targets]) =>
				targets.nonEmpty(),
			);
			return this.copyE(newLinkMap, this.connectionSize);
		}

		const unconnectedNodes = this.linkMap
			.stream()
			.collect(([source, targets], _, skip) => {
				if (
					targets.isEmpty &&
					!this.linkMap.streamValues().some((t) => t.has(source))
				) {
					return source;
				}
				return skip;
			});

		return this.removeNodes(unconnectedNodes);
	}

	toString(): string {
		const connector = this.isDirected ? '->' : '<->';
		return this.linkMap.stream().join({
			start: `${this.context.typeTag}(\n  `,
			sep: ',\n  ',
			end: '\n)',
			valueToString: ([node, targets]) =>
				`${node} ${connector} ${targets.stream().join({ start: '[', sep: ', ', end: ']' })}`,
		});
	}

	toJSON(): ToJSON<[N, [N][]][]> {
		return {
			dataType: this.context.typeTag,
			value: this.linkMap
				.stream()
				.map(
					(entry) =>
						[
							entry[0],
							entry[1]
								.stream()
								.map((v) => [v] as [N])
								.toArray(),
						] as [N, [N][]],
				)
				.toArray(),
		};
	}

	toBuilder(): Graph.Builder<N> {
		return this.context.createBuilder(this);
	}
}
