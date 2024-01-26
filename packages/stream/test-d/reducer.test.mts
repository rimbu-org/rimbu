import { Stream } from '@rimbu/stream';
import { expectAssignable, expectType } from 'tsd';

import { Reducer } from '../src/main/index.mjs';

expectType<Reducer<number, [number[], number]>>(
  Reducer.combine([Reducer.toArray(), Reducer.sum])
);

expectType<[number[], number]>(
  Stream.of(1, 2).reduce(Reducer.combine([Reducer.toArray(), Reducer.sum]))
);

expectAssignable<Reducer<number, { a: number[]; s: number }>>(
  Reducer.combine({
    a: Reducer.toArray(),
    s: Reducer.sum,
  })
);

expectAssignable<{ a: number[]; s: number }>(
  Stream.of(1, 2).reduce(
    Reducer.combine({
      a: Reducer.toArray(),
      s: Reducer.sum,
    })
  )
);

expectType<string>(Stream.of(1, 2, 3).reduce(Reducer.sum.pipe(Reducer.join())));

expectType<number>(
  Stream.of(1, 2, 3).reduce(Reducer.sum.chain(Reducer.product))
);
