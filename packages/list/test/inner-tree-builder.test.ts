import { describe, expect, it } from 'bun:test';

import type { Int } from '@rimbu/base';

import type { ListContext } from '#list/context';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';
import type { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

import { List } from '@rimbu/list';

type OB = OuterBlockBuilder<number>;
type IB = InnerBlockBuilder<number, OB>;
type ITB =
	import('../src/internal/mutable/inner-tree-builder').InnerTreeBuilder<
		number,
		OB
	>;

function makeContext(blockSizeBits: number): ListContext {
	return List.createContext({ blockSizeBits }) as ListContext;
}

function ob(ctx: ListContext, vals: number[]): OB {
	return ctx.outerBlockBuilder(ctx.childrenOps.of(vals));
}

function ib(ctx: ListContext, children: OB[], level = 1): IB {
	const size = children.reduce((s, c) => s + c.size, 0);
	return ctx.innerBlockBuilder(children, size, level);
}

function innerTree(
	ctx: ListContext,
	leftChildren: OB[],
	rightChildren: OB[],
	level = 1,
): ITB {
	const left = ib(ctx, leftChildren, level);
	const right = ib(ctx, rightChildren, level);
	return ctx.innerTreeBuilder<number, OB>(
		level + 1,
		left,
		right,
		undefined,
		left.size + right.size,
	) as ITB;
}

function collectForEach(b: {
	forEach(f: (v: number) => void): void;
}): number[] {
	const result: number[] = [];
	b.forEach((v) => result.push(v));
	return result;
}

describe('InnerTreeBuilder.properties', () => {
	it('has left, right, middle, size, level', () => {
		const ctx = makeContext(3);
		const t = innerTree(ctx, [ob(ctx, [1, 2])], [ob(ctx, [3, 4])]);

		expect(t.left).toBeDefined();
		expect(t.right).toBeDefined();
		expect(t.middle).toBeUndefined();
		expect(t.size).toBe(4);
		expect(t.level).toBe(2);
	});

	it('context is the list context', () => {
		const ctx = makeContext(3);
		const t = innerTree(ctx, [ob(ctx, [1])], [ob(ctx, [2])]);
		expect(t.context.blockSizeBits).toBe(3);
	});
});

describe('InnerTreeBuilder.read', () => {
	const ctx = makeContext(4); // max=16, min=8

	describe('get', () => {
		it('from left block', () => {
			const t = innerTree(
				ctx,
				[ob(ctx, [10, 20]), ob(ctx, [30])],
				[ob(ctx, [40]), ob(ctx, [50])],
			);
			expect(t.get(0 as Int.AtLeastZero)).toBe(10);
			expect(t.get(2 as Int.AtLeastZero)).toBe(30);
		});

		it('from right block', () => {
			const t = innerTree(
				ctx,
				[ob(ctx, [10])],
				[ob(ctx, [20, 30]), ob(ctx, [40])],
			);
			expect(t.get(1 as Int.AtLeastZero)).toBe(20);
			expect(t.get(3 as Int.AtLeastZero)).toBe(40);
		});

		it('across left-right boundary', () => {
			const t = innerTree(ctx, [ob(ctx, [1, 2, 3])], [ob(ctx, [4, 5])]);
			expect(t.get(0 as Int.AtLeastZero)).toBe(1);
			expect(t.get(2 as Int.AtLeastZero)).toBe(3);
			expect(t.get(3 as Int.AtLeastZero)).toBe(4);
		});
	});

	describe('forEach', () => {
		it('visits left then right in order', () => {
			const t = innerTree(ctx, [ob(ctx, [1, 2])], [ob(ctx, [3, 4])]);
			expect(collectForEach(t)).toEqual([1, 2, 3, 4]);
		});
	});
});

describe('InnerTreeBuilder.prependChild', () => {
	const bits = 2; // maxBlockSize=4
	const ctx = makeContext(bits);

	it('adds to left when left has room', () => {
		const t = innerTree(ctx, [ob(ctx, [1])], [ob(ctx, [3, 4])]);
		t.prependChild(ob(ctx, [0]));
		expect(t.size).toBe(4);
		expect(collectForEach(t)).toEqual([0, 1, 3, 4]);
	});

	it('shifts from left to right when left full and right has room', () => {
		const t = innerTree(
			ctx,
			[ob(ctx, [1]), ob(ctx, [2]), ob(ctx, [3]), ob(ctx, [4])],
			[ob(ctx, [5])],
		);
		t.prependChild(ob(ctx, [0]));
		expect(collectForEach(t)).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it('promotes left to middle when both are full', () => {
		const leftBlocks = Array.from({ length: 4 }, () => ob(ctx, [1]));
		const rightBlocks = Array.from({ length: 4 }, () => ob(ctx, [2]));
		const t = innerTree(ctx, leftBlocks, rightBlocks);
		t.prependChild(ob(ctx, [0]));
		expect(t.middle).toBeDefined();
		expect(t.size).toBe(9);
		expect(collectForEach(t)).toEqual([0, 1, 1, 1, 1, 2, 2, 2, 2]);
	});

	it('multiple prepends', () => {
		const t = innerTree(ctx, [ob(ctx, [3])], [ob(ctx, [4])]);
		t.prependChild(ob(ctx, [2]));
		t.prependChild(ob(ctx, [1]));
		t.prependChild(ob(ctx, [0]));
		expect(collectForEach(t)).toEqual([0, 1, 2, 3, 4]);
	});
});

describe('InnerTreeBuilder.appendChild', () => {
	const bits = 2;
	const ctx = makeContext(bits);

	it('adds to right when right has room', () => {
		const t = innerTree(ctx, [ob(ctx, [1, 2])], [ob(ctx, [3])]);
		t.appendChild(ob(ctx, [4]));
		expect(t.size).toBe(4);
		expect(collectForEach(t)).toEqual([1, 2, 3, 4]);
	});

	it('shifts from right to left when right full and left has room', () => {
		const t = innerTree(
			ctx,
			[ob(ctx, [1])],
			[ob(ctx, [2]), ob(ctx, [3]), ob(ctx, [4]), ob(ctx, [5])],
		);
		t.appendChild(ob(ctx, [6]));
		expect(collectForEach(t)).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it('promotes right to middle when both are full', () => {
		const leftBlocks = Array.from({ length: 4 }, () => ob(ctx, [1]));
		const rightBlocks = Array.from({ length: 4 }, () => ob(ctx, [2]));
		const t = innerTree(ctx, leftBlocks, rightBlocks);
		t.appendChild(ob(ctx, [3]));
		expect(t.middle).toBeDefined();
		expect(t.size).toBe(9);
		expect(collectForEach(t)).toEqual([1, 1, 1, 1, 2, 2, 2, 2, 3]);
	});

	it('multiple appends', () => {
		const t = innerTree(ctx, [ob(ctx, [0])], [ob(ctx, [1])]);
		t.appendChild(ob(ctx, [2]));
		t.appendChild(ob(ctx, [3]));
		t.appendChild(ob(ctx, [4]));
		expect(collectForEach(t)).toEqual([0, 1, 2, 3, 4]);
	});
});

describe('InnerTreeBuilder.firstChild / lastChild', () => {
	const ctx = makeContext(3);

	it('firstChild from left block', () => {
		const t = innerTree(
			ctx,
			[ob(ctx, [10, 20]), ob(ctx, [30])],
			[ob(ctx, [40])],
		);
		const child = t.firstChild();
		expect(child.get(0 as Int.AtLeastZero)).toBe(10);
	});

	it('lastChild from right block', () => {
		const t = innerTree(
			ctx,
			[ob(ctx, [10])],
			[ob(ctx, [20]), ob(ctx, [30, 40])],
		);
		const child = t.lastChild();
		expect(child.get(1 as Int.AtLeastZero)).toBe(40);
	});
});

describe('InnerTreeBuilder.dropFirstChild / dropLastChild', () => {
	const ctx = makeContext(3);

	it('dropFirstChild removes from left and updates size', () => {
		const t = innerTree(
			ctx,
			[ob(ctx, [10, 20]), ob(ctx, [30])],
			[ob(ctx, [40])],
		);
		const child = t.dropFirstChild();
		expect(child.get(0 as Int.AtLeastZero)).toBe(10);
		expect(t.size).toBe(2);
		expect(collectForEach(t)).toEqual([30, 40]);
	});

	it('dropLastChild removes from right and updates size', () => {
		const t = innerTree(
			ctx,
			[ob(ctx, [10])],
			[ob(ctx, [20]), ob(ctx, [30, 40])],
		);
		const child = t.dropLastChild();
		expect(child.get(1 as Int.AtLeastZero)).toBe(40);
		expect(t.size).toBe(2);
		expect(collectForEach(t)).toEqual([10, 20]);
	});
});

describe('InnerTreeBuilder.modifyFirstChild / modifyLastChild', () => {
	const ctx = makeContext(3);

	it('modifyFirstChild returns delta and updates size', () => {
		const t = innerTree(ctx, [ob(ctx, [1]), ob(ctx, [2])], [ob(ctx, [3])]);
		const delta = t.modifyFirstChild((child) => {
			child.append(10);
			return 1;
		});
		expect(delta).toBe(1);
		expect(t.size).toBe(4);
		expect(collectForEach(t)).toEqual([1, 10, 2, 3]);
	});

	it('modifyLastChild with no change returns undefined', () => {
		const t = innerTree(ctx, [ob(ctx, [1])], [ob(ctx, [2]), ob(ctx, [3])]);
		const delta = t.modifyLastChild(() => undefined);
		expect(delta).toBeUndefined();
		expect(t.size).toBe(3);
	});

	it('modifyLastChild returns delta and updates size', () => {
		const t = innerTree(ctx, [ob(ctx, [1, 2])], [ob(ctx, [3])]);
		const delta = t.modifyLastChild((child) => {
			child.append(4);
			return 1;
		});
		expect(delta).toBe(1);
		expect(t.size).toBe(4);
		expect(collectForEach(t)).toEqual([1, 2, 3, 4]);
	});
});

describe('InnerTreeBuilder.build', () => {
	const ctx = makeContext(3);

	it('returns immutable inner tree', () => {
		const t = innerTree(ctx, [ob(ctx, [1, 2])], [ob(ctx, [3, 4])]);
		const result = t.build();
		expect(result.size).toBe(4);
		expect(result.toArray()).toEqual([1, 2, 3, 4]);
	});

	it('build after mutation reflects changes', () => {
		const t = innerTree(ctx, [ob(ctx, [1])], [ob(ctx, [2])]);
		t.appendChild(ob(ctx, [3]));
		expect(t.build().toArray()).toEqual([1, 2, 3]);
	});
});

describe('InnerTreeBuilder.buildMap', () => {
	const ctx = makeContext(3);

	it('transforms elements', () => {
		const t = innerTree(ctx, [ob(ctx, [1, 2])], [ob(ctx, [3, 4])]);
		const mapped = t.buildMap((x: number) => x * 10);
		expect(mapped.toArray()).toEqual([10, 20, 30, 40]);
	});
});

describe('InnerTreeBuilder.normalized', () => {
	const ctx = makeContext(2); // max=4, min=2

	it('empty returns undefined', () => {
		const t = innerTree(ctx, [], []);
		expect(t.normalized()).toBeUndefined();
	});

	it('collapses to single block when total children fit', () => {
		const t = innerTree(ctx, [ob(ctx, [1])], [ob(ctx, [2, 3])]);
		const result = t.normalized();
		expect(result).toBeDefined();
		expect(result!.build().toArray()).toEqual([1, 2, 3]);
	});

	it('keeps tree when children exceed maxBlockSize', () => {
		const t = innerTree(
			ctx,
			[ob(ctx, [1]), ob(ctx, [2]), ob(ctx, [3])],
			[ob(ctx, [4]), ob(ctx, [5])],
		);
		const result = t.normalized();
		expect(result).toBeDefined();
		expect(result!.build().toArray()).toEqual([1, 2, 3, 4, 5]);
	});

	it('keeps tree when middle exists', () => {
		const leftBlocks = Array.from({ length: 4 }, () => ob(ctx, [1]));
		const rightBlocks = Array.from({ length: 4 }, () => ob(ctx, [2]));
		const t = innerTree(ctx, leftBlocks, rightBlocks);
		t.appendChild(ob(ctx, [3])); // creates middle
		expect(t.normalized()).toBe(t as any);
	});
});

describe('InnerTreeBuilder.mixed-prepend-append', () => {
	const ctx = makeContext(2);

	it('alternating order', () => {
		const t = innerTree(ctx, [ob(ctx, [3])], [ob(ctx, [5])]);
		t.prependChild(ob(ctx, [1]));
		t.appendChild(ob(ctx, [7]));
		t.prependChild(ob(ctx, [0]));
		expect(collectForEach(t)).toEqual([0, 1, 3, 5, 7]);
	});

	it('large alternating sequence', () => {
		const t = innerTree(ctx, [ob(ctx, [5])], [ob(ctx, [6])]);
		for (let i = 4; i >= 0; i--) t.prependChild(ob(ctx, [i]));
		for (let i = 7; i <= 12; i++) t.appendChild(ob(ctx, [i]));
		expect(collectForEach(t)).toEqual([
			0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
		]);
	});
});

describe('InnerTreeBuilder.edge-cases', () => {
	const ctx = makeContext(2); // max=4

	it('deep tree via sequential append', () => {
		const t = innerTree(ctx, [ob(ctx, [0])], [ob(ctx, [1])]);
		for (let i = 2; i < 30; i++) {
			t.appendChild(ob(ctx, [i]));
		}
		expect(t.size).toBe(30);
		expect(collectForEach(t)).toEqual(Array.from({ length: 30 }, (_, i) => i));
	});

	it('deep tree via multiple prepends', () => {
		const t = innerTree(ctx, [ob(ctx, [28])], [ob(ctx, [29])]);
		for (let i = 27; i >= 0; i--) {
			t.prependChild(ob(ctx, [i]));
		}
		expect(t.size).toBe(30);
		const arr = collectForEach(t);
		for (let i = 0; i < 30; i++) {
			expect(arr[i]).toBe(i);
		}
	});
});
