import { Stream } from '@rimbu/stream';
import { LeafBlock, ListContext, NonLeafBlock } from '../src/list-custom';
import './setupTests';

const context = new ListContext(2);

describe('NonLeafTree', () => {
  const b1 = context.leafBlock([1, 2, 3]);
  const b2 = context.leafBlock([4, 5, 6]);
  const b3 = context.leafBlock([7, 8, 9]);
  const b4 = context.leafBlock([10, 11, 12]);
  const b5 = context.leafBlock([13, 14, 15]);
  const nlb1 = context.nonLeafBlock<number, LeafBlock<number>>(
    9,
    [b1, b2, b3],
    1
  );
  const nlb2 = context.nonLeafBlock<number, LeafBlock<number>>(
    9,
    [b1, b2, b3],
    1
  );
  const nlb3 = context.nonLeafBlock<
    number,
    NonLeafBlock<number, LeafBlock<number>>
  >(18, [nlb1, nlb2], 2);

  function createTree() {
    return context.nonLeafTree<number, LeafBlock<number>>(nlb1, nlb2, nlb3, 2);
  }

  // it('_normalize', () => {
  //   {
  //     // merge to block to block
  //     const t = context.leafTree(
  //       createBlock([1, 2]),
  //       createBlock([11, 12]),
  //       null
  //     );
  //     const n = t._normalize();
  //     expect(n).toBeInstanceOf(LeafBlock);
  //     expect(n.toArray()).toEqual([1, 2, 11, 12]);
  //   }
  //   {
  //     // not possible to merge
  //     const t = context.leafTree(
  //       createBlock([1, 2, 3]),
  //       createBlock([3, 4]),
  //       null
  //     );
  //     const n = t._normalize();
  //     expect(n).toBe(t);
  //   }
  //   {
  //     // merge middle with left
  //     const t = context.leafTree(
  //       createBlock([1]),
  //       createBlock([11, 12]),
  //       context.nonLeafBlock(3, [createBlock([21, 22, 23])], 1)
  //     );
  //     const n = t._normalize() as LeafTree<number>;
  //     expect(n.left.toArray()).toEqual([1, 21, 22, 23]);
  //     expect(n.middle).toBeNull();
  //     expect(n.right.toArray()).toEqual([11, 12]);
  //   }
  //   {
  //     // merge middle with right
  //     const t = context.leafTree(
  //       createBlock([1, 2, 3]),
  //       createBlock([11]),
  //       context.nonLeafBlock(3, [createBlock([21, 22, 23])], 1)
  //     );
  //     const n = t._normalize() as LeafTree<number>;
  //     expect(n.left.toArray()).toEqual([1, 2, 3]);
  //     expect(n.middle).toBeNull();
  //     expect(n.right.toArray()).toEqual([21, 22, 23, 11]);
  //   }
  // });

  it('append', () => {
    const t = createTree();
    const r1 = t.append(b4);

    expect(r1.left).toBe(nlb1);
    expect(r1.right).toBeInstanceOf(NonLeafBlock);
    expect(r1.right.toArray()).toEqual(
      Stream.range({ start: 1, amount: 12 }).toArray()
    );
    expect(r1.right.nrChildren).toBe(4);
    expect(r1.right.children[3]).toBe(b4);
    expect(r1.middle).toBe(nlb3);

    const r2 = r1.append(b5);
    expect(r2.left).toBe(nlb1);
    expect(r2.right).toBeInstanceOf(NonLeafBlock);
    expect(r2.right.nrChildren).toBe(1);
    expect(r2.right.children[0]).toBe(b5);
    expect(r2.middle?.length).toBe(30);
  });

  it('appendMiddle', () => {
    const t = createTree();

    const r1 = t.appendMiddle(nlb1) as NonLeafBlock<any, any>;
    expect(r1.nrChildren).toBe(3);
    expect(r1.children).toBeArrayOf([nlb1, nlb2, nlb1]);

    // const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

    // const r2 = t9.appendMiddle(b3);
    // expect(r2.toArray()).toEqual([1, 2, 3, 1, 2, 3]);

    // const t12 = context.leafTree(
    //   b3,
    //   b3,
    //   context.nonLeafBlock(12, [b3, b3, b3, b3], 1)
    // );

    // const r3 = t12.appendMiddle(b3);
    // expect(r3).toBeInstanceOf(NonLeafTree);
  });

  // it('asNormal', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);
  //   expect(t6.asNormal()).toBe(t6);
  // });

  // it('assumeNonEmpty', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);
  //   expect(t6.assumeNonEmpty()).toBe(t6);
  // });

  // it('collect', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.collect((v) => v).toArray()).toEqual([1, 2, 3, 1, 2, 3]);
  //   expect(t6.collect((_, __, skip) => skip)).toBe(context.empty());
  //   expect(
  //     t6
  //       .collect((v, __, ___, halt) => {
  //         halt();
  //         return v;
  //       })
  //       .toArray()
  //   ).toEqual([1]);
  // });

  // it('concat', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.concat(context.empty())).toBe(t6);

  //   const t7 = t6.concat(createBlock([10])) as LeafTree<number>;
  //   expect(t7.left).toBe(b3);
  //   expect(t7.middle).toBeNull();
  //   expect(t7.right.toArray()).toEqual([1, 2, 3, 10]);

  //   const t8 = t7.concat(b3) as LeafTree<number>;
  //   expect(t8.left).toBe(b3);
  //   expect(t8.middle?.toArray()).toEqual([1, 2, 3, 10]);
  //   expect(t8.right).toBe(b3);

  //   const t9 = t8.concat(t8) as LeafTree<number>;

  //   expect(t9.left).toBe(b3);
  //   expect(t9.right).toBe(b3);
  //   const m = t9.middle as NonLeafBlock<any, any>;
  //   expect(m.nrChildren).toBe(4);
  //   expect(m.children[1]).toBe(b3);
  //   expect(m.children[2]).toBe(b3);
  // });

  // it('concatBlock', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   const r1 = t6.concatBlock(createBlock([10])) as LeafTree<number>;
  //   expect(r1.middle).toBeNull();
  //   expect(r1.left).toBe(b3);
  //   expect(r1.right.toArray()).toEqual([1, 2, 3, 10]);

  //   const r2 = t6.concatBlock(createBlock([10, 11])) as LeafTree<number>;
  //   expect(r2.left).toBe(b3);
  //   expect(r2.right.toArray()).toEqual([10, 11]);
  //   const m2 = r2.middle as NonLeafBlock<any, any>;
  //   expect(m2.nrChildren).toBe(1);
  //   expect(m2.children[0]).toBe(b3);
  // });

  // it('concatTree', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   const r1 = t6.concat(t6) as LeafTree<number>;
  //   const m1 = r1.middle as NonLeafBlock<any, any>;
  //   expect(r1.left).toBe(b3);
  //   expect(r1.right).toBe(b3);
  //   expect(m1.nrChildren).toBe(2);
  //   expect(m1.children[0]).toBe(b3);
  //   expect(m1.children[1]).toBe(b3);

  //   const r2 = r1.concat(r1) as LeafTree<number>;
  //   const m2 = r2.middle as NonLeafTree<any, any>;
  //   expect(m2.left.nrChildren).toBe(3);
  //   expect(m2.right.nrChildren).toBe(3);
  //   expect(m2.middle).toBeNull();
  // });

  // it('context', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);
  //   expect(t6.context).toBe(context);
  // });

  // it('drop', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.drop(0)).toBe(t6);
  //   expect(t6.drop(10)).toBe(context.empty());

  //   expect(t6.drop(3)).toBe(b3);
  //   expect(t6.drop(-3)).toBe(b3);

  //   const r1 = t6.drop(2);
  //   expect(r1).toBeInstanceOf(LeafBlock);
  //   expect(r1.toArray()).toEqual([3, 1, 2, 3]);

  //   const r2 = t6.drop(-2);
  //   expect(r2).toBeInstanceOf(LeafBlock);
  //   expect(r2.toArray()).toEqual([1, 2, 3, 1]);

  //   const r3 = t6.drop(1) as LeafTree<number>;
  //   expect(r3).toBeInstanceOf(LeafTree);
  //   expect(r3.left.toArray()).toEqual([2, 3]);
  //   expect(r3.right).toBe(b3);
  // });

  // it('extendType', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);
  //   expect(t6.extendType<number | string>()).toBe(t6);
  // });

  // it('filter', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.filter(() => true)).toBe(t6);
  //   expect(t6.filter(() => false)).toBe(context.empty());
  //   const r1 = t6.filter((_, i) => i >= 3);
  //   expect(r1).toBeInstanceOf(LeafBlock);
  //   expect(r1.toArray()).toEqual([1, 2, 3]);
  // });

  // it('first', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.first()).toBe(1);
  // });

  // it('flatMap', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.flatMap((v) => [v]).toArray()).toEqual(t6.toArray());
  //   expect(t6.flatMap(() => [])).toBe(context.empty());
  // });

  // it('forEach', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   const cb = jest.fn();
  //   t6.forEach(cb);
  //   expect(cb).toBeCalledTimes(6);
  //   expect(cb.mock.calls[1][0]).toBe(2);
  //   expect(cb.mock.calls[1][1]).toBe(1);

  //   cb.mockReset();

  //   t6.forEach((_, __, halt) => {
  //     halt();
  //     cb();
  //   });

  //   expect(cb).toBeCalledTimes(1);
  // });

  // it('get', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

  //   expect(t9.get(1)).toBe(2);
  //   expect(t9.get(1, 'a')).toBe(2);
  //   expect(t9.get(1, () => 'a')).toBe(2);
  //   expect(t9.get(4)).toBe(2);
  //   expect(t9.get(7)).toBe(2);
  //   expect(t9.get(-2)).toBe(2);
  //   expect(t9.get(50)).toBeUndefined();
  //   expect(t9.get(50, 'a')).toBe('a');
  //   expect(t9.get(50, () => 'a')).toBe('a');
  // });

  // it('insert', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

  //   expect(t9.insert(1, [])).toBe(t9);
  //   expect(t9.insert(1, [10, 11]).toArray()).toEqual([
  //     1, 10, 11, 2, 3, 1, 2, 3, 1, 2, 3,
  //   ]);

  //   expect(t9.insert(-1, [10, 11]).toArray()).toEqual([
  //     1, 2, 3, 1, 2, 3, 1, 2, 10, 11, 3,
  //   ]);
  // });

  // it('isEmpty', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);
  //   expect(t6.isEmpty).toBe(false);
  // });

  // it('first', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.last()).toBe(3);
  // });

  // it('length', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.length).toBe(6);
  //   const t9 = t6.concat(b3);
  //   expect(t9.length).toBe(9);
  // });

  // it('map', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

  //   expect(t9.toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
  //   expect(t9.map((v) => v + 1).toArray()).toEqual([2, 3, 4, 2, 3, 4, 2, 3, 4]);
  // });

  // it('nonEmpty', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.nonEmpty()).toBe(true);
  // });

  // it('padTo', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.padTo(1, 3)).toBe(t6);
  //   expect(t6.padTo(8, 9).toArray()).toEqual([1, 2, 3, 1, 2, 3, 9, 9]);

  //   expect(t6.padTo(8, 9, 50).toArray()).toEqual([9, 1, 2, 3, 1, 2, 3, 9]);
  // });

  // it('prepend', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);
  //   const r1 = t6.prepend(10);

  //   expect(r1.left).toBeInstanceOf(LeafBlock);
  //   expect(r1.left.toArray()).toEqual([10, 1, 2, 3]);
  //   expect(r1.middle).toBeNull();
  //   expect(r1.right).toBe(b3);

  //   const r2 = r1.prepend(11);
  //   expect(r2.left).toBeInstanceOf(LeafBlock);
  //   expect(r2.left.toArray()).toEqual([11, 10, 1, 2]);
  //   expect(r2.right).toBeInstanceOf(LeafBlock);
  //   expect(r2.right.toArray()).toEqual([3, 1, 2, 3]);
  //   expect(r2.middle).toBeNull();

  //   const r3 = r2.prepend(12);
  //   expect(r3.left).toBeInstanceOf(LeafBlock);
  //   expect(r3.left.toArray()).toEqual([12]);
  //   expect(r3.middle).toBeInstanceOf(NonLeafBlock);
  //   expect(r3.middle?.toArray()).toEqual([11, 10, 1, 2]);
  //   expect(r3.right).toBeInstanceOf(LeafBlock);
  //   expect(r3.right.toArray()).toEqual([3, 1, 2, 3]);
  // });

  // it('prependMiddle', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   const r1 = t6.prependMiddle(b3);
  //   expect(r1.toArray()).toEqual([1, 2, 3]);

  //   const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

  //   const r2 = t9.prependMiddle(b3);
  //   expect(r2.toArray()).toEqual([1, 2, 3, 1, 2, 3]);

  //   const t12 = context.leafTree(
  //     b3,
  //     b3,
  //     context.nonLeafBlock(12, [b3, b3, b3, b3], 1)
  //   );

  //   const r3 = t12.prependMiddle(b3);
  //   expect(r3).toBeInstanceOf(NonLeafTree);
  // });

  // it('remove', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

  //   expect(t9.remove(0, 10)).toBe(context.empty());
  //   expect(t9.remove(4, 0)).toBe(t9);
  //   expect(t9.remove(1, 2).toArray()).toEqual([1, 1, 2, 3, 1, 2, 3]);
  // });

  // it('repeat', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.repeat(0)).toBe(t6);
  //   expect(t6.repeat(1)).toBe(t6);
  //   expect(t6.repeat(2).toArray()).toEqual(t6.concat(t6).toArray());
  //   expect(t6.repeat(10).length).toBe(60);
  // });

  // it('reversed', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

  //   expect(t9.reversed().toArray()).toEqual([3, 2, 1, 3, 2, 1, 3, 2, 1]);
  //   expect(t9.reversed().reversed().toArray()).toEqual(t9.toArray());
  // });

  // it('rotate', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

  //   expect(t9.rotate(0)).toBe(t9);
  //   expect(t9.rotate(9)).toBe(t9);
  //   expect(t9.rotate(-9)).toBe(t9);
  //   expect(t9.rotate(1).toArray()).toEqual([3, 1, 2, 3, 1, 2, 3, 1, 2]);
  //   expect(t9.rotate(-2).toArray()).toEqual([3, 1, 2, 3, 1, 2, 3, 1, 2]);
  // });

  // it('slice', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

  //   expect(t9.slice({ amount: 10 }, false)).toBe(t9);
  //   expect(t9.slice({ amount: 10 }, true).toArray()).toEqual(
  //     t9.reversed().toArray()
  //   );
  //   expect(t9.slice({ amount: 3 }, false)).toBe(b3);
  //   const r1 = t9.slice({ start: 1, amount: 4 }, false);
  //   expect(r1).toBeInstanceOf(LeafBlock);
  //   expect(r1.toArray()).toEqual([2, 3, 1, 2]);

  //   const r2 = t9.slice({ start: 1, amount: 4 }, true);
  //   expect(r2).toBeInstanceOf(LeafBlock);
  //   expect(r2.toArray()).toEqual([2, 1, 3, 2]);
  // });

  // it('splice', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.splice({ index: 1, remove: 0 })).toBe(t6);
  //   expect(t6.splice({ index: 1, remove: 2 }).toArray()).toEqual([1, 1, 2, 3]);
  //   expect(t6.splice({ index: 1, insert: [10, 11] }).toArray()).toEqual([
  //     1, 10, 11, 2, 3, 1, 2, 3,
  //   ]);
  //   expect(
  //     t6.splice({ index: 1, remove: 2, insert: [10, 11] }).toArray()
  //   ).toEqual([1, 10, 11, 1, 2, 3]);
  // });

  // it('stream', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

  //   expect(t9.stream().toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
  //   expect(t9.stream(true).toArray()).toEqual([3, 2, 1, 3, 2, 1, 3, 2, 1]);
  // });

  // it('streamRange', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

  //   expect(t9.streamRange({ amount: 0 })).toBe(Stream.empty());
  //   expect(t9.streamRange({ amount: 4 }).toArray()).toEqual([1, 2, 3, 1]);
  //   expect(t9.streamRange({ amount: 4 }, true).toArray()).toEqual([1, 3, 2, 1]);

  //   expect(t9.streamRange({ start: 4, amount: 4 }).toArray()).toEqual([
  //     2, 3, 1, 2,
  //   ]);
  //   expect(t9.streamRange({ start: 4, amount: 4 }, true).toArray()).toEqual([
  //     2, 1, 3, 2,
  //   ]);
  // });

  // it('take', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.take(10)).toBe(t6);
  //   expect(t6.take(0)).toBe(context.empty());

  //   expect(t6.take(3)).toBe(b3);
  //   expect(t6.take(-3)).toBe(b3);

  //   const r1 = t6.take(4);
  //   expect(r1).toBeInstanceOf(LeafBlock);
  //   expect(r1.toArray()).toEqual([1, 2, 3, 1]);

  //   const r2 = t6.take(-2);
  //   expect(r2).toBeInstanceOf(LeafBlock);
  //   expect(r2.toArray()).toEqual([2, 3]);

  //   const r3 = t6.take(5) as LeafTree<number>;
  //   expect(r3).toBeInstanceOf(LeafTree);
  //   expect(r3.left).toBe(b3);
  //   expect(r3.right.toArray()).toEqual([1, 2]);
  // });

  // it('toArray()', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

  //   expect(t9.toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
  //   expect(t9.toArray({ amount: 4 })).toEqual([1, 2, 3, 1]);
  //   expect(t9.toArray({ start: 5, amount: 4 })).toEqual([3, 1, 2, 3]);

  //   expect(t9.toArray(undefined, true)).toEqual([3, 2, 1, 3, 2, 1, 3, 2, 1]);
  //   expect(t9.toArray({ amount: 4 }, true)).toEqual([1, 3, 2, 1]);
  //   expect(t9.toArray({ start: 5, amount: 4 }, true)).toEqual([3, 2, 1, 3]);
  // });

  // it('toBuilder', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

  //   expect(t9.toBuilder().build()).toBe(t9);

  //   const builder = t9.toBuilder();
  //   builder.append(4);
  //   expect(builder.build().toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3, 4]);
  //   expect(t9.toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
  // });

  // it('toJSON', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.toJSON()).toEqual({
  //     dataType: 'List',
  //     value: [1, 2, 3, 1, 2, 3],
  //   });
  // });

  // it('toString', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   expect(t6.toString()).toBe('List(1, 2, 3, 1, 2, 3)');
  // });

  // it('unzip', () => {
  //   const b3 = createBlock<[number, string]>([
  //     [1, 'a'],
  //     [2, 'b'],
  //     [3, 'c'],
  //   ]);
  //   const t6 = context.leafTree(b3, b3, null);

  //   const [l1, l2] = t6.unzip(2);

  //   expect(l1.toArray()).toEqual([1, 2, 3, 1, 2, 3]);
  //   expect(l2.toArray()).toEqual(['a', 'b', 'c', 'a', 'b', 'c']);
  // });

  // it('updateAt', () => {
  //   const b3 = createBlock([1, 2, 3]);
  //   const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

  //   expect(t9.updateAt(10, 1)).toBe(t9);
  //   expect(t9.updateAt(10, () => 10)).toBe(t9);

  //   expect(t9.updateAt(1, 10).toArray()).toEqual([1, 10, 3, 1, 2, 3, 1, 2, 3]);
  //   expect(t9.updateAt(1, (v) => v + 10).toArray()).toEqual([
  //     1, 12, 3, 1, 2, 3, 1, 2, 3,
  //   ]);
  //   expect(t9.updateAt(-3, 10).toArray()).toEqual([1, 2, 3, 1, 2, 3, 10, 2, 3]);
  //   expect(t9.updateAt(-3, (v) => v + 10).toArray()).toEqual([
  //     1, 2, 3, 1, 2, 3, 11, 2, 3,
  //   ]);
  // });
});
