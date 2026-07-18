import type { RMap } from '@rimbu/collection-types';
import type { RelatedTo, ToJSON } from '@rimbu/common/types';
import type { Link } from '@rimbu/graph/link';
import type { ValuedGraphElement, ValuedLink } from '@rimbu/graph/valued-link';

import type { ValuedGraphBase } from '#graph/valued/base';
import type { ValuedGraphContextImpl } from '#graph/valued/context-factory';
import type { ValuedGraph } from '#graph/valued/valued-graph';

import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { NonEmptyBase } from '@rimbu/collection-types/advanced/common/empty-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

export class ValuedGraphNonEmpty<N, V>
	extends NonEmptyBase<ValuedGraphElement<N, V>>
	implements ValuedGraphBase.NonEmpty<N, V>
{
	declare _NonEmptyType: ValuedGraph.NonEmpty<N, V>;

	constructor(
		readonly isDirected: boolean,
		readonly context: ValuedGraphContextImpl<N>,
		readonly linkMap: RMap.NonEmpty<N, RMap<N, V>>,
		readonly connectionSize: number,
	) {
		super();
	}

	copy(
		linkMap: RMap.NonEmpty<N, RMap<N, V>>,
		connectionSize: number,
	): ValuedGraph.NonEmpty<N, V> {
		if (linkMap === this.linkMap && connectionSize === this.connectionSize) {
			return this;
		}
		return this.context.createNonEmpty(linkMap, connectionSize);
	}

	copyE(
		linkMap: RMap<N, RMap<N, V>>,
		connectionSize: number,
	): ValuedGraph<N, V> {
		if (linkMap.nonEmpty()) {
			return this.copy(linkMap, connectionSize);
		}

		return this.context.empty();
	}

	assumeNonEmpty(): this {
		return this;
	}

	asNormal(): this {
		return this;
	}

	forEach(
		f: (
			entry: ValuedGraphElement<N, V>,
			index: number,
			halt: () => void,
		) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		const mapIter = this.linkMap[Symbol.iterator]();
		const done = Symbol();
		let targetsEntry: readonly [N, RMap<N, V>] | typeof done;

		while (!state.halted && done !== (targetsEntry = mapIter.fastNext(done))) {
			const [node, targets] = targetsEntry;

			if (targets.isEmpty) {
				f([node], state.nextIndex(), state.halt);
			} else {
				const targetsIter = targets[Symbol.iterator]();
				let target: readonly [N, V] | typeof done;

				while (
					!state.halted &&
					done !== (target = targetsIter.fastNext(done))
				) {
					const [targetNode, value] = target;
					f([node, targetNode, value], state.nextIndex(), state.halt);
				}
			}
		}
	}

	stream(): Stream.NonEmpty<ValuedGraphElement<N, V>> {
		return this.linkMap.stream().flatMap(([node, targets]) => {
			if (!targets.nonEmpty()) return [[node]];
			return targets
				.stream()
				.map(
					([target, value]) =>
						[node, target, value] as ValuedGraphElement<N, V>,
				);
		});
	}

	get nodeSize(): number {
		return this.linkMap.size;
	}

	streamNodes(): Stream.NonEmpty<N> {
		return this.linkMap.streamKeys();
	}

	streamConnections(): Stream<ValuedLink<N, V>> {
		return this.linkMap
			.stream()
			.flatMap(([node1, targets]) =>
				targets
					.stream()
					.map(([node2, value]) => [node1, node2, value] as [N, N, V]),
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

		return targets?.hasKey(node2) ?? false;
	}

	getValue<UN, O>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
		otherwise?: OptLazy<O>,
	): V | O {
		const targets = this.linkMap.at(node1);

		if (undefined === targets) return OptLazy(otherwise!);

		return targets.at(node2, otherwise!);
	}

	getConnectionStreamFrom<UN = N>(
		node1: RelatedTo<N, UN>,
	): Stream<ValuedLink<N, V>> {
		const targets = this.linkMap.at(node1);

		if (undefined === targets) return Stream.empty();

		return targets
			.stream()
			.map(([node2, value]) => [node1, node2, value] as [N, N, V]);
	}

	getConnectionStreamTo<UN = N>(
		node: RelatedTo<N, UN>,
	): Stream<ValuedLink<N, V>> {
		if (this.isDirected) {
			return this.streamConnections().filter(([_, node2]) => node2 === node);
		}

		const targets = this.linkMap.at(node);

		if (undefined === targets) return Stream.empty();

		return targets
			.stream()
			.map(([node1, value]) => [node1, node, value] as [N, N, V]);
	}

	getConnectionsFrom<UN = N>(node1: RelatedTo<N, UN>): RMap<N, V> {
		return this.linkMap.at(node1, this.context.linkConnectionsContext.empty());
	}

	isSink<UN = N>(node: RelatedTo<N, UN>): boolean {
		const targets = this.linkMap.at(node);

		return targets?.isEmpty ?? false;
	}

	isSource<UN = N>(node: RelatedTo<N, UN>): boolean {
		return (
			this.linkMap.hasKey(node) &&
			this.linkMap.streamValues().every((targets) => !targets.hasKey(node))
		);
	}

	addNode(node: N): ValuedGraph.NonEmpty<N, V> {
		return this.copy(
			this.linkMap
				.modifyAt(node, {
					ifNew: { create: this.context.linkConnectionsContext.empty },
				})
				.assumeNonEmpty(),
			this.connectionSize,
		);
	}

	addNodes(nodes: StreamSource<N>): ValuedGraph.NonEmpty<N, V> {
		const builder = this.toBuilder();
		builder.addNodes(nodes);
		return builder.build().assumeNonEmpty();
	}

	removeNode<UN = N>(node: RelatedTo<N, UN>): ValuedGraph<N, V> {
		const builder = this.toBuilder();
		builder.removeNode(node);
		return builder.build();
	}

	removeNodes<UN>(nodes: StreamSource<RelatedTo<N, UN>>): ValuedGraph<N, V> {
		const builder = this.toBuilder();
		builder.removeNodes(nodes);
		return builder.build();
	}

	connect(node1: N, node2: N, value: V): ValuedGraph.NonEmpty<N, V> {
		const newLinkMap = this.linkMap.modifyAt(node1, {
			ifNew: {
				create: () => this.context.linkConnectionsContext.of([node2, value]),
			},
			ifExists: { update: (targets) => targets.set(node2, value) },
		});

		if (newLinkMap === this.linkMap) return this;

		const newConnectionSize = this.connectionSize + 1;

		if (Object.is(node1, node2) || this.isDirected) {
			return this.context.createNonEmpty(
				newLinkMap.assumeNonEmpty(),
				newConnectionSize,
			);
		}

		return this.copy(
			newLinkMap
				.modifyAt(node2, {
					ifNew: {
						create: () => {
							if (this.isDirected) {
								return this.context.linkConnectionsContext.empty();
							}
							return this.context.linkConnectionsContext.of([node1, value]);
						},
					},
				})
				.assumeNonEmpty(),
			newConnectionSize,
		);
	}

	connectAll(
		links: StreamSource<ValuedLink<N, V>>,
	): ValuedGraph.NonEmpty<N, V> {
		const builder = this.toBuilder();
		builder.connectAll(links);
		return builder.build().assumeNonEmpty();
	}

	modifyAt(
		node1: N,
		node2: N,
		options: ModifyOptions<V>,
	): ValuedGraph.NonEmpty<N, V> {
		if (checkEmptyModifyOptions(options)) return this;

		let newConnectionSize = this.connectionSize;
		let addedOrUpdatedValue: V;

		const { ifNew, ifExists } = options;
		const linkMapOptions: ModifyOptions<RMap<N, V>> = {};

		if (undefined !== ifNew) {
			linkMapOptions.ifNew = {
				create: (skip) => {
					const { set, create } = ifNew;
					const token = Symbol();
					const newValue = undefined !== create ? create(token) : set;

					if (token === newValue) return skip;

					addedOrUpdatedValue = newValue;
					newConnectionSize++;

					return this.context.linkMapContext.of([node2, newValue]);
				},
			};
		}

		if (undefined !== ifExists) {
			linkMapOptions.ifExists = {
				update: (valueMap) => {
					return valueMap.modifyAt(node2, {
						ifNew: {
							create: (skip) => {
								if (undefined === ifNew) return skip;

								const { set, create } = ifNew;
								const token = Symbol();
								const newValue = undefined !== create ? create(token) : set;

								if (token === newValue) return skip;

								addedOrUpdatedValue = newValue;
								newConnectionSize++;

								return newValue;
							},
						},
						ifExists: {
							update: (currentValue, remove) => {
								const { set, update } = ifExists;
								const token = Symbol();
								const newValue =
									undefined !== update ? update(currentValue, token) : set;

								if (Object.is(newValue, currentValue)) return currentValue;

								if (token === newValue) {
									newConnectionSize--;
									return remove;
								}

								addedOrUpdatedValue = newValue;
								return newValue;
							},
						},
					});
				},
			};
		}

		const newLinkMap = this.linkMap.modifyAt(node1, linkMapOptions);

		if (newLinkMap === this.linkMap) return this;

		if (this.isDirected) {
			return this.copy(newLinkMap.assumeNonEmpty(), newConnectionSize);
		}

		// edge graph, need to update counterpart

		if (newConnectionSize === this.connectionSize) {
			// value was updated
			const newLinkMap2 = newLinkMap.modifyAt(node2, {
				ifNew: {
					create: () =>
						this.context.linkMapContext.of([node1, addedOrUpdatedValue]),
				},
				ifExists: {
					update: (valueMap) => valueMap.set(node1, addedOrUpdatedValue),
				},
			});

			return this.copy(newLinkMap2.assumeNonEmpty(), newConnectionSize);
		}

		if (newConnectionSize < this.connectionSize) {
			// value was removed
			const newLinkMap2 = newLinkMap.modifyAt(node2, {
				ifExists: { update: (valueMap) => valueMap.removeKey(node1) },
			});

			return this.copy(newLinkMap2.assumeNonEmpty(), newConnectionSize);
		}

		// value was added
		const newLinkMap2 = newLinkMap.modifyAt(node2, {
			ifNew: {
				create: () =>
					this.context.linkMapContext.of([node1, addedOrUpdatedValue]),
			},
			ifExists: {
				update: (valueMap) => valueMap.set(node1, addedOrUpdatedValue),
			},
		});

		return this.copy(newLinkMap2.assumeNonEmpty(), newConnectionSize);
	}

	disconnect<UN = N>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
	): ValuedGraph.NonEmpty<N, V> {
		if (
			!this.linkMap.context.isValidKey(node1) ||
			!this.linkMap.context.isValidKey(node2)
		)
			return this;

		const newLinkMap = this.linkMap.updateAt(node1, (targets) =>
			targets.removeKey(node2),
		);

		if (newLinkMap === this.linkMap) return this;

		const newConnectionSize = this.connectionSize - 1;

		if (this.isDirected) return this.copy(newLinkMap, newConnectionSize);

		return this.copy(
			newLinkMap.updateAt(node2, (targets) => targets.removeKey(node1)),
			newConnectionSize,
		);
	}

	disconnectAll<UN = N>(
		links: StreamSource<Link<RelatedTo<N, UN>>>,
	): ValuedGraph.NonEmpty<N, V> {
		const builder = this.toBuilder();
		builder.disconnectAll(links);
		return builder.build().assumeNonEmpty();
	}

	removeUnconnectedNodes(): ValuedGraph<N, V> {
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
					!this.linkMap.streamValues().some((t) => t.hasKey(source))
				) {
					return source;
				}
				return skip;
			});

		return this.removeNodes(unconnectedNodes);
	}

	mapValues<V2>(
		mapFun: (value: V, node1: N, node2: N) => V2,
	): ValuedGraph.NonEmpty<N, V2> {
		const newLinkMap = this.linkMap.mapValues((targets, node1) =>
			targets.mapValues((value, node2) => mapFun(value, node1, node2)),
		);

		return this.context.createNonEmpty<N, V2>(newLinkMap, this.connectionSize);
	}

	toString(): string {
		const connector = this.isDirected ? '->' : '<->';

		return this.linkMap.stream().join({
			start: `${this.context.typeTag}(\n  `,
			sep: ',\n  ',
			end: '\n)',
			valueToString: ([node, targets]) =>
				`${node} ${connector} ${targets.stream().join({
					start: '[',
					sep: ', ',
					end: ']',
					valueToString: ([node2, value]) => `{${node2}: ${value}}`,
				})}`,
		});
	}

	toJSON(): ToJSON<[N, (readonly [N, V])[]][]> {
		return {
			dataType: this.context.typeTag,
			value: this.linkMap
				.stream()
				.map(
					(entry) => [entry[0], entry[1].toArray()] as [N, (readonly [N, V])[]],
				)
				.toArray(),
		};
	}

	toBuilder(): ValuedGraph.Builder<N, V> {
		return this.context.createBuilder<N, V>(this as any);
	}
}
