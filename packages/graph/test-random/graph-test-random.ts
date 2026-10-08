import { describe, expect, it } from 'bun:test';

// The runner is typed against `ArrowGraph`, the abstract non-valued family. The
// edge families are structurally identical for everything this harness touches
// (`getConnectionsFrom`'s *element* type differs by backing, but the harness only
// iterates it), so the drivers cast their context to this parameter type.
import type { ArrowGraph } from '@rimbu/graph/arrow-graph';

/**
 * Randomized differential tests for the **non-valued** graph families.
 *
 * The oracle is a plain adjacency list — `Map<N, Set<N>>` — mutated through the
 * same operations as the collection. Every assertion about the collection is
 * therefore independent of the implementation.
 *
 * ## Cost
 *
 * Verifying the whole graph after *every* operation is O(n²) and dominated the
 * repo-wide `test:random` runtime when it was done that way for `multimap`. So
 * this harness checks the **O(1)** invariants (the four size counters) after
 * every operation, runs the **O(n)** full re-verification every
 * `CHECK_FULL_EVERY` operations, and finishes every case with an explicit
 * `checkFull()`. Coverage is the same; the cost is linear.
 */
export function runGraphRandomTestsWith(
	name: string,
	context: ArrowGraph.Context<number>,
	isDirected: boolean,
): void {
	/** adjacency list: node -> set of out-neighbours */
	class Model {
		readonly adj = new Map<number, Set<number>>();

		/** number of distinct undirected edges, or directed arcs */
		connectionCount(): number {
			let sum = 0;
			for (const [node, targets] of this.adj) {
				sum += targets.size;
				if (!isDirected && targets.has(node)) sum++; // a self-loop is stored once
			}
			// Undirected: each non-self edge is stored in both directions.
			return isDirected ? sum : sum / 2;
		}

		hasNode(node: number): boolean {
			return this.adj.has(node);
		}

		hasConnection(node1: number, node2: number): boolean {
			return this.adj.get(node1)?.has(node2) ?? false;
		}

		addNode(node: number): void {
			if (!this.adj.has(node)) this.adj.set(node, new Set());
		}

		removeNode(node: number): void {
			if (!this.adj.delete(node)) return;
			for (const targets of this.adj.values()) targets.delete(node);
			// A node whose only edge was the removed one keeps an empty entry in the
			// collection's linkMap; the model keeps the entry too (delete above
			// removed only `node`'s own row).
		}

		connect(node1: number, node2: number): void {
			this.addNode(node1);
			this.adj.get(node1)!.add(node2);
			if (isDirected) {
				this.addNode(node2);
				return;
			}
			this.addNode(node2);
			this.adj.get(node2)!.add(node1);
		}

		disconnect(node1: number, node2: number): void {
			this.adj.get(node1)?.delete(node2);
			if (isDirected) return;
			this.adj.get(node2)?.delete(node1);
		}

		removeUnconnectedNodes(): void {
			if (!isDirected) {
				for (const [node, targets] of this.adj) {
					if (targets.size === 0) this.adj.delete(node);
				}
				return;
			}
			for (const [node, targets] of this.adj) {
				if (targets.size > 0) continue;
				let hasIncoming = false;
				for (const other of this.adj.values()) {
					if (other.has(node)) {
						hasIncoming = true;
						break;
					}
				}
				if (hasIncoming) continue;
				this.adj.delete(node);
			}
		}

		isSink(node: number): boolean {
			const targets = this.adj.get(node);
			return targets !== undefined && targets.size === 0;
		}

		isSource(node: number): boolean {
			if (!this.adj.has(node)) return false;
			for (const other of this.adj.values()) if (other.has(node)) return false;
			return true;
		}
	}

	const CHECK_FULL_EVERY = 50;

	/**
	 * Drives both an immutable graph and a builder against one model, so the two
	 * representations are checked against the *same* oracle on every step.
	 */
	class Entangled {
		readonly model = new Model();
		builder = context.builder<number>();
		immm: ArrowGraph<number> = context.empty<number>();

		/** O(1) — the four size counters, plus `size === nodeSize`. */
		checkSizes(): void {
			const nodes = this.model.adj.size;
			const connections = this.model.connectionCount();

			expect(this.builder.nodeSize).toBe(nodes);
			expect(this.builder.connectionSize).toBe(connections);
			expect(this.immm.nodeSize).toBe(nodes);
			expect(this.immm.connectionSize).toBe(connections);
			expect(this.immm.size).toBe(nodes);
			expect(this.immm.isEmpty).toBe(nodes === 0);
		}

		/** O(n) — the whole graph, re-derived from the model. */
		checkFull(): void {
			this.checkSizes();

			for (const [node, targets] of this.model.adj) {
				expect(this.immm.hasNode(node)).toBe(true);
				expect(this.builder.hasNode(node)).toBe(true);

				expect([...this.immm.getConnectionsFrom(node)].sort()).toEqual(
					[...targets].sort(),
				);

				expect(this.immm.isSink(node)).toBe(this.model.isSink(node));
				expect(this.immm.isSource(node)).toBe(this.model.isSource(node));
			}

			for (const node1 of this.model.adj.keys()) {
				for (const node2 of this.model.adj.keys()) {
					const expected = this.model.hasConnection(node1, node2);
					expect(this.immm.hasConnection(node1, node2)).toBe(expected);
					expect(this.builder.hasConnection(node1, node2)).toBe(expected);
				}
			}
		}

		addNode(node: number): void {
			this.model.addNode(node);
			this.builder.addNode(node);
			this.immm = this.immm.addNode(node);
		}

		removeNode(node: number): void {
			this.model.removeNode(node);
			this.builder.removeNode(node);
			this.immm = this.immm.removeNode(node);
		}

		connect(node1: number, node2: number): void {
			this.model.connect(node1, node2);
			this.builder.connect(node1, node2);
			this.immm = this.immm.connect(node1, node2);
		}

		disconnect(node1: number, node2: number): void {
			this.model.disconnect(node1, node2);
			this.builder.disconnect(node1, node2);
			this.immm = this.immm.disconnect(node1, node2);
		}

		// `removeUnconnectedNodes` is collection-only — the builder has no such
		// method — so it is applied to the model and the immutable graph, and the
		// builder is rebuilt from the result.
		removeUnconnectedNodes(): void {
			this.model.removeUnconnectedNodes();
			this.immm = this.immm.removeUnconnectedNodes();
			this.builder = this.immm.toBuilder();
		}
	}

	const nodePool = 12;
	const pick = (): number => Math.floor(Math.random() * nodePool);

	describe(`${name} graph (${isDirected ? 'directed' : 'undirected'})`, (): void => {
		it('random mixed operations against an adjacency-list model', (): void => {
			const ent = new Entangled();

			for (let i = 0; i < 1000; i++) {
				switch (Math.floor(Math.random() * 6)) {
					case 0:
						ent.addNode(pick());
						break;
					case 1:
						ent.removeNode(pick());
						break;
					case 2:
						ent.connect(pick(), pick());
						break;
					case 3:
						ent.disconnect(pick(), pick());
						break;
					case 4:
						ent.removeUnconnectedNodes();
						break;
					default:
						// Re-derive the builder from the immutable graph: this also
						// checks that `toBuilder` round-trips the model exactly.
						ent.builder = ent.immm.toBuilder();
						break;
				}

				ent.checkSizes();

				if (i % CHECK_FULL_EVERY === 0) ent.checkFull();
			}

			ent.checkFull();
		});

		it('connect on an already-connected pair is a no-op', (): void => {
			const ent = new Entangled();

			for (let i = 0; i < 50; i++) ent.connect(pick(), pick());
			const before = ent.immm;
			const beforeSize = before.connectionSize;

			for (let i = 0; i < 50; i++) {
				// Re-connect every pair that already exists.
				for (const node1 of ent.model.adj.keys()) {
					for (const node2 of ent.model.adj.keys()) {
						if (ent.model.hasConnection(node1, node2)) ent.connect(node1, node2);
					}
				}
			}

			expect(ent.immm.connectionSize).toBe(beforeSize);
			expect(ent.immm).toBe(before);
			ent.checkFull();
		});

		it('removing a node drops all of its connections', (): void => {
			const ent = new Entangled();

			for (let i = 0; i < 200; i++) ent.connect(pick(), pick());
			ent.checkFull();

			for (let i = 0; i < nodePool; i++) {
				ent.removeNode(i);
				ent.checkFull();
			}

			expect(ent.immm.isEmpty).toBe(true);
		});
	});

	describe(`${name} graph builder lock`, (): void => {
		const filled = (): ArrowGraph.Builder<number> => {
			const b = context.builder<number>();
			for (let i = 0; i < 10; i++) b.connect(i, i + 1);
			return b;
		};

		// Each case gets a **fresh** builder and asserts afterwards that a plain
		// mutation still succeeds. Sharing one builder makes every later case pass
		// for the wrong reason: once the traversal lock leaks, *all* mutators throw.
		it('mutating during forEach throws, and does not leak the lock', (): void => {
			for (const mutate of [
				(b: ArrowGraph.Builder<number>): void => {
					b.forEach((): void => {
						b.addNode(1000);
					});
				},
				(b: ArrowGraph.Builder<number>): void => {
					b.forEach((): void => {
						b.connect(1000, 1001);
					});
				},
				(b: ArrowGraph.Builder<number>): void => {
					b.forEach((): void => {
						b.removeNode(1);
					});
				},
				(b: ArrowGraph.Builder<number>): void => {
					b.forEach((): void => {
						b.disconnect(1, 2);
					});
				},
			]) {
				const b = filled();
				expect((): void => {
					mutate(b);
				}).toThrow();

				// The lock must have been released, or the builder is bricked.
				expect((): void => {
					b.addNode(2000);
				}).not.toThrow();
			}
		});

		// `forEachIndexed` implements `halt()` by throwing a sentinel it then
		// swallows, which leaks the lock silently if `_lock--` is not in a
		// `finally`. This case exists separately for that reason.
		it('halt does not leak the lock', (): void => {
			const b = filled();

			b.forEachIndexed((_element, _index, halt): void => {
				halt();
			});

			expect((): void => {
				b.addNode(3000);
			}).not.toThrow();
		});

		it('a locked forEach still allows reads', (): void => {
			const b = filled();

			let seen = 0;
			b.forEach((): void => {
				seen++;
				// Reading the same builder from inside its own traversal is fine.
				expect(b.nodeSize).toBeGreaterThan(0);
			});

			// `forEach` enumerates graph *elements* (isolated nodes plus links),
			// not connections, so compare against the built collection rather than a
			// hard-coded count.
			expect(seen).toBe(b.build().stream().count());
		});
	});
}