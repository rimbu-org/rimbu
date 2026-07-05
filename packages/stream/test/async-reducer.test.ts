import { describe, expect, it, vi } from 'bun:test';

import { Comp } from '@rimbu/common/comp';
import { AsyncStream } from '@rimbu/stream/async';
import { AsyncReducer } from '@rimbu/stream/async/reducer';
import { Reducer } from '@rimbu/stream/reducer';

describe('AsyncReducer', () => {
	const FB = 'a';
	const fallback = async () => FB;

	it('create', () => {
		const r = AsyncReducer.create<number, number>(
			async () => 5,
			async (v, n, i) => v + n + i,
			async (v) => v + 1,
		);
		expect(r.next(6, 7, 8, () => {})).resolves.toBe(6 + 7 + 8);
		expect(r.stateToResult(5, 0, false)).resolves.toBe(6);
	});

	it('createMono', () => {
		const r = AsyncReducer.createMono(
			async () => 5,
			async (v, n, i) => v + n + i,
			async (v) => v + 1,
		);
		expect(r.next(6, 7, 8, () => {})).resolves.toBe(6 + 7 + 8);
		expect(r.stateToResult(5, 0, false)).resolves.toBe(6);
	});

	it('createOutput', () => {
		const r = AsyncReducer.createOutput<number>(
			async () => 5,
			async (v, n, i) => v + n + i,
		);
		expect(r.next(6, 7, 8, () => {})).resolves.toBe(6 + 7 + 8);
		expect(r.stateToResult(5, 0, false)).toBe(5);
	});

	it('sum', () => {
		const s = AsyncStream.of(1, 2, 3);
		expect(s.reduce(AsyncReducer.from(Reducer.sum))).resolves.toBe(6);
	});

	it('product', () => {
		const s = AsyncStream.of(1, 2, 3);
		expect(s.reduce(AsyncReducer.from(Reducer.product))).resolves.toBe(6);
		expect(
			AsyncStream.of(5, 0, 4).reduce(AsyncReducer.from(Reducer.product)),
		).resolves.toBe(0);
	});

	it('average', () => {
		const s = AsyncStream.of(1, 2, 3);
		expect(s.reduce(AsyncReducer.from(Reducer.average))).resolves.toBe(2);
	});

	it('minBy', () => {
		const s = AsyncStream.of('be', 'T', 'Ad', 'Eha');
		expect(
			s.reduce(
				AsyncReducer.minBy(async (v1, v2) =>
					Comp.stringCaseInsensitive.compare(v1, v2),
				),
			),
		).resolves.toBe('Ad');

		expect(
			AsyncStream.empty<string>().reduce(
				AsyncReducer.minBy(
					async (v1, v2) => Comp.stringCaseInsensitive.compare(v1, v2),
					fallback,
				),
			),
		).resolves.toBe(FB);
	});

	it('min', () => {
		const s = AsyncStream.of(10, 5, 7, 2, 15, 4);
		expect(s.reduce(AsyncReducer.min())).resolves.toBe(2);

		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.min(fallback)),
		).resolves.toBe(FB);
	});

	it('maxBy', () => {
		const s = AsyncStream.of('be', 'T', 'Ad', 'Eha');
		expect(
			s.reduce(
				AsyncReducer.maxBy(async (v1, v2) =>
					Comp.stringCaseInsensitive.compare(v1, v2),
				),
			),
		).resolves.toBe('T');

		expect(
			AsyncStream.empty<string>().reduce(
				AsyncReducer.maxBy(
					async (v1, v2) => Comp.stringCaseInsensitive.compare(v1, v2),
					fallback,
				),
			),
		).resolves.toBe(FB);
	});

	it('max', () => {
		const s = AsyncStream.of(10, 5, 7, 2, 15, 4);
		expect(s.reduce(AsyncReducer.max())).resolves.toBe(15);

		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.max(fallback)),
		).resolves.toBe(FB);
	});

	it('join', () => {
		expect(
			AsyncStream.of(1, 2, 3).reduce(Reducer.join<number>()),
		).resolves.toBe('123');
		expect(
			AsyncStream.of(1, 2, 3).reduce(
				Reducer.join<number>({ start: '[', sep: ',', end: ']' }),
			),
		).resolves.toBe('[1,2,3]');
		expect(
			AsyncStream.of(1, 2, 3).reduce(
				Reducer.join<number>({ valueToString: (v) => `${v}${v}` }),
			),
		).resolves.toBe('112233');
	});

	it('first', () => {
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.first()),
		).resolves.toBe(undefined);
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.first(fallback)),
		).resolves.toBe(FB);
		expect(AsyncStream.of(1, 2, 3).reduce(AsyncReducer.first())).resolves.toBe(
			1,
		);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.first(fallback)),
		).resolves.toBe(1);
	});

	it('last', () => {
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.last()),
		).resolves.toBe(undefined);
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.last(fallback)),
		).resolves.toBe(FB);
		expect(AsyncStream.of(1, 2, 3).reduce(AsyncReducer.last())).resolves.toBe(
			3,
		);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.last(fallback)),
		).resolves.toBe(3);
	});

	it('single', () => {
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.single()),
		).resolves.toBe(undefined);
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.single('a')),
		).resolves.toBe('a');
		expect(AsyncStream.of(1, 2, 3).reduce(AsyncReducer.single())).resolves.toBe(
			undefined,
		);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.single('a')),
		).resolves.toBe('a');
		expect(AsyncStream.of(1).reduce(AsyncReducer.single())).resolves.toBe(1);
		expect(AsyncStream.of(1).reduce(AsyncReducer.single('a'))).resolves.toBe(1);
	});

	it('some', () => {
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.some(async (v) => v > 2)),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.some(async (v) => v > 2)),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.some(async (v) => v > 10)),
		).resolves.toBe(false);
	});

	it('every', () => {
		expect(
			AsyncStream.empty<number>().reduce(
				AsyncReducer.every(async (v) => v > 2),
			),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.every(async (v) => v > 2)),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.every(async (v) => v > 10)),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.every(async (v) => v > 0)),
		).resolves.toBe(true);

		expect(
			AsyncStream.empty<number>().reduce(
				AsyncReducer.every(async (v) => v <= 2, { negate: true }),
			),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3).reduce(
				AsyncReducer.every(async (v) => v <= 2, { negate: true }),
			),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(
				AsyncReducer.every(async (v) => v <= 10, { negate: true }),
			),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(
				AsyncReducer.every(async (v) => v <= 0, { negate: true }),
			),
		).resolves.toBe(true);
	});

	it('equals', () => {
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.equals([] as number[])),
		).resolves.toBe(true);
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.equals([1, 2, 3])),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.equals([] as number[])),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.equals([1, 2, 3])),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.equals([1, 2])),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.equals([1, 2, 3, 4])),
		).resolves.toBe(false);
	});

	it('startsWithSlice', () => {
		expect(
			AsyncStream.empty<number>().reduce(
				AsyncReducer.startsWithSlice([] as number[]),
			),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3).reduce(
				AsyncReducer.startsWithSlice([] as number[]),
			),
		).resolves.toBe(true);

		expect(
			AsyncStream.empty<number>().reduce(
				AsyncReducer.startsWithSlice([1, 2, 3]),
			),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2).reduce(AsyncReducer.startsWithSlice([1, 2, 3])),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.startsWithSlice([1, 2, 3])),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3, 4).reduce(
				AsyncReducer.startsWithSlice([1, 2, 3]),
			),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 1, 2, 3, 4).reduce(
				AsyncReducer.startsWithSlice([1, 2, 3]),
			),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(2, 1, 2, 3, 4).reduce(
				AsyncReducer.startsWithSlice([1, 2, 3]),
			),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(
				AsyncReducer.startsWithSlice([1, 2, 3], { amount: 2 }),
			),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3, 1, 2, 3).reduce(
				AsyncReducer.startsWithSlice([1, 2, 3], { amount: 2 }),
			),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3, 1, 2, 4).reduce(
				AsyncReducer.startsWithSlice([1, 2, 3], { amount: 2 }),
			),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3, 1, 2, 3, 1, 2, 3).reduce(
				AsyncReducer.startsWithSlice([1, 2, 3], { amount: 2 }),
			),
		).resolves.toBe(true);
	});

	it('endsWithSlice', () => {
		expect(
			AsyncStream.empty<number>().reduce(
				AsyncReducer.endsWithSlice([] as number[]),
			),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3).reduce(
				AsyncReducer.endsWithSlice([] as number[]),
			),
		).resolves.toBe(true);

		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.endsWithSlice([1])),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.endsWithSlice([1])),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.endsWithSlice([1, 2, 3])),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3, 4).reduce(AsyncReducer.endsWithSlice([1, 2, 3])),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.endsWithSlice([1, 2, 3, 4])),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.endsWithSlice([1, 2])),
		).resolves.toBe(false);

		expect(
			AsyncStream.of(1, 2, 3, 1, 2, 3).reduce(
				AsyncReducer.endsWithSlice([1, 2, 3], { amount: 2 }),
			),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3, 1, 2, 3).reduce(
				AsyncReducer.endsWithSlice([1, 2, 3], { amount: 3 }),
			),
		).resolves.toBe(false);

		expect(
			AsyncStream.of(1, 1, 2, 3).reduce(AsyncReducer.endsWithSlice([1, 2, 3])),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 1, 1, 2, 3).reduce(
				AsyncReducer.endsWithSlice([1, 2, 3]),
			),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 1, 2, 3).reduce(
				AsyncReducer.endsWithSlice([1, 2, 3]),
			),
		).resolves.toBe(true);
	});

	it('containsSlice', () => {
		expect(
			AsyncStream.empty<number>().reduce(
				AsyncReducer.containsSlice([] as number[]),
			),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3).reduce(
				AsyncReducer.containsSlice([] as number[]),
			),
		).resolves.toBe(true);

		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.containsSlice([1, 2])),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2).reduce(AsyncReducer.containsSlice([1, 2])),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3, 4).reduce(AsyncReducer.containsSlice([1, 2])),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3, 4).reduce(AsyncReducer.containsSlice([2, 3])),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3, 4).reduce(AsyncReducer.containsSlice([3, 4])),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3, 4).reduce(AsyncReducer.containsSlice([1, 4])),
		).resolves.toBe(false);

		expect(
			AsyncStream.of(1, 2, 3, 4).reduce(
				AsyncReducer.containsSlice([2, 3], { amount: 2 }),
			),
		).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 3, 4, 2, 3, 4).reduce(
				AsyncReducer.containsSlice([2, 3], { amount: 2 }),
			),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3, 4, 2, 3, 4).reduce(
				AsyncReducer.containsSlice([2, 3], { amount: 3 }),
			),
		).resolves.toBe(false);

		expect(
			AsyncStream.of(1, 1, 1, 2, 3, 4).reduce(
				AsyncReducer.containsSlice([1, 1, 2, 3]),
			),
		).resolves.toBe(true);
	});

	it('isEmpty', () => {
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.isEmpty),
		).resolves.toBe(true);
		expect(AsyncStream.of(1, 2, 3).reduce(AsyncReducer.isEmpty)).resolves.toBe(
			false,
		);
	});

	it('nonEmpty', () => {
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.nonEmpty),
		).resolves.toBe(false);
		expect(AsyncStream.of(1, 2, 3).reduce(AsyncReducer.nonEmpty)).resolves.toBe(
			true,
		);
	});

	it('race', () => {
		expect(
			AsyncStream.empty<number>().reduce(
				AsyncReducer.race([AsyncReducer.from(Reducer.sum)]),
			),
		).resolves.toBe(undefined);
		expect(
			AsyncStream.empty<number>().reduce(
				AsyncReducer.race([AsyncReducer.from(Reducer.sum)], 2),
			),
		).resolves.toBe(2);

		expect(
			AsyncStream.empty<number>().reduce(
				AsyncReducer.race([
					AsyncReducer.from(Reducer.sum).dropInput(2),
					Reducer.constant(2),
				]),
			),
		).resolves.toBe(2);

		expect(
			AsyncStream.of(1, 2, 3).reduce(
				AsyncReducer.race([
					AsyncReducer.from(Reducer.sum).dropInput(2),
					Reducer.constant(2),
				]),
			),
		).resolves.toBe(2);

		expect(
			AsyncStream.of(1, 2, 3).reduce(
				AsyncReducer.race([Reducer.constant(3), Reducer.constant(2)]),
			),
		).resolves.toBe(3);

		expect(
			AsyncStream.of(1, 2, 4).reduce(
				AsyncReducer.race([
					AsyncReducer.from(Reducer.sum).takeInput(3),
					Reducer.product.takeInput(3),
				]),
			),
		).resolves.toBe(7);

		expect(
			AsyncStream.of(1, 2, 4).reduce(
				AsyncReducer.race([
					Reducer.product.takeInput(3),
					AsyncReducer.from(Reducer.sum).takeInput(3),
				]),
			),
		).resolves.toBe(8);
	});

	it('filterInput', () => {
		const close = vi.fn();
		const sumDouble = AsyncReducer.createMono(
			async () => 0,
			async (c, v) => c + v,
			async (s) => s * 2,
			close,
		).filterInput((v) => v > 1);

		expect(AsyncStream.of(1, 2, 3).reduce(sumDouble)).resolves.toBe(10);
		expect(close).toBeCalledTimes(1);
	});

	it('filterInput throw', () => {
		const close = vi.fn();
		const sumDouble = AsyncReducer.createMono(
			async () => 0,
			async (c, v) => {
				throw Error('');
			},
			async (s) => s * 2,
			close,
		).filterInput((v) => v > 1);

		expect(AsyncStream.of(1, 2, 3).reduce(sumDouble)).rejects.toThrow();

		expect(close).toBeCalledTimes(1);
	});

	it('mapInput', () => {
		const close = vi.fn();
		const sumDouble = AsyncReducer.createMono(
			async () => 0,
			async (c, v) => c + v,
			async (s) => s * 2,
			close,
		).mapInput((v: string) => Number.parseInt(v));

		expect(AsyncStream.of('1', '2', '3').reduce(sumDouble)).resolves.toBe(12);
		expect(close).toBeCalledTimes(1);
	});

	it('flatMapInput', () => {
		const close = vi.fn();
		const sumDouble = AsyncReducer.createMono(
			async () => 0,
			async (c, v) => c + v,
			async (s) => s,
			close,
		).flatMapInput(async (v: string) => [
			Number.parseInt(v),
			Number.parseInt(v),
		]);

		expect(AsyncStream.of('1', '2', '3').reduce(sumDouble)).resolves.toBe(12);
		expect(close).toBeCalledTimes(1);
	});

	it('collectInput', () => {
		const close = vi.fn();
		const sumDouble = AsyncReducer.createMono(
			async () => 0,
			async (c, v) => c + v,
			async (s) => s * 2,
			close,
		).collectInput((v: string, _, skip, halt) => {
			const value = Number.parseInt(v);
			if (value === 1) return skip;
			if (value === 3) {
				halt();
				return skip;
			}
			return value;
		});

		expect(AsyncStream.of('1', '2', '3').reduce(sumDouble)).resolves.toBe(4);
		expect(close).toBeCalledTimes(1);
	});

	it('mapOutput', () => {
		const close = vi.fn();
		const sumDouble = AsyncReducer.createMono(
			async () => 0,
			async (c, v) => c + v,
			async (s) => s * 2,
			close,
		).mapOutput((v) => v / 2);

		expect(AsyncStream.of(1, 2, 3).reduce(sumDouble)).resolves.toBe(6);
		expect(close).toBeCalledTimes(1);
	});

	it('takeOutput', () => {
		const close = vi.fn();
		const sumDouble = AsyncReducer.createMono(
			async () => 0,
			async (c, v) => c + v,
			async (s) => s * 2,
			close,
		).takeOutput(2);

		expect(AsyncStream.of(1, 2, 4).reduce(sumDouble)).resolves.toBe(6);
		expect(close).toBeCalledTimes(1);
	});

	it('takeOutputUntil', () => {
		const close = vi.fn();
		const sumDouble = AsyncReducer.createMono(
			async () => 0,
			async (c, v) => c + v,
			async (s) => s,
			close,
		).takeOutputUntil(async (v) => v >= 3);

		expect(AsyncStream.of(1, 2, 4).reduce(sumDouble)).resolves.toBe(3);
		expect(close).toBeCalledTimes(1);
	});

	it('takeInput', () => {
		const close = vi.fn();
		const sumDouble = AsyncReducer.createMono(
			async () => 0,
			async (c, v) => c + v,
			async (s) => s * 2,
			close,
		).takeInput(2);

		expect(AsyncStream.of(1, 2, 4).reduce(sumDouble)).resolves.toBe(6);
		expect(close).toBeCalledTimes(1);
	});

	it('dropInput', () => {
		const close = vi.fn();
		const sumDouble = AsyncReducer.createMono(
			async () => 0,
			async (c, v) => c + v,
			async (s) => s * 2,
			close,
		).dropInput(1);

		expect(AsyncStream.of(1, 2, 3).reduce(sumDouble)).resolves.toBe(10);
		expect(close).toBeCalledTimes(1);

		expect(sumDouble.dropInput(0)).toBe(sumDouble);
	});

	it('sliceInput', () => {
		const close = vi.fn();
		const sumDouble = AsyncReducer.createMono(
			async () => 0,
			async (c, v) => c + v,
			async (s) => s * 2,
			close,
		).sliceInput({ start: 1, amount: 1 });

		expect(AsyncStream.of(1, 2, 3).reduce(sumDouble)).resolves.toBe(4);
		expect(close).toBeCalledTimes(1);
	});

	it('pipe', () => {
		const red = AsyncReducer.pipe(
			Reducer.sum,
			Reducer.join<number>({ sep: ', ' }),
		);

		expect(AsyncStream.empty<number>().reduce(red)).resolves.toEqual('');
		expect(AsyncStream.of(1).reduce(red)).resolves.toEqual('1');
		expect(AsyncStream.of(1, 2, 3).reduce(red)).resolves.toEqual('1, 3, 6');
	});

	it('pipe 2', () => {
		const red = AsyncReducer.pipe(
			Reducer.sum,
			AsyncReducer.from(Reducer.product),
			AsyncReducer.from(Reducer.join({ sep: ', ' })),
		);

		expect(AsyncStream.empty<number>().reduce(red)).resolves.toEqual('');
		expect(AsyncStream.of(1).reduce(red)).resolves.toEqual('1');
		expect(AsyncStream.of(1, 2, 3).reduce(red)).resolves.toEqual('1, 3, 18');
		expect(AsyncStream.of(0, 1, 2).reduce(red)).resolves.toEqual('0');
	});

	it('chain', () => {
		{
			const red = AsyncReducer.from(Reducer.toArray<number>())
				.takeInput(2)
				.chain([Reducer.toArray<number>().takeInput(2)]);

			expect(AsyncStream.of(1, 2, 3, 4, 5).reduce(red)).resolves.toEqual([
				3, 4,
			]);
		}

		{
			const red = AsyncReducer.from(Reducer.sum)
				.takeInput(2)
				.chain([
					(v) => AsyncReducer.from(Reducer.product).mapOutput((o) => o + v),
				]);

			expect(AsyncStream.of(1, 2, 3, 4).reduce(red)).resolves.toEqual(15);
		}
	});
});

describe('AsyncReducers', () => {
	it('AsyncReducer.combine array shape', () => {
		const r = AsyncReducer.combine([
			AsyncReducer.from(Reducer.sum),
			Reducer.average,
		]);

		expect(AsyncStream.empty<number>().reduce(r)).resolves.toEqual([0, 0]);
		expect(AsyncStream.of(0, 0, 0).reduceStream(r).toArray()).resolves.toEqual([
			[0, 0],
			[0, 0],
			[0, 0],
		]);
		expect(AsyncStream.of(0, 2, 4).reduceStream(r).toArray()).resolves.toEqual([
			[0, 0],
			[2, 1],
			[6, 2],
		]);
	});

	it('AsyncReducer.combine array shape with halt', () => {
		const r = AsyncReducer.combine([
			AsyncReducer.from(Reducer.sum),
			AsyncReducer.from(Reducer.product),
		]);

		expect(AsyncStream.empty<number>().reduce(r)).resolves.toEqual([0, 1]);
		expect(AsyncStream.of(0, 0, 0).reduceStream(r).toArray()).resolves.toEqual([
			[0, 0],
			[0, 0],
			[0, 0],
		]);
		expect(AsyncStream.of(0, 2, 4).reduceStream(r).toArray()).resolves.toEqual([
			[0, 0],
			[2, 0],
			[6, 0],
		]);
	});

	it('AsyncReducer.combine array shape with stateToResult', () => {
		const r = AsyncReducer.combine([
			AsyncReducer.from(Reducer.sum).mapOutput(async (v) => v + 1),
			AsyncReducer.from(Reducer.product),
		]);

		expect(AsyncStream.empty<number>().reduce(r)).resolves.toEqual([1, 1]);
		expect(AsyncStream.of(0, 0, 0).reduceStream(r).toArray()).resolves.toEqual([
			[1, 0],
			[1, 0],
			[1, 0],
		]);
		expect(AsyncStream.of(0, 2, 4).reduceStream(r).toArray()).resolves.toEqual([
			[1, 0],
			[3, 0],
			[7, 0],
		]);
	});

	it('AsyncReducer.combine object shape', () => {
		const r = AsyncReducer.combine({
			sum: AsyncReducer.from(Reducer.sum),
			avg: AsyncReducer.from(Reducer.average),
		});

		expect(AsyncStream.empty<number>().reduce(r)).resolves.toEqual({
			sum: 0,
			avg: 0,
		});
		expect(AsyncStream.of(0, 0, 0).reduceStream(r).toArray()).resolves.toEqual([
			{ sum: 0, avg: 0 },
			{ sum: 0, avg: 0 },
			{ sum: 0, avg: 0 },
		]);
		expect(AsyncStream.of(0, 2, 4).reduceStream(r).toArray()).resolves.toEqual([
			{ sum: 0, avg: 0 },
			{ sum: 2, avg: 1 },
			{ sum: 6, avg: 2 },
		]);
	});

	it('AsyncReducer.combine object shape with halt', () => {
		const r = AsyncReducer.combine({
			sum: AsyncReducer.from(Reducer.sum),
			prod: AsyncReducer.from(Reducer.product),
		});

		expect(AsyncStream.empty<number>().reduce(r)).resolves.toEqual({
			sum: 0,
			prod: 1,
		});
		expect(AsyncStream.of(0, 0, 0).reduceStream(r).toArray()).resolves.toEqual([
			{ sum: 0, prod: 0 },
			{ sum: 0, prod: 0 },
			{ sum: 0, prod: 0 },
		]);
		expect(AsyncStream.of(0, 2, 4).reduceStream(r).toArray()).resolves.toEqual([
			{ sum: 0, prod: 0 },
			{ sum: 2, prod: 0 },
			{ sum: 6, prod: 0 },
		]);
	});

	it('AsyncReducer.combine object shape with stateToResult', () => {
		const r = AsyncReducer.combine({
			sum: AsyncReducer.from(Reducer.sum).mapOutput(async (v) => v + 1),
			prod: AsyncReducer.from(Reducer.product),
		});

		expect(AsyncStream.empty<number>().reduce(r)).resolves.toEqual({
			sum: 1,
			prod: 1,
		});
		expect(AsyncStream.of(0, 0, 0).reduceStream(r).toArray()).resolves.toEqual([
			{ sum: 1, prod: 0 },
			{ sum: 1, prod: 0 },
			{ sum: 1, prod: 0 },
		]);
		expect(AsyncStream.of(0, 2, 4).reduceStream(r).toArray()).resolves.toEqual([
			{ sum: 1, prod: 0 },
			{ sum: 3, prod: 0 },
			{ sum: 7, prod: 0 },
		]);
	});

	it('AsyncReducer.first', () => {
		expect(
			AsyncStream.empty().reduce(AsyncReducer.first()),
		).resolves.toBeUndefined();
		expect(AsyncStream.empty().reduce(AsyncReducer.first(5))).resolves.toBe(5);
		expect(AsyncStream.of(1, 2, 3).reduce(AsyncReducer.first())).resolves.toBe(
			1,
		);
		expect(AsyncStream.of(1, 2, 3).reduce(AsyncReducer.first(5))).resolves.toBe(
			1,
		);
		expect(
			AsyncStream.of(1, 2, 3).reduceStream(AsyncReducer.first()).toArray(),
		).resolves.toEqual([1]);
	});

	it('AsyncReducer.isEmpty', () => {
		expect(AsyncStream.empty().reduce(AsyncReducer.isEmpty)).resolves.toBe(
			true,
		);
		expect(AsyncStream.of(1, 2, 3).reduce(AsyncReducer.isEmpty)).resolves.toBe(
			false,
		);

		expect(
			AsyncStream.of(1, 2, 3).reduceStream(AsyncReducer.isEmpty).toArray(),
		).resolves.toEqual([false]);
	});

	it('AsyncReducer.last', () => {
		expect(
			AsyncStream.empty().reduce(AsyncReducer.last()),
		).resolves.toBeUndefined();
		expect(AsyncStream.empty().reduce(AsyncReducer.last(5))).resolves.toBe(5);
		expect(AsyncStream.of(1, 2, 3).reduce(AsyncReducer.last())).resolves.toBe(
			3,
		);
		expect(AsyncStream.of(1, 2, 3).reduce(AsyncReducer.last(5))).resolves.toBe(
			3,
		);
		expect(
			AsyncStream.of(1, 2, 3).reduceStream(AsyncReducer.last()).toArray(),
		).resolves.toEqual([1, 2, 3]);
	});

	it('AsyncReducer.max', () => {
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.max()),
		).resolves.toBeUndefined();
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.max(-5)),
		).resolves.toBe(-5);
		expect(
			AsyncStream.of(2, 10, 1, 11, 3).reduce(AsyncReducer.max()),
		).resolves.toBe(11);
		expect(
			AsyncStream.of(1, 10, 1, 11, 3).reduce(AsyncReducer.max(-5)),
		).resolves.toBe(11);

		expect(
			AsyncStream.of(1, 10, 1, 11, 3)
				.reduceStream(AsyncReducer.max())
				.toArray(),
		).resolves.toEqual([1, 10, 10, 11, 11]);
	});

	it('AsyncReducer.maxBy', () => {
		const maxLen1 = AsyncReducer.maxBy<string>(
			async (v1, v2) => v1.length - v2.length,
		);
		const maxLen2 = AsyncReducer.maxBy<string, string>(
			async (v1, v2) => v1.length - v2.length,
			'z',
		);

		expect(
			AsyncStream.empty<string>().reduce(maxLen1),
		).resolves.toBeUndefined();
		expect(AsyncStream.empty<string>().reduce(maxLen2)).resolves.toBe('z');

		expect(AsyncStream.of('b', 'abc', 'ef').reduce(maxLen1)).resolves.toBe(
			'abc',
		);
		expect(AsyncStream.of('b', 'abc', 'ef').reduce(maxLen2)).resolves.toBe(
			'abc',
		);

		expect(
			AsyncStream.of('b', 'abc', 'ef').reduceStream(maxLen1).toArray(),
		).resolves.toEqual(['b', 'abc', 'abc']);

		expect(
			AsyncStream.of('b', 'abc', 'ef').reduceStream(maxLen2).toArray(),
		).resolves.toEqual(['b', 'abc', 'abc']);
	});

	it('AsyncReducer.min', () => {
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.min()),
		).resolves.toBeUndefined();
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.min(-5)),
		).resolves.toBe(-5);
		expect(
			AsyncStream.of(2, 10, 1, 11, 3).reduce(AsyncReducer.min()),
		).resolves.toBe(1);
		expect(
			AsyncStream.of(2, 10, 1, 11, 3).reduce(AsyncReducer.min(-5)),
		).resolves.toBe(1);

		expect(
			AsyncStream.of(2, 10, 1, 11, 3)
				.reduceStream(AsyncReducer.min())
				.toArray(),
		).resolves.toEqual([2, 2, 1, 1, 1]);
	});

	it('AsyncReducer.minBy', () => {
		const maxLen1 = AsyncReducer.minBy<string>(
			async (v1, v2) => v1.length - v2.length,
		);
		const maxLen2 = AsyncReducer.minBy<string, string>(
			async (v1, v2) => v1.length - v2.length,
			'z',
		);

		expect(
			AsyncStream.empty<string>().reduce(maxLen1),
		).resolves.toBeUndefined();
		expect(AsyncStream.empty<string>().reduce(maxLen2)).resolves.toBe('z');

		expect(AsyncStream.of('b', 'abc', '', 'ef').reduce(maxLen1)).resolves.toBe(
			'',
		);
		expect(AsyncStream.of('b', 'abc', '', 'ef').reduce(maxLen2)).resolves.toBe(
			'',
		);

		expect(
			AsyncStream.of('b', 'abc', '', 'ef').reduceStream(maxLen1).toArray(),
		).resolves.toEqual(['b', 'b', '', '']);

		expect(
			AsyncStream.of('b', 'abc', '', 'ef').reduceStream(maxLen2).toArray(),
		).resolves.toEqual(['b', 'b', '', '']);
	});

	it('AsyncReducer.nonEmpty', () => {
		expect(AsyncStream.empty().reduce(AsyncReducer.nonEmpty)).resolves.toBe(
			false,
		);
		expect(AsyncStream.of(1, 2, 3).reduce(AsyncReducer.nonEmpty)).resolves.toBe(
			true,
		);

		expect(
			AsyncStream.of(1, 2, 3).reduceStream(AsyncReducer.nonEmpty).toArray(),
		).resolves.toEqual([true]);
	});
});
