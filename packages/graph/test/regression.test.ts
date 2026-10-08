import { describe, expect, it } from 'bun:test';

import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed';
import { ArrowGraphSorted } from '@rimbu/graph/non-valued/arrow/sorted';
import { EdgeGraphHashed } from '@rimbu/graph/non-valued/edge/hashed';
import { EdgeGraphSorted } from '@rimbu/graph/non-valued/edge/sorted';
import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed';
import { ArrowValuedGraphSorted } from '@rimbu/graph/valued/arrow/sorted';
import { EdgeValuedGraphHashed } from '@rimbu/graph/valued/edge/hashed';
import { EdgeValuedGraphSorted } from '@rimbu/graph/valued/edge/sorted';

/**
 * Regression tests for two defects that the shared harnesses did not reach.
 *
 * Both were found by `test-random/` (the adjacency-list differential harness)
 * and are pinned here so they cannot come back unnoticed.
 */

describe('connectionSize stays exact when a node is removed', () => {
	it('directed: removing a node drops both its outgoing and incoming arcs', () => {
		// 0->1, 1->2, 2->0, 2->2, 3->0
		const g = ArrowGraphHashed.of([0, 1], [1, 2], [2, 0], [2, 2], [3, 0]);

		expect(g.nodeSize).toBe(4);
		expect(g.connectionSize).toBe(5);

		// Removing 2 must drop 1->2 (incoming), 2->0 and 2->2 (outgoing).
		const after = g.removeNode(2);

		expect(after.nodeSize).toBe(3);
		expect(after.connectionSize).toBe(2);
		expect(after.hasConnection(0, 1)).toBe(true);
		expect(after.hasConnection(3, 0)).toBe(true);
	});

	it('directed: removing a self-looped node with an incoming arc', () => {
		// 1->1 (self-loop) and 2->1
		const g = ArrowGraphHashed.of([1, 1], [2, 1]);

		expect(g.connectionSize).toBe(2);

		const after = g.removeNode(1);

		expect(after.nodeSize).toBe(1);
		expect(after.connectionSize).toBe(0);
	});

	it('directed: removing a node with only outgoing arcs', () => {
		const g = ArrowGraphSorted.of([0, 1], [1, 2], [2, 3]);

		expect(g.connectionSize).toBe(3);

		const after = g.removeNode(2);

		expect(after.nodeSize).toBe(3);
		expect(after.connectionSize).toBe(1);
		expect(after.hasConnection(0, 1)).toBe(true);
		expect(after.hasConnection(1, 2)).toBe(false);
	});

	it('directed: same invariants on the valued families', () => {
		for (const context of [ArrowValuedGraphHashed, ArrowValuedGraphSorted]) {
			const g = context.of([0, 1, 'a'], [1, 2, 'b'], [2, 0, 'c'], [2, 2, 'd']);

			expect(g.connectionSize).toBe(4);

			const after = g.removeNode(2);

			expect(after.connectionSize).toBe(1);
			expect(after.getValue(0, 1)).toBe('a');
		}
	});

	it('undirected: removing a node drops each incident edge once', () => {
		for (const context of [EdgeGraphHashed, EdgeGraphSorted]) {
			const g = context.of([0, 1], [1, 2], [2, 0], [2, 2]);

			// Four distinct undirected edges: {0,1}, {1,2}, {0,2}, {2,2}.
			expect(g.connectionSize).toBe(4);

			const after = g.removeNode(2);

			// {0,1} is the only edge not incident to 2.
			expect(after.nodeSize).toBe(2);
			expect(after.connectionSize).toBe(1);
			expect(after.hasConnection(0, 1)).toBe(true);
			expect(after.hasConnection(1, 2)).toBe(false);
		}
	});

	it('undirected: valued families keep the same invariant', () => {
		for (const context of [EdgeValuedGraphHashed, EdgeValuedGraphSorted]) {
			const g = context.of([0, 1, 'a'], [1, 2, 'b'], [2, 0, 'c']);

			// {0,1}, {1,2}, {0,2}.
			expect(g.connectionSize).toBe(3);

			// Removing 1 drops {0,1} and {1,2}; {0,2} survives.
			expect(g.removeNode(1).connectionSize).toBe(1);
		}
	});
});

describe('builder forEach enumerates the same elements as the built graph', () => {
	const cases = [
		['ArrowGraphHashed', ArrowGraphHashed],
		['ArrowGraphSorted', ArrowGraphSorted],
		['EdgeGraphHashed', EdgeGraphHashed],
		['EdgeGraphSorted', EdgeGraphSorted],
	] as const;

	for (const [name, context] of cases) {
		it(name, () => {
			const builder = context.builder<number>();
			// A chain: every node has an outgoing arc, so there are no isolated
			// nodes except the tail.
			for (let i = 0; i < 9; i++) builder.connect(i, i + 1);

			const viaForEach: unknown[] = [];
			builder.forEach((element) => {
				viaForEach.push(element);
			});

			const viaStream = builder.build().stream().toArray();

			// The regression: the builder used to emit a spurious 1-tuple for every
			// *connected* node, so it yielded more elements than the built graph.
			expect(viaForEach).toEqual(viaStream);

			// A node is reported as a 1-tuple exactly when it has no connections.
			const isolatedInGraph = builder
				.build()
				.streamNodes()
				.filter((node) => builder.build().getConnectionsFrom(node).isEmpty)
				.count();
			const isolatedReported = viaForEach.filter((e) => (e as unknown[]).length === 1)
				.length;

			expect(isolatedReported).toBe(isolatedInGraph);
		});
	}

	it('reports an isolated node as a 1-tuple', () => {
		const builder = ArrowGraphHashed.builder<number>();
		builder.addNode(42);

		const elements: unknown[] = [];
		builder.forEach((element) => {
			elements.push(element);
		});

		expect(elements).toEqual([[42]]);
	});
});