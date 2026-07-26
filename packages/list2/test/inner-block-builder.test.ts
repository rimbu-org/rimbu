import { describe, expect, it } from 'bun:test';

import type { ListContext } from '#list/context';
import type { InnerBlockBuilder } from '../src/internal/mutable/inner-block-builder';
import type { OuterBlockBuilder } from '../src/internal/mutable/outer-block-builder';

import { List } from '@rimbu/list';

type OB = OuterBlockBuilder<number>;
type IB = InnerBlockBuilder<number, OB>;

function makeContext<T>(blockSizeBits: number): ListContext<T> {
	return List.createContext({ blockSizeBits }) as ListContext<T>;
}

function ob(ctx: ListContext<number>, vals: number[]): OB {
	return ctx.outerBlockBuilder(ctx.childrenOps.of(vals));
}

function ib(
	ctx: ListContext<number>,
	children: OB[],
	level = 1,
): IB {
	const size = children.reduce((s, c) => s + c.size, 0);
	return ctx.innerBlockBuilder(children, size, level);
}

function ibFromSource(ctx: ListContext<number>, vals: number[], groupSize = 2): IB {
	const groups: number[][] = [];
	for (let i = 0; i < vals.length; i += groupSize) {
		groups.push(vals.slice(i, i + groupSize));
	}
	const children = groups.map((g) => ctx.outerBlock(ctx.childrenOps.of(g)));
	const size = children.reduce((s, c) => s + c.size, 0);
	const source = ctx.innerBlock(children as any, size, 1);
	return ctx.innerBlockBuilderSource<number, OB>(source as any);
}

function collectForEach(b: { forEach(f: (v: number) => void): void }): number[] {
	const result: number[] = [];
	b.forEach((v) => result.push(v));
	return result;
}

describe('InnerBlockBuilder.properties', () => {
	const ctx = makeContext<number>(3); // max=8, min=4

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
		const ctx = makeContext<number>(3);
		const b = ibFromSource(ctx, [1, 2, 3, 4]);
		expect(b.size).toBe(4);
	});

	it('get reads from source', () => {
		const ctx = makeContext<number>(3);
		const b = ibFromSource(ctx, [10, 20, 30, 40], 2);
		expect(b.get(0)).toBe(10);
		expect(b.get(3)).toBe(40);
	});

	it('forEach reads from source', () => {
		const ctx = makeContext<number>(3);
		const b = ibFromSource(ctx, [1, 2, 3, 4], 2);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
	});

	it('source is discarded on mutation', () => {
		const ctx = makeContext<number>(3);
		const b = ibFromSource(ctx, [10, 20, 30, 40], 2);
		b.prependChild(ob(ctx, [0]));
		expect(b.get(0)).toBe(0);
	});
});

describe('InnerBlockBuilder.read', () => {
	const ctx = makeContext<number>(4); // max=16, min=8

	describe('get', () => {
		it('from first child', () => {
			const b = ib(ctx, [ob(ctx, [10, 20, 30]), ob(ctx, [40, 50])]);
			expect(b.get(0)).toBe(10);
			expect(b.get(1)).toBe(20);
			expect(b.get(2)).toBe(30);
		});

		it('from middle child', () => {
			const b = ib(ctx, [
				ob(ctx, [10]),
				ob(ctx, [20, 30, 40]),
				ob(ctx, [50]),
			]);
			expect(b.get(1)).toBe(20);
			expect(b.get(3)).toBe(40);
			expect(b.get(4)).toBe(50);
		});

		it('from last child', () => {
			const b = ib(ctx, [ob(ctx, [10, 20]), ob(ctx, [30, 40])]);
			expect(b.get(2)).toBe(30);
			expect(b.get(3)).toBe(40);
		});

		it('across many children', () => {
			const children = Array.from({ length: 12 }, (_, i) => ob(ctx, [i * 3, i * 3 + 1]));
			const b = ib(ctx, children);
			expect(b.get(0)).toBe(0);
			expect(b.get(1)).toBe(1);
			expect(b.get(2)).toBe(3);
			expect(b.get(22)).toBe(33);
			expect(b.get(23)).toBe(34);
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
	const ctx = makeContext<number>(4);

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
	const ctx = makeContext<number>(4);

	it('firstChild returns first child', () => {
		const b = ib(ctx, [ob(ctx, [10, 20]), ob(ctx, [30])]);
		expect(b.firstChild().get(0)).toBe(10);
	});

	it('lastChild returns last child', () => {
		const b = ib(ctx, [ob(ctx, [10]), ob(ctx, [20, 30])]);
		expect(b.lastChild().get(1)).toBe(30);
	});
});

describe('InnerBlockBuilder.dropFirstChild / dropLastChild', () => {
	const ctx = makeContext<number>(4);

	it('dropFirstChild removes and returns first', () => {
		const b = ib(ctx, [ob(ctx, [10, 20]), ob(ctx, [30]), ob(ctx, [40])]);
		const child = b.dropFirstChild();
		expect(child.get(0)).toBe(10);
		expect(b.size).toBe(2);
		expect(b.nrChildren).toBe(2);
		expect(collectForEach(b)).toEqual([30, 40]);
	});

	it('dropLastChild removes and returns last', () => {
		const b = ib(ctx, [ob(ctx, [10]), ob(ctx, [20]), ob(ctx, [30, 40])]);
		const child = b.dropLastChild();
		expect(child.get(1)).toBe(40);
		expect(b.size).toBe(2);
		expect(collectForEach(b)).toEqual([10, 20]);
	});
});

describe('InnerBlockBuilder.modifyFirstChild / modifyLastChild', () => {
	const ctx = makeContext<number>(4);

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
	const ctx = makeContext<number>(3);

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
	const ctx = makeContext<number>(3);

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
	const ctx = makeContext<number>(2); // max=4, min=2

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
	const ctx = makeContext<number>(4);

	it('splits at midpoint', () => {
		const b = ib(ctx, [ob(ctx, [1]), ob(ctx, [2]), ob(ctx, [3]), ob(ctx, [4])]);
		const right = b.splitRight();
		expect(b.nrChildren).toBe(2);
		expect(right.nrChildren).toBe(2);
	});

	it('elements are partitioned correctly', () => {
		const b = ib(ctx, [ob(ctx, [10]), ob(ctx, [20, 30]), ob(ctx, [40]), ob(ctx, [50])]);
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
	const ctx = makeContext<number>(3);

	it('prepends children from other builder', () => {
		const b = ib(ctx, [ob(ctx, [3, 4])]);
		const other = ib(ctx, [ob(ctx, [1, 2])]);
		b.prependItems(other);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
		expect(b.size).toBe(4);
	});

	it('prependItems to empty', () => {
		const b = ib(ctx, []);
		b.prependItems(ib(ctx, [ob(ctx, [1]), ob(ctx, [2])]));
		expect(collectForEach(b)).toEqual([1, 2]);
	});

	it('prependItems from empty', () => {
		const b = ib(ctx, [ob(ctx, [1, 2])]);
		b.prependItems(ib(ctx, []));
		expect(collectForEach(b)).toEqual([1, 2]);
	});

	it('merges boundary children when fit', () => {
		const ctx2 = makeContext<number>(2); // max=4
		const b = ib(ctx2, [ob(ctx2, [3])]); // one child with 1 elem
		const other = ib(ctx2, [ob(ctx2, [1, 2])]);

		b.prependItems(other);

		expect(b.nrChildren).toBe(1); // merged into one
		expect(collectForEach(b)).toEqual([1, 2, 3]);
	});

	it('does not merge when boundary exceeds max', () => {
		const ctx2 = makeContext<number>(2); // max=4
		const b = ib(ctx2, [ob(ctx2, [1, 2, 3])]); // 3 elements (nrChildren=3)
		const other = ib(ctx2, [ob(ctx2, [10, 20, 30])]); // 3 elements
		b.prependItems(other);

		expect(b.nrChildren).toBeGreaterThan(1); // NOT merged
		expect(collectForEach(b)).toEqual([10, 20, 30, 1, 2, 3]);
	});
});

describe('InnerBlockBuilder.appendItems', () => {
	const ctx = makeContext<number>(3);

	it('appends children from other builder', () => {
		const b = ib(ctx, [ob(ctx, [1, 2])]);
		const other = ib(ctx, [ob(ctx, [3, 4])]);
		b.appendItems(other);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
	});

	it('appendItems to empty', () => {
		const b = ib(ctx, []);
		b.appendItems(ib(ctx, [ob(ctx, [1]), ob(ctx, [2])]));
		expect(collectForEach(b)).toEqual([1, 2]);
	});

	it('merges boundary children when fit', () => {
		const ctx2 = makeContext<number>(2); // max=4
		const b = ib(ctx2, [ob(ctx2, [1, 2])]);
		const other = ib(ctx2, [ob(ctx2, [3])]);

		b.appendItems(other);

		expect(b.nrChildren).toBe(1); // merged
		expect(collectForEach(b)).toEqual([1, 2, 3]);
	});
});

describe('InnerBlockBuilder.edge-cases', () => {
	const ctx = makeContext<number>(2);

	describe('source unaffected after mutation', () => {
		it('source block not mutated', () => {
			const sourceBlock = ctx.outerBlock(ctx.childrenOps.of([10, 20]));
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
			expect(b.childrenInMax).toBe(true);
		});

		it('exactly at min children', () => {
			const children = Array.from({ length: 2 }, (_, i) => ob(ctx, [i]));
			const b = ib(ctx, children);
			expect(b.canRemoveChild).toBe(false);
			expect(b.childrenInMin).toBe(true);
		});
	});

	describe('large structure', () => {
		it('many children', () => {
			const children = Array.from({ length: 15 }, (_, i) => ob(ctx, [i * 2, i * 2 + 1]));
			const b = ib(ctx, children);
			expect(b.nrChildren).toBe(15);
			expect(b.size).toBe(30);
			let count = 0;
			b.forEach(() => count++);
			expect(count).toBe(30);
		});
	});
});
