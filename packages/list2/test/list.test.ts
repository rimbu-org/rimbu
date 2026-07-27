import { describe, expect, it } from 'bun:test';

import { List } from '@rimbu/list';
import { Stream } from '@rimbu/stream';

describe('List creators', () => {
	it('empty', () => {
		expect(List.empty<number>()).toBe<any>(List.empty<string>());
	});

	it('of', () => {
		expect(List.of(1, 2, 3).toArray()).toEqual([1, 2, 3]);
	});

	it('builder', () => {
		const builder = List.builder<number>();
		builder.append(1);
		builder.append(2);
		builder.append(3);
		expect(builder.build().toArray()).toEqual([1, 2, 3]);
	});
});

describe('List concat', () => {
	const ctx = List.createContext({ blockSizeBits: 2 }); // max=4, min=2

	describe('basic', () => {
		it('concat two single-element lists', () => {
			const a = List.of(1);
			const b = List.of(2);
			const result = a.concat(b);
			expect(result.toArray()).toEqual([1, 2]);
			expect(result.size).toBe(2);
		});

		it('concat preserves left-to-right order', () => {
			const a = List.of(1, 2, 3);
			const b = List.of(4, 5, 6);
			const result = a.concat(b);
			expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
		});

		it('concat multiple sources', () => {
			const a = List.of(1);
			const b = List.of(2, 3);
			const c = List.of(4, 5, 6);
			const result = a.concat(b, c);
			expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
		});

		it('concat returns List.NonEmpty', () => {
			const a = List.of(1, 2);
			const result = a.concat(List.of(3));
			expect(result.nonEmpty()).toBe(true);
			expect(result.size).toBeGreaterThan(0);
		});
	});

	describe('self-concat', () => {
		it('concat list with itself duplicates elements', () => {
			const a = ctx.of(1, 2, 3);
			const result = a.concat(a);
			expect(result.toArray()).toEqual([1, 2, 3, 1, 2, 3]);
			expect(result.size).toBe(6);
		});

		it('self-concat single element produces two', () => {
			const a = ctx.of(1);
			const result = a.concat(a);
			expect(result.toArray()).toEqual([1, 1]);
			expect(result.size).toBe(2);
		});

		it('self-concat does not mutate original', () => {
			const a = ctx.of(10, 20, 30);
			a.concat(a);
			expect(a.toArray()).toEqual([10, 20, 30]);
			expect(a.size).toBe(3);
		});
	});

	describe('concat creating trees', () => {
		it('concat two full blocks creates a tree', () => {
			// maxBlockSize=4, so concat of 4+4=8 creates a tree
			const a = ctx.of(1, 2, 3, 4);
			const b = ctx.of(5, 6, 7, 8);
			const result = a.concat(b);
			expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
			expect(result.size).toBe(8);
			expect(result).toHaveProperty('left');
			expect(result).toHaveProperty('right');
		});

		it('concat overflows block and forms tree with middle', () => {
			const a = ctx.of(1, 2, 3, 4);
			const b = ctx.of(5, 6, 7, 8);
			const c = ctx.of(9, 10, 11, 12);
			const result = a.concat(b, c);
			expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
			expect(result.size).toBe(12);
		});

		it('concat block with tree', () => {
			const block = ctx.of(1, 2, 3);
			const tree = ctx.of(4, 5, 6, 7, 8); // overflows block → tree
			const result = block.concat(tree);
			expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
			expect(result.size).toBe(8);
		});

		it('concat tree with block', () => {
			const tree = ctx.of(1, 2, 3, 4, 5); // overflows → tree
			const block = ctx.of(6, 7, 8);
			const result = tree.concat(block);
			expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
			expect(result.size).toBe(8);
		});

		it('concat tree with tree', () => {
			const a = ctx.of(1, 2, 3, 4, 5); // tree
			const b = ctx.of(6, 7, 8, 9, 10); // tree
			const result = a.concat(b);
			expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
			expect(result.size).toBe(10);
		});
	});

	describe('immmutability', () => {
		it('concat does not mutate original', () => {
			const a = ctx.of(1, 2, 3);
			const b = ctx.of(4, 5, 6);
			a.concat(b);
			expect(a.toArray()).toEqual([1, 2, 3]);
			expect(b.toArray()).toEqual([4, 5, 6]);
		});

		it('concat returns new instance', () => {
			const a = ctx.of(1, 2, 3);
			const b = ctx.of(4, 5, 6);
			const result = a.concat(b);
			expect(result).not.toBe(a as any);
			expect(result).not.toBe(b as any);
		});

		it('concat with empty source keeps original elements unchanged', () => {
			const a = ctx.of(1, 2, 3);
			a.concat([] as any);
			expect(a.toArray()).toEqual([1, 2, 3]);
		});
	});

	describe('edge cases', () => {
		it('concat with single-element lists', () => {
			const a = ctx.of(1);
			const b = ctx.of(2);
			const c = ctx.of(3);
			const result = a.concat(b, c);
			expect(result.toArray()).toEqual([1, 2, 3]);
		});

		it('concat large number of elements', () => {
			const ctx5 = List.createContext({ blockSizeBits: 5 });
			const a = ctx5.of(...Array.from({ length: 50 }, (_, i) => i)) as any;
			const b = ctx5.of(...Array.from({ length: 50 }, (_, i) => i + 50)) as any;
			const result = a.concat(b);
			expect(result.size).toBe(100);
			expect(result.toArray()).toEqual(
				Array.from({ length: 100 }, (_, i) => i),
			);
		});

		it('concat many sources', () => {
			const sources = Array.from({ length: 20 }, (_, i) => ctx.of(i));
			// @ts-expect-error - nonEmpty assertion
			const result = (sources[0] as any).concat(...sources.slice(1));
			expect(result.size).toBe(20);
			expect(result.toArray()).toEqual(Array.from({ length: 20 }, (_, i) => i));
		});

		it('concat after prepend/append still works', () => {
			const a = ctx.of(2, 3).prepend(1);
			const b = ctx.of(5, 6).append(7);
			const result = a.concat(b);
			expect(result.toArray()).toEqual([1, 2, 3, 5, 6, 7]);
		});

		it('concat via stream iteration preserves all elements', () => {
			const a = ctx.of(10, 20, 30, 40);
			const b = ctx.of(50, 60);
			const result = a.concat(b);
			let count = 0;
			result.forEach(() => count++);
			expect(count).toBe(6);
		});

		it('concat via random access preserves all elements', () => {
			const a = ctx.of(10, 20, 30);
			const b = ctx.of(40, 50, 60);
			const result = a.concat(b);
			for (let i = 0; i < 6; i++) {
				expect(result.at(i)).toBe((i + 1) * 10);
			}
		});

		it('concat negative index access works', () => {
			const a = ctx.of(1, 2, 3);
			const b = ctx.of(4, 5, 6);
			const result = a.concat(b);
			expect(result.at(-1)).toBe(6);
			expect(result.at(-3)).toBe(4);
			expect(result.at(-6)).toBe(1);
		});

		it('concat with stream source', () => {
			const a = ctx.of(1, 2, 3);
			const result = a.concat(Stream.of(4, 5) as any);
			expect(result.toArray()).toEqual([1, 2, 3, 4, 5]);
		});

		it('concat empty source array preserves the original', () => {
			const a = ctx.of(1, 2, 3);
			const result = a.concat([] as any);
			expect(result).toBe(a as any);
			expect(result.toArray()).toEqual([1, 2, 3]);
		});

		it('concat with string elements works', () => {
			const a = ctx.of('a', 'b');
			const b = ctx.of('c', 'd', 'e');
			const result = a.concat(b);
			expect(result.toArray()).toEqual(['a', 'b', 'c', 'd', 'e']);
		});

		it('concat boolean elements works', () => {
			const a = ctx.of(true, false);
			const b = ctx.of(true, true);
			const result = a.concat(b);
			expect(result.toArray()).toEqual([true, false, true, true]);
		});
	});

	describe('structural integrity', () => {
		it('concat result supports further concat', () => {
			const a = ctx.of(1, 2);
			const b = ctx.of(3, 4);
			const c = ctx.of(5, 6);
			const d = ctx.of(7, 8);
			const result = a.concat(b).concat(c).concat(d);
			expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
			expect(result.size).toBe(8);
		});

		it('concat result supports map', () => {
			const a = ctx.of(1, 2, 3, 4);
			const b = ctx.of(5, 6, 7, 8);
			const result = a.concat(b).map((x: number) => x * 10);
			expect(result.toArray()).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);
		});

		it('concat result supports filter', () => {
			const a = ctx.of(1, 2, 3, 4, 5, 6);
			const b = ctx.of(7, 8, 9, 10);
			const result = a.concat(b).filter((x: number) => x % 2 === 0);
			expect(result.toArray()).toEqual([2, 4, 6, 8, 10]);
		});

		it('concat result supports take/drop', () => {
			const a = ctx.of(1, 2, 3, 4);
			const b = ctx.of(5, 6, 7, 8);
			const result = a.concat(b).drop(3).take(3);
			expect(result.toArray()).toEqual([4, 5, 6]);
		});

		it('concat result supports slice', () => {
			const a = ctx.of(10, 20, 30, 40);
			const b = ctx.of(50, 60, 70, 80);
			const result = a.concat(b).slice({ start: 2, amount: 4 });
			expect(result.toArray()).toEqual([30, 40, 50, 60]);
		});

		it('reversed streaming of concat result', () => {
			const a = ctx.of(1, 2, 3);
			const b = ctx.of(4, 5, 6);
			const result = a.concat(b);
			expect([...result.stream({ reversed: true })]).toEqual([
				6, 5, 4, 3, 2, 1,
			]);
		});
	});
});
