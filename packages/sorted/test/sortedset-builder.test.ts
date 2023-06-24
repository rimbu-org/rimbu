import { Comp, Reducer } from '@rimbu/common';
import { SortedSet } from '@rimbu/sorted';
import type { SortedSetBuilder } from '@rimbu/sorted/set-custom';
import { Stream } from '@rimbu/stream';

function runWith(name: string, context: SortedSet.Context<number>) {
  describe('builder specific', () => {
    it('min', () => {
      const builder = context.builder();
      expect(builder.min()).toBe(undefined);
      expect(builder.min(1)).toBe(1);

      const [min, values] = Stream.randomInt(0, 100)
        .take(100)
        .reduceAll(Reducer.min(), Reducer.toArray<number>());

      builder.addAll(values);
      expect(builder.min()).toBe(min);
    });
    it('max', () => {
      const builder = context.builder();
      expect(builder.max()).toBe(undefined);
      expect(builder.max(1)).toBe(1);

      const [min, values] = Stream.randomInt(0, 100)
        .take(100)
        .reduceAll(Reducer.max(), Reducer.toArray<number>());

      builder.addAll(values);
      expect(builder.max()).toBe(min);
    });
    it('getAtIndex', () => {
      const builder = context.builder();
      expect(builder.getAtIndex(10)).toBe(undefined);
      expect(builder.getAtIndex(10, 1)).toBe(1);

      const values = Stream.randomInt(0, 100).take(100).toArray();
      builder.addAll(values);

      values.sort();
      const setValues = [...new Set(values.sort((a, b) => a - b))];

      setValues.forEach((v, i) => {
        expect(builder.getAtIndex(i)).toBe(v);
      });
    });
  });
}

runWith('SortedSet default', SortedSet.createContext());
runWith(
  'SortedSet block bits 2',
  SortedSet.createContext({ blockSizeBits: 2 })
);

describe('builder specific', () => {
  const context = SortedSet.createContext<number>({ blockSizeBits: 2 });

  it('check shape', () => {
    const builder = context.builder() as SortedSetBuilder<number>;
    builder.addAll([2, 5, 7, 8, 10, 12, 18, 20, 22, 25, 28]);
    builder.remove(7);
    builder.add(15);

    expect(builder.size).toBe(11);
    expect(builder.entries).toEqual([10, 20]);
    expect(builder.children.length).toBe(3);
    expect(builder.children[0].entries).toEqual([2, 5, 8]);
    expect(builder.children[1].entries).toEqual([12, 15, 18]);
    expect(builder.children[2].entries).toEqual([22, 25, 28]);
  });

  it('remove borrow left', () => {
    const builder = context.builder() as SortedSetBuilder<number>;
    builder.addAll([2, 5, 7, 8, 10, 12, 18, 20, 22, 25, 28]);
    builder.remove(7);
    builder.add(15);

    builder.removeAll([22, 25]);

    expect(builder.size).toBe(9);
    expect(builder.entries).toEqual([10, 18]);
    expect(builder.children.length).toBe(3);
    expect(builder.children[0].entries).toEqual([2, 5, 8]);
    expect(builder.children[1].entries).toEqual([12, 15]);
    expect(builder.children[2].entries).toEqual([20, 28]);
  });

  it('remove borrow right', () => {
    const builder = context.builder() as SortedSetBuilder<number>;
    builder.addAll([2, 5, 7, 8, 10, 12, 18, 20, 22, 25, 28]);
    builder.remove(7);
    builder.add(15);

    builder.removeAll([2, 5]);

    expect(builder.size).toBe(9);
    expect(builder.entries).toEqual([12, 20]);
    expect(builder.children.length).toBe(3);
    expect(builder.children[0].entries).toEqual([8, 10]);
    expect(builder.children[1].entries).toEqual([15, 18]);
    expect(builder.children[2].entries).toEqual([22, 25, 28]);
  });

  it('remove join left', () => {
    const builder = context.builder() as SortedSetBuilder<number>;
    builder.addAll([2, 5, 7, 8, 10, 12, 18, 20, 22, 25, 28]);
    builder.remove(7);
    builder.add(15);

    builder.removeAll([22, 25, 20]);

    expect(builder.size).toBe(8);
    expect(builder.entries).toEqual([10]);
    expect(builder.children.length).toBe(2);
    expect(builder.children[0].entries).toEqual([2, 5, 8]);
    expect(builder.children[1].entries).toEqual([12, 15, 18, 28]);
  });

  it('remove join right', () => {
    const builder = context.builder() as SortedSetBuilder<number>;
    builder.addAll([2, 5, 7, 8, 10, 12, 18, 20, 22, 25, 28]);
    builder.remove(7);
    builder.add(15);

    builder.removeAll([2, 5, 8]);

    expect(builder.size).toBe(8);
    expect(builder.entries).toEqual([20]);
    expect(builder.children.length).toBe(2);
    expect(builder.children[0].entries).toEqual([10, 12, 15, 18]);
    expect(builder.children[1].entries).toEqual([22, 25, 28]);
  });

  it('add give left', () => {
    const builder = context.builder() as SortedSetBuilder<number>;
    builder.addAll([2, 5, 7, 8, 10, 12, 18, 20, 22, 25, 28]);
    builder.remove(7);
    builder.add(15);

    builder.addAll([30, 32]);

    expect(builder.size).toBe(13);
    expect(builder.entries).toEqual([10, 22]);
    expect(builder.children.length).toBe(3);
    expect(builder.children[0].entries).toEqual([2, 5, 8]);
    expect(builder.children[1].entries).toEqual([12, 15, 18, 20]);
    expect(builder.children[2].entries).toEqual([25, 28, 30, 32]);
  });

  it('add give right', () => {
    const builder = context.builder() as SortedSetBuilder<number>;
    builder.addAll([2, 5, 7, 8, 10, 12, 18, 20, 22, 25, 28]);
    builder.remove(7);
    builder.add(15);

    builder.addAll([3, 4]);

    expect(builder.size).toBe(13);
    expect(builder.entries).toEqual([8, 20]);
    expect(builder.children.length).toBe(3);
    expect(builder.children[0].entries).toEqual([2, 3, 4, 5]);
    expect(builder.children[1].entries).toEqual([10, 12, 15, 18]);
    expect(builder.children[2].entries).toEqual([22, 25, 28]);
  });

  it('add split left', () => {
    const builder = context.builder() as SortedSetBuilder<number>;
    builder.addAll([2, 5, 7, 8, 10, 12, 18, 20, 22, 25, 28]);
    builder.remove(7);
    builder.add(15);

    builder.addAll([6, 14, 3]);

    expect(builder.size).toBe(14);
    expect(builder.entries).toEqual([5, 10, 20]);
    expect(builder.children.length).toBe(4);
    expect(builder.children[0].entries).toEqual([2, 3]);
    expect(builder.children[1].entries).toEqual([6, 8]);
    expect(builder.children[2].entries).toEqual([12, 14, 15, 18]);
    expect(builder.children[3].entries).toEqual([22, 25, 28]);
  });

  it('add split right', () => {
    const builder = context.builder() as SortedSetBuilder<number>;
    builder.addAll([2, 5, 7, 8, 10, 12, 18, 20, 22, 25, 28]);
    builder.remove(7);
    builder.add(15);

    builder.addAll([14, 23, 24]);

    expect(builder.size).toBe(14);
    expect(builder.entries).toEqual([10, 20, 24]);
    expect(builder.children.length).toBe(4);
    expect(builder.children[0].entries).toEqual([2, 5, 8]);
    expect(builder.children[1].entries).toEqual([12, 14, 15, 18]);
    expect(builder.children[2].entries).toEqual([22, 23]);
    expect(builder.children[3].entries).toEqual([25, 28]);
  });

  it('deleteMin', () => {
    const builder = context.builder() as SortedSetBuilder<number>;
    builder.addAll([2, 5, 7, 8, 10, 12, 18, 20, 22, 25, 28]);
    builder.remove(7);
    builder.add(15);

    const res = builder.deleteMin();
    expect(res).toBe(2);
    expect(builder.size).toBe(10);
    expect(builder.entries).toEqual([10, 20]);
    expect(builder.children[0].entries).toEqual([5, 8]);
  });

  it('deleteMax', () => {
    const builder = context.builder() as SortedSetBuilder<number>;
    builder.addAll([2, 5, 7, 8, 10, 12, 18, 20, 22, 25, 28]);
    builder.remove(7);
    builder.add(15);

    const res = builder.deleteMax();
    expect(res).toBe(28);
    expect(builder.size).toBe(10);
    expect(builder.entries).toEqual([10, 20]);
    expect(builder.children[2].entries).toEqual([22, 25]);
  });
});

class Letter {
  constructor(readonly name: string) {}
}

function createLetterComp(): Comp<Letter> {
  return {
    compare(value1: Letter, value2: Letter): number {
      return value1.name.localeCompare(value2.name, ['es']);
    },

    isComparable(obj): obj is Letter {
      return obj instanceof Letter;
    },
  };
}

describe('builder with classes', () => {
  it('add', () => {
    const comp = createLetterComp();

    const builder = SortedSet.createContext({
      comp,
    }).builder();

    const alpha = new Letter('Alpha');
    const beta = new Letter('Beta');

    const equalAlpha = new Letter(alpha.name);
    const equalBeta = new Letter(beta.name);

    expect(comp.compare(alpha, alpha)).toBe(0);
    expect(comp.compare(alpha, equalAlpha)).toBe(0);
    expect(comp.compare(beta, beta)).toBe(0);
    expect(comp.compare(beta, equalBeta)).toBe(0);
    expect(comp.compare(alpha, beta)).not.toBe(0);

    expect(builder.add(alpha)).toBe(true);
    expect(builder.add(beta)).toBe(true);

    expect(builder.add(alpha)).toBe(false);

    expect(builder.add(equalAlpha)).toBe(false);
    expect(builder.add(equalBeta)).toBe(false);

    const actualSet = builder.build();
    expect(actualSet.size).toBe(2);
  });
});
