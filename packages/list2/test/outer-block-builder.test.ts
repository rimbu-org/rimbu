import { describe, expect, it } from 'bun:test';

import type { ListContext } from '#list/context';

import { List } from '@rimbu/list';

function makeContext<T>(blockSizeBits: number): ListContext<T> {
	return List.createContext({ blockSizeBits }) as ListContext<T>;
}

function makeBuilder<T>(values: T[], bits = 5) {
	const ctx = makeContext<T>(bits);
	return ctx.outerBlockBuilder(ctx.childrenOps.of(values));
}

function makeBuilderFromSource<T>(values: T[], bits = 5) {
	const ctx = makeContext<T>(bits);
	const block = ctx.outerBlock(ctx.childrenOps.of(values));
	return ctx.outerBlockBuilderSource(block);
}

function collectForEach<T>(b: { forEach(f: (v: T) => void): void }): T[] {
	const result: T[] = [];
	b.forEach((v) => result.push(v));
	return result;
}

describe('OuterBlockBuilder.properties', () => {
	it('size equals nrChildren', () => {
		const b = makeBuilder([1, 2, 3]);
		expect(b.size).toBe(3);
		expect(b.nrChildren).toBe(3);
	});

	it('size 0 for empty children', () => {
		const b = makeBuilder([]);
		expect(b.size).toBe(0);
	});

	describe('canAddChild', () => {
		it('true below maxBlockSize', () => {
			const b = makeBuilder([1, 2], 2); // max=4
			expect(b.canAddChild).toBe(true);
		});

		it('false at maxBlockSize', () => {
			const b = makeBuilder([1, 2, 3, 4], 2); // max=4
			expect(b.canAddChild).toBe(false);
		});

		it('false above maxBlockSize', () => {
			const b = makeBuilder([1, 2, 3, 4, 5], 2);
			expect(b.canAddChild).toBe(false);
		});
	});

	describe('canRemoveChild', () => {
		it('true above minBlockSize', () => {
			const b = makeBuilder([1, 2, 3], 2); // min=2
			expect(b.canRemoveChild).toBe(true);
		});

		it('false at minBlockSize', () => {
			const b = makeBuilder([1, 2], 2); // min=2
			expect(b.canRemoveChild).toBe(false);
		});

		it('false below minBlockSize', () => {
			const b = makeBuilder([1], 2);
			expect(b.canRemoveChild).toBe(false);
		});
	});

	describe('childrenInMax / childrenInMin', () => {
		it('childrenInMax true at max', () => {
			const b = makeBuilder([1, 2, 3, 4], 2);
			expect(b.childrenInMax).toBe(true);
		});

		it('childrenInMax false above max', () => {
			const b = makeBuilder([1, 2, 3, 4, 5], 2);
			expect(b.childrenInMax).toBe(false);
		});

		it('childrenInMin true at min', () => {
			const b = makeBuilder([1, 2], 2);
			expect(b.childrenInMin).toBe(true);
		});

		it('childrenInMin false below min', () => {
			const b = makeBuilder([1], 2);
			expect(b.childrenInMin).toBe(false);
		});
	});
});

describe('OuterBlockBuilder.from-source', () => {
	it('size matches source', () => {
		const b = makeBuilderFromSource([10, 20, 30]);
		expect(b.size).toBe(3);
	});

	it('at reads from source without triggering copy', () => {
		const b = makeBuilderFromSource([10, 20, 30]);
		expect(b.at(0)).toBe(10);
		expect(b.at(2)).toBe(30);
	});

	it('negative at on source', () => {
		const b = makeBuilderFromSource([10, 20, 30, 40]);
		expect(b.at(-1)).toBe(40);
		expect(b.at(-2)).toBe(30);
	});

	it('get on source', () => {
		const b = makeBuilderFromSource([10, 20, 30]);
		expect(b.get(0)).toBe(10);
		expect(b.get(2)).toBe(30);
	});

	it('forEach from source', () => {
		const b = makeBuilderFromSource([1, 2, 3]);
		expect(collectForEach(b)).toEqual([1, 2, 3]);
	});

	it('build returns same source block when no mutation', () => {
		const b = makeBuilderFromSource([1, 2]);
		const built = b.build();
		expect(built.toArray()).toEqual([1, 2]);
	});

	it('source is discarded on mutation', () => {
		const b = makeBuilderFromSource([10, 20]);
		b.append(30);
		expect(b.size).toBe(3);
		expect(collectForEach(b)).toEqual([10, 20, 30]);
	});

	it('properties reflect source state', () => {
		const b = makeBuilderFromSource([1, 2], 2); // min=2, max=4
		expect(b.canAddChild).toBe(true);
		expect(b.canRemoveChild).toBe(false);
		expect(b.childrenInMax).toBe(true);
	});
});

describe('OuterBlockBuilder.read', () => {
	describe('at', () => {
		const b = makeBuilder([10, 20, 30, 40, 50]);

		it('positive index', () => {
			expect(b.at(0)).toBe(10);
			expect(b.at(2)).toBe(30);
			expect(b.at(4)).toBe(50);
		});

		it('negative index', () => {
			expect(b.at(-1)).toBe(50);
			expect(b.at(-2)).toBe(40);
		});

		it('out of bounds returns otherwise', () => {
			expect(b.at(5)).toBeUndefined();
			expect(b.at(-6)).toBeUndefined();
			expect(b.at(10, 'fallback')).toBe('fallback');
			expect(b.at(-10, () => 'lazy')).toBe('lazy');
		});

		it('otherwise function not called for valid index', () => {
			let called = false;
			expect(
				b.at(0, () => {
					called = true;
					return 999;
				}),
			).toBe(10);
			expect(called).toBe(false);
		});
	});

	describe('get', () => {
		it('returns element at index', () => {
			const b = makeBuilder([10, 20, 30]);
			expect(b.get(0)).toBe(10);
			expect(b.get(1)).toBe(20);
			expect(b.get(2)).toBe(30);
		});
	});

	describe('forEach', () => {
		it('visits all elements in order', () => {
			const b = makeBuilder([1, 2, 3]);
			expect(collectForEach(b)).toEqual([1, 2, 3]);
		});

		it('single element', () => {
			const b = makeBuilder([7]);
			expect(collectForEach(b)).toEqual([7]);
		});
	});
});

describe('OuterBlockBuilder.mutation', () => {
	describe('prepend', () => {
		it('adds element to front', () => {
			const b = makeBuilder([2, 3]);
			b.prepend(1);
			expect(b.size).toBe(3);
			expect(collectForEach(b)).toEqual([1, 2, 3]);
		});

		it('prepend to empty', () => {
			const b = makeBuilder<number>([]);
			b.prepend(1);
			expect(b.size).toBe(1);
			expect(b.at(0)).toBe(1);
		});

		it('multiple prepends', () => {
			const b = makeBuilder([3]);
			b.prepend(2);
			b.prepend(1);
			expect(collectForEach(b)).toEqual([1, 2, 3]);
		});
	});

	describe('append', () => {
		it('adds element to back', () => {
			const b = makeBuilder([1, 2]);
			b.append(3);
			expect(b.size).toBe(3);
			expect(collectForEach(b)).toEqual([1, 2, 3]);
		});

		it('append to empty', () => {
			const b = makeBuilder<number>([]);
			b.append(1);
			expect(b.size).toBe(1);
			expect(b.at(0)).toBe(1);
		});

		it('multiple appends', () => {
			const b = makeBuilder([1]);
			b.append(2);
			b.append(3);
			expect(collectForEach(b)).toEqual([1, 2, 3]);
		});
	});

	describe('mixed prepend and append', () => {
		it('builds correct order', () => {
			const b = makeBuilder<number>([]);
			b.append(2);
			b.prepend(1);
			b.append(3);
			b.prepend(0);
			expect(collectForEach(b)).toEqual([0, 1, 2, 3]);
		});
	});
});

describe('OuterBlockBuilder.drop', () => {
	it('dropFirstChild removes and returns first', () => {
		const b = makeBuilder([10, 20, 30]);
		const dropped = b.dropFirstChild();
		expect(dropped).toBe(10);
		expect(collectForEach(b)).toEqual([20, 30]);
		expect(b.size).toBe(2);
	});

	it('dropLastChild removes and returns last', () => {
		const b = makeBuilder([10, 20, 30]);
		const dropped = b.dropLastChild();
		expect(dropped).toBe(30);
		expect(collectForEach(b)).toEqual([10, 20]);
		expect(b.size).toBe(2);
	});

	it('dropFirstChild to empty', () => {
		const b = makeBuilder([1]);
		const dropped = b.dropFirstChild();
		expect(dropped).toBe(1);
		expect(b.size).toBe(0);
	});

	it('dropLastChild to empty', () => {
		const b = makeBuilder([1]);
		const dropped = b.dropLastChild();
		expect(dropped).toBe(1);
		expect(b.size).toBe(0);
	});
});

describe('OuterBlockBuilder.build', () => {
	it('build returns elements', () => {
		const b = makeBuilder([1, 2, 3]);
		const block = b.build();
		expect(block.size).toBe(3);
		expect(block.toArray()).toEqual([1, 2, 3]);
	});

	it('build after mutation reflects changes', () => {
		const b = makeBuilder([1]);
		b.append(2);
		const block = b.build();
		expect(block.toArray()).toEqual([1, 2]);
	});

	it('build returns immutable block', () => {
		const b = makeBuilder([1, 2]);
		const block = b.build();
		b.append(3);
		expect(block.toArray()).toEqual([1, 2]);
	});

	it('build empty returns empty block', () => {
		const b = makeBuilder<number>([]);
		const block = b.build();
		expect(block.size).toBe(0);
	});
});

describe('OuterBlockBuilder.buildMap', () => {
	it('transforms elements', () => {
		const b = makeBuilder([1, 2, 3]);
		const mapped = b.buildMap((x: number) => x * 10);
		expect(mapped.toArray()).toEqual([10, 20, 30]);
	});

	it('buildMap from source', () => {
		const b = makeBuilderFromSource([1, 2, 3]);
		const mapped = b.buildMap((x: number) => x * 10);
		expect(mapped.toArray()).toEqual([10, 20, 30]);
	});

	it('buildMap after mutation', () => {
		const b = makeBuilder([1, 2]);
		b.append(3);
		const mapped = b.buildMap((x: number) => x + 1);
		expect(mapped.toArray()).toEqual([2, 3, 4]);
	});
});

describe('OuterBlockBuilder.normalized', () => {
	it('empty returns undefined', () => {
		const b = makeBuilder<number>([]);
		expect(b.normalized()).toBeUndefined();
	});

	it('within maxBlockSize returns self', () => {
		const b = makeBuilder([1, 2, 3], 2); // max=4
		expect(b.normalized()).toBe(b as any);
	});

	it('exceeding maxBlockSize returns tree', () => {
		const b = makeBuilder([1, 2, 3, 4, 5], 2); // max=4
		const result = b.normalized();
		expect(result).not.toBe(b as any);
		expect(result).toHaveProperty('left');
		expect(result).toHaveProperty('right');
		expect(result).toBeDefined();
	});

	it('tree from normalized preserves all elements', () => {
		const b = makeBuilder([1, 2, 3, 4, 5, 6, 7], 2); // max=4
		const treeBuilder = b.normalized()!;
		const list = treeBuilder.build();
		expect(list.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it('normalized tree can continue appending', () => {
		const b = makeBuilder([1, 2, 3, 4], 2);
		b.append(5); // now 5 > max=4
		const treeBuilder = b.normalized()!;
		treeBuilder.append(6);
		const list = treeBuilder.build();
		expect(list.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
	});
});

describe('OuterBlockBuilder.splitRight', () => {
	it('splits at midpoint', () => {
		const b = makeBuilder([1, 2, 3, 4], 2);
		const right = b.splitRight();
		expect(right.size).toBe(2);
		expect(b.size).toBe(2);
	});

	it('left half contains first elements', () => {
		const b = makeBuilder([10, 20, 30, 40]);
		const right = b.splitRight();
		expect(collectForEach(b)).toEqual([10, 20]);
		expect(collectForEach(right)).toEqual([30, 40]);
	});

	it('split at custom index', () => {
		const b = makeBuilder([10, 20, 30, 40, 50]);
		const right = b.splitRight(3);
		expect(collectForEach(b)).toEqual([10, 20, 30]);
		expect(collectForEach(right)).toEqual([40, 50]);
	});

	it('split at 0 returns everything as right', () => {
		const b = makeBuilder([1, 2, 3]);
		const right = b.splitRight(0);
		expect(b.size).toBe(0);
		expect(right.size).toBe(3);
	});
});

describe('OuterBlockBuilder.prependItems', () => {
	it('prepends items from other builder', () => {
		const b = makeBuilder([3, 4]);
		const other = makeBuilder([1, 2]);
		b.prependItems(other);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
		expect(b.size).toBe(4);
	});

	it('prependItems to empty', () => {
		const b = makeBuilder<number>([]);
		b.prependItems(makeBuilder([1, 2]));
		expect(collectForEach(b)).toEqual([1, 2]);
	});

	it('prependItems from empty', () => {
		const b = makeBuilder([1, 2]);
		b.prependItems(makeBuilder<number>([]));
		expect(collectForEach(b)).toEqual([1, 2]);
	});

	it('prependItems from source', () => {
		const b = makeBuilder([3, 4]);
		const source = makeBuilderFromSource([1, 2]);
		b.prependItems(source);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
	});
});

describe('OuterBlockBuilder.appendItems', () => {
	it('appends items from other builder', () => {
		const b = makeBuilder([1, 2]);
		const other = makeBuilder([3, 4]);
		b.appendItems(other);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
		expect(b.size).toBe(4);
	});

	it('appendItems to empty', () => {
		const b = makeBuilder<number>([]);
		b.appendItems(makeBuilder([1, 2]));
		expect(collectForEach(b)).toEqual([1, 2]);
	});

	it('appendItems from empty', () => {
		const b = makeBuilder([1, 2]);
		b.appendItems(makeBuilder<number>([]));
		expect(collectForEach(b)).toEqual([1, 2]);
	});

	it('appendItems from source', () => {
		const b = makeBuilder([1, 2]);
		const source = makeBuilderFromSource([3, 4]);
		b.appendItems(source);
		expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
	});
});

describe('OuterBlockBuilder.edge-cases', () => {
	describe('source discarded on mutation', () => {
		it('source unaffected after mutation', () => {
			const ctx = makeContext<number>(2);
			const sourceBlock = ctx.outerBlock(ctx.childrenOps.of([10, 20]));
			const b = ctx.outerBlockBuilderSource(sourceBlock);
			b.append(30);
			expect(sourceBlock.toArray()).toEqual([10, 20]);
		});

		it('at reads mutated value after prepend on source', () => {
			const b = makeBuilderFromSource([2, 3]);
			b.prepend(1);
			expect(b.at(0)).toBe(1);
		});

		it('dropFirstChild discards source and works', () => {
			const b = makeBuilderFromSource([10, 20, 30]);
			expect(b.dropFirstChild()).toBe(10);
			expect(b.size).toBe(2);
		});
	});

	describe('overfull block normalization', () => {
		it('append and normalize produces tree with correct elements', () => {
			const b = makeBuilder([1, 2, 3, 4], 2); // max=4
			b.append(5);
			b.append(6);
			expect(b.size).toBe(6);
			const result = b.normalized();
			expect(result).toBeDefined();
			expect(result!.build().toArray()).toEqual([1, 2, 3, 4, 5, 6]);
		});
	});

	describe('null / undefined elements', () => {
		it('null elements', () => {
			const b = makeBuilder<number | null>([1, null, 3]);
			expect(b.at(0)).toBe(1);
			expect(b.at(1)).toBeNull();
			expect(b.at(2)).toBe(3);
		});

		it('undefined elements', () => {
			const b = makeBuilder<number | undefined>([1, undefined, 3]);
			expect(b.at(0)).toBe(1);
			expect(b.at(1)).toBeUndefined();
			expect(b.at(2)).toBe(3);
		});
	});

	describe('large block stress', () => {
		it('500 elements append then build', () => {
			const b = makeBuilder<number>([]);
			for (let i = 0; i < 500; i++) {
				b.append(i);
			}
			const block = b.build();
			expect(block.size).toBe(500);
			expect(block.at(0)).toBe(0);
			expect(block.at(250)).toBe(250);
			expect(block.at(499)).toBe(499);
		});

		it('500 elements via appendItems', () => {
			const b = makeBuilder<number>([]);
			const other = makeBuilder<number>(
				Array.from({ length: 500 }, (_, i) => i),
			);
			b.appendItems(other);
			expect(b.size).toBe(500);
		});
	});
});
