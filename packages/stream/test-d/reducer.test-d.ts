import { expectTypeOf } from 'bun:test';

import { Stream } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

//Variance
expectTypeOf(Reducer.sum).toExtend<Reducer<number, number | string>>();
expectTypeOf(Reducer.sum).not.toExtend<Reducer<number | string, number>>();

// Reducer.combine shapes
expectTypeOf(
	Reducer.combine([Reducer.toArray<number>(), Reducer.sum]),
).toEqualTypeOf<Reducer<number, [number[], number]>>();

expectTypeOf(
	Stream.of(1, 2).reduce([Reducer.toArray<number>(), Reducer.sum]),
).toEqualTypeOf<[number[], number]>();

expectTypeOf(
	Reducer.combine({
		a: Reducer.toArray(),
		s: Reducer.sum,
	}),
).toExtend<Reducer<number, { a: number[]; s: number }>>();

expectTypeOf(
	Stream.of(1, 2).reduce(
		Reducer.combine({
			a: Reducer.toArray<number>(),
			s: Reducer.sum,
		}),
	),
).toExtend<{ a: number[]; s: number }>();

// Reducer.race
expectTypeOf(Reducer.race([Reducer.sum, Reducer.product])).toEqualTypeOf<
	Reducer<number, number | undefined>
>();

expectTypeOf(Reducer.race([Reducer.sum, Reducer.product], 5)).toEqualTypeOf<
	Reducer<number, number>
>();

// Reducer.groupBy
expectTypeOf(Reducer.groupBy((value: string) => value.length)).toEqualTypeOf<
	Reducer<string, Map<number, string[]>>
>();

expectTypeOf(
	Reducer.groupBy((value: string) => value.length, {
		collector: Reducer.join(),
	}),
).toEqualTypeOf<Reducer<string, string>>();

expectTypeOf(
	Reducer.groupBy((value: string) => value.length, {
		collector: Reducer.join<[number, string]>(),
	}),
).toEqualTypeOf<Reducer<string, string>>();

// Reducer.toArray
expectTypeOf(Reducer.toArray<number>()).toEqualTypeOf<
	Reducer<number, number[]>
>();

// Reducer.partition
expectTypeOf(Reducer.partition<number>(() => true)).toEqualTypeOf<
	Reducer<number, [number[], number[]]>
>();

expectTypeOf(
	Reducer.partition(() => true, {
		collectorTrue: Reducer.toJSSet<number>(),
		collectorFalse: Reducer.join<number>(),
	}),
).toEqualTypeOf<Reducer<number, [Set<number>, string]>>();

expectTypeOf(
	Reducer.partition((v: number | string): v is number => true),
).toEqualTypeOf<Reducer<number | string, [number[], string[]]>>();
expectTypeOf(
	Reducer.partition((v: number | string): v is number => true, {
		collectorTrue: Reducer.toJSSet<number>(),
		collectorFalse: Reducer.join(),
	}),
).toEqualTypeOf<Reducer<number | string, [Set<number>, string]>>();

// Reducer methods

// .chain()
expectTypeOf(
	Stream.of(1, 2, 3).reduce(Reducer.sum.chain([Reducer.product])),
).toEqualTypeOf<number>();
expectTypeOf(
	Stream.of(1, 2, 3).reduce(
		Reducer.sum.chain([Reducer.product, Reducer.count]),
	),
).toEqualTypeOf<number>();

// .collectInput
expectTypeOf(
	Reducer.toArray<number>().collectInput<string>((v) => v.length),
).toEqualTypeOf<Reducer<string, number[]>>();

// .compile
expectTypeOf(Reducer.join<number>().compile()).toEqualTypeOf<
	Reducer.Instance<number, string>
>();

// .dropInput
expectTypeOf(Reducer.toArray<number>().dropInput(5)).toEqualTypeOf<
	Reducer<number, number[]>
>();

// .flatMapInput
expectTypeOf(
	Reducer.toArray<number>().flatMapInput<string>(() => [1, 2]),
).toEqualTypeOf<Reducer<string, number[]>>();

// .filterInput
expectTypeOf(
	Reducer.toArray<number | string>().filterInput(() => true),
).toEqualTypeOf<Reducer<number | string, Array<number | string>>>();
expectTypeOf(
	Reducer.toArray<number | string>().filterInput(() => true, { negate: true }),
).toEqualTypeOf<Reducer<number | string, Array<number | string>>>();

expectTypeOf(
	Reducer.toArray<number | string>().filterInput((v): v is string => true),
).toEqualTypeOf<Reducer<string, Array<number | string>>>();
expectTypeOf(
	Reducer.toArray<number | string>().filterInput((v): v is string => true, {
		negate: true,
	}),
).toEqualTypeOf<Reducer<number, Array<number | string>>>();

// .takeInput
expectTypeOf(Reducer.toArray<number>().takeInput(5)).toEqualTypeOf<
	Reducer<number, number[]>
>();

// .takeOutput
expectTypeOf(Reducer.toArray<number>().takeOutput(5)).toEqualTypeOf<
	Reducer<number, number[]>
>();

// .takeOutputWhile
expectTypeOf(
	Reducer.toArray<number>().takeOutputUntil(() => true),
).toEqualTypeOf<Reducer<number, number[]>>();

// .mapInput
expectTypeOf(
	Reducer.toArray<number>().mapInput<string>((v) => v.length),
).toEqualTypeOf<Reducer<string, number[]>>();

// .mapOutput
expectTypeOf(
	Reducer.toArray<string>().mapOutput((v) => v.length),
).toEqualTypeOf<Reducer<string, number>>();

// .pipe()
expectTypeOf(
	Stream.of(1, 2, 3).reduce(Reducer.pipe(Reducer.sum, Reducer.join())),
).toEqualTypeOf<string>();
expectTypeOf(
	Stream.of(1, 2, 3).reduce(
		Reducer.pipe(Reducer.sum, Reducer.toArray(), Reducer.nonEmpty),
	),
).toEqualTypeOf<boolean>();

// .sliceInput
expectTypeOf(Reducer.toArray<number>().sliceInput({ start: 5, amount: 3 })).toEqualTypeOf<
	Reducer<number, number[]>
>();
