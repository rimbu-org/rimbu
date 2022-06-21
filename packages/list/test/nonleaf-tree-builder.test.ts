import {
  LeafBlock,
  LeafBlockBuilder,
  ListContext,
  NonLeafBlockBuilder,
  NonLeafTree,
  NonLeafTreeBuilder,
} from '@rimbu/list/custom';
import { Stream } from '@rimbu/stream';

const context = new ListContext(2);

describe('NonLeafTreeBuilder', () => {
  it('build', () => {
    {
      // source
      const lb = context.leafBlock([1, 2, 3, 4]);
      const nlb = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [lb, lb, lb],
        1
      );
      const source = context.nonLeafTree<number, LeafBlock<number>>(
        nlb,
        nlb,
        null,
        1
      );
      const b = context.nonLeafTreeBuilderSource(source);
      expect(b.build()).toBe(source);
    }
    {
      // no source
      const lb = context.leafBlockBuilder([1, 2, 3, 4]);
      const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [lb, lb, lb],
        12
      );
      const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 24);
      const r = b.build();
      expect(r.length).toBe(24);
      expect(r).toBeInstanceOf(NonLeafTree);
    }
  });

  it('buildMap', () => {
    {
      // source
      const lb = context.leafBlock([1, 2, 3, 4]);
      const nlb = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [lb, lb, lb],
        1
      );
      const source = context.nonLeafTree<number, LeafBlock<number>>(
        nlb,
        nlb,
        null,
        1
      );
      const b = context.nonLeafTreeBuilderSource(source);
      const r = b.buildMap((v) => v + 1);
      expect(r).toBeInstanceOf(NonLeafTree);
      expect(r.toArray()).toEqual(
        source
          .stream()
          .map((v) => v + 1)
          .toArray()
      );
    }
    {
      // no source
      const lb = context.leafBlockBuilder([1, 2, 3, 4]);
      const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [lb, lb, lb],
        12
      );
      const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 24);
      const r = b.buildMap((v) => v + 1);
      expect(r).toBeInstanceOf(NonLeafTree);
      expect(r.toArray()).toEqual(Stream.of(2, 3, 4, 5).repeat(6).toArray());
    }
  });

  it('context', () => {
    const lb = context.leafBlockBuilder([1, 2, 3, 4]);
    const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [lb, lb, lb],
      12
    );
    const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 24);
    expect(b.context).toBe(context);
  });

  it('first', () => {
    const first = context.leafBlockBuilder([1, 2, 3, 4]);
    const second = context.leafBlockBuilder([11, 12, 13, 14]);

    const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [first, second],
      8
    );

    const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 16);
    expect(b.first()).toBe(first);
  });

  it('get', () => {
    {
      // no source
      const first = context.leafBlockBuilder([1, 2, 3, 4]);
      const second = context.leafBlockBuilder([11, 12, 13, 14]);

      const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [first, second],
        8
      );

      const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 16);
      expect(b.get(0)).toBe(1);
      expect(b.get(3)).toBe(4);
      expect(b.get(4)).toBe(11);
      expect(b.get(7)).toBe(14);
    }
    {
      // source
      const lb = context.leafBlock([1, 2, 3, 4]);
      const nlb = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [lb, lb, lb],
        1
      );
      const source = context.nonLeafTree<number, LeafBlock<number>>(
        nlb,
        nlb,
        null,
        1
      );
      const b = context.nonLeafTreeBuilderSource(source);
      expect(b.get(0)).toBe(1);
    }
  });

  it('getChildLength', () => {
    const lb = context.leafBlockBuilder([1, 2, 3, 4]);
    const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [lb, lb, lb],
      12
    );
    const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 24);
    expect(b.getChildLength(lb)).toBe(4);
  });

  it('length', () => {
    {
      // no source
      const lb = context.leafBlockBuilder([1, 2, 3, 4]);
      const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [lb, lb, lb],
        12
      );
      const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 24);
      expect(b.length).toBe(24);
    }
    {
      // source
      const lb = context.leafBlock([1, 2, 3, 4]);
      const nlb = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [lb, lb, lb],
        1
      );
      const source = context.nonLeafTree<number, LeafBlock<number>>(
        nlb,
        nlb,
        null,
        1
      );
      const b = context.nonLeafTreeBuilderSource(source);
      expect(b.length).toBe(24);
    }
  });

  it('last', () => {
    const first = context.leafBlockBuilder([1, 2, 3, 4]);
    const second = context.leafBlockBuilder([11, 12, 13, 14]);

    const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [first, second],
      8
    );

    const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 16);
    expect(b.last()).toBe(second);
  });

  it('level', () => {
    const lb = context.leafBlockBuilder([1, 2, 3, 4]);
    const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [lb, lb, lb],
      12
    );
    const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 24);
    expect(b.level).toBe(1);
  });

  it('modifyFirstChild', () => {
    const first = context.leafBlockBuilder([1, 2, 3, 4]);
    const second = context.leafBlockBuilder([11, 12, 13, 14]);

    const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [first, second],
      8
    );

    const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 16);

    expect(
      b.modifyFirstChild((c) => {
        expect(c).toBe(first);
        return undefined;
      })
    ).toBe(undefined);
    expect(b.length).toBe(16);
    expect(
      b.modifyFirstChild((c) => {
        return 2;
      })
    ).toBe(2);
    expect(b.length).toBe(18);
  });

  it('modifyLastChild', () => {
    const first = context.leafBlockBuilder([1, 2, 3, 4]);
    const second = context.leafBlockBuilder([11, 12, 13, 14]);

    const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [first, second],
      8
    );

    const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 16);

    expect(
      b.modifyLastChild((c) => {
        expect(c).toBe(second);
        return undefined;
      })
    ).toBe(undefined);
    expect(b.length).toBe(16);
    expect(
      b.modifyLastChild((c) => {
        return 2;
      })
    ).toBe(2);
    expect(b.length).toBe(18);
  });

  it('normalized', () => {
    {
      // no normalization
      const first = context.leafBlockBuilder([1, 2, 3, 4]);
      const second = context.leafBlockBuilder([11, 12, 13, 14]);

      const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [first, second, first, second],
        16
      );

      const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 16);
      const n = b.normalized();
      expect(n).toBeInstanceOf(NonLeafTreeBuilder);
    }
    {
      // combine left and right
      const first = context.leafBlockBuilder([1, 2]);
      const second = context.leafBlockBuilder([11, 12]);

      const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [first, second],
        8
      );

      const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 16);
      const n = b.normalized();
      expect(n).toBeInstanceOf(NonLeafBlockBuilder);
    }
    {
      // normalize middle
      const first = context.leafBlockBuilder([1, 2]);
      const second = context.leafBlockBuilder([11, 12]);

      const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [first, second],
        8
      );
      const nlb2 = context.nonLeafBlockBuilder<
        number,
        NonLeafBlockBuilder<number, any>
      >(2, [nlb, nlb], 16);
      nlb2.normalized = jest.fn();

      const b = context.nonLeafTreeBuilder(1, nlb, nlb, nlb2, 16);
      const n = b.normalized();
      expect(nlb2.normalized).toBeCalledTimes(1);
      expect(n).toBeInstanceOf(NonLeafTreeBuilder);
    }
  });

  it('prepareMutate', () => {
    const lb = context.leafBlock([1, 2, 3, 4]);
    const nlb = context.nonLeafBlock<number, LeafBlock<number>>(
      12,
      [lb, lb, lb],
      1
    );
    const source = context.nonLeafTree<number, LeafBlock<number>>(
      nlb,
      nlb,
      null,
      1
    );
    const b = context.nonLeafTreeBuilderSource(source);
    b.prepareMutate();
    expect(b.source).toBeUndefined();
    expect(b.left.children[0].children).toEqual(
      source.left.children[0].children
    );
    expect(b.right.children[0].children).toEqual(
      source.right.children[0].children
    );
    expect(b.middle).toBeUndefined();
  });

  it('prepareMutate is called', () => {
    const lb = context.leafBlockBuilder([1, 2, 3, 4]);
    const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
      1,
      [lb, lb, lb],
      12
    );
    const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 24);
    const fn = jest.fn();
    b.prepareMutate = fn;
    b.left;
    expect(fn).toBeCalledTimes(1);
    fn.mockReset();
    b.right;
    expect(fn).toBeCalledTimes(1);
    fn.mockReset();
    b.middle;
    expect(fn).toBeCalledTimes(1);
    fn.mockReset();
    b.left = nlb;
    expect(fn).toBeCalledTimes(1);
    fn.mockReset();
    b.right = nlb;
    expect(fn).toBeCalledTimes(1);
    fn.mockReset();
    b.middle = context.nonLeafBlockBuilder(2, [nlb], 12);
    expect(fn).toBeCalledTimes(1);
  });

  it('source', () => {
    {
      // no source
      const lb = context.leafBlockBuilder([1, 2, 3, 4]);
      const nlb = context.nonLeafBlockBuilder<number, LeafBlockBuilder<number>>(
        1,
        [lb, lb, lb],
        12
      );
      const b = context.nonLeafTreeBuilder(1, nlb, nlb, undefined, 24);
      expect(b.source).toBeUndefined();
    }
    {
      // source
      const lb = context.leafBlock([1, 2, 3, 4]);
      const nlb = context.nonLeafBlock<number, LeafBlock<number>>(
        12,
        [lb, lb, lb],
        1
      );
      const source = context.nonLeafTree<number, LeafBlock<number>>(
        nlb,
        nlb,
        null,
        1
      );
      const b = context.nonLeafTreeBuilderSource(source);
      expect(b.source).toBe(source);
    }
  });
});
