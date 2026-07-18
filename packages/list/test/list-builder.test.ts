import { describe, expect, it, vi } from 'bun:test';

import type { ListContext } from '#list/context-module';

import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream } from '@rimbu/stream';

import { ListHelpers } from '#list/list-helpers';
import { ListBuilder } from '#list/mutable/builder';
import { OuterBlockBuilder } from '#list/mutable/outer-block-builder';
import { OuterTreeBuilder } from '#list/mutable/outer-tree-builder';

const context = ListHelpers.createListContext({
	blockSizeBits: 2,
}) as any as ListContext;

function builder(obj: any) {
	return new ListBuilder(context, obj);
}

describe('ListBuilder', () => {
	it('append', () => {
		{
			const g = context.builder();
			g.append(1);
			expect(g.outerBuilder).toBeInstanceOf(OuterBlockBuilder);
			expect(g.at(0)).toBe(1);
		}
		{
			const g = context.createBuilder<number>(context.of(11, 12, 13));
			g.append(1);
			expect(g.outerBuilder).toBeInstanceOf(OuterBlockBuilder);
			expect((g.outerBuilder as OuterBlockBuilder<number>).children).toEqual([
				11, 12, 13, 1,
			] as any);
		}
		{
			const g = context.createBuilder<number>(context.of(11, 12, 13, 14));
			g.append(1);
			expect(g.outerBuilder).toBeInstanceOf(OuterTreeBuilder);
			expect(
				(g.outerBuilder as OuterTreeBuilder<number>).left.children,
			).toEqual([11, 12] as any);
			expect(
				(g.outerBuilder as OuterTreeBuilder<number>).right.children,
			).toEqual([13, 14, 1] as any);
		}
	});

	it('appendAll', () => {
		{
			// empty: does not set builder for empty input
			const g = context.createBuilder();
			g.appendAll([]);
			expect(g.outerBuilder).toBeUndefined();
			g.appendAll(Stream.empty());
			expect(g.outerBuilder).toBeUndefined();
		}
		{
			// empty: sets builder for non-empty array
			const g = context.createBuilder();
			g.appendAll([1, 2]);
			expect(g.outerBuilder).toBeInstanceOf(OuterBlockBuilder);
			expect(g.length).toBe(2);
			expect(g.build().toArray()).toEqual([1, 2]);
		}
		{
			// empty: sets builder for non-empty stream
			const g = context.createBuilder();
			g.appendAll(Stream.of(1, 2));
			expect(g.outerBuilder).toBeInstanceOf(OuterBlockBuilder);
			expect(g.length).toBe(2);
			expect(g.build().toArray()).toEqual([1, 2]);
		}
		{
			// non-empty: adds values from array
			const g = context.createBuilder<number>(context.of(1, 2, 3, 4, 5, 6));
			g.appendAll([11, 12, 13, 14, 15, 16]);
			expect(g.outerBuilder).toBeInstanceOf(OuterTreeBuilder);
			expect(g.length).toBe(12);
			expect(g.build().toArray()).toEqual([
				1, 2, 3, 4, 5, 6, 11, 12, 13, 14, 15, 16,
			]);
		}
		{
			// non-empty: adds values from stream
			const g = context.createBuilder<number>(context.of(1, 2, 3, 4, 5, 6));
			g.appendAll(Stream.of(11, 12, 13, 14, 15, 16));
			expect(g.outerBuilder).toBeInstanceOf(OuterTreeBuilder);
			expect(g.length).toBe(12);
			expect(g.build().toArray()).toEqual([
				1, 2, 3, 4, 5, 6, 11, 12, 13, 14, 15, 16,
			]);
		}
	});

	it('appendArray', () => {
		{
			// add empty array
			const g = context.createBuilder();
			g.appendArray([]);
			expect(g.outerBuilder).toBeUndefined();
		}
		{
			// add one full block
			const g = context.createBuilder();
			g.appendArray([1, 2, 3, 4]);
			expect(g.outerBuilder).toBeInstanceOf(OuterBlockBuilder);
			g.appendArray([11]);
			expect(g.outerBuilder).toBeInstanceOf(OuterTreeBuilder);
		}
		{
			// add non-empty array
			const g = context.createBuilder();
			g.appendArray([1, 2]);
			expect(g.outerBuilder).toBeInstanceOf(OuterBlockBuilder);
			g.appendArray([3, 4, 5]);
			expect(g.outerBuilder).toBeInstanceOf(OuterTreeBuilder);
			expect((g.outerBuilder as any).left.children).toEqual([1, 2, 3, 4]);
			expect((g.outerBuilder as any).right.children).toEqual([5]);
		}
	});

	it('appendFullOrLastWindow', () => {
		{
			// empty, last window
			const g = context.createBuilder();
			g.appendFullOrLastWindow([1, 2, 3]);
			expect(g.outerBuilder).toBeInstanceOf(OuterBlockBuilder);
			expect(g.length).toBe(3);
		}
		{
			// empty, full window
			const g = context.createBuilder();
			g.appendFullOrLastWindow([1, 2, 3, 4]);
			expect(g.outerBuilder).toBeInstanceOf(OuterBlockBuilder);
			expect(g.length).toBe(4);
		}
		{
			// non-empty, 2 windows creates tree
			const g = context.createBuilder();
			g.appendFullOrLastWindow([1, 2, 3, 4]);
			g.appendFullOrLastWindow([11, 12, 13, 14]);
			expect(g.outerBuilder).toBeInstanceOf(OuterTreeBuilder);
			expect(g.length).toBe(8);
			expect(g.build().toArray()).toEqual([1, 2, 3, 4, 11, 12, 13, 14]);
		}
		{
			// adding 3 windows creates middle tree
			const g = context.createBuilder();
			g.appendFullOrLastWindow([1, 2, 3, 4]);
			g.appendFullOrLastWindow([11, 12, 13, 14]);
			g.appendFullOrLastWindow([21, 22, 23, 24]);
			expect(g.outerBuilder).toBeInstanceOf(OuterTreeBuilder);
			expect(g.length).toBe(12);
			expect(g.build().toArray()).toEqual([
				1, 2, 3, 4, 11, 12, 13, 14, 21, 22, 23, 24,
			]);
			expect((g.outerBuilder as any).middle.level).toBe(1);
			expect((g.outerBuilder as any).middle.children[0].children).toEqual([
				11, 12, 13, 14,
			]);
		}
	});

	it('build', () => {
		// empty
		expect(context.createBuilder().build()).toBe(context.empty());
		{
			// non-empty
			const g = context.createBuilder();
			g.appendAll([1, 2, 3, 4]);
			expect(g.build()).toEqual<any>(g.outerBuilder?.build());
		}
	});

	it('buildMap', () => {
		// empty
		expect(context.createBuilder().buildMap(() => 1)).toBe(context.empty());
		{
			// non-empty
			const g = context.createBuilder<number>();
			g.appendAll([1, 2, 3, 4]);
			expect(g.buildMap((v) => v + 1)).toEqual<any>(
				g.outerBuilder?.buildMap((v) => v + 1),
			);
		}
	});

	it('empty', () => {
		const b = context.createBuilder<number>();
		expect(b).toBeInstanceOf(ListBuilder);
		expect(b.length).toBe(0);
		expect(b.isEmpty).toBe(true);
		expect(b.at(1)).toBeUndefined();
		expect(b.updateAt(1, () => 2)).toBeUndefined();
		expect(b.set(1, 2)).toBeUndefined();
		expect(b.remove(1)).toBeUndefined();
		expect(b.build()).toBe(context.empty());
		expect(b.buildMap((v) => v + 1)).toBe(context.empty());
	});

	it('forEach', () => {
		{
			// no sub builder
			const b = context.createBuilder();
			const f = vi.fn();
			b.forEach(f);
			expect(f).not.toHaveBeenCalled();

			b.forEach(f, { reversed: true });
			expect(f).not.toHaveBeenCalled();
		}
		{
			// has sub builder
			const forEach = vi.fn();

			const b = builder({ forEach });
			const f = () => {};
			const s = TraverseState();
			b.forEach(f, { state: s });
			expect(forEach).toBeCalledWith(f, { reversed: false, state: s });

			forEach.mockReset();
			b.forEach(f, { reversed: true, state: s });
			expect(forEach).toBeCalledWith(f, { reversed: true, state: s });
		}
	});

	it('get', () => {
		const g = builder({ length: 10, get: () => 5 });
		expect(g.at(4)).toBe(5);
		expect(g.at(-6)).toBe(5);
		expect(g.at(12)).toBeUndefined();
		expect(g.at(-12)).toBeUndefined();
		expect(g.at(-12, 10)).toBe(10);
	});

	it('checkLock', () => {
		const g = context.builder<number>();
		g.appendArray([1, 2, 3, 4]);
		expect(() => g.checkLock()).not.toThrow();
		g._iterationDepth = 1;
		expect(() => g.checkLock()).toThrow();

		expect(() => g.append(1)).toThrow();
		expect(() => g.appendAll([])).toThrow();
		expect(() => g.build()).not.toThrow();
		expect(() => g.buildMap((v) => v + 1)).not.toThrow();
		expect(() => g.forEach(() => 1)).not.toThrow();
		expect(() => g.at(4)).not.toThrow();
		expect(() => g.insert(1, 1)).toThrow();
		expect(() => g.isEmpty).not.toThrow();
		expect(() => g.length).not.toThrow();
		expect(() => g.prepend(1)).toThrow();
		expect(() => g.remove(1)).toThrow();
		expect(() => g.set(1, 1)).toThrow();
		expect(() => g.updateAt(1, () => 1)).toThrow();
	});

	it('insert', () => {
		{
			// empty
			const g = context.builder<number>();
			g.insert(1, 1);
			expect(g.build().toArray()).toEqual([1]);
		}
		{
			// non-empty
			const g = context.builder<number>();
			g.appendAll([1, 2, 3, 4]);
			g.insert(1, 11);
			expect(g.build().toArray()).toEqual([1, 11, 2, 3, 4]);
		}
		{
			// non-empty
			const g = context.builder<number>();
			g.appendAll([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
			g.insert(5, 11);
			expect(g.build().toArray()).toEqual([1, 2, 3, 4, 5, 11, 6, 7, 8, 9, 10]);
			g.insert(-1, 12);
			expect(g.build().toArray()).toEqual([
				1, 2, 3, 4, 5, 11, 6, 7, 8, 9, 12, 10,
			]);
		}
	});

	it('isEmpty', () => {
		expect(builder({ length: 10 }).isEmpty).toBe(false);
		expect(builder({ length: 0 }).isEmpty).toBe(true);
	});

	it('length', () => {
		const g = builder({
			length: 10,
		});
		expect(g.length).toBe(10);
	});

	it('prepend', () => {
		{
			const g = context.builder();
			g.prepend(1);
			expect(g.outerBuilder).toBeInstanceOf(OuterBlockBuilder);
			expect(g.at(0)).toBe(1);
		}
		{
			const g = context.createBuilder<number>(context.of(11, 12, 13));
			g.prepend(1);
			expect(g.outerBuilder).toBeInstanceOf(OuterBlockBuilder);
			expect((g.outerBuilder as OuterBlockBuilder<number>).children).toEqual([
				1, 11, 12, 13,
			] as any);
		}
		{
			const g = context.createBuilder<number>(context.of(11, 12, 13, 14));
			g.prepend(1);
			expect(g.outerBuilder).toBeInstanceOf(OuterTreeBuilder);
			expect(
				(g.outerBuilder as OuterTreeBuilder<number>).left.children,
			).toEqual([1, 11] as any);
			expect(
				(g.outerBuilder as OuterTreeBuilder<number>).right.children,
			).toEqual([12, 13, 14] as any);
		}
	});

	it('remove', () => {
		{
			// empty
			const g = context.builder();
			expect(g.remove(1)).toBeUndefined();
			expect(g.remove(1, 'a')).toBe('a');
			expect(g.remove(1, () => 'a')).toBe('a');
		}
		{
			// non-empty
			const g = context.createBuilder();
			g.appendAll([1, 2, 3, 4]);
			expect(g.remove(1)).toBe(2);
			expect(g.remove(1, 'a')).toBe(3);
			expect(g.remove(5)).toBeUndefined();
			expect(g.remove(5, 'a')).toBe('a');
			expect(g.remove(5, () => 'a')).toBe('a');
			expect(g.remove(-1)).toBe(4);
			expect(g.remove(-5)).toBeUndefined();
			expect(g.remove(-5, 'a')).toBe('a');
			expect(g.remove(-5, () => 'a')).toBe('a');
		}
	});

	it('set', () => {
		const updateAt = vi.fn().mockReturnValue(5);
		const g = builder({ length: 10, updateAt });
		expect(g.set(4, 5)).toBe(5);
		expect(updateAt).toBeCalledWith(4, expect.any(Function));
		{
			const updateFn = updateAt.mock.calls[0][1];
			expect(updateFn(4)).toBe(5);
		}
		expect(g.set(-1, 1));
		expect(updateAt).toBeCalledWith(9, expect.any(Function));
		{
			const updateFn = updateAt.mock.calls[1][1];
			expect(updateFn(4)).toBe(1);
		}
	});

	it('updateAt', () => {
		const updateAt = vi.fn().mockReturnValue(5);
		const g = builder({ length: 10, updateAt });
		expect(g.updateAt(4, () => 2)).toBe(5);
		expect(updateAt).toBeCalledWith(4, expect.any(Function));
		{
			const updateFn = updateAt.mock.calls[0][1];
			expect(updateFn(4)).toBe(2);
		}
		expect(g.updateAt(-5, () => 3, 1)).toBe(5);
		expect(updateAt).toHaveBeenLastCalledWith(5, expect.any(Function));
		{
			const updateFn = updateAt.mock.calls[1][1];
			expect(updateFn(4)).toBe(3);
		}
	});
});
