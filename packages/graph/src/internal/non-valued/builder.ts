import type { MapCollection } from '@rimbu/collection-types/map';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { RelatedTo } from '@rimbu/common/types';

import type { Graph } from '#graph/graph';
import type { GraphContextImpl } from '#graph/non-valued/context-factory';

import * as RimbuError from '@rimbu/base/rimbu-error';
import { TraverseState } from '@rimbu/common/traverse-state';
import { GraphElement, type Link } from '@rimbu/graph/link';
import { Stream, type StreamSource } from '@rimbu/stream';

export class GraphBuilder<N> implements Graph.Builder<N> {
	connectionSize = 0;

	get isDirected(): boolean {
		return this.context.isDirected;
	}

	constructor(
		readonly context: GraphContextImpl<N>,
		public source?: Graph.NonEmpty<N>,
	) {
		if (undefined !== source) this.connectionSize = source.connectionSize;
	}

	_linkMap?: MapCollection.Builder<N, SetCollection.Builder<N>> | undefined;
	_lock = 0;

	checkLock(): void {
		if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
	}

	get linkMap(): MapCollection.Builder<N, SetCollection.Builder<N>> {
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
		return this.source?.isEmpty ?? this.linkMap.isEmpty;
	}

	get size(): number {
		return this.nodeSize;
	}

	get nodeSize(): number {
		return this.source?.nodeSize ?? this.linkMap.size;
	}

	hasNode = <UN>(node: RelatedTo<N, UN>): boolean => {
		return this.source?.hasNode(node) ?? this.linkMap.has(node);
	};

	hasConnection = <UN>(
		node1: RelatedTo<N, UN>,
		node2: RelatedTo<N, UN>,
	): boolean => {
		if (undefined !== this.source) {
			return this.source.hasConnection(node1, node2);
		}

		const targets = this.linkMap.get(node1);
		return targets?.has(node2) ?? false;
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

		if (undefined === targets) return false;

		this.source = undefined;

		if (this.isDirected) {
			// `connectionSize` counts *every* arc, so removing a node drops both its
			// outgoing arcs (this row, removed above by `removeKey`) and its incoming
			// arcs (the other rows the scan below visits). A self-loop is an outgoing
			// arc whose row is the one just removed, so `targets.size` accounts for it
			// exactly once and the scan never sees it.
			this.connectionSize -= targets.size;

			this.linkMap.forEachIndexed(([, targets]) => {
				if (targets.remove(node)) {
					this.connectionSize--;
				}
			});
		} else {
			this.connectionSize -= targets.size;
			targets.forEach((target) => {
				this.linkMap.updateAtKey(target, (values) => {
					values.remove(node);
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

	connectInternal = (node1: N, node2: N): boolean => {
		let changed = false;

		this.linkMap.modifyAtKey(node1, {
			ifNew: {
				create: () => {
					const targetBuilder =
						this.context.linkConnectionsContext.builder<N>();
					targetBuilder.add(node2);
					this.connectionSize++;
					changed = true;
					return targetBuilder;
				},
			},
			ifExists: {
				update: (targets) => {
					if (targets.add(node2)) {
						this.connectionSize++;
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
							this.context.linkConnectionsContext.builder<N>();
						if (!this.isDirected) targetBuilder.add(node1);
						return targetBuilder;
					},
				},
				ifExists: {
					update: (targets) => {
						if (!this.isDirected) targets.add(node1);
						return targets;
					},
				},
			});
		}

		return changed;
	};

	connect = (node1: N, node2: N): boolean => {
		this.checkLock();

		return this.connectInternal(node1, node2);
	};

	connectEach = (connections: StreamSource<[N, N]>): boolean => {
		this.checkLock();

		return (
			Stream.applyFilter(connections, {
				pred: this.connectInternal,
			}).count() > 0
		);
	};

	connectIfNodesExist = (node1: N, node2: N): boolean => {
		this.checkLock();

		let changed = false;

		this.linkMap.updateAtKey(node1, (targets) => {
			if (this.linkMap.has(node2) && targets.add(node2)) {
				this.connectionSize++;
				changed = true;
			}
			return targets;
		});

		if (changed && !this.isDirected) {
			this.source = undefined;

			this.linkMap.updateAtKey(node2, (targets) => {
				targets.add(node1);
				return targets;
			});
		}

		return changed;
	};

	addGraphElement = (element: GraphElement<N>): boolean => {
		if (GraphElement.isLink(element)) {
			return this.connectInternal(element[0], element[1]);
		}

		return this.addNodeInternal(element[0]);
	};

	addGraphElements = (elements: StreamSource<GraphElement<N>>): boolean => {
		return (
			Stream.from(elements).filterPure({ pred: this.addGraphElement }).count() >
			0
		);
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

		this.linkMap.updateAtKey(node1, (targets) => {
			if (targets.remove(node2)) {
				this.connectionSize--;
				changed = true;
			}
			return targets;
		});

		if (changed) this.source = undefined;

		if (changed && node1 !== node2 && !this.isDirected) {
			this.linkMap.updateAtKey(node2, (targets) => {
				targets.remove(node1);
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
			Stream.applyFilter(
				connections as StreamSource<[RelatedTo<N, UN>, RelatedTo<N, UN>]>,
				{ pred: this.disconnectInternal },
			).count() > 0
		);
	};

	forEach(
		f: (entry: GraphElement<N>, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		this.forEachIndexed(f, options);
	}

	forEachIndexed(
		f: (entry: GraphElement<N>, index: number, halt: () => void) => void,
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
						(target) => {
							f([source, target], state.nextIndex(), state.halt);
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

	clear = (): void => {
		this.checkLock();
		this.source = undefined;
		this._linkMap = undefined;
		this.connectionSize = 0;
	};

	build = (): Graph<N> => {
		if (undefined !== this.source) return this.source;

		if (this.isEmpty) return this.context.empty();

		const linkMap = this.linkMap
			.buildMapValues((targets) => targets.build())
			.assumeNonEmpty();

		return this.context.createNonEmpty(linkMap, this.connectionSize);
	};
}
