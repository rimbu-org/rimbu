import type { ArrayNonEmpty } from '@rimbu/common';
import { ArrowGraphSorted, EdgeGraphSorted, Traverse } from '@rimbu/graph';
import { ArrowValuedGraphSorted } from '@rimbu/graph';
import { EdgeValuedGraphSorted } from '@rimbu/graph';
import type { Link, ValuedLink } from '@rimbu/graph/custom';
import { Stream } from '@rimbu/stream';

const { traverseBreadthFirstSorted } = Traverse;

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
    expect(traverseBreadthFirstSorted(arrowGraphEmpty, 'a')).toBe(
      Stream.empty()
    );
    expect(traverseBreadthFirstSorted(arrowValuedGraphEmpty, 'a')).toBe(
      Stream.empty()
    );
  });

  it('returns empty for non existing node', () => {
    expect(traverseBreadthFirstSorted(arrowGraph6, 'z')).toBe(Stream.empty());
    expect(traverseBreadthFirstSorted(arrowValuedGraph6, 'z')).toBe(
      Stream.empty()
    );
    expect(traverseBreadthFirstSorted(arrowGraphMulti, 'z')).toBe(
      Stream.empty()
    );
    expect(traverseBreadthFirstSorted(arrowValuedGraphMulti, 'z')).toBe(
      Stream.empty()
    );
  });

  it('works for simple graphs', () => {
    expect(traverseBreadthFirstSorted(arrowGraph6, 'a').toArray()).toEqual([
      ['a', 'b'],
      ['b', 'c'],
      ['b', 'd'],
      ['d', 'e'],
    ]);

    expect(traverseBreadthFirstSorted(arrowGraph6, 'c').toArray()).toEqual([
      ['c', 'a'],
      ['a', 'b'],
      ['b', 'd'],
      ['d', 'e'],
    ]);

    expect(
      traverseBreadthFirstSorted(arrowValuedGraph6, 'a').toArray()
    ).toEqual([
      ['a', 'b', 1],
      ['b', 'c', 2],
      ['b', 'd', 4],
      ['d', 'e', 5],
    ]);

    expect(
      traverseBreadthFirstSorted(arrowValuedGraph6, 'c').toArray()
    ).toEqual([
      ['c', 'a', 3],
      ['a', 'b', 1],
      ['b', 'd', 4],
      ['d', 'e', 5],
    ]);
  });

  it('works for complex graphs', () => {
    expect(traverseBreadthFirstSorted(arrowGraphMulti, 'a').toArray()).toEqual([
      ['a', 'b'],
    ]);
    expect(traverseBreadthFirstSorted(arrowGraphMulti, 'b').toArray()).toEqual([
      ['b', 'a'],
    ]);
    expect(traverseBreadthFirstSorted(arrowGraphMulti, 'c').toArray()).toEqual([
      ['c', 'b'],
      ['b', 'a'],
    ]);

    expect(
      traverseBreadthFirstSorted(arrowValuedGraphMulti, 'a').toArray()
    ).toEqual([['a', 'b', 2]]);
    expect(
      traverseBreadthFirstSorted(arrowValuedGraphMulti, 'b').toArray()
    ).toEqual([['b', 'a', 4]]);
    expect(
      traverseBreadthFirstSorted(arrowValuedGraphMulti, 'c').toArray()
    ).toEqual([
      ['c', 'b', 3],
      ['b', 'a', 4],
    ]);
  });
});

describe('traverseBreadthFirst EdgeGraphs', () => {
  it('empty', () => {
    expect(traverseBreadthFirstSorted(edgeGraphEmpty, 'a')).toBe(
      Stream.empty()
    );
    expect(traverseBreadthFirstSorted(edgeValuedGraphEmpty, 'a')).toBe(
      Stream.empty()
    );
  });

  it('returns empty for non existing node', () => {
    expect(traverseBreadthFirstSorted(edgeGraph6, 'z')).toBe(Stream.empty());
    expect(traverseBreadthFirstSorted(edgeValuedGraph6, 'z')).toBe(
      Stream.empty()
    );
    expect(traverseBreadthFirstSorted(edgeGraphMulti, 'z')).toBe(
      Stream.empty()
    );
    expect(traverseBreadthFirstSorted(edgeValuedGraphMulti, 'z')).toBe(
      Stream.empty()
    );
  });

  it('works for simple graphs', () => {
    expect(traverseBreadthFirstSorted(edgeGraph6, 'a').toArray()).toEqual([
      ['a', 'b'],
      ['a', 'c'],
      ['b', 'd'],
      ['d', 'e'],
    ]);

    expect(traverseBreadthFirstSorted(edgeGraph6, 'c').toArray()).toEqual([
      ['c', 'a'],
      ['c', 'b'],
      ['b', 'd'],
      ['d', 'e'],
    ]);

    expect(traverseBreadthFirstSorted(edgeValuedGraph6, 'a').toArray()).toEqual(
      [
        ['a', 'b', 1],
        ['a', 'c', 3],
        ['b', 'd', 4],
        ['d', 'e', 5],
      ]
    );

    expect(traverseBreadthFirstSorted(edgeValuedGraph6, 'c').toArray()).toEqual(
      [
        ['c', 'a', 3],
        ['c', 'b', 2],
        ['b', 'd', 4],
        ['d', 'e', 5],
      ]
    );
  });

  it('works for complex graphs', () => {
    expect(traverseBreadthFirstSorted(edgeGraphMulti, 'a').toArray()).toEqual([
      ['a', 'b'],
      ['b', 'c'],
    ]);

    expect(traverseBreadthFirstSorted(edgeGraphMulti, 'b').toArray()).toEqual([
      ['b', 'a'],
      ['b', 'c'],
    ]);

    expect(traverseBreadthFirstSorted(edgeGraphMulti, 'c').toArray()).toEqual([
      ['c', 'b'],
      ['b', 'a'],
    ]);

    expect(
      traverseBreadthFirstSorted(edgeValuedGraphMulti, 'a').toArray()
    ).toEqual([
      ['a', 'b', 4],
      ['b', 'c', 3],
    ]);

    expect(
      traverseBreadthFirstSorted(edgeValuedGraphMulti, 'b').toArray()
    ).toEqual([
      ['b', 'a', 4],
      ['b', 'c', 3],
    ]);

    expect(
      traverseBreadthFirstSorted(edgeValuedGraphMulti, 'c').toArray()
    ).toEqual([
      ['c', 'b', 3],
      ['b', 'a', 4],
    ]);
  });
});
