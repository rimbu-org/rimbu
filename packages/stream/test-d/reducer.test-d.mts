import { Stream } from '@rimbu/stream';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';

import { Reducer } from '../src/main/index.mjs';

//Variance
expectAssignable<Reducer<number, number | string>>(Reducer.sum);
expectNotAssignable<Reducer<number | string, number>>(Reducer.sum);

// Reducer.combine shapes
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
      a: Reducer.toArray<number>(),
      s: Reducer.sum,
    })
  )
);

// Reducer.race
expectType<Reducer<number, number | undefined>>(
  Reducer.race([Reducer.sum, Reducer.product])
);

expectType<Reducer<number, number>>(
  Reducer.race([Reducer.sum, Reducer.product], 5)
);

// Reducer.groupBy
expectType<Reducer<string, Map<number, string[]>>>(
  Reducer.groupBy((value: string) => value.length)
);

expectType<Reducer<string, string>>(
  Reducer.groupBy((value: string) => value.length, {
    collector: Reducer.join(),
  })
);

expectType<Reducer<string, string>>(
  Reducer.groupBy((value: string) => value.length, {
    collector: Reducer.join<[number, string]>(),
  })
);

// Reducer.toArray
expectType<Reducer<number, number[]>>(Reducer.toArray<number>());

// Reducer.partition
expectType<Reducer<number, [number[], number[]]>>(
  Reducer.partition<number>(() => true)
);

expectType<Reducer<number, [Set<number>, string]>>(
  Reducer.partition(() => true, {
    collectorTrue: Reducer.toJSSet<number>(),
    collectorFalse: Reducer.join<number>(),
  })
);

expectType<Reducer<number | string, [number[], string[]]>>(
  Reducer.partition((v: number | string): v is number => true)
);
expectType<Reducer<number | string, [Set<number>, string]>>(
  Reducer.partition((v: number | string): v is number => true, {
    collectorTrue: Reducer.toJSSet<number>(),
    collectorFalse: Reducer.join(),
  })
);

// Reducer methods

// .chain()
expectType<number>(
  Stream.of(1, 2, 3).reduce(Reducer.sum.chain([Reducer.product]))
);
expectType<number>(
  Stream.of(1, 2, 3).reduce(Reducer.sum.chain([Reducer.product, Reducer.count]))
);

// .collectInput
expectType<Reducer<string, number[]>>(
  Reducer.toArray<number>().collectInput<string>((v) => v.length)
);

// .compile
expectType<Reducer.Instance<number, string>>(Reducer.join<number>().compile());

// .dropInput
expectType<Reducer<number, number[]>>(Reducer.toArray<number>().dropInput(5));

// .flatMapInput
expectType<Reducer<string, number[]>>(
  Reducer.toArray<number>().flatMapInput<string>(() => [1, 2])
);

// .filterInput
expectType<Reducer<number | string, Array<number | string>>>(
  Reducer.toArray<number | string>().filterInput(() => true)
);
expectType<Reducer<number | string, Array<number | string>>>(
  Reducer.toArray<number | string>().filterInput(() => true, { negate: true })
);

expectType<Reducer<string, Array<number | string>>>(
  Reducer.toArray<number | string>().filterInput((v): v is string => true)
);
expectType<Reducer<number, Array<number | string>>>(
  Reducer.toArray<number | string>().filterInput((v): v is string => true, {
    negate: true,
  })
);

// .takeInput
expectType<Reducer<number, number[]>>(Reducer.toArray<number>().takeInput(5));

// .takeOutput
expectType<Reducer<number, number[]>>(Reducer.toArray<number>().takeOutput(5));

// .takeOutputWhile
expectType<Reducer<number, number[]>>(
  Reducer.toArray<number>().takeOutputUntil(() => true)
);

// .mapInput
expectType<Reducer<string, number[]>>(
  Reducer.toArray<number>().mapInput<string>((v) => v.length)
);

// .mapOutput
expectType<Reducer<string, number>>(
  Reducer.toArray<string>().mapOutput((v) => v.length)
);

// .pipe()
expectType<string>(
  Stream.of(1, 2, 3).reduce(Reducer.pipe(Reducer.sum, Reducer.join()))
);
expectType<boolean>(
  Stream.of(1, 2, 3).reduce(
    Reducer.pipe(Reducer.sum, Reducer.toArray(), Reducer.nonEmpty)
  )
);

// .sliceInput
expectType<Reducer<number, number[]>>(
  Reducer.toArray<number>().sliceInput(5, 3)
);
