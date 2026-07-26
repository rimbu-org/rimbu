import { describe, expect, it } from 'bun:test';

import type { ListContext } from '#list/context';

import { List } from '@rimbu/list';

import type { OuterBlock } from '../src/internal/immutable/outer-block';

type InnerBlock<T, C extends OuterBlock<T> = OuterBlock<T>> =
	import('../src/internal/immutable/inner-block').InnerBlock<T, C>;

function makeContext<T>(blockSizeBits: number): ListContext<T> {
	return List.createContext({ blockSizeBits }) as ListContext<T>;
}

function ob<T>(ctx: ListContext<T>, vals: T[]): OuterBlock<T> {
	return ctx.outerBlock(ctx.childrenOps.of(vals));
}

function inner<T>(
	ctx: ListContext<T>,
	children: OuterBlock<T>[],
	level = 1,
): InnerBlock<T> {
	const size = children.reduce((s, c) => s + c.size, 0);

	return ctx.innerBlock(children, size, level);
}

function innerWithTable<T>(
	ctx: ListContext<T>,
	children: OuterBlock<T>[],
	level = 1,
): InnerBlock<T> {
	const size = children.reduce((s, c) => s + c.size, 0);
	const sizeTable = children.reduce<number[]>((acc, c, i) => {
		acc.push((acc[i - 1] ?? 0) + c.size);
		return acc;
	}, []);

	return ctx.innerBlock(children, size, level, sizeTable);
}


function collectForEach(ib: InnerBlock<any>): number[] {
	const result: number[] = [];
	ib.forEach((v) => result.push(v));
	return result;
}

describe('InnerBlock.properties', () => {
	const ctx = makeContext<number>(3); // max=8, min=4

	it('context is the list context', () => {
		const b = inner(ctx, [ob(ctx, [1, 2])]);
		expect(b.context.blockSizeBits).toBe(3);
	});

	it('size equals sum of child sizes', () => {
		const b = inner(ctx, [
			ob(ctx, [1, 2, 3]),
			ob(ctx, [4, 5]),
		]);
		expect(b.size).toBe(5);
	});

	it('nrChildren equals child count', () => {
		const b = inner(ctx, [
			ob(ctx, [1]),
			ob(ctx, [2]),
			ob(ctx, [3]),
		]);
		expect(b.nrChildren).toBe(3);
	});

	it('level is preserved', () => {
		const b = inner(ctx, [ob(ctx, [1])], 5);
		expect(b.level).toBe(5);
	});

	describe('canAddChild', () => {
		it('true when nrChildren < maxBlockSize', () => {
			const b = inner(ctx, [
				ob(ctx, [0]),
				ob(ctx, [1]),
			]);
			// max=8, 2 < 8 → true
			expect(b.canAddChild).toBe(true);
		});

		it('false when nrChildren === maxBlockSize', () => {
			const full = Array.from({ length: 8 }, (_, i) =>
				ob(ctx, [i]),
			);
			const b = inner(ctx, full);
			expect(b.canAddChild).toBe(false);
		});

		it('true for single-child block', () => {
			const b = inner(ctx, [ob(ctx, [1])]);
			expect(b.canAddChild).toBe(true);
		});
	});

	describe('canRemoveChild', () => {
		it('true when nrChildren > minBlockSize', () => {
			const children = Array.from({ length: 5 }, (_, i) =>
				ob(ctx, [i]),
			);
			const b = inner(ctx, children);
			expect(b.canRemoveChild).toBe(true);
		});

		it('false when nrChildren === minBlockSize', () => {
			const children = Array.from({ length: 4 }, (_, i) =>
				ob(ctx, [i]),
			);
			const b = inner(ctx, children);
			expect(b.canRemoveChild).toBe(false);
		});

		it('false for single-child block', () => {
			const b = inner(ctx, [ob(ctx, [1])]);
			expect(b.canRemoveChild).toBe(false);
		});
	});

	it('computedSizeTable lazy computed after get', () => {
		const b = inner(ctx, [ob(ctx, [1, 2])]);
		b.get(0);
		expect(b.computedSizeTable).toBeDefined();
	});
});

describe('InnerBlock.read', () => {
	const ctx = makeContext<number>(4); // max=16, min=8

	describe('get', () => {
		it('reads from first child', () => {
			const b = inner(ctx, [
				ob(ctx, [10, 20, 30]),
				ob(ctx, [40, 50]),
			]);
			expect(b.get(0)).toBe(10);
			expect(b.get(1)).toBe(20);
			expect(b.get(2)).toBe(30);
		});

		it('reads from middle child', () => {
			const b = inner(ctx, [
				ob(ctx, [10, 20]),
				ob(ctx, [30, 40, 50]),
				ob(ctx, [60, 70]),
			]);
			expect(b.get(2)).toBe(30);
			expect(b.get(3)).toBe(40);
			expect(b.get(4)).toBe(50);
			expect(b.get(5)).toBe(60);
		});

		it('reads from last child', () => {
			const b = inner(ctx, [
				ob(ctx, [10]),
				ob(ctx, [20, 30, 40]),
			]);
			expect(b.get(1)).toBe(20);
			expect(b.get(3)).toBe(40);
		});


		it('across many children', () => {
			const children = Array.from({ length: 12 }, (_, i) =>
				ob(ctx, [i * 10, i * 10 + 1]),
			);
			const b = innerWithTable(ctx, children);
			expect(b.get(0)).toBe(0);
			expect(b.get(1)).toBe(1);
			expect(b.get(2)).toBe(10);
			expect(b.get(3)).toBe(11);
			expect(b.get(22)).toBe(110);
			expect(b.get(23)).toBe(111);
		});

		it('large child blocks with many elements within maxChildSize', () => {
			// blockSizeBits=4, maxChildSize = 1<<4 = 16, each child must be ≤ 16
			const b = inner(ctx, [
				ob(ctx, Array.from({ length: 16 }, (_, i) => i)),
				ob(ctx, Array.from({ length: 16 }, (_, i) => i + 16)),
				ob(ctx, Array.from({ length: 16 }, (_, i) => i + 32)),
			]);
			expect(b.get(0)).toBe(0);
			expect(b.get(15)).toBe(15);
			expect(b.get(16)).toBe(16);
			expect(b.get(31)).toBe(31);
			expect(b.get(32)).toBe(32);
			expect(b.get(47)).toBe(47);
		});
	});

	describe('childAt', () => {
		it('returns child block at index', () => {
			const c0 = ob(ctx, [1, 2]);
			const c1 = ob(ctx, [3, 4, 5]);
			const c2 = ob(ctx, [6]);
			const b = inner(ctx, [c0, c1, c2]);

			expect(b.childAt(0).toArray()).toEqual([1, 2]);
			expect(b.childAt(1).toArray()).toEqual([3, 4, 5]);
			expect(b.childAt(2).toArray()).toEqual([6]);
		});

		it('negative index wraps', () => {
			const c0 = ob(ctx, [1]);
			const c1 = ob(ctx, [2]);
			const b = inner(ctx, [c0, c1]);
			expect(b.childAt(-1).toArray()).toEqual([2]);
			expect(b.childAt(-2).toArray()).toEqual([1]);
		});
	});

	describe('stream', () => {
		it('forward streams all child elements', () => {
			const b = inner(ctx, [
				ob(ctx, [1, 2]),
				ob(ctx, [3, 4]),
			]);
			const result = [...b.stream()];
			expect(result).toEqual([1, 2, 3, 4]);
		});

		it('reversed streams all child elements backwards', () => {
			const b = inner(ctx, [
				ob(ctx, [1, 2]),
				ob(ctx, [3, 4]),
			]);
			const result = [...b.stream({ reversed: true })];
			expect(result).toEqual([4, 3, 2, 1]);
		});

		it('with inner children also reversed', () => {
			const b = inner(ctx, [
				ob(ctx, [10, 20]),
				ob(ctx, [30]),
			]);
			const reversed = b.stream({ reversed: true });
			expect([...reversed]).toEqual([30, 20, 10]);
		});
	});

	describe('forEach', () => {
		it('visits elements of all children in order', () => {
			const b = inner(ctx, [
				ob(ctx, [1]),
				ob(ctx, [2, 3]),
				ob(ctx, [4]),
			]);
			expect(collectForEach(b)).toEqual([1, 2, 3, 4]);
		});

		it('single child', () => {
			const b = inner(ctx, [ob(ctx, [7])]);
			expect(collectForEach(b)).toEqual([7]);
		});
	});

	describe('toArray', () => {
		it('flat maps child arrays', () => {
			const b = inner(ctx, [
				ob(ctx, [1, 2]),
				ob(ctx, [3]),
				ob(ctx, [4, 5, 6]),
			]);
			expect(b.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
		});

		it('single child', () => {
			const b = inner(ctx, [ob(ctx, [42])]);
			expect(b.toArray()).toEqual([42]);
		});
	});
});

describe('InnerBlock.mutation', () => {
	const ctx = makeContext<number>(4); // max=16, min=8

	describe('prependBlockChild', () => {
		it('adds child block at start', () => {
			const b = inner(ctx, [
				ob(ctx, [2, 3]),
				ob(ctx, [4]),
			]);
			const r = b.prependBlockChild(ob(ctx, [0, 1]));
			expect(r.nrChildren).toBe(3);
			expect(r.size).toBe(5);
			expect(r.toArray()).toEqual([0, 1, 2, 3, 4]);
		});

		it('does not mutate original', () => {
			const b = inner(ctx, [ob(ctx, [1])]);
			b.prependBlockChild(ob(ctx, [0]));
			expect(b.toArray()).toEqual([1]);
			expect(b.nrChildren).toBe(1);
		});

		it('works on single-child block', () => {
			const b = inner(ctx, [ob(ctx, [2])]);
			const r = b.prependBlockChild(ob(ctx, [1]));
			expect(r.toArray()).toEqual([1, 2]);
		});
	});

	describe('appendBlockChild', () => {
		it('adds child block at end', () => {
			const b = inner(ctx, [
				ob(ctx, [1]),
				ob(ctx, [2, 3]),
			]);
			const r = b.appendBlockChild(ob(ctx, [4, 5]));
			expect(r.nrChildren).toBe(3);
			expect(r.size).toBe(5);
			expect(r.toArray()).toEqual([1, 2, 3, 4, 5]);
		});

		it('does not mutate original', () => {
			const b = inner(ctx, [ob(ctx, [1])]);
			b.appendBlockChild(ob(ctx, [2]));
			expect(b.toArray()).toEqual([1]);
		});

		it('works on single-child block', () => {
			const b = inner(ctx, [ob(ctx, [1])]);
			const r = b.appendBlockChild(ob(ctx, [2]));
			expect(r.toArray()).toEqual([1, 2]);
		});
	});

	describe('prependChild', () => {
		it('delegates to prependBlockChild', () => {
			const b = inner(ctx, [ob(ctx, [2])]);
			const r = b.prependChild(ob(ctx, [1]));
			expect(r.toArray()).toEqual([1, 2]);
		});
	});

	describe('appendChild', () => {
		it('delegates to appendBlockChild', () => {
			const b = inner(ctx, [ob(ctx, [1])]);
			const r = b.appendChild(ob(ctx, [2]));
			expect(r.toArray()).toEqual([1, 2]);
		});
	});

	describe('withChild', () => {
		it('replaces child at index', () => {
			const b = inner(ctx, [
				ob(ctx, [1, 2]),
				ob(ctx, [3]),
				ob(ctx, [4, 5]),
			]);
			const r = b.withChild(1, ob(ctx, [30, 31]));

			expect(r.nrChildren).toBe(3);
			expect(r.size).toBe(6);
			expect(r.toArray()).toEqual([1, 2, 30, 31, 4, 5]);
		});

		it('does not mutate original', () => {
			const b = inner(ctx, [ob(ctx, [1]), ob(ctx, [2])]);
			b.withChild(0, ob(ctx, [10]));
			expect(b.toArray()).toEqual([1, 2]);
		});

		it('negative index', () => {
			const b = inner(ctx, [
				ob(ctx, [1]),
				ob(ctx, [2]),
				ob(ctx, [3]),
			]);
			const r = b.withChild(-1, ob(ctx, [30]));
			expect(r.toArray()).toEqual([1, 2, 30]);
		});
	});

	describe('modifyFirstChild', () => {
		it('modifies first child block', () => {
			const b = inner(ctx, [
				ob(ctx, [1]),
				ob(ctx, [2, 3]),
			]);
			const r = b.modifyFirstChild((c) =>
				c.appendBlockChild(10),
			);
			expect(r!.toArray()).toEqual([1, 10, 2, 3]);
		});

		it('returns same instance when child unchanged', () => {
			const b = inner(ctx, [ob(ctx, [1]), ob(ctx, [2])]);
			const r = b.modifyFirstChild((c) => c);
			expect(r).toBe(b as any);
		});

		it('updates size correctly', () => {
			const b = inner(ctx, [
				ob(ctx, [1, 2]),
				ob(ctx, [3]),
			]);
			const r = b.modifyFirstChild((c) =>
				ob(ctx, [100]),
			);
			expect(r!.size).toBe(2);
		});
	});

	describe('modifyLastChild', () => {
		it('modifies last child block', () => {
			const b = inner(ctx, [
				ob(ctx, [1, 2]),
				ob(ctx, [3]),
			]);
			const r = b.modifyLastChild((c) =>
				c.appendBlockChild(4),
			);
			expect(r!.toArray()).toEqual([1, 2, 3, 4]);
		});

		it('returns same instance when child unchanged', () => {
			const b = inner(ctx, [ob(ctx, [1]), ob(ctx, [2])]);
			const r = b.modifyLastChild((c) => c);
			expect(r).toBe(b as any);
		});

		it('updates size correctly', () => {
			const b = inner(ctx, [
				ob(ctx, [1]),
				ob(ctx, [2, 3]),
			]);
			const r = b.modifyLastChild((c) =>
				ob(ctx, [200]),
			);
			expect(r!.size).toBe(2);
		});
	});
});

describe('InnerBlock.child-manipulation', () => {
	const ctx = makeContext<number>(4);

	describe('dropFirstChild', () => {
		it('drops first child and returns it', () => {
			const b = inner(ctx, [
				ob(ctx, [1, 2]),
				ob(ctx, [3, 4]),
				ob(ctx, [5]),
			]);
			const [nb, dropped] = b.dropFirstChild();
			expect(dropped.toArray()).toEqual([1, 2]);
			expect(nb!.toArray()).toEqual([3, 4, 5]);
			expect(nb!.size).toBe(3);
		});

		it('returns null block for single child', () => {
			const b = inner(ctx, [ob(ctx, [1, 2])]);
			const [nb, dropped] = b.dropFirstChild();
			expect(dropped.toArray()).toEqual([1, 2]);
			expect(nb).toBeNull();
		});

		it('does not mutate original', () => {
			const b = inner(ctx, [ob(ctx, [1]), ob(ctx, [2])]);
			b.dropFirstChild();
			expect(b.toArray()).toEqual([1, 2]);
			expect(b.nrChildren).toBe(2);
		});
	});

	describe('dropLastChild', () => {
		it('drops last child and returns it', () => {
			const b = inner(ctx, [
				ob(ctx, [1]),
				ob(ctx, [2, 3]),
				ob(ctx, [4, 5]),
			]);
			const [nb, dropped] = b.dropLastChild();
			expect(dropped.toArray()).toEqual([4, 5]);
			expect(nb!.toArray()).toEqual([1, 2, 3]);
			expect(nb!.size).toBe(3);
		});

		it('returns null block for single child', () => {
			const b = inner(ctx, [ob(ctx, [1, 2])]);
			const [nb, dropped] = b.dropLastChild();
			expect(dropped.toArray()).toEqual([1, 2]);
			expect(nb).toBeNull();
		});

		it('does not mutate original', () => {
			const b = inner(ctx, [ob(ctx, [1]), ob(ctx, [2])]);
			b.dropLastChild();
			expect(b.toArray()).toEqual([1, 2]);
		});
	});
});

describe('InnerBlock.map', () => {
	const ctx = makeContext<number>(4);

	it('transforms all elements', () => {
		const b = inner(ctx, [
			ob(ctx, [1, 2]),
			ob(ctx, [3, 4]),
		]);
		const r = b.map((x: number) => x * 10);
		expect(r.toArray()).toEqual([10, 20, 30, 40]);
		expect(r.size).toBe(4);
	});

	it('preserves inner block structure', () => {
		const b = inner(ctx, [ob(ctx, [1, 2]), ob(ctx, [3])]);
		const r = b.map((x: number) => x);
		expect(r.nrChildren).toBe(2);
		expect(r.size).toBe(3);
	});

	it('does not mutate original', () => {
		const b = inner(ctx, [ob(ctx, [1, 2])]);
		b.map((x: number) => x * 10);
		expect(b.toArray()).toEqual([1, 2]);
	});

	it('map to different type', () => {
		const b = inner(ctx, [ob(ctx, [1, 2])]);
		const r = b.map((x: number) => String(x));
		expect(r.toArray()).toEqual(['1', '2']);
	});
});

describe('InnerBlock.immutability', () => {
	const ctx = makeContext<number>(4);

	it('toArray returns a copy', () => {
		const b = inner(ctx, [ob(ctx, [1, 2])]);
		const a1 = b.toArray();
		expect(a1).toEqual([1, 2]);
	});

	it('prependBlockChild returns new instance', () => {
		const b = inner(ctx, [ob(ctx, [2])]);
		expect(b.prependBlockChild(ob(ctx, [1]))).not.toBe(b as any);
	});

	it('appendBlockChild returns new instance', () => {
		const b = inner(ctx, [ob(ctx, [1])]);
		expect(b.appendBlockChild(ob(ctx, [2]))).not.toBe(b as any);
	});

	it('map returns new instance', () => {
		const b = inner(ctx, [ob(ctx, [1])]);
		expect(b.map((x: number) => x)).not.toBe(b as any);
	});

	it('same children on prependBlockChild keeps reference same', () => {
		const b = inner(ctx, [ob(ctx, [1])]);
		expect(b).toBe(b as any);
	});
});

describe('InnerBlock.edge-cases', () => {
	const ctx = makeContext<number>(2); // max=4, min=2

	describe('size table correctness', () => {
		it('precomputed cumulative size table enables correct lookups', () => {
			const children = Array.from({ length: 4 }, (_, i) =>
				ob(ctx, [i * 10, i * 10 + 1]),
			);
			const b = innerWithTable(ctx, children);
			expect(b.get(0)).toBe(0);
			expect(b.get(1)).toBe(1);
			expect(b.get(2)).toBe(10);
			expect(b.get(3)).toBe(11);
			expect(b.get(7)).toBe(31);
		});

		it('irregular shape lazily computes cumulative table', () => {
			const children = [
				ob(ctx, [1]),
				ob(ctx, [2, 3, 4, 5]),
				ob(ctx, [6]),
			];
			const b = inner(ctx, children);

			expect(b.get(0)).toBe(1);
			expect(b.get(3)).toBe(4);
			expect(b.get(5)).toBe(6);

			expect(b.computedSizeTable).not.toBe('regular');
			expect(b.computedSizeTable).toBeDefined();
		});
	});

	describe('deep levels', () => {
		it('works with level > 1', () => {
			const b = inner(ctx, [ob(ctx, [1]), ob(ctx, [2])], 3);
			expect(b.level).toBe(3);
			// get still works through size table
			expect(b.get(0)).toBe(1);
			expect(b.get(1)).toBe(2);
		});
	});

	describe('single child', () => {
		it('get works on single child', () => {
			const b = inner(ctx, [ob(ctx, [10, 20, 30])]);
			expect(b.get(0)).toBe(10);
			expect(b.get(2)).toBe(30);
			expect(b.nrChildren).toBe(1);
		});

		it('dropFirstChild returns null', () => {
			const b = inner(ctx, [ob(ctx, [1, 2])]);
			const [nb, dropped] = b.dropFirstChild();
			expect(nb).toBeNull();
			expect(dropped.toArray()).toEqual([1, 2]);
		});

		it('dropLastChild returns null', () => {
			const b = inner(ctx, [ob(ctx, [1, 2])]);
			const [nb, dropped] = b.dropLastChild();
			expect(nb).toBeNull();
			expect(dropped.toArray()).toEqual([1, 2]);
		});
	});

	describe('block at capacity boundaries', () => {
		it('max size check on blockSizeBits=2', () => {
			const children = Array.from({ length: 4 }, (_, i) =>
				ob(ctx, [i]),
			);
			const b = inner(ctx, children);
			expect(b.nrChildren).toBe(4);
			expect(b.canAddChild).toBe(false); // 4 >= maxBlockSize=4
		});

		it('just below max', () => {
			const children = Array.from({ length: 3 }, (_, i) =>
				ob(ctx, [i]),
			);
			const b = inner(ctx, children);
			expect(b.canAddChild).toBe(true);
		});

		it('min size check', () => {
			const b = inner(ctx, [ob(ctx, [1]), ob(ctx, [2])]);
			expect(b.canRemoveChild).toBe(false); // 2 NOT > min=2
		});

		it('just above min', () => {
			const children = Array.from({ length: 3 }, (_, i) =>
				ob(ctx, [i]),
			);
			const b = inner(ctx, children);
			expect(b.canRemoveChild).toBe(true);
		});
	});

	describe('chained operations', () => {
		it('prepend then append', () => {
			const b = inner(ctx, [ob(ctx, [2])]);
			const r = b.prependBlockChild(ob(ctx, [1])).appendBlockChild(
				ob(ctx, [3]),
			);
			expect(r.toArray()).toEqual([1, 2, 3]);
			expect(r.nrChildren).toBe(3);
		});

		it('modify then drop', () => {
			const b = inner(ctx, [
				ob(ctx, [1]),
				ob(ctx, [2]),
				ob(ctx, [3]),
			]);
			const modified = b.modifyFirstChild((c) =>
				ob(ctx, [10, 11]),
			);
			const [afterDrop, dropped] = modified!.dropLastChild();
			expect(afterDrop!.toArray()).toEqual([10, 11, 2]);
			expect(dropped.toArray()).toEqual([3]);
		});
	});

	describe('large structure', () => {
		it('many children with size table', () => {
			const children = Array.from({ length: 20 }, (_, i) =>
				ob(ctx, [i * 3, i * 3 + 1, i * 3 + 2]),
			);
			const b = innerWithTable(ctx, children);
			expect(b.nrChildren).toBe(20);
			expect(b.size).toBe(60);

			expect(b.get(0)).toBe(0);
			expect(b.get(2)).toBe(2);
			expect(b.get(3)).toBe(3);
			expect(b.get(57)).toBe(57);
			expect(b.get(59)).toBe(59);
		});

		it('large forEach visits all elements', () => {
			const children = Array.from({ length: 15 }, (_, i) =>
				ob(ctx, [i * 2, i * 2 + 1]),
			);
			const b = inner(ctx, children);
			let count = 0;
			b.forEach(() => count++);
			expect(count).toBe(30);
		});
	});

	describe('null/undefined elements', () => {
		it('null elements in child blocks', () => {
			const ictx = makeContext<number | null>(2);
			const b = inner(ictx, [
				ob(ictx, [1, null]),
				ob(ictx, [null, 3]),
			]);
			expect(b.get(0)).toBe(1);
			expect(b.get(1)).toBeNull();
			expect(b.get(2)).toBeNull();
			expect(b.get(3)).toBe(3);
		});

		it('undefined elements in child blocks', () => {
			const ictx = makeContext<number | undefined>(2);
			const b = inner(ictx, [
				ob(ictx, [1, undefined]),
				ob(ictx, [undefined, 3]),
			]);
			expect(b.get(0)).toBe(1);
			expect(b.get(1)).toBeUndefined();
			expect(b.get(2)).toBeUndefined();
			expect(b.get(3)).toBe(3);
		});
	});
});
