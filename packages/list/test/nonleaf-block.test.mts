import { TraverseState } from '@rimbu/common';
import { Stream } from '@rimbu/stream';

import {
  LeafBlock,
  ListContext,
  NonLeafBlock,
  NonLeafBlockBuilder,
  NonLeafTree,
} from '../src/custom/index.mjs';

import './setupTests';

const context = new ListContext(2);

describe('NonLeafBlock', () => {
  it('_mutateRebalance', () => {
    const b2 = context.leafBlock([1, 2]);

    const nl = context.nonLeafBlock<number, LeafBlock<number>>(4, [b2, b2], 1);
    nl._mutateRebalance();
    expect(nl.nrChildren).toBe(1);
    expect(nl.length).toBe(4);
    expect(nl.children[0].toArray()).toEqual([1, 2, 1, 2]);
  });

  it('append', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    const b4 = context.leafBlock([4, 5, 6]);

    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(3, [b3], 1);
      const r = nl.append(b4) as NonLeafBlock<any, any>;
      expect(r.children).toBeArrayOf([b3, b4]);
      expect(r.length).toBe(6);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [b3, b3, b3, b3],
        1
      );
      const r = nl.append(b4) as NonLeafTree<any, any>;
      expect(r.left).toBeInstanceOf(NonLeafBlock);
      expect(r.left.level).toBe(1);
      expect(r.right).toBeInstanceOf(NonLeafBlock);
      expect(r.right.level).toBe(1);
      expect(r.right.children[0]).toBe(b4);
      expect(r.middle).toBeNull();
      expect(r.length).toBe(15);
    }
  });

  it('appendInternal', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    const b4 = context.leafBlock([4, 5, 6]);

    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(3, [b3], 1);
      const r = nl.appendInternal(b4);
      expect(r.children).toBeArrayOf([b3, b4]);
      expect(r.length).toBe(6);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [b3, b3, b3, b3],
        1
      );
      const r = nl.appendInternal(b4);
      expect(r.children).toBeArrayOf([b3, b3, b3, b3, b4]);
      expect(r.length).toBe(15);
    }
  });

  it('canAddChild', () => {
    const b3 = context.leafBlock([1, 2, 3]);

    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(3, [b3], 1);
      expect(nl.canAddChild).toBe(true);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [b3, b3, b3, b3],
        1
      );
      expect(nl.canAddChild).toBe(false);
    }
  });

  it('childrenInMax', () => {
    const b3 = context.leafBlock([1, 2, 3]);

    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(3, [b3], 1);
      expect(nl.childrenInMax).toBe(true);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [b3, b3, b3, b3, b3],
        1
      );
      expect(nl.childrenInMax).toBe(false);
    }
  });

  it('childrenInMin', () => {
    const b3 = context.leafBlock([1, 2, 3]);

    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        6,
        [b3, b3],
        1
      );
      expect(nl.childrenInMin).toBe(true);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(3, [b3], 1);
      expect(nl.childrenInMin).toBe(false);
    }
  });

  it('concat', () => {
    const b3 = context.leafBlock([1, 2, 3]);

    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        6,
        [b3, b3],
        1
      );
      const r = nl.concat(nl) as NonLeafBlock<any, any>;
      expect(r).toBeInstanceOf(NonLeafBlock);
      expect(r.level).toBe(1);
      expect(r.children).toBeArrayOf([b3, b3, b3, b3]);
      expect(r.length).toBe(12);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3, b3, b3],
        1
      );
      const r = nl.concat(nl) as NonLeafTree<any, any>;
      expect(r).toBeInstanceOf(NonLeafTree);
      expect(r.left).toBeInstanceOf(NonLeafBlock);
      expect(r.left.level).toBe(1);
      expect(r.left.children).toBeArrayOf([b3, b3, b3]);
      expect(r.middle).toBeNull();
      expect(r.right).toBeInstanceOf(NonLeafBlock);
      expect(r.right.level).toBe(1);
      expect(r.right.children).toBeArrayOf([b3, b3, b3]);
      expect(r.length).toBe(18);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3, b3, b3],
        1
      );
      const nlt = context.nonLeafTree(nl, nl, null, 1);

      const r = nl.concat(nlt);
      expect(r.length).toBe(27);
    }
  });

  it('concatBlock', () => {
    const b3 = context.leafBlock([1, 2, 3]);

    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        6,
        [b3, b3],
        1
      );
      const r = nl.concatBlock(nl) as NonLeafBlock<any, any>;
      expect(r).toBeInstanceOf(NonLeafBlock);
      expect(r.level).toBe(1);
      expect(r.children).toBeArrayOf([b3, b3, b3, b3]);
      expect(r.length).toBe(12);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3, b3, b3],
        1
      );
      const r = nl.concatBlock(nl) as NonLeafTree<any, any>;
      expect(r).toBeInstanceOf(NonLeafTree);
      expect(r.level).toBe(1);
      expect(r.left).toBeInstanceOf(NonLeafBlock);
      expect(r.left.level).toBe(1);
      expect(r.left.children).toBeArrayOf([b3, b3, b3]);
      expect(r.middle).toBeNull();
      expect(r.right).toBeInstanceOf(NonLeafBlock);
      expect(r.right.level).toBe(1);
      expect(r.right.children).toBeArrayOf([b3, b3, b3]);
      expect(r.length).toBe(18);
    }
  });

  it('concatChildren', () => {
    const b3 = context.leafBlock([1, 2, 3]);

    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        6,
        [b3, b3],
        1
      );
      const r = nl.concatChildren(nl) as NonLeafBlock<any, any>;
      expect(r).toBeInstanceOf(NonLeafBlock);
      expect(r.level).toBe(1);
      expect(r.children).toBeArrayOf([b3, b3, b3, b3]);
      expect(r.length).toBe(12);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3, b3, b3],
        1
      );
      const r = nl.concatChildren(nl);
      expect(r).toBeInstanceOf(NonLeafBlock);
      expect(r.level).toBe(1);
      expect(r.children).toBeArrayOf([b3, b3, b3, b3, b3, b3]);
      expect(r.length).toBe(18);
    }
  });

  it('concatTree', () => {
    const b3 = context.leafBlock([1, 2, 3]);

    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3, b3],
        1
      );
      const nlt = context.nonLeafTree(nl, nl, null, 1);

      const r = nl.concatTree(nlt) as NonLeafTree<number, any>;
      expect(r.level).toBe(1);
      expect(r.left.nrChildren).toBe(4);
      expect(r.left.level).toBe(1);
    }

    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3, b3, b3, b3],
        1
      );
      const nlt = context.nonLeafTree(
        context.nonLeafBlock<number, LeafBlock<number>>(3, [b3], 1),
        nl,
        null,
        1
      );

      const r = nl.concatTree(nlt) as NonLeafTree<number, any>;
      expect(r.level).toBe(1);
      expect(r.left.level).toBe(1);
      expect(r.right.level).toBe(1);
      expect(r.left.nrChildren).toBe(1);
      expect(r.right.nrChildren).toBe(4);
      const m = r.middle as NonLeafBlock<number, any>;
      expect(m.level).toBe(2);
      expect(r.middle).toBeInstanceOf(NonLeafBlock);
      expect(m.nrChildren).toBe(1);
      expect(m.children[0].nrChildren).toBe(4);
    }
  });

  it('context', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    const nl = context.nonLeafBlock<number, LeafBlock<number>>(6, [b3, b3], 1);
    expect(nl.context).toBe(context);
  });

  it('createBlockBuilder', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    const nl = context.nonLeafBlock<number, LeafBlock<number>>(6, [b3, b3], 1);
    const b = nl.createBlockBuilder();
    expect(b).toBeInstanceOf(NonLeafBlockBuilder);
    expect(b.level).toBe(1);
    expect(b.build()).toBe(nl);
  });

  it('createNonLeafBuilder', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    const nl = context.nonLeafBlock<number, LeafBlock<number>>(6, [b3, b3], 1);
    const b = nl.createNonLeafBuilder();
    expect(b).toBeInstanceOf(NonLeafBlockBuilder);
    expect(b.level).toBe(1);
    expect(b.build()).toBe(nl);
  });

  it('dropChildren', () => {
    const b1 = context.leafBlock([1, 2, 3]);
    const b2 = context.leafBlock([4, 5, 6]);
    const b3 = context.leafBlock([7, 8, 9]);
    const nl = context.nonLeafBlock<number, LeafBlock<number>>(
      9,
      [b1, b2, b3],
      1
    );

    expect(nl.dropChildren(8)).toBeNull();
    expect(nl.dropChildren(0)).toBe(nl);

    const r = nl.dropChildren(2);
    expect(r).toBeInstanceOf(NonLeafBlock);
    expect(r?.level).toBe(1);
    expect(r?.length).toBe(3);
    expect(r?.children).toBeArrayOf([b3]);
  });

  it('dropFirst', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    const b3_2 = context.leafBlock([1, 2, 3]);
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3_2, b3, b3],
        1
      );
      const [r, u] = nl.dropFirst();

      expect(r).toBeInstanceOf(NonLeafBlock);
      expect(r?.level).toBe(1);
      expect(r?.length).toBe(6);
      expect(r?.children).toBeArrayOf([b3, b3]);
      expect(u).toBeInstanceOf(LeafBlock);
      expect(u).toBe(b3_2);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(3, [b3], 1);
      const [r, u] = nl.dropFirst();

      expect(r).toBeNull();
      expect(u).toBeInstanceOf(LeafBlock);
      expect(u.children).toEqual([1, 2, 3]);
    }
  });

  it('dropInternal', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3, b3, b3],
        1
      );
      const [r, u, i] = nl.dropInternal(1);
      expect(r?.length).toBe(6);
      expect(u).toBeInstanceOf(LeafBlock);
      expect(u.children).toEqual([1, 2, 3]);
      expect(i).toBe(1);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3, b3, b3],
        1
      );
      const [r, u, i] = nl.dropInternal(4);
      expect(r?.length).toBe(3);
      expect(u).toBeInstanceOf(LeafBlock);
      expect(u.children).toEqual([1, 2, 3]);
      expect(i).toBe(1);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3, b3, b3],
        1
      );
      const [r, u, i] = nl.dropInternal(7);
      expect(r).toBeNull();
      expect(u).toBeInstanceOf(LeafBlock);
      expect(u.children).toEqual([1, 2, 3]);
      expect(i).toBe(1);
    }
  });

  it('dropLast', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    const b3_2 = context.leafBlock([1, 2, 3]);
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3, b3, b3_2],
        1
      );
      const [r, u] = nl.dropLast();

      expect(r).toBeInstanceOf(NonLeafBlock);
      expect(r?.level).toBe(1);
      expect(r?.length).toBe(6);
      expect(r?.children).toBeArrayOf([b3, b3]);
      expect(u).toBeInstanceOf(LeafBlock);
      expect(u).toBe(b3_2);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(3, [b3_2], 1);
      const [r, u] = nl.dropLast();

      expect(r).toBeNull();
      expect(u).toBeInstanceOf(LeafBlock);
      expect(u).toBe(b3_2);
    }
  });

  it('forEach', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    const nl = context.nonLeafBlock<number, LeafBlock<number>>(
      9,
      [b3, b3, b3],
      1
    );

    const cb = vi.fn();
    nl.forEach(cb, TraverseState());
    expect(cb).toBeCalledTimes(9);
    expect(cb.mock.calls[1][0]).toBe(2);
    expect(cb.mock.calls[1][1]).toBe(1);

    cb.mockReset();

    b3.forEach((_, __, halt) => {
      halt();
      cb();
    });

    expect(cb).toBeCalledTimes(1);
  });

  it('get', () => {
    const b1 = context.leafBlock([1, 2, 3]);
    const b2 = context.leafBlock([4, 5, 6]);
    const b3 = context.leafBlock([7, 8, 9]);
    const nl = context.nonLeafBlock<number, LeafBlock<number>>(
      9,
      [b1, b2, b3],
      1
    );

    expect(nl.get(1)).toBe(2);
    expect(nl.get(4)).toBe(5);
    expect(nl.get(7)).toBe(8);
  });

  it('getChild', () => {
    const b1 = context.leafBlock([1, 2, 3]);
    const b2 = context.leafBlock([4, 5, 6]);
    const b3 = context.leafBlock([7, 8, 9]);
    const nl = context.nonLeafBlock<number, LeafBlock<number>>(
      9,
      [b1, b2, b3],
      1
    );

    expect(nl.getChild(0)).toBe(b1);
    expect(nl.getChild(1)).toBe(b2);
    expect(nl.getChild(2)).toBe(b3);
  });

  it('getCoordinates', () => {
    {
      //  regular
      const b4 = context.leafBlock([1, 2, 3, 4]);
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        8,
        [b4, b4],
        1
      );

      expect(nl.getCoordinates(0, false, false)).toEqual([0, 0]);
      expect(nl.getCoordinates(0, false, true)).toEqual([0, 0]);

      expect(nl.getCoordinates(1, false, false)).toEqual([0, 1]);
      expect(nl.getCoordinates(1, true, false)).toEqual([0, 1]);
      expect(nl.getCoordinates(1, true, true)).toEqual([0, 1]);
      expect(nl.getCoordinates(1, false, true)).toEqual([0, 1]);

      expect(nl.getCoordinates(5, false, false)).toEqual([1, 1]);
      expect(nl.getCoordinates(5, true, false)).toEqual([1, 1]);
      expect(nl.getCoordinates(5, true, true)).toEqual([1, 1]);
      expect(nl.getCoordinates(5, false, true)).toEqual([1, 1]);

      expect(nl.getCoordinates(8, false, false)).toEqual([2, 0]);
      expect(nl.getCoordinates(8, true, false)).toEqual([1, 4]);
      expect(nl.getCoordinates(8, true, true)).toEqual([1, 4]);
      expect(nl.getCoordinates(8, false, true)).toEqual([1, 3]);

      expect(nl.getCoordinates(7, false, false)).toEqual([1, 3]);
      expect(nl.getCoordinates(7, true, false)).toEqual([1, 3]);
      expect(nl.getCoordinates(7, true, true)).toEqual([1, 3]);
      expect(nl.getCoordinates(7, false, true)).toEqual([1, 3]);
    }
    {
      // not regular
      const b3 = context.leafBlock([1, 2, 3]);
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        6,
        [b3, b3],
        1
      );

      expect(nl.getCoordinates(0, false, false)).toEqual([0, 0]);
      expect(nl.getCoordinates(0, true, false)).toEqual([0, 0]);
      expect(nl.getCoordinates(0, true, true)).toEqual([0, 0]);
      expect(nl.getCoordinates(0, false, true)).toEqual([0, 0]);

      expect(nl.getCoordinates(1, false, false)).toEqual([0, 1]);
      expect(nl.getCoordinates(1, true, false)).toEqual([0, 1]);
      expect(nl.getCoordinates(1, true, true)).toEqual([0, 1]);
      expect(nl.getCoordinates(1, false, true)).toEqual([0, 1]);

      expect(nl.getCoordinates(4, false, false)).toEqual([1, 1]);
      expect(nl.getCoordinates(4, true, false)).toEqual([1, 1]);
      expect(nl.getCoordinates(4, true, true)).toEqual([1, 1]);
      expect(nl.getCoordinates(4, false, true)).toEqual([1, 1]);

      expect(nl.getCoordinates(7, false, false)).toEqual([2, 0]);
      expect(nl.getCoordinates(7, true, false)).toEqual([2, 0]);
      expect(nl.getCoordinates(7, true, true)).toEqual([1, 2]);
      expect(nl.getCoordinates(7, false, true)).toEqual([1, 2]);

      expect(nl.getCoordinates(6, false, false)).toEqual([2, 0]);
      expect(nl.getCoordinates(6, true, false)).toEqual([1, 3]);
      expect(nl.getCoordinates(6, true, true)).toEqual([1, 3]);
      expect(nl.getCoordinates(6, false, true)).toEqual([1, 2]);
    }
  });

  it('length', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    const nl = context.nonLeafBlock<number, LeafBlock<number>>(6, [b3, b3], 1);
    expect(nl.length).toBe(6);
  });

  it('level', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    expect(
      context.nonLeafBlock<number, LeafBlock<number>>(6, [b3, b3], 1).level
    ).toBe(1);
    expect(
      context.nonLeafBlock<number, LeafBlock<number>>(6, [b3, b3], 2).level
    ).toBe(2);
  });

  it('map', () => {
    const b1 = context.leafBlock([1, 2, 3]);
    const b2 = context.leafBlock([4, 5, 6]);
    const nl = context.nonLeafBlock<number, LeafBlock<number>>(6, [b1, b2], 1);
    {
      const r = nl.map((v) => v + 1);
      expect(r.length).toBe(6);
      expect(r.level).toBe(1);
      expect(r.children[0].toArray()).toEqual([2, 3, 4]);
      expect(r.children[1].toArray()).toEqual([5, 6, 7]);
    }

    {
      const r = nl.map((v) => v + 1, true);
      expect(r.length).toBe(6);
      expect(r.level).toBe(1);
      expect(r.children[0].toArray()).toEqual([7, 6, 5]);
      expect(r.children[1].toArray()).toEqual([4, 3, 2]);
    }
  });

  it('mapPure', () => {
    const b1 = context.leafBlock([1, 2, 3]);

    const nl = context.nonLeafBlock<number, LeafBlock<number>>(6, [b1, b1], 1);
    {
      const r = nl.mapPure((v) => v + 1);
      expect(r.length).toBe(6);
      expect(r.level).toBe(1);
      expect(r.children[0].toArray()).toEqual([2, 3, 4]);
      expect(r.children[1].toArray()).toEqual([2, 3, 4]);
      expect(r.children[0]).toBe(r.children[1]);
    }
    {
      const r = nl.mapPure((v) => v + 1, true);
      expect(r.length).toBe(6);
      expect(r.level).toBe(1);
      expect(r.children[0].toArray()).toEqual([4, 3, 2]);
      expect(r.children[1].toArray()).toEqual([4, 3, 2]);
      expect(r.children[0]).toBe(r.children[1]);
    }
  });
  it('nrChildren', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    const nl = context.nonLeafBlock<number, LeafBlock<number>>(6, [b3, b3], 1);
    expect(nl.nrChildren).toBe(2);
  });

  it('prepend', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    const b4 = context.leafBlock([4, 5, 6]);

    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(3, [b3], 1);
      const r = nl.prepend(b4) as NonLeafBlock<any, any>;
      expect(r.children).toBeArrayOf([b4, b3]);
      expect(r.length).toBe(6);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [b3, b3, b3, b3],
        1
      );
      const r = nl.prepend(b4) as NonLeafTree<any, any>;
      expect(r.left).toBeInstanceOf(NonLeafBlock);
      expect(r.level).toBe(1);
      expect(r.left.level).toBe(1);
      expect(r.right.level).toBe(1);
      expect(r.left.children[0]).toBe(b4);
      expect(r.right).toBeInstanceOf(NonLeafBlock);
      expect(r.middle).toBeNull();
      expect(r.length).toBe(15);
    }
  });

  it('prependInternal', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    const b4 = context.leafBlock([4, 5, 6]);

    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(3, [b3], 1);
      const r = nl.prependInternal(b4);
      expect(r.children).toBeArrayOf([b4, b3]);
      expect(r.length).toBe(6);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [b3, b3, b3, b3],
        1
      );
      const r = nl.prependInternal(b4);
      expect(r.children).toBeArrayOf([b4, b3, b3, b3, b3]);
      expect(r.length).toBe(15);
    }
  });

  it('reversed', () => {
    const b1 = context.leafBlock([1, 2, 3]);
    const b2 = context.leafBlock([4, 5, 6]);
    const b3 = context.leafBlock([7, 8, 9]);

    const nl = context.nonLeafBlock<number, LeafBlock<number>>(
      9,
      [b1, b2, b3],
      1
    );

    const r = nl.reversed();
    expect(r.toArray()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
    expect(r.children[0].toArray()).toEqual([9, 8, 7]);
    expect(r.children[1].toArray()).toEqual([6, 5, 4]);
    expect(r.children[2].toArray()).toEqual([3, 2, 1]);
  });

  it('stream', () => {
    const b1 = context.leafBlock([1, 2, 3]);
    const b2 = context.leafBlock([4, 5, 6]);
    const b3 = context.leafBlock([7, 8, 9]);

    const nl = context.nonLeafBlock<number, LeafBlock<number>>(
      9,
      [b1, b2, b3],
      1
    );

    expect(nl.stream().toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(nl.stream(true).toArray()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });

  it('streamRange', () => {
    const b1 = context.leafBlock([1, 2, 3]);
    const b2 = context.leafBlock([4, 5, 6]);
    const b3 = context.leafBlock([7, 8, 9]);

    const nl = context.nonLeafBlock<number, LeafBlock<number>>(
      9,
      [b1, b2, b3],
      1
    );

    expect(nl.streamRange({ amount: 10 }).toArray()).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
    expect(nl.streamRange({ amount: 0 })).toBe(Stream.empty());
    expect(nl.streamRange({ start: 3, amount: 4 }).toArray()).toEqual([
      4, 5, 6, 7,
    ]);
    expect(nl.streamRange({ start: 3, amount: 4 }, true).toArray()).toEqual([
      7, 6, 5, 4,
    ]);

    expect(nl.streamRange({ start: 3, amount: 2 }).toArray()).toEqual([4, 5]);

    expect(nl.streamRange({ start: 1, amount: 7 }).toArray()).toEqual([
      2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it('structure', () => {
    const b3 = context.leafBlock([1, 2, 3]);

    const nl = context.nonLeafBlock<number, LeafBlock<number>>(6, [b3, b3], 1);

    expect(nl.structure()).toMatchInlineSnapshot(`
      "
        <NLBlock(1) len:6 c:2 <Leaf 3> <Leaf 3>>"
    `);
  });

  it('takeChildren', () => {
    const b1 = context.leafBlock([1, 2, 3]);
    const b2 = context.leafBlock([4, 5, 6]);
    const b3 = context.leafBlock([7, 8, 9]);
    const nl = context.nonLeafBlock<number, LeafBlock<number>>(
      9,
      [b1, b2, b3],
      1
    );

    expect(nl.takeChildren(8)).toBe(nl);
    expect(nl.takeChildren(0)).toBeNull();

    const r = nl.takeChildren(2);
    expect(r).toBeInstanceOf(NonLeafBlock);
    expect(r?.level).toBe(1);
    expect(r?.length).toBe(6);
    expect(r?.children).toBeArrayOf([b1, b2]);
  });

  it('takeInternal', () => {
    const b3 = context.leafBlock([1, 2, 3]);
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3, b3, b3],
        1
      );
      const [r, u, i] = nl.takeInternal(1);
      expect(r).toBeNull();
      expect(u).toBeInstanceOf(LeafBlock);
      expect(u.children).toEqual([1, 2, 3]);
      expect(i).toBe(1);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3, b3, b3],
        1
      );
      const [r, u, i] = nl.takeInternal(4);
      expect(r?.length).toBe(3);
      expect(u).toBeInstanceOf(LeafBlock);
      expect(u.children).toEqual([1, 2, 3]);
      expect(i).toBe(1);
    }
    {
      const nl = context.nonLeafBlock<number, LeafBlock<number>>(
        9,
        [b3, b3, b3],
        1
      );
      const [r, u, i] = nl.takeInternal(7);
      expect(r?.length).toBe(6);
      expect(u).toBeInstanceOf(LeafBlock);
      expect(u.children).toEqual([1, 2, 3]);
      expect(i).toBe(1);
    }
  });

  it('toArray', () => {
    const b1 = context.leafBlock([1, 2, 3]);
    const b2 = context.leafBlock([4, 5, 6]);
    const b3 = context.leafBlock([7, 8, 9]);
    const nl = context.nonLeafBlock<number, LeafBlock<number>>(
      9,
      [b1, b2, b3],
      1
    );

    expect(nl.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(nl.toArray({ amount: 0 })).toEqual([]);
    expect(nl.toArray({ amount: 10 })).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(nl.toArray({ start: 3, amount: 4 })).toEqual([4, 5, 6, 7]);

    expect(nl.toArray(undefined, true)).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
    expect(nl.toArray({ amount: 10 }, true)).toEqual([
      9, 8, 7, 6, 5, 4, 3, 2, 1,
    ]);
    expect(nl.toArray({ start: 3, amount: 4 }, true)).toEqual([7, 6, 5, 4]);

    expect(nl.toArray({ start: 3, amount: 2 })).toEqual([4, 5]);
    expect(nl.toArray({ start: 3, amount: 2 }, true)).toEqual([5, 4]);
  });

  it('updateAt', () => {
    const b1 = context.leafBlock([1, 2, 3]);
    const b2 = context.leafBlock([4, 5, 6]);
    const b3 = context.leafBlock([7, 8, 9]);
    const nl = context.nonLeafBlock<number, LeafBlock<number>>(
      9,
      [b1, b2, b3],
      1
    );

    expect(nl.updateAt(3, 10).toArray()).toEqual([1, 2, 3, 10, 5, 6, 7, 8, 9]);
    expect(nl.updateAt(3, (v) => v + 10).toArray()).toEqual([
      1, 2, 3, 14, 5, 6, 7, 8, 9,
    ]);
  });
});
