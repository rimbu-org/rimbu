import { describe, expect, it } from 'bun:test';

import type { ListContext } from '#list/context-module';

import { ListHelpers } from '#list/list-helpers';

const context = ListHelpers.createListContext({
	blockSizeBits: 2, // maxBlockSize = 4
}) as unknown as ListContext<ListHelpers.TypesImpl>;

describe('OuterTree Structural Transitions', () => {
	it('should be an OuterTree with no middle when length <= maxBlockSize * 2', () => {
		// 4 (max) + 4 (max) = 8. If length is 8, middle is null.
		const result = context
			.outerBlock([1, 2, 3, 4])
			.append(5)
			.append(6)
			.append(7)
			.append(8);

		if (!context.isOuterTree<number>(result)) {
			// expect this not to happen
			throw new Error('Expected result to be an OuterTree');
		}
		expect(result._verifyStructure()).toEqual([]);

		expect(result.length).toBe(8);
		expect(result.middle).toBeNull();
		expect(result.left.children).toEqual([1, 2, 3, 4] as any);
		expect(result.right.children).toEqual([5, 6, 7, 8] as any);
	});

	it('should have a middle node when length > maxBlockSize * 2', () => {
		// Length 9 (8 + 1) should trigger a middle node.
		const result = context
			.outerBlock([1, 2, 3, 4])
			.append(5)
			.append(6)
			.append(7)
			.append(8)
			.append(9);

		if (!context.isOuterTree<number>(result)) {
			throw new Error('Expected result to be an OuterTree');
		}

		expect(result.length).toBe(9);
		if (!context.isInnerBlock<number, any>(result.middle)) {
			throw new Error('Expected middle to be an InnerBlock');
		}
		expect(result.middle.children[0].children).toEqual([5, 6, 7, 8] as any);
	});

	it('should transition from OuterTree to OuterBlock when size decreases below minTreeLength', () => {
		// Start with 5 elements (Tree)
		const result = context.of(1, 2, 3, 4, 5).drop(2);
		if (!context.isOuterBlock<number>(result)) {
			throw new Error('Expected result to be an OuterBlock');
		}
		expect(result.length).toBe(3);
		expect(result.children).toEqual([3, 4, 5] as any);
	});

	it('should maintain correct element order across structural changes', () => {
		const result = context
			.outerBlock([1, 2, 3, 4])
			.append(5)
			.append(6)
			.append(7)
			.append(8)
			.append(9);

		if (!context.isOuterTree<number>(result)) {
			throw new Error('Expected result to be an OuterTree');
		}

		expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});
});
