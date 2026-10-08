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
 * Coverage for the members the capability `Api` / `BuilderApi` require that had
 * no implementation before this step: `forEachIndexed`, `toArray`, `asNormal`
 * on the empty form, and `Builder.clear`.
 */

// `isDirected` is part of the expectation: an undirected `connect(1, 2)` writes
// both directions, so `of([1, 2, 'a'])` yields two links rather than one link
// plus an isolated node.
const nonValuedContexts = [
	['ArrowGraphHashed', ArrowGraphHashed, true],
	['ArrowGraphSorted', ArrowGraphSorted, true],
	['EdgeGraphHashed', EdgeGraphHashed, false],
	['EdgeGraphSorted', EdgeGraphSorted, false],
] as const;

const valuedContexts = [
	['ArrowValuedGraphHashed', ArrowValuedGraphHashed, true],
	['ArrowValuedGraphSorted', ArrowValuedGraphSorted, true],
	['EdgeValuedGraphHashed', EdgeValuedGraphHashed, false],
	['EdgeValuedGraphSorted', EdgeValuedGraphSorted, false],
] as const;

/**
 * Elements as an order-independent set. Hashed backings have no defined
 * iteration order, and `connect(a, b)` also creates `b` as a (here isolated)
 * node, so `of([1], [2, 3])` has three elements, not two.
 */
function elementSet(graph: {
	toArray(): unknown[];
}): string[] {
	return graph.toArray().map((element) => JSON.stringify(element)).sort();
}

describe('toArray', () => {
	for (const [name, context, isDirected] of nonValuedContexts) {
		it(name, () => {
			expect(context.empty<number>().toArray()).toEqual([]);
			// An undirected graph stores each edge in both directions and
			// enumerates both, so `[2,3]` and `[3,2]` are separate elements.
			expect(elementSet(context.of([1], [2, 3]))).toEqual(
				isDirected
					? ['[1]', '[2,3]', '[3]']
					: ['[1]', '[2,3]', '[3,2]'],
			);
		});
	}

	for (const [name, context, isDirected] of valuedContexts) {
		it(name, () => {
			expect(context.empty<number, string>().toArray()).toEqual([]);
			expect(elementSet(context.of([1, 2, 'a']))).toEqual(
				isDirected ? ['[1,2,"a"]', '[2]'] : ['[1,2,"a"]', '[2,1,"a"]'],
			);
		});
	}

	it('agrees with stream()', () => {
		const g = ArrowGraphHashed.of([1], [2, 3], [4]);
		expect(elementSet(g)).toEqual(elementSet({ toArray: () => g.stream().toArray() }));
		expect(g.toArray().length).toBe(g.stream().count());
	});

	it('an empty graph returns a fresh array, not a shared one', () => {
		const a = ArrowGraphHashed.empty<number>().toArray();
		a.push([1]);
		expect(ArrowGraphHashed.empty<number>().toArray()).toEqual([]);
	});
});

describe('forEachIndexed', () => {
	it('visits every element with a running index', () => {
		const g = ArrowGraphHashed.of([1], [2, 3], [4]);

		const seen: [unknown, number][] = [];
		g.forEachIndexed((element, index) => {
			seen.push([element, index]);
		});

		// Indices are dense and in traversal order; the order itself is
		// backing-dependent, so compare the pairing as a set.
		expect(seen.map(([, index]) => index)).toEqual([0, 1, 2, 3]);
		expect(
			seen.map(([element]) => JSON.stringify(element)).sort(),
		).toEqual(['[1]', '[2,3]', '[3]', '[4]']);
	});

	it('halt stops the traversal early', () => {
		const g = ArrowGraphHashed.of([1], [2, 3], [4]);

		const seen: unknown[] = [];
		g.forEachIndexed((element, index, halt) => {
			seen.push(element);
			if (index >= 1) halt();
		});

		expect(seen.length).toBe(2);
	});

	it('does nothing on an empty graph', () => {
		let called = false;
		ArrowGraphHashed.empty<number>().forEachIndexed(() => {
			called = true;
		});
		expect(called).toBe(false);
	});

	it('matches the builder traversal', () => {
		const builder = ArrowGraphHashed.builder<number>();
		for (let i = 0; i < 4; i++) builder.connect(i, i + 1);

		const fromCollection: unknown[] = [];
		const fromBuilder: unknown[] = [];

		builder.build().forEachIndexed((element) => {
			fromCollection.push(element);
		});
		builder.forEachIndexed((element) => {
			fromBuilder.push(element);
		});

		expect(fromBuilder).toEqual(fromCollection);
	});
});

describe('Builder.clear', () => {
	for (const [name, context] of nonValuedContexts) {
		it(name, () => {
			const builder = context.builder<number>();
			for (let i = 0; i < 4; i++) builder.connect(i, i + 1);

			expect(builder.nodeSize).toBe(5);
			expect(builder.connectionSize).toBe(4);

			builder.clear();

			expect(builder.isEmpty).toBe(true);
			expect(builder.nodeSize).toBe(0);
			expect(builder.connectionSize).toBe(0);
			expect(builder.build().isEmpty).toBe(true);

			// Usable again after clearing.
			builder.connect(1, 2);
			expect(builder.connectionSize).toBe(1);
			expect(builder.build().hasConnection(1, 2)).toBe(true);
		});
	}

	for (const [name, context] of valuedContexts) {
		it(name, () => {
			const builder = context.builder<number, string>();
			for (let i = 0; i < 4; i++) builder.connect(i, i + 1, `v${i}`);

			expect(builder.connectionSize).toBe(4);

			builder.clear();

			expect(builder.isEmpty).toBe(true);
			expect(builder.build().isEmpty).toBe(true);

			builder.connect(1, 2, 'x');
			expect(builder.build().getValue(1, 2)).toBe('x');
		});
	}

	it('refuses to clear while a traversal is in progress', () => {
		const builder = ArrowGraphHashed.builder<number>();
		for (let i = 0; i < 4; i++) builder.connect(i, i + 1);

		expect(() => {
			builder.forEach(() => {
				builder.clear();
			});
		}).toThrow();

		// The lock must have been released.
		expect(() => {
			builder.clear();
		}).not.toThrow();
	});
});

describe('empty asNormal', () => {
	for (const [name, context] of nonValuedContexts) {
		it(name, () => {
			const empty = context.empty<number>();
			expect(empty.asNormal()).toBe(empty);
			expect(empty.asNormal().isEmpty).toBe(true);
		});
	}

	for (const [name, context] of valuedContexts) {
		it(name, () => {
			const empty = context.empty<number, string>();
			expect(empty.asNormal()).toBe(empty);
		});
	}
});
describe('forEach vs forEachIndexed', () => {
	it('forEach receives only the element', () => {
		const g = ArrowGraphHashed.of([1], [2, 3], [4]);

		const arity: number[] = [];
		const elements: unknown[] = [];
		g.forEach(function (this: unknown, ...args: unknown[]) {
			arity.push(args.length);
			elements.push(args[0]);
		});

		// The callback is handed the element and nothing else — no index, no halt.
		expect(arity).toEqual([1, 1, 1, 1]);
		expect(elements).toHaveLength(g.toArray().length);
	});

	it('forEachIndexed receives element, index and halt', () => {
		const g = ArrowGraphHashed.of([1], [2, 3], [4]);

		const arity: number[] = [];
		g.forEachIndexed(function (...args: unknown[]) {
			arity.push(args.length);
		});

		expect(arity).toEqual([3, 3, 3, 3]);
	});

	it('both visit exactly the same elements, in the same order', () => {
		const g = ArrowGraphHashed.of([1], [2, 3], [4], [5, 6]);

		const viaForEach: unknown[] = [];
		const viaIndexed: unknown[] = [];
		g.forEach((element) => {
			viaForEach.push(element);
		});
		g.forEachIndexed((element) => {
			viaIndexed.push(element);
		});

		expect(viaForEach).toEqual(viaIndexed);
	});

	it('halt is only available on forEachIndexed', () => {
		const g = ArrowGraphHashed.of([1], [2, 3], [4]);

		const viaForEach: unknown[] = [];
		g.forEach((element) => {
			viaForEach.push(element);
		});
		expect(viaForEach).toHaveLength(4);

		const viaIndexed: unknown[] = [];
		g.forEachIndexed((element, _index, halt) => {
			viaIndexed.push(element);
			halt();
		});
		expect(viaIndexed).toHaveLength(1);
	});

	it('the builder follows the same split', () => {
		const builder = ArrowGraphHashed.builder<number>();
		for (let i = 0; i < 3; i++) builder.connect(i, i + 1);

		const viaForEach: unknown[] = [];
		builder.forEach((element) => {
			viaForEach.push(element);
		});

		const viaIndexed: unknown[] = [];
		builder.forEachIndexed((element) => {
			viaIndexed.push(element);
		});

		expect(viaForEach).toEqual(viaIndexed);
		expect(viaForEach.length).toBeGreaterThan(0);
	});

	it('forEach on an empty graph visits nothing', () => {
		let called = false;
		ArrowGraphHashed.empty<number>().forEach(() => {
			called = true;
		});
		expect(called).toBe(false);
	});
});
