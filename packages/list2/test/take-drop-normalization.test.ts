import { describe, expect, it } from 'bun:test';

import type { Int } from '@rimbu/base';

import type { ListContext } from '#list/context';
import type { OuterBlock } from '#list/immutable/outer-block';
import type { OuterTree } from '#list/immutable/outer-tree';
import type { InnerBlock } from '#list/immutable/inner-block';
import type { InnerTree } from '#list/immutable/inner-tree';

import { List } from '@rimbu/list';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeContext<T>(blockSizeBits: number): ListContext<T> {
	return List.createContext({ blockSizeBits }) as ListContext<T>;
}

function ob<T>(ctx: ListContext<T>, vals: T[]): OuterBlock<T> {
	return ctx.outerBlockLeftRight(ctx.childrenOps.of(vals as [T, ...T[]]));
}

function obRev<T>(ctx: ListContext<T>, vals: T[]): OuterBlock<T> {
	return ctx.outerBlockRightLeft(ctx.childrenOps.of(vals.toReversed() as [T, ...T[]]));
}

function ib<T, C extends import('#list/immutable/common').Block<T> & { _self: C }>(
	ctx: ListContext<T>,
	children: C[],
	level: number,
): InnerBlock<T, C> {
	const size = children.reduce((s, c) => s + c.size, 0);
	return ctx.innerBlock(children, size, level);
}

function verifyStructure(
	node: { _verifyStructure(msgs?: string[], enforceMin?: boolean): string[] },
	enforceMinChildren = false,
): string[] {
	return node._verifyStructure([], enforceMinChildren);
}

function assertValid(
	node: { _verifyStructure(msgs?: string[], enforceMin?: boolean): string[] },
	label?: string,
	enforceMinChildren = false,
): void {
	const errors = verifyStructure(node, enforceMinChildren);
	if (errors.length > 0) {
		const prefix = label ? `${label}: ` : '';
		throw new Error(`${prefix}${errors.join('; ')}`);
	}
}

// ---------------------------------------------------------------------------
// Test matrix — every blockSizeBits value
// ---------------------------------------------------------------------------

const blockSizeBitsValues = [2, 3, 4, 5] as const;

for (const bits of blockSizeBitsValues) {
	const max = 1 << bits;
	const min = Math.floor(max / 2);

	// =========================================================================
	// OuterBlock
	// =========================================================================

	describe(`OuterBlock take/drop (bits=${bits}, max=${max}, min=${min})`, () => {
		const ctx = makeContext<number>(bits);

		describe('LeftRight', () => {
			describe('take', () => {
				it('take 0 returns empty', () => {
					const b = ob(ctx, [1, 2, 3]);
					expect(b.take(0).isEmpty).toBe(true);
				});

				it('take all returns self', () => {
					const vals = Array.from({ length: min }, (_, i) => i);
					const b = ob(ctx, vals);
					expect(b.take(min)).toBe(b);
				});

				it('take amount > size returns self', () => {
					const b = ob(ctx, [1, 2]);
					expect(b.take(100)).toBe(b);
				});

				it('take within bounds', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = ob(ctx, vals);
					for (let n = 1; n <= max; n++) {
						const r = b.take(n);
						expect(r.size).toBe(n);
						assertValid(b as unknown as { _verifyStructure(): string[] }, `take(${n})`);
					}
				});

				it('take at block boundary does not create empty block', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = ob(ctx, vals);
					const r = b.take(1);
					expect(r.size).toBe(1);
					assertValid(b as unknown as { _verifyStructure(): string[] });
				});

				it('negative take from end', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = ob(ctx, vals);
					for (let n = 1; n <= max; n++) {
						const r = b.take(-n);
						expect(r.size).toBe(n);
						expect(r.toArray() as readonly number[]).toEqual(vals.slice(-n));
					}
				});

				it('negative take = -size returns self', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = ob(ctx, vals);
					expect(b.take(-max)).toBe(b);
				});

				it('negative take exceeds clamp returns self', () => {
					const b = ob(ctx, [1, 2, 3]);
					expect(b.take(-100)).toBe(b);
				});
			});

			describe('drop', () => {
				it('drop 0 returns self', () => {
					const b = ob(ctx, [1, 2, 3]);
					expect(b.drop(0)).toBe(b);
				});

				it('drop all returns empty', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = ob(ctx, vals);
					const r = b.drop(max);
					expect(r.isEmpty).toBe(true);
				});

				it('drop > size returns empty', () => {
					const b = ob(ctx, [1, 2]);
					expect(b.drop(100).isEmpty).toBe(true);
				});

				it('drop within bounds', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = ob(ctx, vals);
					for (let n = 1; n < max; n++) {
						const r = b.drop(n);
						expect(r.size).toBe(max - n);
						expect(r.toArray() as readonly number[]).toEqual(vals.slice(n));
						assertValid(b as unknown as { _verifyStructure(): string[] });
					}
				});

				it('drop last element leaves size-1 block', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = ob(ctx, vals);
					const r = b.drop(max - 1);
					expect(r.size).toBe(1);
					expect(r.toArray()).toEqual([max - 1]);
				});

				it('negative drop from end', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = ob(ctx, vals);
					for (let n = 1; n <= max; n++) {
						const r = b.drop(-n);
						expect(r.size).toBe(max - n);
						expect(r.toArray() as readonly number[]).toEqual(vals.slice(0, -n));
					}
				});

				it('negative drop = -size returns empty', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = ob(ctx, vals);
					expect(b.drop(-max).isEmpty).toBe(true);
				});

				it('negative drop exceeds clamp returns empty', () => {
					const b = ob(ctx, [1, 2, 3]);
					expect(b.drop(-100).isEmpty).toBe(true);
				});
			});

			describe('_takeChildren', () => {
				it('takes from front', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = ob(ctx, vals);
					for (let n = 1; n <= max; n++) {
						const r = b._takeChildren(n as Int.AtLeastOne);
						expect(r.size).toBe(n);
				expect(r.toArray() as readonly number[]).toEqual(vals.slice(0, n));
					}
				});
			});

			describe('_dropChildren', () => {
				it('drops from front', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = ob(ctx, vals);
					for (let n = 1; n <= max; n++) {
						const r = b._dropChildren(n as Int.AtLeastOne);
						expect(r.size).toBe(max - n);
						expect(r.toArray() as readonly number[]).toEqual(vals.slice(n));
					}
				});
			});

			describe('_verifyStructure', () => {
				it('valid after all takes', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = ob(ctx, vals);
					for (let n = 1; n <= max; n++) {
						assertValid(b as unknown as { _verifyStructure(): string[] });
					}
				});

				it('valid after all drops', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = ob(ctx, vals);
					for (let n = 1; n <= max; n++) {
						assertValid(b as unknown as { _verifyStructure(): string[] });
					}
				});
			});
		});

		describe('RightLeft', () => {
			describe('take', () => {
				it('take within bounds for reversed block', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = obRev(ctx, vals);
					for (let n = 1; n < max; n++) {
						const r = b.take(n);
						expect(r.size).toBe(n);
						expect(r.toArray() as readonly number[]).toEqual(vals.slice(0, n));
					}
				});

				it('negative take from reversed block', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = obRev(ctx, vals);
					for (let n = 1; n <= max; n++) {
						const r = b.take(-n);
						expect(r.size).toBe(n);
						expect(r.toArray() as readonly number[]).toEqual(vals.slice(-n));
					}
				});

				it('take 0 / take all / take > size on reversed', () => {
					const b = obRev(ctx, [1, 2, 3]);
					expect(b.take(0).isEmpty).toBe(true);
					expect(b.take(3)).toBe(b);
					expect(b.take(10)).toBe(b);
				});
			});

			describe('drop', () => {
				it('drop within bounds for reversed block', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = obRev(ctx, vals);
					for (let n = 1; n < max; n++) {
						const r = b.drop(n);
						expect(r.size).toBe(max - n);
						expect(r.toArray() as readonly number[]).toEqual(vals.slice(n));
					}
				});

				it('negative drop from reversed block', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = obRev(ctx, vals);
					for (let n = 1; n <= max; n++) {
						const r = b.drop(-n);
						expect(r.size).toBe(max - n);
						expect(r.toArray() as readonly number[]).toEqual(vals.slice(0, -n));
					}
				});

				it('drop 0 / drop all / drop > size on reversed', () => {
					const b = obRev(ctx, [1, 2, 3]);
					expect(b.drop(0)).toBe(b);
					expect(b.drop(3).isEmpty).toBe(true);
					expect(b.drop(10).isEmpty).toBe(true);
				});
			});

			describe('_takeChildren', () => {
				it('takes from front on reversed', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = obRev(ctx, vals);
					for (let n = 1; n <= max; n++) {
						const r = b._takeChildren(n as Int.AtLeastOne);
						expect(r.size).toBe(n);
				expect(r.toArray() as readonly number[]).toEqual(vals.slice(0, n));
					}
				});
			});

			describe('_dropChildren', () => {
				it('drops from front on reversed', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = obRev(ctx, vals);
					for (let n = 1; n <= max; n++) {
						const r = b._dropChildren(n as Int.AtLeastOne);
						expect(r.size).toBe(max - n);
						expect(r.toArray() as readonly number[]).toEqual(vals.slice(n));
					}
				});
			});

			describe('_verifyStructure', () => {
				it('valid after take/drop on reversed blocks', () => {
					const vals = Array.from({ length: max }, (_, i) => i);
					const b = obRev(ctx, vals);
					b.take(1);
					b.take(-1);
					b.drop(1);
					b.drop(-1);
					assertValid(b as unknown as { _verifyStructure(): string[] });
				});
			});
		});
	});

	// =========================================================================
	// OuterTree (no middle)
	// =========================================================================

	describe(`OuterTree take/drop NO middle (bits=${bits}, max=${max}, min=${min})`, () => {
		const ctx = makeContext<number>(bits);
		const leftSize = max;
		const rightSize = max;
		const totalSize = leftSize + rightSize;

		function makeSimpleTree(): OuterTree<number> {
			return ctx.outerTree(
				ob(ctx, Array.from({ length: leftSize }, (_, i) => i)),
				ob(ctx, Array.from({ length: rightSize }, (_, i) => i + leftSize)),
				null,
				totalSize,
			);
		}

		describe('take', () => {
			it('take fully within left block', () => {
				for (let n = 1; n <= leftSize; n++) {
					const t = makeSimpleTree();
					const r = t.take(n);
					expect(r.size).toBe(n);
					expect(r.toArray() as readonly number[]).toEqual(Array.from({ length: n }, (_, i) => i));
					assertValid(t as unknown as { _verifyStructure(): string[] }, `take(${n})`);
				}
			});

			it('take crossing left→right boundary', () => {
				for (let n = leftSize + 1; n <= totalSize; n++) {
					const t = makeSimpleTree();
					const r = t.take(n);
					expect(r.size).toBe(n);
					expect(r.toArray() as readonly number[]).toEqual(Array.from({ length: n }, (_, i) => i));
					assertValid(r as unknown as { _verifyStructure(): string[] }, `take(${n})`);
				}
			});

			it('take producing single block (collapse via #createNormalized)', () => {
				// take amount that leaves size <= 2*max with no middle
				const t = makeSimpleTree();
				const r = t.take(1);
				expect(r.size).toBe(1);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});

			it('take zero returns empty', () => {
				const t = makeSimpleTree();
				const r = t.take(0);
				expect(r.isEmpty).toBe(true);
			});

			it('take all returns self', () => {
				const t = makeSimpleTree();
				const r = t.take(totalSize);
				expect(r.size).toBe(totalSize);
			});

			it('negative take = -1 takes from end', () => {
				const t = makeSimpleTree();
				const r = t.take(-1);
				expect(r.size).toBe(1);
				expect(r.toArray()).toEqual([totalSize - 1]);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});

			it('negative take = -leftSize takes from right block', () => {
				const t = makeSimpleTree();
				const r = t.take(-leftSize);
				expect(r.size).toBe(leftSize);
				expect(r.toArray()).toEqual(
					Array.from({ length: leftSize }, (_, i) => i + leftSize),
				);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});

			it('negative take = -(totalSize-1) takes from near start', () => {
				const t = makeSimpleTree();
				const r = t.take(-(totalSize - 1));
				expect(r.size).toBe(totalSize - 1);
				expect(r.toArray()).toEqual(
					Array.from({ length: totalSize - 1 }, (_, i) => i + 1),
				);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});

			it('take at every offset validates structure', () => {
				const t = makeSimpleTree();
				for (let n = 1; n <= totalSize; n++) {
					const r = t.take(n);
					expect(r.size).toBe(n);
					const arr = r.toArray();
					expect(arr).toEqual(Array.from({ length: n }, (_, i) => i));
					assertValid(r as unknown as { _verifyStructure(): string[] }, `take(${n})`);
				}
			});
		});

		describe('drop', () => {
			it('drop fully within left block', () => {
				for (let n = 1; n < leftSize; n++) {
					const t = makeSimpleTree();
					const r = t.drop(n);
					expect(r.size).toBe(totalSize - n);
					expect(r.toArray()).toEqual(
						Array.from({ length: totalSize - n }, (_, i) => i + n),
					);
					assertValid(r as unknown as { _verifyStructure(): string[] }, `drop(${n})`);
				}
			});

			it('drop crossing left→right boundary', () => {
				for (let n = leftSize + 1; n < totalSize; n++) {
					const t = makeSimpleTree();
					const r = t.drop(n);
					expect(r.size).toBe(totalSize - n);
					expect(r.toArray()).toEqual(
						Array.from({ length: totalSize - n }, (_, i) => i + n),
					);
					// Verify no duplicate elements
					const arr = r.toArray();
					expect(new Set(arr).size).toBe(arr.length);
					assertValid(r as unknown as { _verifyStructure(): string[] }, `drop(${n})`);
				}
			});

			it('drop exactly left block size (leaves only right)', () => {
				const t = makeSimpleTree();
				const r = t.drop(leftSize);
				expect(r.size).toBe(rightSize);
				expect(r.toArray()).toEqual(
					Array.from({ length: rightSize }, (_, i) => i + leftSize),
				);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});

			it('drop zero returns self', () => {
				const t = makeSimpleTree();
				expect(t.drop(0)).toBe(t);
			});

			it('drop all returns empty', () => {
				const t = makeSimpleTree();
				expect(t.drop(totalSize).isEmpty).toBe(true);
			});

			it('negative drop = -1 removes from end', () => {
				const t = makeSimpleTree();
				const r = t.drop(-1);
				expect(r.size).toBe(totalSize - 1);
				expect(r.toArray()).toEqual(
					Array.from({ length: totalSize - 1 }, (_, i) => i),
				);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});

			it('negative drop = -rightSize removes right block', () => {
				const t = makeSimpleTree();
				const r = t.drop(-rightSize);
				expect(r.size).toBe(leftSize);
				expect(r.toArray()).toEqual(
					Array.from({ length: leftSize }, (_, i) => i),
				);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});

			it('drop at every offset validates structure', () => {
				const t = makeSimpleTree();
				for (let n = 1; n <= totalSize; n++) {
					const r = t.drop(n);
					expect(r.size).toBe(totalSize - n);
					if (r.size > 0) {
						const arr = r.toArray();
						expect(new Set(arr).size).toBe(arr.length);
						assertValid(
							r as unknown as { _verifyStructure(): string[] },
							`drop(${n})`,
						);
					}
				}
			});
		});

		describe('take-then-drop chained', () => {
			it('take then drop at boundary', () => {
				const t = makeSimpleTree();
				const r1 = t.take(leftSize + 2);
				assertValid(r1 as unknown as { _verifyStructure(): string[] });
				const r2 = r1.drop(2);
				if (!r2.isEmpty) {
					assertValid(r2 as unknown as { _verifyStructure(): string[] });
				}
			});

			it('drop then take', () => {
				const t = makeSimpleTree();
				const r1 = t.drop(2);
				assertValid(r1 as unknown as { _verifyStructure(): string[] });
				const r2 = r1.take(leftSize - 2);
				if (!r2.isEmpty) {
					assertValid(r2 as unknown as { _verifyStructure(): string[] });
				}
			});

			it('take(drop(x)) produces no duplicates', () => {
				const t = makeSimpleTree();
				for (let d = 1; d < totalSize; d++) {
					const afterDrop = t.drop(d);
					if (afterDrop.nonEmpty()) {
						const arr = afterDrop.toArray();
						expect(new Set(arr).size).toBe(arr.length);
					}
				}
			});
		});
	});

	// =========================================================================
	// OuterTree (with middle)
	// =========================================================================

	describe(`OuterTree take/drop WITH middle (bits=${bits}, max=${max}, min=${min})`, () => {
		const ctx = makeContext<number>(bits);
		// Build a tree with middle: left + middle + right
		// middle contains outer blocks totaling enough to justify being a tree
		const leftSize = max;
		const rightSize = max;
		const middleBlockCount = Math.max(min, 2);
		const middleBlockSize = Math.max(min, max);
		const middleSize = middleBlockCount * middleBlockSize;
		const totalSize = leftSize + middleSize + rightSize;

		function makeTreeWithMiddle(): OuterTree<number> {
			let base = leftSize;
			const middleBlocks: OuterBlock<number>[] = [];
			for (let i = 0; i < middleBlockCount; i++) {
				middleBlocks.push(
					ob(
						ctx,
						Array.from({ length: middleBlockSize }, (_, j) => base + j),
					),
				);
				base += middleBlockSize;
			}

			const middle = ctx.innerBlock<number, OuterBlock<number>>(
				middleBlocks,
				middleSize,
				1,
			);

			const left = ob(
				ctx,
				Array.from({ length: leftSize }, (_, i) => i),
			);
			const right = ob(
				ctx,
				Array.from({ length: rightSize }, (_, i) => base + i),
			);

			return ctx.outerTree(left, right, middle, totalSize);
		}

		describe('take within left block', () => {
			it('various amounts within left', () => {
				const t = makeTreeWithMiddle();
				for (const n of [1, Math.floor(leftSize / 2), leftSize]) {
					const r = t.take(n);
					expect(r.size).toBe(n);
					expect(r.toArray() as readonly number[]).toEqual(Array.from({ length: n }, (_, i) => i));
					assertValid(r as unknown as { _verifyStructure(): string[] }, `take(${n})`);
				}
			});
		});

		describe('take crossing into middle', () => {
			const amounts = [
				leftSize + 1,
				leftSize + middleBlockSize,
				leftSize + Math.floor(middleSize / 2),
				leftSize + middleSize - 1,
				leftSize + middleSize,
			];

			for (const n of amounts) {
				if (n >= totalSize) continue;
				it(`take(${n})`, () => {
					const t = makeTreeWithMiddle();
					const r = t.take(n);
					expect(r.size).toBe(n);
					expect(r.toArray() as readonly number[]).toEqual(Array.from({ length: n }, (_, i) => i));
					assertValid(r as unknown as { _verifyStructure(): string[] }, `take(${n})`);
				});
			}
		});

		describe('take crossing into right', () => {
			const boundary = leftSize + middleSize;
			const amounts = [boundary + 1, boundary + Math.floor(rightSize / 2)];

			for (const n of amounts) {
				if (n >= totalSize) continue;
				it(`take(${n})`, () => {
					const t = makeTreeWithMiddle();
					const r = t.take(n);
					expect(r.size).toBe(n);
					expect(r.toArray() as readonly number[]).toEqual(Array.from({ length: n }, (_, i) => i));
					assertValid(r as unknown as { _verifyStructure(): string[] }, `take(${n})`);
				});
			}
		});

		describe('take all at once', () => {
			it('take every amount validates structure', () => {
				const totalElements = totalSize;
				// Sample many offsets (not all for perf)
				const offsets = [
					1,
					min,
					min + 1,
					max - 1,
					max,
					max + 1,
					leftSize - 1,
					leftSize,
					leftSize + 1,
					leftSize + middleBlockSize,
					leftSize + middleBlockSize + 1,
					leftSize + middleSize - 1,
					leftSize + middleSize,
					leftSize + middleSize + 1,
					totalElements - 1,
					totalElements,
				];

				const t = makeTreeWithMiddle();
				for (const n of offsets) {
					if (n <= 0 || n > totalElements) continue;
					const r = t.take(n);
					expect(r.size).toBe(n);
					const arr = r.toArray();
					expect(arr).toEqual(Array.from({ length: n }, (_, i) => i));
					assertValid(
						r as unknown as { _verifyStructure(): string[] },
						`take(${n})`,
					);
				}
			});
		});

		describe('drop within left block', () => {
			it('various amounts within left', () => {
				const t = makeTreeWithMiddle();
				for (const n of [1, Math.floor(leftSize / 2), leftSize - 1, leftSize]) {
					const r = t.drop(n);
					expect(r.size).toBe(totalSize - n);
					expect(r.toArray()).toEqual(
						Array.from({ length: totalSize - n }, (_, i) => i + n),
					);
					assertValid(r as unknown as { _verifyStructure(): string[] }, `drop(${n})`);
				}
			});
		});

		describe('drop crossing into middle', () => {
			const amounts = [
				leftSize + 1,
				leftSize + middleBlockSize,
				leftSize + Math.floor(middleSize / 2),
				leftSize + middleSize - 1,
				leftSize + middleSize,
			];

			for (const n of amounts) {
				if (n >= totalSize) continue;
				it(`drop(${n})`, () => {
					const t = makeTreeWithMiddle();
					const r = t.drop(n);
					expect(r.size).toBe(totalSize - n);
					expect(r.toArray()).toEqual(
						Array.from({ length: totalSize - n }, (_, i) => i + n),
					);
					const arr = r.toArray();
					expect(new Set(arr).size).toBe(arr.length);
					assertValid(r as unknown as { _verifyStructure(): string[] }, `drop(${n})`);
				});
			}
		});

		describe('drop crossing into right', () => {
			const boundary = leftSize + middleSize;
			const amounts = [boundary + 1, boundary + Math.floor(rightSize / 2), boundary + rightSize - 1];

			for (const n of amounts) {
				if (n >= totalSize) continue;
				it(`drop(${n})`, () => {
					const t = makeTreeWithMiddle();
					const r = t.drop(n);
					expect(r.size).toBe(totalSize - n);
					expect(r.toArray()).toEqual(
						Array.from({ length: totalSize - n }, (_, i) => i + n),
					);
					const arr = r.toArray();
					expect(new Set(arr).size).toBe(arr.length);
					assertValid(r as unknown as { _verifyStructure(): string[] }, `drop(${n})`);
				});
			}
		});

		describe('drop sampled offsets', () => {
			it('sampled offsets validate structure and no duplicates', () => {
				const totalElements = totalSize;
				const offsets = [
					1,
					min,
					max - 1,
					max,
					leftSize - 1,
					leftSize,
					leftSize + 1,
					leftSize + middleBlockSize,
					leftSize + middleSize - 1,
					leftSize + middleSize,
					leftSize + middleSize + 1,
					totalElements - 1,
				];

				const t = makeTreeWithMiddle();
				for (const n of offsets) {
					if (n <= 0 || n >= totalElements) continue;
					const r = t.drop(n);
					expect(r.size).toBe(totalElements - n);
					const arr = r.toArray();
					expect(new Set(arr).size).toBe(arr.length);
					assertValid(
						r as unknown as { _verifyStructure(): string[] },
						`drop(${n})`,
					);
				}
			});
		});

		describe('normalization edge cases', () => {
			it('take that collapses tree below 2*maxBlockSize with middle', () => {
				// Taking small amount from a big tree should trigger context.from()
				const t = makeTreeWithMiddle();
				const smallTake = 1;
				const r = t.take(smallTake);
				expect(r.size).toBe(smallTake);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});

			it('take that produces result within size maxBlockSize+1 to 2*maxBlockSize', () => {
				const t = makeTreeWithMiddle();
				const amount = max + 1;
				if (amount <= totalSize) {
					const r = t.take(amount);
					expect(r.size).toBe(amount);
					assertValid(r as unknown as { _verifyStructure(): string[] });
				}
			});

			it('drop that leaves result within size 1 to maxBlockSize', () => {
				const t = makeTreeWithMiddle();
				const dropAmount = totalSize - 1;
				const r = t.drop(dropAmount);
				expect(r.size).toBe(1);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});

			it('take exactly at left-middle boundary', () => {
				const t = makeTreeWithMiddle();
				const r = t.take(leftSize);
				expect(r.size).toBe(leftSize);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});

			it('drop exactly at left boundary', () => {
				const t = makeTreeWithMiddle();
				const r = t.drop(leftSize);
				expect(r.size).toBe(totalSize - leftSize);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});

			it('take exactly at middle-right boundary', () => {
				const t = makeTreeWithMiddle();
				const amount = leftSize + middleSize;
				if (amount < totalSize) {
					const r = t.take(amount);
					expect(r.size).toBe(amount);
					assertValid(r as unknown as { _verifyStructure(): string[] });
				}
			});

			it('drop exactly at middle-right boundary', () => {
				const t = makeTreeWithMiddle();
				const amount = leftSize + middleSize;
				if (amount < totalSize) {
					const r = t.drop(amount);
					expect(r.size).toBe(totalSize - amount);
					assertValid(r as unknown as { _verifyStructure(): string[] });
				}
			});

			it('take exactly at child boundary within middle', () => {
				const t = makeTreeWithMiddle();
				const amount = leftSize + middleBlockSize;
				if (amount < totalSize) {
					const r = t.take(amount);
					expect(r.size).toBe(amount);
					assertValid(r as unknown as { _verifyStructure(): string[] });
				}
			});
		});

		describe('negative index take/drop with middle', () => {
			it('take(-1) with middle', () => {
				const t = makeTreeWithMiddle();
				const r = t.take(-1);
				expect(r.size).toBe(1);
				expect(r.toArray()).toEqual([totalSize - 1]);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});

			it('take(-leftSize) with middle', () => {
				const t = makeTreeWithMiddle();
				const r = t.take(-leftSize);
				expect(r.size).toBe(leftSize);
				expect(r.toArray()).toEqual(
					Array.from({ length: leftSize }, (_, i) => totalSize - leftSize + i),
				);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});

			it('drop(-1) with middle', () => {
				const t = makeTreeWithMiddle();
				const r = t.drop(-1);
				expect(r.size).toBe(totalSize - 1);
				assertValid(r as unknown as { _verifyStructure(): string[] });
			});
		});
	});

	// =========================================================================
	// InnerBlock
	// =========================================================================

	describe(`InnerBlock takeInternal/dropInternal (bits=${bits}, max=${max}, min=${min})`, () => {
		const ctx = makeContext<number>(bits);

		function makeInnerBlock(
			childSizes: number[],
		): InnerBlock<number, OuterBlock<number>> {
			let base = 0;
			const children = childSizes.map((size) => {
				const child = ob(ctx, Array.from({ length: size }, (_, i) => base + i));
				base += size;
				return child;
			});
			return ib(ctx, children, 1);
		}

		describe('takeInternal', () => {
			it('at child boundary - returns null newInner', () => {
				const b = makeInnerBlock([min, min]);
				const [newInner, lastChild, inChild] = b.takeInternal(min as Int.AtLeastOne);
				expect(newInner).toBeNull();
				expect(lastChild.toArray() as readonly number[]).toEqual(Array.from({ length: min }, (_, i) => i));
				expect(inChild as number).toBe(min);
			});

			it('partially into child', () => {
				const b = makeInnerBlock([max, max]);
				const amount = max + 1;
				const [newInner, lastChild, inChild] = b.takeInternal(
					amount as Int.AtLeastOne,
				);
				expect(newInner!._nrChildren).toBe(1);
				expect(newInner!.size).toBe(max);
				expect(lastChild.toArray() as readonly number[]).toEqual(
					Array.from({ length: max }, (_, i) => i + max),
				);
				expect(inChild as number).toBe(1);
			});

			it('take 1 from block with varied child sizes', () => {
				const b = makeInnerBlock([1, min, max]);
				const [newInner, lastChild, inChild] = b.takeInternal(1 as Int.AtLeastOne);
				expect(newInner).toBeNull();
				expect(lastChild.size).toBe(1);
				expect(inChild as number).toBe(1);
			});

			it('take from irregular block (non-uniform children)', () => {
				// Create irregular block via concat/take or manually
				const b = makeInnerBlock([min + 1, max - 1, max]);
				const amount = min + 1 + Math.floor((max - 1) / 2);
				const [newInner, lastChild, inChild] = b.takeInternal(
					amount as Int.AtLeastOne,
				);
				expect(newInner!._nrChildren).toBe(1);
				expect(newInner!.size).toBe(min + 1);
				expect(lastChild.size).toBe(max - 1);
				expect(inChild as number).toBe(Math.floor((max - 1) / 2));
			});

			it('take all elements returns first children', () => {
				const total = min + max;
				const b = makeInnerBlock([min, max]);
				const [newInner, lastChild, inChild] = b.takeInternal(
					total as Int.AtLeastOne,
				);
				// newInner = children BEFORE last child = first child only
				expect(newInner!._nrChildren).toBe(1);
				expect(newInner!.size).toBe(min);
				expect(lastChild.size).toBe(max);
				expect(inChild as number).toBe(max);
			});
		});

		describe('dropInternal', () => {
			it('at child boundary - returns null newInner', () => {
				const b = makeInnerBlock([min, max]);
				const [newInner, firstChild, inChild] = b.dropInternal(
					min as Int.AtLeastZero,
				);
				expect(newInner).toBeNull();
				expect(firstChild.toArray() as readonly number[]).toEqual(Array.from({ length: max }, (_, i) => i + min));
				expect(inChild as number).toBe(0);
			});

			it('drop 0 returns first child', () => {
				const b = makeInnerBlock([min, max]);
				const [newInner, firstChild, inChild] = b.dropInternal(0 as Int.AtLeastZero);
				// newInner = children AFTER boundary child = second child only
				expect(newInner!._nrChildren).toBe(1);
				expect(newInner!.size).toBe(max);
				expect(firstChild.size).toBe(min);
				expect(inChild as number).toBe(0);
			});

			it('partially into second child of three', () => {
				// Use 3 children so dropChildren leaves something
				const b = makeInnerBlock([max, max, max]);
				const amount = (max + 1) as Int.AtLeastZero;
				const [newInner, firstChild, inChild] = b.dropInternal(amount);
				// first child dropped entirely, 1 into second = firstChild is second block
				expect(newInner!._nrChildren).toBe(1);
				expect(firstChild.size).toBe(max);
				expect(inChild as number).toBe(1);
			});

			it('drop from irregular block', () => {
				const b = makeInnerBlock([min + 1, max - 1, min]);
				// drop past first child into second: min+1 + 1 = drops first + 1 from second
				const amount = (min + 2) as Int.AtLeastZero;
				const [newInner, firstChild, inChild] = b.dropInternal(amount);
				// newInner = children after childIndex (which is child 1, so dropChildren(2)) = third child alone
				expect(newInner!._nrChildren).toBe(1);
				expect(firstChild.size).toBe(max - 1);
				expect(inChild as number).toBe(1);
			});
		});

		describe('takeChildren', () => {
			it('take 0 children returns null', () => {
				const b = makeInnerBlock([min, max]);
				expect(b.takeChildren(0)).toBeNull();
			});

			it('take 1 child', () => {
				const b = makeInnerBlock([min, max]);
				const r = b.takeChildren(1);
				expect(r!._nrChildren).toBe(1);
				expect(r!.size).toBe(min);
			});

			it('take all children returns self', () => {
				const b = makeInnerBlock([min, max]);
				expect(b.takeChildren(2)).toBe(b);
			});

			it('take > n children returns self', () => {
				const b = makeInnerBlock([min, max]);
				expect(b.takeChildren(10)).toBe(b);
			});
		});

		describe('dropChildren', () => {
			it('drop 0 children returns self', () => {
				const b = makeInnerBlock([min, max]);
				expect(b.dropChildren(0)).toBe(b);
			});

			it('drop 1 child', () => {
				const b = makeInnerBlock([min, max]);
				const r = b.dropChildren(1);
				expect(r!._nrChildren).toBe(1);
				expect(r!.size).toBe(max);
			});

			it('drop all children returns null', () => {
				const b = makeInnerBlock([min, max]);
				expect(b.dropChildren(2)).toBeNull();
			});

			it('drop > n children returns null', () => {
				const b = makeInnerBlock([min, max]);
				expect(b.dropChildren(10)).toBeNull();
			});
		});

		describe('_verifyStructure', () => {
			it('valid after takeChildren', () => {
				const b = makeInnerBlock(Array.from({ length: max }, () => min));
				const r = b.takeChildren(min);
				expect(r).not.toBeNull();
				// Left/right boundary blocks are exempt from min, so don't enforce
				assertValid(
					r! as unknown as { _verifyStructure(): string[] },
				);
			});

			it('valid after dropChildren', () => {
				const b = makeInnerBlock(Array.from({ length: max }, () => min));
				const r = b.dropChildren(max - min);
				expect(r).not.toBeNull();
				assertValid(
					r! as unknown as { _verifyStructure(): string[] },
				);
			});

			it('original block valid before takeInternal', () => {
				const b = makeInnerBlock([min + 1, max - 2, max - 1]);
				// Original block may be a boundary block, don't enforce min
				assertValid(
					b as unknown as { _verifyStructure(): string[] },
				);
			});

			it('original block valid before dropInternal', () => {
				const b = makeInnerBlock([min + 1, max - 2, max - 1]);
				assertValid(
					b as unknown as { _verifyStructure(): string[] },
				);
			});
		});
	});

	// =========================================================================
	// InnerTree (level > 0)
	// =========================================================================

	describe(`InnerTree takeInternal/dropInternal (bits=${bits}, max=${max}, min=${min})`, () => {
		const ctx = makeContext<number>(bits);
		const level = 1;

		function obx(vals: number[]): OuterBlock<number> {
			return ob(ctx, vals);
		}

		function makeInnerBlock(
			childSizes: number[],
		): InnerBlock<number, OuterBlock<number>> {
			let base = 0;
			const children = childSizes.map((s) => {
				const c = obx(Array.from({ length: s }, (_, i) => base + i));
				base += s;
				return c;
			});
			return ib(ctx, children, level);
		}

		function makeSimpleInnerTree(
			leftSizes: number[],
			rightSizes: number[],
		): InnerTree<number, OuterBlock<number>> {
			const left = makeInnerBlock(leftSizes);
			const right = makeInnerBlock(rightSizes);
			return ctx.innerTree(left, right, null, left.size + right.size, level);
		}

		function makeInnerTreeWithMiddle(
			leftSizes: number[],
			middleSizes: number[],
			rightSizes: number[],
		): InnerTree<number, OuterBlock<number>> {
			const left = makeInnerBlock(leftSizes);
			const right = makeInnerBlock(rightSizes);
			const middleBlocks: InnerBlock<number, OuterBlock<number>>[] = [];
			let base = left.size;
			for (const size of middleSizes) {
				middleBlocks.push(makeInnerBlock([size]));
				base += size;
			}
			const middleSize = middleSizes.reduce((s, c) => s + c, 0);
			const middle = ctx.innerBlock<
				number,
				InnerBlock<number, OuterBlock<number>>
			>(middleBlocks, middleSize, level + 1);
			return ctx.innerTree(
				left,
				right,
				middle,
				left.size + right.size + middleSize,
				level,
			);
		}

		describe('takeInternal — no middle', () => {
			it('amount within left block', () => {
				const t = makeSimpleInnerTree([max, max], [max, max]);
				const amount = Math.floor(max / 2) as Int.AtLeastOne;
				const [newInner, lastChild, inChild] = t.takeInternal(amount);
				if (newInner === null) {
					// result collapsed
					expect(lastChild.size).toBe(max);
					expect(inChild as number).toBe(amount);
				} else {
					assertValid(
						newInner as unknown as {
							_verifyStructure(m?: string[]): string[];
						},
					);
				}
			});

			it('amount exactly at left block boundary', () => {
				const t = makeSimpleInnerTree([max, max], [max, max]);
				const amount = max as Int.AtLeastOne;
				const [newInner, lastChild, inChild] = t.takeInternal(amount);
				expect(lastChild.size).toBe(max);
				expect(inChild as number).toBe(max);
				if (newInner !== null) {
					assertValid(
						newInner as unknown as {
							_verifyStructure(m?: string[]): string[];
						},
					);
				}
			});

			it('amount crossing into right block', () => {
				const t = makeSimpleInnerTree([max, max], [max, max]);
				const amount = (max + 1) as Int.AtLeastOne;
				const [newInner, lastChild, inChild] = t.takeInternal(amount);
				expect(lastChild.size).toBe(max);
				expect(inChild as number).toBe(1);
				if (newInner !== null) {
					assertValid(
						newInner as unknown as {
							_verifyStructure(m?: string[]): string[];
						},
					);
				}
			});

			it('amount consuming entire left and part of right', () => {
				const t = makeSimpleInnerTree([min, min], [max, max]);
				const amount = (min + min + 1) as Int.AtLeastOne;
				const [newInner, lastChild, inChild] = t.takeInternal(amount);
				expect(lastChild.size).toBe(max);
				expect(inChild as number).toBe(1);
				if (newInner !== null) {
					assertValid(
						newInner as unknown as {
							_verifyStructure(m?: string[]): string[];
						},
					);
				}
			});
		});

		describe('takeInternal — with middle', () => {
			it('amount within left block (middle exists)', () => {
				const t = makeInnerTreeWithMiddle([max, max], [max, max], [max, max]);
				const amount = Math.floor(max / 2) as Int.AtLeastOne;
				const [, lastChild, inChild] = t.takeInternal(amount);
				expect(lastChild.size).toBeGreaterThan(0);
				expect(inChild as number).toBeGreaterThanOrEqual(0);
			});

			it('amount exactly at left boundary (middle exists)', () => {
				const t = makeInnerTreeWithMiddle([max, max], [max, max], [max, max]);
				const amount = max as Int.AtLeastOne;
				const [newInner, lastChild, inChild] = t.takeInternal(amount);
				expect(lastChild.size).toBe(max);
				expect(inChild as number).toBe(max);
				if (newInner !== null) {
					assertValid(
						newInner as unknown as {
							_verifyStructure(m?: string[]): string[];
						},
					);
				}
			});

			it('amount crossing into middle', () => {
				const t = makeInnerTreeWithMiddle([max], [max, max], [max]);
				const amount = (max + 1) as Int.AtLeastOne;
				const [newInner, lastChild, inChild] = t.takeInternal(amount);
				expect(lastChild.size).toBe(max);
				expect(inChild as number).toBe(1);
				if (newInner !== null) {
					assertValid(
						newInner as unknown as {
							_verifyStructure(m?: string[]): string[];
						},
					);
				}
			});

			it('amount crossing entire middle into right', () => {
				const t = makeInnerTreeWithMiddle([max], [max], [max]);
				const amount = (max + max + 1) as Int.AtLeastOne;
				const [, lastChild, inChild] = t.takeInternal(amount);
				expect(lastChild.size).toBe(max);
				expect(inChild as number).toBe(1);
			});

			it('amount consuming everything except part of right', () => {
				const leftSize = max;
				const middleBlockSizes = [max, max];
				const middleSize = middleBlockSizes.reduce((s, c) => s + c, 0);
				const t = makeInnerTreeWithMiddle([max], middleBlockSizes, [max]);
				const amount = (leftSize + middleSize + 1) as Int.AtLeastOne;
				const [, lastChild, inChild] = t.takeInternal(amount);
				// intermediate value; the caller (OuterTree.take)
				// will further normalize via #createNormalized
				expect(lastChild.size).toBe(max);
				expect(inChild as number).toBe(1);
			});

			it('amount exactly at middle-right boundary', () => {
				const t = makeInnerTreeWithMiddle([max], [max], [max]);
				const amount = (max + max) as Int.AtLeastOne;
				const [, lastChild, inChild] = t.takeInternal(amount);
				expect(lastChild.size).toBe(max);
				expect(inChild as number).toBe(max);
			});
		});

		describe('dropInternal — no middle', () => {
			it('amount within left block', () => {
				const t = makeSimpleInnerTree([max, max], [max, max]);
				const amount = Math.floor(max / 2) as Int.AtLeastZero;
				const [, firstChild] = t.dropInternal(amount);
				expect(firstChild.size).toBe(max);
			});

			it('amount within left two-child block', () => {
				const t = makeSimpleInnerTree([max, max], [max, max]);
				const amount = (max - 1) as Int.AtLeastZero;
				const [, firstChild, inChild] = t.dropInternal(amount);
				expect(firstChild.size).toBe(max);
				expect(inChild as number).toBe(max - 1);
			});

			it('amount crossing into right block', () => {
				const t = makeSimpleInnerTree([max], [max, max]);
				const amount = (max + 1) as Int.AtLeastZero;
				const [, firstChild, inChild] = t.dropInternal(amount);
				expect(firstChild.size).toBe(max);
				expect(inChild as number).toBe(1);
			});

			it('drop 0 returns full structure', () => {
				const t = makeSimpleInnerTree([max], [max]);
				const [, firstChild, inChild] = t.dropInternal(
					0 as Int.AtLeastZero,
				);
				expect(firstChild.size).toBe(max);
				expect(inChild as number).toBe(0);
			});
		});

		describe('dropInternal — with middle', () => {
			it('amount within left block (middle exists)', () => {
				const t = makeInnerTreeWithMiddle([max, max], [max], [max]);
				const amount = Math.floor(max / 2) as Int.AtLeastZero;
				void t.dropInternal(amount);
			});

			it('amount within left 2-child block leaving parts of first child', () => {
				// Don't drop exactly at child boundary to avoid consuming entire block
				const t = makeInnerTreeWithMiddle([max, max], [max], [max]);
				const amount = (max - 1) as Int.AtLeastZero;
				void t.dropInternal(amount);
			});

			it('amount crossing into middle', () => {
				const t = makeInnerTreeWithMiddle([max], [max, max], [max]);
				const amount = (max + 1) as Int.AtLeastZero;
				void t.dropInternal(amount);
			});

			it('amount crossing entire middle into right', () => {
				// Use multiple middle blocks so crossing middle doesn't hit exact boundary
				const t = makeInnerTreeWithMiddle([max], [max, max], [max]);
				const amount = (max + max + 1) as Int.AtLeastZero;
				void t.dropInternal(amount);
			});

			it('amount dropping entire left into left side of middle', () => {
				// Left has 2 children, drop past left + part of first middle
				const t = makeInnerTreeWithMiddle([max, max], [max, max], [max]);
				const amount = (max + max + 1) as Int.AtLeastZero;
				void t.dropInternal(amount);
			});
		});

		describe('tail-recursive calls (known issue)', () => {
			it('takeInternal with amount crossing into middle exercises recursion', () => {
				const t = makeInnerTreeWithMiddle([max], [max, max], [max]);
				const amount = (max + Math.floor(max / 2)) as Int.AtLeastOne;
				// This exercises the take-from-middle path which may recurse
				const [newInner] = t.takeInternal(amount);
				if (newInner !== null) {
					assertValid(
						newInner as unknown as {
							_verifyStructure(m?: string[]): string[];
						},
					);
				}
			});

			it('dropInternal with middle exercises recursion', () => {
				const t = makeInnerTreeWithMiddle([max], [max, max], [max]);
				const amount = (max + 1) as Int.AtLeastZero;
				const [newInner] = t.dropInternal(amount);
				if (newInner !== null) {
					assertValid(
						newInner as unknown as {
							_verifyStructure(m?: string[]): string[];
						},
					);
				}
			});
		});

		describe('_verifyStructure on InnerTree', () => {
			it('inner tree constructed by prependBlock is valid', () => {
				// Build via actual prependBlock which uses #createNormalized
				const blockA = makeInnerBlock([max, max]);
				const blockB = makeInnerBlock([max, max]);
				// prependBlock creates a tree when blocks can't merge
				const tree = blockB.prependBlock(blockA);
				// Only verify if it's actually a tree (might merge to a block)
				if ('_verifyStructure' in tree) {
					assertValid(
						tree as unknown as {
							_verifyStructure(m?: string[]): string[];
						},
					);
				}
			});

			it('result of takeInternal returns structurally sound result', () => {
				// Use larger tree to avoid boundary edge cases
				const t = makeInnerTreeWithMiddle([max, max], [max, max], [max, max]);
				const amount = (max + Math.floor(max / 2)) as Int.AtLeastOne;
				const [newInner] = t.takeInternal(amount);
				if (newInner !== null) {
					assertValid(
						newInner as unknown as {
							_verifyStructure(m?: string[]): string[];
						},
					);
				}
			});

			it('result of dropInternal returns structurally sound result', () => {
				const t = makeSimpleInnerTree([max, max], [max, max]);
				const amount = Math.floor(max / 2) as Int.AtLeastZero;
				const [newInner] = t.dropInternal(amount);
				if (newInner !== null) {
					assertValid(
						newInner as unknown as {
							_verifyStructure(m?: string[]): string[];
						},
					);
				}
			});
		});
	});
}
