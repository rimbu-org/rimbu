import { Comp } from '@rimbu/common';
import {
  SortedSetContext,
  SortedSetEmpty,
  SortedSetInner,
  SortedSetLeaf,
} from '@rimbu/sorted/set-custom';

const context = new SortedSetContext({
  blockSizeBits: 2,
  comp: Comp.defaultComp(),
});

describe('SortedSetLeaf', () => {
  it('addInternal', () => {
    const leaf = context.leaf([1, 3, 5]);
    {
      const res = leaf.addInternal(3);
      expect(res).toBe(leaf);
    }
    {
      const res = leaf.addInternal(4);
      expect(res.entries).toEqual([1, 3, 4, 5]);
    }
    {
      const res = leaf.addInternal(8);
      expect(res.entries).toEqual([1, 3, 5, 8]);
    }
  });
  it('deleteMin', () => {
    const leaf = context.leaf([1, 3, 5]);
    const res = leaf.deleteMin();
    expect(res[0]).toEqual(1);
    expect(res[1].entries).toEqual([3, 5]);
  });
  it('deleteMax', () => {
    const leaf = context.leaf([1, 3, 5]);
    const res = leaf.deleteMax();
    expect(res[0]).toEqual(5);
    expect(res[1].entries).toEqual([1, 3]);
  });
  it('dropInternal', () => {
    const leaf = context.leaf([1, 3, 5]);
    const res = leaf.dropInternal(2);
    expect(res.entries).toEqual([5]);
  });
  it('getInsertIndexOf', () => {
    const leaf = context.leaf([1, 3, 5]);
    expect(leaf.getInsertIndexOf(0)).toEqual(-1);
    expect(leaf.getInsertIndexOf(1)).toEqual(0);
    expect(leaf.getInsertIndexOf(2)).toEqual(-2);
    expect(leaf.getInsertIndexOf(3)).toEqual(1);
    expect(leaf.getInsertIndexOf(4)).toEqual(-3);
    expect(leaf.getInsertIndexOf(5)).toEqual(2);
    expect(leaf.getInsertIndexOf(6)).toEqual(-4);
  });
  it('mutateGetFromLeft', () => {
    const leaf = context.leaf([11, 13, 15]);
    const leftLeaf = context.leaf([1, 3, 5]);
    const [newUp, newLeft] = leaf.mutateGetFromLeft(leftLeaf, 8);
    expect(newUp).toBe(5);
    expect(leaf.entries).toEqual([8, 11, 13, 15]);
    expect(newLeft.entries).toEqual([1, 3]);
    expect(leftLeaf.entries).toEqual([1, 3, 5]);
  });
  it('mutateGetFromRight', () => {
    const leaf = context.leaf([1, 3, 5]);
    const rightLeaf = context.leaf([11, 13, 15]);
    const [newUp, newRight] = leaf.mutateGetFromRight(rightLeaf, 8);
    expect(newUp).toBe(11);
    expect(leaf.entries).toEqual([1, 3, 5, 8]);
    expect(newRight.entries).toEqual([13, 15]);
    expect(rightLeaf.entries).toEqual([11, 13, 15]);
  });
  it('mutateGiveToLeft', () => {
    const leaf = context.leaf([11, 13, 15]);
    const leftLeaf = context.leaf([1, 3, 5]);
    const [newUp, newLeft] = leaf.mutateGiveToLeft(leftLeaf, 8);
    expect(newUp).toBe(11);
    expect(leaf.entries).toEqual([13, 15]);
    expect(newLeft.entries).toEqual([1, 3, 5, 8]);
    expect(leftLeaf.entries).toEqual([1, 3, 5]);
  });
  it('mutateGiveToRight', () => {
    const leaf = context.leaf([1, 3, 5]);
    const rightLeaf = context.leaf([11, 13, 15]);
    const [newUp, newRight] = leaf.mutateGiveToRight(rightLeaf, 8);
    expect(newUp).toBe(5);
    expect(leaf.entries).toEqual([1, 3]);
    expect(newRight.entries).toEqual([8, 11, 13, 15]);
    expect(rightLeaf.entries).toEqual([11, 13, 15]);
  });
  it('mutateJoinLeft', () => {
    const leaf = context.leaf([11, 13, 15]);
    const leftLeaf = context.leaf([1, 3, 5]);
    leaf.mutateJoinLeft(leftLeaf, 8);
    expect(leaf.entries).toEqual([1, 3, 5, 8, 11, 13, 15]);
    expect(leftLeaf.entries).toEqual([1, 3, 5]);
  });
  it('mutateJoinRight', () => {
    const leaf = context.leaf([1, 3, 5]);
    const rightLeaf = context.leaf([11, 13, 15]);
    leaf.mutateJoinRight(rightLeaf, 8);
    expect(leaf.entries).toEqual([1, 3, 5, 8, 11, 13, 15]);
    expect(rightLeaf.entries).toEqual([11, 13, 15]);
  });
  it('mutateSplitRight', () => {
    const leaf = context.leaf([1, 3, 5, 8, 11]);
    const [up, newRight] = leaf.mutateSplitRight();
    expect(leaf.entries).toEqual([1, 3]);
    expect(up).toBe(5);
    expect(newRight.entries).toEqual([8, 11]);
  });
  it('normalize', () => {
    {
      const leaf = context.leaf([]);
      const newLeaf = leaf.normalize();
      expect(newLeaf).toBeInstanceOf(SortedSetEmpty);
      expect(leaf.entries).toEqual([]);
    }
    {
      const leaf = context.leaf([1, 3, 5, 8]);
      const newLeaf = leaf.normalize();
      expect(newLeaf).toBeInstanceOf(SortedSetLeaf);
      expect(leaf.entries).toEqual([1, 3, 5, 8]);
    }
    {
      const leaf = context.leaf([1, 3, 5, 8, 11]);
      const newLeaf = leaf.normalize() as SortedSetInner<number>;
      expect(newLeaf).toBeInstanceOf(SortedSetInner);
      expect(leaf.entries).toEqual([1, 3]);
    }
  });
  it('removeInternal', () => {
    const leaf = context.leaf([1, 3, 5, 8]);
    expect(leaf.removeInternal(0)).toBe(leaf);
    expect(leaf.removeInternal(6)).toBe(leaf);
    expect(leaf.removeInternal(13)).toBe(leaf);
    expect(leaf.removeInternal(1).entries).toEqual([3, 5, 8]);
    expect(leaf.removeInternal(3).entries).toEqual([1, 5, 8]);
    expect(leaf.removeInternal(5).entries).toEqual([1, 3, 8]);
    expect(leaf.removeInternal(8).entries).toEqual([1, 3, 5]);
    expect(context.leaf([1]).removeInternal(1).entries).toEqual([]);
  });
  it('takeInternal', () => {
    const leaf = context.leaf([1, 3, 5, 8]);
    expect(leaf.takeInternal(2).entries).toEqual([1, 3]);
  });
});
