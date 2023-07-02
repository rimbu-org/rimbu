import {
  LeafBlock,
  LeafBlockBuilder,
  ListContext,
  NonLeafBlock,
  NonLeafBlockBuilder,
  NonLeafTreeBuilder,
} from '../src/custom/index.mjs';

const context = new ListContext(2);

describe('NonLeafBlockBuilder', () => {
  it('append', () => {
    const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [
        context.leafBlockBuilder([1, 2, 3, 4]),
        context.leafBlockBuilder([11, 12, 13, 14]),
      ],
      8
    );
    const newChild = context.leafBlockBuilder([21, 22, 23, 24]);
    b.append(newChild);
    expect(b.children.length).toBe(3);
    expect(b.length).toBe(12);
    expect(b.children[2]).toBe(newChild);
  });

  it('build', () => {
    {
      // no source
      const first = context.leafBlockBuilder([1, 2, 3, 4]);
      const second = context.leafBlockBuilder([11, 12, 13, 14]);

      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [first, second],
        8
      );
      const r = b.build();
      expect(r.length).toBe(8);
      expect(r.children[0].children).toEqual([1, 2, 3, 4]);
      expect(r.children[1].children).toEqual([11, 12, 13, 14]);
    }
    {
      // source
      const lb = context.leafBlock([1, 2, 3, 4]);
      const source = context.nonLeafBlock<number, LeafBlock<number>>(
        16,
        [lb, lb, lb, lb],
        1
      );
      const b = context.nonLeafBlockBuilderSource(source);
      expect(b.build()).toBe(source);
    }
  });

  it('buildMap', () => {
    {
      // no source
      const first = context.leafBlockBuilder([1, 2, 3, 4]);
      const second = context.leafBlockBuilder([11, 12, 13, 14]);

      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [first, second],
        8
      );
      const r = b.buildMap((v) => v + 1);
      expect(r.length).toBe(8);
      expect(r.children[0].children).toEqual([2, 3, 4, 5]);
      expect(r.children[1].children).toEqual([12, 13, 14, 15]);
    }
    {
      // source
      const lb = context.leafBlock([1, 2, 3, 4]);
      const source = context.nonLeafBlock<number, LeafBlock<number>>(
        8,
        [lb, lb],
        1
      );
      const b = context.nonLeafBlockBuilderSource(source);
      const r = b.buildMap((v) => v + 1);
      expect(r.length).toBe(8);
      expect(r.children[0].children).toEqual([2, 3, 4, 5]);
      expect(r.children[1].children).toEqual([2, 3, 4, 5]);
    }
  });

  it('children', () => {
    {
      const child = context.leafBlockBuilder([1, 2, 3, 4]);
      const t = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [child],
        4
      );
      expect(t.children[0]).toBe(child);
    }
    {
      const source = context.nonLeafBlock<number, LeafBlock<number>>(
        4,
        [context.leafBlock([1, 2, 3, 4])],
        1
      );
      const b = context.nonLeafBlockBuilderSource(source);
      expect(b.source).not.toBeUndefined();
      expect(b.children[0]).toBeInstanceOf(LeafBlockBuilder);
      expect(b.source).toBeUndefined();
    }
    {
      const source = context.nonLeafBlock<number, LeafBlock<number>>(
        4,
        [context.leafBlock([1, 2, 3, 4])],
        1
      );
      const b = context.nonLeafBlockBuilderSource(source);
      expect(b.source).not.toBeUndefined();
      b.children = [];
      expect(b.source).toBeUndefined();
    }
  });

  it('concat', () => {
    const first = context.leafBlockBuilder([1, 2, 3, 4]);
    const second = context.leafBlockBuilder([11, 12, 13, 14]);

    const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [first, second],
      8
    );
    b.concat(b);
    expect(b.length).toBe(16);
    expect(b.nrChildren).toBe(4);
    expect(b.children).toEqual([first, second, first, second]);
  });

  it('context', () => {
    const b = context.nonLeafBlockBuilder(1, [], 0);
    expect(b.context).toBe(context);
  });

  it('copy', () => {
    const child = context.leafBlockBuilder([1, 2, 3, 4]);
    const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [child],
      4
    );
    const c = b.copy([], 0);
    expect(c.children).toEqual([]);
    expect(c.length).toBe(0);
  });

  it('dropFirst', () => {
    const first = context.leafBlockBuilder([1, 2, 3, 4]);
    const second = context.leafBlockBuilder([11, 12, 13, 14]);

    const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [first, second],
      8
    );
    expect(b.dropFirst()).toBe(first);
    expect(b.nrChildren).toBe(1);
    expect(b.length).toBe(4);
    expect(b.children[0]).toBe(second);
  });

  it('dropLast', () => {
    const first = context.leafBlockBuilder([1, 2, 3, 4]);
    const second = context.leafBlockBuilder([11, 12, 13, 14]);

    const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [first, second],
      8
    );
    expect(b.dropLast()).toBe(second);
    expect(b.nrChildren).toBe(1);
    expect(b.length).toBe(4);
    expect(b.children[0]).toBe(first);
  });

  it('first', () => {
    const first = context.leafBlockBuilder([1, 2, 3, 4]);
    const second = context.leafBlockBuilder([11, 12, 13, 14]);

    const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [first, second],
      8
    );
    expect(b.first()).toBe(first);
  });

  it('forEach', () => {
    {
      // regular
      const first = context.leafBlockBuilder([1, 2, 3, 4]);
      const second = context.leafBlockBuilder([11, 12, 13, 14]);

      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [first, second],
        8
      );
      const cb = vi.fn();
      b.forEach(cb);
      expect(cb).toBeCalledTimes(8);
      expect(cb.mock.calls[1][0]).toBe(2);
      expect(cb.mock.calls[1][1]).toBe(1);

      cb.mockReset();

      b.forEach((_, __, halt) => {
        halt();
        cb();
      });

      expect(cb).toBeCalledTimes(1);
    }
    {
      // irregular
      const first = context.leafBlockBuilder([1, 2, 3]);
      const second = context.leafBlockBuilder([11, 12, 13, 14]);

      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [first, second],
        7
      );
      const cb = vi.fn();
      b.forEach(cb);
      expect(cb).toBeCalledTimes(7);
      expect(cb.mock.calls[1][0]).toBe(2);
      expect(cb.mock.calls[1][1]).toBe(1);

      cb.mockReset();

      b.forEach((_, __, halt) => {
        halt();
        cb();
      });

      expect(cb).toBeCalledTimes(1);
    }
  });

  it('get', () => {
    {
      // single regular block
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [context.leafBlockBuilder([1, 2, 3, 4])],
        4
      );
      expect(b.get(0)).toBe(1);
      expect(b.get(3)).toBe(4);
    }
    {
      // multiple regular blocks
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [
          context.leafBlockBuilder([1, 2, 3, 4]),
          context.leafBlockBuilder([11, 12, 13, 14]),
        ],
        8
      );
      expect(b.get(0)).toBe(1);
      expect(b.get(3)).toBe(4);
      expect(b.get(4)).toBe(11);
      expect(b.get(7)).toBe(14);
    }
    {
      // multiple irregular blocks
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [
          context.leafBlockBuilder([1, 2, 3]),
          context.leafBlockBuilder([11, 12, 13]),
          context.leafBlockBuilder([21, 22, 23]),
        ],
        9
      );
      expect(b.get(0)).toBe(1);
      expect(b.get(2)).toBe(3);
      expect(b.get(3)).toBe(11);
      expect(b.get(5)).toBe(13);
      expect(b.get(6)).toBe(21);
      expect(b.get(8)).toBe(23);
    }
    {
      // source
      const lb = context.leafBlock([1, 2, 3, 4]);
      const source = context.nonLeafBlock<number, LeafBlock<number>>(
        8,
        [lb, lb],
        1
      );
      const b = context.nonLeafBlockBuilderSource(source);
      expect(b.get(1)).toBe(2);
    }
  });

  it('getCoordinates', () => {
    {
      // single regular block
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [context.leafBlockBuilder([1, 2, 3, 4])],
        4
      );
      expect(b.getCoordinates(0)).toEqual([0, 0]);
      expect(b.getCoordinates(3)).toEqual([0, 3]);
    }
    {
      // multiple regular blocks
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [
          context.leafBlockBuilder([1, 2, 3, 4]),
          context.leafBlockBuilder([11, 12, 13, 14]),
        ],
        8
      );
      expect(b.getCoordinates(0)).toEqual([0, 0]);
      expect(b.getCoordinates(3)).toEqual([0, 3]);
      expect(b.getCoordinates(4)).toEqual([1, 0]);
      expect(b.getCoordinates(7)).toEqual([1, 3]);
      expect(b.getCoordinates(8)).toEqual([1, 4]);
    }
    {
      // multiple irregular blocks
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [
          context.leafBlockBuilder([1, 2, 3]),
          context.leafBlockBuilder([11, 12, 13]),
          context.leafBlockBuilder([21, 22, 23]),
        ],
        9
      );
      expect(b.getCoordinates(0)).toEqual([0, 0]);
      expect(b.getCoordinates(2)).toEqual([0, 2]);
      expect(b.getCoordinates(3)).toEqual([1, 0]);
      expect(b.getCoordinates(5)).toEqual([1, 2]);
      expect(b.getCoordinates(6)).toEqual([2, 0]);
      expect(b.getCoordinates(8)).toEqual([2, 2]);
      expect(b.getCoordinates(9)).toEqual([2, 3]);
    }
    {
      // regular level 2
      const lb = context.leafBlock([1, 2, 3, 4]);
      const nlb = context.nonLeafBlock<number, LeafBlock<number>>(
        16,
        [lb, lb, lb, lb],
        1
      );
      const source = context.nonLeafBlock<
        number,
        NonLeafBlock<number, LeafBlock<number>>
      >(64, [nlb, nlb, nlb, nlb], 2);

      const b = context.nonLeafBlockBuilderSource(source);
      expect(b.getCoordinates(0)).toEqual([0, 0]);
      expect(b.getCoordinates(3)).toEqual([0, 3]);
      expect(b.getCoordinates(4)).toEqual([0, 4]);
      expect(b.getCoordinates(7)).toEqual([0, 7]);
      expect(b.getCoordinates(8)).toEqual([0, 8]);
      expect(b.getCoordinates(15)).toEqual([0, 15]);
      expect(b.getCoordinates(16)).toEqual([1, 0]);
      expect(b.getCoordinates(31)).toEqual([1, 15]);
      expect(b.getCoordinates(32)).toEqual([2, 0]);
      expect(b.getCoordinates(47)).toEqual([2, 15]);
      expect(b.getCoordinates(48)).toEqual([3, 0]);
      expect(b.getCoordinates(63)).toEqual([3, 15]);
      expect(b.getCoordinates(64)).toEqual([3, 16]);
    }
    {
      // irregular level 2
      const lb = context.leafBlock([1, 2, 3, 4]);
      const nlb = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [lb, lb, lb],
        1
      );
      const source = context.nonLeafBlock<
        number,
        NonLeafBlock<number, LeafBlock<number>>
      >(36, [nlb, nlb, nlb], 2);

      const b = context.nonLeafBlockBuilderSource(source);
      expect(b.getCoordinates(0)).toEqual([0, 0]);
      expect(b.getCoordinates(3)).toEqual([0, 3]);
      expect(b.getCoordinates(4)).toEqual([0, 4]);
      expect(b.getCoordinates(7)).toEqual([0, 7]);
      expect(b.getCoordinates(8)).toEqual([0, 8]);
      expect(b.getCoordinates(11)).toEqual([0, 11]);
      expect(b.getCoordinates(12)).toEqual([1, 0]);
      expect(b.getCoordinates(23)).toEqual([1, 11]);
      expect(b.getCoordinates(24)).toEqual([2, 0]);
      expect(b.getCoordinates(35)).toEqual([2, 11]);
      expect(b.getCoordinates(36)).toEqual([2, 12]);
    }
  });

  it('insert', () => {
    {
      // no need to normalize
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [
          context.leafBlockBuilder([1, 2, 3]),
          context.leafBlockBuilder([11, 12, 13, 14]),
        ],
        7
      );
      b.insert(1, 21);
      expect(b.nrChildren).toBe(2);
      expect(b.get(1)).toBe(21);
    }
    {
      // shift to left child
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [
          context.leafBlockBuilder([1, 2, 3, 4]),
          context.leafBlockBuilder([11, 12, 13]),
        ],
        7
      );
      b.insert(1, 21);
      expect(b.nrChildren).toBe(2);
      expect(b.get(1)).toBe(21);
      expect(b.children[0].children).toEqual([1, 21, 2, 3]);
      expect(b.children[1].children).toEqual([4, 11, 12, 13]);
    }
    {
      // shift to right child
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [
          context.leafBlockBuilder([1, 2, 3]),
          context.leafBlockBuilder([11, 12, 13, 14]),
        ],
        7
      );
      b.insert(4, 21);
      expect(b.nrChildren).toBe(2);
      expect(b.get(4)).toBe(21);
      expect(b.children[0].children).toEqual([1, 2, 3, 11]);
      expect(b.children[1].children).toEqual([21, 12, 13, 14]);
    }
    {
      // split child
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [
          context.leafBlockBuilder([1, 2, 3, 4]),
          context.leafBlockBuilder([11, 12, 13, 14]),
        ],
        8
      );
      b.insert(4, 21);
      expect(b.nrChildren).toBe(3);
      expect(b.get(4)).toBe(21);
      expect(b.children[0].children).toEqual([1, 2, 3, 4]);
      expect(b.children[1].children).toEqual([21, 11]);
      expect(b.children[2].children).toEqual([12, 13, 14]);
    }
  });

  it('last', () => {
    const first = context.leafBlockBuilder([1, 2, 3, 4]);
    const second = context.leafBlockBuilder([11, 12, 13, 14]);

    const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [first, second],
      8
    );
    expect(b.last()).toBe(second);
  });

  it('level', () => {
    const b = context.nonLeafBlockBuilder(1, [], 0);
    expect(b.length).toBe(0);
  });

  it('level', () => {
    const b = context.nonLeafBlockBuilder(1, [], 0);
    expect(b.level).toBe(1);
  });

  it('modifyFirstChild', () => {
    const first = context.leafBlockBuilder([1, 2, 3, 4]);
    const second = context.leafBlockBuilder([11, 12, 13, 14]);

    const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [first, second],
      8
    );
    expect(
      b.modifyFirstChild((c) => {
        expect(c).toBe(first);
        return undefined;
      })
    ).toBe(undefined);
    expect(b.length).toBe(8);
    expect(
      b.modifyFirstChild((c) => {
        return 2;
      })
    ).toBe(2);
    expect(b.length).toBe(10);
  });

  it('modifyLastChild', () => {
    const first = context.leafBlockBuilder([1, 2, 3, 4]);
    const second = context.leafBlockBuilder([11, 12, 13, 14]);

    const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [first, second],
      8
    );
    expect(
      b.modifyLastChild((c) => {
        expect(c).toBe(second);
        return undefined;
      })
    ).toBe(undefined);
    expect(b.length).toBe(8);
    expect(
      b.modifyLastChild((c) => {
        return 2;
      })
    ).toBe(2);
    expect(b.length).toBe(10);
  });

  it('normalized', () => {
    {
      // empty
      const t = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [],
        0
      );
      const n = t.normalized();
      expect(n).toBeUndefined();
    }
    {
      // regular, no normalization
      const lb = context.leafBlock([1, 2, 3, 4]);
      const source = context.nonLeafBlock<number, LeafBlock<number>>(
        16,
        [lb, lb, lb, lb],
        1
      );
      const b = context.nonLeafBlockBuilderSource(source);
      const n = b.normalized() as NonLeafBlockBuilder<number, any>;
      expect(n).toBeInstanceOf(NonLeafBlockBuilder);
      expect(n.level).toBe(1);
      expect(n.nrChildren).toBe(4);
    }
    {
      // irregular, no normalization
      const lb = context.leafBlock([1, 2, 3]);
      const source = context.nonLeafBlock<number, LeafBlock<number>>(
        16,
        [lb, lb, lb, lb],
        1
      );
      const b = context.nonLeafBlockBuilderSource(source);
      const n = b.normalized() as NonLeafBlockBuilder<number, any>;
      expect(n).toBeInstanceOf(NonLeafBlockBuilder);
      expect(n.level).toBe(1);
      expect(n.nrChildren).toBe(4);
    }
    {
      // child merge has been disabled
      // // irregular, merge
      // const lb = context.leafBlock([1]);
      // const source = context.nonLeafBlock<number, LeafBlock<number>>(
      //   4,
      //   [lb, lb, lb, lb],
      //   1
      // );
      // const b = context.nonLeafBlockBuilderSource(source);
      // const n = b.normalized() as NonLeafBlockBuilder<number, any>;
      // expect(n).toBeInstanceOf(NonLeafBlockBuilder);
      // expect(n.level).toBe(1);
      // expect(n.nrChildren).toBe(1);
    }
    {
      // split
      const lb = context.leafBlock([1, 2, 3, 4]);
      const source = context.nonLeafBlock<number, LeafBlock<number>>(
        20,
        [lb, lb, lb, lb, lb],
        1
      );
      const b = context.nonLeafBlockBuilderSource(source);
      const n = b.normalized() as NonLeafTreeBuilder<number, any>;
      expect(n).toBeInstanceOf(NonLeafTreeBuilder);
      expect(n.level).toBe(1);
      expect(n.left.nrChildren).toBe(2);
      expect(n.right.nrChildren).toBe(3);
    }
  });

  it('nrChildren', () => {
    {
      const child = context.leafBlockBuilder([1, 2, 3, 4]);
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [child],
        4
      );
      expect(b.nrChildren).toBe(1);
    }
    {
      const source = context.nonLeafBlock<number, LeafBlock<number>>(
        4,
        [context.leafBlock([1, 2, 3, 4])],
        1
      );
      const b = context.nonLeafBlockBuilderSource(source);
      expect(b.nrChildren).toBe(1);
      expect(b.source).not.toBeUndefined();
    }
  });

  it('prepend', () => {
    const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [
        context.leafBlockBuilder([1, 2, 3, 4]),
        context.leafBlockBuilder([11, 12, 13, 14]),
      ],
      8
    );
    const newChild = context.leafBlockBuilder([21, 22, 23, 24]);
    b.prepend(newChild);
    expect(b.children.length).toBe(3);
    expect(b.length).toBe(12);
    expect(b.children[0]).toBe(newChild);
  });

  it('remove', () => {
    {
      // no need to normalize
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [
          context.leafBlockBuilder([1, 2, 3, 4]),
          context.leafBlockBuilder([11, 12, 13, 14]),
        ],
        8
      );
      expect(b.remove(1)).toBe(2);
      expect(b.nrChildren).toBe(2);
      expect(b.children[0].children).toEqual([1, 3, 4]);
      expect(b.children[1].children).toEqual([11, 12, 13, 14]);
    }
    {
      // shift from left
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [
          context.leafBlockBuilder([1, 2, 3, 4]),
          context.leafBlockBuilder([11, 12]),
        ],
        6
      );
      expect(b.remove(4)).toBe(11);
      expect(b.nrChildren).toBe(2);
      expect(b.children[0].children).toEqual([1, 2, 3]);
      expect(b.children[1].children).toEqual([4, 12]);
    }
    {
      // shift from right
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [
          context.leafBlockBuilder([1, 2]),
          context.leafBlockBuilder([11, 12, 13, 14]),
        ],
        6
      );
      expect(b.remove(1)).toBe(2);
      expect(b.nrChildren).toBe(2);
      expect(b.children[0].children).toEqual([1, 11]);
      expect(b.children[1].children).toEqual([12, 13, 14]);
    }
    {
      // merge with right
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [context.leafBlockBuilder([1, 2]), context.leafBlockBuilder([11, 12])],
        4
      );
      expect(b.remove(1)).toBe(2);
      expect(b.nrChildren).toBe(1);
      expect(b.children[0].children).toEqual([1, 11, 12]);
    }
    {
      // merge with left
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [context.leafBlockBuilder([1, 2]), context.leafBlockBuilder([11, 12])],
        4
      );
      expect(b.remove(2)).toBe(11);
      expect(b.nrChildren).toBe(1);
      expect(b.children[0].children).toEqual([1, 2, 12]);
    }
  });

  it('source', () => {
    {
      const b = context.nonLeafBlockBuilder(1, [], 0);
      expect(b.source).toBeUndefined();
    }
    {
      const source = context.nonLeafBlock<number, LeafBlock<number>>(
        4,
        [context.leafBlock([1, 2, 3, 4])],
        1
      );
      const b = context.nonLeafBlockBuilderSource(source);
      expect(b.source).toBe(source);
    }
  });

  it('updateAt', () => {
    {
      // regular
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [
          context.leafBlockBuilder([1, 2, 3, 4]),
          context.leafBlockBuilder([11, 12, 13, 14]),
        ],
        8
      );
      expect(b.updateAt(0, -1)).toBe(1);
      expect(b.get(0)).toBe(-1);
      expect(b.updateAt(3, (v) => v + 1)).toBe(4);
      expect(b.get(3)).toBe(5);
      expect(b.updateAt(4, -2)).toBe(11);
      expect(b.get(4)).toBe(-2);
      expect(b.updateAt(7, (v) => v + 1)).toBe(14);
      expect(b.length).toBe(8);
    }
    {
      // irregular
      const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [
          context.leafBlockBuilder([1, 2, 3]),
          context.leafBlockBuilder([4, 11, 12]),
          context.leafBlockBuilder([13, 14]),
        ],
        8
      );
      expect(b.updateAt(0, -1)).toBe(1);
      expect(b.get(0)).toBe(-1);
      expect(b.updateAt(3, (v) => v + 1)).toBe(4);
      expect(b.get(3)).toBe(5);
      expect(b.updateAt(4, -2)).toBe(11);
      expect(b.get(4)).toBe(-2);
      expect(b.updateAt(7, (v) => v + 1)).toBe(14);
      expect(b.length).toBe(8);
    }
  });

  it('splitRight', () => {
    const block = context.leafBlockBuilder([1, 2, 3, 4]);

    const b = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [block, block, block, block, block],
      20
    );

    const r = b.splitRight();
    expect(b.nrChildren).toBe(2);
    expect(b.length).toBe(8);
    expect(r.nrChildren).toBe(3);
    expect(r.length).toBe(12);
  });
});
