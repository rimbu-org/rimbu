import { describe, expect, it } from 'bun:test';

import type { ListContext } from '#list/context-module';

import { ListHelpers } from '#list/list-helpers';

const context = ListHelpers.createListContext({
	blockSizeBits: 2, // maxBlockSize = 4 (2^2)
}) as unknown as ListContext<ListHelpers.TypesImpl>;

describe('OuterBlock Structural Transitions', () => {
	it('should remain an OuterBlock when size is within [1, maxBlockSize]', () => {
		// 1 element (min)
		const result1 = context.of(1);
		if (!context.isOuterBlock<number>(result1)) {
			throw new Error('Expected result to be an OuterBlock');
		}
		expect(result1.length).toBe(1);
		expect(result1.children).toEqual([1] as any);

		// 4 elements (max)
		const result4 = context.of(1, 2, 3, 4);
		if (!context.isOuterBlock<number>(result4)) {
			throw new Error('Expected result to be an OuterBlock');
		}
		expect(result4.length).toBe(4);
		expect(result4.children).toEqual([1, 2, 3, 4] as any);
	});

	it('should transition to OuterTree when size exceeds maxBlockSize', () => {
		// 5 elements (max + 1)
		const result5 = context.of(1, 2, 3, 4).append(5);

		if (!context.isOuterTree<number>(result5)) {
			throw new Error('Expected result to be an OuterTree');
		}
		expect(result5.length).toBe(5);
		expect(result5.left.children).toEqual([1, 2, 3, 4] as any);
		expect(result5.right.children).toEqual([5] as any);
		expect(result5.toArray()).toEqual([1, 2, 3, 4, 5]);
	});

	it('should transition from OuterTree back to OuterBlock when size decreases', () => {
		// Start with 5 (Tree), drop to 4 (Block)
		const result4 = context.of(1, 2, 3, 4, 5).drop(1);
		if (!context.isOuterBlock<number>(result4)) {
			throw new Error('Expected result to be an OuterBlock');
		}
		expect(result4.length).toBe(4);
		expect(result4.children).toEqual([2, 3, 4, 5] as any);
	});

	it('should transition to context empty when all elements are removed', () => {
		const resultEmpty = context.of(1, 2).drop(2);
		expect(resultEmpty.length).toBe(0);
	});

	it('should handle complex sequences of operations correctly', () => {
		const result = context
			.of(1)
			.append(2)
			.append(3)
			.append(4)
			.append(5)
			.drop(2);

		if (!context.isOuterBlock<number>(result)) {
			throw new Error('Expected result to be an OuterBlock');
		}
		expect(result.length).toBe(3);
		expect(result.children).toEqual([3, 4, 5] as any);
	});

	it('should maintain element integrity during take/drop', () => {
		const result = context.of(1, 2, 3, 4, 5).take(3);

		if (!context.isOuterBlock<number>(result)) {
			throw new Error('Expected result to be an OuterBlock');
		}
		expect(result.length).toBe(3);
		expect(result.children).toEqual([1, 2, 3] as any);
	});
});
