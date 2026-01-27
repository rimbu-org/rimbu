import { describe, it, expect } from 'bun:test';
import { IndexRange } from '../src/index-range.mjs';

describe('IndexRange', () => {
  it('getIndexRangeIndices', () => {
    const i = IndexRange.getIndexRangeIndices;

    expect(i({ amount: 10 })).toEqual([0, 9]);
    expect(i({ start: 2 })).toEqual([2, undefined]);
    expect(i({ start: 2, amount: 10 })).toEqual([2, 11]);
    expect(i({ start: 2, end: 5 })).toEqual([2, 5]);
    expect(i({ start: 2, end: [5, true] })).toEqual([2, 5]);
    expect(i({ start: 2, end: [5, false] })).toEqual([2, 4]);
    expect(i({ start: [2, true] })).toEqual([2, undefined]);
    expect(i({ start: [2, false] })).toEqual([3, undefined]);
    expect(i({ start: [2, true], amount: 10 })).toEqual([2, 11]);
    expect(i({ start: [2, false], amount: 10 })).toEqual([3, 12]);
    expect(i({ start: [2, true], end: 10 })).toEqual([2, 10]);
    expect(i({ start: [2, false], end: 10 })).toEqual([3, 10]);
    expect(i({ start: [2, true], end: [10, true] })).toEqual([2, 10]);
    expect(i({ start: [2, true], end: [10, false] })).toEqual([2, 9]);
    expect(i({ start: [2, false], end: [10, true] })).toEqual([3, 10]);
    expect(i({ start: [2, false], end: [10, false] })).toEqual([3, 9]);
    expect(i({ end: 2 })).toEqual([0, 2]);
    expect(i({ end: [2, true] })).toEqual([0, 2]);
    expect(i({ end: [2, false] })).toEqual([0, 1]);
  });

  it('getIndicesFor', () => {
    const i = IndexRange.getIndicesFor;

    expect(i({ amount: 10 }, 0)).toBe('empty');
    expect(i({ amount: 0 }, 0)).toBe('empty');
    expect(i({ amount: 0 }, 10)).toBe('empty');
    expect(i({ amount: 5 }, 10)).toEqual([0, 4]);
    expect(i({ amount: 10 }, 4)).toEqual('all');
    expect(i({ amount: 2 }, 3)).toEqual([0, 1]);
    expect(i({ start: 2, amount: 10 }, 4)).toEqual([2, 3]);
    expect(i({ start: [2, false], amount: 10 }, 4)).toEqual([3, 3]);
    expect(i({ start: [3, false], amount: 10 }, 4)).toEqual('empty');
    expect(i({ end: 10 }, 4)).toEqual('all');
    expect(i({ end: 3 }, 4)).toEqual('all');
    expect(i({ end: 2 }, 4)).toEqual([0, 2]);
    expect(i({ start: 1, end: 10 }, 4)).toEqual([1, 3]);
    expect(i({ start: [1, false], end: [10, false] }, 4)).toEqual([2, 3]);
    expect(i({ start: [0, false], end: 10 }, 4)).toEqual([1, 3]);
    expect(i({ start: [1, true], end: 10 }, 4)).toEqual([1, 3]);
    expect(i({ start: 1, end: 10 }, 20)).toEqual([1, 10]);
    expect(i({ start: [0, false], end: 10 }, 20)).toEqual([1, 10]);
    expect(i({ start: [1, true], end: 10 }, 20)).toEqual([1, 10]);
    expect(i({ start: 1, end: [10, false] }, 20)).toEqual([1, 9]);
    expect(i({ start: [0, false], end: [10, false] }, 20)).toEqual([1, 9]);
    expect(i({ start: [1, true], end: [10, false] }, 20)).toEqual([1, 9]);
    expect(i({ end: [0, false] }, 20)).toEqual('empty');
    expect(i({ start: 10, end: 5 }, 20)).toEqual('empty');
    expect(i({ start: [10, false], end: [5, false] }, 20)).toEqual('empty');
  });

  it('correctly returns empty', () => {
    const i = IndexRange.getIndicesFor;

    expect(i({ start: 1, end: 0 }, 100)).toBe('empty');
    expect(i({ start: 0, end: 100 }, 0)).toBe('empty');
    expect(i({ start: 50, end: 100 }, 0)).toBe('empty');
    expect(i({ start: 1, end: 0 }, 100)).toBe('empty');
    expect(i({ start: -14, end: 0 }, 2)).toBe('empty');
    expect(i({ start: 100, end: 110 }, 10)).toBe('empty');
    expect(i({ start: 10, end: 12 }, 10)).toBe('empty');
    expect(i({ start: 10, amount: 0 }, 100)).toBe('empty');
  });

  it('correctly returns all', () => {
    const i = IndexRange.getIndicesFor;

    expect(i({ start: 0, end: 9 }, 10)).toBe('all');
    expect(i({ start: 0, end: 100 }, 10)).toBe('all');
    expect(i({ start: 0, amount: 100 }, 10)).toBe('all');
    expect(i({ start: 0, end: 1 }, 1)).toBe('all');
    expect(i({ start: 0, end: -1 }, 10)).toBe('all');
  });

  it('correctly returns range', () => {
    const i = IndexRange.getIndicesFor;

    expect(i({ start: 0, end: 2 }, 10)).toEqual([0, 2]);
    expect(i({ start: 0, amount: 2 }, 10)).toEqual([0, 1]);
    expect(i({ start: 2, end: 2 }, 10)).toEqual([2, 2]);
    expect(i({ start: 2, end: 10 }, 5)).toEqual([2, 4]);
    expect(i({ start: 2, amount: 10 }, 5)).toEqual([2, 4]);
  });

  it('correctly returns negative', () => {
    const i = IndexRange.getIndicesFor;

    expect(i({ start: -1 }, 10)).toEqual([9, 9]);
    expect(i({ start: -5, amount: 3 }, 10)).toEqual([5, 7]);
  });
});
