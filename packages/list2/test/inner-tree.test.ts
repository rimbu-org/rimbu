import { describe, expect, it } from 'bun:test';

import type { ListContext } from '#list/context';
import type { Inner } from '#list/immutable/common';
import type { InnerBlock } from '#list/immutable/inner-block';
import type { InnerTree } from '#list/immutable/inner-tree';

import { List } from '@rimbu/list';

type OB = import('#list/immutable/outer-block').OuterBlock<number>;

function makeContext<T>(blockSizeBits: number): ListContext<T> {
	return List.createContext({ blockSizeBits }) as ListContext<T>;
}

function ob(ctx: ListContext<number>, vals: number[]): OB {
	return ctx.outerBlockLeftRight(ctx.childrenOps.of(vals));
}

function ib(
	ctx: ListContext<number>,
	children: OB[],
	level = 1,
): InnerBlock<number, OB> {
	const size = children.reduce((s, c) => s + c.size, 0);
	return ctx.innerBlock(children, size, level);
}

function simpleInnerTree(
	leftChildren: OB[],
	rightChildren: OB[],
	bits = 3,
	level = 1,
): InnerTree<number, OB> {
	const ctx = makeContext<number>(bits);
	const left = ib(ctx, leftChildren, level);
	const right = ib(ctx, rightChildren, level);
	const size = left.size + right.size;
	return ctx.innerTree<number, OB>(left, right, null, size, level + 1);
}

function innerTreeWithMiddle(
	leftChildren: OB[],
	middleChildren: OB[][],
	rightChildren: OB[],
	bits = 3,
	level = 1,
): InnerTree<number, OB> {
	const ctx = makeContext<number>(bits);
	const left = ib(ctx, leftChildren, level);
	const right = ib(ctx, rightChildren, level);

	const middleBlocks = middleChildren.map((children) =>
		ib(ctx, children, level),
	);
	const middleSize = middleBlocks.reduce((s, c) => s + c.size, 0);

	const middle = ctx.innerBlock<number, InnerBlock<number, OB>>(
		middleBlocks as InnerBlock<number, OB>[],
		middleSize,
		level + 1,
	);

	return ctx.innerTree<number, OB>(
		left,
		right,
		middle,
		left.size + right.size + middleSize,
		level + 1,
	);
}

function collectForEach(inner: Inner<number, any>): number[] {
	const result: number[] = [];
	inner.forEach((v) => result.push(v));
	return result;
}

describe('InnerTree.structure', () => {
	it('has left, right, middle, size, level', () => {
		const t = simpleInnerTree(
			[ob(makeContext(3), [1, 2])],
			[ob(makeContext(3), [3, 4])],
		);

		expect(t.left).toBeDefined();
		expect(t.right).toBeDefined();
		expect(t.middle).toBeNull();
		expect(t.size).toBe(4);
		expect(t.level).toBe(2);
	});

	it('context is the list context', () => {
		const ctx = makeContext<number>(3);
		const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [2])]);
		expect(t.context.blockSizeBits).toBe(3);
	});

	it('tree with middle', () => {
		const ctx = makeContext<number>(3);
		const t = innerTreeWithMiddle(
			[ob(ctx, [1, 2])],
			[[ob(ctx, [3, 4])]],
			[ob(ctx, [5, 6])],
		);
		expect(t.middle).not.toBeNull();
		expect(t.middle!.size).toBe(2);
	});
});

describe('InnerTree.read', () => {
	const ctx = makeContext<number>(3);

	describe('get', () => {
		it('reads from left inner block', () => {
			const t = simpleInnerTree(
				[ob(ctx, [10, 20]), ob(ctx, [30])],
				[ob(ctx, [40]), ob(ctx, [50])],
			);
			expect(t._get(0)).toBe(10);
			expect(t._get(2)).toBe(30);
		});

		it('reads from right inner block', () => {
			const t = simpleInnerTree(
				[ob(ctx, [10])],
				[ob(ctx, [20, 30]), ob(ctx, [40])],
			);
			expect(t._get(1)).toBe(20);
			expect(t._get(3)).toBe(40);
		});

		it('crosses left-right boundary', () => {
			const t = simpleInnerTree([ob(ctx, [1, 2, 3])], [ob(ctx, [4, 5])]);
			expect(t._get(0)).toBe(1);
			expect(t._get(2)).toBe(3);
			expect(t._get(3)).toBe(4);
		});

		it('reads through middle', () => {
			const t = innerTreeWithMiddle(
				[ob(ctx, [1])],
				[[ob(ctx, [2, 3, 4, 5])]],
				[ob(ctx, [6])],
			);
			expect(t._get(0)).toBe(1);
			expect(t._get(1)).toBe(2);
			expect(t._get(4)).toBe(5);
			expect(t._get(5)).toBe(6);
		});
	});

	describe('stream', () => {
		it('forwards streams left, middle, right', () => {
			const t = simpleInnerTree([ob(ctx, [1, 2])], [ob(ctx, [3, 4])]);
			expect([...t.stream()]).toEqual([1, 2, 3, 4]);
		});

		it('reversed streams right, middle, left', () => {
			const t = simpleInnerTree([ob(ctx, [1, 2])], [ob(ctx, [3, 4])]);
			expect([...t.stream({ reversed: true })]).toEqual([4, 3, 2, 1]);
		});
	});

	describe('forEach', () => {
		it('visits left, middle, right in order', () => {
			const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [2, 3])]);
			expect(collectForEach(t)).toEqual([1, 2, 3]);
		});

		it('includes middle', () => {
			const t = innerTreeWithMiddle(
				[ob(ctx, [1])],
				[[ob(ctx, [2, 3])]],
				[ob(ctx, [4])],
			);
			expect(collectForEach(t)).toEqual([1, 2, 3, 4]);
		});
	});

	describe('toArray', () => {
		it('concatenates left, middle, right', () => {
			const t = simpleInnerTree([ob(ctx, [1, 2])], [ob(ctx, [3])]);
			expect(t.toArray()).toEqual([1, 2, 3]);
		});

		it('includes middle', () => {
			const t = innerTreeWithMiddle(
				[ob(ctx, [1])],
				[[ob(ctx, [2]), ob(ctx, [3])]],
				[ob(ctx, [4])],
			);
			expect(t.toArray()).toEqual([1, 2, 3, 4]);
		});
	});
});

describe('InnerTree.prependChild', () => {
	const ctx = makeContext<number>(2); // max=4, min=2
	const bits = 2;

	it('adds to left when left has room', () => {
		const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [3, 4])], bits);
		const r = t.prependChild(ob(ctx, [0]));
		expect(r.toArray()).toEqual([0, 1, 3, 4]);
		expect(r.size).toBe(4);
	});

	it('shifts from left to right when left full and right has room', () => {
		const t = simpleInnerTree(
			[ob(ctx, [1]), ob(ctx, [2]), ob(ctx, [3]), ob(ctx, [4])],
			[ob(ctx, [5])],
			bits,
		);
		const r = t.prependChild(ob(ctx, [0]));
		expect(r.toArray()).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it('shifts into middle when left full and middle first block has room', () => {
		const t = innerTreeWithMiddle(
			[ob(ctx, [1]), ob(ctx, [2]), ob(ctx, [3]), ob(ctx, [4])],
			[[ob(ctx, [5])]],
			[ob(ctx, [6]), ob(ctx, [7]), ob(ctx, [8]), ob(ctx, [9])],
			bits,
		);
		const r = t.prependChild(ob(ctx, [0]));
		expect(r.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
		expect(r.size).toBe(10);
	});

	it('promotes left to middle when all are full', () => {
		const leftBlocks = Array.from({ length: 4 }, () => ob(ctx, [1]));
		const rightBlocks = Array.from({ length: 4 }, () => ob(ctx, [2]));
		const t = simpleInnerTree(leftBlocks, rightBlocks, bits);
		const r = t.prependChild(ob(ctx, [0]));
		expect(r.middle).not.toBeNull();
		expect(r.toArray()).toEqual([
			0,
			...leftBlocks.flatMap((b) => b.toArray()),
			...rightBlocks.flatMap((b) => b.toArray()),
		]);
	});

	it('does not mutate original', () => {
		const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [2])], bits);
		t.prependChild(ob(ctx, [0]));
		expect(t.toArray()).toEqual([1, 2]);
	});

	it('returns an InnerTree', () => {
		const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [2])], bits);
		const r = t.prependChild(ob(ctx, [0]));
		expect(r).toHaveProperty('left');
		expect(r).toHaveProperty('right');
		expect(r).toHaveProperty('middle');
	});
});

describe('InnerTree.appendChild', () => {
	const ctx = makeContext<number>(2); // max=4, min=2
	const bits = 2;

	it('adds to right when right has room', () => {
		const t = simpleInnerTree([ob(ctx, [1, 2])], [ob(ctx, [3])], bits);
		const r = t.appendChild(ob(ctx, [4]));
		expect(r.toArray()).toEqual([1, 2, 3, 4]);
		expect(r.size).toBe(4);
	});

	it('shifts from right to left when right full and left has room', () => {
		const t = simpleInnerTree(
			[ob(ctx, [1])],
			[ob(ctx, [2]), ob(ctx, [3]), ob(ctx, [4]), ob(ctx, [5])],
			bits,
		);
		const r = t.appendChild(ob(ctx, [6]));
		expect(r.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it('shifts into middle when right full and middle last block has room', () => {
		const t = innerTreeWithMiddle(
			[ob(ctx, [1]), ob(ctx, [2]), ob(ctx, [3]), ob(ctx, [4])],
			[[ob(ctx, [5])]],
			[ob(ctx, [6]), ob(ctx, [7]), ob(ctx, [8]), ob(ctx, [9])],
			bits,
		);
		const r = t.appendChild(ob(ctx, [10]));
		expect(r.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		expect(r.size).toBe(10);
	});

	it('promotes right to middle when all are full', () => {
		const leftBlocks = Array.from({ length: 4 }, () => ob(ctx, [1]));
		const rightBlocks = Array.from({ length: 4 }, () => ob(ctx, [2]));
		const t = simpleInnerTree(leftBlocks, rightBlocks, bits);
		const r = t.appendChild(ob(ctx, [3]));
		expect(r.middle).not.toBeNull();
		expect(r.toArray()).toEqual([
			...leftBlocks.flatMap((b) => b.toArray()),
			...rightBlocks.flatMap((b) => b.toArray()),
			3,
		]);
	});

	it('does not mutate original', () => {
		const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [2])], bits);
		t.appendChild(ob(ctx, [3]));
		expect(t.toArray()).toEqual([1, 2]);
	});

	it('returns an InnerTree', () => {
		const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [2])], bits);
		const r = t.appendChild(ob(ctx, [3]));
		expect(r).toHaveProperty('left');
		expect(r).toHaveProperty('right');
		expect(r).toHaveProperty('middle');
	});
});

describe('InnerTree.modifyFirstChild', () => {
	const ctx = makeContext<number>(3);

	it('modifies first child of left block', () => {
		const t = simpleInnerTree([ob(ctx, [1]), ob(ctx, [2])], [ob(ctx, [3])]);
		const r = t.modifyFirstChild((c) => c._appendBlockChild(10));
		expect(r!.toArray()).toEqual([1, 10, 2, 3]);
		expect(r!.size).toBe(4);
	});

	it('returns same instance when child unchanged', () => {
		const t = simpleInnerTree([ob(ctx, [1, 2])], [ob(ctx, [3])]);
		const r = t.modifyFirstChild((c) => c);
		expect(r).toBe(t as any);
	});

	it('updates tree size on change', () => {
		const t = simpleInnerTree([ob(ctx, [1, 2, 3])], [ob(ctx, [4])]);
		const r = t.modifyFirstChild((c) => ob(ctx, [10]));
		expect(r!.size).toBe(2);
	});
});

describe('InnerTree.modifyLastChild', () => {
	const ctx = makeContext<number>(3);

	it('modifies last child of right block', () => {
		const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [2]), ob(ctx, [3])]);
		const r = t.modifyLastChild((c) => c._appendBlockChild(4));
		expect(r!.toArray()).toEqual([1, 2, 3, 4]);
		expect(r!.size).toBe(4);
	});

	it('returns same instance when child unchanged', () => {
		const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [2, 3])]);
		const r = t.modifyLastChild((c) => c);
		expect(r).toBe(t as any);
	});

	it('updates tree size on change', () => {
		const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [2, 3, 4])]);
		const r = t.modifyLastChild((c) => ob(ctx, [20]));
		expect(r!.size).toBe(2);
	});
});

describe('InnerTree.map', () => {
	const ctx = makeContext<number>(3);

	it('transforms all elements across tree', () => {
		const t = simpleInnerTree([ob(ctx, [1, 2])], [ob(ctx, [3, 4])]);
		const r = t.map((x: number) => x * 10);
		expect(r.toArray()).toEqual([10, 20, 30, 40]);
		expect(r.size).toBe(4);
	});

	it('transforms tree with middle', () => {
		const t = innerTreeWithMiddle(
			[ob(ctx, [1])],
			[[ob(ctx, [2, 3])]],
			[ob(ctx, [4])],
		);
		const r = t.map((x: number) => x * 10);
		expect(r.toArray()).toEqual([10, 20, 30, 40]);
	});

	it('does not mutate original', () => {
		const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [2])]);
		t.map((x: number) => x * 10);
		expect(t.toArray()).toEqual([1, 2]);
	});
});

describe('InnerTree.immutability', () => {
	const ctx = makeContext<number>(3);

	it('prependChild returns new instance', () => {
		const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [2])]);
		expect(t.prependChild(ob(ctx, [0]))).not.toBe(t as any);
	});

	it('appendChild returns new instance', () => {
		const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [2])]);
		expect(t.appendChild(ob(ctx, [3]))).not.toBe(t as any);
	});

	it('map returns new instance', () => {
		const t = simpleInnerTree([ob(ctx, [1])], [ob(ctx, [2])]);
		expect(t.map((x: number) => x)).not.toBe(t as any);
	});
});

describe('InnerTree.edge-cases', () => {
	const ctx = makeContext<number>(2); // max=4, min=2
	const bits = 2;

	it('deep level tree', () => {
		const t = simpleInnerTree(
			[ob(ctx, [1]), ob(ctx, [2])],
			[ob(ctx, [3]), ob(ctx, [4])],
			bits,
			3,
		);
		expect(t.level).toBe(4);
		expect(t._get(0)).toBe(1);
		expect(t._get(3)).toBe(4);
		expect(t.toArray()).toEqual([1, 2, 3, 4]);
	});

	it('large sequential prepend', () => {
		let t: InnerTree<number, OB> = simpleInnerTree(
			[ob(ctx, [3])],
			[ob(ctx, [4])],
			bits,
		);
		for (let i = 2; i >= 0; i--) {
			t = t.prependChild(ob(ctx, [i]));
		}
		expect(t.toArray()).toEqual([0, 1, 2, 3, 4]);
		expect(t.size).toBe(5);
	});

	it('large sequential append', () => {
		let t: InnerTree<number, OB> = simpleInnerTree(
			[ob(ctx, [0])],
			[ob(ctx, [1])],
			bits,
		);
		for (let i = 2; i < 5; i++) {
			t = t.appendChild(ob(ctx, [i]));
		}
		expect(t.toArray()).toEqual([0, 1, 2, 3, 4]);
		expect(t.size).toBe(5);
	});

	it('chained prepend and append', () => {
		const t = simpleInnerTree([ob(ctx, [2])], [ob(ctx, [3])], bits);
		const r = t
			.prependChild(ob(ctx, [1]))
			.appendChild(ob(ctx, [4]))
			.prependChild(ob(ctx, [0]));
		expect(r.toArray()).toEqual([0, 1, 2, 3, 4]);
	});

	it('null/undefined elements', () => {
		const nctx = makeContext<number | null>(3) as any;
		const t = simpleInnerTree(
			[ob(nctx, [1, null as any])],
			[ob(nctx, [null as any, 3])],
		);
		expect(t._get(0)).toBe(1);
		expect(t._get(1)).toBeNull();
		expect(t._get(2)).toBeNull();
		expect(t._get(3)).toBe(3);
	});
});
