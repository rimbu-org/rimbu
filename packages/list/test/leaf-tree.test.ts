import { Stream } from '@rimbu/stream';
import { List } from '@rimbu/list';
import {
  LeafBlock,
  LeafTree,
  ListContext,
  NonLeafBlock,
  NonLeafTree,
} from '@rimbu/list/custom';

function runLeafTreeTests(
  tag: string,
  context: ListContext,
  createBlock: <T>(values: T[]) => LeafBlock<T>
) {
  describe(tag, () => {
    it('_normalize up to NonLeafBlock', () => {
      {
        // merge to block
        const t = context.leafTree(
          createBlock([1, 2]),
          createBlock([11, 12]),
          null
        );
        const n = t._normalize();
        expect(n).toBeInstanceOf(LeafBlock);
        expect(n.toArray()).toEqual([1, 2, 11, 12]);
      }
      {
        // not possible to merge
        const t = context.leafTree(
          createBlock([1, 2, 3]),
          createBlock([3, 4]),
          null
        );
        const n = t._normalize();
        expect(n).toBe(t);
      }
      {
        // merge left middle and right into block
        const t = context.leafTree(
          createBlock([1]),
          createBlock([11]),
          context.nonLeafBlock(2, [createBlock([21, 22])], 1)
        );
        const n = t._normalize();
        expect(n).toBeInstanceOf(LeafBlock);
        expect(n.toArray()).toEqual([1, 21, 22, 11]);
      }
      {
        // merge middle with left
        const t = context.leafTree(
          createBlock([1]),
          createBlock([11, 12]),
          context.nonLeafBlock(3, [createBlock([21, 22, 23])], 1)
        );
        const n = t._normalize() as LeafTree<number>;
        expect(n.left.toArray()).toEqual([1, 21, 22, 23]);
        expect(n.middle).toBeNull();
        expect(n.right.toArray()).toEqual([11, 12]);
      }
      {
        // merge middle with right
        const t = context.leafTree(
          createBlock([1, 2, 3]),
          createBlock([11]),
          context.nonLeafBlock(3, [createBlock([21, 22, 23])], 1)
        );
        const n = t._normalize() as LeafTree<number>;
        expect(n.left.toArray()).toEqual([1, 2, 3]);
        expect(n.middle).toBeNull();
        expect(n.right.toArray()).toEqual([21, 22, 23, 11]);
      }
    });

    it('append', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);
      const r1 = t6.append(10);

      expect(r1.left).toBe(b3);
      expect(r1.right).toBeInstanceOf(LeafBlock);
      expect(r1.right.toArray()).toEqual([1, 2, 3, 10]);
      expect(r1.middle).toBeNull();

      const r2 = r1.append(11);
      expect(r2.left).toBeInstanceOf(LeafBlock);
      expect(r2.left.toArray()).toEqual([1, 2, 3, 1]);
      expect(r2.right).toBeInstanceOf(LeafBlock);
      expect(r2.right.toArray()).toEqual([2, 3, 10, 11]);
      expect(r2.middle).toBeNull();

      const r3 = r2.append(12);
      expect(r3.left).toBeInstanceOf(LeafBlock);
      expect(r3.left.toArray()).toEqual([1, 2, 3, 1]);
      expect(r3.right).toBeInstanceOf(LeafBlock);
      expect(r3.right.toArray()).toEqual([12]);
      expect(r3.middle).toBeInstanceOf(NonLeafBlock);
      expect(r3.middle?.toArray()).toEqual([2, 3, 10, 11]);
    });

    it('appendMiddle', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      const r1 = t6.appendMiddle(b3);
      expect(r1.toArray()).toEqual([1, 2, 3]);

      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      const r2 = t9.appendMiddle(b3);
      expect(r2.toArray()).toEqual([1, 2, 3, 1, 2, 3]);

      const t12 = context.leafTree(
        b3,
        b3,
        context.nonLeafBlock(12, [b3, b3, b3, b3], 1)
      );

      const r3 = t12.appendMiddle(b3);
      expect(r3).toBeInstanceOf(NonLeafTree);
    });

    it('asNormal', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);
      expect(t6.asNormal()).toBe(t6);
    });

    it('assumeNonEmpty', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);
      expect(t6.assumeNonEmpty()).toBe(t6);
    });

    it('collect', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.collect((v) => v).toArray()).toEqual([1, 2, 3, 1, 2, 3]);
      expect(t6.collect((_, __, skip) => skip)).toBe(context.empty());
      expect(
        t6
          .collect((v, __, ___, halt) => {
            halt();
            return v;
          })
          .toArray()
      ).toEqual([1]);
    });

    it('concat', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.concat(context.empty())).toBe(t6);

      const t7 = t6.concat(createBlock([10])) as LeafTree<number>;
      expect(t7.left).toBe(b3);
      expect(t7.middle).toBeNull();
      expect(t7.right.toArray()).toEqual([1, 2, 3, 10]);

      const t8 = t7.concat(b3) as LeafTree<number>;
      expect(t8.left).toBe(b3);
      expect(t8.middle?.toArray()).toEqual([1, 2, 3, 10]);
      expect(t8.right).toBe(b3);

      const t9 = t8.concat(t8) as LeafTree<number>;

      expect(t9.left).toBe(b3);
      expect(t9.right).toBe(b3);
      const m = t9.middle as NonLeafBlock<any, any>;
      expect(m.nrChildren).toBe(4);
      expect(m.children[1]).toBe(b3);
      expect(m.children[2]).toBe(b3);
    });

    it('concatBlock', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      const r1 = t6.concatBlock(createBlock([10])) as LeafTree<number>;
      expect(r1.middle).toBeNull();
      expect(r1.left).toBe(b3);
      expect(r1.right.toArray()).toEqual([1, 2, 3, 10]);

      const r2 = t6.concatBlock(createBlock([10, 11])) as LeafTree<number>;
      expect(r2.left).toBe(b3);
      expect(r2.right.toArray()).toEqual([10, 11]);
      const m2 = r2.middle as NonLeafBlock<any, any>;
      expect(m2.nrChildren).toBe(1);
      expect(m2.children[0]).toBe(b3);

      const tr = context.leafTree(
        createBlock([1, 2, 3, 4]),
        createBlock([5]),
        null
      );
      const r3 = tr.concatBlock(
        createBlock([10, 11, 12, 13])
      ) as LeafTree<number>;
      expect(r3.left.toArray()).toEqual([1, 2, 3, 4]);
      expect(r3.middle?.toArray()).toEqual([5, 10, 11, 12]);
      expect(r3.right.toArray()).toEqual([13]);
    });

    it('concatTree', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      const r1 = t6.concat(t6) as LeafTree<number>;
      const m1 = r1.middle as NonLeafBlock<any, any>;
      expect(r1.left).toBe(b3);
      expect(r1.right).toBe(b3);
      expect(m1.nrChildren).toBe(2);
      expect(m1.children[0]).toBe(b3);
      expect(m1.children[1]).toBe(b3);

      const r2 = r1.concat(r1) as LeafTree<number>;
      const m2 = r2.middle as NonLeafTree<any, any>;
      expect(m2.left.nrChildren).toBe(3);
      expect(m2.right.nrChildren).toBe(3);
      expect(m2.middle).toBeNull();
    });

    it('context', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);
      expect(t6.context).toBe(context);
    });

    it('copy', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);
      expect(t6.copy()).toBe(t6);
      const b2 = createBlock([1, 2]);
      const c = t6.copy(b2);
      expect(c.left).toBe(b2);
      expect(c.right).toBe(b3);
      expect(c.middle).toBeNull();
    });

    it('drop', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.drop(0)).toBe(t6);
      expect(t6.drop(10)).toBe(context.empty());

      expect(t6.drop(3)).toBe(b3);
      expect(t6.drop(-3)).toBe(b3);

      const r1 = t6.drop(2);
      expect(r1).toBeInstanceOf(LeafBlock);
      expect(r1.toArray()).toEqual([3, 1, 2, 3]);

      const r2 = t6.drop(-2);
      expect(r2).toBeInstanceOf(LeafBlock);
      expect(r2.toArray()).toEqual([1, 2, 3, 1]);

      const r3 = t6.drop(1) as LeafTree<number>;
      expect(r3).toBeInstanceOf(LeafTree);
      expect(r3.left.toArray()).toEqual([2, 3]);
      expect(r3.right).toBe(b3);
    });

    it('filter', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.filter(() => true)).toBe(t6);
      expect(t6.filter(() => false)).toBe(context.empty());
      const r1 = t6.filter((_, i) => i >= 3);
      expect(r1).toBeInstanceOf(LeafBlock);
      expect(r1.toArray()).toEqual([1, 2, 3]);
    });

    it('first', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.first()).toBe(1);
    });

    it('flatMap', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.flatMap((v) => [v]).toArray()).toEqual(t6.toArray());
      expect(t6.flatMap(() => [])).toBe(context.empty());
    });

    it('forEach', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      const cb = jest.fn();
      t6.forEach(cb);
      expect(cb).toBeCalledTimes(6);
      expect(cb.mock.calls[1][0]).toBe(2);
      expect(cb.mock.calls[1][1]).toBe(1);

      cb.mockReset();

      t6.forEach((_, __, halt) => {
        halt();
        cb();
      });

      expect(cb).toBeCalledTimes(1);
    });

    it('get', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      expect(t9.get(1)).toBe(2);
      expect(t9.get(1, 'a')).toBe(2);
      expect(t9.get(1, () => 'a')).toBe(2);
      expect(t9.get(4)).toBe(2);
      expect(t9.get(7)).toBe(2);
      expect(t9.get(-2)).toBe(2);
      expect(t9.get(50)).toBeUndefined();
      expect(t9.get(50, 'a')).toBe('a');
      expect(t9.get(50, () => 'a')).toBe('a');
    });

    it('insert', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      expect(t9.insert(1, [])).toBe(t9);
      expect(t9.insert(1, [10, 11]).toArray()).toEqual([
        1, 10, 11, 2, 3, 1, 2, 3, 1, 2, 3,
      ]);

      expect(t9.insert(-1, [10, 11]).toArray()).toEqual([
        1, 2, 3, 1, 2, 3, 1, 2, 10, 11, 3,
      ]);
    });

    it('isEmpty', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);
      expect(t6.isEmpty).toBe(false);
    });

    it('first', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.last()).toBe(3);
    });

    it('length', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.length).toBe(6);
      const t9 = t6.concat(b3);
      expect(t9.length).toBe(9);
    });

    it('map', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      expect(t9.toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
      expect(t9.map((v) => v + 1).toArray()).toEqual([
        2, 3, 4, 2, 3, 4, 2, 3, 4,
      ]);
      expect(t9.map((v) => v + 1, true).toArray()).toEqual([
        4, 3, 2, 4, 3, 2, 4, 3, 2,
      ]);
    });

    it('mapPure', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      expect(t9.toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
      const mapped = t9.mapPure((v) => v + 1);
      expect(mapped.toArray()).toEqual([2, 3, 4, 2, 3, 4, 2, 3, 4]);
      expect(mapped.left).toBe(mapped.right);

      const mappedRev = t9.mapPure((v) => v + 1, true);
      expect(mappedRev.toArray()).toEqual([4, 3, 2, 4, 3, 2, 4, 3, 2]);
      expect(mappedRev.left).toBe(mappedRev.right);
    });

    it('nonEmpty', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.nonEmpty()).toBe(true);
    });

    it('padTo', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.padTo(1, 3)).toBe(t6);
      expect(t6.padTo(8, 9).toArray()).toEqual([1, 2, 3, 1, 2, 3, 9, 9]);

      expect(t6.padTo(8, 9, 50).toArray()).toEqual([9, 1, 2, 3, 1, 2, 3, 9]);
    });

    it('prepend', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);
      const r1 = t6.prepend(10);

      expect(r1.left).toBeInstanceOf(LeafBlock);
      expect(r1.left.toArray()).toEqual([10, 1, 2, 3]);
      expect(r1.middle).toBeNull();
      expect(r1.right).toBe(b3);

      const r2 = r1.prepend(11);
      expect(r2.left).toBeInstanceOf(LeafBlock);
      expect(r2.left.toArray()).toEqual([11, 10, 1, 2]);
      expect(r2.right).toBeInstanceOf(LeafBlock);
      expect(r2.right.toArray()).toEqual([3, 1, 2, 3]);
      expect(r2.middle).toBeNull();

      const r3 = r2.prepend(12);
      expect(r3.left).toBeInstanceOf(LeafBlock);
      expect(r3.left.toArray()).toEqual([12]);
      expect(r3.middle).toBeInstanceOf(NonLeafBlock);
      expect(r3.middle?.toArray()).toEqual([11, 10, 1, 2]);
      expect(r3.right).toBeInstanceOf(LeafBlock);
      expect(r3.right.toArray()).toEqual([3, 1, 2, 3]);
    });

    it('prependMiddle', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      const r1 = t6.prependMiddle(b3);
      expect(r1.toArray()).toEqual([1, 2, 3]);

      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      const r2 = t9.prependMiddle(b3);
      expect(r2.toArray()).toEqual([1, 2, 3, 1, 2, 3]);

      const t12 = context.leafTree(
        b3,
        b3,
        context.nonLeafBlock(12, [b3, b3, b3, b3], 1)
      );

      const r3 = t12.prependMiddle(b3);
      expect(r3).toBeInstanceOf(NonLeafTree);
    });

    it('remove', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      expect(t9.remove(0, 10)).toBe(context.empty());
      expect(t9.remove(4, 0)).toBe(t9);
      expect(t9.remove(1, 2).toArray()).toEqual([1, 1, 2, 3, 1, 2, 3]);
    });

    it('repeat', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.repeat(0)).toBe(t6);
      expect(t6.repeat(1)).toBe(t6);
      expect(t6.repeat(2).toArray()).toEqual(t6.concat(t6).toArray());
      expect(t6.repeat(10).length).toBe(60);
    });

    it('reversed', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      expect(t9.reversed().toArray()).toEqual([3, 2, 1, 3, 2, 1, 3, 2, 1]);
      expect(t9.reversed().reversed().toArray()).toEqual(t9.toArray());
    });

    it('rotate', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      expect(t9.rotate(0)).toBe(t9);
      expect(t9.rotate(9)).toBe(t9);
      expect(t9.rotate(-9)).toBe(t9);
      expect(t9.rotate(1).toArray()).toEqual([3, 1, 2, 3, 1, 2, 3, 1, 2]);
      expect(t9.rotate(-2).toArray()).toEqual([3, 1, 2, 3, 1, 2, 3, 1, 2]);
    });

    it('slice', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      expect(t9.slice({ amount: 10 }, false)).toBe(t9);
      expect(t9.slice({ amount: 10 }, true).toArray()).toEqual(
        t9.reversed().toArray()
      );
      expect(t9.slice({ amount: 3 }, false)).toBe(b3);
      const r1 = t9.slice({ start: 1, amount: 4 }, false);
      expect(r1).toBeInstanceOf(LeafBlock);
      expect(r1.toArray()).toEqual([2, 3, 1, 2]);

      const r2 = t9.slice({ start: 1, amount: 4 }, true);
      expect(r2).toBeInstanceOf(LeafBlock);
      expect(r2.toArray()).toEqual([2, 1, 3, 2]);
    });

    it('splice', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.splice({ index: 1, remove: 0 })).toBe(t6);
      expect(t6.splice({ index: 1, remove: 2 }).toArray()).toEqual([
        1, 1, 2, 3,
      ]);
      expect(t6.splice({ index: 1, insert: [10, 11] }).toArray()).toEqual([
        1, 10, 11, 2, 3, 1, 2, 3,
      ]);
      expect(
        t6.splice({ index: 1, remove: 2, insert: [10, 11] }).toArray()
      ).toEqual([1, 10, 11, 1, 2, 3]);
    });

    it('stream', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      expect(t9.stream().toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
      expect(t9.stream(true).toArray()).toEqual([3, 2, 1, 3, 2, 1, 3, 2, 1]);
    });

    it('streamRange', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      expect(t9.streamRange({ amount: 0 })).toBe(Stream.empty());
      expect(t9.streamRange({ amount: 4 }).toArray()).toEqual([1, 2, 3, 1]);
      expect(t9.streamRange({ amount: 4 }, true).toArray()).toEqual([
        1, 3, 2, 1,
      ]);

      expect(t9.streamRange({ start: 4, amount: 4 }).toArray()).toEqual([
        2, 3, 1, 2,
      ]);
      expect(t9.streamRange({ start: 4, amount: 4 }, true).toArray()).toEqual([
        2, 1, 3, 2,
      ]);
    });

    it('structure', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      const leafType = context.isReversedLeafBlock(b3) ? 'RLeaf' : 'Leaf';

      expect(t9.structure()).toEqual(
        `\
<LeafTree len:9
 l:<${leafType} 3>
 m: 
  <NLBlock(1) len:3 c:1 <${leafType} 3>>
 r:<${leafType} 3>
>`
      );
    });

    it('take', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.take(10)).toBe(t6);
      expect(t6.take(0)).toBe(context.empty());

      expect(t6.take(3)).toBe(b3);
      expect(t6.take(-3)).toBe(b3);

      const r1 = t6.take(4);
      expect(r1).toBeInstanceOf(LeafBlock);
      expect(r1.toArray()).toEqual([1, 2, 3, 1]);

      const r2 = t6.take(-2);
      expect(r2).toBeInstanceOf(LeafBlock);
      expect(r2.toArray()).toEqual([2, 3]);

      const r3 = t6.take(5) as LeafTree<number>;
      expect(r3).toBeInstanceOf(LeafTree);
      expect(r3.left).toBe(b3);
      expect(r3.right.toArray()).toEqual([1, 2]);
    });

    it('toArray()', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      expect(t9.toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
      expect(t9.toArray({ amount: 4 })).toEqual([1, 2, 3, 1]);
      expect(t9.toArray({ start: 5, amount: 4 })).toEqual([3, 1, 2, 3]);

      expect(t9.toArray(undefined, true)).toEqual([3, 2, 1, 3, 2, 1, 3, 2, 1]);
      expect(t9.toArray({ amount: 4 }, true)).toEqual([1, 3, 2, 1]);
      expect(t9.toArray({ start: 5, amount: 4 }, true)).toEqual([3, 2, 1, 3]);
    });

    it('toBuilder', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      expect(t9.toBuilder().build()).toBe(t9);

      const builder = t9.toBuilder();
      builder.append(4);
      expect(builder.build().toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3, 4]);
      expect(t9.toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
    });

    it('toJSON', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.toJSON()).toEqual({
        dataType: 'List',
        value: [1, 2, 3, 1, 2, 3],
      });
    });

    it('toString', () => {
      const b3 = createBlock([1, 2, 3]);
      const t6 = context.leafTree(b3, b3, null);

      expect(t6.toString()).toBe('List(1, 2, 3, 1, 2, 3)');
    });

    it('unzip', () => {
      const b3 = createBlock<[number, string]>([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ]);
      const t6 = context.leafTree(b3, b3, null);

      const [l1, l2] = List.unzip(t6, 2);

      expect(l1.toArray()).toEqual([1, 2, 3, 1, 2, 3]);
      expect(l2.toArray()).toEqual(['a', 'b', 'c', 'a', 'b', 'c']);
    });

    it('updateAt', () => {
      const b3 = createBlock([1, 2, 3]);
      const t9 = context.leafTree(b3, b3, context.nonLeafBlock(3, [b3], 1));

      expect(t9.updateAt(10, 1)).toBe(t9);
      expect(t9.updateAt(10, () => 10)).toBe(t9);

      expect(t9.updateAt(1, 10).toArray()).toEqual([
        1, 10, 3, 1, 2, 3, 1, 2, 3,
      ]);
      expect(t9.updateAt(1, (v) => v + 10).toArray()).toEqual([
        1, 12, 3, 1, 2, 3, 1, 2, 3,
      ]);
      expect(t9.updateAt(-3, 10).toArray()).toEqual([
        1, 2, 3, 1, 2, 3, 10, 2, 3,
      ]);
      expect(t9.updateAt(-3, (v) => v + 10).toArray()).toEqual([
        1, 2, 3, 1, 2, 3, 11, 2, 3,
      ]);
    });
  });
}

const context2 = new ListContext(2);

runLeafTreeTests('leaftree', context2, (values) => context2.leafBlock(values));
runLeafTreeTests('leaftree with rev blocks', context2, (values) =>
  context2.reversedLeaf(values.reverse())
);

function leafTreeBlockSize3(
  tag: string,
  context: ListContext,
  createBlock: <T>(values: T[]) => LeafBlock<T>
) {
  describe(tag, () => {
    it('concatTree no middle', () => {
      const t1 = context.leafTree(
        createBlock([1, 2, 3, 4, 5, 6, 7, 8]),
        createBlock([9]),
        null
      );
      const t2 = context.leafTree(
        createBlock([10]),
        createBlock([11, 12, 13, 14, 15, 16, 17, 18]),
        null
      );

      const r = t1.concatTree(t2);

      expect(r.left.toArray()).toEqual([1, 2]);
      expect(r.middle?.toArray()).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
      expect(r.right.toArray()).toEqual([11, 12, 13, 14, 15, 16, 17, 18]);
    });

    it('concatTree with middle, joint not in max', () => {
      const m1 = context.nonLeafBlock<number, LeafBlock<number>>(
        8,
        [createBlock([11, 12, 13, 14, 15, 16, 17, 18])],
        1
      );

      const t1 = context.leafTree(
        createBlock([1, 2, 3, 4, 5, 6, 7, 8]),
        createBlock([21]),
        m1
      );
      const t2 = context.leafTree(
        createBlock([31]),
        createBlock([41, 42, 43, 44, 45, 46, 47, 48]),
        null
      );

      const r = t1.concatTree(t2);

      expect(r.left.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(r.middle?.toArray()).toEqual([
        11, 12, 13, 14, 15, 16, 17, 18, 21, 31,
      ]);
      expect(r.right.toArray()).toEqual([41, 42, 43, 44, 45, 46, 47, 48]);
      const mt = r.middle as NonLeafBlock<number, LeafBlock<number>>;
      expect(mt.nrChildren).toBe(2);
      expect(mt.children[0].toArray()).toEqual([11, 12, 13, 14, 15]);
      expect(context.isLeafBlock(mt.children[0])).toBe(true);
      expect(mt.children[1].toArray()).toEqual([16, 17, 18, 21, 31]);
      expect(context.isLeafBlock(mt.children[1])).toBe(true);
    });
  });

  it('concatTree with middle, joint children in max', () => {
    const m1 = context.nonLeafBlock<number, LeafBlock<number>>(
      8,
      [createBlock([11, 12, 13, 14, 15])],
      1
    );

    const t1 = context.leafTree(
      createBlock([1, 2, 3, 4, 5, 6, 7, 8]),
      createBlock([21]),
      m1
    );
    const t2 = context.leafTree(
      createBlock([31]),
      createBlock([41, 42, 43, 44, 45, 46, 47, 48]),
      null
    );

    const r = t1.concatTree(t2);

    expect(r.left.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(r.middle?.toArray()).toEqual([11, 12, 13, 14, 15, 21, 31]);
    expect(r.right.toArray()).toEqual([41, 42, 43, 44, 45, 46, 47, 48]);
    const mt = r.middle as NonLeafBlock<number, LeafBlock<number>>;
    expect(mt.nrChildren).toBe(1);
    expect(mt.children[0].toArray()).toEqual([11, 12, 13, 14, 15, 21, 31]);
    expect(context.isLeafBlock(mt.children[0])).toBe(true);
  });

  it('concatTree no middle, jointLength > min < max', () => {
    const t1 = context.leafTree(
      createBlock([1, 2, 3, 4, 5, 6, 7, 8]),
      createBlock([11, 12, 13]),
      null
    );
    const t2 = context.leafTree(
      createBlock([21, 22, 23]),
      createBlock([31, 32, 33, 34, 35, 36, 37, 38]),
      null
    );

    const r = t1.concatTree(t2);

    expect(r.left.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(r.middle?.toArray()).toEqual([11, 12, 13, 21, 22, 23]);
    expect(r.right.toArray()).toEqual([31, 32, 33, 34, 35, 36, 37, 38]);
    const mt = r.middle as NonLeafBlock<number, LeafBlock<number>>;
    expect(mt.nrChildren).toBe(1);
    expect(context.isLeafBlock(mt.children[0])).toBe(true);
  });

  it('concatTree joinLength > max, right >= min && other.left >= min', () => {
    const t1 = context.leafTree(
      createBlock([1, 2, 3, 4, 5, 6, 7, 8]),
      createBlock([11, 12, 13]),
      null
    );
    const t2 = context.leafTree(
      createBlock([21, 22, 23, 24, 25, 26]),
      createBlock([31, 32, 33, 34, 35, 36, 37, 38]),
      null
    );

    const r = t1.concatTree(t2);

    expect(r.left.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(r.middle?.toArray()).toEqual([11, 12, 13, 21, 22, 23, 24, 25, 26]);
    expect(r.right.toArray()).toEqual([31, 32, 33, 34, 35, 36, 37, 38]);
    const mt = r.middle as NonLeafBlock<number, LeafBlock<number>>;
    expect(mt.nrChildren).toBe(2);
    expect(context.isLeafBlock(mt.children[0])).toBe(true);
    expect(context.isLeafBlock(mt.children[1])).toBe(true);
    expect(mt.children[0].children.length).toBe(4);
    expect(mt.children[1].children.length).toBe(5);
  });
}

const context3 = new ListContext(3);

leafTreeBlockSize3('leafTree blockSize 3', context3, (values) =>
  context3.leafBlock(values)
);
leafTreeBlockSize3('rev leafTree blockSize 3', context3, (values) =>
  context3.reversedLeaf(values.reverse())
);
