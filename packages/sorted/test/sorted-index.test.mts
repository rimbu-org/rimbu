import { SortedIndex } from '@rimbu/sorted/common';

describe('SortedIndex', () => {
  it('firstChild', () => {
    expect(SortedIndex.firstChild).toBe(-1);
  });

  it('prev', () => {
    expect(SortedIndex.prev(0)).toBe(-1);
    expect(SortedIndex.prev(2)).toBe(-3);
    expect(SortedIndex.prev(-3)).toBe(1);
    expect(SortedIndex.prev(SortedIndex.prev(2))).toBe(1);
  });

  it('next', () => {
    expect(SortedIndex.next(0)).toBe(-2);
    expect(SortedIndex.next(2)).toBe(-4);
    expect(SortedIndex.next(-3)).toBe(2);
    expect(SortedIndex.next(SortedIndex.next(2))).toBe(3);
  });

  it('compare', () => {
    expect(SortedIndex.compare(3, 3)).toBe(0);
    expect(SortedIndex.compare(2, 3) < 0).toBe(true);
    expect(SortedIndex.compare(3, 2) > 0).toBe(true);
    expect(SortedIndex.compare(0, SortedIndex.next(0)) < 0).toBe(true);
    expect(SortedIndex.compare(2, SortedIndex.next(2)) < 0).toBe(true);
    expect(SortedIndex.compare(0, SortedIndex.prev(0)) > 0).toBe(true);
    expect(SortedIndex.compare(2, SortedIndex.prev(2)) > 0).toBe(true);
  });
});
