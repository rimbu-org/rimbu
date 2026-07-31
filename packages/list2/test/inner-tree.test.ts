import { describe, expect, it } from 'bun:test';

import type { Int } from '@rimbu/base';

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
			expect(t._get(0 as Int.AtLeastZero)).toBe(10);
			expect(t._get(2 as Int.AtLeastZero)).toBe(30);
		});

		it('reads from right inner block', () => {
			const t = simpleInnerTree(
				[ob(ctx, [10])],
				[ob(ctx, [20, 30]), ob(ctx, [40])],
			);
			expect(t._get(1 as Int.AtLeastZero)).toBe(20);
			expect(t._get(3 as Int.AtLeastZero)).toBe(40);
		});

		it('crosses left-right boundary', () => {
			const t = simpleInnerTree([ob(ctx, [1, 2, 3])], [ob(ctx, [4, 5])]);
			expect(t._get(0 as Int.AtLeastZero)).toBe(1);
			expect(t._get(2 as Int.AtLeastZero)).toBe(3);
			expect(t._get(3 as Int.AtLeastZero)).toBe(4);
		});

		it('reads through middle', () => {
			const t = innerTreeWithMiddle(
				[ob(ctx, [1])],
				[[ob(ctx, [2, 3, 4, 5])]],
				[ob(ctx, [6])],
			);
			expect(t._get(0 as Int.AtLeastZero)).toBe(1);
			expect(t._get(1 as Int.AtLeastZero)).toBe(2);
			expect(t._get(4 as Int.AtLeastZero)).toBe(5);
			expect(t._get(5 as Int.AtLeastZero)).toBe(6);
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

	it('promotes middle to InnerTree when middle is full and left overflows', () => {
		// middle InnerBlock at level+1 has 4 children (at capacity)
		const t = innerTreeWithMiddle(
			[ob(ctx, [1]), ob(ctx, [2]), ob(ctx, [3]), ob(ctx, [4])],
			[
				[ob(ctx, [5])],
				[ob(ctx, [6])],
				[ob(ctx, [7])],
				[ob(ctx, [8])],
			],
			[ob(ctx, [9]), ob(ctx, [10]), ob(ctx, [11]), ob(ctx, [12])],
			bits,
		);
		const r = t.prependChild(ob(ctx, [0]));
		expect(r.toArray()).toEqual([
			0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
		]);
		expect(r.size).toBe(13);
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

	it('promotes middle to InnerTree when middle is full and right overflows', () => {
		const t = innerTreeWithMiddle(
			[ob(ctx, [1]), ob(ctx, [2]), ob(ctx, [3]), ob(ctx, [4])],
			[
				[ob(ctx, [5])],
				[ob(ctx, [6])],
				[ob(ctx, [7])],
				[ob(ctx, [8])],
			],
			[ob(ctx, [9]), ob(ctx, [10]), ob(ctx, [11]), ob(ctx, [12])],
			bits,
		);
		const r = t.appendChild(ob(ctx, [13]));
		expect(r.toArray()).toEqual([
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
		]);
		expect(r.size).toBe(13);
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

describe('InnerTree.filter', () => {
	const ctx = makeContext<number>(3);

	it('keeps matching elements across left and right', () => {
		const t = simpleInnerTree([ob(ctx, [1, 2]), ob(ctx, [3])], [ob(ctx, [4, 5])]);
		const r = t.filter((x) => x % 2 === 0);
		expect(r.toArray()).toEqual([2, 4]);
	});

	it('filtering all elements returns non-empty', () => {
		const t = simpleInnerTree([ob(ctx, [1, 2])], [ob(ctx, [3])]);
		const r = t.filter(() => true);
		expect(r.toArray()).toEqual([1, 2, 3]);
	});

	it('filters with middle block', () => {
		const t = innerTreeWithMiddle(
			[ob(ctx, [1, 2])],
			[[ob(ctx, [3, 4])]],
			[ob(ctx, [5, 6])],
		);
		const r = t.filter((x) => x > 3);
		expect(r.toArray()).toEqual([4, 5, 6]);
	});

	it('filtering everything returns empty', () => {
		const t = simpleInnerTree([ob(ctx, [1, 2])], [ob(ctx, [3])]);
		const r = t.filter(() => false);
		expect(r.size).toBe(0);
	});
});

describe('InnerTree.dropFirstChild', () => {
	const ctx = makeContext<number>(2); // max=4, min=2

	it('reduces left and returns first child', () => {
		const t = simpleInnerTree(
			[ob(ctx, [1]), ob(ctx, [2, 3])],
			[ob(ctx, [4])],
			2,
		);
		const [newTree, firstChild] = t.dropFirstChild();
		expect(firstChild.toArray()).toEqual([1]);
		expect(collectForEach(newTree!)).toEqual([2, 3, 4]);
		expect(newTree!.size).toBe(3);
	});

	it('when left depleted and no middle, returns right block', () => {
		const t = simpleInnerTree(
			[ob(ctx, [1])],
			[ob(ctx, [2, 3])],
			2,
		);
		const [newTree, firstChild] = t.dropFirstChild();
		expect(firstChild.toArray()).toEqual([1]);
		expect(collectForEach(newTree!)).toEqual([2, 3]);
	});

	it('when left depleted and middle exists, shifts from middle', () => {
		const t = innerTreeWithMiddle(
			[ob(ctx, [1])],
			[[ob(ctx, [2, 3])]],
			[ob(ctx, [4])],
			2,
		);
		const [newTree, firstChild] = t.dropFirstChild();
		expect(firstChild.toArray()).toEqual([1]);
		expect(collectForEach(newTree!)).toEqual([2, 3, 4]);
	});
});

describe('InnerTree.dropLastChild', () => {
	const ctx = makeContext<number>(2); // max=4, min=2

	it('reduces right and returns last child', () => {
		const t = simpleInnerTree(
			[ob(ctx, [1])],
			[ob(ctx, [2]), ob(ctx, [3, 4])],
			2,
		);
		const [newTree, lastChild] = t.dropLastChild();
		expect(lastChild.toArray()).toEqual([3, 4]);
		expect(collectForEach(newTree!)).toEqual([1, 2]);
		expect(newTree!.size).toBe(2);
	});

	it('when right depleted and no middle, returns left block', () => {
		const t = simpleInnerTree(
			[ob(ctx, [1, 2])],
			[ob(ctx, [3])],
			2,
		);
		const [newTree, lastChild] = t.dropLastChild();
		expect(lastChild.toArray()).toEqual([3]);
		expect(collectForEach(newTree!)).toEqual([1, 2]);
	});

	it('when right depleted and middle exists, shifts from middle', () => {
		const t = innerTreeWithMiddle(
			[ob(ctx, [1])],
			[[ob(ctx, [2, 3])]],
			[ob(ctx, [4])],
			2,
		);
		const [newTree, lastChild] = t.dropLastChild();
		expect(lastChild.toArray()).toEqual([4]);
		expect(collectForEach(newTree!)).toEqual([1, 2, 3]);
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

describe('InnerTree.concat', () => {
	const ctx = makeContext<number>(2); // max=4, min=2

	it('innerBlock.concat(innerTree) at same level triggers prependBlock — Case 1 merge', () => {
		const left = ib(ctx, [ob(ctx, [3])], 1);
		const right = ib(ctx, [ob(ctx, [4])], 1);
		const tree = ctx.innerTree(left, right, null, left.size + right.size, 1);

		const block = ib(ctx, [ob(ctx, [1]), ob(ctx, [2])], 1);
		// block._nrChildren + tree.left._nrChildren = 2 + 1 = 3 ≤ 4 → merge
		const r = block.concat(tree);
		expect(collectForEach(r)).toEqual([1, 2, 3, 4]);
		expect(r.size).toBe(4);
	});

	it('innerBlock.concat(innerTree) triggers prependBlock — Case 2 push to middle', () => {
		const left = ib(ctx, [ob(ctx, [5]), ob(ctx, [5.1])], 1); // 2 children ≥ min=2
		const right = ib(ctx, [ob(ctx, [6])], 1);
		const tree = ctx.innerTree(left, right, null, left.size + right.size, 1);

		const block = ib(ctx, [ob(ctx, [1]), ob(ctx, [2]), ob(ctx, [3]), ob(ctx, [4])], 1);
		// block full (4), left._hasEnoughChildren (2 ≥ 2) → Case 2
		const r = block.concat(tree);
		expect(collectForEach(r)).toEqual([1, 2, 3, 4, 5, 5.1, 6]);
		expect(r.size).toBe(7);
	});

	it('innerBlock.concat(innerTree) triggers prependBlock — Case 3 split', () => {
		const left = ib(ctx, [ob(ctx, [5])], 1); // 1 child < min=2
		const right = ib(ctx, [ob(ctx, [6])], 1);
		const tree = ctx.innerTree(left, right, null, left.size + right.size, 1);

		const block = ib(ctx, [ob(ctx, [1]), ob(ctx, [2]), ob(ctx, [3]), ob(ctx, [4])], 1);
		// block full (4), left < min → Case 3 split
		const r = block.concat(tree);
		expect(collectForEach(r)).toEqual([1, 2, 3, 4, 5, 6]);
		expect(r.size).toBe(6);
	});
});

describe('InnerTree.reversed', () => {
	const ctx = makeContext<number>(3);

	it('preserves size', () => {
		const t = simpleInnerTree(
			[ob(ctx, [1, 2])],
			[ob(ctx, [3, 4])],
		);
		const r = t.reversed();
		expect(r.size).toBe(4);
	});

	it('swaps left and right via forEach on tree without middle', () => {
		const t = simpleInnerTree(
			[ob(ctx, [1, 2])],
			[ob(ctx, [3, 4])],
		);
		const r = t.reversed();
		const result: number[] = [];
		r.forEach((v) => result.push(v));
		expect(result).toEqual([4, 3, 2, 1]);
	});

	it('swaps left and right and reverses middle via forEach', () => {
		const t = innerTreeWithMiddle(
			[ob(ctx, [1, 2])],
			[[ob(ctx, [3, 4])]],
			[ob(ctx, [5, 6])],
		);
		const r = t.reversed();
		const result: number[] = [];
		r.forEach((v) => result.push(v));
		expect(result).toEqual([6, 5, 4, 3, 2, 1]);
	});

	it('does not mutate original', () => {
		const t = simpleInnerTree(
			[ob(ctx, [1, 2])],
			[ob(ctx, [3, 4])],
		);
		t.reversed();
		expect(t.toArray()).toEqual([1, 2, 3, 4]);
	});

	it('returns an InnerTree', () => {
		const t = simpleInnerTree(
			[ob(ctx, [1, 2])],
			[ob(ctx, [3, 4])],
		);
		const r = t.reversed();
		expect(r).toHaveProperty('left');
		expect(r).toHaveProperty('right');
		expect(r).toHaveProperty('middle');
	});

	it('double reverse of tree with middle', () => {
		const t = innerTreeWithMiddle(
			[ob(ctx, [1, 2])],
			[[ob(ctx, [3, 4])]],
			[ob(ctx, [5, 6])],
		);
		const r = t.reversed().reversed();
		const result: number[] = [];
		r.forEach((v) => result.push(v));
		expect(result).toEqual([1, 2, 3, 4, 5, 6]);
		expect(r.size).toBe(6);
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
		expect(t._get(0 as Int.AtLeastZero)).toBe(1);
		expect(t._get(3 as Int.AtLeastZero)).toBe(4);
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
		expect(t._get(0 as Int.AtLeastZero)).toBe(1);
		expect(t._get(1 as Int.AtLeastZero)).toBeNull();
		expect(t._get(2 as Int.AtLeastZero)).toBeNull();
		expect(t._get(3 as Int.AtLeastZero)).toBe(3);
	});
});
