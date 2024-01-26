import { Stream } from '@rimbu/stream';
import { TraverseState } from '@rimbu/common';

import {
  LeafBlock,
  ListContext,
  NonLeafBlock,
  NonLeafTree,
  NonLeafTreeBuilder,
} from '../src/custom/index.mjs';

import './setupTests';

const context = new ListContext(2);

describe('NonLeafTree', () => {
  const b1 = context.leafBlock([1, 2, 3]);
  const b2 = context.leafBlock([4, 5, 6]);
  const b3 = context.leafBlock([7, 8, 9]);
  const b4 = context.leafBlock([10, 11, 12]);
  const b5 = context.leafBlock([13, 14, 15]);
  const nlb1 = context.nonLeafBlock<number, LeafBlock<number>>(
    9,
    [b1, b2, b3],
    1
  );
  const nlb2 = context.nonLeafBlock<number, LeafBlock<number>>(
    9,
    [b1, b2, b3],
    1
  );
  const nlb3 = context.nonLeafBlock<
    number,
    NonLeafBlock<number, LeafBlock<number>>
  >(18, [nlb1, nlb2], 2);

  function createTree() {
    return context.nonLeafTree<number, LeafBlock<number>>(nlb1, nlb2, nlb3, 1);
  }

  it('_normalize', () => {
    const items = [1, 2, 3, 4];
    const lb = context.leafBlock(items);

    {
      // convert to block
      const nlb = context.nonLeafBlock<number, LeafBlock<number>>(
        8,
        [lb, lb],
        1
      );
      const nlt = context.nonLeafTree(nlb, nlb, null, 1);

      const n = nlt._normalize();
      expect(n).toBeInstanceOf(NonLeafBlock);
      expect(n.toArray()).toEqual(Stream.from(items).repeat(4).toArray());
    }
    {
      // not possible to merge
      const nlb = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [lb, lb, lb],
        1
      );
      const nlt = context.nonLeafTree(nlb, nlb, null, 1);
      const n = nlt._normalize();
      expect(n).toBeInstanceOf(NonLeafTree);
      expect(n.toArray()).toEqual(Stream.from(items).repeat(6).toArray());
      expect(n).toBe(nlt);
    }
    {
      // merge middle with left
      const nlb = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [lb, lb],
        1
      );
      const mb = context.nonLeafBlock<number, NonLeafBlock<number, any>>(
        24,
        [nlb, nlb],
        2
      );
      const nlt = context.nonLeafTree(nlb, nlb, mb, 1);
      const n = nlt._normalize() as NonLeafTree<any, any>;
      expect(n).toBeInstanceOf(NonLeafTree);
      expect((n.middle as any).children).toEqual([nlb]);
      expect(n.right).toBe(nlb);
      expect(n.left.children).toEqual([lb, lb, lb, lb]);
    }
    {
      // merge middle with right
      const nlb = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [lb, lb],
        1
      );
      const nlb2 = context.nonLeafBlock<number, LeafBlock<number>>(
        24,
        [lb, lb, lb, lb],
        1
      );
      const mb = context.nonLeafBlock<number, NonLeafBlock<number, any>>(
        36,
        [nlb2, nlb],
        2
      );
      const nlt = context.nonLeafTree(nlb, nlb, mb, 1);
      const n = nlt._normalize() as NonLeafTree<any, any>;
      expect(n).toBeInstanceOf(NonLeafTree);
      expect((n.middle as any).children).toEqual([nlb2]);
      expect(n.left).toBe(nlb);
      expect(n.right.children).toEqual([lb, lb, lb, lb]);
    }
  });

  it('append', () => {
    const t = createTree();
    const r1 = t.append(b4);

    expect(r1.left).toBe(nlb1);
    expect(r1.right).toBeInstanceOf(NonLeafBlock);
    expect(r1.right.toArray()).toEqual(
      Stream.range({ start: 1, amount: 12 }).toArray()
    );
    expect(r1.right.nrChildren).toBe(4);
    expect(r1.right.children[3]).toBe(b4);
    expect(r1.middle).toBe(nlb3);

    const r2 = r1.append(b5);
    expect(r2.left).toBe(nlb1);
    expect(r2.right).toBeInstanceOf(NonLeafBlock);
    expect(r2.right.nrChildren).toBe(1);
    expect(r2.right.children[0]).toBe(b5);
    expect(r2.middle?.length).toBe(30);
  });

  it('appendMiddle', () => {
    {
      const t = createTree();

      expect((t.middle as any).nrChildren).toBe(2);
      const r1 = t.appendMiddle(nlb1) as NonLeafBlock<any, any>;
      expect(r1).toBeInstanceOf(NonLeafBlock);
      expect(r1.nrChildren).toBe(3);
      expect(r1.children).toEqual([nlb1, nlb2, nlb1]);
    }
    {
      // no middle
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        nlb2,
        null,
        1
      );

      const r1 = t.appendMiddle(nlb1) as NonLeafBlock<any, any>;
      expect(r1).toBeInstanceOf(NonLeafBlock);
      expect(r1.nrChildren).toBe(1);
      expect(r1.children).toEqual([nlb1]);
    }
    {
      // full middle block
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        nlb2,
        context.nonLeafBlock(36, [nlb1, nlb1, nlb1, nlb1], 2),
        1
      );

      const r1 = t.appendMiddle(nlb1) as NonLeafTree<any, any>;
      expect(r1).toBeInstanceOf(NonLeafTree);
      expect(r1.left.nrChildren).toBe(4);
      expect(r1.right.nrChildren).toBe(1);
    }
  });

  it('concatBlock', () => {
    {
      // move current right to middle
      const t = createTree();
      const r = t.concatBlock(nlb1) as NonLeafTree<number, LeafBlock<number>>;
      expect(r.left.nrChildren).toBe(3);
      expect(r.right.nrChildren).toBe(3);
      expect(r.middle?.length).toBe(27);
    }
    {
      // append to right
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        context.nonLeafBlock(3, [b1], 1),
        nlb3,
        1
      );
      const r = t.concatBlock(nlb1) as NonLeafTree<number, LeafBlock<number>>;
      expect(r.left.nrChildren).toBe(3);
      expect(r.right.nrChildren).toBe(4);
      expect(r.middle?.length).toBe(18);
    }
    {
      // split new right
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        context.nonLeafBlock(3, [b1], 1),
        nlb3,
        1
      );
      const r = t.concatBlock(
        context.nonLeafBlock(12, [b1, b1, b1, b1], 1)
      ) as NonLeafTree<number, LeafBlock<number>>;
      expect(r.left.nrChildren).toBe(3);
      expect(r.right.nrChildren).toBe(1);
      expect(r.middle?.length).toBe(30);
    }
  });

  it('concatTree', () => {
    {
      // append right and left to middle
      const t = createTree();
      const r = t.concatTree(createTree()) as NonLeafTree<
        number,
        LeafBlock<number>
      >;
      expect(r.left.nrChildren).toBe(3);
      expect(r.right.nrChildren).toBe(3);
      expect(r.middle?.length).toBe(54);
      expect(r.toArray()).toEqual(t.stream().repeat(2).toArray());
    }
    {
      // merge right and left
      const t = context.nonLeafTree(
        nlb1,
        context.nonLeafBlock(6, [b1, b2], 1),
        null,
        1
      );
      const t2 = context.nonLeafTree(
        context.nonLeafBlock<number, LeafBlock<number>>(6, [b1, b2], 1),
        nlb2,
        null,
        1
      );
      const r = t.concatTree(t2) as NonLeafTree<number, LeafBlock<number>>;
      expect(r.left.nrChildren).toBe(3);
      expect(r.right.nrChildren).toBe(3);
      const m = r.middle as any as NonLeafBlock<number, LeafBlock<number>>;
      expect(m.length).toBe(12);
      expect(m).toBeInstanceOf(NonLeafBlock);
      expect(m.children).toEqual([
        context.nonLeafBlock<number, LeafBlock<number>>(
          12,
          [b1, b2, b1, b2],
          1
        ),
      ]);
    }
    {
      // merge and split
      const t = context.nonLeafTree(
        nlb1,
        context.nonLeafBlock(3, [b1], 1),
        null,
        1
      );
      const t2 = context.nonLeafTree(
        context.nonLeafBlock<number, LeafBlock<number>>(9, [b1, b2, b1, b2], 1),
        nlb2,
        null,
        1
      );
      const r = t.concatTree(t2) as NonLeafTree<number, LeafBlock<number>>;
      expect(r.left.nrChildren).toBe(3);
      expect(r.right.nrChildren).toBe(3);
      const m = r.middle as any as NonLeafBlock<number, LeafBlock<number>>;
      expect(m.length).toBe(12);
      expect(m).toBeInstanceOf(NonLeafBlock);
      expect(m.nrChildren).toBe(2);
    }
  });

  it('context', () => {
    const t = createTree();
    expect(t.context).toBe(context);
  });

  it('createNonLeafBuilder', () => {
    const t = createTree();
    const b = t.createNonLeafBuilder();
    expect(b).toBeInstanceOf(NonLeafTreeBuilder);
    expect(b.build()).toBe(t);
  });

  it('dropFirst', () => {
    {
      // middle tree
      const t = createTree();
      const [next, remain] = t.dropFirst();
      expect(remain).toBe(b1);
      expect(next?.length).toBe(33);
      expect(next?.toArray()).toEqual(t.toArray({ range: { start: 3 } }));
      expect(next).toBeInstanceOf(NonLeafTree);
    }
    {
      // no middle
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        context.nonLeafBlock<number, LeafBlock<number>>(3, [b1], 1),
        nlb2,
        null,
        1
      );
      const [next, remain] = t.dropFirst();
      expect(remain).toBe(b1);
      expect(next?.length).toBe(9);
      expect(next?.toArray()).toEqual(t.toArray({ range: { start: 3 } }));
      expect(next).toBeInstanceOf(NonLeafBlock);
    }
    {
      // middle leaf block
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        context.nonLeafBlock<number, LeafBlock<number>>(3, [b1], 1),
        nlb2,
        nlb3,
        1
      );
      const [next, remain] = t.dropFirst();
      expect(remain).toBe(b1);
      expect(next?.length).toBe(27);
      expect(next?.toArray()).toEqual(t.toArray({ range: { start: 3 } }));
      expect(next).toBeInstanceOf(NonLeafTree);
    }
  });

  it('dropLast', () => {
    {
      // set new right to right
      const t = createTree();
      const [next, remain] = t.dropLast();
      expect(remain).toBe(b3);
      expect(next?.length).toBe(t.length - 3);
      expect(next?.toArray()).toEqual(t.toArray({ range: { end: -4 } }));
      expect(next).toBeInstanceOf(NonLeafTree);
      expect((next as any).right).toEqual(
        context.nonLeafBlock<number, any>(6, [b1, b2], 1)
      );
    }
    {
      // drop last right
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        context.nonLeafBlock<number, LeafBlock<number>>(6, [b1, b2], 1),
        null,
        1
      );
      const [next, remain] = t.dropLast();
      expect(remain).toBe(b2);
      expect(next?.length).toBe(t.length - 3);
      expect(next?.toArray()).toEqual(t.toArray({ range: { end: -4 } }));
      expect(next).toBeInstanceOf(NonLeafBlock);
    }
    {
      // move last middle to right
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        context.nonLeafBlock<number, LeafBlock<number>>(3, [b1], 1),
        nlb3,
        1
      );
      const [next, remain] = t.dropLast();
      expect(remain).toBe(b1);
      expect(next?.length).toBe(27);
      expect(next?.toArray()).toEqual(t.toArray({ range: { end: -4 } }));
      expect((next as any).right).toBe(nlb2);
    }
    {
      // drop right
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        context.nonLeafBlock<number, LeafBlock<number>>(3, [b1], 1),
        null,
        1
      );
      const [next, remain] = t.dropLast();
      expect(remain).toBe(b1);
      expect(next?.length).toBe(9);
      expect(next?.toArray()).toEqual(t.toArray({ range: { end: -4 } }));
      expect(next).toBe(nlb1);
    }
  });

  it('dropInternal', () => {
    {
      // drop only from left with middle, some left left
      const t = createTree();
      const [newT, up, upAmount] = t.dropInternal(1);
      expect(upAmount).toBe(1);
      expect(up).toBe(b1);
      expect(newT?.toArray()).toEqual(t.toArray({ range: { start: 3 } }));
      expect(newT).toBeInstanceOf(NonLeafTree);
    }
    {
      // drop only from left with middle, no left left
      const t = createTree();
      const [newT, up, upAmount] = t.dropInternal(9);
      expect(upAmount).toBe(0);
      expect(up).toBe(b1);
      expect(newT?.toArray()).toEqual(t.toArray({ range: { start: 12 } }));
      expect(newT).toBeInstanceOf(NonLeafTree);
    }
    {
      // drop only from left with middle, one left left
      const t = createTree();
      const [newT, up, upAmount] = t.dropInternal(8);
      expect(upAmount).toBe(2);
      expect(up).toBe(b3);
      expect(newT?.toArray()).toEqual(t.toArray({ range: { start: 9 } }));
      expect(newT).toBeInstanceOf(NonLeafTree);
    }
    {
      // drop only from left, no middle
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        nlb2,
        null,
        1
      );
      const [newT, up, upAmount] = t.dropInternal(1);
      expect(upAmount).toBe(1);
      expect(up).toBe(b1);
      expect(newT?.toArray()).toEqual(t.toArray({ range: { start: 3 } }));
      expect(newT).toBeInstanceOf(NonLeafTree);
    }
    {
      // drop only from left, no left left, no middle
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        nlb2,
        null,
        1
      );
      const [newT, up, upAmount] = t.dropInternal(9);
      expect(upAmount).toBe(0);
      expect(up).toBe(b1);
      expect(newT?.toArray()).toEqual(t.toArray({ range: { start: 12 } }));
      expect(newT).toBeInstanceOf(NonLeafBlock);
    }
    {
      // middle
      const t = createTree();
      const [newT, up, upAmount] = t.dropInternal(18);
      expect(upAmount).toBe(0);
      expect(up).toBe(b1);
      expect(newT?.toArray()).toEqual(t.toArray({ range: { start: 18 + 3 } }));
      expect(newT).toBeInstanceOf(NonLeafTree);
    }
    {
      // right
      const t = createTree();
      const [newRight, up, upAmount] = t.dropInternal(33);
      expect(upAmount).toBe(0);
      expect(up).toBe(b3);
      expect(newRight).toBeNull();
    }
  });

  it('forEach', () => {
    const t = createTree();

    const cb = vi.fn();
    t.forEach(cb, { reversed: false, state: TraverseState() });
    expect(cb).toBeCalledTimes(36);
    expect(cb.mock.calls[1][0]).toBe(2);
    expect(cb.mock.calls[1][1]).toBe(1);

    cb.mockReset();

    t.forEach(cb, { reversed: true, state: TraverseState() });
    expect(cb).toBeCalledTimes(36);
    expect(cb.mock.calls[1][0]).toBe(8);
    expect(cb.mock.calls[1][1]).toBe(1);

    cb.mockReset();

    t.forEach(
      (_, __, halt) => {
        halt();
        cb();
      },
      { reversed: false, state: TraverseState() }
    );

    expect(cb).toBeCalledTimes(1);
  });

  it('get', () => {
    const t = createTree();

    expect(t.get(0)).toBe(1);
    expect(t.get(1)).toBe(2);

    expect(t.get(6)).toBe(7);

    expect(t.get(35)).toBe(9);

    expect(() => t.get(36)).toThrow();
  });

  it('map', () => {
    {
      const t = context.nonLeafTree(nlb1, nlb1, nlb3, 1);
      const r = t.map((v) => v + 1);
      expect(r.length).toBe(t.length);
      expect(r.level).toBe(t.level);
      expect(r.toArray()).toEqual(
        t
          .stream()
          .map((v) => v + 1)
          .toArray()
      );
    }
    {
      const t = context.nonLeafTree(nlb1, nlb1, nlb3, 1);
      const r = t.map((v) => v + 1, { reversed: true });
      expect(r.length).toBe(t.length);
      expect(r.level).toBe(t.level);
      expect(r.toArray()).toEqual(
        t
          .stream({ reversed: true })
          .map((v) => v + 1)
          .toArray()
      );
    }
  });

  it('mapPure', () => {
    {
      const t = context.nonLeafTree(nlb1, nlb1, nlb3, 1);
      const r = t.mapPure((v) => v + 1);
      expect(r.length).toBe(t.length);
      expect(r.level).toBe(t.level);
      expect(r.left.nrChildren).toBe(t.left.nrChildren);
      expect(r.right.nrChildren).toBe(t.right.nrChildren);
      expect(r.left).toBe(r.right);
    }
    {
      const t = context.nonLeafTree(nlb1, nlb1, nlb3, 1);
      const r = t.mapPure((v) => v + 1, { reversed: true });
      expect(r.length).toBe(t.length);
      expect(r.level).toBe(t.level);
      expect(r.left.nrChildren).toBe(t.left.nrChildren);
      expect(r.right.nrChildren).toBe(t.right.nrChildren);
      expect(r.left).toBe(r.right);
    }
  });

  it('prepend', () => {
    const t = createTree();
    const r1 = t.prepend(b4);

    expect(r1.right).toBe(nlb2);
    expect(r1.left).toBeInstanceOf(NonLeafBlock);
    expect(r1.left.toArray()).toEqual(
      Stream.of(10, 11, 12)
        .concat(Stream.range({ start: 1, amount: 9 }))
        .toArray()
    );
    expect(r1.left.nrChildren).toBe(4);
    expect(r1.left.children[0]).toBe(b4);
    expect(r1.middle).toBe(nlb3);

    const r2 = r1.prepend(b5);
    expect(r2.right).toBe(nlb2);
    expect(r2.left).toBeInstanceOf(NonLeafBlock);
    expect(r2.left.nrChildren).toBe(1);
    expect(r2.left.children[0]).toBe(b5);
    expect(r2.middle?.length).toBe(30);
  });

  it('prependMiddle', () => {
    {
      const t = createTree();

      expect((t.middle as any).nrChildren).toBe(2);
      const r1 = t.prependMiddle(nlb1) as NonLeafBlock<any, any>;
      expect(r1).toBeInstanceOf(NonLeafBlock);
      expect(r1.nrChildren).toBe(3);
      expect(r1.children).toEqual([nlb1, nlb2, nlb1]);
    }
    {
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        nlb2,
        null,
        1
      );

      const r1 = t.prependMiddle(nlb1) as NonLeafBlock<any, any>;
      expect(r1).toBeInstanceOf(NonLeafBlock);
      expect(r1.nrChildren).toBe(1);
      expect(r1.children).toEqual([nlb1]);
    }
    {
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        nlb2,
        context.nonLeafBlock(36, [nlb1, nlb1, nlb1, nlb1], 2),
        1
      );

      const r1 = t.prependMiddle(nlb1) as NonLeafTree<any, any>;
      expect(r1).toBeInstanceOf(NonLeafTree);
      expect(r1.right.nrChildren).toBe(4);
      expect(r1.left.nrChildren).toBe(1);
    }
  });

  it('reversed', () => {
    const t = context.nonLeafTree(nlb1, nlb1, nlb3, 1);
    const r = t.reversed();
    expect(r.left).toBe(r.right);
    expect(r.toArray()).toEqual(t.toArray({ reversed: true }));
  });

  it('structure', () => {
    expect(createTree().structure()).toMatchInlineSnapshot(`
      "
        <NLTree(1) len:36
        l:
        <NLBlock(1) len:9 c:3 <Leaf 3> <Leaf 3> <Leaf 3>>
        m:
          <NLBlock(2) len:18 c:2 
        <NLBlock(1) len:9 c:3 <Leaf 3> <Leaf 3> <Leaf 3>> 
        <NLBlock(1) len:9 c:3 <Leaf 3> <Leaf 3> <Leaf 3>>>
        r:
        <NLBlock(1) len:9 c:3 <Leaf 3> <Leaf 3> <Leaf 3>>
      >"
    `);
  });

  it('stream', () => {
    const t = createTree();

    expect(t.stream().toArray()).toEqual(
      nlb1.stream().concat(nlb2, nlb3).toArray()
    );
    expect(t.stream({ reversed: true }).toArray()).toEqual(
      nlb1.stream().concat(nlb2, nlb3).toArray().reverse()
    );
  });

  it('streamRange', () => {
    const t = createTree();

    expect(t.stream().toArray()).toEqual(
      nlb1.stream().concat(nlb2, nlb3).toArray()
    );
    expect(t.stream({ reversed: true }).toArray()).toEqual(
      nlb1.stream().concat(nlb2, nlb3).toArray().reverse()
    );

    expect(t.streamRange({ amount: 0 })).toBe(Stream.empty());
    expect(t.streamRange({ amount: 4 }).toArray()).toEqual([1, 2, 3, 4]);
    expect(t.streamRange({ start: 4, amount: 4 }).toArray()).toEqual([
      5, 6, 7, 8,
    ]);
    expect(
      t.streamRange({ start: 4, amount: 4 }, { reversed: true }).toArray()
    ).toEqual([8, 7, 6, 5]);
  });

  it('takeInternal', () => {
    {
      // only left remains
      const t = createTree();
      const [newRight, up, upAmount] = t.takeInternal(1);
      expect(upAmount).toBe(1);
      expect(up).toBe(b1);
      expect(newRight).toBeNull();
    }
    {
      // take from middle
      const t = createTree();
      const [newT, up, upAmount] = t.takeInternal(18);
      expect(upAmount).toBe(3);
      expect(up).toBe(b3);
      expect(newT?.toArray()).toEqual(t.toArray({ range: { amount: 18 - 3 } }));
      expect(newT).toBeInstanceOf(NonLeafTree);
    }
    {
      // take from right with middle
      const t = createTree();
      const [newT, up, upAmount] = t.takeInternal(35);
      expect(upAmount).toBe(2);
      expect(up).toBe(b3);
      expect(newT?.toArray()).toEqual(t.toArray({ range: { amount: 33 } }));
      expect(newT).toBeInstanceOf(NonLeafTree);
    }
    {
      // take no right remains with middle
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        context.nonLeafBlock<number, LeafBlock<number>>(3, [b3], 1),
        nlb3,
        1
      );
      const [newT, up, upAmount] = t.takeInternal(28);
      expect(upAmount).toBe(1);
      expect(up).toBe(b3);
      expect(newT?.toArray()).toEqual(t.toArray({ range: { amount: 28 - 1 } }));
      expect(newT).toBeInstanceOf(NonLeafTree);
    }
    {
      // take from right no middle
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        nlb2,
        null,
        1
      );
      const [newRight, up, upAmount] = t.takeInternal(17);
      expect(upAmount).toBe(2);
      expect(up).toBe(b3);
      expect(newRight?.toArray()).toEqual(t.toArray({ range: { amount: 15 } }));
      expect(newRight).toBeInstanceOf(NonLeafTree);
    }
    {
      // take from right no middle, no right remains
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        nlb2,
        null,
        1
      );
      const [newRight, up, upAmount] = t.takeInternal(15);
      expect(upAmount).toBe(3);
      expect(up).toBe(b2);
      expect(newRight?.toArray()).toEqual(t.toArray({ range: { amount: 12 } }));
      expect(newRight).toBeInstanceOf(NonLeafBlock);
    }
    {
      // only left remains, no middle
      const t = context.nonLeafTree<number, LeafBlock<number>>(
        nlb1,
        context.nonLeafBlock<number, LeafBlock<number>>(3, [b3], 1),
        null,
        1
      );
      const [newRight, up, upAmount] = t.takeInternal(10);
      expect(upAmount).toBe(1);
      expect(up).toBe(b3);
      expect(newRight?.toArray()).toEqual(
        t.toArray({ range: { amount: 10 - 1 } })
      );
      expect(newRight).toBeInstanceOf(NonLeafBlock);
    }
  });

  it('updateAt', () => {
    const t = createTree();

    function verify(index: number) {
      expect(t.updateAt(index, 100).toArray()).toEqual(
        t
          .stream()
          .map((v, i) => (i === index ? 100 : v))
          .toArray()
      );
    }

    for (let i = 0; i < t.length; i++) {
      verify(i);
    }
  });
});
