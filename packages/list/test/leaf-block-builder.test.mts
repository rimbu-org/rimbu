import { LeafTreeBuilder, ListContext } from '../src/custom/index.mjs';

const context = new ListContext(2);

function createBlockBuilder<T>(...elems: T[]) {
  return context.leafBlockBuilder(elems);
}

describe('LeafBlockBuilder', () => {
  it('append', () => {
    {
      const b = context.leafBlockBuilder([1, 2]);
      b.append(10);
      expect(b.children).toEqual([1, 2, 10]);
    }
    {
      const b = context.leafBlockBuilderSource(context.leafBlock([1, 2]));
      b.append(10);
      expect(b.children).toEqual([1, 2, 10]);
    }
  });

  it('build', () => {
    {
      const b = createBlockBuilder(1);
      expect(b.build()).toEqual(context.leafBlock([1]));
    }
    {
      const b = createBlockBuilder(1, 2, 3, 4, 5);
      expect(b.build()).toEqual(context.leafBlock([1, 2, 3, 4, 5]));
    }
    {
      const s = context.reversedLeaf([1, 2, 3]);
      const b = s.toBuilder();
      expect(b.build()).toBe(s);
    }
  });

  it('buildMap', () => {
    {
      const b = createBlockBuilder(1);
      expect(b.buildMap((v) => v + 1)).toEqual(context.leafBlock([2]));
    }
    {
      const b = createBlockBuilder(1, 2, 3, 4, 5);
      expect(b.buildMap((v) => v + 1)).toEqual(
        context.leafBlock([2, 3, 4, 5, 6])
      );
    }
    {
      const b = context.leafBlockBuilderSource(
        context.leafBlock([1, 2, 3, 4, 5])
      );
      expect(b.buildMap((v) => v + 1)).toEqual(
        context.leafBlock([2, 3, 4, 5, 6])
      );
    }
  });

  it('children get', () => {
    {
      const children = [1];
      const b = context.leafBlockBuilder(children);
      expect(b.children).toBe(children);
      expect(b.source).toBeUndefined();
    }
    {
      const children = [1, 2, 3];
      const s = context.leafBlock(children);
      const b = context.leafBlockBuilderSource(s);

      expect(b.children).toEqual(children);
      expect(b.children).not.toBe(children);
      expect(b.source).toBe(s);
    }
    {
      const children = [1, 2, 3];
      const s = context.reversedLeaf(children);
      const b = context.leafBlockBuilderSource(s);

      expect(b.children).toEqual([...children].reverse());
      expect(b.source).toBe(s);
    }
  });

  it('children set', () => {
    {
      const b = context.leafBlockBuilder([1]);
      const children = [2, 3];
      b.children = children;
      expect(b.children).toBe(children);
      expect(b.source).toBeUndefined();
    }
    {
      const source = context.leafBlock([1, 2]);
      const b = context.leafBlockBuilderSource(source);
      expect(b.source).toBe(source);
      expect(b.children).toEqual(source.children);
      expect(b.children).not.toBe(source.children);
      const children = [3, 4];
      b.children = children;
      expect(b.source).toBeUndefined();
      expect(b.children).toBe(children);
    }
  });

  it('concat', () => {
    {
      const b = context.leafBlockBuilder([1, 2, 3]);
      b.concat(context.leafBlockBuilder([5, 6]));
      expect(b.children).toEqual([1, 2, 3, 5, 6]);
    }
    {
      const b = context.leafBlockBuilderSource(context.leafBlock([1, 2, 3]));
      b.concat(context.leafBlockBuilderSource(context.leafBlock([5, 6])));
      expect(b.children).toEqual([1, 2, 3, 5, 6]);
    }
  });

  it('copy', () => {
    {
      const b = context.leafBlockBuilder([1, 2]);
      const children = [3, 4];
      const n = b.copy(children);
      expect(n.children).toBe(children);
    }
    {
      const b = context.leafBlockBuilderSource(context.leafBlock([1, 2]));
      const children = [3, 4];
      const n = b.copy(children);
      expect(n.children).toBe(children);
    }
  });

  it('dropFirst', () => {
    {
      const b = context.leafBlockBuilder([1, 2, 3]);
      expect(b.dropFirst()).toBe(1);
      expect(b.children).toEqual([2, 3]);
    }
    {
      const b = context.leafBlockBuilderSource(context.leafBlock([1, 2, 3]));
      expect(b.dropFirst()).toBe(1);
      expect(b.children).toEqual([2, 3]);
    }
  });

  it('dropLast', () => {
    {
      const b = context.leafBlockBuilder([1, 2, 3]);
      expect(b.dropLast()).toBe(3);
      expect(b.children).toEqual([1, 2]);
    }
    {
      const b = context.leafBlockBuilderSource(context.leafBlock([1, 2, 3]));
      expect(b.dropLast()).toBe(3);
      expect(b.children).toEqual([1, 2]);
    }
  });

  it('forEach', () => {
    {
      const b = context.leafBlockBuilder([1, 2, 3]);
      const cb = vi.fn();
      b.forEach(cb);
      expect(cb).toBeCalledTimes(3);
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
      const b = context.leafBlockBuilderSource(context.leafBlock([1, 2, 3]));
      const cb = vi.fn();
      b.forEach(cb);
      expect(cb).toBeCalledTimes(3);
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
      {
        const b = context.leafBlockBuilder([1, 2]);
        expect(b.get(1)).toBe(2);
      }
      {
        const b = context.leafBlockBuilderSource(context.leafBlock([1, 2]));
        expect(b.get(1)).toBe(2);
      }
    }
  });

  it('insert', () => {
    {
      const b = context.leafBlockBuilder([1, 2]);
      b.insert(1, 10);
      expect(b.children).toEqual([1, 10, 2]);
      b.insert(0, 11);
      expect(b.children).toEqual([11, 1, 10, 2]);
      b.insert(4, 12);
      expect(b.children).toEqual([11, 1, 10, 2, 12]);
    }
    {
      const b = context.leafBlockBuilderSource(context.leafBlock([1, 2]));
      b.insert(1, 10);
      expect(b.children).toEqual([1, 10, 2]);
      b.insert(0, 11);
      expect(b.children).toEqual([11, 1, 10, 2]);
      b.insert(4, 12);
      expect(b.children).toEqual([11, 1, 10, 2, 12]);
    }
  });

  it('length', () => {
    {
      const b = context.leafBlockBuilder([1, 2]);
      expect(b.length).toBe(2);
    }
    {
      const b = context.leafBlockBuilderSource(context.leafBlock([1, 2]));
      expect(b.length).toBe(2);
    }
  });

  it('level', () => {
    expect(createBlockBuilder(1).level).toBe(0);
  });

  it('normalized', () => {
    {
      const b = context.leafBlockBuilder([]);
      expect(b.normalized()).toBeUndefined();
    }
    {
      const b = context.leafBlockBuilder([1, 2]);
      expect(b.normalized()).toBe(b);
    }
    {
      const b = context.leafBlockBuilder([1, 2, 3, 4, 5]);
      const n = b.normalized() as LeafTreeBuilder<number>;
      expect(n).toBeInstanceOf(LeafTreeBuilder);
      expect(n.left.children).toEqual([1, 2]);
      expect(n.right.children).toEqual([3, 4, 5]);
      expect(n.middle).toBeUndefined();
    }
  });

  it('nrChildren', () => {
    {
      const b = context.leafBlockBuilder([1, 2]);
      expect(b.nrChildren).toBe(2);
    }
    {
      const b = context.leafBlockBuilderSource(context.leafBlock([1, 2]));
      expect(b.nrChildren).toBe(2);
    }
  });

  it('prepend', () => {
    {
      const b = context.leafBlockBuilder([1, 2]);
      b.prepend(10);
      expect(b.children).toEqual([10, 1, 2]);
    }
    {
      const b = context.leafBlockBuilderSource(context.leafBlock([1, 2]));
      b.prepend(10);
      expect(b.children).toEqual([10, 1, 2]);
    }
  });

  it('remove', () => {
    {
      const b = context.leafBlockBuilder([1, 2, 3]);
      b.remove(1);
      expect(b.children).toEqual([1, 3]);
    }
    {
      const b = context.leafBlockBuilderSource(context.leafBlock([1, 2, 3]));
      b.remove(1);
      expect(b.children).toEqual([1, 3]);
    }
  });

  it('splitRight', () => {
    {
      const b = context.leafBlockBuilder([1, 2, 3]);
      const r = b.splitRight();
      expect(b.children).toEqual([1]);
      expect(r.children).toEqual([2, 3]);
    }
    {
      const b = context.leafBlockBuilderSource(context.leafBlock([1, 2, 3]));
      const r = b.splitRight();
      expect(b.children).toEqual([1]);
      expect(r.children).toEqual([2, 3]);
    }
  });

  it('updateAt', () => {
    {
      const b = context.leafBlockBuilder([1, 2]);
      expect(b.updateAt(1, 3)).toBe(2);
      expect(b.children).toEqual([1, 3]);
      expect(b.updateAt(0, (v) => v + 1)).toBe(1);
      expect(b.children).toEqual([2, 3]);
    }
    {
      const b = context.leafBlockBuilderSource(context.leafBlock([1, 2]));
      expect(b.updateAt(1, 3)).toBe(2);
      expect(b.children).toEqual([1, 3]);
      expect(b.updateAt(0, (v) => v + 1)).toBe(1);
      expect(b.children).toEqual([2, 3]);
    }
  });
});
