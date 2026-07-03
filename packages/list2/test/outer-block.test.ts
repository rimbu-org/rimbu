import { describe, expect, it, vi } from 'bun:test';

import type { ReversedOuterBlock } from '@rimbu/list/internal/immutable/reversed-outer-block';

import type { ListContext } from '#list/context-module';

import { List } from '@rimbu/list2';
import { Stream } from '@rimbu/stream';

import { OuterBlock } from '#list/immutable/outer-block';
import { OuterTree } from '#list/immutable/outer-tree';
import { ListHelpers } from '#list/list-helpers';
import { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

describe('OuterBlock', () => {
	it('_mutateNormalize', () => {
		const b3 = createBlock(1, 2, 3);
		const b6 = createBlock(1, 2, 3, 4, 5, 6);

		expect(b3.children).toEqual([1, 2, 3]);
		expect(b3._mutateNormalize()).toBe(b3);
		expect(b3.children).toEqual([1, 2, 3]);

		expect(b6.children).toEqual([1, 2, 3, 4, 5, 6]);
		const bn = b6._mutateNormalize() as OuterTree<number>;
		expect(bn).not.toBe(b6);
		expect(b6.children).toEqual([1, 2, 3]);
		expect(bn.left).toBe(b6);
		expect(bn.right.children).toEqual([4, 5, 6]);
	});

	it('_mutateSplitRight', () => {
		{
			const b6 = createBlock(1, 2, 3, 4, 5, 6);

			expect(b6.children).toEqual([1, 2, 3, 4, 5, 6]);
			const bn = b6._mutateSplitRight();
			expect(bn).not.toBe(b6);
			expect(b6.children).toEqual([1, 2, 3]);
			expect(bn.children).toEqual([4, 5, 6]);
		}
		{
			const b6 = createBlock(1, 2, 3, 4, 5, 6);

			expect(b6.children).toEqual([1, 2, 3, 4, 5, 6]);
			const bn = b6._mutateSplitRight(4);
			expect(bn).not.toBe(b6);
			expect(b6.children).toEqual([1, 2, 3, 4]);
			expect(bn.children).toEqual([5, 6]);
		}
	});

	it('concat', () => {
		const b0 = context.empty<number>();
		const b2 = createBlock(1, 2);
		const b3 = createBlock(1, 2, 3);

		expect(b2.concat(b0)).toBe(b2);
		expect(b2.concat(b2)).toBeInstanceOf(OuterBlock);
		expect(b2.concat(b2).toArray()).toEqual([1, 2, 1, 2]);
		expect(b2.concat(b3)).toBeInstanceOf(OuterTree);

		// no mutations for original collections
		expect(b2.children).toEqual([1, 2]);
		expect(b3.children).toEqual([1, 2, 3]);
	});

	it('concatTree', () => {
		{
			const tr = createBlock(1, 2, 3, 4).concatTree(
				context.outerTree(createBlock(5), createBlock(6, 7, 8, 9), null, 5),
			);

			expect(tr.left.toArray()).toEqual([1]);
			expect(tr.middle?.toArray()).toEqual([2, 3, 4, 5]);
			expect(tr.right.toArray()).toEqual([6, 7, 8, 9]);
		}
		{
			const tr = createBlock(1).concatTree(
				context.outerTree(createBlock(5), createBlock(6, 7, 8, 9), null, 5),
			);
			expect(tr.left.toArray()).toEqual([1, 5]);
			expect(tr.middle).toBeNull();
		}
		{
			const tr = createBlock(1).concatTree(
				context.outerTree(createBlock(5, 6, 7, 8), createBlock(9), null, 5),
			);
			expect(tr.left.toArray()).toEqual([1, 5, 6]);
			expect(tr.middle).toBeNull();
			expect(tr.right.toArray()).toEqual([7, 8, 9]);
		}
	});
});

describe('ReversedOuterBlock', () => {
	it('_mutateNormalize', () => {
		const b3 = createRevBlock(1, 2, 3);
		const b6 = createRevBlock(1, 2, 3, 4, 5, 6);

		expect(b3.children).toEqual([3, 2, 1]);
		expect(b3._mutateNormalize()).toBe(b3);
		expect(b3.children).toEqual([3, 2, 1]);

		expect(b6.children).toEqual([6, 5, 4, 3, 2, 1]);
		const bn = b6._mutateNormalize() as OuterTree<number>;
		expect(bn).not.toBe(b6);
		expect(b6.children).toEqual([3, 2, 1]);
		expect(bn.left).toBe(b6);
		expect(bn.right.children).toEqual([6, 5, 4]);
	});

	it('_mutateSplitRight', () => {
		{
			const b6 = createRevBlock(1, 2, 3, 4, 5, 6);

			expect(b6.children).toEqual([6, 5, 4, 3, 2, 1]);
			const bn = b6._mutateSplitRight();
			expect(bn).not.toBe(b6);
			expect(b6.children).toEqual([3, 2, 1]);
			expect(bn.children).toEqual([6, 5, 4]);
		}
		{
			const b6 = createRevBlock(1, 2, 3, 4, 5, 6);
			const bn = b6._mutateSplitRight(4);
			expect(bn).not.toBe(b6);
			expect(b6.children).toEqual([4, 3, 2, 1]);
			expect(bn.children).toEqual([6, 5]);
		}
	});

	it('concat', () => {
		const b0 = context.empty<number>();
		const b2 = createRevBlock(1, 2);
		const b3 = createRevBlock(1, 2, 3);

		expect(b2.concat(b0)).toBe(b2);
		expect(b2.concat(b2)).toBeInstanceOf(OuterBlock);
		expect(b2.concat(b2).toArray()).toEqual([1, 2, 1, 2]);
		expect(b2.concat(b3)).toBeInstanceOf(OuterTree);
		expect(b2.concat(b3).toArray()).toEqual([1, 2, 1, 2, 3]);

		// no mutations for original collections
		expect(b2.children).toEqual([2, 1]);
		expect(b3.children).toEqual([3, 2, 1]);
	});
});

function runOuterBlockTests(
	tag: string,
	context: ListContext,
	createBlock: <T>(...elems: T[]) => OuterBlock<T>,
	createRevBlock: <T>(...elems: T[]) => OuterBlock<T>,
) {
	describe(`${tag} common OuterBlock`, () => {
		it('append', () => {
			expect(createBlock(1, 2, 3).append(4)).toBeInstanceOf(OuterBlock);
			expect(createBlock(1, 2, 3, 4).append(5)).toBeInstanceOf(OuterTree);
		});

		it('appendBlockChild', () => {
			expect(createBlock(1, 2, 3).appendBlockChild(4).toArray()).toEqual([
				1, 2, 3, 4,
			]);
			expect(createBlock(1, 2, 3, 4).appendBlockChild(5).toArray()).toEqual([
				1, 2, 3, 4, 5,
			]);
		});

		it('asNormal', () => {
			const b = createBlock(1);
			expect(b.asNormal()).toBe(b);
		});

		it('assumeNonEmpty', () => {
			const b = createBlock(1);
			expect(b.assumeNonEmpty()).toBe(b);
		});

		it('canAddChild', () => {
			expect(createBlock(1, 2, 3).canAddChild).toBe(true);
			expect(createBlock(1, 2, 3, 4).canAddChild).toBe(false);
		});

		it('childrenInMax', () => {
			expect(createBlock(1, 2, 3).childrenInMax).toBe(true);
			expect(createBlock(1, 2, 3, 4).childrenInMax).toBe(true);
			expect(createBlock(1, 2, 3, 4, 5).childrenInMax).toBe(false);
		});

		it('childrenInMax', () => {
			expect(createBlock(1).childrenInMin).toBe(false);
			expect(createBlock(1, 2).childrenInMin).toBe(true);
			expect(createBlock(1, 2, 3, 4, 5).childrenInMin).toBe(true);
		});

		it('collect', () => {
			expect(
				createBlock(1, 2, 3)
					.collect((v) => v)
					.toArray(),
			).toEqual([1, 2, 3]);
			expect(createBlock(1, 2, 3).collect((_, __, skip) => skip)).toBe(
				context.empty(),
			);
			expect(
				createBlock(1, 2, 3)
					.collect((v, __, ___, halt) => {
						halt();
						return v;
					})
					.toArray(),
			).toEqual([1]);
		});

		it('concatBlock', () => {
			const b2 = createBlock(1, 2);
			const b3 = createBlock(1, 2, 3);

			expect(b2.concatBlock(b2)).toBeInstanceOf(OuterBlock);
			expect(b2.concatBlock(b3)).toBeInstanceOf(OuterTree);
		});

		it('concatChildren', () => {
			const b2 = createBlock(1, 2);
			const b3 = createBlock(1, 2, 3);

			expect(b2.concatChildren(b2).toArray()).toEqual([1, 2, 1, 2]);
			expect(b2.concatChildren(b3).toArray()).toEqual([1, 2, 1, 2, 3]);
		});

		it('concatTree', () => {
			const b1 = createBlock(10);
			const b3 = createBlock(10, 11, 12);

			const t6 = context.outerTree(
				createBlock(1, 2, 3),
				createBlock(4, 5, 6),
				null,
				6,
			);

			const tr1 = b1.concatTree(t6);

			expect(tr1.left.toArray()).toEqual([10, 1, 2, 3]);
			expect(tr1.right.toArray()).toEqual([4, 5, 6]);

			const tr2 = b3.concatTree(t6);

			expect(tr2.left).toBe(b3);
			expect(tr2.middle?.toArray()).toEqual([1, 2, 3]);
			expect(tr2.right.toArray()).toEqual([4, 5, 6]);
		});

		it('context', () => {
			expect(createBlock(1).context).toBe(context);
		});

		it('copy', () => {
			const b1 = createBlock(1);
			expect(b1.copy([1]).children).toEqual([1]);
		});

		it('copy2', () => {
			const b1 = createBlock(1);
			expect(b1.copy2([1]).children).toEqual([1]);
		});

		it('createBlockBuilder', () => {
			const b1 = createBlock(1);
			expect(b1.createBlockBuilder()).toBeInstanceOf(OuterBlockBuilder);
			expect(b1.createBlockBuilder().build()).toBe(b1);
		});

		it('drop', () => {
			const b3 = createBlock(1, 2, 3);
			expect(b3.drop(0)).toBe(b3);

			expect(b3.drop(1).toArray()).toEqual([2, 3]);
			expect(b3.drop(10)).toBe(context.empty());
			expect(b3.drop(-1).toArray()).toEqual([1, 2]);
		});

		it('dropChildren', () => {
			const b3 = createBlock(1, 2, 3);
			expect(b3.dropChildren(0)).toBe(b3);

			expect(b3.dropChildren(1).toArray()).toEqual([2, 3]);
		});

		it('filter', () => {
			const b3 = createBlock(1, 2, 3);
			expect(b3.filter((v) => v !== 2).toArray()).toEqual([1, 3]);
			expect(b3.filter(() => true)).toBe(b3);
			expect(b3.filter(() => false)).toBe(context.empty());
		});

		it('first', () => {
			const b3 = createBlock(1, 2, 3);
			expect(b3.first()).toBe(1);
		});

		it('flatMap', () => {
			const b3 = createBlock(1, 2, 3);
			expect(b3.flatMap(() => [])).toBe(context.empty());
			expect(b3.flatMap((v) => [v]).toArray()).toEqual([1, 2, 3]);
		});

		it('flatten', () => {
			const b3 = createBlock([1], [2], [], [3, 4]);
			expect(List.flatten(b3).toArray()).toEqual([1, 2, 3, 4]);
		});

		it('forEach', () => {
			const b3 = createBlock(1, 2, 3, 4);
			const cb = vi.fn();
			b3.forEach(cb);
			expect(cb).toBeCalledTimes(4);
			expect(cb.mock.calls[1][0]).toBe(2);
			expect(cb.mock.calls[1][1]).toBe(1);

			cb.mockReset();

			b3.forEach(cb, { reversed: true });
			expect(cb).toBeCalledTimes(4);
			expect(cb.mock.calls[1][0]).toBe(3);
			expect(cb.mock.calls[1][1]).toBe(1);

			cb.mockReset();

			b3.forEach((_, __, halt) => {
				halt();
				cb();
			});

			expect(cb).toBeCalledTimes(1);
		});

		it('get', () => {
			const b3 = createBlock(1, 2, 3);
			expect(b3.get(1)).toBe(2);
			expect(b3.get(1, 'a')).toBe(2);
			expect(b3.get(1, () => 'a')).toBe(2);

			expect(b3.get(10)).toBe(undefined);
			expect(b3.get(10, 'a')).toBe('a');
			expect(b3.get(10, () => 'a')).toBe('a');

			expect(b3.get(-1)).toBe(3);
		});

		it('insert', () => {
			const b3 = createBlock(1, 2, 3);

			const r1 = b3.insert(1, [10]);
			expect(r1).toBeInstanceOf(OuterBlock);
			expect(r1.toArray()).toEqual([1, 10, 2, 3]);

			const r2 = b3.insert(1, [10, 11, 12]);
			expect(r2).toBeInstanceOf(OuterTree);
			expect(r2.toArray()).toEqual([1, 10, 11, 12, 2, 3]);
		});

		it('isEmpty', () => {
			expect(createBlock(1).isEmpty).toBe(false);
		});

		it('last', () => {
			const b3 = createBlock(1, 2, 3);
			expect(b3.last()).toBe(3);
		});

		it('length', () => {
			expect(createBlock(1).length).toBe(1);
			expect(createBlock(1, 2, 3).length).toBe(3);
		});

		it('map', () => {
			expect(
				createBlock(1, 2, 3)
					.map((v) => v + 1)
					.toArray(),
			).toEqual([2, 3, 4]);

			expect(
				createBlock(1, 2, 3)
					.map((v) => v + 1, { reversed: true })
					.toArray(),
			).toEqual([4, 3, 2]);
		});

		it('mapPure', () => {
			expect(
				createBlock(1, 2, 3)
					.mapPure((v) => v + 1)
					.toArray(),
			).toEqual([2, 3, 4]);
			expect(
				createBlock(1, 2, 3)
					.mapPure((v) => v + 1, { reversed: true })
					.toArray(),
			).toEqual([4, 3, 2]);
		});

		it('nonEmpty', () => {
			const b1 = createBlock(1);
			expect(b1.nonEmpty()).toBe(true);
		});

		it('padTo', () => {
			const b1 = createBlock(1);

			expect(b1.padTo(0, 3)).toBe(b1);

			expect(b1.padTo(3, 3).toArray()).toEqual([1, 3, 3]);

			expect(b1.padTo(3, 3, { positionPercentage: 50 }).toArray()).toEqual([
				3, 1, 3,
			]);

			expect(b1.padTo(10, 3)).not.toBeInstanceOf(OuterBlock);
		});

		it('prepend', () => {
			expect(createBlock(1, 2, 3).prepend(4)).toBeInstanceOf(OuterBlock);
			expect(createBlock(1, 2, 3, 4).prepend(5)).toBeInstanceOf(OuterTree);
		});

		it('prependBlockChild', () => {
			expect(createBlock(1, 2, 3).prependBlockChild(4).toArray()).toEqual([
				4, 1, 2, 3,
			]);
			expect(createBlock(1, 2, 3, 4).prependBlockChild(5).toArray()).toEqual([
				5, 1, 2, 3, 4,
			]);
		});

		it('remove', () => {
			const b3 = createBlock(1, 2, 3);
			expect(b3.remove(1).toArray()).toEqual([1, 3]);
			expect(b3.remove(-1).toArray()).toEqual([1, 2]);
			expect(b3.remove(1, { amount: 2 }).toArray()).toEqual([1]);
			expect(b3.remove(0, { amount: 3 })).toBe(context.empty());
			expect(b3.remove(1, { amount: 0 })).toBe(b3);
		});

		it('repeat', () => {
			const b3 = createBlock(1, 2, 3);
			expect(b3.repeat(1)).toBe(b3);
			expect(b3.repeat(0)).toBe(b3);
			expect(b3.repeat(2).toArray()).toEqual([1, 2, 3, 1, 2, 3]);
			expect(b3.repeat(2)).toBeInstanceOf(OuterTree);
			expect(b3.repeat(10).length).toBe(30);
		});

		it('reversed', () => {
			const b3 = createBlock(1, 2, 3);
			expect(b3.reversed().toArray()).toEqual([3, 2, 1]);
			expect(b3.reversed().reversed().toArray()).toEqual([1, 2, 3]);
		});

		it('rotate', () => {
			const b1 = createBlock(1);
			expect(b1.rotate(5)).toBe(b1);

			const b3 = createBlock(1, 2, 3);
			expect(b3.rotate(0)).toBe(b3);
			expect(b3.rotate(3)).toBe(b3);
			expect(b3.rotate(-3)).toBe(b3);
			expect(b3.rotate(1).toArray()).toEqual([3, 1, 2]);
			expect(b3.rotate(4).toArray()).toEqual([3, 1, 2]);
			expect(b3.rotate(-2).toArray()).toEqual([3, 1, 2]);
		});

		it('slice', () => {
			const b5 = createBlock(1, 2, 3, 4, 5);
			expect(b5.slice({ start: 2 }).toArray()).toEqual([3, 4, 5]);
			expect(b5.slice({ start: 2 }, { reversed: true }).toArray()).toEqual([
				5, 4, 3,
			]);

			expect(b5.slice({ start: -3, amount: 2 }).toArray()).toEqual([3, 4]);
			expect(
				b5.slice({ start: -3, amount: 2 }, { reversed: true }).toArray(),
			).toEqual([4, 3]);
		});

		it('splice', () => {
			const b3 = createBlock(1, 2, 3);
			expect(b3.splice()).toBe(b3);
			expect(b3.splice({ remove: 1 }).toArray()).toEqual([2, 3]);
			expect(b3.splice({ index: 1, remove: 1 }).toArray()).toEqual([1, 3]);
			expect(b3.splice({ remove: 10 })).toBe(context.empty());
			expect(b3.splice({ insert: [10, 11] }).toArray()).toEqual([
				10, 11, 1, 2, 3,
			]);
			expect(b3.splice({ index: 1, insert: [10, 11] }).toArray()).toEqual([
				1, 10, 11, 2, 3,
			]);
			expect(
				b3.splice({ index: 1, remove: 1, insert: [10, 11] }).toArray(),
			).toEqual([1, 10, 11, 3]);
		});

		it('stream', () => {
			const b5 = createBlock(1, 2, 3, 4, 5);

			expect(b5.stream().toArray()).toEqual([1, 2, 3, 4, 5]);
			expect(b5.stream({ reversed: true }).toArray()).toEqual([5, 4, 3, 2, 1]);
		});

		it('streamRange', () => {
			const b5 = createBlock(1, 2, 3, 4, 5);

			expect(b5.streamRange({ amount: 0 })).toBe(Stream.empty());
			expect(b5.streamRange({ amount: 2 }).toArray()).toEqual([1, 2]);
			expect(
				b5.streamRange({ amount: 2 }, { reversed: true }).toArray(),
			).toEqual([2, 1]);

			expect(b5.streamRange({ start: 2, amount: 2 }).toArray()).toEqual([3, 4]);
			expect(
				b5.streamRange({ start: 2, amount: 2 }, { reversed: true }).toArray(),
			).toEqual([4, 3]);
		});

		it('structure', () => {
			const b3 = createBlock(1, 2, 3);

			const s = b3._structure();

			if (b3.isReversedBlock) {
				expect(s).toEqual('ReversedOuterBlock<3>(1,2,3)');
			} else {
				expect(s).toEqual('OuterBlock<3>(1,2,3)');
			}
		});

		it('take', () => {
			const b5 = createBlock(1, 2, 3, 4, 5);

			expect(b5.take(0)).toBe(context.empty());
			expect(b5.take(3).toArray()).toEqual([1, 2, 3]);
			expect(b5.take(-3).toArray()).toEqual([3, 4, 5]);
		});

		it('takeChildren', () => {
			const b5 = createBlock(1, 2, 3, 4, 5);

			expect(b5.takeChildren(2).toArray()).toEqual([1, 2]);
			expect(b5.takeChildren(5)).toBe(b5);
		});

		it('toArray', () => {
			const b5 = createBlock(1, 2, 3, 4, 5);
			expect(b5.toArray()).toEqual([1, 2, 3, 4, 5]);
			expect(b5.toArray({ reversed: true })).toEqual([5, 4, 3, 2, 1]);
			expect(b5.toArray({ range: { start: 3 } })).toEqual([4, 5]);
			expect(b5.toArray({ range: { start: 3 }, reversed: true })).toEqual([
				5, 4,
			]);
			expect(
				b5.toArray({ range: { start: 2, amount: 2 }, reversed: true }),
			).toEqual([4, 3]);
		});

		it('toBuilder', () => {
			const b3 = createBlock(1, 2, 3);
			expect(b3.toBuilder().build()).toBe(b3);
			const builder = b3.toBuilder();
			builder.append(4);
			expect(builder.build().toArray()).toEqual([1, 2, 3, 4]);
			expect(b3.toArray()).toEqual([1, 2, 3]);
		});

		it('toString', () => {
			const b3 = createBlock(1, 2, 3);

			expect(b3.toString()).toEqual('List(1, 2, 3)');
		});

		it('unzip', () => {
			{
				const [l1, l2] = List.unzip(createBlock<[number, string]>([1, 'a']), {
					length: 2,
				});

				expect(l1.toArray()).toEqual([1]);
				expect(l2.toArray()).toEqual(['a']);
			}

			{
				const [l1, l2] = List.unzip(
					createBlock<[number, string]>([1, 'a'], [2, 'b']),
					{
						length: 2,
					},
				);

				expect(l1.toArray()).toEqual([1, 2]);
				expect(l2.toArray()).toEqual(['a', 'b']);
			}
		});

		it('updateAt', () => {
			const b3 = createBlock(1, 2, 3, 4, 5);

			expect(b3.updateAt(3, () => 10).toArray()).toEqual([1, 2, 3, 10, 5]);
			expect(b3.updateAt(3, (v) => v + 10).toArray()).toEqual([1, 2, 3, 14, 5]);
			expect(b3.updateAt(-3, () => 10).toArray()).toEqual([1, 2, 10, 4, 5]);
			expect(b3.updateAt(-3, (v) => v + 10).toArray()).toEqual([
				1, 2, 13, 4, 5,
			]);
			expect(b3.updateAt(10, () => 10)).toBe(b3);
		});
	});
}

const context = ListHelpers.createListContext({
	blockSizeBits: 2,
}) as unknown as ListContext<ListHelpers.TypesImpl>;

function createBlock<T>(...elems: T[]): OuterBlock<T, ListHelpers.TypesImpl> {
	return context.outerBlock(elems) as any;
}

function createRevBlock<T>(
	...elems: T[]
): ReversedOuterBlock<T, ListHelpers.TypesImpl> {
	return context.reversedOuterBlock(elems.reverse()) as any;
}

runOuterBlockTests('leaf', context, createBlock, createRevBlock);
runOuterBlockTests('reversed leaf', context, createRevBlock, createBlock);

describe('OuterBlock special cases', () => {
	it('concatChildren', () => {
		const b = context.outerBlock([1, 2, 3]);
		const rb = context.reversedOuterBlock([6, 5, 4]);

		const r1 = b.concatChildren(b);
		expect(r1.toArray()).toEqual([1, 2, 3, 1, 2, 3]);

		const r2 = b.concatChildren(rb);
		expect(r2.toArray()).toEqual([1, 2, 3, 4, 5, 6]);

		const r3 = rb.concatChildren(rb);
		expect(r3.toArray()).toEqual([4, 5, 6, 4, 5, 6]);

		const r4 = rb.concatChildren(b);
		expect(r4.toArray()).toEqual([4, 5, 6, 1, 2, 3]);
	});
});
