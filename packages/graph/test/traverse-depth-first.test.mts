import type { ArrayNonEmpty } from '@rimbu/common';
import { ArrowGraphSorted, EdgeGraphSorted } from '@rimbu/graph';
import type { Link, ValuedLink } from '@rimbu/graph/custom';
import { ArrowValuedGraphSorted } from '@rimbu/graph';
import { EdgeValuedGraphSorted } from '@rimbu/graph';
import { Stream } from '@rimbu/stream';
import { Traverse } from '@rimbu/graph';

const { traverseDepthFirstSorted } = Traverse;

const arr6: ArrayNonEmpty<Link<string>> = [
  ['a', 'b'],
  ['b', 'c'],
  ['c', 'a'],
  ['b', 'd'],
  ['d', 'e'],
  ['f', 'g'],
];

const arrMulti: ArrayNonEmpty<Link<string>> = [
  ['a', 'a'],
  ['a', 'b'],
  ['c', 'b'],
  ['b', 'a'],
];

const valuedArr6: ArrayNonEmpty<ValuedLink<string, number>> = [
  ['a', 'b', 1],
  ['b', 'c', 2],
  ['c', 'a', 3],
  ['b', 'd', 4],
  ['d', 'e', 5],
  ['f', 'g', 6],
];

const valuedArrMulti: ArrayNonEmpty<ValuedLink<string, number>> = [
  ['a', 'a', 1],
  ['a', 'b', 2],
  ['c', 'b', 3],
  ['b', 'a', 4],
];

const arrowGraphEmpty = ArrowGraphSorted.empty<string>();
const arrowGraph6 = ArrowGraphSorted.from(arr6);
const arrowGraphMulti = ArrowGraphSorted.from(arrMulti);

const arrowValuedGraphEmpty = ArrowValuedGraphSorted.empty<string, number>();
const arrowValuedGraph6 = ArrowValuedGraphSorted.from(valuedArr6);
const arrowValuedGraphMulti = ArrowValuedGraphSorted.from(valuedArrMulti);

const edgeGraphEmpty = EdgeGraphSorted.empty<string>();
const edgeGraph6 = EdgeGraphSorted.from(arr6);
const edgeGraphMulti = EdgeGraphSorted.from(arrMulti);

const edgeValuedGraphEmpty = EdgeValuedGraphSorted.empty<string, number>();
const edgeValuedGraph6 = EdgeValuedGraphSorted.from(valuedArr6);
const edgeValuedGraphMulti = EdgeValuedGraphSorted.from(valuedArrMulti);

describe('traverseBreadthFirst ArrowGraphs', () => {
  it('empty', () => {
    expect(traverseDepthFirstSorted(arrowGraphEmpty, 'a')).toBe(Stream.empty());
    expect(traverseDepthFirstSorted(arrowValuedGraphEmpty, 'a')).toBe(
      Stream.empty()
    );
  });

  it('returns empty for non existing node', () => {
    expect(traverseDepthFirstSorted(arrowGraph6, 'z')).toBe(Stream.empty());
    expect(traverseDepthFirstSorted(arrowValuedGraph6, 'z')).toBe(
      Stream.empty()
    );
    expect(traverseDepthFirstSorted(arrowGraphMulti, 'z')).toBe(Stream.empty());
    expect(traverseDepthFirstSorted(arrowValuedGraphMulti, 'z')).toBe(
      Stream.empty()
    );
  });

  it('works for simple graphs', () => {
    expect(traverseDepthFirstSorted(arrowGraph6, 'a').toArray()).toEqual([
      ['a', 'b'],
      ['b', 'c'],
      ['b', 'd'],
      ['d', 'e'],
    ]);

    expect(traverseDepthFirstSorted(arrowGraph6, 'c').toArray()).toEqual([
      ['c', 'a'],
      ['a', 'b'],
      ['b', 'd'],
      ['d', 'e'],
    ]);

    expect(traverseDepthFirstSorted(arrowValuedGraph6, 'a').toArray()).toEqual([
      ['a', 'b', 1],
      ['b', 'c', 2],
      ['b', 'd', 4],
      ['d', 'e', 5],
    ]);

    expect(traverseDepthFirstSorted(arrowValuedGraph6, 'c').toArray()).toEqual([
      ['c', 'a', 3],
      ['a', 'b', 1],
      ['b', 'd', 4],
      ['d', 'e', 5],
    ]);
  });

  it('works for complex graphs', () => {
    expect(traverseDepthFirstSorted(arrowGraphMulti, 'a').toArray()).toEqual([
      ['a', 'b'],
    ]);
    expect(traverseDepthFirstSorted(arrowGraphMulti, 'b').toArray()).toEqual([
      ['b', 'a'],
    ]);
    expect(traverseDepthFirstSorted(arrowGraphMulti, 'c').toArray()).toEqual([
      ['c', 'b'],
      ['b', 'a'],
    ]);

    expect(
      traverseDepthFirstSorted(arrowValuedGraphMulti, 'a').toArray()
    ).toEqual([['a', 'b', 2]]);
    expect(
      traverseDepthFirstSorted(arrowValuedGraphMulti, 'b').toArray()
    ).toEqual([['b', 'a', 4]]);
    expect(
      traverseDepthFirstSorted(arrowValuedGraphMulti, 'c').toArray()
    ).toEqual([
      ['c', 'b', 3],
      ['b', 'a', 4],
    ]);
  });
});

describe('traverseBreadthFirst EdgeGraphs', () => {
  it('empty', () => {
    expect(traverseDepthFirstSorted(edgeGraphEmpty, 'a')).toBe(Stream.empty());
    expect(traverseDepthFirstSorted(edgeValuedGraphEmpty, 'a')).toBe(
      Stream.empty()
    );
  });

  it('returns empty for non existing node', () => {
    expect(traverseDepthFirstSorted(edgeGraph6, 'z')).toBe(Stream.empty());
    expect(traverseDepthFirstSorted(edgeValuedGraph6, 'z')).toBe(
      Stream.empty()
    );
    expect(traverseDepthFirstSorted(edgeGraphMulti, 'z')).toBe(Stream.empty());
    expect(traverseDepthFirstSorted(edgeValuedGraphMulti, 'z')).toBe(
      Stream.empty()
    );
  });

  it('works for simple graphs', () => {
    expect(traverseDepthFirstSorted(edgeGraph6, 'a').toArray()).toEqual([
      ['a', 'b'],
      ['b', 'c'],
      ['b', 'd'],
      ['d', 'e'],
    ]);

    expect(traverseDepthFirstSorted(edgeGraph6, 'c').toArray()).toEqual([
      ['c', 'a'],
      ['a', 'b'],
      ['b', 'd'],
      ['d', 'e'],
    ]);

    expect(traverseDepthFirstSorted(edgeValuedGraph6, 'a').toArray()).toEqual([
      ['a', 'b', 1],
      ['b', 'c', 2],
      ['b', 'd', 4],
      ['d', 'e', 5],
    ]);

    expect(traverseDepthFirstSorted(edgeValuedGraph6, 'c').toArray()).toEqual([
      ['c', 'a', 3],
      ['a', 'b', 1],
      ['b', 'd', 4],
      ['d', 'e', 5],
    ]);
  });

  it('works for complex graphs', () => {
    expect(traverseDepthFirstSorted(edgeGraphMulti, 'a').toArray()).toEqual([
      ['a', 'b'],
      ['b', 'c'],
    ]);

    expect(traverseDepthFirstSorted(edgeGraphMulti, 'b').toArray()).toEqual([
      ['b', 'a'],
      ['b', 'c'],
    ]);

    expect(traverseDepthFirstSorted(edgeGraphMulti, 'c').toArray()).toEqual([
      ['c', 'b'],
      ['b', 'a'],
    ]);

    expect(
      traverseDepthFirstSorted(edgeValuedGraphMulti, 'a').toArray()
    ).toEqual([
      ['a', 'b', 4],
      ['b', 'c', 3],
    ]);

    expect(
      traverseDepthFirstSorted(edgeValuedGraphMulti, 'b').toArray()
    ).toEqual([
      ['b', 'a', 4],
      ['b', 'c', 3],
    ]);

    expect(
      traverseDepthFirstSorted(edgeValuedGraphMulti, 'c').toArray()
    ).toEqual([
      ['c', 'b', 3],
      ['b', 'a', 4],
    ]);
  });
});
