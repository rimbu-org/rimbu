import { Comp } from '@rimbu/common';
import { SortedSetCustom } from '../src';
import {
  innerDropInternal,
  innerGetAtIndex,
  innerGetSubIndex,
  innerStreamSliceIndex,
  innerTakeInternal,
} from '../src/base';
import { SortedSetInner } from '../src/sortedset-custom';

const { SortedSetContext } = SortedSetCustom;

const context = new SortedSetContext<number>(2, Comp.defaultComp());

function createInner(base = 0) {
  return context.inner(
    [base + 10, base + 20],
    [
      context.leaf([base + 2, base + 5, base + 8]),
      context.leaf([base + 12, base + 15, base + 18]),
      context.leaf([base + 22, base + 25, base + 28]),
    ],
    11
  );
}

describe('SortedSetInner', () => {
  it('addInternal', () => {
    const inner = createInner();
    expect(inner.addInternal(5)).toBe(inner);
    expect(inner.addInternal(10)).toBe(inner);
    expect(inner.addInternal(12)).toBe(inner);
    expect(inner.addInternal(15)).toBe(inner);
    expect(inner.addInternal(20)).toBe(inner);
    expect(inner.addInternal(25)).toBe(inner);
    {
      const res = inner.addInternal(0);
      expect(res.entries).toEqual([10, 20]);
      expect(res.children[0].entries).toEqual([0, 2, 5, 8]);
    }
    {
      const res = inner.addInternal(9);
      expect(res.entries).toEqual([10, 20]);
      expect(res.children[0].entries).toEqual([2, 5, 8, 9]);
    }
    {
      const res = inner.addInternal(11);
      expect(res.entries).toEqual([10, 20]);
      expect(res.children[1].entries).toEqual([11, 12, 15, 18]);
    }
    {
      const res = inner.addInternal(30);
      expect(res.entries).toEqual([10, 20]);
      expect(res.children[2].entries).toEqual([22, 25, 28, 30]);
    }
  });
  it('deleteMax', () => {
    const inner = createInner();
    const [up, newInner] = inner.deleteMax();
    expect(up).toBe(28);
    expect(newInner.children[2].entries).toEqual([22, 25]);
    expect(newInner.size).toBe(10);
  });
  it('deleteMin', () => {
    const inner = createInner();
    const [up, newInner] = inner.deleteMin();
    expect(up).toBe(2);
    expect(newInner.children[0].entries).toEqual([5, 8]);
    expect(newInner.size).toBe(10);
  });
  it('dropInternal', () => {
    const inner = createInner();
    {
      const res = inner.dropInternal(1) as SortedSetInner<number>;
      expect(res.children[0].entries).toEqual([5, 8]);
      expect(res.size).toBe(10);
    }
    {
      const res = inner.dropInternal(4) as SortedSetInner<number>;
      expect(res.entries).toEqual([20]);
      expect(res.children[0]).toEqual(inner.children[1]);
      expect(res.children[1]).toEqual(inner.children[2]);
      expect(res.children.length).toBe(2);
      expect(res.size).toBe(7);
    }
  });
  it('getInsertIndexOf', () => {
    const inner = createInner();
    expect(inner.getInsertIndexOf(0)).toBe(-1);
    expect(inner.getInsertIndexOf(2)).toBe(0);
    expect(inner.getInsertIndexOf(3)).toBe(-2);
    expect(inner.getInsertIndexOf(10)).toBe(3);
    expect(inner.getInsertIndexOf(11)).toBe(-5);
    expect(inner.getInsertIndexOf(12)).toBe(4);
    expect(inner.getInsertIndexOf(13)).toBe(-6);
    expect(inner.getInsertIndexOf(19)).toBe(-8);
    expect(inner.getInsertIndexOf(20)).toBe(7);
    expect(inner.getInsertIndexOf(21)).toBe(-9);
    expect(inner.getInsertIndexOf(22)).toBe(8);
    expect(inner.getInsertIndexOf(23)).toBe(-10);
    expect(inner.getInsertIndexOf(29)).toBe(-12);
  });
  it('mutateGetFromLeft', () => {
    const inner = createInner(100);
    const left = createInner(0);
    const [up, newLeft] = inner.mutateGetFromLeft(left, 100);
    expect(up).toBe(20);
    expect(inner.children.length).toBe(4);
    expect(inner.children[0]).toEqual(left.children[2]);
    expect(inner.entries).toEqual([100, 110, 120]);
    expect(inner.size).toBe(15);
    expect(newLeft.entries).toEqual([10]);
    expect(newLeft.children[0]).toEqual(left.children[0]);
    expect(newLeft.children[1]).toEqual(left.children[1]);
    expect(newLeft.children.length).toBe(2);
    expect(newLeft.size).toBe(7);
    expect(left).toEqual(createInner());
  });
  it('mutateGetFromRight', () => {
    const inner = createInner(0);
    const right = createInner(100);
    const [up, newRight] = inner.mutateGetFromRight(right, 100);
    expect(up).toBe(110);
    expect(inner.children.length).toBe(4);
    expect(inner.children[3]).toEqual(right.children[0]);
    expect(inner.entries).toEqual([10, 20, 100]);
    expect(inner.size).toBe(15);
    expect(newRight.entries).toEqual([120]);
    expect(newRight.children[0]).toEqual(right.children[1]);
    expect(newRight.children[1]).toEqual(right.children[2]);
    expect(newRight.children.length).toBe(2);
    expect(newRight.size).toBe(7);
    expect(right).toEqual(createInner(100));
  });
  it('mutateGiveToLeft', () => {
    const inner = createInner(100);
    const innerCopy = createInner(100);
    const left = createInner(0);
    const [up, newLeft] = inner.mutateGiveToLeft(left, 100);
    expect(up).toBe(110);
    expect(inner.children.length).toBe(2);
    expect(inner.entries).toEqual([120]);
    expect(inner.size).toBe(7);
    expect(newLeft.entries).toEqual([10, 20, 100]);
    expect(newLeft.children[0]).toEqual(left.children[0]);
    expect(newLeft.children[1]).toEqual(left.children[1]);
    expect(newLeft.children[2]).toEqual(left.children[2]);
    expect(newLeft.children[3]).toEqual(innerCopy.children[0]);
    expect(newLeft.children.length).toBe(4);
    expect(newLeft.size).toBe(15);
    expect(left).toEqual(createInner());
  });
  it('mutateGiveToRight', () => {
    const inner = createInner(0);
    const innerCopy = createInner(0);
    const right = createInner(100);
    const [up, newRight] = inner.mutateGiveToRight(right, 100);
    expect(up).toBe(20);
    expect(inner.children.length).toBe(2);
    expect(inner.children[0]).toEqual(innerCopy.children[0]);
    expect(inner.children[1]).toEqual(innerCopy.children[1]);
    expect(inner.entries).toEqual([10]);
    expect(inner.size).toBe(7);
    expect(newRight.entries).toEqual([100, 110, 120]);
    expect(newRight.children[0]).toEqual(innerCopy.children[2]);
    expect(newRight.children[1]).toEqual(right.children[0]);
    expect(newRight.children[2]).toEqual(right.children[1]);
    expect(newRight.children.length).toBe(4);
    expect(newRight.size).toBe(15);
    expect(right).toEqual(createInner(100));
  });
  it('mutateJoinLeft', () => {
    const inner = createInner(100);
    const innerCopy = createInner(100);
    const left = createInner(0);
    inner.mutateJoinLeft(left, 100);
    expect(inner.children.length).toBe(6);
    expect(inner.entries).toEqual([10, 20, 100, 110, 120]);
    expect(inner.children).toEqual(left.children.concat(innerCopy.children));
    expect(inner.size).toBe(23);
    expect(left).toEqual(createInner(0));
  });
  it('mutateJoinRight', () => {
    const inner = createInner(0);
    const innerCopy = createInner(0);
    const right = createInner(100);
    inner.mutateJoinRight(right, 100);
    expect(inner.children.length).toBe(6);
    expect(inner.entries).toEqual([10, 20, 100, 110, 120]);
    expect(inner.children).toEqual(innerCopy.children.concat(right.children));
    expect(inner.size).toBe(23);
    expect(right).toEqual(createInner(100));
  });
  it('mutateSplitRight', () => {
    const inner = createInner(0);
    inner.mutateJoinRight(createInner(100), 100);
    const innerCopy = createInner(0);
    innerCopy.mutateJoinRight(createInner(100), 100);

    const [up, newRight] = inner.mutateSplitRight();
    expect(up).toBe(20);
    expect(inner.children.length).toBe(2);
    expect(inner.children[0]).toEqual(innerCopy.children[0]);
    expect(inner.children[1]).toEqual(innerCopy.children[1]);
    expect(inner.entries).toEqual([10]);
    expect(inner.size).toBe(7);
    expect(newRight.size).toBe(15);
    expect(newRight.entries).toEqual([100, 110, 120]);
    expect(newRight.children[0]).toEqual(innerCopy.children[2]);
    expect(newRight.children[1]).toEqual(innerCopy.children[3]);
    expect(newRight.children[2]).toEqual(innerCopy.children[4]);
    expect(newRight.children[3]).toEqual(innerCopy.children[5]);
  });
  it('normalize', () => {
    {
      const inner = createInner(0);
      const res = inner.normalize();
      expect(res).toBe(inner);
    }
    {
      const inner = createInner(0);
      inner.mutateJoinRight(createInner(100), 100);
      const res = inner.normalize() as SortedSetInner<number>;
      expect(res).toBeInstanceOf(SortedSetInner);
      expect(res.entries).toEqual([20]);
      expect(res.children.length).toBe(2);
      expect(res.size).toBe(23);
      expect(res.children[0].entries).toEqual([10]);
      expect(res.children[0].size).toEqual(7);
      expect(res.children[1].entries).toEqual([100, 110, 120]);
      expect(res.children[1].size).toEqual(15);
    }
  });
  it('normalizeDownsizeChild', () => {
    {
      // shift left
      const inner = createInner(0);
      const res = inner.normalizeDownsizeChild(
        1,
        context.leaf([12, 13, 15, 18, 19]),
        13
      );
      expect(res.size).toBe(13);
      expect(res.entries).toEqual([12, 20]);
      expect(res.children.length).toBe(3);
      expect(res.children[0].entries).toEqual([2, 5, 8, 10]);
      expect(res.children[1].entries).toEqual([13, 15, 18, 19]);
      expect(res.children[2].entries).toEqual([22, 25, 28]);
    }
    {
      // shift right
      const inner = createInner(0);
      const res = inner.normalizeDownsizeChild(
        0,
        context.leaf([2, 3, 5, 8, 9]),
        13
      );
      expect(res.size).toBe(13);
      expect(res.entries).toEqual([9, 20]);
      expect(res.children.length).toBe(3);
      expect(res.children[0].entries).toEqual([2, 3, 5, 8]);
      expect(res.children[1].entries).toEqual([10, 12, 15, 18]);
      expect(res.children[2].entries).toEqual([22, 25, 28]);
    }
    {
      // split
      const inner = context.inner(
        [10, 20],
        [
          context.leaf([1, 2, 3, 4]),
          context.leaf([11, 12, 13, 14]),
          context.leaf([21, 22, 23, 24]),
        ],
        16
      );
      const res = inner.normalizeDownsizeChild(
        1,
        context.leaf([11, 12, 13, 14, 15]),
        17
      );
      expect(res.size).toBe(17);
      expect(res.entries).toEqual([10, 13, 20]);
      expect(res.children.length).toBe(4);
      expect(res.children[0].entries).toEqual([1, 2, 3, 4]);
      expect(res.children[1].entries).toEqual([11, 12]);
      expect(res.children[2].entries).toEqual([14, 15]);
      expect(res.children[3].entries).toEqual([21, 22, 23, 24]);
    }
  });
  it('normalizeIncreaseChild', () => {
    {
      // only update
      const inner = createInner(0);
      const res = inner.normalizeIncreaseChild(1, context.leaf([12, 15]), 10);
      expect(res.size).toBe(10);
      expect(res.entries).toEqual([10, 20]);
      expect(res.children.length).toBe(3);
      expect(res.children[0].entries).toEqual([2, 5, 8]);
      expect(res.children[1].entries).toEqual([12, 15]);
      expect(res.children[2].entries).toEqual([22, 25, 28]);
    }
    {
      // get from left
      const inner = createInner(0);
      const res = inner.normalizeIncreaseChild(1, context.leaf([12]), 9);
      expect(res.size).toBe(9);
      expect(res.entries).toEqual([8, 20]);
      expect(res.children.length).toBe(3);
      expect(res.children[0].entries).toEqual([2, 5]);
      expect(res.children[1].entries).toEqual([10, 12]);
      expect(res.children[2].entries).toEqual([22, 25, 28]);
    }
    {
      // get from right
      const inner = createInner(0);
      const res = inner.normalizeIncreaseChild(0, context.leaf([2]), 9);
      expect(res.size).toBe(9);
      expect(res.entries).toEqual([12, 20]);
      expect(res.children.length).toBe(3);
      expect(res.children[0].entries).toEqual([2, 10]);
      expect(res.children[1].entries).toEqual([15, 18]);
      expect(res.children[2].entries).toEqual([22, 25, 28]);
    }
    {
      // join left
      const inner = context.inner(
        [10, 20],
        [context.leaf([1, 2]), context.leaf([11, 12]), context.leaf([21, 22])],
        8
      );
      const res = inner.normalizeIncreaseChild(1, context.leaf([11]), 7);
      expect(res.size).toBe(7);
      expect(res.entries).toEqual([20]);
      expect(res.children.length).toBe(2);
      expect(res.children[0].entries).toEqual([1, 2, 10, 11]);
      expect(res.children[1].entries).toEqual([21, 22]);
    }
    {
      // join right
      const inner = context.inner(
        [10, 20],
        [context.leaf([1, 2]), context.leaf([11, 12]), context.leaf([21, 22])],
        8
      );
      const res = inner.normalizeIncreaseChild(0, context.leaf([1]), 7);
      expect(res.size).toBe(7);
      expect(res.entries).toEqual([20]);
      expect(res.children.length).toBe(2);
      expect(res.children[0].entries).toEqual([1, 10, 11, 12]);
      expect(res.children[1].entries).toEqual([21, 22]);
    }
  });
});

describe('inner index', () => {
  it('innerGetSubIndex', () => {
    const inner = createInner();
    expect(innerGetSubIndex(inner, 0)).toEqual([0, 0]);
    expect(innerGetSubIndex(inner, 2)).toEqual([0, 2]);
    expect(innerGetSubIndex(inner, 3)).toEqual(0);
    expect(innerGetSubIndex(inner, 4)).toEqual([1, 0]);
    expect(innerGetSubIndex(inner, 6)).toEqual([1, 2]);
    expect(innerGetSubIndex(inner, 7)).toEqual(1);
    expect(innerGetSubIndex(inner, 8)).toEqual([2, 0]);
    expect(innerGetSubIndex(inner, 10)).toEqual([2, 2]);
  });
  it('innerGetAtIndex', () => {
    const inner = createInner();
    expect(innerGetAtIndex(inner, 0)).toBe(2);
    expect(innerGetAtIndex(inner, 2)).toBe(8);
    expect(innerGetAtIndex(inner, 3)).toBe(10);
    expect(innerGetAtIndex(inner, 4)).toBe(12);
    expect(innerGetAtIndex(inner, 6)).toBe(18);
    expect(innerGetAtIndex(inner, 7)).toBe(20);
    expect(innerGetAtIndex(inner, 8)).toBe(22);
    expect(innerGetAtIndex(inner, 10)).toBe(28);

    expect(innerGetAtIndex(inner, -1)).toBe(28);
    expect(innerGetAtIndex(inner, 15)).toBe(undefined);
    expect(innerGetAtIndex(inner, 15, 1)).toBe(1);
    expect(innerGetAtIndex(inner, -15)).toBe(undefined);
    expect(innerGetAtIndex(inner, -15, 1)).toBe(1);
  });

  it('innerTakeInternal normalizes last child', () => {
    const inner = createInner();
    const res = innerTakeInternal(inner, 9);
    expect(res.size).toBe(9);
    expect(res.entries).toEqual([10, 18]);
    expect(res.children.length).toBe(3);
    expect(res.children[0].entries).toEqual([2, 5, 8]);
    expect(res.children[1].entries).toEqual([12, 15]);
    expect(res.children[2].entries).toEqual([20, 22]);
  });

  it('innerTakeInernal normalizes when last is entry', () => {
    const inner = createInner();
    const res = innerTakeInternal(inner, 8);
    expect(res.size).toBe(8);
    expect(res.entries).toEqual([10]);
    expect(res.children.length).toBe(2);
    expect(res.children[0].entries).toEqual([2, 5, 8]);
    expect(res.children[1].entries).toEqual([12, 15, 18, 20]);
  });

  it('innerDropInternal normalizes first child', () => {
    const inner = createInner();
    const res = innerDropInternal(inner, 2);
    expect(res.size).toBe(9);
    expect(res.entries).toEqual([12, 20]);
    expect(res.children.length).toBe(3);
    expect(res.children[0].entries).toEqual([8, 10]);
    expect(res.children[1].entries).toEqual([15, 18]);
    expect(res.children[2].entries).toEqual([22, 25, 28]);
  });
  it('innerDropInternal normalizes when first is entry', () => {
    const inner = createInner();
    const res = innerDropInternal(inner, 3);
    expect(res.size).toBe(8);
    expect(res.entries).toEqual([20]);
    expect(res.children.length).toBe(2);
    expect(res.children[0].entries).toEqual([10, 12, 15, 18]);
    expect(res.children[1].entries).toEqual([22, 25, 28]);
  });
  it('innerStreamSliceIndex', () => {
    const inner = createInner();
    {
      const stream = innerStreamSliceIndex(
        inner,
        { start: 1, amount: 9 },
        false
      );
      expect(stream.toArray()).toEqual([5, 8, 10, 12, 15, 18, 20, 22, 25]);
    }
    {
      const stream = innerStreamSliceIndex(
        inner,
        { start: 1, amount: 9 },
        true
      );
      expect(stream.toArray()).toEqual([25, 22, 20, 18, 15, 12, 10, 8, 5]);
    }
  });
});
