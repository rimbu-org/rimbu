import { TraverseState } from '@rimbu/common';

import { Arr } from '../src/index.mjs';

const empty: number[] = [];

const nonEmpty = [1, 2, 3];

describe('Arr', () => {
  afterEach(() => {
    expect(empty).toEqual([]);
    expect(nonEmpty).toEqual([1, 2, 3]);
  });

  it('append', () => {
    expect(Arr.append(empty, 0)).toEqual([0]);
    expect(Arr.append(nonEmpty, 0)).toEqual([1, 2, 3, 0]);
  });

  it('concat', () => {
    expect(Arr.concat(empty, empty)).toBe(empty);
    expect(Arr.concat(empty, nonEmpty)).toBe(nonEmpty);
    expect(Arr.concat(nonEmpty, empty)).toBe(nonEmpty);
    expect(Arr.concat(nonEmpty, nonEmpty)).toEqual([1, 2, 3, 1, 2, 3]);
  });

  it('forEach', () => {
    let result: number[] = [];
    function add(value: number, index: number) {
      result.push(value + index);
    }

    Arr.forEach(empty, add);
    expect(result).toEqual([]);

    result = [];
    Arr.forEach(empty, add);
    expect(result).toEqual([]);

    result = [];
    Arr.forEach(nonEmpty, add);
    expect(result).toEqual([1, 3, 5]);

    result = [];
    Arr.forEach(nonEmpty, add, TraverseState(1), false);
    expect(result).toEqual([2, 4, 6]);

    result = [];
    Arr.forEach(nonEmpty, add, TraverseState(), true);
    expect(result).toEqual([3, 3, 3]);

    result = [];
    Arr.forEach(nonEmpty, add, TraverseState(1), true);
    expect(result).toEqual([4, 4, 4]);

    result = [];
    const state = TraverseState(1);
    state.halt();
    Arr.forEach(nonEmpty, add, state, true);
    expect(result).toEqual([]);
  });

  it('init', () => {
    expect(Arr.init(empty)).toEqual([]);
    expect(Arr.init(nonEmpty)).toEqual([1, 2]);
  });

  it('insert', () => {
    expect(Arr.insert(empty, 0, 0)).toEqual([0]);
    expect(Arr.insert(empty, 100, 0)).toEqual([0]);

    for (let i = -5; i <= 15; i++) {
      const res = nonEmpty.slice();
      res.splice(i, 0, 0);
      expect(Arr.insert(nonEmpty, i, 0)).toEqual(res);
    }
  });

  it('last', () => {
    expect(Arr.last(empty)).toEqual(undefined);
    expect(Arr.last(nonEmpty)).toEqual(3);
  });

  it('map', () => {
    expect(Arr.map(empty, (v, i) => v + i)).toEqual([]);
    expect(Arr.map(nonEmpty, (v, i) => v + i)).toEqual([1, 3, 5]);
    expect(Arr.map(nonEmpty, (v, i) => v + i, 1)).toEqual([2, 4, 6]);
  });

  it('mod', () => {
    expect(Arr.mod(empty, 0, (v) => v + 1)).toEqual([]);
    expect(Arr.mod(nonEmpty, 0, (v) => v + 1)).toEqual([2, 2, 3]);
    expect(Arr.mod(nonEmpty, 2, (v) => v + 1)).toEqual([1, 2, 4]);
    expect(Arr.mod(nonEmpty, -1, (v) => v + 1)).toBe(nonEmpty);
    expect(Arr.mod(nonEmpty, 5, (v) => v + 1)).toBe(nonEmpty);
    expect(Arr.mod(nonEmpty, 1, (v) => v)).toBe(nonEmpty);
  });

  it('prepend', () => {
    expect(Arr.prepend(empty, 0)).toEqual([0]);
    expect(Arr.prepend(nonEmpty, 0)).toEqual([0, 1, 2, 3]);
  });

  it('reverse', () => {
    expect(Arr.reverse(empty)).toEqual([]);
    expect(Arr.reverse(nonEmpty)).toEqual([3, 2, 1]);
    expect(Arr.reverse(Arr.reverse(nonEmpty))).toEqual(nonEmpty);
    expect(Arr.reverse(nonEmpty, 0, 1)).toEqual([2, 1]);
    expect(Arr.reverse(nonEmpty, 1, 1)).toEqual([2]);
    expect(Arr.reverse(nonEmpty, 1, 2)).toEqual([3, 2]);
    expect(Arr.reverse(nonEmpty, 0, 2)).toEqual([3, 2, 1]);
  });

  it('reverseMap', () => {
    expect(Arr.reverseMap(empty, (v, i) => v + i)).toEqual([]);
    expect(Arr.reverseMap(nonEmpty, (v, i) => v + i)).toEqual([3, 3, 3]);
    expect(Arr.reverseMap(nonEmpty, (v, i) => v + i, 1)).toEqual([4, 4, 4]);
  });

  it('splice', () => {
    expect(Arr.splice(empty, 0, 0)).toEqual(empty);
    expect(Arr.splice(empty, 1, 1)).toEqual(empty);
    expect(Arr.splice(empty, 1, 1, 1, 2, 3)).toEqual([1, 2, 3]);
    expect(Arr.splice(nonEmpty, 0, 0)).toEqual(nonEmpty);
    expect(Arr.splice(nonEmpty, 0, 1)).toEqual([2, 3]);
    expect(Arr.splice(nonEmpty, 1, 2)).toEqual([1]);
    expect(Arr.splice(nonEmpty, 1, 2, 10, 11)).toEqual([1, 10, 11]);
  });

  it('tail', () => {
    expect(Arr.tail(empty)).toEqual(empty);
    expect(Arr.tail(nonEmpty)).toEqual([2, 3]);
  });

  it('update', () => {
    expect(Arr.update(empty, 0, 100)).toEqual([]);
    expect(Arr.update(nonEmpty, 0, 100)).toEqual([100, 2, 3]);
    expect(Arr.update(nonEmpty, 1, 100)).toEqual([1, 100, 3]);
    expect(Arr.update(nonEmpty, -100, -100)).toBe(nonEmpty);
    expect(Arr.update(nonEmpty, 100, -100)).toBe(nonEmpty);
    expect(Arr.update(nonEmpty, 1, 2)).toBe(nonEmpty);
  });

  it('copySparse', () => {
    const sparseArray = [];
    sparseArray[100] = 0;
    sparseArray[200] = 1;

    const copiedSparseArray = Arr.copySparse(sparseArray);

    expect(copiedSparseArray.length).toBe(sparseArray.length);
    expect(copiedSparseArray[0]).toBe(sparseArray[0]);
    expect(copiedSparseArray[100]).toBe(sparseArray[100]);
    expect(copiedSparseArray[200]).toBe(sparseArray[200]);
    expect(50 in copiedSparseArray).toBe(false);
    expect(100 in copiedSparseArray).toBe(true);
  });

  it('mapSparse', () => {
    const sparseArray = [];
    sparseArray[100] = 0;
    sparseArray[200] = 1;

    const mappedSparseArray = Arr.mapSparse(sparseArray, (v) => v * 2);

    expect(mappedSparseArray.length).toBe(sparseArray.length);
    expect(mappedSparseArray[0]).toBe(sparseArray[0]);
    expect(mappedSparseArray[100]).toBe(sparseArray[100] * 2);
    expect(mappedSparseArray[200]).toBe(sparseArray[200] * 2);
    expect(50 in mappedSparseArray).toBe(false);
    expect(100 in mappedSparseArray).toBe(true);
  });
});
