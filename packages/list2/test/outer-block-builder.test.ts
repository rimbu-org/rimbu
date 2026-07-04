import { describe, expect, it, vi } from 'bun:test';

import type { ListContext } from '#list/context-module';

import { TraverseState } from '@rimbu/common/traverse-state';

import { ListHelpers } from '#list/list-helpers';
import { OuterTreeBuilder } from '#list/mutable/outer-tree-builder';

const context = ListHelpers.createListContext({
	blockSizeBits: 2,
}) as unknown as ListContext<ListHelpers.TypesImpl>;

function createBlockBuilder<T>(...elems: T[]) {
	return context.outerBlockBuilder(elems);
}

describe('OuterBlockBuilder', () => {
	it('append', () => {
		{
			const b = context.outerBlockBuilder([1, 2]);
			b.append(10);
			expect(b.children).toEqual([1, 2, 10] as any);
		}
		{
			const b = context.outerBlockBuilderSource(context.outerBlock([1, 2]));
			b.append(10);
			expect(b.children).toEqual([1, 2, 10] as any);
		}
	});

	it('build', () => {
		{
			const b = createBlockBuilder(1);
			expect(b.build()).toEqual(context.outerBlock([1]));
		}
		{
			const b = createBlockBuilder(1, 2, 3, 4, 5);
			expect(b.build()).toEqual(context.outerBlock([1, 2, 3, 4, 5]));
		}
		{
			const s = context.reversedOuterBlock([1, 2, 3]);
			const b = s.toBuilder();
			expect(b.build()).toBe(s);
		}
	});

	it('buildMap', () => {
		{
			const b = createBlockBuilder(1);
			expect(b.buildMap((v) => v + 1)).toEqual(context.outerBlock([2]));
		}
		{
			const b = createBlockBuilder(1, 2, 3, 4, 5);
			expect(b.buildMap((v) => v + 1)).toEqual(
				context.outerBlock([2, 3, 4, 5, 6]),
			);
		}
		{
			const b = context.outerBlockBuilderSource(
				context.outerBlock([1, 2, 3, 4, 5]),
			);
			expect(b.buildMap((v) => v + 1)).toEqual(
				context.outerBlock([2, 3, 4, 5, 6]),
			);
		}
	});

	it('children get', () => {
		{
			const children = [1];
			const b = context.outerBlockBuilder(children);
			expect(b.children).toBe(children as any);
			expect(b.source).toBeUndefined();
		}
		{
			const children = [1, 2, 3];
			const s = context.outerBlock(children);
			const b = context.outerBlockBuilderSource(s);
			expect(b.children).toBeUndefined();
			expect(b.source).toBe(s);
			b.prepareMutate();

			expect(b.children).toEqual(children as any);
			expect(b.children).not.toBe(children);
			expect(b.source).toBeUndefined();
		}
		{
			const children = [1, 2, 3];
			const s = context.reversedOuterBlock(children);
			const b = context.outerBlockBuilderSource(s);
			expect(b.source).toBe(s);
			b.prepareMutate();

			expect(b.children).toEqual(children.toReversed() as any);
			expect(b.source).toBeUndefined();
		}
	});

	it('appendItems', () => {
		{
			const b = context.outerBlockBuilder([1, 2, 3]);
			b.appendItems(context.outerBlockBuilder([5, 6]));
			expect(b.children).toEqual([1, 2, 3, 5, 6] as any);
		}
		{
			const b = context.outerBlockBuilderSource(context.outerBlock([1, 2, 3]));
			b.appendItems(
				context.outerBlockBuilderSource(context.outerBlock([5, 6])),
			);
			expect(b.children).toEqual([1, 2, 3, 5, 6] as any);
		}
	});

	it('copy', () => {
		{
			const b = context.outerBlockBuilder([1, 2]);
			const children = [3, 4];
			const n = b.copy(children as any);
			expect(n.children).toBe(children as any);
		}
		{
			const b = context.outerBlockBuilderSource(context.outerBlock([1, 2]));
			const children = [3, 4];
			const n = b.copy(children as any);
			expect(n.children).toBe(children as any);
		}
	});

	it('dropFirstChild', () => {
		{
			const b = context.outerBlockBuilder([1, 2, 3]);
			expect(b.dropFirstChild()).toBe(1);
			expect(b.children).toEqual([2, 3] as any);
		}
		{
			const b = context.outerBlockBuilderSource(context.outerBlock([1, 2, 3]));
			expect(b.dropFirstChild()).toBe(1);
			expect(b.children).toEqual([2, 3] as any);
		}
	});

	it('dropLastChild', () => {
		{
			const b = context.outerBlockBuilder([1, 2, 3]);
			expect(b.dropLastChild()).toBe(3);
			expect(b.children).toEqual([1, 2] as any);
		}
		{
			const b = context.outerBlockBuilderSource(context.outerBlock([1, 2, 3]));
			expect(b.dropLastChild()).toBe(3);
			expect(b.children).toEqual([1, 2] as any);
		}
	});

	it('forEach', () => {
		{
			const b = context.outerBlockBuilder([1, 2, 3, 4]);
			const cb = vi.fn();
			b.forEach(cb, { reversed: false, state: TraverseState() });
			expect(cb).toBeCalledTimes(4);
			expect(cb.mock.calls[1][0]).toBe(2);
			expect(cb.mock.calls[1][1]).toBe(1);

			cb.mockReset();

			b.forEach(cb, { reversed: true, state: TraverseState() });
			expect(cb).toBeCalledTimes(4);
			expect(cb.mock.calls[1][0]).toBe(3);
			expect(cb.mock.calls[1][1]).toBe(1);

			cb.mockReset();

			b.forEach(
				(_, __, halt) => {
					halt();
					cb();
				},
				{ reversed: true, state: TraverseState() },
			);

			expect(cb).toBeCalledTimes(1);
		}
		{
			const b = context.outerBlockBuilderSource(
				context.outerBlock([1, 2, 3, 4]),
			);
			const cb = vi.fn();
			b.forEach(cb, { reversed: false, state: TraverseState() });
			expect(cb).toBeCalledTimes(4);
			expect(cb.mock.calls[1][0]).toBe(2);
			expect(cb.mock.calls[1][1]).toBe(1);

			cb.mockReset();

			b.forEach(cb, { reversed: true, state: TraverseState() });
			expect(cb).toBeCalledTimes(4);
			expect(cb.mock.calls[1][0]).toBe(3);
			expect(cb.mock.calls[1][1]).toBe(1);

			cb.mockReset();

			b.forEach(
				(_, __, halt) => {
					halt();
					cb();
				},
				{ reversed: false, state: TraverseState() },
			);

			expect(cb).toBeCalledTimes(1);
		}
	});

	it('get', () => {
		{
			const b = context.outerBlockBuilder([1, 2]);
			expect(b.get(1)).toBe(2);
		}
		{
			const b = context.outerBlockBuilderSource(context.outerBlock([1, 2]));
			expect(b.get(1)).toBe(2);
		}
	});

	it('insert', () => {
		{
			const b = context.outerBlockBuilder([1, 2]);
			b.insert(1, 10);
			expect(b.children).toEqual([1, 10, 2] as any);
			b.insert(0, 11);
			expect(b.children).toEqual([11, 1, 10, 2] as any);
			b.insert(4, 12);
			expect(b.children).toEqual([11, 1, 10, 2, 12] as any);
		}
		{
			const b = context.outerBlockBuilderSource(context.outerBlock([1, 2]));
			b.insert(1, 10);
			expect(b.children).toEqual([1, 10, 2] as any);
			b.insert(0, 11);
			expect(b.children).toEqual([11, 1, 10, 2] as any);
			b.insert(4, 12);
			expect(b.children).toEqual([11, 1, 10, 2, 12] as any);
		}
	});

	it('length', () => {
		{
			const b = context.outerBlockBuilder([1, 2]);
			expect(b.length).toBe(2);
		}
		{
			const b = context.outerBlockBuilderSource(context.outerBlock([1, 2]));
			expect(b.length).toBe(2);
		}
	});

	it('normalized', () => {
		{
			const b = context.outerBlockBuilder([]);
			expect(b.normalized()).toBeUndefined();
		}
		{
			const b = context.outerBlockBuilder([1, 2]);
			expect(b.normalized()).toBe(b);
		}
		{
			const b = context.outerBlockBuilder([1, 2, 3, 4, 5]);
			const n = b.normalized() as OuterTreeBuilder<number>;
			expect(n).toBeInstanceOf(OuterTreeBuilder);
			expect(n.left.children).toEqual([1, 2] as any);
			expect(n.right.children).toEqual([3, 4, 5] as any);
			expect(n.middle).toBeUndefined();
		}
	});

	it('nrChildren', () => {
		{
			const b = context.outerBlockBuilder([1, 2]);
			expect(b.nrChildren).toBe(2);
		}
		{
			const b = context.outerBlockBuilderSource(context.outerBlock([1, 2]));
			expect(b.nrChildren).toBe(2);
		}
	});

	it('prepend', () => {
		{
			const b = context.outerBlockBuilder([1, 2]);
			b.prepend(10);
			expect(b.children).toEqual([10, 1, 2] as any);
		}
		{
			const b = context.outerBlockBuilderSource(context.outerBlock([1, 2]));
			b.prepend(10);
			expect(b.children).toEqual([10, 1, 2] as any);
		}
	});

	it('remove', () => {
		{
			const b = context.outerBlockBuilder([1, 2, 3]);
			b.remove(1);
			expect(b.children).toEqual([1, 3] as any);
		}
		{
			const b = context.outerBlockBuilderSource(context.outerBlock([1, 2, 3]));
			b.remove(1);
			expect(b.children).toEqual([1, 3] as any);
		}
	});

	it('splitRight', () => {
		{
			const b = context.outerBlockBuilder([1, 2, 3]);
			const r = b.splitRight();
			expect(b.children).toEqual([1] as any);
			expect(r.children).toEqual([2, 3] as any);
		}
		{
			const b = context.outerBlockBuilderSource(context.outerBlock([1, 2, 3]));
			const r = b.splitRight();
			expect(b.children).toEqual([1] as any);
			expect(r.children).toEqual([2, 3] as any);
		}
	});

	it('updateAt', () => {
		{
			const b = context.outerBlockBuilder([1, 2]);
			expect(b.updateAt(1, () => 3)).toBe(2);
			expect(b.children).toEqual([1, 3] as any);
			expect(b.updateAt(0, (v) => v + 1)).toBe(1);
			expect(b.children).toEqual([2, 3] as any);
		}
		{
			const b = context.outerBlockBuilderSource(context.outerBlock([1, 2]));
			expect(b.updateAt(1, () => 3)).toBe(2);
			expect(b.children).toEqual([1, 3] as any);
			expect(b.updateAt(0, (v) => v + 1)).toBe(1);
			expect(b.children).toEqual([2, 3] as any);
		}
	});
});
