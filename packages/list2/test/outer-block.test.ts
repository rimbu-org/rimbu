import { describe, expect, it } from 'bun:test';

import type { Int } from '@rimbu/base';

import type { ListContext } from '#list/context';
import type { OuterBlock } from '#list/immutable/outer-block';

import { TraverseState } from '@rimbu/common';
import { List } from '@rimbu/list2';

type BlockFactory = <T>(ctx: ListContext<T>, values: T[]) => OuterBlock<T>;

type MakeBlock = <T>(values: T[], blockSizeBits?: number) => OuterBlock<T>;

function makeContext<T>(blockSizeBits: number): ListContext<T> {
	return List.createContext({ blockSizeBits }) as ListContext<T>;
}

function runOuterBlockTests(
	factory: BlockFactory,
	makeBlock: MakeBlock,
	suiteName: string,
) {
	describe(suiteName, () => {
		describe('OuterBlock.properties', () => {
			it('context is the list context', () => {
				const b = makeBlock([1, 2, 3]);
				expect(b.context.blockSizeBits).toBe(5);
			});

			it('size equals nrChildren for outer blocks', () => {
				const b = makeBlock([1, 2, 3, 4]);
				expect(b.size).toBe(4);
				expect(b._nrChildren).toBe(4);
			});

			it('size equals 1 for single-element block', () => {
				const b = makeBlock([1]);
				expect(b.size).toBe(1);
				expect(b._nrChildren).toBe(1);
			});

			describe('childrenInMax', () => {
				it('true when size <= maxBlockSize', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [1, 2, 3, 4]);
					expect(b._childrenInMax).toBe(true);
				});

				it('false when size > maxBlockSize', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [1, 2, 3, 4, 5]);
					expect(b._childrenInMax).toBe(false);
				});

				it('true for partial blocks', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [1, 2]);
					expect(b._childrenInMax).toBe(true);
				});
			});

			describe('childrenInMin', () => {
				it('true when size >= minBlockSize', () => {
					const ctx = makeContext(3); // max=8, min=4
					const b = factory(ctx, [1, 2, 3, 4]);
					expect(b._childrenInMin).toBe(true);
				});

				it('false when size < minBlockSize', () => {
					const ctx = makeContext(3);
					const b = factory(ctx, [1, 2, 3]);
					expect(b._childrenInMin).toBe(false);
				});

				it('min is 2 for blockSizeBits=2', () => {
					const ctx = makeContext(2); // min=2
					const b = factory(ctx, [1, 2]);
					expect(b._childrenInMin).toBe(true);
				});

				it('single element below min', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [1]);
					expect(b._childrenInMin).toBe(false);
				});
			});

			describe('canAddChild', () => {
				it('true when size < maxBlockSize', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [1, 2, 3]);
					expect(b._canAddChild).toBe(true);
				});

				it('false when size === maxBlockSize', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [1, 2, 3, 4]);
					expect(b._canAddChild).toBe(false);
				});

				it('true for single-element block', () => {
					const b = makeBlock([1]);
					expect(b._canAddChild).toBe(true);
				});
			});

			describe('canRemoveChild', () => {
				it('true when size > minBlockSize', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [1, 2, 3]);
					expect(b._canRemoveChild).toBe(true);
				});

				it('false when size === minBlockSize', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [1]);
					expect(b._canRemoveChild).toBe(false);
				});

				it('false for single-element with default bits', () => {
					const b = makeBlock([1]);
					expect(b._canRemoveChild).toBe(false);
				});
			});
		});

		describe('OuterBlock.read', () => {
			describe('at', () => {
				const b = makeBlock([10, 20, 30, 40, 50]);

				it('positive index', () => {
					expect(b.at(0)).toBe(10);
					expect(b.at(2)).toBe(30);
					expect(b.at(4)).toBe(50);
				});

				it('negative index', () => {
					expect(b.at(-1)).toBe(50);
					expect(b.at(-2)).toBe(40);
					expect(b.at(-5)).toBe(10);
				});

				it('out of bounds returns otherwise', () => {
					expect(b.at(5)).toBeUndefined();
					expect(b.at(-6)).toBeUndefined();
					expect(b.at(5, 'fallback')).toBe('fallback');
					expect(b.at(-6, () => 'lazy')).toBe('lazy');
				});

				it('boundary: index equals size', () => {
					expect(b.at(5)).toBeUndefined();
				});

				it('boundary: index equals -size-1', () => {
					expect(b.at(-6)).toBeUndefined();
				});

				it('boundary: index equals -size (valid negative)', () => {
					expect(b.at(-5)).toBe(10);
				});

				it('boundary: index equals size-1 (last)', () => {
					expect(b.at(4)).toBe(50);
				});

				it('fractional positive index throws', () => {
					expect(() => b.at(0.7)).toThrow();
				});

				it('fractional negative index throws', () => {
					expect(() => b.at(-0.3)).toThrow();
				});

				it('otherwise function is not called when index is valid', () => {
					let called = false;
					const result = b.at(0, () => {
						called = true;
						return 999;
					});
					expect(result).toBe(10);
					expect(called).toBe(false);
				});
			});

			describe('get', () => {
				const b = makeBlock([10, 20, 30]);

				it('returns element at positive index', () => {
					expect(b._get(0 as Int.AtLeastZero)).toBe(10);
					expect(b._get(1 as Int.AtLeastZero)).toBe(20);
					expect(b._get(2 as Int.AtLeastZero)).toBe(30);
				});

				it('at supports negative indices', () => {
					expect(b.at(-1)).toBe(30);
					expect(b.at(-2)).toBe(20);
					expect(b.at(-3)).toBe(10);
				});
			});

			describe('first', () => {
				it('returns the first element', () => {
					const b = makeBlock([100, 200]);
					expect(b.first()).toBe(100);
				});

				it('works for single element', () => {
					const b = makeBlock([7]);
					expect(b.first()).toBe(7);
				});
			});

			describe('last', () => {
				it('returns the last element', () => {
					const b = makeBlock([100, 200]);
					expect(b.last()).toBe(200);
				});

				it('works for single element', () => {
					const b = makeBlock([7]);
					expect(b.last()).toBe(7);
				});
			});

			describe('toArray', () => {
				it('returns a non-empty array', () => {
					const b = makeBlock([1, 2, 3]);
					const arr = b.toArray();
					expect(arr).toEqual([1, 2, 3]);
					expect(arr.length).toBeGreaterThan(0);
				});

				it('single element', () => {
					const b = makeBlock([42]);
					expect(b.toArray()).toEqual([42]);
				});
			});

			describe('stream', () => {
				it('forwards', () => {
					const b = makeBlock([1, 2, 3]);
					const result = b.stream().toArray();
					expect(result).toEqual([1, 2, 3]);
				});

				it('reversed', () => {
					const b = makeBlock([1, 2, 3]);
					const result = b.stream({ reversed: true }).toArray();
					expect(result).toEqual([3, 2, 1]);
				});
			});

			describe('streamSlice', () => {
				const b = makeBlock([10, 20, 30, 40, 50]);

				it('forwards', () => {
					const result = b.streamSlice({ start: 1, amount: 3 }, {}).toArray();
					expect(result).toEqual([20, 30, 40]);
				});

				it('reversed', () => {
					const result = b
						.streamSlice({ start: 0, amount: 3 }, { reversed: true })
						.toArray();
					expect(result).toEqual([30, 20, 10]);
				});

				it('empty slice returns empty stream', () => {
					const result = b.streamSlice({ start: 0, amount: 0 }, {}).toArray();
					expect(result).toEqual([]);
				});

				it('full range', () => {
					const result = b.streamSlice({ start: 0, amount: 5 }, {}).toArray();
					expect(result).toEqual([10, 20, 30, 40, 50]);
				});
			});
		});

		describe('OuterBlock.transform', () => {
			describe('take', () => {
				const b = makeBlock([10, 20, 30, 40, 50]);

				it('positive count', () => {
					expect(b.take(3).toArray()).toEqual([10, 20, 30]);
				});

				it('count 0 returns empty list', () => {
					expect(b.take(0).size).toBe(0);
				});

				it('count 1 returns first element only', () => {
					expect(b.take(1).toArray()).toEqual([10]);
				});

				it('count equals size returns same reference', () => {
					expect(b.take(5)).toBe(b);
				});

				it('count exceeds size returns same reference', () => {
					expect(b.take(100)).toBe(b);
				});

				it('count = size-1', () => {
					expect(b.take(4).toArray()).toEqual([10, 20, 30, 40]);
				});

				it('count = -(size-1) returns last size-1 elements', () => {
					expect(b.take(-4).toArray()).toEqual([20, 30, 40, 50]);
				});

				it('negative count takes from end', () => {
					expect(b.take(-2).toArray()).toEqual([40, 50]);
				});

				it('negative count equals -size returns whole block', () => {
					expect(b.take(-5)).toBe(b);
				});

				it('negative count exceeds size returns whole block', () => {
					expect(b.take(-100)).toBe(b);
				});

				it('take from single-element block', () => {
					const s = makeBlock([42]);
					expect(s.take(0).size).toBe(0);
					expect((s.take(0) as List<number>).toArray()).toEqual([]);
					expect(s.take(1)).toBe(s);
					expect(s.take(-1)).toBe(s);
					expect(s.take(-2)).toBe(s);
				});
			});

			describe('drop', () => {
				const b = makeBlock([10, 20, 30, 40, 50]);

				it('positive count', () => {
					expect(b.drop(2).toArray()).toEqual([30, 40, 50]);
				});

				it('count 0 returns same reference', () => {
					expect(b.drop(0)).toBe(b);
				});

				it('count 1 drops first element', () => {
					expect(b.drop(1).toArray()).toEqual([20, 30, 40, 50]);
				});

				it('count equals size returns empty list', () => {
					expect(b.drop(5).size).toBe(0);
				});

				it('count exceeds size returns empty list', () => {
					expect(b.drop(100).size).toBe(0);
				});

				it('drop everything but last element', () => {
					expect(b.drop(4).toArray()).toEqual([50]);
				});

				it('negative count drops from end', () => {
					expect(b.drop(-2).toArray()).toEqual([10, 20, 30]);
				});

				it('negative count equals -size returns empty', () => {
					expect(b.drop(-5).size).toBe(0);
				});

				it('negative count exceeds size returns empty', () => {
					expect(b.drop(-100).size).toBe(0);
				});

				it('drop from single-element block', () => {
					const s = makeBlock([42]);
					expect(s.drop(0)).toBe(s);
					expect(s.drop(1).size).toBe(0);
					expect(s.drop(-1).size).toBe(0);
					expect(s.drop(-2).size).toBe(0);
				});
			});

			describe('forEach', () => {
				it('visits all elements in order', () => {
					const result: number[] = [];
					const b = makeBlock([1, 2, 3]);
					b.forEach((v) => result.push(v));
					expect(result).toEqual([1, 2, 3]);
				});

				it('single element', () => {
					const result: number[] = [];
					const b = makeBlock([7]);
					b.forEach((v) => result.push(v));
					expect(result).toEqual([7]);
				});
			});

			describe('filter', () => {
				const b = makeBlock([1, 2, 3, 4, 5, 6]);

				it('keeps matching elements', () => {
					const r = b.filter((x) => x % 2 === 0);
					expect(r.toArray()).toEqual([2, 4, 6]);
				});

				it('keeping everything returns same reference', () => {
					const r = b.filter(() => true);
					expect(r).toBe(b);
				});

				it('removing everything returns empty list', () => {
					const r = b.filter(() => false);
					expect(r.size).toBe(0);
					expect((r as List<number>).toArray()).toEqual([]);
				});

				it('single matching element returns in context', () => {
					const r = b.filter((x) => x === 3);
					expect(r.toArray()).toEqual([3]);
				});

				it('single element block keeps matching', () => {
					const s = makeBlock([42]);
					expect(s.filter(() => true)).toBe(s);
				});

				it('single element block removes non-matching', () => {
					const s = makeBlock([42]);
					expect(s.filter(() => false).size).toBe(0);
				});
			});

			describe('filterIndexed', () => {
				const b = makeBlock([10, 20, 30, 40]);

				it('basic indexed filter', () => {
					const r = b.filterIndexed((_v: number, i: number) => i % 2 === 0);
					expect(r.toArray()).toEqual([10, 30]);
				});

				it('negate option', () => {
					const r = b.filterIndexed((_v: number, i: number) => i < 2, {
						negate: true,
					});
					expect(r.toArray()).toEqual([30, 40]);
				});

				it('reversed option', () => {
					const r = b.filterIndexed((_v: number, i: number) => i > 0, {
						reversed: true,
					});
					expect(r.toArray()).toEqual([30, 20, 10]);
				});

				it('halt stops iteration after current element', () => {
					const r = b.filterIndexed(
						(_v: number, _i: number, halt: () => void) => {
							halt();
							return true;
						},
					);
					expect(r.toArray()).toEqual([10]);
				});

				it('halt after first match excludes subsequent', () => {
					const visited: number[] = [];
					const r = b.filterIndexed(
						(v: number, _i: number, halt: () => void) => {
							visited.push(v);
							if (v >= 20) halt();
							return true;
						},
					);
					expect(r.toArray()).toEqual([10, 20]);
					expect(visited.length).toBeLessThan(b.size);
				});

				it('state offsets index counter', () => {
					const r = b.filterIndexed((_v: number, i: number) => i < 2, {
						state: TraverseState(2),
					});
					expect(r.toArray()).toEqual([]);
				});

				it('state with reversed counter', () => {
					const r = b.filterIndexed((_v: number, i: number) => i <= 1, {
						reversed: true,
						state: TraverseState(2),
					});
					expect(r.toArray()).toEqual([]);
				});

				it('all pass returns self', () => {
					const r = b.filterIndexed(() => true);
					expect(r).toBe(b);
				});

				it('none pass returns empty', () => {
					const r = b.filterIndexed(() => false);
					expect(r.size).toBe(0);
				});
			});

			describe('map', () => {
				const b = makeBlock([1, 2, 3]);

				it('transforms all elements', () => {
					const r = b.map((x) => x * 10);
					expect(r.toArray()).toEqual([10, 20, 30]);
				});

				it('returns an OuterBlock', () => {
					const r = b.map((x) => x.toString());
					expect(r.size).toBe(3);
					expect(r.toArray()).toEqual(['1', '2', '3']);
				});

				it('single element', () => {
					const s = makeBlock([5]);
					const r = s.map((x) => x + 1);
					expect(r.toArray()).toEqual([6]);
				});

				it('does not mutate original', () => {
					b.map((x) => x * 10);
					expect(b.toArray()).toEqual([1, 2, 3]);
				});
			});

			describe('slice (inherited)', () => {
				const b = makeBlock([10, 20, 30, 40, 50]);

				it('positive range', () => {
					const r = b.slice({ start: 1, amount: 3 });
					expect(r.toArray()).toEqual([20, 30, 40]);
				});

				it('full range returns self', () => {
					const r = b.slice({ start: 0, amount: 5 });
					expect(r).toBe(b);
				});

				it('empty range returns empty', () => {
					const r = b.slice({ start: 2, amount: 0 });
					expect(r.size).toBe(0);
				});

				it('negative start counts from end', () => {
					const r = b.slice({ start: -2, amount: 2 });
					expect(r.toArray()).toEqual([40, 50]);
				});

				it('start after end returns empty', () => {
					const r = b.slice({ start: 3, end: 1 });
					expect(r.size).toBe(0);
				});
			});

			describe('mapIndexed (inherited)', () => {
				it('passes actual block index', () => {
					const b = makeBlock([100, 200, 300]);
					const r = b.mapIndexed((v: number, i: number) => `${v}:${i}`);
					expect(r.toArray()).toEqual(['100:0', '200:1', '300:2']);
				});

				it('indexOffset shifts indices', () => {
					const b = makeBlock([100, 200]);
					const r = b.mapIndexed((v: number, i: number) => `${v}:${i}`, {
						indexOffset: 10,
					});
					expect(r.toArray()).toEqual(['100:10', '200:11']);
				});
			});
		});

		describe('OuterBlock.mutation', () => {
			describe('prependBlockChild', () => {
				it('adds element to front', () => {
					const b = makeBlock([2, 3, 4]);
					const r = b._prependBlockChild(1);
					expect(r.toArray()).toEqual([1, 2, 3, 4]);
					expect(r.size).toBe(4);
				});

				it('does not mutate original', () => {
					const b = makeBlock([2, 3]);
					b._prependBlockChild(1);
					expect(b.toArray()).toEqual([2, 3]);
				});

				it('can overflow maxBlockSize with no error', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [1, 2, 3, 4]);
					const r = b._prependBlockChild(0);
					expect(r.size).toBe(5);
					expect(r._nrChildren).toBe(5);
					expect(r._childrenInMax).toBe(false);
				});

				it('single element becomes two', () => {
					const b = makeBlock([1]);
					const r = b._prependBlockChild(0);
					expect(r.toArray()).toEqual([0, 1]);
				});
			});

			describe('appendBlockChild', () => {
				it('adds element to back', () => {
					const b = makeBlock([1, 2, 3]);
					const r = b._appendBlockChild(4);
					expect(r.toArray()).toEqual([1, 2, 3, 4]);
					expect(r.size).toBe(4);
				});

				it('does not mutate original', () => {
					const b = makeBlock([1, 2]);
					b._appendBlockChild(3);
					expect(b.toArray()).toEqual([1, 2]);
				});

				it('can overflow maxBlockSize', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [1, 2, 3, 4]);
					const r = b._appendBlockChild(5);
					expect(r.size).toBe(5);
					expect(r._nrChildren).toBe(5);
					expect(r._childrenInMax).toBe(false);
				});

				it('single element becomes two', () => {
					const b = makeBlock([1]);
					const r = b._appendBlockChild(2);
					expect(r.toArray()).toEqual([1, 2]);
				});
			});

			describe('prepend', () => {
				it('delegates to prependBlockChild when there is room', () => {
					const b = makeBlock([2, 3]);
					const r = b.prepend(1);
					expect(r.toArray()).toEqual([1, 2, 3]);
					expect(r.size).toBe(3);
				});

				it('creates an OuterTree when block is full', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [2, 3, 4, 5]);
					const r = b.prepend(1);
					expect(r).toHaveProperty('left');
					expect(r).toHaveProperty('right');
					expect(r).toHaveProperty('middle');
					expect(r.size).toBe(5);
					expect(r.toArray()).toEqual([1, 2, 3, 4, 5]);
				});

				it('returns List.NonEmpty', () => {
					const b = makeBlock([1]);
					const r = b.prepend(0);
					expect(r.size).toBeGreaterThan(0);
				});
			});

			describe('append', () => {
				it('delegates to appendBlockChild when there is room', () => {
					const b = makeBlock([1, 2]);
					const r = b.append(3);
					expect(r.toArray()).toEqual([1, 2, 3]);
					expect(r.size).toBe(3);
				});

				it('creates an OuterTree when block is full', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [1, 2, 3, 4]);
					const r = b.append(5);
					expect(r).toHaveProperty('left');
					expect(r).toHaveProperty('right');
					expect(r).toHaveProperty('middle');
					expect(r.size).toBe(5);
					expect(r.toArray()).toEqual([1, 2, 3, 4, 5]);
				});

				it('returns List.NonEmpty', () => {
					const b = makeBlock([1]);
					const r = b.append(2);
					expect(r.size).toBeGreaterThan(0);
				});
			});
		});

		describe('OuterBlock.child-manipulation', () => {
			describe('dropFirstChild', () => {
				it('returns reduced block and the dropped element', () => {
					const b = makeBlock([10, 20, 30, 40]);
					const [nb, dropped] = b._dropFirstChild();
					expect(dropped).toBe(10);
					expect(nb.toArray()).toEqual([20, 30, 40]);
					expect(nb.size).toBe(3);
				});

				it('does not mutate original', () => {
					const b = makeBlock([10, 20, 30]);
					b._dropFirstChild();
					expect(b.toArray()).toEqual([10, 20, 30]);
				});

				it('drops single remaining element for blockSizeBits=2', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [42, 99]);
					const [nb, dropped] = b._dropFirstChild();
					expect(dropped).toBe(42);
					expect(nb.size).toBe(1);
					expect(nb.toArray()).toEqual([99]);
				});
			});

			describe('dropLastChild', () => {
				it('returns reduced block and the dropped element', () => {
					const b = makeBlock([10, 20, 30, 40]);
					const [nb, dropped] = b._dropLastChild();
					expect(dropped).toBe(40);
					expect(nb.toArray()).toEqual([10, 20, 30]);
					expect(nb.size).toBe(3);
				});

				it('does not mutate original', () => {
					const b = makeBlock([10, 20, 30]);
					b._dropLastChild();
					expect(b.toArray()).toEqual([10, 20, 30]);
				});

				it('drops single remaining element', () => {
					const ctx = makeContext(2);
					const b = factory(ctx, [42, 99]);
					const [nb, dropped] = b._dropLastChild();
					expect(dropped).toBe(99);
					expect(nb.size).toBe(1);
					expect(nb.toArray()).toEqual([42]);
				});
			});

			describe('takeChildren', () => {
				const b = makeBlock([10, 20, 30, 40, 50]);

				it('positive amount takes from front', () => {
					const r = b._takeChildren(2 as Int);
					expect(r.toArray()).toEqual([10, 20]);
				});

				it('zero takes nothing (empty block)', () => {
					const r = b._takeChildren(0 as Int);
					expect(r.size).toBe(0);
				});

				it('amount equals size takes everything', () => {
					const r = b._takeChildren(5 as Int);
					expect(r.toArray()).toEqual([10, 20, 30, 40, 50]);
				});

				it('negative amount takes from end', () => {
					const r = b._takeChildren(-2 as Int);
					expect(r.toArray()).toEqual([40, 50]);
				});

				it('negative amount = -size takes everything', () => {
					const r = b._takeChildren(-5 as Int);
					expect(r.toArray()).toEqual([10, 20, 30, 40, 50]);
				});

				it('does not mutate original', () => {
					b._takeChildren(2 as Int);
					expect(b.toArray()).toEqual([10, 20, 30, 40, 50]);
				});

				it('amount 1 returns single element', () => {
					const r = b._takeChildren(1 as Int);
					expect(r.toArray()).toEqual([10]);
				});

				it('amount -1 returns last element only', () => {
					const r = b._takeChildren(-1 as Int);
					expect(r.toArray()).toEqual([50]);
				});

				it('amount = size-1 takes n-1 from front', () => {
					const r = b._takeChildren(4 as Int);
					expect(r.toArray()).toEqual([10, 20, 30, 40]);
				});

				it('amount = -(size-1) takes n-1 from end', () => {
					const r = b._takeChildren(-4 as Int);
					expect(r.toArray()).toEqual([20, 30, 40, 50]);
				});
			});

			describe('dropChildren', () => {
				const b = makeBlock([10, 20, 30, 40, 50]);

				it('positive amount drops from front', () => {
					const r = b._dropChildren(2 as Int);
					expect(r.toArray()).toEqual([30, 40, 50]);
				});

				it('zero drops nothing', () => {
					const r = b._dropChildren(0 as Int);
					expect(r.toArray()).toEqual([10, 20, 30, 40, 50]);
				});

				it('amount equals size drops everything', () => {
					const r = b._dropChildren(5 as Int);
					expect(r.size).toBe(0);
				});

				it('negative amount drops from end', () => {
					const r = b._dropChildren(-2 as Int);
					expect(r.toArray()).toEqual([10, 20, 30]);
				});

				it('negative amount = -size drops everything', () => {
					const r = b._dropChildren(-5 as Int);
					expect(r.size).toBe(0);
				});

				it('does not mutate original', () => {
					b._dropChildren(2 as Int);
					expect(b.toArray()).toEqual([10, 20, 30, 40, 50]);
				});

				it('drop 1 removes first', () => {
					const r = b._dropChildren(1 as Int);
					expect(r.toArray()).toEqual([20, 30, 40, 50]);
				});

				it('drop -1 removes last', () => {
					const r = b._dropChildren(-1 as Int);
					expect(r.toArray()).toEqual([10, 20, 30, 40]);
				});

				it('drop size-1 leaves last element', () => {
					const r = b._dropChildren(4 as Int);
					expect(r.toArray()).toEqual([50]);
				});

				it('drop -(size-1) leaves first element', () => {
					const r = b._dropChildren(-4 as Int);
					expect(r.toArray()).toEqual([10]);
				});
			});

			describe('copyChildren', () => {
				it('returns a safe mutable copy', () => {
					const b = makeBlock([1, 2, 3]);
					const orig = b.toArray();
					const copy = b._copyChildren();
					b.context.childrenOps.mutateAppend(copy, 4);
					expect(b.toArray()).toEqual(orig);
				});

				it('copy is safe to mutate independently', () => {
					const b = makeBlock([1, 2, 3]);
					const copy = b._copyChildren();
					b.context.childrenOps.mutateAppend(copy, 4);
					const fromCopy = b.context.childrenOps.toArray(copy);
					expect(fromCopy).toEqual([1, 2, 3, 4]);
					expect(b.toArray()).toEqual([1, 2, 3]);
				});
			});
		});

		describe('OuterBlock.conversion', () => {
			describe('toBuilder', () => {
				it('creates a builder with the same elements', () => {
					const b = makeBlock([10, 20, 30]);
					const builder = b.toBuilder();
					expect(builder.size).toBe(3);
					expect(builder.get(0 as Int.AtLeastZero)).toBe(10);
					expect(builder.get(1 as Int.AtLeastZero)).toBe(20);
					expect(builder.get(2 as Int.AtLeastZero)).toBe(30);
				});

				it('builder can append and build', () => {
					const b = makeBlock([1, 2]);
					const builder = b.toBuilder();
					builder.append(3);
					const built = builder.build();
					expect(built.toArray()).toEqual([1, 2, 3]);
				});

				it('builder is independent of source', () => {
					const b = makeBlock([1, 2]);
					const builder = b.toBuilder();
					builder.append(3);
					expect(b.toArray()).toEqual([1, 2]);
				});
			});
		});

		describe('OuterBlock.immutability', () => {
			it('toArray returns a frozen array snapshot', () => {
				const b = makeBlock([1, 2, 3]);
				const arr = b.toArray();
				expect(arr).toEqual([1, 2, 3]);

				const arr2 = b.toArray();
				expect(arr).toEqual(arr2);
			});

			it('prependBlockChild returns new instance', () => {
				const b = makeBlock([1, 2]);
				const r = b._prependBlockChild(0);
				expect(r).not.toBe(b);
			});

			it('appendBlockChild returns new instance', () => {
				const b = makeBlock([1, 2]);
				const r = b._appendBlockChild(3);
				expect(r).not.toBe(b);
			});

			it('filter returning all-elements returns same instance', () => {
				const b = makeBlock([1, 2, 3]);
				const r = b.filter(() => true);
				expect(r).toBe(b);
			});

			it('take returning full range returns same instance', () => {
				const b = makeBlock([1, 2, 3]);
				const r = b.take(3);
				expect(r).toBe(b);
			});

			it('drop 0 returns same instance', () => {
				const b = makeBlock([1, 2, 3]);
				const r = b.drop(0);
				expect(r).toBe(b);
			});
		});

		describe('OuterBlock.edge-cases', () => {
			describe('empty block handling', () => {
				it('take 0 on single-element returns empty list', () => {
					const b = makeBlock([7]);
					const r = b.take(0);
					expect(r.size).toBe(0);
				});

				it('drop to empty on single-element', () => {
					const b = makeBlock([7]);
					const r = b.drop(1);
					expect(r.size).toBe(0);
				});

				it('filter all-out on single-element', () => {
					const b = makeBlock([7]);
					const r = b.filter(() => false);
					expect(r.size).toBe(0);
				});

				it('copyChildren on single-element block', () => {
					const b = makeBlock([7]);
					const copy = b._copyChildren();
					expect(b.context.childrenOps.toArray(copy)).toEqual([7]);
				});
			});

			describe('large blocks with default blockSizeBits=5', () => {
				const values = Array.from({ length: 25 }, (_, i) => i);
				const b = makeBlock(values);

				it('at on large block', () => {
					expect(b.at(0)).toBe(0);
					expect(b.at(12)).toBe(12);
					expect(b.at(24)).toBe(24);
					expect(b.at(-1)).toBe(24);
					expect(b.at(25)).toBeUndefined();
				});

				it('take and drop on large block', () => {
					expect(b.take(5).toArray()).toEqual([0, 1, 2, 3, 4]);
					expect(b.drop(5).toArray()).toEqual(values.slice(5));
				});

				it('forEach visits all 25', () => {
					let count = 0;
					b.forEach(() => count++);
					expect(count).toBe(25);
				});

				it('stream reversed', () => {
					const result = [...b.stream({ reversed: true })];
					expect(result).toEqual(values.toReversed());
				});

				it('map over all elements', () => {
					const r = [...b.map((x) => x * 2).stream()];
					expect(r).toEqual(values.map((x) => x * 2));
				});
			});

			describe('string element type', () => {
				const b = makeBlock(['a', 'b', 'c']);

				it('preserves element type', () => {
					expect(b.at(0)).toBeTypeOf('string');
					expect(b.first()).toBe('a');
					expect(b.last()).toBe('c');
				});

				it('map to different type', () => {
					const r = b.map((s) => s.length);
					expect(r.toArray()).toEqual([1, 1, 1]);
				});

				it('stream', () => {
					expect(b.stream().toArray()).toEqual(['a', 'b', 'c']);
				});

				it('filter with type predicate', () => {
					const br = makeBlock(['a', '', 'b'] as const);
					const r = br.filter((s) => s.length > 0);
					expect(r.toArray()).toEqual(['a', 'b']);
				});
			});

			describe('boolean element type', () => {
				const b = makeBlock([true, false, true]);

				it('preserves boolean values', () => {
					expect(b.at(0)).toBe(true);
					expect(b.at(1)).toBe(false);
					expect(b.at(2)).toBe(true);
				});

				it('filter identity on booleans', () => {
					const r = b.filter(Boolean);
					expect(r.toArray()).toEqual([true, true]);
				});
			});

			describe('null/undefined elements', () => {
				it('null elements', () => {
					const b = makeBlock([1, null, 3] as (number | null)[]);
					expect(b.at(0)).toBe(1);
					expect(b.at(1)).toBeNull();
					expect(b.at(2)).toBe(3);
				});

				it('undefined elements', () => {
					const b = makeBlock([1, undefined, 3] as (number | undefined)[]);
					expect(b.at(0)).toBe(1);
					expect(b.at(1)).toBeUndefined();
					expect(b.at(2)).toBe(3);
				});

				it('otherwise fallback works with null', () => {
					const b = makeBlock([null] as null[]);
					expect(b.at(0)).toBeNull();
					expect(b.at(1, 'default')).toBe('default');
				});

				it('otherwise fallback works with undefined', () => {
					const b = makeBlock([undefined] as undefined[]);
					expect(b.at(0)).toBeUndefined();
					expect(b.at(1, 'fallback')).toBe('fallback');
				});
			});
		});
	});
}

runOuterBlockTests(
	(ctx, values) => ctx.outerBlockLeftRight(ctx.childrenOps.of(values)),
	<T>(values: T[], blockSizeBits = 5) => {
		const ctx = makeContext<T>(blockSizeBits);
		return ctx.outerBlockLeftRight(ctx.childrenOps.of(values));
	},
	'OuterBlockLeftRight',
);

runOuterBlockTests(
	(ctx, values) =>
		ctx.outerBlockRightLeft(ctx.childrenOps.of(values.toReversed())),
	<T>(values: T[], blockSizeBits = 5) => {
		const ctx = makeContext<T>(blockSizeBits);
		return ctx.outerBlockRightLeft(ctx.childrenOps.of(values.toReversed()));
	},
	'OuterBlockRightLeft',
);
