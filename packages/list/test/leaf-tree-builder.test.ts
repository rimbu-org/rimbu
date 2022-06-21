import {
  LeafBlockBuilder,
  LeafTree,
  LeafTreeBuilder,
  ListContext,
} from '@rimbu/list/custom';

const context = new ListContext(2);

describe('LeafTreeBuilder', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('append', () => {
    {
      // can add to right
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12, 13]),
        undefined,
        5
      );
      t.append(-1);
      expect(t.length).toBe(6);
      expect(t.get(5)).toBe(-1);
      expect(t.left.children).toEqual([1, 2]);
      expect(t.right.children).toEqual([11, 12, 13, -1]);
    }
    {
      // right full, no middle, left has place
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2, 3]),
        context.leafBlockBuilder([11, 12, 13, 14]),
        undefined,
        7
      );
      t.append(-1);
      expect(t.length).toBe(8);
      expect(t.get(7)).toBe(-1);
      expect(t.left.children).toEqual([1, 2, 3, 11]);
      expect(t.right.children).toEqual([12, 13, 14, -1]);
    }
    {
      // left and right full, no middle
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2, 3, 4]),
        context.leafBlockBuilder([11, 12, 13, 14]),
        undefined,
        8
      );
      t.append(-1);
      expect(t.length).toBe(9);
      expect(t.get(8)).toBe(-1);
      expect(t.left.children).toEqual([1, 2, 3, 4]);
      expect((t.middle as any).children[0].children).toEqual([11, 12, 13, 14]);
      expect(t.right.children).toEqual([-1]);
    }
    {
      // right full, last middle has place
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12, 13, 14]),
        context.nonLeafBlockBuilder(1, [context.leafBlockBuilder([21, 22])], 2),
        8
      );
      t.append(-1);
      expect(t.length).toBe(9);
      expect(t.get(8)).toBe(-1);
      expect(t.left.children).toEqual([1, 2]);
      expect((t.middle as any).children[0].children).toEqual([21, 22, 11]);
      expect(t.right.children).toEqual([12, 13, 14, -1]);
      expect(t.middle!.length).toBe(3);
    }
    {
      // right full, last middle full
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12, 13, 14]),
        context.nonLeafBlockBuilder(
          1,
          [context.leafBlockBuilder([21, 22, 23, 24])],
          4
        ),
        10
      );
      t.append(-1);
      expect(t.length).toBe(11);
      expect(t.get(10)).toBe(-1);
      expect(t.left.children).toEqual([1, 2]);
      expect((t.middle as any).children[0].children).toEqual([21, 22, 23, 24]);
      expect((t.middle as any).children[1].children).toEqual([11, 12, 13, 14]);
      expect(t.right.children).toEqual([-1]);
      expect(t.middle!.length).toBe(8);
    }
  });

  it('appendChildren', () => {
    {
      // no effect
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        undefined,
        4
      );
      t.appendChildren([], 0);
      t.appendChildren([1, 2, 3], 10);
      expect(t.right.children).toEqual([11, 12]);
    }
    {
      // fill right
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        undefined,
        4
      );
      t.appendChildren([31, 32], 0);
      expect(t.right.children).toEqual([11, 12, 31, 32]);
      expect(t.length).toBe(6);
    }
    {
      // add current right to middle
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12, 13, 14]),
        undefined,
        6
      );
      t.appendChildren([31, 32], 0);
      expect(t.right.children).toEqual([31, 32]);
      expect(t.length).toBe(8);
    }
  });

  it('build', () => {
    {
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        undefined,
        4
      );
      const r = t.build();
      expect(r.toArray()).toEqual([1, 2, 11, 12]);
      expect(r).toBeInstanceOf(LeafTree);
    }
    {
      const source = context.leafTree(
        context.leafBlock([1, 2]),
        context.leafBlock([11, 12]),
        null
      );

      const t = context.leafTreeBuilderSource(source);
      const r = t.build();
      expect(r.toArray()).toEqual([1, 2, 11, 12]);
      expect(r).toBeInstanceOf(LeafTree);
    }
  });

  it('buildMap', () => {
    {
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        undefined,
        4
      );
      const r = t.buildMap((v) => v + 1);
      expect(r.toArray()).toEqual([2, 3, 12, 13]);
      expect(r).toBeInstanceOf(LeafTree);
    }
    {
      const source = context.leafTree(
        context.leafBlock([1, 2]),
        context.leafBlock([11, 12]),
        null
      );

      const t = context.leafTreeBuilderSource(source);
      const r = t.buildMap((v) => v + 1);
      expect(r.toArray()).toEqual([2, 3, 12, 13]);
      expect(r).toBeInstanceOf(LeafTree);
    }
  });

  it('context', () => {
    expect(
      context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        undefined,
        4
      ).context
    ).toBe(context);
  });

  it('length', () => {
    {
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        undefined,
        4
      );
      expect(t.length).toBe(4);
    }
    {
      const source = context.leafTree(
        context.leafBlock([1, 2]),
        context.leafBlock([11, 12]),
        null
      );

      const t = context.leafTreeBuilderSource(source);
      expect(t.length).toBe(4);
    }
  });

  it('get', () => {
    {
      // no source, middle
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2, 3]),
        context.leafBlockBuilder([11, 12, 13]),
        context.nonLeafBlockBuilder(
          1,
          [context.leafBlockBuilder([21, 22, 23])],
          3
        ),
        9
      );

      expect(t.get(0)).toBe(1);
      expect(t.get(3)).toBe(21);
      expect(t.get(6)).toBe(11);
    }
    {
      // no source, no middle
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2, 3]),
        context.leafBlockBuilder([11, 12, 13]),
        undefined,
        6
      );

      expect(t.get(0)).toBe(1);
      expect(t.get(3)).toBe(11);
      expect(t.get(5)).toBe(13);
    }
    {
      // source
      const t = context.leafTreeBuilderSource(
        context.leafTree(
          context.leafBlock([1, 2, 3]),
          context.leafBlock([4, 5, 6]),
          null
        )
      );
      expect(t.get(4)).toBe(5);
    }
  });

  it('getChildLength', () => {
    expect(
      context
        .leafTreeBuilder(
          context.leafBlockBuilder([1, 2]),
          context.leafBlockBuilder([11, 12]),
          undefined,
          4
        )
        .getChildLength()
    ).toBe(1);
  });

  it('level', () => {
    expect(
      context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        undefined,
        4
      ).level
    ).toBe(0);
  });

  it('normalized', () => {
    {
      // can collapse into block
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        undefined,
        4
      );
      const n = t.normalized() as LeafBlockBuilder<number>;
      expect(n).toBeInstanceOf(LeafBlockBuilder);
      expect(n.children).toEqual([1, 2, 11, 12]);
      expect(n.length).toBe(4);
    }
    {
      // can merge middle with left
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12, 13]),
        context.nonLeafBlockBuilder(1, [context.leafBlockBuilder([21, 22])], 2),
        7
      );
      const n = t.normalized() as LeafTreeBuilder<number>;
      expect(n).toBeInstanceOf(LeafTreeBuilder);
      expect(n.left.children).toEqual([1, 2, 21, 22]);
      expect(n.length).toBe(7);
    }
    {
      // can merge middle with right
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2, 3]),
        context.leafBlockBuilder([11, 12]),
        context.nonLeafBlockBuilder(1, [context.leafBlockBuilder([21, 22])], 2),
        7
      );
      const n = t.normalized() as LeafTreeBuilder<number>;
      expect(n).toBeInstanceOf(LeafTreeBuilder);
      expect(n.right.children).toEqual([21, 22, 11, 12]);
      expect(n.length).toBe(7);
    }
    {
      // cannot normalize
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        context.nonLeafBlockBuilder(
          1,
          [context.leafBlockBuilder([21, 22, 23])],
          3
        ),
        7
      );
      const n = t.normalized() as LeafTreeBuilder<number>;
      expect(n).toBeInstanceOf(LeafTreeBuilder);
      expect(n.left.children).toEqual([1, 2]);
      expect(n.length).toBe(7);
    }
  });

  it('prepareMutate', () => {
    {
      const left = context.leafBlockBuilder([1, 2]);
      const right = context.leafBlockBuilder([11, 12]);
      const t = context.leafTreeBuilder(left, right, undefined, 4);
      t.prepareMutate();
      expect(t.source).toBeUndefined();
      expect(t.left).toBe(left);
      expect(t.right).toBe(right);
    }
    {
      const source = context.leafTree(
        context.leafBlock([1, 2]),
        context.leafBlock([11, 12]),
        null
      );

      const t = context.leafTreeBuilderSource(source);
      t.prepareMutate();
      expect(t.source).toBeUndefined();
      expect(t.left.source).toBe(source.left);
      expect(t.right.source).toBe(source.right);
      expect(t.left).toBeInstanceOf(LeafBlockBuilder);
      expect(t.right).toBeInstanceOf(LeafBlockBuilder);
    }
  });

  it('prepareMutate is called', () => {
    const t = context.leafTreeBuilder(
      context.leafBlockBuilder([1, 2]),
      context.leafBlockBuilder([11, 12]),
      undefined,
      4
    );
    const fn = jest.fn();
    t.prepareMutate = fn;

    t.left;
    expect(fn).toBeCalledTimes(1);
    fn.mockReset();
    t.right;
    expect(fn).toBeCalledTimes(1);
    fn.mockReset();
    t.middle;
    expect(fn).toBeCalledTimes(1);

    fn.mockReset();
    t.left = context.leafBlockBuilder([21, 22]);
    expect(fn).toBeCalledTimes(1);
    fn.mockReset();
    t.right = context.leafBlockBuilder([21, 22]);
    expect(fn).toBeCalledTimes(1);
    fn.mockReset();
    t.middle = context.nonLeafBlockBuilder(1, [], 0);
    expect(fn).toBeCalledTimes(1);
  });

  it('prepend', () => {
    {
      // can add to left
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12, 13]),
        undefined,
        5
      );
      t.prepend(-1);
      expect(t.length).toBe(6);
      expect(t.get(0)).toBe(-1);
      expect(t.left.children).toEqual([-1, 1, 2]);
      expect(t.right.children).toEqual([11, 12, 13]);
    }
    {
      // left full, no middle, right has place
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2, 3, 4]),
        context.leafBlockBuilder([11, 12, 13]),
        undefined,
        7
      );
      t.prepend(-1);
      expect(t.length).toBe(8);
      expect(t.get(0)).toBe(-1);
      expect(t.left.children).toEqual([-1, 1, 2, 3]);
      expect(t.right.children).toEqual([4, 11, 12, 13]);
    }
    {
      // left and right full, no middle
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2, 3, 4]),
        context.leafBlockBuilder([11, 12, 13, 14]),
        undefined,
        8
      );
      t.prepend(-1);
      expect(t.length).toBe(9);
      expect(t.get(0)).toBe(-1);
      expect(t.left.children).toEqual([-1]);
      expect((t.middle as any).children[0].children).toEqual([1, 2, 3, 4]);
      expect(t.right.children).toEqual([11, 12, 13, 14]);
    }
    {
      // left full, first middle has place
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2, 3, 4]),
        context.leafBlockBuilder([11, 12]),
        context.nonLeafBlockBuilder(1, [context.leafBlockBuilder([21, 22])], 2),
        8
      );
      t.prepend(-1);
      expect(t.length).toBe(9);
      expect(t.left.children).toEqual([-1, 1, 2, 3]);
      expect((t.middle as any).children[0].children).toEqual([4, 21, 22]);
      expect(t.right.children).toEqual([11, 12]);
      expect(t.middle!.length).toBe(3);
    }
    {
      // left full, first middle full
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2, 3, 4]),
        context.leafBlockBuilder([11, 12]),
        context.nonLeafBlockBuilder(
          1,
          [context.leafBlockBuilder([21, 22, 23, 24])],
          4
        ),
        10
      );
      t.prepend(-1);
      expect(t.length).toBe(11);
      expect(t.left.children).toEqual([-1]);
      expect((t.middle as any).children[0].children).toEqual([1, 2, 3, 4]);
      expect((t.middle as any).children[1].children).toEqual([21, 22, 23, 24]);
      expect(t.right.children).toEqual([11, 12]);
      expect(t.middle!.length).toBe(8);
    }
  });

  it('remove', () => {
    {
      // no middle, remove keeps same structure
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2, 3]),
        context.leafBlockBuilder([11, 12, 13]),
        undefined,
        6
      );
      expect(t.remove(3)).toBe(11);
      expect(t.length).toBe(5);
      expect(t.left.children).toEqual([1, 2, 3]);
      expect(t.right.children).toEqual([12, 13]);
    }
    {
      // no middle, left get value from right
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12, 13]),
        undefined,
        5
      );
      expect(t.remove(1)).toBe(2);
      expect(t.length).toBe(4);
      expect(t.left.children).toEqual([1, 11]);
      expect(t.right.children).toEqual([12, 13]);
    }
    {
      // no middle, right gets value from left
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2, 3]),
        context.leafBlockBuilder([11, 12]),
        undefined,
        5
      );
      expect(t.remove(4)).toBe(12);
      expect(t.length).toBe(4);
      expect(t.left.children).toEqual([1, 2]);
      expect(t.right.children).toEqual([3, 11]);
    }
    {
      // middle, remove from left needs to borrow
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        context.nonLeafBlockBuilder(
          1,
          [context.leafBlockBuilder([21, 22, 23, 24])],
          4
        ),
        8
      );
      expect(t.remove(0)).toBe(1);
      expect(t.length).toBe(7);
      expect(t.left.children).toEqual([2, 21]);
      expect((t.middle as any).children[0].children).toEqual([22, 23, 24]);
      expect(t.right.children).toEqual([11, 12]);
    }
    {
      // middle, remove from right needs to borrow
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        context.nonLeafBlockBuilder(
          1,
          [context.leafBlockBuilder([21, 22, 23, 24])],
          4
        ),
        8
      );
      expect(t.remove(7)).toBe(12);
      expect(t.length).toBe(7);
      expect(t.left.children).toEqual([1, 2]);
      expect((t.middle as any).children[0].children).toEqual([21, 22, 23]);
      expect(t.right.children).toEqual([24, 11]);
    }
    {
      // middle, remove from middle remains structure
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        context.nonLeafBlockBuilder(
          1,
          [context.leafBlockBuilder([21, 22, 23, 24])],
          4
        ),
        8
      );
      expect(t.remove(3)).toBe(22);
      expect(t.length).toBe(7);
      expect(t.left.children).toEqual([1, 2]);
      expect((t.middle as any).children[0].children).toEqual([21, 23, 24]);
      expect(t.right.children).toEqual([11, 12]);
    }
    {
      // middle, remove from left needs to merge with first middle child
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        context.nonLeafBlockBuilder(1, [context.leafBlockBuilder([21, 22])], 2),
        6
      );
      expect(t.remove(1)).toBe(2);
      expect(t.length).toBe(5);
      expect(t.left.children).toEqual([1, 21, 22]);
      expect(t.middle).toBeUndefined();
      expect(t.right.children).toEqual([11, 12]);
    }
    {
      // middle, remove from right needs to merge with last middle child
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        context.nonLeafBlockBuilder(1, [context.leafBlockBuilder([21, 22])], 2),
        6
      );
      expect(t.remove(4)).toBe(11);
      expect(t.length).toBe(5);
      expect(t.left.children).toEqual([1, 2]);
      expect(t.middle).toBeUndefined();
      expect(t.right.children).toEqual([21, 22, 12]);
    }
  });

  it('source', () => {
    {
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        undefined,
        4
      );
      expect(t.source).toBeUndefined();
    }
    {
      const source = context.leafTree(
        context.leafBlock([1, 2]),
        context.leafBlock([11, 12]),
        null
      );

      const t = context.leafTreeBuilderSource(source);
      expect(t.source).toBe(source);
    }
  });

  it('updateAt', () => {
    {
      // no middle
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        undefined,
        4
      );
      expect(t.updateAt(1, -1)).toBe(2);
      expect(t.get(1)).toBe(-1);
      expect(t.updateAt(2, (v) => v + 1)).toBe(11);
      expect(t.get(2)).toBe(12);
    }
    {
      // middle
      const t = context.leafTreeBuilder(
        context.leafBlockBuilder([1, 2]),
        context.leafBlockBuilder([11, 12]),
        context.nonLeafBlockBuilder(
          1,
          [context.leafBlockBuilder([21, 22, 23])],
          3
        ),
        7
      );
      expect(t.updateAt(1, -1)).toBe(2);
      expect(t.get(1)).toBe(-1);
      expect(t.updateAt(2, (v) => v + 1)).toBe(21);
      expect(t.get(2)).toBe(22);
      expect(t.updateAt(6, -2)).toBe(12);
      expect(t.get(6)).toBe(-2);
    }
  });
});
