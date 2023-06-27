import { Stream, List } from '@rimbu/core';
import b from 'benny';

const blockSizes = [4, 5, 6];
const sizePowers = [6, 12, 16];
const sizes = sizePowers.map((p) => Math.pow(2, p));

function runBench(
  name: string,
  f: (list: List<number>, size: number) => () => void
): void {
  sizes.forEach((size) => {
    const lists = blockSizes.map((bs) => ({
      bs,
      list: List.createContext({ blockSizeBits: bs }).from(
        Stream.range({ amount: size })
      ),
    }));

    const nameSize = `${name}-${size}`;

    b.suite(
      `${nameSize}`,

      ...lists.map(({ list, bs }) => b.add(`${name}-${bs}`, f(list, size))),

      b.cycle(),
      b.complete(),
      b.save({ file: nameSize, version: '1.0.0' }),
      b.save({ file: nameSize, format: 'chart.html' })
    );
  });
}

function operation(value: number, index: number, halt: () => void): void {
  if (value + index < 0) halt();
}

function pred(_: number, index: number): boolean {
  return index % 2 === 0;
}

function inc(v: number, i: number): number {
  return v + i;
}

runBench('list-append', (list) => (): void => {
  list.append(-1);
});

runBench('list-concat', (list) => (): void => {
  list.concat(list);
});

runBench('list-drop', (list, size) => (): void => {
  list.drop(size / 2 + 1);
});

runBench('list-filter', (list) => (): void => {
  list.filter(pred);
});

runBench('list-first', (list) => (): void => {
  list.first();
});

runBench('list-flatMap', (list) => (): void => {
  list.flatMap((v) => [v, v]);
});

runBench('list-foreach', (list) => (): void => {
  list.forEach(operation);
});

runBench('list-get-start', (list) => (): void => {
  list.get(3);
});

runBench('list-get-middle', (list, size) => (): void => {
  list.get(size / 2);
});

runBench('list-get-end', (list, size) => (): void => {
  list.get(size - 3);
});

runBench('list-insert', (list, size) => (): void => {
  list.insert(size / 2, [-1, -2]);
});

runBench('list-last', (list) => (): void => {
  list.last();
});

runBench('list-map', (list) => (): void => {
  list.map(inc);
});

runBench('list-prepend', (list) => (): void => {
  list.prepend(-1);
});

runBench('list-remove', (list, size) => (): void => {
  list.remove(size / 2, 10);
});

runBench('list-reversed', (list) => (): void => {
  list.reversed();
});

runBench('list-slice', (list, size) => (): void => {
  list.slice({ start: size / 2, amount: 10 });
});

runBench('list-splice', (list, size) => (): void => {
  list.splice({ index: size / 2, remove: 10, insert: [-1, -2] });
});

runBench('list-take', (list, size) => (): void => {
  list.take(size / 2);
});

runBench('list-toArray', (list) => (): void => {
  list.toArray();
});

runBench('list-toString', (list) => (): void => {
  list.toString();
});
