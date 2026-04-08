import { describe, expect, it, vi } from 'bun:test';

import type { ListContext } from '#list/context-module';

import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream } from '@rimbu/stream';

import { InnerBlock } from '#list/immutable/inner-block';
import { InnerTree } from '#list/immutable/inner-tree';
import { OuterBlock } from '#list/immutable/outer-block';
import { ListHelpers } from '#list/list-helpers';
import { InnerBlockBuilder } from '#list/mutable/inner-block-builder';

const context = ListHelpers.createListContext({
	blockSizeBits: 2,
}) as unknown as ListContext<ListHelpers.TypesImpl>;

describe('InnerBlock', () => {
	it('_mutateRebalance', () => {
		const b2 = context.outerBlock([1, 2]);

		const nl = context.innerBlock<number, OuterBlock<number>>([b2, b2], 4, 1);
		nl._mutateRebalance();
		expect(nl.nrChildren).toBe(1);
		expect(nl.length).toBe(4);
		expect(nl.children[0].toArray()).toEqual([1, 2, 1, 2]);
	});

	it('appendChild', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		const b4 = context.outerBlock([4, 5, 6]);

		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3], 3, 1);
			const r = nl.appendChild(b4) as InnerBlock<any, any>;
			expect(r.children).toEqual([b3, b4]);
			expect(r.length).toBe(6);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3, b3],
				12,
				1,
			);
			const r = nl.appendChild(b4) as InnerTree<any, any>;
			expect(r.left).toBeInstanceOf(InnerBlock);
			expect(r.left.level).toBe(1);
			expect(r.right).toBeInstanceOf(InnerBlock);
			expect(r.right.level).toBe(1);
			expect(r.right.children[0]).toBe(b4);
			expect(r.middle).toBeNull();
			expect(r.length).toBe(15);
		}
	});

	it('appendBlockChild', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		const b4 = context.outerBlock([4, 5, 6]);

		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3], 3, 1);
			const r = nl.appendBlockChild(b4);
			expect(r.children).toEqual([b3, b4]);
			expect(r.length).toBe(6);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3, b3],
				12,
				1,
			);
			const r = nl.appendBlockChild(b4);
			expect(r.children).toEqual([b3, b3, b3, b3, b4]);
			expect(r.length).toBe(15);
		}
	});

	it('canAddChild', () => {
		const b3 = context.outerBlock([1, 2, 3]);

		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3], 3, 1);
			expect(nl.canAddChild).toBe(true);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3, b3],
				12,
				1,
			);
			expect(nl.canAddChild).toBe(false);
		}
	});

	it('childrenInMax', () => {
		const b3 = context.outerBlock([1, 2, 3]);

		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3], 3, 1);
			expect(nl.childrenInMax).toBe(true);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3, b3, b3],
				12,
				1,
			);
			expect(nl.childrenInMax).toBe(false);
		}
	});

	it('childrenInMin', () => {
		const b3 = context.outerBlock([1, 2, 3]);

		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3, b3], 6, 1);
			expect(nl.childrenInMin).toBe(true);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3], 3, 1);
			expect(nl.childrenInMin).toBe(false);
		}
	});

	it('concat', () => {
		const b3 = context.outerBlock([1, 2, 3]);

		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3, b3], 6, 1);
			const r = nl.concat(nl) as InnerBlock<any, any>;
			expect(r).toBeInstanceOf(InnerBlock);
			expect(r.level).toBe(1);
			expect(r.children).toEqual([b3, b3, b3, b3]);
			expect(r.length).toBe(12);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3],
				9,
				1,
			);
			const r = nl.concat(nl) as InnerTree<any, any>;
			expect(r).toBeInstanceOf(InnerTree);
			expect(r.left).toBeInstanceOf(InnerBlock);
			expect(r.left.level).toBe(1);
			expect(r.left.children).toEqual([b3, b3, b3]);
			expect(r.middle).toBeNull();
			expect(r.right).toBeInstanceOf(InnerBlock);
			expect(r.right.level).toBe(1);
			expect(r.right.children).toEqual([b3, b3, b3]);
			expect(r.length).toBe(18);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3],
				9,
				1,
			);
			const nlt = context.innerTree(nl, nl, null, 18, 1);

			const r = nl.concat(nlt);
			expect(r.length).toBe(27);
		}
	});

	it('concatBlock', () => {
		const b3 = context.outerBlock([1, 2, 3]);

		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3, b3], 6, 1);
			const r = nl.concatBlock(nl) as InnerBlock<any, any>;
			expect(r).toBeInstanceOf(InnerBlock);
			expect(r.level).toBe(1);
			expect(r.children).toEqual([b3, b3, b3, b3]);
			expect(r.length).toBe(12);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3],
				9,
				1,
			);
			const r = nl.concatBlock(nl) as InnerTree<any, any>;
			expect(r).toBeInstanceOf(InnerTree);
			expect(r.level).toBe(1);
			expect(r.left).toBeInstanceOf(InnerBlock);
			expect(r.left.level).toBe(1);
			expect(r.left.children).toEqual([b3, b3, b3]);
			expect(r.middle).toBeNull();
			expect(r.right).toBeInstanceOf(InnerBlock);
			expect(r.right.level).toBe(1);
			expect(r.right.children).toEqual([b3, b3, b3]);
			expect(r.length).toBe(18);
		}
	});

	it('concatChildren', () => {
		const b3 = context.outerBlock([1, 2, 3]);

		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3, b3], 6, 1);
			const r = nl.concatChildren(nl) as InnerBlock<any, any>;
			expect(r).toBeInstanceOf(InnerBlock);
			expect(r.level).toBe(1);
			expect(r.children).toEqual([b3, b3, b3, b3]);
			expect(r.length).toBe(12);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3],
				9,
				1,
			);
			const r = nl.concatChildren(nl);
			expect(r).toBeInstanceOf(InnerBlock);
			expect(r.level).toBe(1);
			expect(r.children).toEqual([b3, b3, b3, b3, b3, b3]);
			expect(r.length).toBe(18);
		}
	});

	it('concatTree', () => {
		const b3 = context.outerBlock([1, 2, 3]);

		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3, b3], 9, 1);
			const nlt = context.innerTree(nl, nl, null, 18, 1);

			const r = nl.concatTree(nlt) as InnerTree<number, any>;
			expect(r.level).toBe(1);
			expect(r.left.nrChildren).toBe(4);
			expect(r.left.level).toBe(1);
		}

		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3, b3],
				9,
				1,
			);
			const nlt = context.innerTree(
				context.innerBlock<number, OuterBlock<number>>([b3], 3, 1),
				nl,
				null,
				12,
				1,
			);

			const r = nl.concatTree(nlt) as InnerTree<number, any>;
			expect(r.level).toBe(1);
			expect(r.left.level).toBe(1);
			expect(r.right.level).toBe(1);
			expect(r.left.nrChildren).toBe(1);
			expect(r.right.nrChildren).toBe(4);
			const m = r.middle as InnerBlock<number, any>;
			expect(m.level).toBe(2);
			expect(r.middle).toBeInstanceOf(InnerBlock);
			expect(m.nrChildren).toBe(1);
			expect(m.children[0].nrChildren).toBe(4);
		}
	});

	it('context', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		const nl = context.innerBlock<number, OuterBlock<number>>([b3, b3], 6, 1);
		expect(nl.context).toBe(context);
	});

	it('createBlockBuilder', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		const nl = context.innerBlock<number, OuterBlock<number>>([b3, b3], 6, 1);
		const b = nl.createBlockBuilder();
		expect(b).toBeInstanceOf(InnerBlockBuilder);
		expect(b.level).toBe(1);
		expect(b.build()).toBe(nl);
	});

	it('dropChildren', () => {
		const b1 = context.outerBlock([1, 2, 3]);
		const b2 = context.outerBlock([4, 5, 6]);
		const b3 = context.outerBlock([7, 8, 9]);
		const nl = context.innerBlock<number, OuterBlock<number>>(
			[b1, b2, b3],
			9,
			1,
		);

		expect(nl.dropChildren(8)).toBeNull();
		expect(nl.dropChildren(0)).toBe(nl);

		const r = nl.dropChildren(2);
		expect(r).toBeInstanceOf(InnerBlock);
		expect(r?.level).toBe(1);
		expect(r?.length).toBe(3);
		expect(r?.children).toEqual([b3]);
	});

	it('dropFirstChild', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		const b3_2 = context.outerBlock([1, 2, 3]);
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3_2, b3, b3],
				9,
				1,
			);
			const [r, u] = nl.dropFirstChild();

			expect(r).toBeInstanceOf(InnerBlock);
			expect(r?.level).toBe(1);
			expect(r?.length).toBe(6);
			expect(r?.children).toEqual([b3, b3]);
			expect(u).toBeInstanceOf(OuterBlock);
			expect(u).toBe(b3_2);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3], 3, 1);
			const [r, u] = nl.dropFirstChild();

			expect(r).toBeNull();
			expect(u).toBeInstanceOf(OuterBlock);
			expect(u.children).toEqual([1, 2, 3]);
		}
	});

	it('dropInternal', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3],
				9,
				1,
			);
			const [r, u, i] = nl.dropInternal(1);
			expect(r?.length).toBe(6);
			expect(u).toBeInstanceOf(OuterBlock);
			expect(u.children).toEqual([1, 2, 3]);
			expect(i).toBe(1);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3],
				9,
				1,
			);
			const [r, u, i] = nl.dropInternal(4);
			expect(r?.length).toBe(3);
			expect(u).toBeInstanceOf(OuterBlock);
			expect(u.children).toEqual([1, 2, 3]);
			expect(i).toBe(1);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3],
				9,
				1,
			);
			const [r, u, i] = nl.dropInternal(7);
			expect(r).toBeNull();
			expect(u).toBeInstanceOf(OuterBlock);
			expect(u.children).toEqual([1, 2, 3]);
			expect(i).toBe(1);
		}
	});

	it('dropLastChild', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		const b3_2 = context.outerBlock([1, 2, 3]);
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3_2],
				9,
				1,
			);
			const [r, u] = nl.dropLastChild();

			expect(r).toBeInstanceOf(InnerBlock);
			expect(r?.level).toBe(1);
			expect(r?.length).toBe(6);
			expect(r?.children).toEqual([b3, b3]);
			expect(u).toBeInstanceOf(OuterBlock);
			expect(u).toBe(b3_2);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3_2], 3, 1);
			const [r, u] = nl.dropLastChild();

			expect(r).toBeNull();
			expect(u).toBeInstanceOf(OuterBlock);
			expect(u).toBe(b3_2);
		}
	});

	it('forEach', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		const nl = context.innerBlock<number, OuterBlock<number>>(
			[b3, b3, b3],
			9,
			1,
		);

		const cb = vi.fn();
		nl.forEach(cb, { reversed: false, state: TraverseState() });
		expect(cb).toBeCalledTimes(9);
		expect(cb.mock.calls[2][0]).toBe(3);
		expect(cb.mock.calls[2][1]).toBe(2);

		cb.mockReset();

		nl.forEach(cb, { reversed: true, state: TraverseState() });
		expect(cb).toBeCalledTimes(9);
		expect(cb.mock.calls[2][0]).toBe(1);
		expect(cb.mock.calls[2][1]).toBe(2);

		cb.mockReset();

		b3.forEach((_, __, halt) => {
			halt();
			cb();
		});

		expect(cb).toBeCalledTimes(1);
	});

	it('get', () => {
		const b1 = context.outerBlock([1, 2, 3]);
		const b2 = context.outerBlock([4, 5, 6]);
		const b3 = context.outerBlock([7, 8, 9]);
		const nl = context.innerBlock<number, OuterBlock<number>>(
			[b1, b2, b3],
			9,
			1,
		);

		expect(nl.get(1)).toBe(2);
		expect(nl.get(4)).toBe(5);
		expect(nl.get(7)).toBe(8);
	});

	it.skip('getChild', () => {
		const b1 = context.outerBlock([1, 2, 3]);
		const b2 = context.outerBlock([4, 5, 6]);
		const b3 = context.outerBlock([7, 8, 9]);
		const nl = context.innerBlock<number, OuterBlock<number>>(
			9,
			[b1, b2, b3],
			1,
		);

		expect(nl.getChild(0)).toBe(b1);
		expect(nl.getChild(1)).toBe(b2);
		expect(nl.getChild(2)).toBe(b3);
	});

	it('getCoordinates', () => {
		{
			//  regular
			const b4 = context.outerBlock([1, 2, 3, 4]);
			const nl = context.innerBlock<number, OuterBlock<number>>([b4, b4], 8, 1);

			expect(nl.getCoordinates(0, false, false)).toEqual([0, 0]);
			expect(nl.getCoordinates(0, false, true)).toEqual([0, 0]);

			expect(nl.getCoordinates(1, false, false)).toEqual([0, 1]);
			expect(nl.getCoordinates(1, true, false)).toEqual([0, 1]);
			expect(nl.getCoordinates(1, true, true)).toEqual([0, 1]);
			expect(nl.getCoordinates(1, false, true)).toEqual([0, 1]);

			expect(nl.getCoordinates(5, false, false)).toEqual([1, 1]);
			expect(nl.getCoordinates(5, true, false)).toEqual([1, 1]);
			expect(nl.getCoordinates(5, true, true)).toEqual([1, 1]);
			expect(nl.getCoordinates(5, false, true)).toEqual([1, 1]);

			expect(nl.getCoordinates(8, false, false)).toEqual([2, 0]);
			expect(nl.getCoordinates(8, true, false)).toEqual([1, 4]);
			expect(nl.getCoordinates(8, true, true)).toEqual([1, 4]);
			expect(nl.getCoordinates(8, false, true)).toEqual([1, 3]);

			expect(nl.getCoordinates(7, false, false)).toEqual([1, 3]);
			expect(nl.getCoordinates(7, true, false)).toEqual([1, 3]);
			expect(nl.getCoordinates(7, true, true)).toEqual([1, 3]);
			expect(nl.getCoordinates(7, false, true)).toEqual([1, 3]);
		}
		{
			// not regular
			const b3 = context.outerBlock([1, 2, 3]);
			const nl = context.innerBlock<number, OuterBlock<number>>([b3, b3], 6, 1);

			expect(nl.getCoordinates(0, false, false)).toEqual([0, 0]);
			expect(nl.getCoordinates(0, true, false)).toEqual([0, 0]);
			expect(nl.getCoordinates(0, true, true)).toEqual([0, 0]);
			expect(nl.getCoordinates(0, false, true)).toEqual([0, 0]);

			expect(nl.getCoordinates(1, false, false)).toEqual([0, 1]);
			expect(nl.getCoordinates(1, true, false)).toEqual([0, 1]);
			expect(nl.getCoordinates(1, true, true)).toEqual([0, 1]);
			expect(nl.getCoordinates(1, false, true)).toEqual([0, 1]);

			expect(nl.getCoordinates(4, false, false)).toEqual([1, 1]);
			expect(nl.getCoordinates(4, true, false)).toEqual([1, 1]);
			expect(nl.getCoordinates(4, true, true)).toEqual([1, 1]);
			expect(nl.getCoordinates(4, false, true)).toEqual([1, 1]);

			expect(nl.getCoordinates(7, false, false)).toEqual([2, 0]);
			expect(nl.getCoordinates(7, true, false)).toEqual([2, 0]);
			expect(nl.getCoordinates(7, true, true)).toEqual([1, 2]);
			expect(nl.getCoordinates(7, false, true)).toEqual([1, 2]);

			expect(nl.getCoordinates(6, false, false)).toEqual([2, 0]);
			expect(nl.getCoordinates(6, true, false)).toEqual([1, 3]);
			expect(nl.getCoordinates(6, true, true)).toEqual([1, 3]);
			expect(nl.getCoordinates(6, false, true)).toEqual([1, 2]);
		}
	});

	it('length', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		const nl = context.innerBlock<number, OuterBlock<number>>([b3, b3], 6, 1);
		expect(nl.length).toBe(6);
	});

	it('level', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		expect(
			context.innerBlock<number, OuterBlock<number>>([b3, b3], 6, 1).level,
		).toBe(1);
		expect(
			context.innerBlock<number, OuterBlock<number>>([b3, b3], 6, 2).level,
		).toBe(2);
	});

	it('map', () => {
		const b1 = context.outerBlock([1, 2, 3]);
		const b2 = context.outerBlock([4, 5, 6]);
		const nl = context.innerBlock<number, OuterBlock<number>>([b1, b2], 6, 1);
		{
			const r = nl.map((v) => v + 1);
			expect(r.length).toBe(6);
			expect(r.level).toBe(1);
			expect(r.children[0].toArray()).toEqual([2, 3, 4]);
			expect(r.children[1].toArray()).toEqual([5, 6, 7]);
		}

		{
			const r = nl.map((v) => v + 1, { reversed: true });
			expect(r.length).toBe(6);
			expect(r.level).toBe(1);
			expect(r.children[0].toArray()).toEqual([7, 6, 5]);
			expect(r.children[1].toArray()).toEqual([4, 3, 2]);
		}
	});

	it.skip('mapPure', () => {
		const b1 = context.outerBlock([1, 2, 3]);

		const nl = context.innerBlock<number, OuterBlock<number>>(6, [b1, b1], 1);
		{
			const r = nl.mapPure((v) => v + 1);
			expect(r.length).toBe(6);
			expect(r.level).toBe(1);
			expect(r.children[0].toArray()).toEqual([2, 3, 4]);
			expect(r.children[1].toArray()).toEqual([2, 3, 4]);
			expect(r.children[0]).toBe(r.children[1]);
		}
		{
			const r = nl.mapPure((v) => v + 1, { reversed: true });
			expect(r.length).toBe(6);
			expect(r.level).toBe(1);
			expect(r.children[0].toArray()).toEqual([4, 3, 2]);
			expect(r.children[1].toArray()).toEqual([4, 3, 2]);
			expect(r.children[0]).toBe(r.children[1]);
		}
	});

	it('nrChildren', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		const nl = context.innerBlock<number, OuterBlock<number>>([b3, b3], 6, 1);
		expect(nl.nrChildren).toBe(2);
	});

	it('prependChild', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		const b4 = context.outerBlock([4, 5, 6]);

		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3], 3, 1);
			const r = nl.prependChild(b4) as InnerBlock<any, any>;
			expect(r.children).toEqual([b4, b3]);
			expect(r.length).toBe(6);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3, b3],
				12,
				1,
			);
			const r = nl.prependChild(b4) as InnerTree<any, any>;
			expect(r.left).toBeInstanceOf(InnerBlock);
			expect(r.level).toBe(1);
			expect(r.left.level).toBe(1);
			expect(r.right.level).toBe(1);
			expect(r.left.children[0]).toBe(b4);
			expect(r.right).toBeInstanceOf(InnerBlock);
			expect(r.middle).toBeNull();
			expect(r.length).toBe(15);
		}
	});

	it('prependBlockChild', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		const b4 = context.outerBlock([4, 5, 6]);

		{
			const nl = context.innerBlock<number, OuterBlock<number>>([b3], 3, 1);
			const r = nl.prependBlockChild(b4);
			expect(r.children).toEqual([b4, b3]);
			expect(r.length).toBe(6);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3, b3],
				12,
				1,
			);
			const r = nl.prependBlockChild(b4);
			expect(r.children).toEqual([b4, b3, b3, b3, b3]);
			expect(r.length).toBe(15);
		}
	});

	it('reversed', () => {
		const b1 = context.outerBlock([1, 2, 3]);
		const b2 = context.outerBlock([4, 5, 6]);
		const b3 = context.outerBlock([7, 8, 9]);

		const nl = context.innerBlock<number, OuterBlock<number>>(
			[b1, b2, b3],
			9,
			1,
		);

		const r = nl.reversed();
		expect(r.toArray()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
		expect(r.children[0].toArray()).toEqual([9, 8, 7]);
		expect(r.children[1].toArray()).toEqual([6, 5, 4]);
		expect(r.children[2].toArray()).toEqual([3, 2, 1]);
	});

	it('stream', () => {
		const b1 = context.outerBlock([1, 2, 3]);
		const b2 = context.outerBlock([4, 5, 6]);
		const b3 = context.outerBlock([7, 8, 9]);

		const nl = context.innerBlock<number, OuterBlock<number>>(
			[b1, b2, b3],
			9,
			1,
		);

		expect(nl.stream().toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
		expect(nl.stream({ reversed: true }).toArray()).toEqual([
			9, 8, 7, 6, 5, 4, 3, 2, 1,
		]);
	});

	it('streamRange', () => {
		const b1 = context.outerBlock([1, 2, 3]);
		const b2 = context.outerBlock([4, 5, 6]);
		const b3 = context.outerBlock([7, 8, 9]);

		const nl = context.innerBlock<number, OuterBlock<number>>(
			[b1, b2, b3],
			9,
			1,
		);

		expect(nl.streamRange({ amount: 10 }).toArray()).toEqual([
			1, 2, 3, 4, 5, 6, 7, 8, 9,
		]);
		expect(nl.streamRange({ amount: 0 })).toBe(Stream.empty());
		expect(nl.streamRange({ start: 3, amount: 4 }).toArray()).toEqual([
			4, 5, 6, 7,
		]);
		expect(
			nl.streamRange({ start: 3, amount: 4 }, { reversed: true }).toArray(),
		).toEqual([7, 6, 5, 4]);

		expect(nl.streamRange({ start: 3, amount: 2 }).toArray()).toEqual([4, 5]);

		expect(nl.streamRange({ start: 1, amount: 7 }).toArray()).toEqual([
			2, 3, 4, 5, 6, 7, 8,
		]);
	});

	it.skip('_structure', () => {
		const b3 = context.outerBlock([1, 2, 3]);

		const nl = context.innerBlock<number, OuterBlock<number>>([b3, b3], 6, 1);

		expect(nl._structure()).toMatchInlineSnapshot(`
      "
        <NLBlock(1) len:6 c:2 <Leaf 3> <Leaf 3>>"
    `);
	});

	it('takeChildren', () => {
		const b1 = context.outerBlock([1, 2, 3]);
		const b2 = context.outerBlock([4, 5, 6]);
		const b3 = context.outerBlock([7, 8, 9]);
		const nl = context.innerBlock<number, OuterBlock<number>>(
			[b1, b2, b3],
			9,
			1,
		);

		expect(nl.takeChildren(8)).toBe(nl);
		expect(nl.takeChildren(0)).toBeNull();

		const r = nl.takeChildren(2);
		expect(r).toBeInstanceOf(InnerBlock);
		expect(r?.level).toBe(1);
		expect(r?.length).toBe(6);
		expect(r?.children).toEqual([b1, b2]);
	});

	it('takeInternal', () => {
		const b3 = context.outerBlock([1, 2, 3]);
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3],
				9,
				1,
			);
			const [r, u, i] = nl.takeInternal(1);
			expect(r).toBeNull();
			expect(u).toBeInstanceOf(OuterBlock);
			expect(u.children).toEqual([1, 2, 3]);
			expect(i).toBe(1);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3],
				9,
				1,
			);
			const [r, u, i] = nl.takeInternal(4);
			expect(r?.length).toBe(3);
			expect(u).toBeInstanceOf(OuterBlock);
			expect(u.children).toEqual([1, 2, 3]);
			expect(i).toBe(1);
		}
		{
			const nl = context.innerBlock<number, OuterBlock<number>>(
				[b3, b3, b3],
				9,
				1,
			);
			const [r, u, i] = nl.takeInternal(7);
			expect(r?.length).toBe(6);
			expect(u).toBeInstanceOf(OuterBlock);
			expect(u.children).toEqual([1, 2, 3]);
			expect(i).toBe(1);
		}
	});

	it('toArray', () => {
		const b1 = context.outerBlock([1, 2, 3]);
		const b2 = context.outerBlock([4, 5, 6]);
		const b3 = context.outerBlock([7, 8, 9]);
		const nl = context.innerBlock<number, OuterBlock<number>>(
			[b1, b2, b3],
			9,
			1,
		);

		expect(nl.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
		expect(nl.toArray({ range: { amount: 0 } })).toEqual([]);
		expect(nl.toArray({ range: { amount: 10 } })).toEqual([
			1, 2, 3, 4, 5, 6, 7, 8, 9,
		]);
		expect(nl.toArray({ range: { start: 3, amount: 4 } })).toEqual([
			4, 5, 6, 7,
		]);

		expect(nl.toArray({ reversed: true })).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
		expect(nl.toArray({ range: { amount: 10 }, reversed: true })).toEqual([
			9, 8, 7, 6, 5, 4, 3, 2, 1,
		]);
		expect(
			nl.toArray({ range: { start: 3, amount: 4 }, reversed: true }),
		).toEqual([7, 6, 5, 4]);

		expect(nl.toArray({ range: { start: 3, amount: 2 } })).toEqual([4, 5]);
		expect(
			nl.toArray({ range: { start: 3, amount: 2 }, reversed: true }),
		).toEqual([5, 4]);
	});

	it('updateAt', () => {
		const b1 = context.outerBlock([1, 2, 3]);
		const b2 = context.outerBlock([4, 5, 6]);
		const b3 = context.outerBlock([7, 8, 9]);
		const nl = context.innerBlock<number, OuterBlock<number>>(
			[b1, b2, b3],
			9,
			1,
		);

		expect(nl.updateAt(3, 10).toArray()).toEqual([1, 2, 3, 10, 5, 6, 7, 8, 9]);
		expect(nl.updateAt(3, (v) => v + 10).toArray()).toEqual([
			1, 2, 3, 14, 5, 6, 7, 8, 9,
		]);
	});
});
