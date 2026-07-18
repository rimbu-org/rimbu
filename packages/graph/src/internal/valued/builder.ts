import type { RMap } from '@rimbu/collection-types';
import type { RelatedTo } from '@rimbu/common/types';
import type { Link } from '@rimbu/graph/link';

import type { ValuedGraphContextImpl } from '#graph/valued/context-factory';
import type { ValuedGraph } from '#graph/valued/valued-graph';

import * as RimbuError from '@rimbu/base/rimbu-error';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';
import { ValuedGraphElement } from '@rimbu/graph/valued-link';
import { Stream, type StreamSource } from '@rimbu/stream';

export class ValuedGraphBuilder<N, V> implements ValuedGraph.Builder<N, V> {
	connectionSize = 0;

	constructor(
		readonly isDirected: boolean,
		readonly context: ValuedGraphContextImpl<N>,
		public source?: ValuedGraph.NonEmpty<N, V>,
	) {
		if (undefined !== source) this.connectionSize = source.connectionSize;
	}

	_linkMap?: RMap.Builder<N, RMap.Builder<N, V>>;
	_lock = 0;

	checkLock(): void {
		if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
	}

	get linkMap(): RMap.Builder<N, RMap.Builder<N, V>> {
		if (undefined === this._linkMap) {
			if (undefined === this.source) {
				this._linkMap = this.context.linkMapContext.builder();
			} else {
				this._linkMap = this.source.linkMap
					.mapValues((targets) => targets.toBuilder())
					.toBuilder();
			}
		}

		return this._linkMap;
	}

	get isEmpty(): boolean {
		if (this.source) return this.source.isEmpty;
		return this.linkMap.isEmpty;
	}

	get nodeSize(): number {
		if (this.source) return this.source.nodeSize;
		return this.linkMap.size;
	}

	hasNode = <UN>(node: RelatedTo<N, UN>): boolean => {
		if (this.source) return this.source.hasNode(node);
		return this.linkMap.hasKey(node);
	};

	hasConnection = <UN>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
	): boolean => {
		if (this.source) return this.source.hasConnection(node1, node2);

		const targets = this.linkMap.at(node1);

		return targets?.hasKey(node2) ?? false;
	};

	getValue = <UN, O>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
		otherwise?: OptLazy<O>,
	): V | O => {
		if (undefined !== this.source) {
			return this.source.getValue(node1, node2, otherwise!);
		}

		const targets = this.linkMap.at(node1);

		if (undefined === targets) return OptLazy(otherwise!);

		return targets.at(node2, otherwise!);
	};

	addNodeInternal = (node: N): boolean => {
		const changed = this.linkMap.modifyAt(node, {
			ifNew: { create: this.context.linkConnectionsContext.builder },
		});

		if (changed) this.source = undefined;

		return changed;
	};

	addNode = (node: N): boolean => {
		this.checkLock();

		return this.addNodeInternal(node);
	};

	addNodes = (nodes: StreamSource<N>): boolean => {
		this.checkLock();

		return (
			Stream.from(nodes).filterPure({ pred: this.addNodeInternal }).count() > 0
		);
	};

	removeNodeInternal = <UN>(node: RelatedTo<N, UN>): boolean => {
		const targets = this.linkMap.removeKey(node);

		if (!targets) return false;

		this.source = undefined;

		if (this.isDirected) {
			this.linkMap.forEach(([sourceNode, targets]) => {
				if (targets.removeKey(node)) {
					if (sourceNode !== node) this.connectionSize--;
				}
			});
		} else {
			this.connectionSize -= targets.size;

			targets.forEach(([target]) => {
				this.linkMap.updateAt(target, (values) => {
					values.removeKey(node);
					return values;
				});
			});
		}

		return true;
	};

	removeNode = <UN>(node: RelatedTo<N, UN>): boolean => {
		this.checkLock();

		return this.removeNodeInternal(node);
	};

	removeNodes = <UN>(nodes: StreamSource<RelatedTo<N, UN>>): boolean => {
		this.checkLock();

		return (
			Stream.from(nodes).filterPure({ pred: this.removeNodeInternal }).count() >
			0
		);
	};

	connectInternal = (node1: N, node2: N, value: V): boolean => {
		let changed = false;

		this.linkMap.modifyAt(node1, {
			ifNew: {
				create: () => {
					const targetBuilder = this.context.linkConnectionsContext.builder<
						N,
						V
					>();
					targetBuilder.set(node2, value);
					this.connectionSize++;
					changed = true;
					return targetBuilder;
				},
			},
			ifExists: {
				update: (targets) => {
					const oldSize = targets.size;
					if (targets.set(node2, value)) {
						if (targets.size !== oldSize) this.connectionSize++;
						changed = true;
					}
					return targets;
				},
			},
		});

		if (changed) this.source = undefined;

		if (changed && node1 !== node2) {
			this.linkMap.modifyAt(node2, {
				ifNew: {
					create: () => {
						const targetBuilder = this.context.linkConnectionsContext.builder<
							N,
							V
						>();
						if (!this.isDirected) targetBuilder.set(node1, value);
						return targetBuilder;
					},
				},
				ifExists: {
					update: (targets) => {
						if (!this.isDirected) targets.set(node1, value);
						return targets;
					},
				},
			});
		}

		return changed;
	};

	connect = (node1: N, node2: N, value: V): boolean => {
		this.checkLock();

		return this.connectInternal(node1, node2, value);
	};

	connectAll = (
		connections: StreamSource<ValuedGraphElement<N, V>>,
	): boolean => {
		this.checkLock();

		return (
			Stream.applyFilter(connections as StreamSource<[N, N, V]>, {
				pred: this.connectInternal,
			}).count() > 0
		);
	};

	addGraphElement = (element: ValuedGraphElement<N, V>): boolean => {
		if (ValuedGraphElement.isLink(element)) {
			return this.connectInternal(element[0], element[1], element[2]);
		}

		return this.addNodeInternal(element[0]);
	};

	addGraphElements = (
		elements: StreamSource<ValuedGraphElement<N, V>>,
	): boolean => {
		return (
			Stream.from(elements).filterPure({ pred: this.addGraphElement }).count() >
			0
		);
	};

	modifyAt = (node1: N, node2: N, options: ModifyOptions<V>): boolean => {
		this.checkLock();
		if (checkEmptyModifyOptions(options)) return false;

		const preConnectionSize = this.connectionSize;
		let changed = false;
		let addedOrUpdatedValue: V;
		const { ifNew, ifExists } = options;

		const linkMapOptions: ModifyOptions<RMap.Builder<N, V>> = {};
		if (undefined !== ifNew) {
			linkMapOptions.ifNew = {
				create: (skip) => {
					const { set, create } = ifNew;
					const token = Symbol();
					const newValue = undefined !== create ? create(token) : set;

					if (token === newValue) return skip;

					changed = true;
					addedOrUpdatedValue = newValue;
					this.connectionSize++;

					const builder = this.context.linkMapContext.builder<N, V>();

					builder.set(node2, newValue);

					return builder;
				},
			};
		}
		if (undefined !== ifExists) {
			linkMapOptions.ifExists = {
				update: (valueMap) => {
					valueMap.modifyAt(node2, {
						ifNew: {
							create: (skip) => {
								if (undefined === ifNew) return skip;

								const { set, create } = ifNew;
								const token = Symbol();
								const newValue = undefined !== create ? create(token) : set;

								if (token === newValue) return skip;

								changed = true;
								addedOrUpdatedValue = newValue;
								this.connectionSize++;

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

								changed = true;

								if (token === newValue) {
									this.connectionSize--;
									return remove;
								}

								addedOrUpdatedValue = newValue;
								return newValue;
							},
						},
					});

					return valueMap;
				},
			};
		}

		this.linkMap.modifyAt(node1, linkMapOptions);

		if (!changed) return false;
		if (this.isDirected) return true;

		// edge graph, need to update counterpart

		if (this.connectionSize === preConnectionSize) {
			// value was updated
			this.linkMap.modifyAt(node2, {
				ifNew: {
					create: () => {
						const builder = this.context.linkMapContext.builder<N, V>();
						builder.set(node1, addedOrUpdatedValue);
						return builder;
					},
				},
				ifExists: {
					update: (valueMap) => {
						valueMap.set(node1, addedOrUpdatedValue);
						return valueMap;
					},
				},
			});

			return true;
		}

		if (this.connectionSize < preConnectionSize) {
			// value was removed
			this.linkMap.modifyAt(node2, {
				ifExists: {
					update: (valueMap) => {
						valueMap.removeKey(node1);
						return valueMap;
					},
				},
			});

			return true;
		}

		// value was added
		this.linkMap.modifyAt(node2, {
			ifNew: {
				create: () => {
					const builder = this.context.linkMapContext.builder<N, V>();
					builder.set(node1, addedOrUpdatedValue);
					return builder;
				},
			},
			ifExists: {
				update: (valueMap) => {
					valueMap.set(node1, addedOrUpdatedValue);
					return valueMap;
				},
			},
		});

		return true;
	};

	disconnectInternal = <UN>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
	): boolean => {
		if (
			!this.linkMap.context.isValidKey(node1) ||
			!this.linkMap.context.isValidKey(node2)
		) {
			return false;
		}

		let changed = false;

		const token = Symbol();

		this.linkMap.updateAt(node1, (targets) => {
			if (token !== targets.removeKey(node2, token)) {
				this.connectionSize--;
				changed = true;
			}
			return targets;
		});

		if (changed) this.source = undefined;

		if (changed && node1 !== node2 && !this.isDirected) {
			this.linkMap.updateAt(node2, (targets) => {
				targets.removeKey(node1);
				return targets;
			});
		}

		return changed;
	};

	disconnect = <UN>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
	): boolean => {
		this.checkLock();

		return this.disconnectInternal(node1, node2);
	};

	disconnectAll = <UN>(
		connections: StreamSource<Link<RelatedTo<N, UN>>>,
	): boolean => {
		this.checkLock();

		return (
			Stream.applyFilter(connections as StreamSource<[N, N]>, {
				pred: this.disconnectInternal,
			}).count() > 0
		);
	};

	forEach(
		f: (
			entry: ValuedGraphElement<N, V>,
			index: number,
			halt: () => void,
		) => void,
		options: { state?: TraverseState } = {},
	): void {
		if (undefined !== this.source) {
			this.source.forEach(f, options);
			return;
		}

		const { state = TraverseState() } = options;

		this.linkMap.forEach(
			([source, targets]) => {
				f([source], state.nextIndex(), state.halt);

				targets.forEach(
					([target, value]) => {
						f([source, target, value], state.nextIndex(), state.halt);
					},
					{ state },
				);
			},
			{ state },
		);
	}

	build = (): ValuedGraph<N, V> => {
		if (undefined !== this.source) return this.source;

		if (this.isEmpty) return this.context.empty();

		const linkMap = this.linkMap
			.buildMapValues((targets) => targets.build())
			.assumeNonEmpty();

		return this.context.createNonEmpty(linkMap, this.connectionSize);
	};

	buildMapValues = <V2>(
		mapFun: (value: V, node1: N, node2: N) => V2,
	): ValuedGraph<N, V2> => {
		if (undefined !== this.source) return this.source.mapValues(mapFun);

		if (this.isEmpty) return this.context.empty();

		const linkMap = this.linkMap
			.buildMapValues((targets, source) =>
				targets.buildMapValues((value, target) =>
					mapFun(value, source, target),
				),
			)
			.assumeNonEmpty();

		return this.context.createNonEmpty(linkMap, this.connectionSize) as any;
	};
}
