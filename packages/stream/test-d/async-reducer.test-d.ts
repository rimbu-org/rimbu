import { expectTypeOf } from 'bun:test';

import { AsyncStream } from '@rimbu/stream/async';
import { AsyncReducer } from '@rimbu/stream/async/reducer';
import { Reducer } from '@rimbu/stream/reducer';

// Variance
expectTypeOf(null as any as AsyncReducer<number, boolean>).toExtend<
	AsyncReducer<number, boolean | string>
>();
expectTypeOf(null as any as AsyncReducer<number, boolean>).not.toExtend<
	AsyncReducer<number | string, boolean>
>();

// AsyncReducer.combine shapes
expectTypeOf(
	AsyncReducer.combine([Reducer.toArray<number>(), Reducer.sum]),
).toEqualTypeOf<AsyncReducer<number, [number[], number]>>();

expectTypeOf(
	AsyncStream.of(1, 2).reduce(
		AsyncReducer.combine([Reducer.toArray<number>(), Reducer.sum]),
	),
).toEqualTypeOf<Promise<[number[], number]>>();

expectTypeOf(
	AsyncReducer.combine({
		a: Reducer.toArray<number>(),
		s: Reducer.sum,
	}),
).toExtend<AsyncReducer<number, { a: number[]; s: number }>>();

expectTypeOf(
	AsyncStream.of(1, 2).reduce(
		AsyncReducer.combine({ a: Reducer.toArray<number>(), s: Reducer.sum }),
	),
).toExtend<Promise<{ a: number[]; s: number }>>();

// AsyncReducer.race
expectTypeOf(AsyncReducer.race([Reducer.sum, Reducer.product])).toEqualTypeOf<
	AsyncReducer<number, number | undefined>
>();

expectTypeOf(
	AsyncReducer.race([Reducer.sum, Reducer.product], 5),
).toEqualTypeOf<AsyncReducer<number, number>>();

// AsyncReducer.groupBy
expectTypeOf(
	AsyncReducer.groupBy((value: string) => value.length),
).toEqualTypeOf<AsyncReducer<string, Map<number, string[]>>>();

expectTypeOf(
	AsyncReducer.groupBy((value: string) => value.length, {
		collector: Reducer.join<[number, string]>(),
	}),
).toEqualTypeOf<AsyncReducer<string, string>>();

// AsyncReducer.partition
expectTypeOf(AsyncReducer.partition<number>(() => true)).toEqualTypeOf<
	AsyncReducer<number, [number[], number[]]>
>();

expectTypeOf(
	AsyncReducer.partition(() => true, {
		collectorTrue: Reducer.toJSSet<number>(),
		collectorFalse: Reducer.join<number>(),
	}),
).toEqualTypeOf<AsyncReducer<number, [Set<number>, string]>>();

expectTypeOf(
	AsyncReducer.partition((v: number | string): v is number => true),
).toEqualTypeOf<AsyncReducer<number | string, [number[], string[]]>>();
expectTypeOf(
	AsyncReducer.partition((v: number | string): v is number => true, {
		collectorTrue: Reducer.toJSSet<number>(),
		collectorFalse: Reducer.join<string>(),
	}),
).toEqualTypeOf<AsyncReducer<number | string, [Set<number>, string]>>();

// AsyncReducer methods

// .chain()
expectTypeOf(
	AsyncStream.of(1, 2, 3).reduce(
		AsyncReducer.first<number>().chain([AsyncReducer.min(5)]),
	),
).toEqualTypeOf<Promise<number>>();
expectTypeOf(
	AsyncStream.of(1, 2, 3).reduce(
		AsyncReducer.first<number>().chain([Reducer.sum, Reducer.count]),
	),
).toEqualTypeOf<Promise<number>>();

// .collectInput
expectTypeOf(
	AsyncReducer.max(5).collectInput<string>((v) => v.length),
).toEqualTypeOf<AsyncReducer<string, number>>();

// .compile
expectTypeOf(AsyncReducer.first<number>().compile()).toEqualTypeOf<
	Promise<AsyncReducer.Instance<number, number | undefined>>
>();

// .dropInput
expectTypeOf(AsyncReducer.min(5).dropInput(5)).toEqualTypeOf<
	AsyncReducer<number, number>
>();

// .flatMapInput
expectTypeOf(
	AsyncReducer.from(Reducer.toArray<number>()).flatMapInput<string>(() => [
		1, 2,
	]),
).toEqualTypeOf<AsyncReducer<string, number[]>>();

// .filterInput
expectTypeOf(
	AsyncReducer.from(Reducer.toArray<number | string>()).filterInput(() => true),
).toEqualTypeOf<AsyncReducer<number | string, Array<number | string>>>();
expectTypeOf(
	AsyncReducer.from(Reducer.toArray<number | string>()).filterInput(
		() => true,
		{ negate: true },
	),
).toEqualTypeOf<AsyncReducer<number | string, Array<number | string>>>();

expectTypeOf(
	AsyncReducer.from(Reducer.toArray<number | string>()).filterInput(
		(v): v is string => true,
	),
).toEqualTypeOf<AsyncReducer<string, Array<number | string>>>();
expectTypeOf(
	AsyncReducer.from(Reducer.toArray<number | string>()).filterInput(
		(v): v is string => true,
		{ negate: true },
	),
).toEqualTypeOf<AsyncReducer<number, Array<number | string>>>();

// .takeInput
expectTypeOf(
	AsyncReducer.from(Reducer.toArray<number>()).takeInput(5),
).toEqualTypeOf<AsyncReducer<number, number[]>>();

// .takeOutput
expectTypeOf(
	AsyncReducer.from(Reducer.toArray<number>()).takeOutput(5),
).toEqualTypeOf<AsyncReducer<number, number[]>>();

// .takeOutputWhile
expectTypeOf(
	AsyncReducer.from(Reducer.toArray<number>()).takeOutputUntil(() => true),
).toEqualTypeOf<AsyncReducer<number, number[]>>();

// .mapInput
expectTypeOf(
	AsyncReducer.from(Reducer.toArray<number>()).mapInput<string>(
		(v) => v.length,
	),
).toEqualTypeOf<AsyncReducer<string, number[]>>();

// .mapOutput
expectTypeOf(
	AsyncReducer.from(Reducer.toArray<string>()).mapOutput((v) => v.length),
).toEqualTypeOf<AsyncReducer<string, number>>();

// .pipe()
expectTypeOf(
	AsyncStream.of(1, 2, 3).reduce(
		AsyncReducer.pipe(Reducer.sum, Reducer.join<number>()),
	),
).toEqualTypeOf<Promise<string>>();
expectTypeOf(
	AsyncStream.of(1, 2, 3).reduce(
		AsyncReducer.pipe(Reducer.sum, Reducer.toArray<number>(), Reducer.nonEmpty),
	),
).toEqualTypeOf<Promise<boolean>>();

// .sliceInput
expectTypeOf(
	AsyncReducer.from(Reducer.toArray<number>()).sliceInput(5, 3),
).toEqualTypeOf<AsyncReducer<number, number[]>>();
