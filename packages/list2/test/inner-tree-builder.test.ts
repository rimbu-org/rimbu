import { describe, expect, it, vi } from 'bun:test';

import type { ListContext } from '#list/context-module';
import type { OuterBlock } from '#list/immutable/outer-block';
import type { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

import { Stream } from '@rimbu/stream';

import { InnerTree } from '#list/immutable/inner-tree';
import { ListHelpers } from '#list/list-helpers';
import { InnerBlockBuilder } from '#list/mutable/inner-block-builder';
import { InnerTreeBuilder } from '#list/mutable/inner-tree-builder';

const context = ListHelpers.createListContext({
	blockSizeBits: 2,
}) as unknown as ListContext<ListHelpers.TypesImpl>;

describe('InnerTreeBuilder', () => {
	it('build', () => {
		{
			// source
			const lb = context.outerBlock([1, 2, 3, 4]);
			const nlb = context.innerBlock<number, OuterBlock<number>>(
				[lb, lb, lb],
				12,
				1,
			);
			const source = context.innerTree<number, OuterBlock<number>>(
				nlb,
				nlb,
				null,
				24,
				1,
			);
			const b = context.innerTreeBuilderSource(source);
			expect(b.build()).toBe(source);
		}
		{
			// no source
			const lb = context.outerBlockBuilder([1, 2, 3, 4]);
			const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
				1,
				[lb, lb, lb],
				12,
			);
			const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 24);
			const r = b.build();
			expect(r.length).toBe(24);
			expect(r).toBeInstanceOf(InnerTree);
			expect(r.level).toBe(1);
		}
	});

	it('buildMap', () => {
		{
			// source
			const lb = context.outerBlock([1, 2, 3, 4]);
			const nlb = context.innerBlock<number, OuterBlock<number>>(
				[lb, lb, lb],
				12,
				1,
			);
			const source = context.innerTree<number, OuterBlock<number>>(
				nlb,
				nlb,
				null,
				24,
				1,
			);
			const b = context.innerTreeBuilderSource(source);
			const r = b.buildMap((v) => v + 1);
			expect(r).toBeInstanceOf(InnerTree);
			expect(r.level).toBe(1);
			expect(r.toArray()).toEqual(
				source
					.stream()
					.map((v) => v + 1)
					.toArray(),
			);
		}
		{
			// no source
			const lb = context.outerBlockBuilder([1, 2, 3, 4]);
			const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
				1,
				[lb, lb, lb],
				12,
			);
			const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 24);
			const r = b.buildMap((v) => v + 1);
			expect(r).toBeInstanceOf(InnerTree);
			expect(r.level).toBe(1);
			expect(r.toArray()).toEqual(Stream.of(2, 3, 4, 5).repeat(6).toArray());
		}
	});

	it('context', () => {
		const lb = context.outerBlockBuilder([1, 2, 3, 4]);
		const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
			1,
			[lb, lb, lb],
			12,
		);
		const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 24);
		expect(b.context).toBe(context);
	});

	it('firstChild', () => {
		const first = context.outerBlockBuilder([1, 2, 3, 4]);
		const second = context.outerBlockBuilder([11, 12, 13, 14]);

		const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
			1,
			[first, second],
			8,
		);

		const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 16);
		expect(b.firstChild()).toBe(first);
	});

	it('get', () => {
		{
			// no source
			const first = context.outerBlockBuilder([1, 2, 3, 4]);
			const second = context.outerBlockBuilder([11, 12, 13, 14]);

			const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
				1,
				[first, second],
				8,
			);

			const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 16);
			expect(b.get(0)).toBe(1);
			expect(b.get(3)).toBe(4);
			expect(b.get(4)).toBe(11);
			expect(b.get(7)).toBe(14);
		}
		{
			// source
			const lb = context.outerBlock([1, 2, 3, 4]);
			const nlb = context.innerBlock<number, OuterBlock<number>>(
				[lb, lb, lb],
				12,
				1,
			);
			const source = context.innerTree<number, OuterBlock<number>>(
				nlb,
				nlb,
				null,
				24,
				1,
			);
			const b = context.innerTreeBuilderSource(source);
			expect(b.get(0)).toBe(1);
		}
	});

	it('getChildLength', () => {
		const lb = context.outerBlockBuilder([1, 2, 3, 4]);
		const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
			1,
			[lb, lb, lb],
			12,
		);
		const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 24);
		expect(b.getChildLength(lb)).toBe(4);
	});

	it('length', () => {
		{
			// no source
			const lb = context.outerBlockBuilder([1, 2, 3, 4]);
			const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
				1,
				[lb, lb, lb],
				12,
			);
			const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 24);
			expect(b.length).toBe(24);
		}
		{
			// source
			const lb = context.outerBlock([1, 2, 3, 4]);
			const nlb = context.innerBlock<number, OuterBlock<number>>(
				[lb, lb, lb],
				12,
				1,
			);
			const source = context.innerTree<number, OuterBlock<number>>(
				nlb,
				nlb,
				null,
				24,
				1,
			);
			const b = context.innerTreeBuilderSource(source);
			expect(b.length).toBe(24);
		}
	});

	it('lastChild', () => {
		const first = context.outerBlockBuilder([1, 2, 3, 4]);
		const second = context.outerBlockBuilder([11, 12, 13, 14]);

		const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
			1,
			[first, second],
			8,
		);

		const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 16);
		expect(b.lastChild()).toBe(second);
	});

	it('level', () => {
		const lb = context.outerBlockBuilder([1, 2, 3, 4]);
		const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
			1,
			[lb, lb, lb],
			12,
		);
		const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 24);
		expect(b.level).toBe(1);
	});

	it('modifyFirstChild', () => {
		const first = context.outerBlockBuilder([1, 2, 3, 4]);
		const second = context.outerBlockBuilder([11, 12, 13, 14]);

		const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
			1,
			[first, second],
			8,
		);

		const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 16);

		expect(
			b.modifyFirstChild((c) => {
				expect(c).toBe(first);
				return undefined;
			}),
		).toBe(undefined);
		expect(b.length).toBe(16);
		expect(
			b.modifyFirstChild((c) => {
				return 2;
			}),
		).toBe(2);
		expect(b.length).toBe(18);
	});

	it('modifyLastChild', () => {
		const first = context.outerBlockBuilder([1, 2, 3, 4]);
		const second = context.outerBlockBuilder([11, 12, 13, 14]);

		const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
			1,
			[first, second],
			8,
		);

		const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 16);

		expect(
			b.modifyLastChild((c) => {
				expect(c).toBe(second);
				return undefined;
			}),
		).toBe(undefined);
		expect(b.length).toBe(16);
		expect(
			b.modifyLastChild((c) => {
				return 2;
			}),
		).toBe(2);
		expect(b.length).toBe(18);
	});

	it('normalized', () => {
		{
			// no normalization
			const first = context.outerBlockBuilder([1, 2, 3, 4]);
			const second = context.outerBlockBuilder([11, 12, 13, 14]);

			const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
				1,
				[first, second, first, second],
				16,
			);

			const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 16);
			const n = b.normalized();
			expect(n).toBeInstanceOf(InnerTreeBuilder);
		}
		{
			// combine left and right
			const first = context.outerBlockBuilder([1, 2]);
			const second = context.outerBlockBuilder([11, 12]);

			const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
				1,
				[first, second],
				8,
			);

			const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 16);
			const n = b.normalized();
			expect(n).toBeInstanceOf(InnerBlockBuilder);
		}
	});

	it('prepareMutate', () => {
		const lb = context.outerBlock([1, 2, 3, 4]);
		const nlb = context.innerBlock<number, OuterBlock<number>>(
			[lb, lb, lb],
			12,
			1,
		);
		const source = context.innerTree<number, OuterBlock<number>>(
			nlb,
			nlb,
			null,
			24,
			1,
		);
		const b = context.innerTreeBuilderSource(source);
		expect(b.source).toBe(source);
		expect(b.left).toBeUndefined();
		expect(b.middle).toBeUndefined();
		expect(b.right).toBeUndefined();
		b.prepareMutate();
		expect(b.source).toBeUndefined();
		expect(b.left).toBeDefined();
		expect(b.right).toBeDefined();
	});

	it('prepareMutate is called', () => {
		const mockPrepareMutate = vi.fn();

		function createBuilder() {
			const lb = context.outerBlockBuilder([1, 2, 3, 4]);
			const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
				1,
				[lb, lb, lb],
				12,
			);
			const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 24);
			b.prepareMutate = mockPrepareMutate;
			return b;
		}
		createBuilder().append(context.outerBlockBuilder([1]));
		expect(mockPrepareMutate).toHaveBeenCalled();
		mockPrepareMutate.mockClear();

		createBuilder().insert(0, 1);
		expect(mockPrepareMutate).toHaveBeenCalled();
		mockPrepareMutate.mockClear();

		createBuilder().remove(0);
		expect(mockPrepareMutate).toHaveBeenCalled();
		mockPrepareMutate.mockClear();

		createBuilder().appendChild(context.outerBlockBuilder([1]));
		expect(mockPrepareMutate).toHaveBeenCalled();
		mockPrepareMutate.mockClear();

		createBuilder().prependChild(context.outerBlockBuilder([1]));
		expect(mockPrepareMutate).toHaveBeenCalled();
		mockPrepareMutate.mockClear();

		createBuilder().modifyFirstChild(() => 1);
		expect(mockPrepareMutate).toHaveBeenCalled();
		mockPrepareMutate.mockClear();

		createBuilder().modifyFirstChild(() => undefined);
		expect(mockPrepareMutate).not.toHaveBeenCalled();
		mockPrepareMutate.mockClear();

		createBuilder().modifyLastChild(() => undefined);
		expect(mockPrepareMutate).not.toHaveBeenCalled();
		mockPrepareMutate.mockClear();

		createBuilder().prepend(context.outerBlockBuilder([1]));
		expect(mockPrepareMutate).toHaveBeenCalled();
		mockPrepareMutate.mockClear();

		createBuilder().prependChild(context.outerBlockBuilder([1]));
		expect(mockPrepareMutate).toHaveBeenCalled();
		mockPrepareMutate.mockClear();

		createBuilder().updateAt(0, 1);
		expect(mockPrepareMutate).toHaveBeenCalled();
		mockPrepareMutate.mockClear();
	});

	it('source', () => {
		{
			// no source
			const lb = context.outerBlockBuilder([1, 2, 3, 4]);
			const nlb = context.innerBlockBuilder<number, OuterBlockBuilder<number>>(
				1,
				[lb, lb, lb],
				12,
			);
			const b = context.innerTreeBuilder(1, nlb, nlb, undefined, 24);
			expect(b.source).toBeUndefined();
		}
		{
			// source
			const lb = context.outerBlock([1, 2, 3, 4]);
			const nlb = context.innerBlock<number, OuterBlock<number>>(
				[lb, lb, lb],
				12,
				1,
			);
			const source = context.innerTree<number, OuterBlock<number>>(
				nlb,
				nlb,
				null,
				24,
				1,
			);
			const b = context.innerTreeBuilderSource(source);
			expect(b.source).toBe(source);
		}
	});
});
