import { describe, expect, it } from 'bun:test';

import type { ListContext } from '#list/context';
import type { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

import { List } from '@rimbu/list';

function makeContext<T>(blockSizeBits: number): ListContext<T> {
	return List.createContext({ blockSizeBits }) as ListContext<T>;
}

function ob<T>(ctx: ListContext<T>, vals: T[]): OuterBlockBuilder<T> {
	return ctx.outerBlockBuilder(ctx.childrenOps.of(vals));
}

function treeBuilder<T>(
	ctx: ListContext<T>,
	leftVals: T[],
	rightVals: T[],
): any {
	const left = ob(ctx, leftVals);
	const right = ob(ctx, rightVals);
	return ctx.outerTreeBuilder(
		left,
		right,
		undefined,
		leftVals.length + rightVals.length,
	);
}

describe('OuterTreeBuilder.properties', () => {
	it('level is 0', () => {
		const ctx = makeContext<number>(2);
		const t = treeBuilder(ctx, [1, 2], [3, 4]);
		expect(t.level).toBe(0);
	});

	it('size equals sum of left + right', () => {
		const ctx = makeContext<number>(3);
		const t = treeBuilder(ctx, [1, 2, 3], [4, 5]);
		expect(t.size).toBe(5);
	});

	it('has left, right, middle', () => {
		const ctx = makeContext<number>(2);
		const t = treeBuilder(ctx, [1], [2]);
		expect(t.left).toBeDefined();
		expect(t.right).toBeDefined();
		expect(t.middle).toBeUndefined();
	});

	it('context is the list context', () => {
		const ctx = makeContext<number>(3);
		const t = treeBuilder(ctx, [1], [2]);
		expect(t.context.blockSizeBits).toBe(3);
	});
});

describe('OuterTreeBuilder.read', () => {
	describe('at', () => {
		const ctx = makeContext<number>(2);
		const t = treeBuilder(ctx, [10, 20, 30], [40, 50]);

		it('from left block', () => {
			expect(t.at(0)).toBe(10);
			expect(t.at(2)).toBe(30);
		});

		it('from right block', () => {
			expect(t.at(3)).toBe(40);
			expect(t.at(4)).toBe(50);
		});

		it('negative index crosses boundary', () => {
			expect(t.at(-1)).toBe(50);
			expect(t.at(-2)).toBe(40);
			expect(t.at(-3)).toBe(30);
		});

		it('out of bounds returns otherwise', () => {
			expect(t.at(5)).toBeUndefined();
			expect(t.at(-6)).toBeUndefined();
			expect(t.at(5, 'fallback')).toBe('fallback');
			expect(t.at(-6, () => 'lazy')).toBe('lazy');
		});

		it('otherwise not called for valid index', () => {
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

	describe('get', () => {
		it('returns element at index', () => {
			const ctx = makeContext<number>(2);
			const t = treeBuilder(ctx, [10, 20], [30, 40]);
			expect(t.get(0)).toBe(10);
			expect(t.get(1)).toBe(20);
			expect(t.get(2)).toBe(30);
			expect(t.get(3)).toBe(40);
		});
	});

	describe('forEach', () => {
		it('visits left then right in order', () => {
			const ctx = makeContext<number>(2);
			const t = treeBuilder(ctx, [1, 2], [3, 4]);
			const result: number[] = [];
			t.forEach((v: number) => result.push(v));
			expect(result).toEqual([1, 2, 3, 4]);
		});
	});
});

describe('OuterTreeBuilder.prepend', () => {
	const bits = 2; // max=4

	it('prepends to left when left has room', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [2, 3], [5, 6]);
		t.prepend(1);
		expect(t.size).toBe(5);
		expect(t.build().toArray()).toEqual([1, 2, 3, 5, 6]);
	});

	it('shifts left→right when left full and right has room', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [1, 2, 3, 4], [5]);
		t.prepend(0);
		expect(t.size).toBe(6);
		expect(t.build().toArray()).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it('promotes left to middle when both are full', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [1, 2, 3, 4], [5, 6, 7, 8]);
		t.prepend(0);
		expect(t.size).toBe(9);
		expect(t.middle).toBeDefined();
		expect(t.build().toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
	});

	it('multiple prepends build correct tree', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [5], [6]);
		t.prepend(4);
		t.prepend(3);
		t.prepend(2);
		t.prepend(1);
		t.prepend(0);
		expect(t.build().toArray()).toEqual([0, 1, 2, 3, 4, 5, 6]);
	});
});

describe('OuterTreeBuilder.append', () => {
	const bits = 2; // max=4

	it('appends to right when right has room', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [1, 2], [4, 5]);
		t.append(6);
		expect(t.size).toBe(5);
		expect(t.build().toArray()).toEqual([1, 2, 4, 5, 6]);
	});

	it('shifts right→left when right full and left has room', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [1], [2, 3, 4, 5]);
		t.append(6);
		expect(t.size).toBe(6);
		expect(t.build().toArray()).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it('promotes right to middle when both are full', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [1, 2, 3, 4], [5, 6, 7, 8]);
		t.append(9);
		expect(t.size).toBe(9);
		expect(t.middle).toBeDefined();
		expect(t.build().toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});

	it('multiple appends build correct tree', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [0], [1]);
		t.append(2);
		t.append(3);
		t.append(4);
		t.append(5);
		expect(t.build().toArray()).toEqual([0, 1, 2, 3, 4, 5]);
	});
});

describe('OuterTreeBuilder.build', () => {
	const bits = 2;

	it('returns tree with correct elements', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [1, 2], [3, 4]);
		const result = t.build();
		expect(result.size).toBe(4);
		expect(result.toArray()).toEqual([1, 2, 3, 4]);
	});

	it('returns outer tree type', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [1], [2]);
		expect(t.build()).toHaveProperty('left');
	});

	it('build after append reflects changes', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [1, 2], [3]);
		t.append(4);
		expect(t.build().toArray()).toEqual([1, 2, 3, 4]);
	});
});

describe('OuterTreeBuilder.buildMap', () => {
	it('transforms elements', () => {
		const ctx = makeContext<number>(2);
		const t = treeBuilder(ctx, [1, 2], [3, 4]);
		const mapped = t.buildMap((x: number) => x * 10);
		expect(mapped.toArray()).toEqual([10, 20, 30, 40]);
	});

	it('drops middle in result', () => {
		const ctx = makeContext<number>(2);
		const t = treeBuilder(ctx, [1, 2], [3, 4]);
		const mapped = t.buildMap((x: number) => x);
		expect(mapped).toHaveProperty('left');
		expect(mapped.toArray()).toEqual([1, 2, 3, 4]);
	});
});

describe('OuterTreeBuilder.normalized', () => {
	const bits = 2;

	it('empty returns undefined', () => {
		const ctx = makeContext<number>(bits);
		const t = ctx.outerTreeBuilder(ob(ctx, []), ob(ctx, []), undefined, 0);
		expect(t.normalized()).toBeUndefined();
	});

	it('collapses to single block when total children fit in one block', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [1], [2, 3]);
		const result = t.normalized();
		expect(result).toBeDefined();
		expect(result!.build().toArray()).toEqual([1, 2, 3]);
	});

	it('keeps tree when children exceed maxBlockSize', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [1, 2, 3], [4, 5]);
		const result = t.normalized();
		expect(result).toBeDefined();
		expect(result!.build().toArray()).toEqual([1, 2, 3, 4, 5]);
	});

	it('keeps tree when middle exists', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [1, 2, 3, 4], [5, 6, 7, 8]);
		t.append(9); // creates middle
		const result = t.normalized();
		expect(result).toBe(t as any);
	});
});

describe('OuterTreeBuilder.mixed-prepend-append', () => {
	const bits = 2;

	it('alternating order produces correct result', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [3], [5]);
		t.prepend(1);
		t.append(7);
		t.prepend(0);
		t.append(9);
		expect(t.build().toArray()).toEqual([0, 1, 3, 5, 7, 9]);
	});

	it('large alternating sequence', () => {
		const ctx = makeContext<number>(bits);
		const t = treeBuilder(ctx, [5], [6]);
		for (let i = 4; i >= 0; i--) {
			t.prepend(i);
		}
		for (let i = 7; i <= 12; i++) {
			t.append(i);
		}
		expect(t.build().toArray()).toEqual([
			0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
		]);
	});
});

describe('OuterTreeBuilder.edge-cases', () => {
	const bits = 2;

	describe('deep tree building', () => {
		it('50 appends with small block size', () => {
			const ctx = makeContext<number>(bits);
			const t = treeBuilder(ctx, [0], [1]);
			for (let i = 2; i < 50; i++) {
				t.append(i);
			}
			expect(t.size).toBe(50);
			const list = t.build();
			expect(list.toArray()).toEqual(Array.from({ length: 50 }, (_, i) => i));
		});

		it('50 prepends with small block size', () => {
			const ctx = makeContext<number>(bits);
			const t = treeBuilder(ctx, [47], [48, 49]);
			for (let i = 46; i >= 0; i--) {
				t.prepend(i);
			}
			expect(t.size).toBe(50);
			const list = t.build();
			expect(list.toArray()).toEqual(Array.from({ length: 50 }, (_, i) => i));
		});
	});

	describe('via List.builder', () => {
		it('List.builder normalizes through OuterTreeBuilder', () => {
			const b = List.builder<number>();
			for (let i = 0; i < 20; i++) {
				b.append(i);
			}
			const list = b.build();
			expect(list.toArray()).toEqual(Array.from({ length: 20 }, (_, i) => i));
			expect(list.at(0)).toBe(0);
			expect(list.at(19)).toBe(19);
		});

		it('List.builder prepend order is correct', () => {
			const b = List.builder<number>();
			b.prepend(3);
			b.prepend(2);
			b.prepend(1);
			b.append(4);
			b.append(5);
			const list = b.build();
			expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);
		});
	});

	describe('null / undefined elements', () => {
		it('null elements', () => {
			const ctx = makeContext<number | null>(bits);
			const t = treeBuilder(ctx, [1], [null, 3]);
			t.append(null);
			expect(t.at(1)).toBeNull();
			expect(t.build().toArray()).toEqual([1, null, 3, null]);
		});

		it('undefined elements', () => {
			const ctx = makeContext<number | undefined>(bits);
			const t = treeBuilder(ctx, [1], [undefined, 3]);
			expect(t.at(1)).toBeUndefined();
			expect(t.build().toArray()).toEqual([1, undefined, 3]);
		});
	});

	describe('get returns elements correctly after mutation', () => {
		it('get works after multiple prepends', () => {
			const ctx = makeContext<number>(bits);
			const t = treeBuilder(ctx, [4], [6]);
			t.prepend(2);
			t.append(8);
			t.prepend(0);
			expect(t.get(0)).toBe(0);
			expect(t.get(1)).toBe(2);
			expect(t.get(2)).toBe(4);
			expect(t.get(3)).toBe(6);
			expect(t.get(4)).toBe(8);
		});
	});
});
