import { Stream } from '@rimbu/stream';
import { expectType } from 'tsd';

import { Reducer } from '@rimbu/common';

expectType<Reducer<number, [number[], number]>>(
  Reducer.combineArr(Reducer.toArray(), Reducer.sum)
);

expectType<[number[], number]>(
  Stream.of(1, 2).reduce(Reducer.combineArr(Reducer.toArray(), Reducer.sum))
);

expectType<Reducer<number, { a: number[]; s: number }>>(
  Reducer.combineObj({
    a: Reducer.toArray(),
    s: Reducer.sum,
  })
);

expectType<{ a: number[]; s: number }>(
  Stream.of(1, 2).reduce(
    Reducer.combineObj({
      a: Reducer.toArray(),
      s: Reducer.sum,
    })
  )
);
