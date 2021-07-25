import { SortedCustom } from '../src';
import type { LeafMutateSource } from '../src/base';

const {
  leafDeleteMin,
  leafDeleteMax,
  leafMutateGetFromLeft,
  leafMutateGetFromRight,
  leafMutateGiveToLeft,
  leafMutateGiveToRight,
  leafMutateJoinLeft,
  leafMutateJoinRight,
  leafMutateSplitRight,
  SortedEmpty,
} = SortedCustom;

function createSource<T>(values: T[]): LeafMutateSource<any, T> {
  return {
    entries: values,
    mutateEntries: values,
    copy(newEntries) {
      return createSource(newEntries as any);
    },
  };
}

describe('base leaf operations', () => {
  it('leafDeleteMin', () => {
    const s = createSource([1, 3, 5]);
    const res = leafDeleteMin(s);
    expect(res[0]).toBe(1);
    expect(res[1].entries).toEqual([3, 5]);
    expect(s.entries).toEqual([1, 3, 5]);
  });

  it('leafDeleteMax', () => {
    const s = createSource([1, 3, 5]);
    const res = leafDeleteMax(s);
    expect(res[0]).toBe(5);
    expect(res[1].entries).toEqual([1, 3]);
    expect(s.entries).toEqual([1, 3, 5]);
  });

  it('leafMutateGetFromLeft', () => {
    const left = createSource([1, 3, 5]);
    const s = createSource([11, 13, 15]);
    const res = leafMutateGetFromLeft(s, left, 8);
    expect(res[0]).toBe(5);
    expect(res[1].entries).toEqual([1, 3]);
    expect(s.entries).toEqual([8, 11, 13, 15]);
    expect(left.entries).toEqual([1, 3, 5]);
  });

  it('leafMutateGetFromRight', () => {
    const s = createSource([1, 3, 5]);
    const right = createSource([11, 13, 15]);
    const res = leafMutateGetFromRight(s, right, 8);
    expect(res[0]).toBe(11);
    expect(res[1].entries).toEqual([13, 15]);
    expect(s.entries).toEqual([1, 3, 5, 8]);
    expect(right.entries).toEqual([11, 13, 15]);
  });

  it('leafMutateGiveToLeft', () => {
    const left = createSource([1, 3, 5]);
    const s = createSource([11, 13, 15]);
    const res = leafMutateGiveToLeft(s, left, 8);
    expect(res[0]).toBe(11);
    expect(res[1].entries).toEqual([1, 3, 5, 8]);
    expect(s.entries).toEqual([13, 15]);
    expect(left.entries).toEqual([1, 3, 5]);
  });

  it('leafMutateGiveToRight', () => {
    const s = createSource([1, 3, 5]);
    const right = createSource([11, 13, 15]);
    const res = leafMutateGiveToRight(s, right, 8);
    expect(res[0]).toBe(5);
    expect(res[1].entries).toEqual([8, 11, 13, 15]);
    expect(s.entries).toEqual([1, 3]);
    expect(right.entries).toEqual([11, 13, 15]);
  });

  it('leafMutateJoinLeft', () => {
    const left = createSource([1, 3, 5]);
    const s = createSource([11, 13, 15]);
    leafMutateJoinLeft(s, left, 8);
    expect(s.entries).toEqual([1, 3, 5, 8, 11, 13, 15]);
    expect(left.entries).toEqual([1, 3, 5]);
  });

  it('leafMutateJoinRight', () => {
    const s = createSource([1, 3, 5]);
    const right = createSource([11, 13, 15]);
    leafMutateJoinRight(s, right, 8);
    expect(s.entries).toEqual([1, 3, 5, 8, 11, 13, 15]);
    expect(right.entries).toEqual([11, 13, 15]);
  });

  it('leafMutateSplitRight', () => {
    const s = createSource([1, 3, 5, 11, 13]);
    const [up, right] = leafMutateSplitRight(s);
    expect(up).toBe(5);
    expect(s.entries).toEqual([1, 3]);
    expect(right.entries).toEqual([11, 13]);
  });
});

describe('SortedEmpty', () => {
  it('returns defaults', () => {
    const empty = new SortedEmpty();
    expect(empty.min(1)).toBe(1);
    expect(empty.max(1)).toBe(1);
    expect(empty.getAtIndex(10, 1)).toBe(1);
    expect(empty.take()).toBe(empty);
    expect(empty.drop()).toBe(empty);
    expect(empty.sliceIndex()).toBe(empty);
  });
});
