import { describe, expect, it } from 'bun:test';

import type { Int } from '@rimbu/base';

import type { ListContext } from '#list/context';
import type { ListBuilder } from '#list/mutable/builder';
import type { InnerBlockBuilder } from '#list/mutable/inner-block-builder';
import type { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

import { List } from '@rimbu/list';

type OB = OuterBlockBuilder<number>;
type IB = InnerBlockBuilder<number, OB>;

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

function ibFromSource(ctx: ListContext, vals: number[], groupSize = 2): IB {
	const groups: number[][] = [];
	for (let i = 0; i < vals.length; i += groupSize) {
		groups.push(vals.slice(i, i + groupSize));
	}
	const children = groups.map((g) =>
		ctx.outerBlockLeftRight(ctx.childrenOps.of(g)),
	);
	const size = children.reduce((s, c) => s + c.size, 0);
	const source = ctx.innerBlock(children as any, size, 1);
	return ctx.innerBlockBuilderSource<number, OB>(source as any);
}

function collectForEach(b: {
	forEach(f: (v: number) => void): void;
}): number[] {
	const result: number[] = [];
	b.forEach((v) => result.push(v));
	return result;
}

type IB2 = InnerBlockBuilder<number, IB>;

function ib2(ctx: ListContext, children: IB[], level = 2): IB2 {
	const size = children.reduce((s, c) => s + c.size, 0);
	return ctx.innerBlockBuilder(children, size, level);
}

function verifyImmutableList(list: unknown): string[] {
	return (
		list as { _verifyStructure(errors?: string[]): string[] }
	)._verifyStructure();
}

function checkBuilder(
	b: {
		_verifyStructure(errors?: string[]): string[];
		size: number;
		get(index: Int.AtLeastZero): number;
		forEach(f: (element: number) => void): void;
		build(): {
			toArray(): number[];
			_verifyStructure(errors?: string[]): string[];
		};
	},
	expected: number[],
	label: string,
): void {
	const errors = b._verifyStructure();
	expect(errors, `${label}: verify`).toEqual([]);
	expect(b.size, `${label}: size`).toBe(expected.length);
	expect(collectForEach(b), `${label}: forEach`).toEqual(expected);
	for (let i = 0; i < expected.length; i++) {
		expect(b.get(i as Int.AtLeastZero), `${label}: get(${i})`).toBe(
			expected[i],
		);
	}
	const built = b.build();
	expect(built.toArray(), `${label}: build`).toEqual(expected);
	expect(verifyImmutableList(built), `${label}: built immutable`).toEqual([]);
}

describe('InnerBlockBuilder.properties', () => {
	const ctx = makeContext(3); // max=8, min=4

	it('size equals sum of child sizes', () => {
		const b = ib(ctx, [ob(ctx, [1, 2, 3]), ob(ctx, [4, 5])]);
		expect(b.size).toBe(5);
	});

	it('nrChildren equals child count', () => {
		const b = ib(ctx, [ob(ctx, [1]), ob(ctx, [2]), ob(ctx, [3])]);
		expect(b.nrChildren).toBe(3);
	});

	it('level is preserved', () => {
		const b = ib(ctx, [ob(ctx, [1])], 5);
		expect(b.level).toBe(5);
	});

	describe('canAddChild', () => {
		it('true below maxBlockSize', () => {
			const b = ib(ctx, [ob(ctx, [1]), ob(ctx, [2])]);
			expect(b.canAddChild).toBe(true);
		});

		it('false at maxBlockSize', () => {
			const children = Array.from({ length: 8 }, () => ob(ctx, [1]));
			const b = ib(ctx, children);
			expect(b.canAddChild).toBe(false);
		});
	});

	describe('canRemoveChild', () => {
		it('true above minBlockSize', () => {
			const children = Array.from({ length: 5 }, () => ob(ctx, [1]));
			const b = ib(ctx, children);
			expect(b.canRemoveChild).toBe(true);
		});

		it('false at minBlockSize', () => {
			const children = Array.from({ length: 4 }, () => ob(ctx, [1]));
			const b = ib(ctx, children);
			expect(b.canRemoveChild).toBe(false);
		});
	});
});

describe('InnerBlockBuilder.from-source', () => {
	it('size matches source', () => {
		const ctx = makeContext(3);
		const b = ibFromSource(ctx, [1, 2, 3, 4]);
		expect(b.size).toBe(4);
	});

	it('get reads from source', () => {
		const ctx = makeContext(3);
		const b = ibFromSource(ctx, [10, 20, 30, 40], 2);
		expect(b.get(0 as Int.AtLeastZero)).toBe(10);
		expect(b.get(3 as Int.AtLeastZero)).toBe(40);
	});

	it('forEach reads from source', () => {
		const ctx = makeContext(3);
		const b = ibFromSource(ctx, [1, 2, 3, 4], 2);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
	});

	it('source is discarded on mutation', () => {
		const ctx = makeContext(3);
		const b = ibFromSource(ctx, [10, 20, 30, 40], 2);
		b.prependChild(ob(ctx, [0]));
		expect(b.get(0 as Int.AtLeastZero)).toBe(0);
	});
});

describe('InnerBlockBuilder.read', () => {
	const ctx = makeContext(4); // max=16, min=8

	describe('get', () => {
		it('from first child', () => {
			const b = ib(ctx, [ob(ctx, [10, 20, 30]), ob(ctx, [40, 50])]);
			expect(b.get(0 as Int.AtLeastZero)).toBe(10);
			expect(b.get(1 as Int.AtLeastZero)).toBe(20);
			expect(b.get(2 as Int.AtLeastZero)).toBe(30);
		});

		it('from middle child', () => {
			const b = ib(ctx, [ob(ctx, [10]), ob(ctx, [20, 30, 40]), ob(ctx, [50])]);
			expect(b.get(1 as Int.AtLeastZero)).toBe(20);
			expect(b.get(3 as Int.AtLeastZero)).toBe(40);
			expect(b.get(4 as Int.AtLeastZero)).toBe(50);
		});

		it('from last child', () => {
			const b = ib(ctx, [ob(ctx, [10, 20]), ob(ctx, [30, 40])]);
			expect(b.get(2 as Int.AtLeastZero)).toBe(30);
			expect(b.get(3 as Int.AtLeastZero)).toBe(40);
		});

		it('across many children', () => {
			const children = Array.from({ length: 12 }, (_, i) =>
				ob(ctx, [i * 3, i * 3 + 1]),
			);
			const b = ib(ctx, children);
			expect(b.get(0 as Int.AtLeastZero)).toBe(0);
			expect(b.get(1 as Int.AtLeastZero)).toBe(1);
			expect(b.get(2 as Int.AtLeastZero)).toBe(3);
			expect(b.get(22 as Int.AtLeastZero)).toBe(33);
			expect(b.get(23 as Int.AtLeastZero)).toBe(34);
		});
	});

	describe('forEach', () => {
		it('iterates all children in order', () => {
			const b = ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3]), ob(ctx, [4, 5])]);
			expect(collectForEach(b)).toEqual([1, 2, 3, 4, 5]);
		});
	});
});

describe('InnerBlockBuilder.prependChild / appendChild', () => {
	const ctx = makeContext(4);

	it('prependChild adds child at front', () => {
		const b = ib(ctx, [ob(ctx, [2, 3])]);
		b.prependChild(ob(ctx, [0, 1]));
		expect(b.nrChildren).toBe(2);
		expect(b.size).toBe(4);
		expect(collectForEach(b)).toEqual([0, 1, 2, 3]);
	});

	it('appendChild adds child at back', () => {
		const b = ib(ctx, [ob(ctx, [1, 2])]);
		b.appendChild(ob(ctx, [3, 4]));
		expect(b.nrChildren).toBe(2);
		expect(b.size).toBe(4);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
	});

	it('mix prepend and append', () => {
		const b = ib(ctx, [ob(ctx, [3])]);
		b.prependChild(ob(ctx, [1]));
		b.appendChild(ob(ctx, [5]));
		b.prependChild(ob(ctx, [0]));
		expect(collectForEach(b)).toEqual([0, 1, 3, 5]);
	});
});

describe('InnerBlockBuilder.firstChild / lastChild', () => {
	const ctx = makeContext(4);

	it('firstChild returns first child', () => {
		const b = ib(ctx, [ob(ctx, [10, 20]), ob(ctx, [30])]);
		expect(b.firstChild().get(0 as Int.AtLeastZero)).toBe(10);
	});

	it('lastChild returns last child', () => {
		const b = ib(ctx, [ob(ctx, [10]), ob(ctx, [20, 30])]);
		expect(b.lastChild().get(1 as Int.AtLeastZero)).toBe(30);
	});
});

describe('InnerBlockBuilder.dropFirstChild / dropLastChild', () => {
	const ctx = makeContext(4);

	it('dropFirstChild removes and returns first', () => {
		const b = ib(ctx, [ob(ctx, [10, 20]), ob(ctx, [30]), ob(ctx, [40])]);
		const child = b.dropFirstChild();
		expect(child.get(0 as Int.AtLeastZero)).toBe(10);
		expect(b.size).toBe(2);
		expect(b.nrChildren).toBe(2);
		expect(collectForEach(b)).toEqual([30, 40]);
	});

	it('dropLastChild removes and returns last', () => {
		const b = ib(ctx, [ob(ctx, [10]), ob(ctx, [20]), ob(ctx, [30, 40])]);
		const child = b.dropLastChild();
		expect(child.get(1 as Int.AtLeastZero)).toBe(40);
		expect(b.size).toBe(2);
		expect(collectForEach(b)).toEqual([10, 20]);
	});
});

describe('InnerBlockBuilder.modifyFirstChild / modifyLastChild', () => {
	const ctx = makeContext(4);

	it('modifyFirstChild applies callback and returns delta', () => {
		const b = ib(ctx, [ob(ctx, [1]), ob(ctx, [2, 3])]);
		const delta = b.modifyFirstChild((child) => {
			child.append(10);
			return 1;
		});
		expect(delta).toBe(1);
		expect(b.size).toBe(4);
		expect(collectForEach(b)).toEqual([1, 10, 2, 3]);
	});

	it('modifyFirstChild with no delta returns undefined', () => {
		const b = ib(ctx, [ob(ctx, [1]), ob(ctx, [2])]);
		const delta = b.modifyFirstChild(() => undefined);
		expect(delta).toBeUndefined();
		expect(b.size).toBe(2);
	});

	it('modifyLastChild applies callback and returns delta', () => {
		const b = ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3])]);
		const delta = b.modifyLastChild((child) => {
			child.append(4);
			return 1;
		});
		expect(delta).toBe(1);
		expect(b.size).toBe(4);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
	});

	it('modifyLastChild with no delta returns undefined', () => {
		const b = ib(ctx, [ob(ctx, [1]), ob(ctx, [2])]);
		const delta = b.modifyLastChild(() => undefined);
		expect(delta).toBeUndefined();
	});
});

describe('InnerBlockBuilder.build', () => {
	const ctx = makeContext(3);

	it('returns immutable inner block', () => {
		const b = ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3])]);
		const result = b.build();
		expect(result.size).toBe(3);
		expect(result.toArray()).toEqual([1, 2, 3]);
	});

	it('build from source', () => {
		const b = ibFromSource(ctx, [10, 20, 30, 40], 2);
		const result = b.build();
		expect(result.toArray()).toEqual([10, 20, 30, 40]);
	});

	it('build after mutation', () => {
		const b = ib(ctx, [ob(ctx, [1])]);
		b.appendChild(ob(ctx, [2, 3]));
		const result = b.build();
		expect(result.toArray()).toEqual([1, 2, 3]);
	});
});

describe('InnerBlockBuilder.buildMap', () => {
	const ctx = makeContext(3);

	it('transforms elements', () => {
		const b = ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3])]);
		const mapped = b.buildMap((x: number) => x * 10);
		expect(mapped.toArray()).toEqual([10, 20, 30]);
	});

	it('buildMap from source', () => {
		const b = ibFromSource(ctx, [1, 2, 3, 4], 2);
		const mapped = b.buildMap((x: number) => x * 10);
		expect(mapped.toArray()).toEqual([10, 20, 30, 40]);
	});
});

describe('InnerBlockBuilder.normalized', () => {
	const ctx = makeContext(2); // max=4, min=2

	it('empty returns undefined', () => {
		const b = ib(ctx, []);
		expect(b.normalized()).toBeUndefined();
	});

	it('within max returns self', () => {
		const b = ib(ctx, [ob(ctx, [1]), ob(ctx, [2])]);
		expect(b.normalized()).toBe(b as any);
	});

	it('overflow returns InnerTreeBuilder', () => {
		const children = Array.from({ length: 5 }, (_, i) => ob(ctx, [i]));
		const b = ib(ctx, children);
		const result = b.normalized();
		expect(result).not.toBe(b as any);
		expect(result).toBeDefined();
		expect(result!.build().toArray()).toEqual([0, 1, 2, 3, 4]);
	});

	it('normalized tree can accept children', () => {
		const children = Array.from({ length: 5 }, (_, i) => ob(ctx, [i]));
		const b = ib(ctx, children);
		const tree = b.normalized()!;
		tree.appendChild(ob(ctx, [5]));
		expect(tree.build().toArray()).toEqual([0, 1, 2, 3, 4, 5]);
	});
});

describe('InnerBlockBuilder.splitRight', () => {
	const ctx = makeContext(4);

	it('splits at midpoint', () => {
		const b = ib(ctx, [ob(ctx, [1]), ob(ctx, [2]), ob(ctx, [3]), ob(ctx, [4])]);
		const right = b.splitRight();
		expect(b.nrChildren).toBe(2);
		expect(right.nrChildren).toBe(2);
	});

	it('elements are partitioned correctly', () => {
		const b = ib(ctx, [
			ob(ctx, [10]),
			ob(ctx, [20, 30]),
			ob(ctx, [40]),
			ob(ctx, [50]),
		]);
		const right = b.splitRight();
		expect(collectForEach(b)).toEqual([10, 20, 30]);
		expect(collectForEach(right)).toEqual([40, 50]);
	});

	it('split at custom index', () => {
		const b = ib(ctx, [ob(ctx, [1]), ob(ctx, [2]), ob(ctx, [3])]);
		const right = b.splitRight(1);
		expect(b.nrChildren).toBe(1);
		expect(right.nrChildren).toBe(2);
	});

	it('split at 0 moves all children to right', () => {
		const b = ib(ctx, [ob(ctx, [1]), ob(ctx, [2])]);
		const right = b.splitRight(0);
		expect(b.nrChildren).toBe(0);
		expect(right.nrChildren).toBe(2);
	});
});

describe('InnerBlockBuilder.prependItems', () => {
	const ctx = makeContext(3);

	it('prepends children from other builder', () => {
		const b = ib(ctx, [ob(ctx, [3, 4])]);
		const other = ib(ctx, [ob(ctx, [1, 2])]);
		b.prependFrom(other);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
		expect(b.size).toBe(4);
	});

	it('prependItems to empty', () => {
		const b = ib(ctx, []);
		b.prependFrom(ib(ctx, [ob(ctx, [1]), ob(ctx, [2])]));
		expect(collectForEach(b)).toEqual([1, 2]);
	});

	it('prependItems from empty', () => {
		const b = ib(ctx, [ob(ctx, [1, 2])]);
		b.prependFrom(ib(ctx, []));
		expect(collectForEach(b)).toEqual([1, 2]);
	});

	it('merges boundary children when fit', () => {
		const ctx2 = makeContext(2); // max=4
		const b = ib(ctx2, [ob(ctx2, [3])]); // one child with 1 elem
		const other = ib(ctx2, [ob(ctx2, [1, 2])]);

		b.prependFrom(other);

		expect(b.nrChildren).toBe(1); // merged into one
		expect(collectForEach(b)).toEqual([1, 2, 3]);
	});

	it('does not merge when boundary exceeds max', () => {
		const ctx2 = makeContext(2); // max=4
		const b = ib(ctx2, [ob(ctx2, [1, 2, 3])]); // 3 elements (nrChildren=3)
		const other = ib(ctx2, [ob(ctx2, [10, 20, 30])]); // 3 elements
		b.prependFrom(other);

		expect(b.nrChildren).toBeGreaterThan(1); // NOT merged
		expect(collectForEach(b)).toEqual([10, 20, 30, 1, 2, 3]);
	});
});

describe('InnerBlockBuilder.appendItems', () => {
	const ctx = makeContext(3);

	it('appends children from other builder', () => {
		const b = ib(ctx, [ob(ctx, [1, 2])]);
		const other = ib(ctx, [ob(ctx, [3, 4])]);
		b.appendFrom(other);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
	});

	it('appendItems to empty', () => {
		const b = ib(ctx, []);
		b.appendFrom(ib(ctx, [ob(ctx, [1]), ob(ctx, [2])]));
		expect(collectForEach(b)).toEqual([1, 2]);
	});

	it('merges boundary children when fit', () => {
		const ctx2 = makeContext(2); // max=4
		const b = ib(ctx2, [ob(ctx2, [1, 2])]);
		const other = ib(ctx2, [ob(ctx2, [3])]);

		b.appendFrom(other);

		expect(b.nrChildren).toBe(1); // merged
		expect(collectForEach(b)).toEqual([1, 2, 3]);
	});
});

describe('InnerBlockBuilder.edge-cases', () => {
	const ctx = makeContext(2);

	describe('source unaffected after mutation', () => {
		it('source block not mutated', () => {
			const sourceBlock = ctx.outerBlockLeftRight(ctx.childrenOps.of([10, 20]));
			const immutableIB = ctx.innerBlock([sourceBlock], 2, 1);
			const b = ctx.innerBlockBuilderSource(immutableIB);
			b.appendChild(ob(ctx, [30]));
			expect(sourceBlock.toArray()).toEqual([10, 20]);
		});
	});

	describe('capacity boundaries', () => {
		it('exactly at max children', () => {
			const children = Array.from({ length: 4 }, (_, i) => ob(ctx, [i]));
			const b = ib(ctx, children);
			expect(b.canAddChild).toBe(false);
			expect(b.notTooManyChildren).toBe(true);
		});

		it('exactly at min children', () => {
			const children = Array.from({ length: 2 }, (_, i) => ob(ctx, [i]));
			const b = ib(ctx, children);
			expect(b.canRemoveChild).toBe(false);
			expect(b.hasEnoughChildren).toBe(true);
		});
	});

	describe('large structure', () => {
		it('many children', () => {
			const children = Array.from({ length: 15 }, (_, i) =>
				ob(ctx, [i * 2, i * 2 + 1]),
			);
			const b = ib(ctx, children);
			expect(b.nrChildren).toBe(15);
			expect(b.size).toBe(30);
			let count = 0;
			b.forEach(() => count++);
			expect(count).toBe(30);
		});
	});
});

describe('InnerBlockBuilder.insert', () => {
	const ctx = makeContext(2); // max=4, min=2

	it('insert at index 0 (start of block)', () => {
		const b = ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3, 4])]);
		b.insert(0 as Int.AtLeastZero, 99);
		checkBuilder(b, [99, 1, 2, 3, 4], 'insert at 0');
	});

	it('insert at last position (index size - 1)', () => {
		const b = ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3, 4])]);
		b.insert(3 as Int.AtLeastZero, 99);
		checkBuilder(b, [1, 2, 3, 99, 4], 'insert at size-1');
	});

	it('insert exactly at a child boundary (inChildIndex 0)', () => {
		const b = ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3, 4])]);
		b.insert(2 as Int.AtLeastZero, 99);
		checkBuilder(b, [1, 2, 99, 3, 4], 'insert at child boundary');
	});

	it('insert making a child exactly max (no overflow yet)', () => {
		const b = ib(ctx, [ob(ctx, [1, 2, 3, 4]), ob(ctx, [5, 6, 7])]);
		b.insert(6 as Int.AtLeastZero, 99);
		checkBuilder(b, [1, 2, 3, 4, 5, 6, 99, 7], 'child at max');
	});

	it('insert into full child with full neighbors splits child', () => {
		const b = ib(ctx, [ob(ctx, [1, 2, 3, 4]), ob(ctx, [5, 6, 7, 8])]);
		b.insert(4 as Int.AtLeastZero, 99);
		checkBuilder(b, [1, 2, 3, 4, 99, 5, 6, 7, 8], 'split');
	});

	it('insert making the block overfull, then normalized produces a valid tree', () => {
		const b = ib(ctx, [
			ob(ctx, [1, 2, 3, 4]),
			ob(ctx, [5, 6, 7, 8]),
			ob(ctx, [9, 10, 11, 12]),
			ob(ctx, [13, 14, 15, 16]),
		]);
		b.insert(1 as Int.AtLeastZero, 99);
		expect(b.nrChildren).toBe(5);
		const tree = b.normalized()!;
		expect(tree.size).toBe(17);
		expect(tree._verifyStructure()).toEqual([]);
		const built = tree.build();
		expect(built.toArray()).toEqual([
			1, 99, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
		]);
		expect(verifyImmutableList(built)).toEqual([]);
	});

	it('insert overflow shifts first child to left neighbor (shift-left)', () => {
		const b = ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3, 4, 5, 6])]);
		b.insert(4 as Int.AtLeastZero, 99);
		checkBuilder(b, [1, 2, 3, 4, 99, 5, 6], 'shift-left');
	});

	it('insert overflow shifts last child to right neighbor (shift-right)', () => {
		const b = ib(ctx, [ob(ctx, [1, 2, 3, 4]), ob(ctx, [5, 6])]);
		b.insert(2 as Int.AtLeastZero, 99);
		checkBuilder(b, [1, 2, 99, 3, 4, 5, 6], 'shift-right');
	});

	it('insert overflow shifts to left neighbor that becomes full', () => {
		const b = ib(ctx, [ob(ctx, [1, 2, 3]), ob(ctx, [4, 5, 6, 7])]);
		b.insert(6 as Int.AtLeastZero, 99);
		checkBuilder(b, [1, 2, 3, 4, 5, 6, 99, 7], 'shift-left to full');
	});

	it('insert into single-child block (no siblings to shift to)', () => {
		const b = ib(ctx, [ob(ctx, [1, 2, 3, 4])]);
		b.insert(0 as Int.AtLeastZero, 99);
		checkBuilder(b, [99, 1, 2, 3, 4], 'single child at 0');
		b.insert(2 as Int.AtLeastZero, 98);
		checkBuilder(b, [99, 1, 98, 2, 3, 4], 'single child middle');
	});

	it('insert at index == size appends at the end', () => {
		const b = ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3, 4])]);
		expect(() => b.insert(4 as Int.AtLeastZero, 99)).not.toThrow();
		checkBuilder(b, [1, 2, 3, 4, 99], 'append at end');
	});

	it('repeated inserts keep structure and content consistent', () => {
		const b = ib(ctx, [ob(ctx, [10, 20, 30, 40]), ob(ctx, [50, 60, 70, 80])]);
		b.insert(2 as Int.AtLeastZero, 15);
		b.insert(0 as Int.AtLeastZero, 5);
		b.insert(6 as Int.AtLeastZero, 35);
		checkBuilder(b, [5, 10, 20, 15, 30, 40, 35, 50, 60, 70, 80], 'repeated');
	});
});

describe('InnerBlockBuilder.remove', () => {
	const ctx = makeContext(2); // max=4, min=2

	it('remove first element (index 0) returns it', () => {
		const b = ib(ctx, [ob(ctx, [1, 2, 3, 4]), ob(ctx, [5, 6])]);
		expect(b.remove(0 as Int.AtLeastZero)).toBe(1);
		checkBuilder(b, [2, 3, 4, 5, 6], 'remove at 0');
	});

	it('remove last element (index size - 1) returns it', () => {
		const b = ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3, 4, 5, 6])]);
		expect(b.remove(5 as Int.AtLeastZero)).toBe(6);
		checkBuilder(b, [1, 2, 3, 4, 5], 'remove last');
	});

	it('remove at child boundary (inChildIndex 0 of later child)', () => {
		const b = ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3, 4])]);
		expect(b.remove(2 as Int.AtLeastZero)).toBe(3);
		checkBuilder(b, [1, 2, 4], 'remove at boundary');
	});

	it('remove keeping child above min (no rebalance needed)', () => {
		const b = ib(ctx, [ob(ctx, [1, 2, 3, 4, 5]), ob(ctx, [6, 7])]);
		expect(b.remove(1 as Int.AtLeastZero)).toBe(2);
		checkBuilder(b, [1, 3, 4, 5, 6, 7], 'above min');
	});

	it('remove making child underfull merges into left neighbor', () => {
		const b = ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3, 4])]);
		expect(b.remove(2 as Int.AtLeastZero)).toBe(3);
		expect(b.nrChildren).toBe(1);
		checkBuilder(b, [1, 2, 4], 'merge-left');
	});

	it('remove making child underfull merges into right neighbor', () => {
		const b = ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3, 4])]);
		expect(b.remove(0 as Int.AtLeastZero)).toBe(1);
		expect(b.nrChildren).toBe(1);
		checkBuilder(b, [2, 3, 4], 'merge-right');
	});

	it('remove making child min when merges would overflow (no-op)', () => {
		const b = ib(ctx, [ob(ctx, [1, 2, 3]), ob(ctx, [4, 5, 6])]);
		expect(b.remove(4 as Int.AtLeastZero)).toBe(5);
		checkBuilder(b, [1, 2, 3, 4, 6], 'has-enough');
	});

	it('remove making child underfull rebalances with left neighbor', () => {
		const b = ib(ctx, [ob(ctx, [1, 2, 3, 4]), ob(ctx, [5, 6])]);
		expect(b.remove(5 as Int.AtLeastZero)).toBe(6);
		checkBuilder(b, [1, 2, 3, 4, 5], 'rebalance-left');
	});

	it('remove making child underfull rebalances with right neighbor', () => {
		const b = ib(ctx, [ob(ctx, [5, 6]), ob(ctx, [1, 2, 3, 4])]);
		expect(b.remove(0 as Int.AtLeastZero)).toBe(5);
		checkBuilder(b, [6, 1, 2, 3, 4], 'rebalance-right');
	});

	it('remove from single-child block (no siblings to rebalance with)', () => {
		const b = ib(ctx, [ob(ctx, [1, 2])]);
		expect(b.remove(0 as Int.AtLeastZero)).toBe(1);
		expect(b.size).toBe(1);
		expect(collectForEach(b)).toEqual([2]);
		expect(b.get(0 as Int.AtLeastZero)).toBe(2);
		expect(b.build().toArray()).toEqual([2]);
	});

	it('remove all elements leaves an empty block', () => {
		const b = ib(ctx, [ob(ctx, [1, 2, 3, 4])]);
		for (let i = 0; i < 4; i++) {
			b.remove(0 as Int.AtLeastZero);
		}
		expect(b.size).toBe(0);
		expect(collectForEach(b)).toEqual([]);
		expect(b.build().toArray()).toEqual([]);
	});

	it('repeated removes keep structure and content consistent', () => {
		const b = ib(ctx, [
			ob(ctx, [1, 2, 3]),
			ob(ctx, [4, 5, 6]),
			ob(ctx, [7, 8]),
		]);
		expect(b.remove(0 as Int.AtLeastZero)).toBe(1);
		expect(b.remove(4 as Int.AtLeastZero)).toBe(6);
		expect(b.remove(2 as Int.AtLeastZero)).toBe(4);
		checkBuilder(b, [2, 3, 5, 7, 8], 'repeated removes');
	});
});

describe('InnerBlockBuilder.insert/remove.level-2', () => {
	const ctx = makeContext(2); // max=4, min=2

	function cachedLevel1(groups: number[][]): IB {
		const children = groups.map((g) =>
			ctx.outerBlockLeftRight(ctx.childrenOps.of(g)),
		);
		const size = children.reduce((s, c) => s + c.size, 0);
		const source = ctx.innerBlock(children as any, size, 1);
		source._get(0 as Int.AtLeastZero); // cache the size table
		return ctx.innerBlockBuilderSource<number, OB>(source as any);
	}

	it('level-2 insert at various positions keeps tables consistent', () => {
		const b = ib2(ctx, [
			ib(ctx, [ob(ctx, [1, 2]), ob(ctx, [3, 4])]),
			ib(ctx, [ob(ctx, [5, 6]), ob(ctx, [7, 8])]),
		]);
		b.insert(2 as Int.AtLeastZero, 99);
		checkBuilder(b, [1, 2, 99, 3, 4, 5, 6, 7, 8], 'level2 middle');
		b.insert(0 as Int.AtLeastZero, 0);
		checkBuilder(b, [0, 1, 2, 99, 3, 4, 5, 6, 7, 8], 'level2 at 0');
		b.insert(9 as Int.AtLeastZero, 9);
		checkBuilder(b, [0, 1, 2, 99, 3, 4, 5, 6, 7, 9, 8], 'level2 at size-1');
	});

	it('level-2 insert: overflow inside a child keeps tables consistent', () => {
		const a = ib(ctx, [ob(ctx, [1, 2, 3, 4]), ob(ctx, [5, 6])]);
		const b = ib2(ctx, [a, ib(ctx, [ob(ctx, [7, 8]), ob(ctx, [9, 10])])]);
		b.insert(1 as Int.AtLeastZero, 99);
		checkBuilder(
			b,
			[1, 99, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			'level2 overflow in child',
		);
	});

	it('remove merging a level-1 child into its sibling keeps tables consistent', () => {
		const a = cachedLevel1([
			[1, 2, 3, 4],
			[5, 6],
			[7, 8],
		]);
		const b = cachedLevel1([[9, 10]]);
		const outer = ctx.innerBlockBuilder<number, IB>([a, b], 10, 2);
		expect(outer.remove(9 as Int.AtLeastZero)).toBe(10);
		checkBuilder(outer, [1, 2, 3, 4, 5, 6, 7, 8, 9], 'level2 merge');
	});

	it('remove rebalancing a level-1 child does not throw', () => {
		const a = cachedLevel1([[1, 2]]);
		const b = cachedLevel1([
			[3, 4],
			[5, 6],
			[7, 8],
			[9, 10],
		]);
		const outer = ctx.innerBlockBuilder<number, IB>([a, b], 10, 2);
		expect(() => outer.remove(0 as Int.AtLeastZero)).not.toThrow();
		checkBuilder(outer, [2, 3, 4, 5, 6, 7, 8, 9, 10], 'level2 rebalance');
	});
});

describe('InnerBlockBuilder.splitRight.size-accounting', () => {
	const ctx = makeContext(2); // max=4, min=2

	function cachedLevel1(groups: number[][]): IB {
		const children = groups.map((g) =>
			ctx.outerBlockLeftRight(ctx.childrenOps.of(g)),
		);
		const size = children.reduce((s, c) => s + c.size, 0);
		const source = ctx.innerBlock(children as any, size, 1);
		source._get(0 as Int.AtLeastZero); // cache the size table
		return ctx.innerBlockBuilderSource<number, OB>(source as any);
	}

	it('splitRight keeps correct sizes for both halves (cached table)', () => {
		const b = cachedLevel1([
			[1, 2, 3, 4],
			[5, 6, 7, 8],
			[9, 10],
		]);
		const right = b.splitRight(2);
		expect(b.size).toBe(8);
		expect(right.size).toBe(2);
		expect(b._verifyStructure()).toEqual([]);
		expect(right._verifyStructure()).toEqual([]);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
		expect(collectForEach(right)).toEqual([9, 10]);
	});

	it('splitRight at midpoint keeps correct sizes (cached table)', () => {
		const b = cachedLevel1([
			[1, 2],
			[3, 4],
			[5, 6],
			[7, 8],
		]);
		const right = b.splitRight();
		expect(b.size).toBe(4);
		expect(right.size).toBe(4);
		expect(b._verifyStructure()).toEqual([]);
		expect(right._verifyStructure()).toEqual([]);
	});

	it('splitRight with negative index (rebalance pattern) keeps correct sizes', () => {
		const b = cachedLevel1([
			[1, 2],
			[3, 4],
			[5, 6],
			[7, 8],
		]);
		const moved = b.splitRight(-2);
		expect(b.size).toBe(4);
		expect(moved.size).toBe(4);
		expect(b._verifyStructure()).toEqual([]);
		expect(moved._verifyStructure()).toEqual([]);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
		expect(collectForEach(moved)).toEqual([5, 6, 7, 8]);
	});

	it('normalized() creates a tree with correct half sizes', () => {
		const b = cachedLevel1([
			[1, 2, 3, 4],
			[5, 6, 7, 8],
			[9, 10, 11, 12],
			[13, 14, 15, 16],
			[17, 18],
		]);
		const tree = b.normalized()!;
		const t = tree as unknown as {
			left: { size: number };
			right: { size: number };
			_verifyStructure(errors?: string[]): string[];
		};
		expect(tree.size).toBe(18);
		expect(t.left.size).toBe(8);
		expect(t.right.size).toBe(10);
		expect(t._verifyStructure()).toEqual([]);
	});
});

describe('InnerBlockBuilder.insert/remove.ListBuilder-integration', () => {
	const ctx = List.createContext({ blockSizeBits: 2 }) as ListContext;

	function makeBuilder(): ListBuilder<number> {
		return ctx.builder<number>() as ListBuilder<number>;
	}

	it('insertAt sweep on a 64-element list keeps structure valid', () => {
		for (const index of [0, 1, 4, 15, 16, 20, 31, 32, 60, 63]) {
			const builder = makeBuilder();
			builder.appendAll(Array.from({ length: 64 }, (_, i) => i));
			builder.insertAt(index, 99);
			const list = builder.build();
			expect(verifyImmutableList(list), `insertAt(${index})`).toEqual([]);
			expect(list.size, `insertAt(${index}) size`).toBe(65);
			const expected = Array.from({ length: 65 }, (_, i) =>
				i === index ? 99 : i < index ? i : i - 1,
			);
			for (let i = Math.max(0, index - 2); i <= Math.min(64, index + 2); i++) {
				expect(list.at(i), `insertAt(${index}) at(${i})`).toBe(expected[i]);
			}
		}
	});

	it('insertAt splitting a tree block keeps sizes correct', () => {
		const builder = makeBuilder();
		builder.appendAll(Array.from({ length: 64 }, (_, i) => i));
		builder.insertAt(15, 99);
		const list = builder.build();
		expect(verifyImmutableList(list)).toEqual([]);
		expect(list.size).toBe(65);
		expect(list.at(15)).toBe(99);
		expect(list.at(16)).toBe(15);
	});

	it('removeAt sweep on a 64-element list keeps structure valid', () => {
		for (const index of [0, 4, 16, 20, 32, 48, 60, 63]) {
			const builder = makeBuilder();
			builder.appendAll(Array.from({ length: 64 }, (_, i) => i));
			builder.removeAt(index, undefined);
			const list = builder.build();
			expect(verifyImmutableList(list), `removeAt(${index})`).toEqual([]);
			expect(list.size, `removeAt(${index}) size`).toBe(63);
		}
	});

	it('repeated removeAt(0) keeps structure valid', () => {
		const builder = makeBuilder();
		builder.appendAll(Array.from({ length: 64 }, (_, i) => i));
		for (let k = 0; k < 20; k++) {
			builder.removeAt(0, undefined);
			const list = builder.build();
			expect(verifyImmutableList(list), `remove0 x${k + 1}`).toEqual([]);
		}
	});

	it('repeated removeAt(last) keeps structure valid', () => {
		const builder = makeBuilder();
		builder.appendAll(Array.from({ length: 64 }, (_, i) => i));
		for (let k = 0; k < 20; k++) {
			builder.removeAt(builder.size - 1, undefined);
			const list = builder.build();
			expect(verifyImmutableList(list), `removeLast x${k + 1}`).toEqual([]);
		}
	});

	it('alternating insertAt and removeAt keeps structure valid', () => {
		const builder = makeBuilder();
		builder.appendAll(Array.from({ length: 32 }, (_, i) => i));
		builder.insertAt(10, 99);
		builder.removeAt(5, undefined);
		builder.insertAt(20, 98);
		builder.removeAt(30, undefined);
		const list = builder.build();
		expect(verifyImmutableList(list)).toEqual([]);
	});
});
