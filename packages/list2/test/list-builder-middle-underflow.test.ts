import { describe, expect, it } from 'bun:test';

import type { ListBuilder } from '#list/mutable/builder';

import { List } from '@rimbu/list';

function verifyStructure(list: List<number>): string[] {
	if (list.isEmpty) return [];
	return (
		list as unknown as { _verifyStructure(errors?: string[]): string[] }
	)._verifyStructure();
}

/**
 * KNOWN ISSUE: removing from the middle of an outer tree whose middle holds
 * exactly one child block can leave that block below minBlockSize.
 *
 * Root cause (see `list-verify-builder.test.ts` "a long mixed sequence" for
 * the original failing case):
 *
 * - `TreeBuilderBase.remove` (src/internal/mutable/tree-builder-base.ts)
 *   delegates middle-region removals entirely to `this.middle.remove()`, and
 *   `InnerBlockBuilder.remove` (src/internal/mutable/inner-block-builder.ts)
 *   early-exits when `this.nrChildren <= 1`, so a single-child middle never
 *   rebalances its child.
 * - `OuterTreeBuilder.normalized()` only collapses a tree with middle when
 *   `size <= 2 * maxBlockSize` (src/internal/mutable/outer-tree-builder.ts),
 *   so once the tree is above that threshold the underflow survives.
 *
 * The same bug exists in `@rimbu/list` (identical early-exit and same failing
 * sequence), so this is a shared design bug, not a list2 regression.
 */
describe('list builder middle underflow (known issue)', () => {
	const blockSizeBitsValues = [2, 3, 4, 5] as const;

	it.todo('a middle block that drops below minBlockSize stays invalid (repro)', () => {
		for (const blockSizeBits of blockSizeBitsValues) {
			const maxBlockSize = 1 << blockSizeBits;
			const minBlockSize = maxBlockSize >>> 1;
			const b = List.createContext({
				blockSizeBits,
			}).builder<number>() as ListBuilder<number>;

			// seed a full two-block tree
			for (let i = 0; i < 2 * maxBlockSize; i++) b.append(i);

			// insert into the right block region, forcing a split of the
			// full right block: its left half (exactly minBlockSize
			// elements) becomes the middle, its right half the new right
			// block. The middle now holds exactly one child at the
			// minimum allowed size.
			const middleStart = maxBlockSize;
			b.insertAt(middleStart + 1, 1000);
			b.insertAt(maxBlockSize + minBlockSize, 1001);

			// removing from the middle's single child drops it to
			// minBlockSize - 1; the tree is still above the
			// 2 * maxBlockSize collapse threshold, so nothing repairs it
			b.removeAt(middleStart + 1, undefined);

			const built = b.build();
			const errors = verifyStructure(built);
			const builderErrors = (
				b as unknown as { _verifyStructure(errors?: string[]): string[] }
			)._verifyStructure();

			expect(errors, `blockSizeBits=${blockSizeBits}`).toEqual([]);
			expect(builderErrors, `blockSizeBits=${blockSizeBits}`).toEqual([]);
		}
	});

	it('the minimal setup produces a valid tree with a single middle child at minBlockSize', () => {
		for (const blockSizeBits of blockSizeBitsValues) {
			const maxBlockSize = 1 << blockSizeBits;
			const minBlockSize = maxBlockSize >>> 1;
			const b = List.createContext({
				blockSizeBits,
			}).builder<number>() as ListBuilder<number>;

			for (let i = 0; i < 2 * maxBlockSize; i++) b.append(i);

			const middleStart = maxBlockSize;
			b.insertAt(middleStart + 1, 1000);
			b.insertAt(maxBlockSize + minBlockSize, 1001);

			const builtList = b.build();
			const built = builtList as unknown as {
				left: { size: number };
				right: { size: number };
				middle: { level: number; _nrChildren: number; size: number } | null;
			};

			expect(
				verifyStructure(builtList),
				`blockSizeBits=${blockSizeBits}`,
			).toEqual([]);
			expect(built.left.size, `blockSizeBits=${blockSizeBits}`).toBe(
				maxBlockSize,
			);
			expect(built.right.size, `blockSizeBits=${blockSizeBits}`).toBe(
				minBlockSize + 2,
			);
			expect(built.middle, `blockSizeBits=${blockSizeBits}`).not.toBeNull();
			expect(built.middle?.level, `blockSizeBits=${blockSizeBits}`).toBe(1);
			expect(built.middle?._nrChildren, `blockSizeBits=${blockSizeBits}`).toBe(
				1,
			);
			expect(built.middle?.size, `blockSizeBits=${blockSizeBits}`).toBe(
				minBlockSize,
			);
		}
	});
});
