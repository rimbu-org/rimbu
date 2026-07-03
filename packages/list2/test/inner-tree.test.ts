import { describe, expect, it, vi } from 'bun:test';

import type { ListContext } from '#list/context-module';
import type { OuterBlock } from '#list/immutable/outer-block';

import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream } from '@rimbu/stream';

import { InnerBlock } from '#list/immutable/inner-block';
import { InnerTree } from '#list/immutable/inner-tree';
import { ListHelpers } from '#list/list-helpers';

const context = ListHelpers.createListContext({
	blockSizeBits: 2,
}) as unknown as ListContext<ListHelpers.TypesImpl>;

describe('InnerTree', () => {
	const b1 = context.outerBlock([1, 2, 3]);
	const b2 = context.outerBlock([4, 5, 6]);
	const b3 = context.outerBlock([7, 8, 9]);
	const b4 = context.outerBlock([10, 11, 12]);
	const b5 = context.outerBlock([13, 14, 15]);
	const b6 = context.outerBlock([16, 17, 18]);
	const nlb1 = context.innerBlock<number, OuterBlock<number>>(
		[b1, b2, b3],
		9,
		1,
	);
	const nlb2 = context.innerBlock<number, OuterBlock<number>>(
		[b1, b2, b3],
		9,
		1,
	);
	const nlb3 = context.innerBlock<
		number,
		InnerBlock<number, OuterBlock<number>>
	>([nlb1, nlb2], 18, 2);

	function createTree() {
		return context.innerTree<number, OuterBlock<number>>(
			nlb1,
			nlb2,
			nlb3,
			36,
			1,
		);
	}

	it('_normalize', () => {
		const items = [1, 2, 3, 4];
		const lb = context.outerBlock(items);

		{
			// convert to block
			const nlb = context.innerBlock<number, OuterBlock<number>>(
				[lb, lb],
				8,
				1,
			);
			const nlt = context.innerTree(nlb, nlb, null, 16, 1);

			const n = nlt._normalize();
			expect(n).toBeInstanceOf(InnerBlock);
			expect(n.toArray()).toEqual(Stream.from(items).repeat(4).toArray());
		}
		{
			// not possible to merge
			const nlb = context.innerBlock<number, OuterBlock<number>>(
				[lb, lb, lb],
				12,
				1,
			);
			const nlt = context.innerTree(nlb, nlb, null, 24, 1);
			const n = nlt._normalize();
			expect(n).toBeInstanceOf(InnerTree);
			expect(n.toArray()).toEqual(Stream.from(items).repeat(6).toArray());
			expect(n).toBe(nlt);
		}
		{
			// merge middle with left and right (middle fully absorbed)
			const nlb = context.innerBlock<number, OuterBlock<number>>(
				[lb, lb],
				8,
				1,
			);
			const mb = context.innerBlock<number, InnerBlock<number, any>>(
				[nlb, nlb],
				16,
				2,
			);
			const nlt = context.innerTree(nlb, nlb, mb, 32, 1);
			const n = nlt._normalize() as InnerTree<any, any>;
			expect(n).toBeInstanceOf(InnerTree);
			expect(n.middle).toBeNull();
			expect(n.left.children).toEqual([lb, lb, lb, lb]);
			expect(n.right.children).toEqual([lb, lb, lb, lb]);
		}
		{
			// merge middle with right
			const nlb = context.innerBlock<number, OuterBlock<number>>(
				[lb, lb],
				8,
				1,
			);
			const nlb2 = context.innerBlock<number, OuterBlock<number>>(
				[lb, lb, lb, lb],
				16,
				1,
			);
			const mb = context.innerBlock<number, InnerBlock<number, any>>(
				[nlb2, nlb],
				24,
				2,
			);
			const nlt = context.innerTree(nlb, nlb, mb, 40, 1);
			const n = nlt._normalize() as InnerTree<any, any>;
			expect(n).toBeInstanceOf(InnerTree);
			expect((n.middle as any).children).toEqual([nlb2]);
			expect(n.left).toBe(nlb);
			expect(n.right.children).toEqual([lb, lb, lb, lb]);
		}
	});

	it('appendChild', () => {
		const t = createTree();
		const r1 = t.appendChild(b4);

		expect(r1.left).toBe(nlb1);
		expect(r1.right).toBeInstanceOf(InnerBlock);
		expect(r1.right.toArray()).toEqual(
			Stream.range({ start: 1, amount: 12 }).toArray(),
		);
		expect(r1.right.nrChildren).toBe(4);
		expect(r1.right.children[3]).toBe(b4);
		expect(r1.middle).toBe(nlb3);

		const r2 = r1.appendChild(b5);
		expect(r2.left).toBe(nlb1);
		expect(r2.right).toBeInstanceOf(InnerBlock);
		expect(r2.right.nrChildren).toBe(4);
		expect(r2.right.children[3]).toBe(b5);
		expect(r2.middle?.length).toBe(21);

		const r3 = r2.appendChild(b6);
		expect(r3.left).toBe(nlb1);
		expect(r3.right).toBeInstanceOf(InnerBlock);
		expect(r3.right.nrChildren).toBe(1);
		expect(r3.right.children[0]).toBe(b6);
		expect(r3.middle?.length).toBe(33);
	});

	it('appendMiddleBlock', () => {
		{
			const t = createTree();

			expect((t.middle as any).nrChildren).toBe(2);
			const r1 = t.appendMiddleBlock(nlb1) as InnerBlock<any, any>;
			expect(r1).toBeInstanceOf(InnerBlock);
			expect(r1.nrChildren).toBe(3);
			expect(r1.children).toEqual([nlb1, nlb2, nlb1]);
		}
		{
			// no middle
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				nlb2,
				null,
				18,
				1,
			);

			const r1 = t.appendMiddleBlock(nlb1) as InnerBlock<any, any>;
			expect(r1).toBeInstanceOf(InnerBlock);
			expect(r1.nrChildren).toBe(1);
			expect(r1.children).toEqual([nlb1]);
		}
		{
			// full middle block
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				nlb2,
				context.innerBlock([nlb1, nlb1, nlb1, nlb1], 36, 2),
				54,
				1,
			);

			const r1 = t.appendMiddleBlock(nlb1) as InnerTree<any, any>;
			expect(r1).toBeInstanceOf(InnerTree);
			expect(r1.left.nrChildren).toBe(4);
			expect(r1.right.nrChildren).toBe(1);
		}
	});

	it('concatBlock', () => {
		{
			// move current right to middle
			const t = createTree();
			const r = t.concatBlock(nlb1) as InnerTree<number, OuterBlock<number>>;
			expect(r.left.nrChildren).toBe(3);
			expect(r.right.nrChildren).toBe(3);
			expect(r.middle?.length).toBe(27);
		}
		{
			// append to right
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				context.innerBlock([b1], 3, 1),
				nlb3,
				30,
				1,
			);
			const r = t.concatBlock(nlb1) as InnerTree<number, OuterBlock<number>>;
			expect(r.left.nrChildren).toBe(3);
			expect(r.right.nrChildren).toBe(4);
			expect(r.middle?.length).toBe(18);
		}
		{
			// split new right
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				context.innerBlock([b1], 3, 1),
				nlb3,
				30,
				1,
			);
			const r = t.concatBlock(
				context.innerBlock([b1, b1, b1, b1], 12, 1),
			) as InnerTree<number, OuterBlock<number>>;
			expect(r.left.nrChildren).toBe(3);
			expect(r.right.nrChildren).toBe(1);
			expect(r.middle?.length).toBe(30);
		}
	});

	it('concatTree', () => {
		{
			// append right and left to middle
			const t = createTree();
			const r = t.concatTree(createTree()) as InnerTree<
				number,
				OuterBlock<number>
			>;
			expect(r.left.nrChildren).toBe(3);
			expect(r.right.nrChildren).toBe(3);
			expect(r.middle?.length).toBe(54);
			expect(r.toArray()).toEqual(t.stream().repeat(2).toArray());
		}
		{
			// merge right and left
			const t = context.innerTree(
				nlb1,
				context.innerBlock([b1, b2], 6, 1),
				null,
				15,
				1,
			);
			const t2 = context.innerTree(
				context.innerBlock<number, OuterBlock<number>>([b1, b2], 6, 1),
				nlb2,
				null,
				15,
				1,
			);
			const r = t.concatTree(t2) as InnerTree<number, OuterBlock<number>>;
			expect(r.left.nrChildren).toBe(3);
			expect(r.right.nrChildren).toBe(3);
			const m = r.middle as any as InnerBlock<number, OuterBlock<number>>;
			expect(m.length).toBe(12);
			expect(m).toBeInstanceOf(InnerBlock);
			expect(m.children).toEqual<any>([
				context.innerBlock<number, OuterBlock<number>>([b1, b2, b1, b2], 12, 1),
			]);
		}
		{
			// merge and split
			const t = context.innerTree(
				nlb1,
				context.innerBlock([b1], 3, 1),
				null,
				12,
				1,
			);
			const t2 = context.innerTree(
				context.innerBlock<number, OuterBlock<number>>([b1, b2, b1, b2], 12, 1),
				nlb2,
				null,
				21,
				1,
			);
			const r = t.concatTree(t2) as InnerTree<number, OuterBlock<number>>;
			expect(r.left.nrChildren).toBe(3);
			expect(r.right.nrChildren).toBe(3);
			const m = r.middle as any as InnerBlock<number, OuterBlock<number>>;
			expect(m.length).toBe(15);
			expect(m).toBeInstanceOf(InnerBlock);
			expect(m.nrChildren).toBe(2);
		}
	});

	it('context', () => {
		const t = createTree();
		expect(t.context).toBe(context);
	});

	it('dropFirstChild', () => {
		{
			// middle tree
			const t = createTree();
			const [next, remain] = t.dropFirstChild();
			expect(remain).toBe(b1);
			expect(next?.length).toBe(33);
			expect(next?.toArray()).toEqual(t.toArray({ range: { start: 3 } }));
			expect(next).toBeInstanceOf(InnerTree);
		}
		{
			// no middle
			const t = context.innerTree<number, OuterBlock<number>>(
				context.innerBlock<number, OuterBlock<number>>([b1], 3, 1),
				nlb2,
				null,
				12,
				1,
			);
			const [next, remain] = t.dropFirstChild();
			expect(remain).toBe(b1);
			expect(next?.length).toBe(9);
			expect(next?.toArray()).toEqual(t.toArray({ range: { start: 3 } }));
			expect(next).toBeInstanceOf(InnerBlock);
		}
		{
			// middle leaf block
			const t = context.innerTree<number, OuterBlock<number>>(
				context.innerBlock<number, OuterBlock<number>>([b1], 3, 1),
				nlb2,
				nlb3,
				30,
				1,
			);
			const [next, remain] = t.dropFirstChild();
			expect(remain).toBe(b1);
			expect(next?.length).toBe(27);
			expect(next?.toArray()).toEqual(t.toArray({ range: { start: 3 } }));
			expect(next).toBeInstanceOf(InnerTree);
		}
	});

	it('dropLastChild', () => {
		{
			// set new right to right
			const t = createTree();
			const [next, remain] = t.dropLastChild();
			expect(remain).toBe(b3);
			expect(next?.length).toBe(t.length - 3);
			expect(next?.toArray()).toEqual(t.toArray({ range: { end: -4 } }));
			expect(next).toBeInstanceOf(InnerTree);
			expect((next as any).right).toEqual(
				context.innerBlock<number, any>([b1, b2], 6, 1),
			);
		}
		{
			// drop last right
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				context.innerBlock<number, OuterBlock<number>>([b1, b2], 6, 1),
				null,
				15,
				1,
			);
			const [next, remain] = t.dropLastChild();
			expect(remain).toBe(b2);
			expect(next?.length).toBe(t.length - 3);
			expect(next?.toArray()).toEqual(t.toArray({ range: { end: -4 } }));
			expect(next).toBeInstanceOf(InnerBlock);
		}
		{
			// move last middle to right
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				context.innerBlock<number, OuterBlock<number>>([b1], 3, 1),
				nlb3,
				30,
				1,
			);
			const [next, remain] = t.dropLastChild();
			expect(remain).toBe(b1);
			expect(next?.length).toBe(27);
			expect(next?.toArray()).toEqual(t.toArray({ range: { end: -4 } }));
			expect((next as any).right).toBe(nlb2);
		}
		{
			// drop right
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				context.innerBlock<number, OuterBlock<number>>([b1], 3, 1),
				null,
				12,
				1,
			);
			const [next, remain] = t.dropLastChild();
			expect(remain).toBe(b1);
			expect(next?.length).toBe(9);
			expect(next?.toArray()).toEqual(t.toArray({ range: { end: -4 } }));
			expect(next).toBe(nlb1);
		}
	});

	it('dropInternal', () => {
		{
			// drop only from left with middle, some left left
			const t = createTree();
			const [newT, up, upAmount] = t.dropInternal(1);
			expect(upAmount).toBe(1);
			expect(up).toBe(b1);
			expect(newT?.toArray()).toEqual(t.toArray({ range: { start: 3 } }));
			expect(newT).toBeInstanceOf(InnerTree);
		}
		{
			// drop only from left with middle, no left left
			const t = createTree();
			const [newT, up, upAmount] = t.dropInternal(9);
			expect(upAmount).toBe(0);
			expect(up).toBe(b1);
			expect(newT?.toArray()).toEqual(t.toArray({ range: { start: 12 } }));
			expect(newT).toBeInstanceOf(InnerTree);
		}
		{
			// drop only from left with middle, one left left
			const t = createTree();
			const [newT, up, upAmount] = t.dropInternal(8);
			expect(upAmount).toBe(2);
			expect(up).toBe(b3);
			expect(newT?.toArray()).toEqual(t.toArray({ range: { start: 9 } }));
			expect(newT).toBeInstanceOf(InnerTree);
		}
		{
			// drop only from left, no middle
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				nlb2,
				null,
				18,
				1,
			);
			const [newT, up, upAmount] = t.dropInternal(1);
			expect(upAmount).toBe(1);
			expect(up).toBe(b1);
			expect(newT?.toArray()).toEqual(t.toArray({ range: { start: 3 } }));
			expect(newT).toBeInstanceOf(InnerTree);
		}
		{
			// drop only from left, no left left, no middle
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				nlb2,
				null,
				18,
				1,
			);
			const [newT, up, upAmount] = t.dropInternal(9);
			expect(upAmount).toBe(0);
			expect(up).toBe(b1);
			expect(newT?.toArray()).toEqual(t.toArray({ range: { start: 12 } }));
			expect(newT).toBeInstanceOf(InnerBlock);
		}
		{
			// middle
			const t = createTree();
			const [newT, up, upAmount] = t.dropInternal(18);
			expect(upAmount).toBe(0);
			expect(up).toBe(b1);
			expect(newT?.toArray()).toEqual(t.toArray({ range: { start: 18 + 3 } }));
			expect(newT).toBeInstanceOf(InnerTree);
		}
		{
			// right
			const t = createTree();
			const [newRight, up, upAmount] = t.dropInternal(33);
			expect(upAmount).toBe(0);
			expect(up).toBe(b3);
			expect(newRight).toBeNull();
		}
	});

	it('forEach', () => {
		const t = createTree();

		const cb = vi.fn();
		t.forEach(cb, { reversed: false, state: TraverseState() });
		expect(cb).toBeCalledTimes(36);
		expect(cb.mock.calls[1][0]).toBe(2);
		expect(cb.mock.calls[1][1]).toBe(1);

		cb.mockReset();

		t.forEach(cb, { reversed: true, state: TraverseState() });
		expect(cb).toBeCalledTimes(36);
		expect(cb.mock.calls[1][0]).toBe(8);
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
	});

	it('get', () => {
		const t = createTree();

		expect(t.get(0)).toBe(1);
		expect(t.get(1)).toBe(2);

		expect(t.get(6)).toBe(7);

		expect(t.get(35)).toBe(9);

		expect(() => t.get(36)).toThrow();
	});

	it('map', () => {
		{
			const t = context.innerTree(nlb1, nlb1, nlb3, 36, 1);
			const r = t.map((v) => v + 1);
			expect(r.length).toBe(t.length);
			expect(r.level).toBe(t.level);
			expect(r.toArray()).toEqual(
				t
					.stream()
					.map((v) => v + 1)
					.toArray(),
			);
		}
		{
			const t = context.innerTree(nlb1, nlb1, nlb3, 36, 1);
			const r = t.map((v) => v + 1, { reversed: true });
			expect(r.length).toBe(t.length);
			expect(r.level).toBe(t.level);
			expect(r.toArray()).toEqual(
				t
					.stream({ reversed: true })
					.map((v) => v + 1)
					.toArray(),
			);
		}
	});

	it('mapPure', () => {
		{
			const t = context.innerTree(nlb1, nlb1, nlb3, 36, 1);
			const r = t.mapPure((v) => v + 1);
			expect(r.length).toBe(t.length);
			expect(r.level).toBe(t.level);
			expect(r.left.nrChildren).toBe(t.left.nrChildren);
			expect(r.right.nrChildren).toBe(t.right.nrChildren);
			expect(r.left).toBe(r.right);
		}
		{
			const t = context.innerTree(nlb1, nlb1, nlb3, 1);
			const r = t.mapPure((v) => v + 1, { reversed: true });
			expect(r.length).toBe(t.length);
			expect(r.level).toBe(t.level);
			expect(r.left.nrChildren).toBe(t.left.nrChildren);
			expect(r.right.nrChildren).toBe(t.right.nrChildren);
			expect(r.left).toBe(r.right);
		}
	});

	it('prependChild', () => {
		const t = createTree();
		const r1 = t.prependChild(b4);

		expect(r1.right).toBe(nlb2);
		expect(r1.left).toBeInstanceOf(InnerBlock);
		expect(r1.left.toArray()).toEqual(
			Stream.of(10, 11, 12)
				.concat(Stream.range({ start: 1, amount: 9 }))
				.toArray(),
		);
		expect(r1.left.nrChildren).toBe(4);
		expect(r1.left.children[0]).toBe(b4);
		expect(r1.middle).toBe(nlb3);

		const r2 = r1.prependChild(b5);
		expect(r2.right).toBe(nlb2);
		expect(r2.left).toBeInstanceOf(InnerBlock);
		expect(r2.left.nrChildren).toBe(4);
		expect(r2.left.children[0]).toBe(b5);
		expect(r2.middle?.length).toBe(21);

		const r3 = r2.prependChild(b5);
		expect(r3.right).toBe(nlb2);
		expect(r3.left).toBeInstanceOf(InnerBlock);
		expect(r3.left.nrChildren).toBe(1);
		expect(r3.left.children[0]).toBe(b5);
		expect(r3.middle?.length).toBe(33);
	});

	it('prependMiddleBlock', () => {
		{
			const t = createTree();

			expect((t.middle as any).nrChildren).toBe(2);
			const r1 = t.prependMiddleBlock(nlb1) as InnerBlock<any, any>;
			expect(r1).toBeInstanceOf(InnerBlock);
			expect(r1.nrChildren).toBe(3);
			expect(r1.children).toEqual([nlb1, nlb2, nlb1]);
		}
		{
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				nlb2,
				null,
				18,
				1,
			);

			const r1 = t.prependMiddleBlock(nlb1) as InnerBlock<any, any>;
			expect(r1).toBeInstanceOf(InnerBlock);
			expect(r1.nrChildren).toBe(1);
			expect(r1.children).toEqual([nlb1]);
		}
		{
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				nlb2,
				context.innerBlock([nlb1, nlb1, nlb1, nlb1], 36, 2),
				54,
				1,
			);

			const r1 = t.prependMiddleBlock(nlb1) as InnerTree<any, any>;
			expect(r1).toBeInstanceOf(InnerTree);
			expect(r1.right.nrChildren).toBe(4);
			expect(r1.left.nrChildren).toBe(1);
		}
	});

	it('reversed', () => {
		const t = context.innerTree(nlb1, nlb1, nlb3, 36, 1);
		const r = t.reversed();
		expect(r.left).toBe(r.right);
		expect(r.toArray()).toEqual(t.toArray({ reversed: true }));
	});

	it('structure', () => {
		expect(createTree()._structure(0)).toMatchInlineSnapshot(`
      "InnerTree(lev:1, len:36)
        left: (len:9, children:3)
          InnerBlock(lev:1, len:9, ch: 3)
              OuterBlock<3>(1,2,3)
              OuterBlock<3>(4,5,6)
              OuterBlock<3>(7,8,9)
        middle: (len:18)
          InnerBlock(lev:2, len:18, ch: 2)
              InnerBlock(lev:1, len:9, ch: 3)
                  OuterBlock<3>(1,2,3)
                  OuterBlock<3>(4,5,6)
                  OuterBlock<3>(7,8,9)
              InnerBlock(lev:1, len:9, ch: 3)
                  OuterBlock<3>(1,2,3)
                  OuterBlock<3>(4,5,6)
                  OuterBlock<3>(7,8,9)
        right: (len:9, children:3)
          InnerBlock(lev:1, len:9, ch: 3)
              OuterBlock<3>(1,2,3)
              OuterBlock<3>(4,5,6)
              OuterBlock<3>(7,8,9)"
    `);
	});

	it('stream', () => {
		const t = createTree();

		expect(t.stream().toArray()).toEqual(
			nlb1.stream().concat(nlb2, nlb3).toArray(),
		);
		expect(t.stream({ reversed: true }).toArray()).toEqual<any>(
			nlb1.stream().concat(nlb2, nlb3).toArray().reverse(),
		);
	});

	it('streamRange', () => {
		const t = createTree();

		expect(t.stream().toArray()).toEqual(
			nlb1.stream().concat(nlb2, nlb3).toArray(),
		);
		expect(t.stream({ reversed: true }).toArray()).toEqual<any>(
			nlb1.stream().concat(nlb2, nlb3).toArray().reverse(),
		);

		expect(t.streamRange({ amount: 0 })).toBe(Stream.empty());
		expect(t.streamRange({ amount: 4 }).toArray()).toEqual([1, 2, 3, 4]);
		expect(t.streamRange({ start: 4, amount: 4 }).toArray()).toEqual([
			5, 6, 7, 8,
		]);
		expect(
			t.streamRange({ start: 4, amount: 4 }, { reversed: true }).toArray(),
		).toEqual([8, 7, 6, 5]);
	});

	it('takeInternal', () => {
		{
			// only left remains
			const t = createTree();
			const [newRight, up, upAmount] = t.takeInternal(1);
			expect(upAmount).toBe(1);
			expect(up).toBe(b1);
			expect(newRight).toBeNull();
		}
		{
			// take from middle
			const t = createTree();
			const [newT, up, upAmount] = t.takeInternal(18);
			expect(upAmount).toBe(3);
			expect(up).toBe(b3);
			expect(newT?.toArray()).toEqual(t.toArray({ range: { amount: 18 - 3 } }));
			expect(newT).toBeInstanceOf(InnerTree);
		}
		{
			// take from right with middle
			const t = createTree();
			const [newT, up, upAmount] = t.takeInternal(35);
			expect(upAmount).toBe(2);
			expect(up).toBe(b3);
			expect(newT?.toArray()).toEqual(t.toArray({ range: { amount: 33 } }));
			expect(newT).toBeInstanceOf(InnerTree);
		}
		{
			// take no right remains with middle
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				context.innerBlock<number, OuterBlock<number>>([b3], 3, 1),
				nlb3,
				30,
				1,
			);
			const [newT, up, upAmount] = t.takeInternal(28);
			expect(upAmount).toBe(1);
			expect(up).toBe(b3);
			expect(newT?.toArray()).toEqual(t.toArray({ range: { amount: 28 - 1 } }));
			expect(newT).toBeInstanceOf(InnerTree);
		}
		{
			// take from right no middle
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				nlb2,
				null,
				18,
				1,
			);
			const [newRight, up, upAmount] = t.takeInternal(17);
			expect(upAmount).toBe(2);
			expect(up).toBe(b3);
			expect(newRight?.toArray()).toEqual(t.toArray({ range: { amount: 15 } }));
			expect(newRight).toBeInstanceOf(InnerTree);
		}
		{
			// take from right no middle, no right remains
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				nlb2,
				null,
				18,
				1,
			);
			const [newRight, up, upAmount] = t.takeInternal(15);
			expect(upAmount).toBe(3);
			expect(up).toBe(b2);
			expect(newRight?.toArray()).toEqual(t.toArray({ range: { amount: 12 } }));
			expect(newRight).toBeInstanceOf(InnerBlock);
		}
		{
			// only left remains, no middle
			const t = context.innerTree<number, OuterBlock<number>>(
				nlb1,
				context.innerBlock<number, OuterBlock<number>>([b3], 3, 1),
				null,
				12,
				1,
			);
			const [newRight, up, upAmount] = t.takeInternal(10);
			expect(upAmount).toBe(1);
			expect(up).toBe(b3);
			expect(newRight?.toArray()).toEqual(
				t.toArray({ range: { amount: 10 - 1 } }),
			);
			expect(newRight).toBeInstanceOf(InnerBlock);
		}
	});

	it('updateAt', () => {
		const t = createTree();

		function verify(index: number) {
			expect(t.updateAt(index, () => 100).toArray()).toEqual(
				t
					.stream()
					.map((v, i) => (i === index ? 100 : v))
					.toArray(),
			);
		}

		for (let i = 0; i < t.length; i++) {
			verify(i);
		}
	});
});
