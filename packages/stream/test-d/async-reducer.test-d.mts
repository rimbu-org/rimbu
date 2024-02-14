import { AsyncStream, Reducer } from '@rimbu/stream';
import { expectAssignable, expectType } from 'tsd';

import { AsyncReducer } from '../src/main/index.mjs';

// AsyncReducer.combine shapes
expectType<AsyncReducer<number, [number[], number]>>(
  AsyncReducer.combine([Reducer.toArray<number>(), Reducer.sum])
);

expectType<Promise<[number[], number]>>(
  AsyncStream.of(1, 2).reduce(
    AsyncReducer.combine([Reducer.toArray<number>(), Reducer.sum])
  )
);

expectAssignable<AsyncReducer<number, { a: number[]; s: number }>>(
  AsyncReducer.combine({
    a: Reducer.toArray<number>(),
    s: Reducer.sum,
  })
);

expectAssignable<Promise<{ a: number[]; s: number }>>(
  AsyncStream.of(1, 2).reduce(
    AsyncReducer.combine({
      a: Reducer.toArray<number>(),
      s: Reducer.sum,
    })
  )
);

// AsyncReducer.combineFirstDone
expectType<AsyncReducer<number, number | undefined>>(
  AsyncReducer.race([Reducer.sum, Reducer.product])
);

expectType<AsyncReducer<number, number>>(
  AsyncReducer.race([Reducer.sum, Reducer.product], 5)
);

// AsyncReducer.groupBy
expectType<AsyncReducer<string, Map<number, string[]>>>(
  AsyncReducer.groupBy((value: string) => value.length)
);

expectType<AsyncReducer<string, string>>(
  AsyncReducer.groupBy((value: string) => value.length, {
    collector: Reducer.join<[number, string]>(),
  })
);

// AsyncReducer.partition
expectType<AsyncReducer<number, [number[], number[]]>>(
  AsyncReducer.partition<number>(() => true)
);

expectType<AsyncReducer<number, [Set<number>, string]>>(
  AsyncReducer.partition(() => true, {
    collectorTrue: Reducer.toJSSet<number>(),
    collectorFalse: Reducer.join<number>(),
  })
);

// AsyncReducer methods

// .chain()
expectType<Promise<number>>(
  AsyncStream.of(1, 2, 3).reduce(
    AsyncReducer.first<number>().chain(AsyncReducer.min(5))
  )
);
expectType<Promise<number[]>>(
  AsyncStream.of(1, 2, 3).reduce(
    AsyncReducer.first<number>().chain(Reducer.sum, Reducer.toArray<number>())
  )
);

// .collectInput
expectType<AsyncReducer<string, number>>(
  AsyncReducer.max(5).collectInput<string>((v) => v.length)
);

// .compile
expectType<Promise<AsyncReducer.Instance<number, number | undefined>>>(
  AsyncReducer.first<number>().compile()
);

// .dropInput
expectType<AsyncReducer<number, number>>(AsyncReducer.min(5).dropInput(5));

// .flatMapInput
expectType<AsyncReducer<string, number[]>>(
  AsyncReducer.from(Reducer.toArray<number>()).flatMapInput<string>(() => [
    1, 2,
  ])
);

// .filterInput
expectType<AsyncReducer<number | string, Array<number | string>>>(
  AsyncReducer.from(Reducer.toArray<number | string>()).filterInput(() => true)
);
expectType<AsyncReducer<number | string, Array<number | string>>>(
  AsyncReducer.from(Reducer.toArray<number | string>()).filterInput(
    () => true,
    { negate: true }
  )
);

expectType<AsyncReducer<string, Array<number | string>>>(
  AsyncReducer.from(Reducer.toArray<number | string>()).filterInput(
    (v): v is string => true
  )
);
expectType<AsyncReducer<number, Array<number | string>>>(
  AsyncReducer.from(Reducer.toArray<number | string>()).filterInput(
    (v): v is string => true,
    {
      negate: true,
    }
  )
);

// .takeInput
expectType<AsyncReducer<number, number[]>>(
  AsyncReducer.from(Reducer.toArray<number>()).takeInput(5)
);

// .takeOutput
expectType<AsyncReducer<number, number[]>>(
  AsyncReducer.from(Reducer.toArray<number>()).takeOutput(5)
);

// .takeOutputWhile
expectType<AsyncReducer<number, number[]>>(
  AsyncReducer.from(Reducer.toArray<number>()).takeOutputUntil(() => true)
);

// .mapInput
expectType<AsyncReducer<string, number[]>>(
  AsyncReducer.from(Reducer.toArray<number>()).mapInput<string>((v) => v.length)
);

// .mapOutput
expectType<AsyncReducer<string, number>>(
  AsyncReducer.from(Reducer.toArray<string>()).mapOutput((v) => v.length)
);

// .pipe()
expectType<Promise<string>>(
  AsyncStream.of(1, 2, 3).reduce(
    AsyncReducer.from(Reducer.sum).pipe(Reducer.join<number>())
  )
);
expectType<Promise<boolean>>(
  AsyncStream.of(1, 2, 3).reduce(
    AsyncReducer.from(Reducer.sum).pipe(
      Reducer.toArray<number>(),
      Reducer.nonEmpty
    )
  )
);

// .sliceInput
expectType<AsyncReducer<number, number[]>>(
  AsyncReducer.from(Reducer.toArray<number>()).sliceInput(5, 3)
);
