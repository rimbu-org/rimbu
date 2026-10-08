import type { MapCollection } from '@rimbu/collection-types/map';
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

	get isDirected(): boolean {
		return this.context.isDirected;
	}

	constructor(
		readonly context: ValuedGraphContextImpl<N>,
		public source?: ValuedGraph.NonEmpty<N, V>,
	) {
		if (undefined !== source) this.connectionSize = source.connectionSize;
	}

	// The outer link map is mutable, and so is each connection map it holds —
	// `build()` converts the inner builders back with `buildMapValues`. This is
	// why the value type is a *builder* and not `LinkValuesType`: it is what the
	// builder genuinely stores, not a shorthand for the immutable form.
	_linkMap?: MapCollection.Builder<N, MapCollection.Builder<N, V>>;
	_lock = 0;

	checkLock(): void {
		if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
	}

	get linkMap(): MapCollection.Builder<N, MapCollection.Builder<N, V>> {
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

	get size(): number {
		return this.nodeSize;
	}

	get nodeSize(): number {
		if (this.source) return this.source.nodeSize;
		return this.linkMap.size;
	}

	hasNode = <UN>(node: RelatedTo<N, UN>): boolean => {
		if (this.source) return this.source.hasNode(node);
		return this.linkMap.has(node);
	};

	hasConnection = <UN>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
	): boolean => {
		if (this.source) return this.source.hasConnection(node1, node2);

		const targets = this.linkMap.get(node1);

		return targets?.has(node2) ?? false;
	};

	getValue = <UN, O>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
		otherwise?: OptLazy<O>,
	): V | O => {
		if (undefined !== this.source) {
			return this.source.getValue(node1, node2, otherwise!);
		}

		const targets = this.linkMap.get(node1);

		if (undefined === targets) return OptLazy(otherwise!);

		return targets.get(node2, otherwise!);
	};

	addNodeInternal = (node: N): boolean => {
		const changed = this.linkMap.modifyAtKey(node, {
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
			// `connectionSize` counts *every* arc, so removing a node drops both its
			// outgoing arcs (this row, removed above by `removeKey`) and its incoming
			// arcs (the other rows the scan below visits). A self-loop is an outgoing
			// arc whose row is the one just removed, so `targets.size` accounts for it
			// exactly once and the scan never sees it.
			this.connectionSize -= targets.size;

			this.linkMap.forEachIndexed(([, targets]) => {
				if (targets.removeKey(node)) {
					this.connectionSize--;
				}
			});
		} else {
			this.connectionSize -= targets.size;

			targets.forEach(([target]) => {
				this.linkMap.updateAtKey(target, (values) => {
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

		this.linkMap.modifyAtKey(node1, {
			ifNew: {
				create: () => {
					const targetBuilder =
						this.context.linkConnectionsContext.builder<readonly [N, V]>();
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
			this.linkMap.modifyAtKey(node2, {
				ifNew: {
					create: () => {
						const targetBuilder =
							this.context.linkConnectionsContext.builder<readonly [N, V]>();
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

	connectEach = (
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

		const linkMapOptions: ModifyOptions<MapCollection.Builder<N, V>> = {};
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

					const builder =
						this.context.linkConnectionsContext.builder<readonly [N, V]>();

					builder.set(node2, newValue);

					return builder;
				},
			};
		}
		if (undefined !== ifExists) {
			linkMapOptions.ifExists = {
				update: (valueMap) => {
					valueMap.modifyAtKey(node2, {
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

		this.linkMap.modifyAtKey(node1, linkMapOptions);

		if (!changed) return false;
		if (this.isDirected) return true;

		// edge graph, need to update counterpart

		if (this.connectionSize === preConnectionSize) {
			// value was updated
			this.linkMap.modifyAtKey(node2, {
				ifNew: {
					create: () => {
						const builder =
							this.context.linkConnectionsContext.builder<readonly [N, V]>();
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
			this.linkMap.modifyAtKey(node2, {
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
		this.linkMap.modifyAtKey(node2, {
			ifNew: {
				create: () => {
					const builder =
						this.context.linkConnectionsContext.builder<readonly [N, V]>();
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

		this.linkMap.updateAtKey(node1, (targets) => {
			if (token !== targets.removeKey(node2, token)) {
				this.connectionSize--;
				changed = true;
			}
			return targets;
		});

		if (changed) this.source = undefined;

		if (changed && node1 !== node2 && !this.isDirected) {
			this.linkMap.updateAtKey(node2, (targets) => {
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

	disconnectEach = <UN>(
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

		// `finally` is load-bearing: `f` is user code and may throw, including via
		// `halt`. Without it the lock leaks and every later mutation on this
		// builder is rejected forever.
		this._lock++;
		try {
			this.linkMap.forEachIndexed(
				([source, targets]) => {
					// A node is reported as an isolated-node element only when it
					// really is isolated — matching the immutable `forEach`. Emitting
					// it unconditionally made the builder yield one extra element per
					// connected node, so `builder.forEach` and `builder.build().stream()`
					// disagreed.
					if (targets.isEmpty) f([source], state.nextIndex(), state.halt);

					targets.forEachIndexed(
						([target, value]) => {
							f([source, target, value], state.nextIndex(), state.halt);
						},
						{ state },
					);
				},
				{ state },
			);
		} finally {
			this._lock--;
		}
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
