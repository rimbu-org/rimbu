import { beforeEach, describe, expect, it, vi } from 'bun:test';

import type { ListContext } from '#list/context-module';

import { TraverseState } from '@rimbu/common/traverse-state';

import { OuterBlock } from '#list/immutable/outer-block';
import { OuterTree } from '#list/immutable/outer-tree';
import { ListHelpers } from '#list/list-helpers';
import { InnerTreeBuilder } from '#list/mutable/inner-tree-builder';
import { OuterBlockBuilder } from '#list/mutable/outer-block-builder';
import { OuterTreeBuilder } from '#list/mutable/outer-tree-builder';

const context = ListHelpers.createListContext({
	blockSizeBits: 2,
}) as unknown as ListContext<ListHelpers.TypesImpl>;

describe('OuterTreeBuilder', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('append', () => {
		{
			// can add to right
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12, 13]),
				undefined,
				5,
			);
			t.append(-1);
			expect(t.length).toBe(6);
			expect(t.get(5)).toBe(-1);
			expect(t.left.children).toEqual([1, 2]);
			expect(t.right.children).toEqual([11, 12, 13, -1]);
		}
		{
			// right full, no middle, left has place
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				undefined,
				7,
			);
			t.append(-1);
			expect(t.length).toBe(8);
			expect(t.get(7)).toBe(-1);
			expect(t.left.children).toEqual([1, 2, 3, 11]);
			expect(t.right.children).toEqual([12, 13, 14, -1]);
		}
		{
			// left and right full, no middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				undefined,
				8,
			);
			t.append(-1);
			expect(t.length).toBe(9);
			expect(t.get(8)).toBe(-1);
			expect(t.left.children).toEqual([1, 2, 3, 4]);
			expect((t.middle as any).children[0].children).toEqual([11, 12, 13, 14]);
			expect(t.right.children).toEqual([-1]);
		}
		{
			// right full, last middle has place
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				context.innerBlockBuilder(1, [context.outerBlockBuilder([21, 22])], 2),
				8,
			);
			t.append(-1);
			expect(t.length).toBe(9);
			expect(t.get(8)).toBe(-1);
			expect(t.left.children).toEqual([1, 2]);
			expect((t.middle as any).children[0].children).toEqual([21, 22, 11]);
			expect(t.right.children).toEqual([12, 13, 14, -1]);
			expect(t.middle!.length).toBe(3);
		}
		{
			// right full, last middle full
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23, 24])],
					4,
				),
				10,
			);
			t.append(-1);
			expect(t.length).toBe(11);
			expect(t.get(10)).toBe(-1);
			expect(t.left.children).toEqual([1, 2]);
			expect((t.middle as any).children[0].children).toEqual([21, 22, 23, 24]);
			expect((t.middle as any).children[1].children).toEqual([11, 12, 13, 14]);
			expect(t.right.children).toEqual([-1]);
			expect(t.middle!.length).toBe(8);
		}
	});

	it.skip('appendChildren', () => {
		{
			// no effect
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			);
			t.appendChildren([], 0);
			t.appendChildren([1, 2, 3], 10);
			expect(t.right.children).toEqual([11, 12]);
		}
		{
			// fill right
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			);
			t.appendChildren([31, 32], 0);
			expect(t.right.children).toEqual([11, 12, 31, 32]);
			expect(t.length).toBe(6);
		}
		{
			// add current right to middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				undefined,
				6,
			);
			t.appendChildren([31, 32], 0);
			expect(t.right.children).toEqual([31, 32]);
			expect(t.length).toBe(8);
		}
	});

	it('appendMiddle', () => {
		{
			// no middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				undefined,
				6,
			);
			const child = context.outerBlockBuilder([21, 22, 23]);
			t.appendMiddle(child);
			expect(t.length).toBe(6);
			expect((t.middle as any).children[0]).toBe(child);
		}
		{
			// middle, simple append
			const middleBlock = context.outerBlockBuilder([21, 22, 23, 24]);

			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				context.innerBlockBuilder(1, [middleBlock], 4),
				10,
			);
			const child = context.outerBlockBuilder([31, 32, 33]);
			t.appendMiddle(child);
			expect(t.length).toBe(10);
			expect((t.middle as any).children[0]).toBe(middleBlock);
			expect((t.middle as any).children[1]).toBe(child);
		}
		{
			// middle, simple block merge
			const middleBlock = context.outerBlockBuilder([21, 22, 23]);

			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				context.innerBlockBuilder(1, [middleBlock], 3),
				9,
			);
			const child = context.outerBlockBuilder([31]);
			t.appendMiddle(child);
			expect(t.length).toBe(9);
			expect((t.middle as any).children[0].children).toEqual([21, 22, 23, 31]);
		}
		{
			// middle, prepend block
			const middleBlock = context.outerBlockBuilder([21, 22, 23]);

			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				context.innerBlockBuilder(1, [middleBlock], 3),
				9,
			);
			const child = context.outerBlockBuilder([31, 32, 33]);
			t.appendMiddle(child);
			expect(t.length).toBe(9);
			expect((t.middle as any).children[0]).toBe(middleBlock);
			expect(child.children).toEqual([31, 32, 33]);
			expect((t.middle as any).children[1]).toBe(child);
			expect(middleBlock.children).toEqual([21, 22, 23]);
		}
		{
			// middle, marge and split and normalize
			const middle = context.innerBlockBuilder<
				number,
				OuterBlockBuilder<number>
			>(
				1,
				[
					context.outerBlockBuilder([21, 22, 23, 24]),
					context.outerBlockBuilder([21, 22, 23, 24]),
					context.outerBlockBuilder([21, 22, 23, 24]),
					context.outerBlockBuilder([21, 22, 23, 24]),
				],
				16,
			);

			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				middle,
				22,
			);
			const child = context.outerBlockBuilder([31]);
			t.appendMiddle(child);
			expect(t.length).toBe(22);
			expect(t.middle).toBeInstanceOf(InnerTreeBuilder);
			const newMiddle = t.middle as InnerTreeBuilder<number, any>;
			expect(newMiddle.level).toBe(1);
			expect(newMiddle.left).toBe(middle);
			expect(newMiddle.left.nrChildren).toBe(2);
			expect(newMiddle.right.nrChildren).toBe(3);
			expect(newMiddle.right.children[1].children).toEqual([21, 22]);
			expect(newMiddle.right.children[2].children).toEqual([23, 24, 31]);
		}
	});

	it('build', () => {
		{
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			);
			const r = t.build();
			expect(r.toArray()).toEqual([1, 2, 11, 12]);
			expect(r).toBeInstanceOf(OuterBlock);
		}
		{
			const source = context.outerTree(
				context.outerBlock([1, 2]),
				context.outerBlock([11, 12]),
				null,
				4,
			);

			const t = context.outerTreeBuilderSource(source);
			const r = t.build();
			expect(r.toArray()).toEqual([1, 2, 11, 12]);
			expect(r).toBeInstanceOf(OuterTree);
		}
	});

	it('buildMap', () => {
		{
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			);
			const r = t.buildMap((v) => v + 1);
			expect(r.toArray()).toEqual([2, 3, 12, 13]);
			expect(r).toBeInstanceOf(OuterBlock);
		}
		{
			const source = context.outerTree(
				context.outerBlock([1, 2]),
				context.outerBlock([11, 12]),
				null,
				4,
			);

			const t = context.outerTreeBuilderSource(source);
			const r = t.buildMap((v) => v + 1);
			expect(r.toArray()).toEqual([2, 3, 12, 13]);
			expect(r).toBeInstanceOf(OuterTree);
		}
	});

	it('context', () => {
		expect(
			context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			).context,
		).toBe(context);
	});

	it.skip('dropFirst', () => {
		{
			// simple drop left
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				undefined,
				8,
			);
			expect(t.dropFirst()).toBe(1);
			expect(t.left.children).toEqual([2, 3, 4]);
			expect(t.length).toBe(7);
		}
		{
			// assume parent normalization
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			);
			expect(t.dropFirst()).toBe(1);
			expect(t.left.children).toEqual([2]);
			expect(t.length).toBe(3);
		}
		{
			// shift from right
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				undefined,
				6,
			);
			expect(t.dropFirst()).toBe(1);
			expect(t.left.children).toEqual([2, 11]);
			expect(t.right.children).toEqual([12, 13, 14]);
			expect(t.length).toBe(5);
		}
		{
			// no normalization
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			);
			expect(t.dropFirst()).toBe(1);
			expect(t.left.children).toEqual([2]);
			expect(t.right.children).toEqual([11, 12]);
			expect(t.length).toBe(3);
		}
		{
			// middle, shift from first middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23, 24])],
					4,
				),
				10,
			);

			expect(t.dropFirst()).toBe(1);
			expect(t.left.children).toEqual([2]);
			expect((t.middle as any).children[0].children).toEqual([21, 22, 23, 24]);
			expect(t.right.children).toEqual([11, 12, 13, 14]);
		}
		{
			// middle, merge with first middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23])],
					3,
				),
				9,
			);

			expect(t.dropFirst()).toBe(1);
			expect(t.left.children).toEqual([2, 21, 22, 23]);
			expect(t.middle).toBeUndefined();
			expect(t.right.children).toEqual([11, 12, 13, 14]);
		}
	});

	it.skip('dropLast', () => {
		{
			// simple drop right
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				undefined,
				8,
			);
			expect(t.dropLast()).toBe(14);
			expect(t.right.children).toEqual([11, 12, 13]);
			expect(t.length).toBe(7);
		}
		{
			// assume parent normalization
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			);
			expect(t.dropLast()).toBe(12);
			expect(t.right.children).toEqual([11]);
			expect(t.length).toBe(3);
		}
		{
			// shift from left
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				6,
			);
			expect(t.dropLast()).toBe(12);
			expect(t.left.children).toEqual([1, 2, 3]);
			expect(t.right.children).toEqual([4, 11]);
			expect(t.length).toBe(5);
		}
		{
			// no normalization
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			);
			expect(t.dropLast()).toBe(12);
			expect(t.left.children).toEqual([1, 2]);
			expect(t.right.children).toEqual([11]);
			expect(t.length).toBe(3);
		}
		{
			// middle, shift from last middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23, 24])],
					4,
				),
				10,
			);

			expect(t.dropLast()).toBe(12);
			expect(t.left.children).toEqual([1, 2, 3, 4]);
			expect((t.middle as any).children[0].children).toEqual([21, 22, 23, 24]);
			expect(t.right.children).toEqual([11]);
		}
		{
			// middle, merge with last middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23])],
					3,
				),
				9,
			);

			expect(t.dropLast()).toBe(12);
			expect(t.left.children).toEqual([1, 2, 3, 4]);
			expect(t.middle).toBeUndefined();
			expect(t.right.children).toEqual([21, 22, 23, 11]);
		}
	});

	it('forEach', () => {
		{
			// no middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				undefined,
				8,
			);
			const cb = vi.fn();
			t.forEach(cb, { reversed: false, state: TraverseState() });
			expect(cb).toBeCalledTimes(8);
			expect(cb.mock.calls[1][0]).toBe(2);
			expect(cb.mock.calls[1][1]).toBe(1);

			cb.mockReset();

			t.forEach(cb, { reversed: true, state: TraverseState() });
			expect(cb).toBeCalledTimes(8);
			expect(cb.mock.calls[1][0]).toBe(13);
			expect(cb.mock.calls[1][1]).toBe(1);

			cb.mockReset();

			t.forEach(
				(_, __, halt) => {
					halt();
					cb();
				},
				{ reversed: false, state: TraverseState() },
			);

			expect(cb).toBeCalledTimes(1);
		}
		{
			//  middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23])],
					3,
				),
				11,
			);
			const cb = vi.fn();
			t.forEach(cb, { reversed: false, state: TraverseState() });
			expect(cb).toBeCalledTimes(11);
			expect(cb.mock.calls[1][0]).toBe(2);
			expect(cb.mock.calls[1][1]).toBe(1);

			cb.mockReset();

			t.forEach(
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
			// no source, middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23])],
					3,
				),
				9,
			);

			expect(t.get(0)).toBe(1);
			expect(t.get(3)).toBe(21);
			expect(t.get(6)).toBe(11);
		}
		{
			// no source, no middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				undefined,
				6,
			);

			expect(t.get(0)).toBe(1);
			expect(t.get(3)).toBe(11);
			expect(t.get(5)).toBe(13);
		}
		{
			// source
			const t = context.outerTreeBuilderSource(
				context.outerTree(
					context.outerBlock([1, 2, 3]),
					context.outerBlock([4, 5, 6]),
					null,
					6,
				),
			);
			expect(t.get(4)).toBe(5);
		}
	});

	it('getChildLength', () => {
		expect(
			context
				.outerTreeBuilder(
					context.outerBlockBuilder([1, 2]),
					context.outerBlockBuilder([11, 12]),
					undefined,
					4,
				)
				.getChildLength(),
		).toBe(1);
	});

	it('insert', () => {
		{
			// no middle, insert keeps same structure
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				undefined,
				6,
			);
			t.insert(3, -1);
			expect(t.length).toBe(7);
			expect(t.left.children).toEqual([1, 2, 3, -1]);
			expect(t.right.children).toEqual([11, 12, 13]);
		}
		{
			// no middle, left shifts child to right
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12, 13]),
				undefined,
				7,
			);
			t.insert(3, -1);
			expect(t.length).toBe(8);
			expect(t.left.children).toEqual([1, 2, 3, -1]);
			expect(t.right.children).toEqual([4, 11, 12, 13]);
		}
		{
			// no middle, right shifts child to left
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				undefined,
				7,
			);
			t.insert(4, -1);
			expect(t.length).toBe(8);
			expect(t.left.children).toEqual([1, 2, 3, 11]);
			expect(t.right.children).toEqual([-1, 12, 13, 14]);
		}
		{
			// middle, insert left needs to shift from left to middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(1, [context.outerBlockBuilder([21, 22])], 2),
				8,
			);
			t.insert(1, -1);
			expect(t.length).toBe(9);
			expect(t.left.children).toEqual([1, -1, 2, 3]);
			expect((t.middle as any).children[0].children).toEqual([4, 21, 22]);
			expect(t.right.children).toEqual([11, 12]);
		}
		{
			// middle, insert right needs to shift from right to middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				context.innerBlockBuilder(1, [context.outerBlockBuilder([21, 22])], 2),
				8,
			);
			t.insert(6, -1);
			expect(t.length).toBe(9);
			expect(t.left.children).toEqual([1, 2]);
			expect((t.middle as any).children[0].children).toEqual([21, 22, 11]);
			expect(t.right.children).toEqual([12, -1, 13, 14]);
		}
		{
			// middle, insert left splits and adds to middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23, 24])],
					4,
				),
				10,
			);
			t.insert(2, -1);
			expect(t.length).toBe(11);
			expect(t.left.children).toEqual([1, 2]);
			expect((t.middle as any).children[0].children).toEqual([-1, 3, 4]);
			expect((t.middle as any).children[1].children).toEqual([21, 22, 23, 24]);
			expect(t.right.children).toEqual([11, 12]);
		}
		{
			// middle, insert right splits and adds to middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23, 24])],
					4,
				),
				10,
			);
			t.insert(8, -1);
			expect(t.length).toBe(11);
			expect(t.left.children).toEqual([1, 2]);
			expect((t.middle as any).children[0].children).toEqual([21, 22, 23, 24]);
			expect((t.middle as any).children[1].children).toEqual([11, 12]);
			expect(t.right.children).toEqual([-1, 13, 14]);
		}
		{
			// insert into middle, no change to middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23])],
					3,
				),
				7,
			);
			t.insert(4, -1);
			expect(t.length).toBe(8);
			expect(t.left.children).toEqual([1, 2]);
			expect((t.middle as any).children[0].children).toEqual([21, 22, -1, 23]);
			expect(t.right.children).toEqual([11, 12]);
		}
		{
			// insert into middle, normalize middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23, 24])],
					3,
				),
				7,
			);
			t.insert(4, -1);
			expect(t.length).toBe(8);
			expect(t.left.children).toEqual([1, 2]);
			expect((t.middle as any).children[0].children).toEqual([21, 22]);
			expect((t.middle as any).children[1].children).toEqual([23, -1, 24]);
			expect(t.right.children).toEqual([11, 12]);
		}
	});

	it('length', () => {
		{
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			);
			expect(t.length).toBe(4);
		}
		{
			const source = context.outerTree(
				context.outerBlock([1, 2]),
				context.outerBlock([11, 12]),
				null,
				4,
			);

			const t = context.outerTreeBuilderSource(source);
			expect(t.length).toBe(4);
		}
	});

	it('level', () => {
		expect(
			context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			).level,
		).toBe(0);
	});

	it('normalized', () => {
		{
			// can collapse into block
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			);
			const n = t.normalized() as OuterBlockBuilder<number>;
			expect(n).toBeInstanceOf(OuterBlockBuilder);
			expect(n.children).toEqual([1, 2, 11, 12]);
			expect(n.length).toBe(4);
		}
		{
			// can merge middle with left
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12, 13]),
				context.innerBlockBuilder(1, [context.outerBlockBuilder([21, 22])], 2),
				7,
			);
			const n = t.normalized() as OuterTreeBuilder<number>;
			expect(n).toBeInstanceOf(OuterTreeBuilder);
			expect(n.left.children).toEqual([1, 2, 21, 22]);
			expect(n.length).toBe(7);
		}
		{
			// can merge middle with right
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(1, [context.outerBlockBuilder([21, 22])], 2),
				7,
			);
			const n = t.normalized() as OuterTreeBuilder<number>;
			expect(n).toBeInstanceOf(OuterTreeBuilder);
			expect(n.right.children).toEqual([21, 22, 11, 12]);
			expect(n.length).toBe(7);
		}
		{
			// cannot normalize
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23])],
					3,
				),
				7,
			);
			const n = t.normalized() as OuterTreeBuilder<number>;
			expect(n).toBeInstanceOf(OuterTreeBuilder);
			expect(n.left.children).toEqual([1, 2]);
			expect(n.length).toBe(7);
		}
	});

	it('prepareMutate', () => {
		{
			const left = context.outerBlockBuilder([1, 2]);
			const right = context.outerBlockBuilder([11, 12]);
			const t = context.outerTreeBuilder(left, right, undefined, 4);
			t.prepareMutate();
			expect(t.source).toBeUndefined();
			expect(t.left).toBe(left);
			expect(t.right).toBe(right);
		}
		{
			const source = context.outerTree(
				context.outerBlock([1, 2]),
				context.outerBlock([11, 12]),
				null,
				4,
			);

			const t = context.outerTreeBuilderSource(source);
			t.prepareMutate();
			expect(t.source).toBeUndefined();
			expect(t.left.source).toBe(source.left);
			expect(t.right.source).toBe(source.right);
			expect(t.left).toBeInstanceOf(OuterBlockBuilder);
			expect(t.right).toBeInstanceOf(OuterBlockBuilder);
		}
	});

	it('prepareMutate is called', () => {
		const mockPrepareMutate = vi.fn();

		function createTree() {
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				undefined,
				6,
			);

			t.prepareMutate = mockPrepareMutate;

			return t;
		}

		createTree().append(1);
		expect(mockPrepareMutate).toBeCalledTimes(1);
		mockPrepareMutate.mockReset();

		createTree().prepend(1);
		expect(mockPrepareMutate).toBeCalledTimes(1);
		mockPrepareMutate.mockReset();

		createTree().insert(1, 1);
		expect(mockPrepareMutate).toBeCalledTimes(1);
		mockPrepareMutate.mockReset();

		createTree().remove(1);
		expect(mockPrepareMutate).toBeCalledTimes(1);
		mockPrepareMutate.mockReset();

		createTree().updateAt(1, -1);
		expect(mockPrepareMutate).toBeCalledTimes(1);
	});

	it('prepend', () => {
		{
			// can add to left
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12, 13]),
				undefined,
				5,
			);
			t.prepend(-1);
			expect(t.length).toBe(6);
			expect(t.get(0)).toBe(-1);
			expect(t.left.children).toEqual([-1, 1, 2]);
			expect(t.right.children).toEqual([11, 12, 13]);
		}
		{
			// left full, no middle, right has place
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12, 13]),
				undefined,
				7,
			);
			t.prepend(-1);
			expect(t.length).toBe(8);
			expect(t.get(0)).toBe(-1);
			expect(t.left.children).toEqual([-1, 1, 2, 3]);
			expect(t.right.children).toEqual([4, 11, 12, 13]);
		}
		{
			// left and right full, no middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12, 13, 14]),
				undefined,
				8,
			);
			t.prepend(-1);
			expect(t.length).toBe(9);
			expect(t.get(0)).toBe(-1);
			expect(t.left.children).toEqual([-1]);
			expect((t.middle as any).children[0].children).toEqual([1, 2, 3, 4]);
			expect(t.right.children).toEqual([11, 12, 13, 14]);
		}
		{
			// left full, first middle has place
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(1, [context.outerBlockBuilder([21, 22])], 2),
				8,
			);
			t.prepend(-1);
			expect(t.length).toBe(9);
			expect(t.left.children).toEqual([-1, 1, 2, 3]);
			expect((t.middle as any).children[0].children).toEqual([4, 21, 22]);
			expect(t.right.children).toEqual([11, 12]);
			expect(t.middle!.length).toBe(3);
		}
		{
			// left full, first middle full
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3, 4]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23, 24])],
					4,
				),
				10,
			);
			t.prepend(-1);
			expect(t.length).toBe(11);
			expect(t.left.children).toEqual([-1]);
			expect((t.middle as any).children[0].children).toEqual([1, 2, 3, 4]);
			expect((t.middle as any).children[1].children).toEqual([21, 22, 23, 24]);
			expect(t.right.children).toEqual([11, 12]);
			expect(t.middle!.length).toBe(8);
		}
	});

	it('prependMiddle', () => {
		{
			// no middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				undefined,
				6,
			);
			const child = context.outerBlockBuilder([21, 22, 23]);
			t.prependMiddle(child);
			expect(t.length).toBe(6);
			expect((t.middle as any).children[0]).toBe(child);
		}
		{
			// middle, simple prepend
			const middleBlock = context.outerBlockBuilder([21, 22, 23, 24]);

			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				context.innerBlockBuilder(1, [middleBlock], 4),
				10,
			);
			const child = context.outerBlockBuilder([31, 32, 33]);
			t.prependMiddle(child);
			expect(t.length).toBe(10);
			expect((t.middle as any).children[0]).toBe(child);
			expect((t.middle as any).children[1]).toBe(middleBlock);
		}
		{
			// middle, simple block merge
			const middleBlock = context.outerBlockBuilder([21, 22, 23]);

			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				context.innerBlockBuilder(1, [middleBlock], 3),
				9,
			);
			const child = context.outerBlockBuilder([31]);
			t.prependMiddle(child);
			expect(t.length).toBe(9);
			expect((t.middle as any).children[0].children).toEqual([31, 21, 22, 23]);
		}
		{
			// middle, prepend block
			const middleBlock = context.outerBlockBuilder([21, 22, 23]);

			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				context.innerBlockBuilder(1, [middleBlock], 3),
				9,
			);
			const child = context.outerBlockBuilder([31, 32, 33]);
			t.prependMiddle(child);
			expect(t.length).toBe(9);
			expect((t.middle as any).children[0]).toBe(child);
			expect(child.children).toEqual([31, 32, 33]);
			expect((t.middle as any).children[1]).toBe(middleBlock);
			expect(middleBlock.children).toEqual([21, 22, 23]);
		}
		{
			// middle, merge and split and normalize
			const middle = context.innerBlockBuilder<
				number,
				OuterBlockBuilder<number>
			>(
				1,
				[
					context.outerBlockBuilder([21, 22, 23, 24]),
					context.outerBlockBuilder([21, 22, 23, 24]),
					context.outerBlockBuilder([21, 22, 23, 24]),
					context.outerBlockBuilder([21, 22, 23, 24]),
				],
				16,
			);

			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				middle,
				22,
			);
			const child = context.outerBlockBuilder([31]);
			t.prependMiddle(child);
			expect(t.length).toBe(22);
			expect(t.middle).toBeInstanceOf(InnerTreeBuilder);
			const newMiddle = t.middle as InnerTreeBuilder<number, any>;
			expect(newMiddle.level).toBe(1);
			expect(newMiddle.left).toBe(middle);
			expect(newMiddle.left.nrChildren).toBe(2);
			expect(newMiddle.right.nrChildren).toBe(3);
			expect(newMiddle.left.children[0]).toBe(child);
			expect(child.children).toEqual([31, 21]);
		}
	});

	it('remove', () => {
		{
			// no middle, remove keeps same structure
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12, 13]),
				undefined,
				6,
			);
			expect(t.remove(3)).toBe(11);
			expect(t.length).toBe(5);
			expect(t.left.children).toEqual([1, 2, 3]);
			expect(t.right.children).toEqual([12, 13]);
		}
		{
			// no middle, left gets value from right
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12, 13]),
				undefined,
				5,
			);
			expect(t.remove(1)).toBe(2);
			expect(t.length).toBe(4);
			expect(t.left.children).toEqual([1, 11]);
			expect(t.right.children).toEqual([12, 13]);
		}
		{
			// no middle, right gets value from left
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2, 3]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				5,
			);
			expect(t.remove(4)).toBe(12);
			expect(t.length).toBe(4);
			expect(t.left.children).toEqual([1, 2]);
			expect(t.right.children).toEqual([3, 11]);
		}
		{
			// middle, remove from left needs to borrow
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23, 24])],
					4,
				),
				8,
			);
			expect(t.remove(0)).toBe(1);
			expect(t.length).toBe(7);
			expect(t.left.children).toEqual([2, 21]);
			expect((t.middle as any).children[0].children).toEqual([22, 23, 24]);
			expect((t.middle as any).level).toBe(1);
			expect(t.right.children).toEqual([11, 12]);
		}
		{
			// middle, remove from right needs to borrow
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23, 24])],
					4,
				),
				8,
			);
			expect(t.remove(7)).toBe(12);
			expect(t.length).toBe(7);
			expect(t.left.children).toEqual([1, 2]);
			expect((t.middle as any).children[0].children).toEqual([21, 22, 23]);
			expect(t.right.children).toEqual([24, 11]);
		}
		{
			// middle, remove from middle remains structure
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23, 24])],
					4,
				),
				8,
			);
			expect(t.remove(3)).toBe(22);
			expect(t.length).toBe(7);
			expect(t.left.children).toEqual([1, 2]);
			expect((t.middle as any).children[0].children).toEqual([21, 23, 24]);
			expect(t.right.children).toEqual([11, 12]);
		}
		{
			// middle, remove from left needs to merge with first middle child
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(1, [context.outerBlockBuilder([21, 22])], 2),
				6,
			);
			expect(t.remove(1)).toBe(2);
			expect(t.length).toBe(5);
			expect(t.left.children).toEqual([1, 21, 22]);
			expect(t.middle).toBeUndefined();
			expect(t.right.children).toEqual([11, 12]);
		}
		{
			// middle, remove from right needs to merge with last middle child
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(1, [context.outerBlockBuilder([21, 22])], 2),
				6,
			);
			expect(t.remove(4)).toBe(11);
			expect(t.length).toBe(5);
			expect(t.left.children).toEqual([1, 2]);
			expect(t.middle).toBeUndefined();
			expect(t.right.children).toEqual([21, 22, 12]);
		}
	});

	it('source', () => {
		{
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			);
			expect(t.source).toBeUndefined();
		}
		{
			const source = context.outerTree(
				context.outerBlock([1, 2]),
				context.outerBlock([11, 12]),
				null,
			);

			const t = context.outerTreeBuilderSource(source);
			expect(t.source).toBe(source);
		}
	});

	it('updateAt', () => {
		{
			// no middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				undefined,
				4,
			);
			expect(t.updateAt(1, -1)).toBe(2);
			expect(t.get(1)).toBe(-1);
			expect(t.updateAt(2, (v) => v + 1)).toBe(11);
			expect(t.get(2)).toBe(12);
		}
		{
			// middle
			const t = context.outerTreeBuilder(
				context.outerBlockBuilder([1, 2]),
				context.outerBlockBuilder([11, 12]),
				context.innerBlockBuilder(
					1,
					[context.outerBlockBuilder([21, 22, 23])],
					3,
				),
				7,
			);
			expect(t.updateAt(1, -1)).toBe(2);
			expect(t.get(1)).toBe(-1);
			expect(t.updateAt(2, (v) => v + 1)).toBe(21);
			expect(t.get(2)).toBe(22);
			expect(t.updateAt(6, -2)).toBe(12);
			expect(t.get(6)).toBe(-2);
		}
	});
});
