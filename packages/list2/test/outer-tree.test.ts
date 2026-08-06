import { describe, expect, it } from 'bun:test';

import type { Int } from '@rimbu/base';

import type { ListContext } from '#list/context';
import type { OuterBlock } from '#list/immutable/outer-block';
import type { OuterTree } from '#list/immutable/outer-tree';

import { List } from '@rimbu/list';

function makeContext<T>(blockSizeBits: number): ListContext<T> {
	return List.createContext({ blockSizeBits }) as ListContext<T>;
}

function simpleTree(
	leftVals: number[],
	rightVals: number[],
	bits = 2,
): OuterTree<number> {
	const ctx = makeContext<number>(bits);
	return ctx.outerTree<number>(
		ctx.outerBlockLeftRight(ctx.childrenOps.of(leftVals)),
		ctx.outerBlockLeftRight(ctx.childrenOps.of(rightVals)),
		null,
		leftVals.length + rightVals.length,
	);
}

function treeWithMiddle(
	leftVals: number[],
	middleVals: number[][],
	rightVals: number[],
	bits = 2,
): OuterTree<number> {
	const ctx = makeContext<number>(bits);
	const left = ctx.outerBlockLeftRight(ctx.childrenOps.of(leftVals));
	const right = ctx.outerBlockLeftRight(ctx.childrenOps.of(rightVals));

	const size = left.size + right.size;

	const blocks = middleVals.map((vals) =>
		ctx.outerBlockLeftRight(ctx.childrenOps.of(vals)),
	);
	const totalMiddleSize = middleVals.reduce((s, v) => s + v.length, 0);

	const middle = ctx.innerBlock<number, OuterBlock<number>>(
		blocks as OuterBlock<number>[],
		totalMiddleSize,
		1,
	);

	return ctx.outerTree<number>(left, right, middle, size + totalMiddleSize);
}

describe('OuterTree.structure', () => {
	it('has left, right, size properties', () => {
		const t = simpleTree([1, 2, 3], [4, 5]);

		expect(t.left).toBeDefined();
		expect(t.right).toBeDefined();
		expect(t).toHaveProperty('middle');
		expect(t.size).toBe(5);
	});

	it('context is the list context', () => {
		const t = simpleTree([1, 2], [3, 4]);
		expect(t.context.blockSizeBits).toBe(2);
	});

	it('simple tree has null middle', () => {
		const t = simpleTree([1, 2], [3, 4]);
		expect(t.middle).toBeNull();
	});

	it('tree with middle has non-null middle', () => {
		const t = treeWithMiddle([1, 2], [[3, 4, 5, 6]], [7, 8]);
		expect(t.middle).not.toBeNull();
		expect(t.middle!.size).toBe(4);
	});

	it('preserves blockSizeBits in context', () => {
		const t = simpleTree([1], [2], 3);
		expect(t.context.blockSizeBits).toBe(3);
	});
});

describe('OuterTree.read', () => {
	describe('at', () => {
		const t = simpleTree([10, 20, 30], [40, 50]);

		it('reads from left block', () => {
			expect(t.at(0)).toBe(10);
			expect(t.at(1)).toBe(20);
			expect(t.at(2)).toBe(30);
		});

		it('reads from right block', () => {
			expect(t.at(3)).toBe(40);
			expect(t.at(4)).toBe(50);
		});

		it('negative indices cross block boundaries', () => {
			expect(t.at(-1)).toBe(50);
			expect(t.at(-2)).toBe(40);
			expect(t.at(-3)).toBe(30);
			expect(t.at(-4)).toBe(20);
			expect(t.at(-5)).toBe(10);
		});

		it('out of bounds returns otherwise', () => {
			expect(t.at(5)).toBeUndefined();
			expect(t.at(-6)).toBeUndefined();
			expect(t.at(5, 'fallback')).toBe('fallback');
			expect(t.at(-6, () => 'lazy')).toBe('lazy');
		});

		it('boundary: index equals size', () => {
			expect(t.at(5)).toBeUndefined();
		});

		it('boundary: index equals -size-1', () => {
			expect(t.at(-6)).toBeUndefined();
		});

		it('boundary: index equals -size (first element)', () => {
			expect(t.at(-5)).toBe(10);
		});

		it('boundary: index equals size-1 (last element)', () => {
			expect(t.at(4)).toBe(50);
		});

		it('otherwise is not called for valid index', () => {
			let called = false;
			expect(
				t.at(0, () => {
					called = true;
					return 999;
				}),
			).toBe(10);
			expect(called).toBe(false);
		});
	});

	describe('at with middle', () => {
		const t = treeWithMiddle([1, 2], [[3, 4, 5, 6]], [7, 8]);

		it('reads from left', () => {
			expect(t.at(0)).toBe(1);
			expect(t.at(1)).toBe(2);
		});

		it('reads from middle', () => {
			expect(t.at(2)).toBe(3);
			expect(t.at(3)).toBe(4);
			expect(t.at(4)).toBe(5);
			expect(t.at(5)).toBe(6);
		});

		it('reads from right', () => {
			expect(t.at(6)).toBe(7);
			expect(t.at(7)).toBe(8);
		});

		it('negative index reads correctly', () => {
			expect(t.at(-1)).toBe(8);
			expect(t.at(-2)).toBe(7);
			expect(t.at(-3)).toBe(6);
			expect(t.at(-8)).toBe(1);
		});
	});

	describe('at on larger tree', () => {
		const t = simpleTree(
			[10, 20, 30],
			[40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160],
		);

		it('handles many elements across left-right boundary', () => {
			expect(t.at(0)).toBe(10);
			expect(t.at(2)).toBe(30);
			expect(t.at(3)).toBe(40);
			expect(t.at(10)).toBe(110);
			expect(t.at(15)).toBe(160);
		});

		it('negative indices on larger tree', () => {
			expect(t.at(-1)).toBe(160);
			expect(t.at(-5)).toBe(120);
		});
	});

	describe('get', () => {
		const t = simpleTree([10, 20], [30, 40, 50]);

		it('returns element at positive index', () => {
			expect(t._get(0 as Int.AtLeastZero)).toBe(10);
			expect(t._get(3 as Int.AtLeastZero)).toBe(40);
			expect(t._get(4 as Int.AtLeastZero)).toBe(50);
		});

		it('at supports negative indices', () => {
			expect(t.at(-1)).toBe(50);
			expect(t.at(-4)).toBe(20);
		});
	});

	describe('first', () => {
		it('returns first element from left block', () => {
			const t = simpleTree([100, 200], [300]);
			expect(t.first()).toBe(100);
		});
	});

	describe('last', () => {
		it('returns last element from right block', () => {
			const t = simpleTree([100, 200], [300, 400]);
			expect(t.last()).toBe(400);
		});
	});

	describe('toArray', () => {
		it('concatenates left, middle, right in order', () => {
			const t = simpleTree([1, 2, 3], [4, 5]);
			expect(t.toArray()).toEqual([1, 2, 3, 4, 5]);
		});

		it('includes middle block', () => {
			const t = treeWithMiddle(
				[1, 2],
				[
					[3, 4],
					[5, 6],
				],
				[7, 8],
			);
			expect(t.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
		});

		it('single element in left', () => {
			const t = simpleTree([1], [2, 3, 4]);
			expect(t.toArray()).toEqual([1, 2, 3, 4]);
		});
	});
});

describe('OuterTree.stream', () => {
	describe('forward', () => {
		it('streams left, middle, right in order', () => {
			const t = simpleTree([10, 20], [30, 40]);
			expect([...t.stream()]).toEqual([10, 20, 30, 40]);
		});

		it('streams tree with middle', () => {
			const t = treeWithMiddle(
				[1],
				[
					[2, 3],
					[4, 5],
				],
				[6],
			);
			expect([...t.stream()]).toEqual([1, 2, 3, 4, 5, 6]);
		});
	});

	describe('reversed', () => {
		it('streams right, middle, left in reverse', () => {
			const t = simpleTree([10, 20], [30, 40]);
			expect([...t.stream({ reversed: true })]).toEqual([40, 30, 20, 10]);
		});

		it('reversed with middle', () => {
			const t = treeWithMiddle(
				[1],
				[
					[2, 3],
					[4, 5],
				],
				[6],
			);
			expect([...t.stream({ reversed: true })]).toEqual([6, 5, 4, 3, 2, 1]);
		});
	});
});

describe('OuterTree.forEach', () => {
	it('visits left, middle, right in order', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const result: number[] = [];
		t.forEach((v) => result.push(v));
		expect(result).toEqual([1, 2, 3, 4]);
	});

	it('visits tree with middle', () => {
		const t = treeWithMiddle([10], [[20, 30]], [40]);
		const result: number[] = [];
		t.forEach((v) => result.push(v));
		expect(result).toEqual([10, 20, 30, 40]);
	});
});

describe('OuterTree.prepend', () => {
	const bits = 2; // max=4, min=2

	it('adds to left when left has room', () => {
		const t = simpleTree([1, 2], [5, 6]);
		const r = t.prepend(0);
		expect(r.toArray()).toEqual([0, 1, 2, 5, 6]);
		expect(r.size).toBe(5);
	});

	it('shifts from left to right when left full and right has room', () => {
		// left full with 4, right has 1 with room
		const ctx = makeContext<number>(bits);
		const t = ctx.outerTree(
			ctx.outerBlockLeftRight(ctx.childrenOps.of([1, 2, 3, 4])),
			ctx.outerBlockLeftRight(ctx.childrenOps.of([5])),
			null,
			5,
		);
		const r = t.prepend(0);
		expect(r.toArray()).toEqual([0, 1, 2, 3, 4, 5]);
		expect(r.size).toBe(6);
	});

	it('shifts into middle when left full and middle first block has room', () => {
		// left=[1,2,3,4], middle=[ [5,6] ], right=[7,8,9,10]
		const t = treeWithMiddle([1, 2, 3, 4], [[5, 6]], [7, 8, 9, 10], bits);
		const r = t.prepend(0);
		expect(r.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		expect(r.size).toBe(11);
	});

	it('promotes left to middle when all are full', () => {
		// left=[1,2,3,4], right=[5,6,7,8], no middle
		const ctx = makeContext<number>(bits);
		const t = ctx.outerTree(
			ctx.outerBlockLeftRight(ctx.childrenOps.of([1, 2, 3, 4])),
			ctx.outerBlockLeftRight(ctx.childrenOps.of([5, 6, 7, 8])),
			null,
			8,
		);
		const r = t.prepend(0);
		expect(r.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
		expect(r.size).toBe(9);
		// left should be [0], middle should contain original left
		expect(r.middle).not.toBeNull();
	});

	it('does not mutate original', () => {
		const t = simpleTree([1, 2], [3, 4]);
		t.prepend(0);
		expect(t.toArray()).toEqual([1, 2, 3, 4]);
	});

	it('returns a Tree', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const r = t.prepend(0);
		expect(r).toHaveProperty('left');
		expect(r).toHaveProperty('right');
		expect(r).toHaveProperty('middle');
	});

	it('sequential prepends build correct tree', () => {
		const ctx = makeContext<number>(bits);
		let t: any = ctx.of(10);
		for (const v of [9, 8, 7, 6, 5, 4, 3, 2, 1]) {
			t = t.prepend(v);
		}
		expect(t.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		expect(t.size).toBe(10);
	});

	it('promotes middle to InnerTree when middle is full and left overflows', () => {
		// middle has 4 children (at capacity), all blocks full
		const t = treeWithMiddle(
			[1, 2, 3, 4],
			[
				[5, 6, 7, 8],
				[9, 10, 11, 12],
				[13, 14, 15, 16],
				[17, 18, 19, 20],
			],
			[21, 22, 23, 24],
			bits,
		);
		const r = t.prepend(0);
		expect(r.toArray()).toEqual([
			0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
			21, 22, 23, 24,
		]);
		expect(r.size).toBe(25);
	});
});

describe('OuterTree.append', () => {
	const bits = 2; // max=4, min=2

	it('adds to right when right has room', () => {
		const t = simpleTree([1, 2], [4, 5]);
		const r = t.append(6);
		expect(r.toArray()).toEqual([1, 2, 4, 5, 6]);
		expect(r.size).toBe(5);
	});

	it('shifts from right to left when right full and left has room', () => {
		const ctx = makeContext<number>(bits);
		const t = ctx.outerTree(
			ctx.outerBlockLeftRight(ctx.childrenOps.of([1])),
			ctx.outerBlockLeftRight(ctx.childrenOps.of([2, 3, 4, 5])),
			null,
			5,
		);
		const r = t.append(6);
		expect(r.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
		expect(r.size).toBe(6);
	});

	it('shifts into middle when right full and middle last block has room', () => {
		const t = treeWithMiddle([1, 2, 3, 4], [[5, 6]], [7, 8, 9, 10], bits);
		const r = t.append(11);
		expect(r.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
		expect(r.size).toBe(11);
	});

	it('promotes right to middle when all are full', () => {
		const ctx = makeContext<number>(bits);
		const t = ctx.outerTree(
			ctx.outerBlockLeftRight(ctx.childrenOps.of([1, 2, 3, 4])),
			ctx.outerBlockLeftRight(ctx.childrenOps.of([5, 6, 7, 8])),
			null,
			8,
		);
		const r = t.append(9);
		expect(r.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
		expect(r.size).toBe(9);
		expect(r.middle).not.toBeNull();
	});

	it('does not mutate original', () => {
		const t = simpleTree([1, 2], [3, 4]);
		t.append(5);
		expect(t.toArray()).toEqual([1, 2, 3, 4]);
	});

	it('returns a Tree', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const r = t.append(5);
		expect(r).toHaveProperty('left');
		expect(r).toHaveProperty('right');
		expect(r).toHaveProperty('middle');
	});

	it('sequential appends build correct tree', () => {
		const ctx = makeContext<number>(bits);
		let t: any = ctx.of(1);
		for (let i = 2; i <= 10; i++) {
			t = t.append(i);
		}
		expect(t.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		expect(t.size).toBe(10);
	});

	it('promotes middle to InnerTree when middle is full and right overflows', () => {
		const t = treeWithMiddle(
			[1, 2, 3, 4],
			[
				[5, 6, 7, 8],
				[9, 10, 11, 12],
				[13, 14, 15, 16],
				[17, 18, 19, 20],
			],
			[21, 22, 23, 24],
			bits,
		);
		const r = t.append(25);
		expect(r.toArray()).toEqual([
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
			22, 23, 24, 25,
		]);
		expect(r.size).toBe(25);
	});
});

describe('OuterTree.updateAtAndReturn', () => {
	const bits = 2;

	it('updates element in left block', () => {
		const t = simpleTree([1, 2], [5, 6]);
		const { collection, hasResult, result, hasChanged } = t.updateAtAndReturn(
			0,
			(x) => x + 10,
		);
		expect(hasResult).toBe(true);
		expect(hasChanged).toBe(true);
		const [prev, curr] = result;
		expect(prev).toBe(1);
		expect(curr).toBe(11);
		expect(collection.toArray()).toEqual([11, 2, 5, 6]);
	});

	it('updates element in right block', () => {
		const t = simpleTree([10, 20], [30, 40]);
		const { collection, hasResult, result, hasChanged } = t.updateAtAndReturn(
			3,
			(x) => x + 1,
		);
		expect(hasResult).toBe(true);
		expect(hasChanged).toBe(true);
		const [prev, curr] = result;
		expect(prev).toBe(40);
		expect(curr).toBe(41);
		expect(collection.toArray()).toEqual([10, 20, 30, 41]);
	});

	it('updates element at negative index', () => {
		const t = simpleTree([10, 20], [30, 40]);
		const { collection, result } = t.updateAtAndReturn(-2, (x) => x * 10);
		const [prev, curr] = result;
		expect(prev).toBe(30);
		expect(curr).toBe(300);
		expect(collection.toArray()).toEqual([10, 20, 300, 40]);
	});

	it('updates element in middle block', () => {
		const t = treeWithMiddle([1, 2], [[3, 4]], [5, 6], bits);
		const { collection, result } = t.updateAtAndReturn(3, (x) => x + 100);
		const [prev, curr] = result;
		expect(prev).toBe(4);
		expect(curr).toBe(104);
		expect(collection.toArray()).toEqual([1, 2, 3, 104, 5, 6]);
	});

	it('returns unchanged and no result for out-of-bounds index', () => {
		const t = simpleTree([10, 20], [30, 40]);
		const { collection, hasResult, result, hasChanged } = t.updateAtAndReturn(
			100,
			(x) => x + 1,
		);
		expect(collection).toBe(t);
		expect(hasResult).toBe(false);
		expect(hasChanged).toBe(false);
		const [prev, curr] = result;
		expect(prev).toBeUndefined();
		expect(curr).toBeUndefined();
	});

	it('does not mutate original', () => {
		const t = simpleTree([1, 2], [3, 4]);
		t.updateAtAndReturn(0, (x) => x + 10);
		expect(t.toArray()).toEqual([1, 2, 3, 4]);
	});
});

describe('OuterTree.setAtAndReturn', () => {
	it('replaces element and returns previous value', () => {
		const t = simpleTree([10, 20], [30, 40]);
		const {
			collection,
			hasResult,
			result: previous,
			hasChanged,
		} = t.setAtAndReturn(1, 99);
		expect(hasResult).toBe(true);
		expect(hasChanged).toBe(true);
		expect(previous).toBe(20);
		expect(collection.toArray()).toEqual([10, 99, 30, 40]);
	});

	it('returns unchanged for out-of-bounds', () => {
		const t = simpleTree([10, 20], [30, 40]);
		const {
			collection,
			hasResult,
			result: previous,
			hasChanged,
		} = t.setAtAndReturn(100, 999);
		expect(collection).toBe(t);
		expect(hasResult).toBe(false);
		expect(previous).toBeUndefined();
		expect(hasChanged).toBe(false);
	});
});

describe('OuterTree.take', () => {
	const bits = 2;

	it('take from left block only', () => {
		const t = simpleTree([1, 2, 3], [10, 20]);
		const r = t.take(2);
		expect(r.size).toBe(2);
		expect(r.toArray()).toEqual([1, 2]);
	});

	it('take crosses into right block', () => {
		const t = simpleTree([1, 2], [10, 20, 30]);
		const r = t.take(3);
		expect(r.size).toBe(3);
		expect(r.toArray()).toEqual([1, 2, 10]);
	});

	it('take from tree with middle', () => {
		const t = treeWithMiddle([1, 2], [[3, 4, 5, 6]], [7, 8], bits);
		const r = t.take(4);
		expect(r.size).toBe(4);
		expect(r.toArray()).toEqual([1, 2, 3, 4]);
	});

	it('take zero returns empty', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const r = t.take(0);
		expect(r.isEmpty).toBe(true);
	});

	it('take all returns same list', () => {
		const t = simpleTree([1, 2, 3], [4, 5]);
		const r = t.take(5);
		expect(r.toArray()).toEqual([1, 2, 3, 4, 5]);
	});

	it('does not mutate original', () => {
		const t = simpleTree([1, 2], [3, 4]);
		t.take(1);
		expect(t.toArray()).toEqual([1, 2, 3, 4]);
	});
});

describe('OuterTree.drop', () => {
	it('drop from left block only', () => {
		const t = simpleTree([1, 2, 3], [10, 20]);
		const r = t.drop(1);
		expect(r.size).toBe(4);
		expect(r.toArray()).toEqual([2, 3, 10, 20]);
	});

	it('drop crosses into right block', () => {
		const t = simpleTree([1, 2], [10, 20, 30]);
		const r = t.drop(3);
		expect(r.size).toBe(2);
		expect(r.toArray()).toEqual([20, 30]);
	});

	it('drop zero returns same list', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const r = t.drop(0);
		expect(r.toArray()).toEqual([1, 2, 3, 4]);
	});

	it('drop all returns empty', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const r = t.drop(4);
		expect(r.isEmpty).toBe(true);
	});

	it('does not mutate original', () => {
		const t = simpleTree([1, 2], [3, 4]);
		t.drop(1);
		expect(t.toArray()).toEqual([1, 2, 3, 4]);
	});
});

describe('OuterTree.insertAt', () => {
	const bits = 2;
	const ctx = makeContext<number>(bits);

	it('inserts at the left, block, and right boundaries', () => {
		const t = simpleTree([1, 2], [3, 4], bits);

		expect(t.insertAt(0, ctx.of(0)).toArray()).toEqual([0, 1, 2, 3, 4]);
		expect(t.insertAt(2, ctx.of(9, 10)).toArray()).toEqual([1, 2, 9, 10, 3, 4]);
		expect(t.insertAt(t.size, ctx.of(5)).toArray()).toEqual([1, 2, 3, 4, 5]);
	});

	it('inserts across the middle of a tree with middle blocks', () => {
		const t = treeWithMiddle(
			[1, 2],
			[
				[3, 4],
				[5, 6],
			],
			[7, 8],
			bits,
		);

		expect(t.insertAt(2, ctx.of(9, 10)).toArray()).toEqual([
			1, 2, 9, 10, 3, 4, 5, 6, 7, 8,
		]);
		expect(t.insertAt(6, ctx.of(11)).toArray()).toEqual([
			1, 2, 3, 4, 5, 6, 11, 7, 8,
		]);
	});

	it('supports negative and out-of-range positions', () => {
		const t = simpleTree([1, 2], [3, 4], bits);

		expect(t.insertAt(-1, ctx.of(9)).toArray()).toEqual([1, 2, 3, 9, 4]);
		expect(t.insertAt(-100, ctx.of(0)).toArray()).toEqual([0, 1, 2, 3, 4]);
		expect(t.insertAt(100, ctx.of(5)).toArray()).toEqual([1, 2, 3, 4, 5]);
	});

	it('does not mutate the original tree', () => {
		const t = simpleTree([1, 2], [3, 4], bits);

		t.insertAt(2, ctx.of(9));

		expect(t.toArray()).toEqual([1, 2, 3, 4]);
	});
});

describe('OuterTree.removeAt', () => {
	const bits = 2;

	it('removes from the left, middle, and right boundaries', () => {
		const t = simpleTree([1, 2], [3, 4], bits);

		expect(t.removeAt(0).toArray()).toEqual([2, 3, 4]);
		expect(t.removeAt(1, 2).toArray()).toEqual([1, 4]);
		expect(t.removeAt(-1).toArray()).toEqual([1, 2, 3]);
	});

	it('removes across the middle of a tree with middle blocks', () => {
		const t = treeWithMiddle(
			[1, 2],
			[
				[3, 4],
				[5, 6],
			],
			[7, 8],
			bits,
		);

		expect(t.removeAt(2, 3).toArray()).toEqual([1, 2, 6, 7, 8]);
		expect(t.removeAt(6, 2).toArray()).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it('clamps negative and out-of-range positions', () => {
		const t = simpleTree([1, 2], [3, 4], bits);

		expect(t.removeAt(-100).toArray()).toEqual([2, 3, 4]);
		expect(t.removeAt(100).toArray()).toEqual([1, 2, 3, 4]);
		expect(t.removeAt(1, 100).toArray()).toEqual([1]);
	});

	it('removing all elements returns an empty list', () => {
		const t = simpleTree([1, 2], [3, 4], bits);

		expect(t.removeAt(0, t.size).isEmpty).toBe(true);
	});

	it('does not mutate the original tree', () => {
		const t = simpleTree([1, 2], [3, 4], bits);

		t.removeAt(2);

		expect(t.toArray()).toEqual([1, 2, 3, 4]);
	});
});

describe('OuterTree.filter', () => {
	const bits = 2;

	it('filters matching elements', () => {
		const t = simpleTree([1, 2, 3], [4, 5, 6]);
		const r = t.filter((x) => x % 2 === 0);
		expect(r.toArray()).toEqual([2, 4, 6]);
		expect(r.size).toBe(3);
	});

	it('filtering all elements returns same reference', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const r = t.filter(() => true);
		expect(r).toBe(t);
		expect(r.toArray()).toEqual([1, 2, 3, 4]);
	});

	it('filters with middle block', () => {
		const t = treeWithMiddle([1, 2], [[3, 4]], [5, 6], bits);
		const r = t.filter((x) => x > 2);
		expect(r.toArray()).toEqual([3, 4, 5, 6]);
	});

	it('filtering everything returns empty', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const r = t.filter(() => false);
		expect(r.isEmpty).toBe(true);
	});

	it('does not mutate original', () => {
		const t = simpleTree([1, 2], [3, 4]);
		t.filter((x) => x > 2);
		expect(t.toArray()).toEqual([1, 2, 3, 4]);
	});
});

describe('OuterTree.concat', () => {
	const bits = 2; // max=4, min=2
	const ctx = makeContext<number>(bits);

	it('tree+tree concat maintains correct element order (Case 2: joint fits in block)', () => {
		const a = ctx.outerTree(
			ctx.outerBlockLeftRight(ctx.childrenOps.of([1])),
			ctx.outerBlockLeftRight(ctx.childrenOps.of([2])),
			null,
			2,
		);
		const b = ctx.outerTree(
			ctx.outerBlockLeftRight(ctx.childrenOps.of([3])),
			ctx.outerBlockLeftRight(ctx.childrenOps.of([4, 5])),
			null,
			3,
		);
		// joint = a.right + b.left = [2] + [3] = 2 elements ≤ max=4 → Case 2
		const r = a.concat(b);
		expect(r.toArray()).toEqual([1, 2, 3, 4, 5]);
		expect(r.size).toBe(5);
	});

	it('tree+tree concat maintains correct element order (Case 3: push both to middle)', () => {
		const a = ctx.outerTree(
			ctx.outerBlockLeftRight(ctx.childrenOps.of([1])),
			ctx.outerBlockLeftRight(ctx.childrenOps.of([2, 3])), // ≥ min=2
			null,
			3,
		);
		const b = ctx.outerTree(
			ctx.outerBlockLeftRight(ctx.childrenOps.of([4, 5])), // ≥ min=2
			ctx.outerBlockLeftRight(ctx.childrenOps.of([6])),
			null,
			3,
		);
		// joint = [2,3] + [4,5] = 4 ≤ max=4, both ≥ min → Case 2, then both pushed
		const r = a.concat(b);
		expect(r.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
		expect(r.size).toBe(6);
	});

	it('tree+tree concat maintains correct element order (Case 1: underflow)', () => {
		const a = ctx.outerTree(
			ctx.outerBlockLeftRight(ctx.childrenOps.of([1])),
			ctx.outerBlockLeftRight(ctx.childrenOps.of([2])), // size=1 < min
			null,
			2,
		);
		const b = ctx.outerTree(
			ctx.outerBlockLeftRight(ctx.childrenOps.of([3])), // size=1 < min
			ctx.outerBlockLeftRight(ctx.childrenOps.of([4])),
			null,
			2,
		);
		// joint = [2] + [3] = 2 = min, but < min for outer (is 2 < 2? No)
		// Actually this uses <. Let me use sizes that TRULY underflow
		// Need joint < minBlockSize=2 → joint of 1
		expect(a.concat(b).toArray()).toEqual([1, 2, 3, 4]);
	});

	it('concatenating tree with itself maintains correct elements', () => {
		const a = ctx.outerTree(
			ctx.outerBlockLeftRight(ctx.childrenOps.of([1, 2])),
			ctx.outerBlockLeftRight(ctx.childrenOps.of([3, 4])),
			null,
			4,
		);
		const r = a.concat(a);
		expect(r.toArray()).toEqual([1, 2, 3, 4, 1, 2, 3, 4]);
		expect(r.size).toBe(8);
	});
});

describe('OuterTree.reversed', () => {
	const bits = 2; // max=4, min=2

	it('preserves size', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const r = t.reversed();
		expect(r.size).toBe(4);
	});

	it('does not mutate original', () => {
		const t = simpleTree([1, 2], [3, 4]);
		t.reversed();
		expect(t.toArray()).toEqual([1, 2, 3, 4]);
	});

	it('returns a Tree', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const r = t.reversed();
		expect(r).toHaveProperty('left');
		expect(r).toHaveProperty('right');
		expect(r).toHaveProperty('middle');
	});

	it('reversed tree with no middle swaps left and right via forEach', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const r = t.reversed();
		const result: number[] = [];
		r.forEach((v) => result.push(v));
		expect(result).toEqual([4, 3, 2, 1]);
	});

	it('reversed tree with middle via forEach', () => {
		const t = treeWithMiddle([1, 2], [[3, 4]], [5, 6], bits);
		const r = t.reversed();
		const result: number[] = [];
		r.forEach((v) => result.push(v));
		expect(result).toEqual([6, 5, 4, 3, 2, 1]);
	});

	it('element access works correctly on reversed tree', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const r = t.reversed();
		expect(r.at(0)).toBe(4);
		expect(r.at(1)).toBe(3);
		expect(r.at(2)).toBe(2);
		expect(r.at(3)).toBe(1);
	});

	it('double reverse of tree with middle', () => {
		const t = treeWithMiddle([1, 2], [[3, 4]], [5, 6], bits);
		const r = t.reversed().reversed();
		const result: number[] = [];
		r.forEach((v) => result.push(v));
		expect(result).toEqual([1, 2, 3, 4, 5, 6]);
		expect(r.size).toBe(6);
	});
});

describe('OuterTree.map', () => {
	it('transforms all elements across left and right', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const r = t.map((x: number) => x * 10);
		expect(r.toArray()).toEqual([10, 20, 30, 40]);
		expect(r.size).toBe(4);
	});

	it('transforms tree with middle', () => {
		const t = treeWithMiddle([1], [[2, 3]], [4]);
		const r = t.map((x: number) => x * 10);
		expect(r.toArray()).toEqual([10, 20, 30, 40]);
	});

	it('preserves tree structure type', () => {
		const t = simpleTree([1, 2], [3]);
		const r = t.map((x: number) => `v${x}`);
		expect(r).toHaveProperty('left');
		expect(r).toHaveProperty('right');
		expect(r.first()).toBe('v1');
	});

	it('does not mutate original', () => {
		const t = simpleTree([1, 2], [3]);
		t.map((x: number) => x * 10);
		expect(t.toArray()).toEqual([1, 2, 3]);
	});
});

describe('OuterTree.immutability', () => {
	it('toArray returns a copy', () => {
		const t = simpleTree([1, 2], [3, 4]);
		const arr1 = t.toArray();
		const arr2 = t.toArray();
		expect(arr1).toEqual(arr2);
		expect(arr1).toEqual([1, 2, 3, 4]);
	});

	it('prepend returns new instance', () => {
		const t = simpleTree([1, 2], [3, 4]);
		expect(t.prepend(0)).not.toBe(t as any);
	});

	it('append returns new instance', () => {
		const t = simpleTree([1, 2], [3, 4]);
		expect(t.append(5)).not.toBe(t as any);
	});

	it('map returns new instance', () => {
		const t = simpleTree([1, 2], [3, 4]);
		expect(t.map((x: number) => x)).not.toBe(t as any);
	});
});

describe('OuterTree.inherited', () => {
	describe('slice', () => {
		const t = simpleTree([10, 20, 30], [40, 50]);

		it('full range returns same instance', () => {
			expect(t.slice({ start: 0, amount: 5 })).toBe(t as any);
		});

		it('empty range returns empty', () => {
			expect(t.slice({ start: 0, amount: 0 }).size).toBe(0);
		});
	});

	describe('mapIndexed', () => {
		it('passes indices across the tree', () => {
			const t = simpleTree([10, 20], [30, 40]);
			const r = t.mapIndexed((v: number, i: number) => `${v}:${i}`);
			expect(r.toArray()).toEqual(['10:0', '20:1', '30:2', '40:3']);
		});

		it('indexOffset works', () => {
			const t = simpleTree([10], [20]);
			const r = t.mapIndexed((v: number, i: number) => `${v}:${i}`, {
				indexOffset: 5,
			});
			expect(r.toArray()).toEqual(['10:5', '20:6']);
		});
	});
});

describe('OuterTree.edge-cases', () => {
	const bits = 2;

	describe('single-element blocks in tree', () => {
		it('tree with 1-element left and 1-element right', () => {
			const ctx = makeContext<number>(bits);
			const t = ctx.outerTree(
				ctx.outerBlockLeftRight(ctx.childrenOps.of([10])),
				ctx.outerBlockLeftRight(ctx.childrenOps.of([20])),
				null,
				2,
			);
			expect(t.size).toBe(2);
			expect(t.toArray()).toEqual([10, 20]);
			expect(t.at(0)).toBe(10);
			expect(t.at(1)).toBe(20);
			expect(t.at(-1)).toBe(20);
		});
	});

	describe('large tree built from sequential operations', () => {
		it('handles 50 elements built by append', () => {
			const ctx = makeContext<number>(bits);
			let t: any = ctx.of(0);
			for (let i = 1; i < 50; i++) {
				t = t.append(i);
			}
			expect(t.size).toBe(50);
			expect(t.toArray()).toEqual(Array.from({ length: 50 }, (_, i) => i));
		});

		it('handles 50 elements built by prepend', () => {
			const ctx = makeContext<number>(bits);
			let t: any = ctx.of(49);
			for (let i = 48; i >= 0; i--) {
				t = t.prepend(i);
			}
			expect(t.size).toBe(50);
			expect(t.toArray()).toEqual(Array.from({ length: 50 }, (_, i) => i));
		});

		it('forEach on 50-element tree', () => {
			const ctx = makeContext<number>(bits);
			let t: any = ctx.of(0);
			for (let i = 1; i < 50; i++) {
				t = t.append(i);
			}
			let count = 0;
			t.forEach((_: number) => count++);
			expect(count).toBe(50);
		});

		it('stream reversed on 50 elements', () => {
			const ctx = makeContext<number>(bits);
			let t: any = ctx.of(0);
			for (let i = 1; i < 50; i++) {
				t = t.append(i);
			}
			const result = [...t.stream({ reversed: true })];
			const expected = Array.from({ length: 50 }, (_, i) => 49 - i);
			expect(result).toEqual(expected);
		});
	});

	describe('null and undefined handling', () => {
		it('handles null elements in tree', () => {
			const ctx = makeContext<number | null>(bits);
			const t = ctx.outerTree(
				ctx.outerBlockLeftRight(ctx.childrenOps.of([1 as number | null, null])),
				ctx.outerBlockLeftRight(ctx.childrenOps.of([null as number | null, 3])),
				null,
				4,
			);
			expect(t.at(0)).toBe(1);
			expect(t.at(1)).toBeNull();
			expect(t.at(2)).toBeNull();
			expect(t.at(3)).toBe(3);
		});

		it('handles undefined elements in tree', () => {
			const ctx = makeContext<number | undefined>(bits);
			const t = ctx.outerTree(
				ctx.outerBlockLeftRight(
					ctx.childrenOps.of([1 as number | undefined, undefined]),
				),
				ctx.outerBlockLeftRight(
					ctx.childrenOps.of([undefined as number | undefined, 3]),
				),
				null,
				4,
			);
			expect(t.at(0)).toBe(1);
			expect(t.at(1)).toBeUndefined();
			expect(t.at(2)).toBeUndefined();
			expect(t.at(3)).toBe(3);
		});

		it('otherwise fallback with undefined elements', () => {
			const ctx = makeContext<undefined>(bits);
			const t = ctx.outerTree(
				ctx.outerBlockLeftRight(ctx.childrenOps.of([undefined, undefined])),
				ctx.outerBlockLeftRight(ctx.childrenOps.of([undefined])),
				null,
				3,
			);
			expect(t.at(10, 'fallback')).toBe('fallback');
		});
	});

	describe('sorted elements with search patterns', () => {
		it('at on sequential tree returns correct values', () => {
			const ctx = makeContext<number>(bits);
			const values = Array.from({ length: 20 }, (_, i) => i);
			const cv = [...values];
			const mid = 8;
			const left = ctx.outerBlockLeftRight(
				ctx.childrenOps.of(cv.slice(0, mid)),
			);
			const right = ctx.outerBlockLeftRight(ctx.childrenOps.of(cv.slice(mid)));
			const t = ctx.outerTree(left, right, null, values.length);

			for (let i = 0; i < 20; i++) {
				expect(t.at(i)).toBe(i);
			}
		});

		it('negative at on sequential tree returns correct values', () => {
			const ctx = makeContext<number>(bits);
			const left = ctx.outerBlockLeftRight(ctx.childrenOps.of([0, 1, 2, 3]));
			const right = ctx.outerBlockLeftRight(
				ctx.childrenOps.of([4, 5, 6, 7, 8, 9, 10]),
			);
			const t = ctx.outerTree(left, right, null, 11);

			expect(t.at(-1)).toBe(10);
			expect(t.at(-5)).toBe(6);
			expect(t.at(-11)).toBe(0);
		});
	});

	describe('list-of-style construction', () => {
		it('overflow from List.of creates a valid tree', () => {
			const ctx = makeContext<number>(bits);
			const t = ctx.of(1, 2, 3, 4, 5) as any as OuterTree<number>;
			expect(t).toHaveProperty('left');
			expect(t).toHaveProperty('right');
			expect(t.size).toBe(5);
			expect(t.toArray()).toEqual([1, 2, 3, 4, 5]);
		});

		it('then prepend/append continue to work', () => {
			const ctx = makeContext<number>(bits);
			let t = ctx.of(1, 2, 3, 4, 5);
			t = t.prepend(0);
			t = t.append(6);
			expect(t.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6]);
			expect(t.size).toBe(7);
		});
	});
});
