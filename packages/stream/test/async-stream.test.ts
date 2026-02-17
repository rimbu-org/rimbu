import { beforeEach, describe, expect, it, vi } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common/types';

import * as Arr from '@rimbu/base/arr';
import { Eq } from '@rimbu/common/eq';
import { Err } from '@rimbu/common/err';
import { Stream } from '@rimbu/stream';
import { AsyncStream, type AsyncStreamSource } from '@rimbu/stream/async';
import { AsyncReducer } from '@rimbu/stream/async/reducer';
import { Reducer } from '@rimbu/stream/reducer';

const streamRange1 = AsyncStream.from(Stream.range({ amount: 100 }));
const streamRange2 = AsyncStream.from(Stream.range({ amount: 100 }).toArray());
const streamRange3 = AsyncStream.from(
	new Set(Stream.range({ amount: 100 }).toArray()),
);
const streamRange4 = AsyncStream.from(Stream.range({ amount: 10 })).concat(
	Stream.range({ start: 10, end: [100, false] }).toArray(),
);
const streamRange5 = AsyncStream.from(Stream.range({ amount: 100 })).map(
	(v) => v,
);
const streamRange6 = AsyncStream.from(Stream.range({ amount: 99 })).append(99);
const streamRange7 = AsyncStream.from(
	Stream.range({ start: 1, amount: 99 }),
).prepend(0);
const streamRange8 = AsyncStream.from(Stream.range({ amount: 100 })).filter(
	() => true,
);
const arr = Stream.range({ start: 99, end: 0 }, { delta: -1 }).toArray();
const streamRange9 = AsyncStream.from(
	Stream.fromArray(arr, { reversed: true }),
);
const streamRange10 = AsyncStream.from(Stream.range({ amount: 100 })).mapPure(
	(v) => v,
);
const streamRange11 = AsyncStream.from(
	Stream.range({ amount: 100 }),
).filterPure({
	pred: (v) => true,
});
const streamRange12 = AsyncStream.from(Stream.range({ amount: 100 }))
	.indexed()
	.map(([v]) => v);
const streamRange13 = AsyncStream.from(Stream.range({ amount: 100 })).collect(
	(v) => v,
);
const streamRange14 = AsyncStream.from(Stream.range({ amount: 200 })).take(100);
const streamRange15 = AsyncStream.from(
	Stream.range({ start: -100, amount: 200 }),
).drop(100);

const sources = (
	[
		streamRange1,
		streamRange2,
		streamRange3,
		streamRange4,
		streamRange5,
		streamRange6,
		streamRange7,
		streamRange8,
		streamRange9,
		streamRange10,
		streamRange11,
		streamRange12,
		streamRange13,
		streamRange14,
		streamRange15,
	] as AsyncStream<number>[]
).map((s) => AsyncStream.from<number>(s));

const open = vi.fn().mockReturnValue(1);
const close = vi.fn();

function createResourceStream<T>(
	source: AsyncStreamSource<T>,
	c = close,
	o = open,
) {
	return AsyncStream.fromResource({
		open: o,
		createSource: () => source,
		close: c,
	});
}

function createErrorStream<T>(c = close, o = open) {
	return AsyncStream.fromResource({
		open: o,
		createSource: () => AsyncStream.of(1, 2, Err),
		close: c,
	});
}

async function testResForEach(res: AsyncStream<any>): Promise<void> {
	close.mockReset();
	await res.forEach(() => {});
	expect(close).toBeCalledTimes(1);
	close.mockReset();

	await res.forEach((v, i, halt) => {
		if (i === 2) halt();
	});
	expect(close).toBeCalledTimes(1);
	close.mockReset();

	try {
		await res.forEach((v, i, halt) => {
			if (i === 1) throw Error('a');
		});
	} catch (e) {}
	expect(close).toBeCalledTimes(1);
	close.mockReset();

	try {
		await res.forEach((v, i, halt) => {
			if (i === 2) {
				halt();
				throw Error('a');
			}
		});
	} catch (e) {}
	expect(close).toBeCalledTimes(1);
	close.mockReset();
}

describe('AsyncStream constructors', () => {
	beforeEach(() => {
		close.mockReset();
	});

	it('empty', () => {
		const e = AsyncStream.empty();
		expect(e).toBe(AsyncStream.empty());
		expect(e.toArray()).resolves.toEqual([]);
		expect(e.concat(e)).toBe(e);
	});

	it('of', () => {
		expect(AsyncStream.of(1).toArray()).resolves.toEqual([1]);
		expect(AsyncStream.of(Promise.resolve(1)).toArray()).resolves.toEqual([1]);
		expect(AsyncStream.of(() => 1).toArray()).resolves.toEqual([1]);
		expect(AsyncStream.of(async () => 1).toArray()).resolves.toEqual([1]);
		expect(AsyncStream.of(1, 2, 3).toArray()).resolves.toEqual([1, 2, 3]);
	});

	it('from', () => {
		expect(AsyncStream.from([])).toBe(AsyncStream.empty());
		expect(AsyncStream.from([1]).toArray()).resolves.toEqual([1]);
		expect(AsyncStream.from([1, 2, 3]).toArray()).resolves.toEqual([1, 2, 3]);
		expect(AsyncStream.from(new Set()).toArray()).resolves.toEqual([]);
		expect(AsyncStream.from(new Set([1, 2, 3])).toArray()).resolves.toEqual([
			1, 2, 3,
		]);
		expect(AsyncStream.from(() => [1]).toArray()).resolves.toEqual([1]);
		expect(
			AsyncStream.from(() => Promise.resolve([1])).toArray(),
		).resolves.toEqual([1]);
		expect(AsyncStream.from(async () => [1]).toArray()).resolves.toEqual([1]);
		expect(
			AsyncStream.from(async function* (): AsyncGenerator<number, number> {
				await Promise.resolve();
				yield 1;
				yield 2;
				return 3;
			}).toArray(),
		).resolves.toBeDefined();
	});

	it('fromResource', async () => {
		const open = vi.fn().mockReturnValue(1);
		const close = vi.fn();
		const s = AsyncStream.fromResource({
			open,
			createSource: () => [1, 2, 3],
			close,
		});
		expect(open).not.toBeCalled();
		expect(close).not.toBeCalled();

		await s.count();
		expect(open).toBeCalledTimes(1);
		expect(close).toBeCalledTimes(1);
	});

	it('from multi', () => {
		expect(AsyncStream.from([], [])).toBe(AsyncStream.empty());
		expect(
			AsyncStream.from(
				() => [],
				() => [],
			).toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.from(
				[1, 2],
				() => [3, 4],
				() => Promise.resolve([5, 6]),
				async () => [7, 8],
				async function* () {
					yield 9;
					yield 10;
					return 'a';
				},
			).toArray(),
		).resolves.toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	});

	it('always', () => {
		expect(AsyncStream.always(5).take(5).toArray()).resolves.toEqual([
			5, 5, 5, 5, 5,
		]);
		expect(AsyncStream.always(5).first()).resolves.toBe(5);
		// expect(AsyncStream.always(5).last()).resolves.toBe(5);
		expect(AsyncStream.always(5).elementAt(10000)).resolves.toBe(5);
	});

	it('flatten', () => {
		expect(AsyncStream.flatten(AsyncStream.empty())).toBe(AsyncStream.empty());
		expect(AsyncStream.flatten(AsyncStream.of([])).toArray()).resolves.toEqual(
			[],
		);
		expect(
			AsyncStream.flatten(AsyncStream.of([1, 2])).toArray(),
		).resolves.toEqual([1, 2]);
		expect(
			AsyncStream.flatten(AsyncStream.of([1, 2], [3], [4])).toArray(),
		).resolves.toEqual([1, 2, 3, 4]);

		// const closeInner = vi.fn();
		// const s = createResourceStream(
		//   createResourceStream([1, 2, 3], closeInner),
		//   close
		// );

		// await s.count();
		// expect(close).toBeCalledTimes(1);
		// expect(closeInner).toBeCalledTimes(1);
	});

	it('unfold', () => {
		expect(
			AsyncStream.unfold(0, (c, n, stop) => stop).toArray(),
		).resolves.toEqual([0]);
		expect(
			AsyncStream.unfold(0, async (c, i, stop) =>
				c > 2 ? stop : c + i,
			).toArray(),
		).resolves.toEqual([0, 1, 3]);
	});
});

describe('AsyncStream methods', () => {
	beforeEach(() => {
		close.mockReset();
	});

	it('asyncStream', () => {
		expect(AsyncStream.empty<number>().asyncStream()).toBe(
			AsyncStream.empty<string>() as any,
		);
		const s = AsyncStream.of(1, 2, 3);
		expect(s.asyncStream()).toBe(s);
		for (const source of sources) {
			expect(source.asyncStream()).toBe(source);
		}
	});
	it('equals', () => {
		const s1 = AsyncStream.empty<number>();
		const s2 = AsyncStream.of(1, 2, 3);
		expect(s1.equals(s1)).resolves.toBe(true);
		expect(s1.equals([])).resolves.toBe(true);
		expect(s1.equals(s2)).resolves.toBe(false);
		expect(s2.equals(s1)).resolves.toBe(false);
		expect(s2.equals([])).resolves.toBe(false);
		expect(s2.equals(s2)).resolves.toBe(true);
		expect(AsyncStream.of('a', 'b').equals(['A', 'B'])).resolves.toBe(false);
		expect(
			AsyncStream.of('a', 'b').equals(['A', 'B'], {
				eq: Eq.stringCaseInsentitive,
			}),
		).resolves.toBe(true);

		for (const source of sources) {
			expect(source.equals([])).resolves.toBe(false);
			expect(source.equals(source)).resolves.toBe(true);
		}
	});
	it('equals close', async () => {
		const rs1 = createResourceStream([1, 2, 3]);
		{
			const close2 = vi.fn();
			const rs2 = createResourceStream([1, 2, 3], close2);

			await rs1.equals(rs2);
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}

		{
			close.mockReset();
			const close2 = vi.fn();
			const rs2 = createResourceStream([1, 2], close2);

			await rs1.equals(rs2);
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}

		{
			close.mockReset();
			const close2 = vi.fn();
			const rs2 = createResourceStream([1, 2], close2);

			await rs2.equals(rs1);
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}
	});
	it('assumeNonEmpty', () => {
		expect(() => AsyncStream.empty<number>().assumeNonEmpty()).toThrow();
		const s = AsyncStream.of(1, 2, 3);
		expect(s.assumeNonEmpty()).toBe(s);
		for (const source of sources) {
			expect(source.assumeNonEmpty().asNormal()).toBe(source);
		}
	});
	it('asNormal', () => {
		const s = AsyncStream.of(1, 2, 3);
		expect(s.asNormal()).toBe(s);
	});
	it('prepend', async () => {
		expect(AsyncStream.empty<number>().prepend(5).toArray()).resolves.toEqual([
			5,
		]);
		expect(AsyncStream.of(1, 2, 3).prepend(5).toArray()).resolves.toEqual([
			5, 1, 2, 3,
		]);
		for (const source of sources) {
			const arr = [5, ...(await source.toArray())];
			expect(source.prepend(5).toArray()).resolves.toEqual(
				arr as ArrayNonEmpty<number>,
			);
		}
	});
	it('prepend close', async () => {
		const res = createResourceStream([1, 2, 3]).prepend(0);
		await res.forEach((v, i, halt) => {
			halt();
		});
		expect(close).toBeCalledTimes(0);
		await res.count();
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			await createErrorStream().prepend(0).count();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('append', async () => {
		expect(AsyncStream.empty<number>().append(5).toArray()).resolves.toEqual([
			5,
		]);
		expect(AsyncStream.of(1, 2, 3).append(5).toArray()).resolves.toEqual([
			1, 2, 3, 5,
		]);
		for (const source of sources) {
			const arr = [...(await source.toArray()), 5];
			expect(source.append(5).toArray()).resolves.toEqual(
				arr as ArrayNonEmpty<number>,
			);
		}
	});
	it('append close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]).append(4));
	});
	it('forEach', async () => {
		await AsyncStream.empty().forEach(() => {
			expect(true).toBe(false);
		});
		await AsyncStream.of(1).forEach((v) => {
			expect(v).toBe(1);
		});
		let result = 0;
		await AsyncStream.of(1, 2, 3).forEach((v) => {
			result += v;
		});
		expect(result).toBe(6);
		result = 0;
		await AsyncStream.of(1, 2, 3).forEach((v, _, halt) => {
			if (v > 2) return halt();
			result += v;
		});
		expect(result).toBe(3);
		for (const source of sources) {
			result = 0;
			await source.forEach((v) => {
				result += v;
			});
			expect(result).toBe(4950);
			result = 0;
			await source.forEach((v, _, halt): void => {
				if (v > 70) {
					halt();
					return;
				}
				result += v;
			});
			expect(result).toBe(2485);
			result = 0;
			await source.forEach((v, _, halt) => {
				if (v > 5) return halt();
				result += v;
			});
			expect(result).toBe(15);
		}
	});
	it('forEach close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]));

		try {
			await createErrorStream().forEach(vi.fn());
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('forEachPure', async () => {
		const s = AsyncStream.of(1, 2, 3);
		const op = vi.fn();
		await s.forEachPure(op);
		expect(op).toBeCalledTimes(3);
		expect(op).toHaveBeenNthCalledWith(1, 1);
		expect(op).toHaveBeenNthCalledWith(2, 2);
		expect(op).toHaveBeenNthCalledWith(3, 3);
	});
	it('forEachPure close', async () => {
		{
			const res = createResourceStream([1, 2, 3]);
			await res.forEachPure(vi.fn());
			expect(close).toBeCalledTimes(1);
		}
		close.mockReset();
		{
			const res = createResourceStream([1, 2, 3]);
			try {
				await res.forEachPure(Err);
			} catch {}
			expect(close).toBeCalledTimes(1);
		}
		close.mockReset();
		try {
			await createErrorStream().forEachPure(vi.fn());
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('indexed', () => {
		expect(AsyncStream.empty().indexed()).toBe(AsyncStream.empty());
		expect(AsyncStream.of(1).indexed().toArray()).resolves.toEqual([[0, 1]]);
		expect(AsyncStream.of(1, 2, 3).indexed().toArray()).resolves.toEqual([
			[0, 1],
			[1, 2],
			[2, 3],
		]);
		expect(
			AsyncStream.of(1, 2, 3).indexed({ startIndex: 5 }).toArray(),
		).resolves.toEqual([
			[5, 1],
			[6, 2],
			[7, 3],
		]);
	});
	it('indexed close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]).indexed());
	});
	it('map', async () => {
		expect(AsyncStream.empty().map((v) => v)).toBe(AsyncStream.empty());
		expect(
			AsyncStream.of(1, 2, 3)
				.map((v) => v + 1)
				.toArray(),
		).resolves.toEqual([2, 3, 4]);
		expect(
			AsyncStream.of(1, 2, 3)
				.map(async (v) => v + 1)
				.toArray(),
		).resolves.toEqual([2, 3, 4]);
		for (const source of sources) {
			expect(source.map((v) => v).toArray()).resolves.toEqual(
				await source.toArray(),
			);
		}
	});
	it('map close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]).map((v) => v + 1));
	});
	it('mapPure', async () => {
		expect(AsyncStream.empty().mapPure((v) => v)).toBe(AsyncStream.empty());
		expect(
			AsyncStream.of(1, 2, 3)
				.mapPure((v) => v + 1)
				.toArray(),
		).resolves.toEqual([2, 3, 4]);
		expect(
			AsyncStream.of(1, 2, 3)
				.mapPure(async (v) => v + 1)
				.toArray(),
		).resolves.toEqual([2, 3, 4]);
		for (const source of sources) {
			expect(source.mapPure((v) => v).toArray()).resolves.toEqual(
				await source.toArray(),
			);
		}
	});
	it('mapPure close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]).mapPure((v) => v + 1));
	});

	it('flatMap', async () => {
		expect(AsyncStream.empty().flatMap((v) => AsyncStream.of(1))).toBe(
			AsyncStream.empty(),
		);
		expect(
			AsyncStream.of(1)
				.flatMap((v) => AsyncStream.empty())
				.toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1)
				.flatMap((v) => AsyncStream.of(2, 3))
				.toArray(),
		).resolves.toEqual([2, 3]);
		expect(
			AsyncStream.of(1, 2, 3)
				.flatMap((v) => AsyncStream.of(v + 1))
				.toArray(),
		).resolves.toEqual([2, 3, 4]);
		expect(
			AsyncStream.of(1, 2, 3)
				.flatMap((v, i) => [i + 1])
				.toArray(),
		).resolves.toEqual([1, 2, 3]);
		expect(
			AsyncStream.of(1, 2, 3)
				.flatMap((v, i) => [v, v])
				.toArray(),
		).resolves.toEqual([1, 1, 2, 2, 3, 3]);
		for (const source of sources) {
			expect(source.flatMap((v) => [v]).toArray()).resolves.toEqual(
				await source.toArray(),
			);
		}
	});

	it('flatMap close', async () => {
		const s1 = createResourceStream([1, 2, 3]);
		const close2 = vi.fn();
		// const close3 = vi.fn();
		const s2 = createResourceStream([4, 5, 6], close2);
		// const s3 = createResourceStream([7, 8, 9], close3);
		const closeE = vi.fn();
		const se = createErrorStream(closeE);

		await s1.flatMap((v) => s2).count();
		expect(close).toBeCalledTimes(1);
		expect(close2).toBeCalledTimes(3);

		close.mockReset();
		try {
			await s1.flatMap((v) => se).count();
		} catch {}
		expect(close).toBeCalledTimes(1);
		expect(closeE).toBeCalledTimes(1);
	});

	it('flatZip', async () => {
		expect(AsyncStream.empty().flatZip((v) => Stream.of(1))).toBe(
			AsyncStream.empty(),
		);
		expect(
			AsyncStream.of(1)
				.flatZip((v) => Stream.empty())
				.toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1)
				.flatZip((v) => Stream.of(2, 3))
				.toArray(),
		).resolves.toEqual([
			[1, 2],
			[1, 3],
		]);
		expect(
			AsyncStream.of(1, 2, 3)
				.flatZip((v) => AsyncStream.of(v + 1))
				.toArray(),
		).resolves.toEqual([
			[1, 2],
			[2, 3],
			[3, 4],
		]);
		expect(
			AsyncStream.of(1, 2, 3)
				.flatZip((v, i) => [i + 1])
				.toArray(),
		).resolves.toEqual([
			[1, 1],
			[2, 2],
			[3, 3],
		]);

		expect(
			AsyncStream.of(1, 2, 3)
				.flatZip((v, i) => [v, v])
				.toArray(),
		).resolves.toEqual([
			[1, 1],
			[1, 1],
			[2, 2],
			[2, 2],
			[3, 3],
			[3, 3],
		]);

		await AsyncStream.from(sources).forEach(async (source) => {
			expect(source.flatZip((v) => [v]).toArray()).resolves.toEqual(
				await source.map((v) => [v, v] satisfies [number, number]).toArray(),
			);
		});
	});

	it('flatZip close', async () => {
		const s1 = createResourceStream([1, 2, 3]);
		const close2 = vi.fn();
		// const close3 = vi.fn();
		const s2 = createResourceStream([4, 5, 6], close2);
		// const s3 = createResourceStream([7, 8, 9], close3);
		const closeE = vi.fn();
		const se = createErrorStream(closeE);

		await s1.flatZip((v) => s2).count();
		expect(close).toBeCalledTimes(1);
		expect(close2).toBeCalledTimes(3);

		close.mockReset();
		try {
			await s1.flatZip((v) => se).count();
		} catch {}
		expect(close).toBeCalledTimes(1);
		expect(closeE).toBeCalledTimes(1);
	});

	it('filter', () => {
		expect(AsyncStream.empty().filter((v) => true)).toBe(AsyncStream.empty());
		expect(
			AsyncStream.of(1, 2, 3)
				.filter(async (v) => true)
				.toArray(),
		).resolves.toEqual([1, 2, 3]);
		expect(
			AsyncStream.of(1, 2, 3)
				.filter((v) => false)
				.toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1, 2, 3)
				.filter(async (v) => v % 2 === 1)
				.toArray(),
		).resolves.toEqual([1, 3]);
		for (const source of sources) {
			expect(source.filter((v) => false).toArray()).resolves.toEqual([]);
			expect(source.filter((v) => v % 30 === 0).toArray()).resolves.toEqual([
				0, 30, 60, 90,
			]);
			expect(source.filter((v, i) => i % 30 === 0).toArray()).resolves.toEqual([
				0, 30, 60, 90,
			]);
			expect(
				source
					.filter((v) => v % 15 === 0)
					.filter(async (v) => v % 20 === 0)
					.toArray(),
			).resolves.toEqual([0, 60]);
		}
	});

	it('filter close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]).filter((v) => true));

		try {
			await createResourceStream([1, 2, 3]).filter(Err).count();
		} catch {}
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			await createErrorStream()
				.filter((v) => true)
				.count();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});

	it('filterPure', () => {
		expect(AsyncStream.empty().filterPure({ pred: (v) => true })).toBe(
			AsyncStream.empty(),
		);
		expect(
			AsyncStream.of(1, 2, 3)
				.filterPure({ pred: async (v) => true })
				.toArray(),
		).resolves.toEqual([1, 2, 3]);
		expect(
			AsyncStream.of(1, 2, 3)
				.filterPure({ pred: (v) => false })
				.toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1, 2, 3)
				.filterPure({ pred: async (v) => v % 2 === 1 })
				.toArray(),
		).resolves.toEqual([1, 3]);
		for (const source of sources) {
			expect(
				source.filterPure({ pred: (v) => false }).toArray(),
			).resolves.toEqual([]);
			expect(
				source.filterPure({ pred: (v) => v % 30 === 0 }).toArray(),
			).resolves.toEqual([0, 30, 60, 90]);
			expect(
				source
					.filterPure({ pred: (v) => v % 15 === 0 })
					.filterPure({ pred: async (v) => v % 20 === 0 })
					.toArray(),
			).resolves.toEqual([0, 60]);
		}
	});

	it('filterPure close', async () => {
		await testResForEach(
			createResourceStream([1, 2, 3]).filterPure({ pred: (v) => true }),
		);

		try {
			await createResourceStream([1, 2, 3]).filterPure({ pred: Err }).count();
		} catch {}
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			await createErrorStream()
				.filterPure({ pred: (v) => true })
				.count();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});

	it('collect', () => {
		expect(AsyncStream.empty<number>().collect((v) => v + 1)).toBe(
			AsyncStream.empty(),
		);
		expect(
			AsyncStream.of(1)
				.collect((v) => v + 1)
				.toArray(),
		).resolves.toEqual([2]);
		expect(
			AsyncStream.of(1)
				.collect((v, i, skip) => skip)
				.toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1, 2, 3)
				.collect(async (v) => v + 1)
				.toArray(),
		).resolves.toEqual([2, 3, 4]);
		expect(
			AsyncStream.of(1, 2, 3)
				.collect((v, i, skip) => (v === 2 ? skip : v))
				.toArray(),
		).resolves.toEqual([1, 3]);
		expect(
			AsyncStream.of(1, 2, 3)
				.collect((v, i, skip) => (i === 1 ? skip : v))
				.toArray(),
		).resolves.toEqual([1, 3]);
		expect(
			AsyncStream.of(1, 2, 3)
				.collect(async (v, i, skip, halt) => {
					if (v === 1) {
						halt();
						return v;
					}
					return v;
				})
				.toArray(),
		).resolves.toEqual([1]);
		for (const source of sources) {
			expect(
				source
					.collect((v, i, skip, halt) => {
						if (v < 50) return skip;
						if (v > 55) {
							halt();
							return skip;
						}
						return v - 50;
					})
					.toArray(),
			).resolves.toEqual([0, 1, 2, 3, 4, 5]);
		}
	});
	it('withOnly', () => {
		const s3 = AsyncStream.of(1, 2, 3);

		expect(s3.withOnly([]).toArray()).resolves.toEqual([]);
		expect(s3.withOnly([1, 2, 3]).toArray()).resolves.toEqual([1, 2, 3]);
		expect(s3.withOnly([2]).toArray()).resolves.toEqual([2]);
		expect(s3.withOnly([4]).toArray()).resolves.toEqual([]);
	});
	it('without', () => {
		const s3 = AsyncStream.of(1, 2, 3);

		expect(s3.without([])).toBe(s3);
		expect(s3.without([1, 2, 3]).toArray()).resolves.toEqual([]);
		expect(s3.without([2]).toArray()).resolves.toEqual([1, 3]);
		expect(s3.without([4]).toArray()).resolves.toEqual([1, 2, 3]);
	});
	it('collect close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]).collect((v) => true));
		await testResForEach(
			createResourceStream([1, 2, 3]).collect((v, i, skip, halt) => {
				halt();
				return v;
			}),
		);

		try {
			await testResForEach(
				createResourceStream([1, 2, 3]).collect<number>(Err),
			);
		} catch {}
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			await createErrorStream()
				.collect((v) => {
					return v;
				})
				.count();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('first', async () => {
		expect(AsyncStream.empty<number>().first()).resolves.toBeUndefined();
		expect(AsyncStream.empty<number>().first(1)).resolves.toBe(1);
		expect(AsyncStream.of(1, 2, 3).first()).resolves.toBe(1);
		expect(AsyncStream.from(Stream.range({ start: 0 })).first()).resolves.toBe(
			0,
		);
		for (const source of sources) {
			const first = (await source.toArray())[0];
			expect(source.first()).resolves.toBe(first);
			expect(source.first('a')).resolves.toBe(first);
		}
	});
	it('first close', async () => {
		await createResourceStream([1, 2, 3]).first();
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1, Err, 3]).first();
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([Err, 2, 3]).first();
		expect(close).toBeCalledTimes(1);
	});
	it('last', async () => {
		expect(AsyncStream.empty<number>().last()).resolves.toBeUndefined();
		expect(AsyncStream.empty<number>().last(1)).resolves.toBe(1);
		expect(AsyncStream.of(1, 2, 3).last()).resolves.toBe(3);
		for (const source of sources) {
			const last = Arr.last(await source.toArray());
			expect(source.last()).resolves.toBe(last);
			expect(source.last('a')).resolves.toBe(last);
		}
	});
	it('last close', async () => {
		await createResourceStream([1, 2, 3]).last();
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1, Err, 3]).last();
		expect(close).toBeCalledTimes(1);
	});
	it('single', async () => {
		expect(AsyncStream.empty<number>().single()).resolves.toBeUndefined();
		expect(AsyncStream.empty<number>().single(1)).resolves.toBe(1);
		expect(AsyncStream.of(1).single()).resolves.toBe(1);
		expect(AsyncStream.of(1).single('a')).resolves.toBe(1);
		expect(AsyncStream.of(1, 2, 3).single()).resolves.toBeUndefined();
		expect(AsyncStream.of(1, 2, 3).single('a')).resolves.toBe('a');

		for (const source of sources) {
			const value =
				(await source.count()) === 1 ? await source.first() : undefined;
			expect(source.single()).resolves.toBe(value);
			expect(source.single('a')).resolves.toBe(value ?? 'a');
		}
	});
	it('single close', async () => {
		await createResourceStream([1, 2, 3]).single();
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1]).single();
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([Err]).single();
		expect(close).toBeCalledTimes(1);
	});
	it('count', async () => {
		expect(AsyncStream.empty<number>().count()).resolves.toBe(0);
		expect(AsyncStream.of(1, 2, 3).count()).resolves.toBe(3);
		for (const source of sources) {
			expect(source.count()).resolves.toEqual((await source.toArray()).length);
			expect(source.filter((v) => v % 2 === 0).count()).resolves.toEqual(
				(await source.toArray()).length / 2,
			);
		}
	});

	it('count close', async () => {
		await createResourceStream([1, 2, 3]).count();
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		try {
			await createErrorStream().count();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});

	it('countElement', async () => {
		expect(AsyncStream.empty<number>().countElement(1)).resolves.toBe(0);
		expect(AsyncStream.of(1, 2, 3, 2).countElement(2)).resolves.toBe(2);
		for (const source of sources) {
			expect(source.countElement(2)).resolves.toEqual(1);
			expect(
				source.filter((v) => v % 2 === 0).countElement(2),
			).resolves.toEqual(1);
		}
	});
	it('countElement inverse close', async () => {
		await createResourceStream([1, 2, 3]).countElement(3, { negate: true });
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		try {
			await createErrorStream().countElement(3, { negate: true });
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('countElement negate', async () => {
		expect(
			AsyncStream.empty<number>().countElement(1, { negate: true }),
		).resolves.toBe(0);
		expect(
			AsyncStream.of(1, 2, 3, 2).countElement(2, { negate: true }),
		).resolves.toBe(2);
		for (const source of sources) {
			expect(source.countElement(2, { negate: true })).resolves.toEqual(99);
			expect(
				source.filter((v) => v % 2 === 0).countElement(2, { negate: true }),
			).resolves.toEqual(49);
		}
	});
	it('countlement negate close', async () => {
		await createResourceStream([1, 2, 3]).countElement(3, { negate: true });
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		try {
			await createErrorStream().countElement(3, { negate: true });
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('find', async () => {
		expect(AsyncStream.empty().find((v) => false)).resolves.toBe(undefined);
		expect(
			AsyncStream.empty().find((v) => false, {
				otherwise: 'a',
			}),
		).resolves.toBe('a');
		expect(AsyncStream.empty().find((v) => true)).resolves.toBe(undefined);
		expect(
			AsyncStream.empty().find((v) => true, { otherwise: 'a' }),
		).resolves.toBe('a');
		expect(
			AsyncStream.of(1, 2, 3).find((v) => v === 2, { otherwise: 'a' }),
		).resolves.toBe(2);
		expect(
			AsyncStream.of(1, 2, 3).find((v) => v === 10, { otherwise: 'a' }),
		).resolves.toBe('a');
		expect(
			AsyncStream.of(1, 2, 1, 4).find((v) => v > 1, {
				occurrance: 2,
				otherwise: 'a',
			}),
		).resolves.toBe(4);
		for (const source of sources) {
			expect(source.find((v) => v === 70, { otherwise: 'a' })).resolves.toBe(
				70,
			);
			expect(source.find((v) => v === -10, { otherwise: 'a' })).resolves.toBe(
				'a',
			);
		}
	});
	it('find close', async () => {
		await createResourceStream([1, 2, 3]).find((v) => false);
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1, 2, 3]).find((v) => true);
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1, 2, 3]).find((v, i) => i === 2);
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		try {
			await createErrorStream().find((v) => false);
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('elementAt', async () => {
		expect(AsyncStream.empty().elementAt(0, 'a')).resolves.toBe('a');
		expect(AsyncStream.of(1).elementAt(0, 'a')).resolves.toBe(1);
		expect(AsyncStream.of(1).elementAt(1, 'a')).resolves.toBe('a');
		for (const source of sources) {
			expect(source.elementAt(0, 'a')).resolves.toBe(0);
			expect(source.elementAt(50, 'a')).resolves.toBe(50);
			expect(source.elementAt(99, 'a')).resolves.toBe(99);
			expect(source.elementAt(100, 'a')).resolves.toBe('a');
		}
	});
	it('elementAt close', async () => {
		await createResourceStream([1, 2, 3]).elementAt(1);
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1, 2, 3]).elementAt(100);
		expect(close).toBeCalledTimes(1);
	});
	it('indicesWhere', async () => {
		expect(AsyncStream.empty<number>().indicesWhere((v) => v > 0)).toBe(
			AsyncStream.empty(),
		);
		expect(
			AsyncStream.of(1)
				.indicesWhere((v) => v > 0)
				.toArray(),
		).resolves.toEqual([0]);
		expect(
			AsyncStream.of(1)
				.indicesWhere((v) => v < 0)
				.toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1, 2, 1)
				.indicesWhere((v) => v < 2)
				.toArray(),
		).resolves.toEqual([0, 2]);
		for (const source of sources) {
			expect(source.indicesWhere((v) => v >= 97).toArray()).resolves.toEqual([
				97, 98, 99,
			]);
			expect(source.indicesWhere((v) => v < 0).toArray()).resolves.toEqual([]);
		}
	});
	it('indicesWhere close', async () => {
		await testResForEach(
			createResourceStream([1, 2, 3]).indicesWhere((v) => v > 1),
		);
	});
	it('indicesOf', async () => {
		expect(AsyncStream.empty<number>().indicesOf(1)).toBe(AsyncStream.empty());
		expect(AsyncStream.of(1).indicesOf(1).toArray()).resolves.toEqual([0]);
		expect(AsyncStream.of(1).indicesOf(2).toArray()).resolves.toEqual([]);
		expect(AsyncStream.of(1, 2, 1).indicesOf(1).toArray()).resolves.toEqual([
			0, 2,
		]);
		for (const source of sources) {
			expect(source.indicesOf(50).toArray()).resolves.toEqual([50]);
			expect(source.indicesOf(-1).toArray()).resolves.toEqual([]);
		}
	});
	it('indicesOf close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]).indicesOf(2));
	});
	it('indexWhere', async () => {
		expect(AsyncStream.empty<number>().indexWhere((v) => v >= 0)).resolves.toBe(
			undefined,
		);
		expect(AsyncStream.of(1).indexWhere((v) => v >= 0)).resolves.toBe(0);
		expect(AsyncStream.of(1).indexWhere((v) => v < 0)).resolves.toBe(undefined);
		expect(
			AsyncStream.of(1).indexWhere((v) => v >= 0, { occurrance: 2 }),
		).resolves.toBe(undefined);
		expect(AsyncStream.of(1, 2, 1).indexWhere((v) => v >= 2)).resolves.toBe(1);
		expect(AsyncStream.of(1, 2, 1).indexWhere((v) => v < 0)).resolves.toBe(
			undefined,
		);
		expect(
			AsyncStream.of(1, 2, 1).indexWhere((v) => v < 2, { occurrance: 2 }),
		).resolves.toBe(2);
		expect(
			AsyncStream.of(1, 2, 1).indexWhere((v) => v < 2, { occurrance: 3 }),
		).resolves.toBe(undefined);
		for (const source of sources) {
			expect(source.indexWhere((v) => v >= 50)).resolves.toEqual(50);
			expect(
				source.indexWhere((v) => v >= 50, { occurrance: 10 }),
			).resolves.toEqual(59);
			expect(source.indexWhere((v) => v < 0)).resolves.toEqual(undefined);
		}
	});
	it('indexWhere close', async () => {
		await createResourceStream([1, 2, 3]).indexWhere((v) => v > 1);
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1, 2, 3]).indexWhere((v) => v > 100);
		expect(close).toBeCalledTimes(1);
	});
	it('indexOf', async () => {
		expect(AsyncStream.empty<number>().indexOf(1)).resolves.toBe(undefined);
		expect(AsyncStream.of(1).indexOf(1)).resolves.toBe(0);
		expect(AsyncStream.of(1).indexOf(2)).resolves.toBe(undefined);
		expect(AsyncStream.of(1).indexOf(1, { occurrance: 2 })).resolves.toBe(
			undefined,
		);
		expect(AsyncStream.of(1, 2, 1).indexOf(2)).resolves.toBe(1);
		expect(AsyncStream.of(1, 2, 1).indexOf(3)).resolves.toBe(undefined);
		expect(AsyncStream.of(1, 2, 1).indexOf(1, { occurrance: 2 })).resolves.toBe(
			2,
		);
		expect(AsyncStream.of(1, 2, 1).indexOf(1, { occurrance: 3 })).resolves.toBe(
			undefined,
		);
		for (const source of sources) {
			expect(source.indexOf(50)).resolves.toEqual(50);
			expect(source.indexOf(50, { occurrance: 2 })).resolves.toEqual(undefined);
			expect(source.indexOf(-1)).resolves.toEqual(undefined);
		}
	});
	it('indexOf close', async () => {
		await createResourceStream([1, 2, 3]).indexOf(2);
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1, 2, 3]).indexOf(10);
		expect(close).toBeCalledTimes(1);
	});
	it('some', () => {
		expect(AsyncStream.empty().some((v) => true)).resolves.toBe(false);
		expect(AsyncStream.empty().some((v) => false)).resolves.toBe(false);
		expect(AsyncStream.of(1, 2, 3).some((v) => v === 2)).resolves.toBe(true);
		expect(AsyncStream.of(1, 2, 3).some((v) => v === 10)).resolves.toBe(false);
		for (const source of sources) {
			expect(source.some((v) => v === 50)).resolves.toBe(true);
			expect(source.some((v) => v === -50)).resolves.toBe(false);
			expect(source.some((v, i) => i === 50)).resolves.toBe(true);
			expect(source.some((v, i) => i === -50)).resolves.toBe(false);
		}
	});
	it('some close', async () => {
		await createResourceStream([1, 2, 3]).some((v) => v > 1);
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1, 2, 3]).some((v) => v > 100);
		expect(close).toBeCalledTimes(1);
	});
	it('every', () => {
		expect(AsyncStream.empty().every(() => true)).resolves.toBe(true);
		expect(AsyncStream.empty().every(() => false)).resolves.toBe(true);
		expect(AsyncStream.of(1, 2, 3).every((v) => v > 0)).resolves.toBe(true);
		expect(AsyncStream.of(1, 2, 3).every((v) => v < 3)).resolves.toBe(false);
		expect(AsyncStream.of(1, 2, 3).every((v, i) => i >= 0)).resolves.toBe(true);
		expect(AsyncStream.of(1, 2, 3).every((v, i) => i < 2)).resolves.toBe(false);
		for (const source of sources) {
			expect(source.every((v) => v < 50)).resolves.toBe(false);
			expect(source.every((v) => v >= 0)).resolves.toBe(true);
			expect(source.every((v, i) => i < 50)).resolves.toBe(false);
			expect(source.every((v, i) => i >= 0)).resolves.toBe(true);
		}
	});
	it('every close', async () => {
		await createResourceStream([1, 2, 3]).every((v) => v > -10);
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1, 2, 3]).every((v) => v > 100);
		expect(close).toBeCalledTimes(1);
	});
	it('contains', () => {
		expect(AsyncStream.empty().contains(1)).resolves.toBe(false);
		expect(AsyncStream.of(1).contains(1)).resolves.toBe(true);
		expect(AsyncStream.of(1).contains(1, { amount: 2 })).resolves.toBe(false);
		expect(AsyncStream.of(1).contains(1, { amount: 0 })).resolves.toBe(true);
		expect(AsyncStream.of(1).contains(2)).resolves.toBe(false);
		expect(
			AsyncStream.of(1, 2, 1, 2, 1, 2).contains(2, { amount: 2 }),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 1, 2, 1, 2).contains(2, { amount: 3 }),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 1, 2, 1, 2).contains(2, { amount: 4 }),
		).resolves.toBe(false);
		for (const source of sources) {
			expect(source.contains(50)).resolves.toBe(true);
			expect(source.contains(50, { amount: 2 })).resolves.toBe(false);
			expect(source.contains(-50)).resolves.toBe(false);
			expect(source.contains(-50, { amount: 2 })).resolves.toBe(false);
		}
	});
	it('contains close', async () => {
		await createResourceStream([1, 2, 3]).contains(2);
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1, 2, 3]).contains(100);
		expect(close).toBeCalledTimes(1);
	});
	it('containsSlice', async () => {
		expect(AsyncStream.empty().containsSlice([1, 2, 3])).resolves.toBe(false);
		expect(AsyncStream.of(1, 2).containsSlice([1, 2, 3])).resolves.toBe(false);
		expect(AsyncStream.of(1, 2, 3).containsSlice([1, 2, 3])).resolves.toBe(
			true,
		);
		expect(
			AsyncStream.of(9, 8, 1, 2, 3).containsSlice([1, 2, 3]),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(1, 2, 3, 9, 8).containsSlice([1, 2, 3]),
		).resolves.toBe(true);
		expect(
			AsyncStream.of(9, 8, 1, 2, 3, 9, 8).containsSlice([1, 2, 3]),
		).resolves.toBe(true);
	});
	it('containsSlice close', async () => {
		await createResourceStream([1, 2, 3]).containsSlice([2]);
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1, 2, 3]).containsSlice([100]);
		expect(close).toBeCalledTimes(1);
	});
	it('takeWhile', async () => {
		expect(AsyncStream.empty().takeWhile((v) => true)).toBe(
			AsyncStream.empty(),
		);
		expect(AsyncStream.empty().takeWhile((v) => false)).toBe(
			AsyncStream.empty(),
		);
		expect(
			AsyncStream.of(1)
				.takeWhile(async (v) => true)
				.toArray(),
		).resolves.toEqual([1]);
		expect(
			AsyncStream.of(1)
				.takeWhile((v) => false)
				.toArray(),
		).resolves.toEqual([]);
		for (const source of sources) {
			expect(source.takeWhile((v) => false).toArray()).resolves.toEqual([]);
			expect(source.takeWhile(async (v) => v < 3).toArray()).resolves.toEqual([
				0, 1, 2,
			]);
		}
	});
	it('takeWhle close', async () => {
		await testResForEach(
			createResourceStream([1, 2, 3]).takeWhile((v) => v < 3),
		);
		await testResForEach(
			createResourceStream([1, 2, 3]).takeWhile((v) => v > -10),
		);

		try {
			await createResourceStream([1, 2, 3]).takeWhile(Err).count();
		} catch {}
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			await createErrorStream()
				.takeWhile(() => true)
				.count();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('dropWhile', async () => {
		expect(AsyncStream.empty().dropWhile((v) => true)).toBe(
			AsyncStream.empty(),
		);
		expect(AsyncStream.empty().dropWhile((v) => false)).toBe(
			AsyncStream.empty(),
		);
		expect(
			AsyncStream.of(1)
				.dropWhile(async (v) => true)
				.toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1)
				.dropWhile(async (v) => false)
				.toArray(),
		).resolves.toEqual([1]);
		for (const source of sources) {
			expect(source.dropWhile((v) => true).toArray()).resolves.toEqual([]);
			expect(source.dropWhile(async (v) => v < 97).toArray()).resolves.toEqual([
				97, 98, 99,
			]);
			expect(source.dropWhile((v, i) => i < 97).toArray()).resolves.toEqual([
				97, 98, 99,
			]);
		}
	});
	it('dropWhile close', async () => {
		await testResForEach(
			createResourceStream([1, 2, 3]).dropWhile((v) => v < 10),
		);
		await testResForEach(
			createResourceStream([1, 2, 3]).dropWhile((v) => v < -10),
		);

		try {
			await createResourceStream([1, 2, 3]).dropWhile(Err).count();
		} catch {}
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			await createErrorStream()
				.dropWhile(() => true)
				.count();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('take', async () => {
		expect(AsyncStream.empty().take(1)).toBe(AsyncStream.empty());
		expect(AsyncStream.of(1).take(0)).toBe(AsyncStream.empty());
		expect(AsyncStream.of(1).take(10).toArray()).resolves.toEqual([1]);
		const e = AsyncStream.of(1, 2, 3);
		expect(e.take(10).toArray()).resolves.toEqual([1, 2, 3]);
		expect(AsyncStream.of(1, 2, 3).take(2).toArray()).resolves.toEqual([1, 2]);
		for (const source of sources) {
			expect(source.take(3).toArray()).resolves.toEqual([0, 1, 2]);
		}
	});
	it('take close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]).take(2));
		await testResForEach(createResourceStream([1, 2, 3]).take(100));

		try {
			await createErrorStream().take(10).count();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('drop', async () => {
		expect(AsyncStream.empty().drop(1)).toBe(AsyncStream.empty());
		expect(AsyncStream.of(1).drop(1).toArray()).resolves.toEqual([]);
		expect(AsyncStream.of(1).drop(10).toArray()).resolves.toEqual([]);
		expect(AsyncStream.of(1, 2, 3).drop(10).toArray()).resolves.toEqual([]);
		expect(AsyncStream.of(1, 2, 3).drop(1).toArray()).resolves.toEqual([2, 3]);
		for (const source of sources) {
			expect(source.drop(97).toArray()).resolves.toEqual([97, 98, 99]);
		}
	});
	it('drop close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]).drop(2));
		await testResForEach(createResourceStream([1, 2, 3]).drop(0));

		try {
			await createErrorStream().drop(10).count();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('repeat', async () => {
		const nonStandardEmpty = AsyncStream.of(1).drop(1);
		expect(AsyncStream.empty().repeat(10)).toBe(AsyncStream.empty());
		expect(nonStandardEmpty.repeat(10).first('a')).resolves.toBe('a');
		const one = AsyncStream.of(1);
		expect(one.repeat(1)).toBe(one);
		expect(one.repeat(0)).toBe(one);
		expect(one.repeat(3).toArray()).resolves.toEqual([1, 1, 1]);
		expect(AsyncStream.of(1, 2, 3).repeat(2).toArray()).resolves.toEqual([
			1, 2, 3, 1, 2, 3,
		]);
		for (const source of sources) {
			expect(source.repeat(0)).toBe(source);
			expect(source.repeat(2).toArray()).resolves.toEqual(
				(await source.toArray()).concat(await source.toArray()),
			);
		}
	});
	it('repeat close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]).repeat(0));
		const s = createResourceStream([1, 2, 3]).repeat(10);
		await s.count();
		expect(close).toBeCalledTimes(10);

		close.mockReset();
		try {
			await createErrorStream().repeat(10).count();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});

	it('concat', async () => {
		const e = AsyncStream.empty<number>();
		const ne = AsyncStream.of(1, 2, 3);
		expect(e.concat(e)).toBe(e);
		expect(e.concat(ne)).toBe(ne);
		expect(ne.concat(e)).toBe(ne);
		expect(e.concat(e).toArray()).resolves.toEqual([]);
		expect(e.concat(ne).toArray()).resolves.toEqual([1, 2, 3]);
		expect(ne.concat(e).toArray()).resolves.toEqual([1, 2, 3]);
		expect(ne.concat(ne).toArray()).resolves.toEqual([1, 2, 3, 1, 2, 3]);
		expect(ne.concat(ne).concat(ne).toArray()).resolves.toEqual([
			1, 2, 3, 1, 2, 3, 1, 2, 3,
		]);
		for (const source of sources) {
			const arr = await source.toArray();
			expect(source.concat(source).toArray()).resolves.toEqual(arr.concat(arr));
		}
	});
	it('concat close', async () => {
		const s = createResourceStream([1, 2, 3]);
		const close2 = vi.fn();
		const s2 = createResourceStream([4, 5, 6], close2);
		const c = s.concat(s2);

		await testResForEach(c);

		close.mockReset();
		close2.mockReset();
		try {
			await s.concat(createErrorStream(close2)).count();
		} catch {}
		expect(close).toBeCalledTimes(1);
		expect(close2).toBeCalledTimes(1);
	});
	it('min', () => {
		expect(AsyncStream.empty().min(undefined)).resolves.toBe(undefined);
		expect(AsyncStream.of(1).min()).resolves.toBe(1);
		expect(AsyncStream.of(1, -10, 5).min()).resolves.toBe(-10);
		for (const source of sources) {
			expect(source.min(undefined)).resolves.toBe(0);
		}
	});
	it('min close', async () => {
		await createResourceStream([1, 2, 3]).min();
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			await createErrorStream().min();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('minBy', () => {
		function comp(s1: string, s2: string) {
			return s1.length - s2.length;
		}
		expect(AsyncStream.empty<string>().minBy(comp)).resolves.toBe(undefined);
		expect(AsyncStream.empty<string>().minBy(comp, 1)).resolves.toBe(1);
		expect(AsyncStream.of('a').minBy(comp)).resolves.toBe('a');
		expect(AsyncStream.of('ab', 'c', 'def').minBy(comp)).resolves.toBe('c');
	});
	it('minBy close', async () => {
		await createResourceStream([1, 2, 3]).minBy((a, b) => a - 1);
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		try {
			await createErrorStream().minBy(() => 1);
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('max', () => {
		expect(AsyncStream.empty().max(undefined)).resolves.toBe(undefined);
		expect(AsyncStream.of(1).max()).resolves.toBe(1);
		expect(AsyncStream.of(1, 10, 5).max()).resolves.toBe(10);
		for (const source of sources) {
			expect(source.max(undefined)).resolves.toBe(99);
		}
	});
	it('max close', async () => {
		await createResourceStream([1, 2, 3]).max();
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			await createErrorStream().max();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});

	it('maxBy', () => {
		function comp(s1: string, s2: string) {
			return s1.length - s2.length;
		}
		expect(AsyncStream.empty<string>().maxBy(comp)).resolves.toBe(undefined);
		expect(AsyncStream.empty<string>().maxBy(comp, 1)).resolves.toBe(1);
		expect(AsyncStream.of('a').maxBy(comp)).resolves.toBe('a');
		expect(AsyncStream.of('ab', 'c', 'def').maxBy(comp)).resolves.toBe('def');
	});
	it('maxBy close', async () => {
		await createResourceStream([1, 2, 3]).maxBy((a, b) => a - 1);
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			await createErrorStream().maxBy((v) => 1);
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('intersperse', () => {
		expect(AsyncStream.empty().intersperse([1])).toBe(AsyncStream.empty());
		expect(AsyncStream.of(1).intersperse([0]).toArray()).resolves.toEqual([1]);
		expect(AsyncStream.of(1, 2, 3).intersperse([0]).toArray()).resolves.toEqual(
			[1, 0, 2, 0, 3],
		);
		expect(
			AsyncStream.of(1, 2, 3).intersperse([0, 10]).toArray(),
		).resolves.toEqual([1, 0, 10, 2, 0, 10, 3]);
		expect(AsyncStream.of(1, 2, 3).intersperse([]).toArray()).resolves.toEqual([
			1, 2, 3,
		]);
	});
	it('intersperse close', async () => {
		const s1 = createResourceStream([1, 2, 3]);
		const close2 = vi.fn();
		const s2 = createResourceStream([4, 5], close2);

		const c = s1.intersperse(s2);

		await c.count();

		expect(close).toBeCalledTimes(1);
		expect(close2).toBeCalledTimes(2);

		await testResForEach(c);

		close.mockReset();
		close2.mockReset();

		await c.take(4).count();
		expect(close).toBeCalledTimes(1);
		expect(close2).toBeCalledTimes(1);

		close.mockReset();
		close2.mockReset();
		try {
			await s1.intersperse(createErrorStream(close2)).count();
		} catch {}

		expect(close).toBeCalledTimes(1);
		expect(close2).toBeCalledTimes(1);
	});

	it('join', () => {
		expect(AsyncStream.empty().join()).resolves.toBe('');
		expect(
			AsyncStream.empty().join({ start: '<', end: '>', sep: '-' }),
		).resolves.toBe('<>');
		expect(
			AsyncStream.empty().join({
				start: '<',
				end: '>',
				sep: '-',
				ifEmpty: 'abc',
			}),
		).resolves.toBe('abc');
		expect(
			AsyncStream.of(1).join({ start: '<', end: '>', sep: '-' }),
		).resolves.toBe('<1>');
		expect(
			AsyncStream.of(1, 2, 3).join({ start: '<', end: '>', sep: '-' }),
		).resolves.toBe('<1-2-3>');
		expect(AsyncStream.of(1, 2, 3).join()).resolves.toBe('123');
		expect(AsyncStream.of(1, 2, 3).join({ ifEmpty: 'abc' })).resolves.toBe(
			'123',
		);
	});
	it('join close', async () => {
		const s = createResourceStream([1, 2, 3]);
		await s.join();
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			await createErrorStream().join();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('mkGroup', () => {
		expect(
			AsyncStream.empty()
				.mkGroup({ start: [-1], end: [-2], sep: [-3] })
				.toArray(),
		).resolves.toEqual([-1, -2]);
		expect(AsyncStream.of(1).mkGroup({}).toArray()).resolves.toEqual([1]);
		expect(
			AsyncStream.of(1)
				.mkGroup({ start: [-1], end: [-2], sep: [-3] })
				.toArray(),
		).resolves.toEqual([-1, 1, -2]);
		expect(
			AsyncStream.of(1, 2, 3)
				.mkGroup({ start: [-1], end: [-2], sep: [-3] })
				.toArray(),
		).resolves.toEqual([-1, 1, -3, 2, -3, 3, -2]);
	});
	it('mkGroup close', async () => {
		const s = createResourceStream([1, 2, 3]);
		const closeStart = vi.fn();
		const start = createResourceStream([4, 5], closeStart);
		const closeSep = vi.fn();
		const sep = createResourceStream([6, 7], closeSep);
		const closeEnd = vi.fn();
		const end = createResourceStream([8, 9], closeEnd);

		const group = s.mkGroup({ sep, start, end });
		await group.count();
		expect(close).toBeCalledTimes(1);
		expect(closeStart).toBeCalledTimes(1);
		expect(closeEnd).toBeCalledTimes(1);
		expect(closeSep).toBeCalledTimes(2);

		close.mockReset();
		closeStart.mockReset();
		closeEnd.mockReset();
		closeSep.mockReset();
		try {
			await createErrorStream().mkGroup({ sep, start, end }).count();
		} catch {}
		expect(close).toBeCalledTimes(1);
		expect(closeStart).toBeCalledTimes(1);
		expect(closeEnd).toBeCalledTimes(0);
		expect(closeSep).toBeCalledTimes(1);
	});
	it('splitWhere', () => {
		function isEven(v: number) {
			return v % 2 === 0;
		}
		expect(
			AsyncStream.empty<number>().splitWhere(isEven).toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1, 3, 5).splitWhere(isEven).toArray(),
		).resolves.toEqual([[1, 3, 5]]);
		expect(
			AsyncStream.of(1, 2, 5).splitWhere(isEven).toArray(),
		).resolves.toEqual([[1], [5]]);
		expect(
			AsyncStream.of(2, 2, 5).splitWhere(isEven).toArray(),
		).resolves.toEqual([[], [], [5]]);
		expect(
			AsyncStream.of(2, 5, 2).splitWhere(isEven).toArray(),
		).resolves.toEqual([[], [5]]);
		expect(
			AsyncStream.of(2, 2, 2).splitWhere(isEven).toArray(),
		).resolves.toEqual([[], [], []]);
	});
	it('splitWhere close', async () => {
		await testResForEach(
			createResourceStream([1, 2, 3]).splitWhere((v) => v > 1),
		);
		await testResForEach(
			createResourceStream([1, 2, 3]).splitWhere((v) => true),
		);
		await testResForEach(
			createResourceStream([1, 2, 3]).splitWhere((v) => false),
		);

		close.mockReset();
		try {
			await createErrorStream()
				.splitWhere((v) => false)
				.count();
		} catch {}
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			await createResourceStream([1, 2, 3]).splitWhere(Err).count();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('splitOn', () => {
		expect(AsyncStream.empty<number>().splitOn(2).toArray()).resolves.toEqual(
			[],
		);
		expect(AsyncStream.of(1, 3, 5).splitOn(2).toArray()).resolves.toEqual([
			[1, 3, 5],
		]);
		expect(AsyncStream.of(1, 2, 5).splitOn(2).toArray()).resolves.toEqual([
			[1],
			[5],
		]);
		expect(AsyncStream.of(2, 2, 5).splitOn(2).toArray()).resolves.toEqual([
			[],
			[],
			[5],
		]);
		expect(AsyncStream.of(2, 5, 2).splitOn(2).toArray()).resolves.toEqual([
			[],
			[5],
		]);
		expect(AsyncStream.of(2, 2, 2).splitOn(2).toArray()).resolves.toEqual([
			[],
			[],
			[],
		]);
	});
	it('splitOn close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]).splitOn(2));
		await testResForEach(createResourceStream([1, 2, 3]).splitOn(10));
	});
	it('distinctPrevious', () => {
		expect(
			AsyncStream.empty<number>().distinctPrevious().toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1, 2, 3).distinctPrevious().toArray(),
		).resolves.toEqual([1, 2, 3]);
		expect(
			AsyncStream.of(1, 2, 2, 3).distinctPrevious().toArray(),
		).resolves.toEqual([1, 2, 3]);
		expect(
			AsyncStream.of(1, 2, 2, 3, 1, 1, 3).distinctPrevious().toArray(),
		).resolves.toEqual([1, 2, 3, 1, 3]);
	});
	it('splitOnSlice', () => {
		expect(
			AsyncStream.empty<number>().splitOnSlice([1, 2, 3]).toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1, 2).splitOnSlice([1, 2, 3]).toArray(),
		).resolves.toEqual([[1, 2]]);
		expect(
			AsyncStream.of(1, 2, 3).splitOnSlice([1, 2, 3]).toArray(),
		).resolves.toEqual([[]]);
		expect(
			AsyncStream.of(1, 1, 2, 3).splitOnSlice([1, 2, 3]).toArray(),
		).resolves.toEqual([[1]]);
		expect(
			AsyncStream.of(1, 1, 2, 3, 3).splitOnSlice([1, 2, 3]).toArray(),
		).resolves.toEqual([[1], [3]]);
		expect(
			AsyncStream.of(1, 1, 2, 3, 1, 2, 1, 2, 3, 1)
				.splitOnSlice([1, 2, 3])
				.toArray(),
		).resolves.toEqual([[1], [1, 2], [1]]);
	});
	it('distinctPrevious close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]).distinctPrevious());
		await testResForEach(
			createResourceStream([1, 1, 1, 2, 2, 3, 1, 1, 3]).distinctPrevious(),
		);
	});

	it('window', () => {
		expect(AsyncStream.empty<number>().window(3).toArray()).resolves.toEqual(
			[],
		);
		expect(AsyncStream.of(1, 2).window(3).toArray()).resolves.toEqual([]);
		expect(AsyncStream.of(1, 2, 3).window(3).toArray()).resolves.toEqual([
			[1, 2, 3],
		]);
		expect(AsyncStream.of(1, 2, 3, 4, 5).window(3).toArray()).resolves.toEqual([
			[1, 2, 3],
		]);
		expect(
			AsyncStream.of(1, 2, 3, 4, 5, 6).window(3).toArray(),
		).resolves.toEqual([
			[1, 2, 3],
			[4, 5, 6],
		]);
		expect(
			AsyncStream.of(1, 2, 3, 4, 5, 6).window(3, { skipAmount: 1 }).toArray(),
		).resolves.toEqual([
			[1, 2, 3],
			[2, 3, 4],
			[3, 4, 5],
			[4, 5, 6],
		]);
		expect(
			AsyncStream.of(1, 2, 3, 4, 5, 6).window(2, { skipAmount: 3 }).toArray(),
		).resolves.toEqual([
			[1, 2],
			[4, 5],
		]);
	});

	it('window collector', () => {
		const setCollector = AsyncReducer.from(Reducer.toJSSet<number>());

		expect(
			AsyncStream.empty<number>()
				.window(3, { collector: setCollector })
				.toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1, 2).window(3, { collector: setCollector }).toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1, 2, 3).window(3, { collector: setCollector }).toArray(),
		).resolves.toEqual([new Set([1, 2, 3])]);
		expect(
			AsyncStream.of(1, 2, 3, 4, 5)
				.window(3, { collector: setCollector })
				.toArray(),
		).resolves.toEqual([new Set([1, 2, 3])]);
		expect(
			AsyncStream.of(1, 2, 3, 4, 5, 6)
				.window(3, { collector: setCollector })
				.toArray(),
		).resolves.toEqual([new Set([1, 2, 3]), new Set([4, 5, 6])]);
		expect(
			AsyncStream.of(1, 2, 3, 4, 5, 6)
				.window(3, { skipAmount: 1, collector: setCollector })
				.toArray(),
		).resolves.toEqual([
			new Set([1, 2, 3]),
			new Set([2, 3, 4]),
			new Set([3, 4, 5]),
			new Set([4, 5, 6]),
		]);
	});

	it('window close', async () => {
		await testResForEach(createResourceStream([1, 2, 3]).window(2));
		await testResForEach(
			createResourceStream([1, 1, 1, 2, 2, 3, 1, 1, 3]).window(2, {
				skipAmount: 3,
			}),
		);
	});

	it('partition', () => {
		const isEven = (v: number) => v % 2 === 0;

		expect(
			AsyncStream.partition(AsyncStream.empty<number>(), isEven)(),
		).resolves.toEqual([[], []]);
		expect(AsyncStream.partition(AsyncStream.of(1), isEven)()).resolves.toEqual(
			[[], [1]],
		);
		expect(AsyncStream.partition(AsyncStream.of(0), isEven)()).resolves.toEqual(
			[[0], []],
		);
		expect(
			AsyncStream.partition(AsyncStream.of(1, 2, 3), isEven)(),
		).resolves.toEqual([[2], [1, 3]]);
	});

	it('partition collector', async () => {
		const isEven = async (v: number) => v % 2 === 0;

		expect(
			AsyncStream.partition(
				AsyncStream.empty<number>(),
				isEven,
			)({
				collectorTrue: Reducer.join<number>({ sep: ',' }),
				collectorFalse: Reducer.join<number>({ sep: ',' }),
			}),
		).resolves.toEqual(['', '']);
		expect(
			AsyncStream.partition(
				AsyncStream.of(1),
				isEven,
			)({
				collectorTrue: Reducer.join<number>({ sep: ',' }),
				collectorFalse: Reducer.join<number>({ sep: ',' }),
			}),
		).resolves.toEqual(['', '1']);
		expect(
			AsyncStream.partition(
				AsyncStream.of(0),
				isEven,
			)({
				collectorTrue: Reducer.join<number>({ sep: ',' }),
				collectorFalse: Reducer.join<number>({ sep: ',' }),
			}),
		).resolves.toEqual(['0', '']);
		expect(
			AsyncStream.partition(
				AsyncStream.of(1, 2, 3),
				isEven,
			)({
				collectorTrue: Reducer.join<number>({ sep: ',' }),
				collectorFalse: Reducer.join<number>({ sep: ',' }),
			}),
		).resolves.toEqual(['2', '1,3']);

		await AsyncStream.from(sources).forEach(async (source) => {
			const [left, right] = await AsyncStream.partition(
				source,
				(v) => v % 2 === 0,
			)();
			expect(left.length).toBe(50);
			expect(right.length).toBe(50);
		});
	});

	it('groupBy', async () => {
		expect(
			AsyncStream.groupBy(AsyncStream.empty<string>(), async (v) => v.length)(),
		).resolves.toEqual(new Map());
		expect(
			AsyncStream.groupBy(AsyncStream.of('a'), async (v) => v.length)(),
		).resolves.toEqual(new Map([[1, ['a']]]));
		expect(
			AsyncStream.groupBy(
				AsyncStream.of('abc', 'a', 'def', 'b', 'qq'),
				async (v) => v.length,
			)(),
		).resolves.toEqual(
			new Map([
				[1, ['a', 'b']],
				[2, ['qq']],
				[3, ['abc', 'def']],
			]),
		);

		AsyncStream.from(sources).forEach(async (source) => {
			const result = await AsyncStream.groupBy(source, async (v) => v % 4)();
			for (let i = 0; i < 4; i++) {
				expect(result.get(i)?.length).toBe(25);
			}
		});
	});

	it('groupBy collector', async () => {
		const collector = AsyncReducer.from(
			Reducer.toJSMultiMap<number, string>().mapInput<[number, string]>(
				([key, value]) => [key * 2, value],
			),
		);

		expect(
			AsyncStream.groupBy(
				AsyncStream.empty<string>(),
				(v) => v.length,
			)({
				collector,
			}),
		).resolves.toEqual(new Map());
		expect(
			AsyncStream.groupBy(AsyncStream.of('a'), (v) => v.length)({ collector }),
		).resolves.toEqual(new Map([[2, ['a']]]));
		expect(
			AsyncStream.groupBy(
				AsyncStream.of('abc', 'a', 'def', 'b', 'qq'),
				(v) => v.length,
			)({
				collector,
			}),
		).resolves.toEqual(
			new Map([
				[2, ['a', 'b']],
				[4, ['qq']],
				[6, ['abc', 'def']],
			]),
		);
	});

	it('fold', async () => {
		async function sum(
			current: number,
			value: number,
			index: number,
			halt: () => void,
		) {
			if (value > 10) {
				halt();
				return current;
			}
			return current + value;
		}
		expect(AsyncStream.empty<number>().fold(0, sum)).resolves.toBe(0);
		expect(AsyncStream.of(1, 2, 3).fold(0, sum)).resolves.toBe(6);
		expect(AsyncStream.of(1, 20, 3).fold(0, sum)).resolves.toBe(1);
	});
	it('fold close', async () => {
		await createResourceStream([1, 2, 3]).fold(1, (c) => c);
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1, 2, 3]).fold(1, (c, v, i, halt) => {
			halt();
			return c;
		});
		expect(close).toBeCalledTimes(1);
	});
	it('foldStream', async () => {
		async function sum(
			current: number,
			value: number,
			index: number,
			halt: () => void,
		) {
			if (value > 10) {
				halt();
				return current;
			}
			return current + value;
		}
		expect(
			AsyncStream.empty<number>().foldStream(0, sum).toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1, 2, 3).foldStream(0, sum).toArray(),
		).resolves.toEqual([1, 3, 6]);
		expect(
			AsyncStream.of(1, 20, 3).foldStream(0, sum).toArray(),
		).resolves.toEqual([1, 1]);
	});
	it('foldStream close', async () => {
		await testResForEach(
			createResourceStream([1, 2, 3]).foldStream(0, (c) => c),
		);
		await testResForEach(
			createResourceStream([1, 2, 3]).foldStream(
				0,
				(c: number, _: any, __: any, halt: () => void) => {
					halt();
					return c;
				},
			),
		);
	});
	it('reduce', async () => {
		expect(
			AsyncStream.empty<number>().reduce(AsyncReducer.from(Reducer.sum)),
		).resolves.toBe(0);
		expect(
			AsyncStream.of(1, 2, 3).reduce(AsyncReducer.from(Reducer.sum)),
		).resolves.toBe(6);
	});
	it('reduce close', async () => {
		await createResourceStream([1, 2, 3]).reduce(
			AsyncReducer.from(Reducer.count),
		);
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		await createResourceStream([1, 2, 3]).reduce(AsyncReducer.first<number>());
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			await createErrorStream().reduce(AsyncReducer.from(Reducer.sum));
		} catch {}
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			const errorReducer = AsyncReducer.createMono(() => 0, Err);

			await createResourceStream([1, 2, 3]).reduce(errorReducer);
		} catch {}
		expect(close).toBeCalledTimes(1);
	});
	it('reduce close reducer', async () => {
		const endReducer = vi.fn();

		const asyncSum = AsyncReducer.createMono<number>(
			async () => 0,
			async (c, v) => c + v,
			async (v) => v * 2,
			endReducer,
		);

		expect(AsyncStream.of(1, 2, 3).reduce(asyncSum)).resolves.toBe(12);
		expect(endReducer).toBeCalledTimes(1);

		endReducer.mockReset();
		try {
			await createErrorStream().reduce(asyncSum);
		} catch {}
		expect(endReducer).toBeCalledTimes(1);

		const asyncError = AsyncReducer.createMono<number>(
			async () => 0,
			Err,
			async (v) => v * 2,
			endReducer,
		);

		endReducer.mockReset();
		try {
			await AsyncStream.of(1, 2, 3).reduce(asyncError);
		} catch {}
		expect(endReducer).toBeCalledTimes(1);
	});
	it('reduceStream', async () => {
		expect(
			AsyncStream.empty<number>()
				.reduceStream(AsyncReducer.from(Reducer.sum))
				.toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1, 2, 3)
				.reduceStream(AsyncReducer.from(Reducer.sum))
				.toArray(),
		).resolves.toEqual([1, 3, 6]);
	});
	it('reduceStream close', async () => {
		await testResForEach(
			createResourceStream([1, 2, 3]).reduceStream(
				AsyncReducer.from(Reducer.count),
			),
		);
		await testResForEach(
			createResourceStream([1, 2, 3]).reduceStream(AsyncReducer.first()),
		);
	});
	it('reduceAll', async () => {
		expect(
			AsyncStream.empty<number>().reduce([Reducer.sum, Reducer.count]),
		).resolves.toEqual([0, 0]);
		expect(
			AsyncStream.of(1, 2, 3).reduce([Reducer.sum, Reducer.count]),
		).resolves.toEqual([6, 3]);
		expect(
			AsyncStream.from(Stream.range({ start: 0 })).reduce([
				AsyncReducer.first<number>(),
				AsyncReducer.first<number>(),
			]),
		).resolves.toEqual([0, 0]);
	});
	it('reduceAll close', async () => {
		await createResourceStream([1, 2, 3]).reduce([
			AsyncReducer.from(Reducer.count),
			AsyncReducer.from(Reducer.count),
		]);
		expect(close).toBeCalledTimes(1);
		close.mockReset();
		await createResourceStream([1, 2, 3]).reduce([
			AsyncReducer.first<number>(),
			AsyncReducer.first<number>(),
		]);
		expect(close).toBeCalledTimes(1);
	});

	it('reduceStream array shape', async () => {
		expect(
			AsyncStream.empty<number>()
				.reduceStream([
					AsyncReducer.from(Reducer.sum),
					AsyncReducer.from(Reducer.count),
				])
				.toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.of(1, 2, 3)
				.reduceStream([
					AsyncReducer.from(Reducer.sum),
					AsyncReducer.from(Reducer.count),
				])
				.toArray(),
		).resolves.toEqual([
			[1, 1],
			[3, 2],
			[6, 3],
		]);
	});
	it('reduceStream array shape close', async () => {
		await testResForEach(
			createResourceStream([1, 2, 3]).reduceStream([
				AsyncReducer.from(Reducer.count),
				AsyncReducer.from(Reducer.count),
			]),
		);
		await testResForEach(
			createResourceStream([1, 2, 3]).reduceStream([
				AsyncReducer.first<number>(),
				AsyncReducer.first<number>(),
			]),
		);

		const exit1 = vi.fn();
		const exit2 = vi.fn();

		try {
			await createErrorStream()
				.reduceStream([
					AsyncReducer.createMono(
						() => 0,
						() => 0,
						() => 0,
						exit1,
					),
					AsyncReducer.createMono(
						() => 0,
						() => 0,
						() => 0,
						exit2,
					),
				])
				.count();
		} catch {}

		expect(close).toBeCalledTimes(1);
		expect(exit1).toBeCalledTimes(1);
		expect(exit2).toBeCalledTimes(1);

		close.mockReset();
		exit1.mockReset();
		exit2.mockReset();

		try {
			await createResourceStream([1, 2, 3])
				.reduceStream([
					AsyncReducer.createMono(
						() => 0,
						() => 0,
						() => 0,
						exit1,
					),
					AsyncReducer.createMono(
						() => 0,
						Err,
						() => 0,
						exit2,
					),
				])
				.count();
		} catch {}

		expect(close).toBeCalledTimes(1);
		expect(exit1).toBeCalledTimes(1);
		expect(exit2).toBeCalledTimes(1);
	});

	it('toArray', async () => {
		expect(AsyncStream.empty().toArray()).resolves.toEqual([]);
		expect(AsyncStream.of(1).toArray()).resolves.toEqual([1]);
		expect(AsyncStream.from([1, 2, 3]).toArray()).resolves.toEqual([1, 2, 3]);
		const a1 = await streamRange1.toArray();
		for (const source of sources) {
			expect(source.toArray()).resolves.toEqual(a1);
		}
	});
	it('toArray close', async () => {
		await createResourceStream([1, 2, 3]).toArray();
		expect(close).toBeCalledTimes(1);

		close.mockReset();
		try {
			await createErrorStream().toArray();
		} catch {}
		expect(close).toBeCalledTimes(1);
	});

	it('toString', () => {
		expect(AsyncStream.empty<string>().toString()).toBe('AsyncStream(<empty>)');
		expect(AsyncStream.of(1).toString()).toBe(
			'AsyncStream(...<potentially empty>)',
		);
	});

	it('zipWith', async () => {
		expect(
			AsyncStream.zipWith(
				AsyncStream.empty<number>(),
				[],
			)((a, b) => a + b).toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.zipWith(
				AsyncStream.of(1, 2, 3),
				[],
			)((a, b) => a + b).toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.zipWith(
				AsyncStream.empty<number>(),
				[1, 2, 3],
			)((a, b) => a + b).toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.zipWith(
				AsyncStream.of(1, 2, 3),
				[1, 2, 3],
			)(async (a, b) => a + b).toArray(),
		).resolves.toEqual([2, 4, 6]);
		expect(
			AsyncStream.zipWith(
				AsyncStream.of(1),
				[1, 2, 3],
			)((a, b) => a + b).toArray(),
		).resolves.toEqual([2]);
		expect(
			AsyncStream.zipWith(
				AsyncStream.of(1, 2, 3),
				[1],
			)((a, b) => a + b).toArray(),
		).resolves.toEqual([2]);
	});
	it('zipWith close', async () => {
		const s1 = createResourceStream([1, 2, 3]);

		{
			const close2 = vi.fn();
			const s2 = createResourceStream([4, 5, 6], close2);
			const res = AsyncStream.zipWith(s1, s2)((v1, v2) => [v1, v2] as const);
			await res.count();
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}

		{
			close.mockReset();
			const close2 = vi.fn();
			const s2 = createResourceStream([4, 5], close2);
			const res = AsyncStream.zipWith(s1, s2)((v1, v2) => [v1, v2] as const);
			await res.count();
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}

		{
			close.mockReset();
			const close2 = vi.fn();
			const s2 = createResourceStream([4, 5], close2);
			const res = AsyncStream.zipWith(s2, s1)((v1, v2) => [v1, v2] as const);
			await res.count();
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}
	});
	it('zip', async () => {
		expect(AsyncStream.zip(AsyncStream.empty(), AsyncStream.empty())).toBe(
			AsyncStream.empty(),
		);
		expect(AsyncStream.zip(AsyncStream.empty(), AsyncStream.of(1))).toBe(
			AsyncStream.empty(),
		);
		expect(AsyncStream.zip(AsyncStream.of(1), AsyncStream.empty())).toBe(
			AsyncStream.empty(),
		);
		expect(
			AsyncStream.zip(AsyncStream.of(1), AsyncStream.of(2)).toArray(),
		).resolves.toEqual([[1, 2]]);
		expect(
			AsyncStream.zip(AsyncStream.of(1, 2, 3), AsyncStream.of(2)).toArray(),
		).resolves.toEqual([[1, 2]]);
		expect(
			AsyncStream.zip(AsyncStream.of(1), AsyncStream.of(2, 3, 4)).toArray(),
		).resolves.toEqual([[1, 2]]);
		expect(
			AsyncStream.zip(
				AsyncStream.of(1, 2, 3, 4, 5),
				AsyncStream.of(2, 3, 4),
				AsyncStream.of(3, 4, 5, 6),
			).toArray(),
		).resolves.toEqual([
			[1, 2, 3],
			[2, 3, 4],
			[3, 4, 5],
		]);
		for (const source of sources) {
			expect(AsyncStream.zip(source, source).toArray()).resolves.toEqual(
				await source.map((v) => [v, v] as [number, number]).toArray(),
			);
		}
	});
	it('zip close', async () => {
		const s1 = createResourceStream([1, 2, 3]);

		{
			const close2 = vi.fn();
			const s2 = createResourceStream([4, 5, 6], close2);
			const res = AsyncStream.zip(s1, s2);
			await res.count();
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}

		{
			close.mockReset();
			const close2 = vi.fn();
			const s2 = createResourceStream([4, 5], close2);
			const res = AsyncStream.zip(s1, s2);
			await res.count();
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}

		{
			close.mockReset();
			const close2 = vi.fn();
			const s2 = createResourceStream([4, 5], close2);
			const res = AsyncStream.zip(s2, s1);
			await res.count();
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}
	});
	it('zipAllWith', async () => {
		expect(
			AsyncStream.zipAllWith(AsyncStream.empty<number>(), [])(
				10,
				(a, b) => a + b,
			).toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.zipAllWith(AsyncStream.of(1, 2, 3), [])(
				10,
				(a, b) => a + b,
			).toArray(),
		).resolves.toEqual([11, 12, 13]);
		expect(
			AsyncStream.zipAllWith(AsyncStream.empty<number>(), [1, 2, 3])(
				10,
				(a, b) => a + b,
			).toArray(),
		).resolves.toEqual([11, 12, 13]);
		expect(
			AsyncStream.zipAllWith(AsyncStream.of(1, 2, 3), [1, 2, 3])(
				10,
				(a, b) => a + b,
			).toArray(),
		).resolves.toEqual([2, 4, 6]);
		expect(
			AsyncStream.zipAllWith(AsyncStream.of(1), [1, 2, 3])(
				10,
				(a, b) => a + b,
			).toArray(),
		).resolves.toEqual([2, 12, 13]);
		expect(
			AsyncStream.zipAllWith(AsyncStream.of(1, 2, 3), [1])(
				10,
				(a, b) => a + b,
			).toArray(),
		).resolves.toEqual([2, 12, 13]);
	});
	it('zipAllWith close', async () => {
		const s1 = createResourceStream([1, 2, 3]);

		{
			const close2 = vi.fn();
			const s2 = createResourceStream([4, 5, 6], close2);
			const res = AsyncStream.zipAllWith(s1, s2)(-1, (v1, v2) => v1);
			await res.count();
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}

		{
			close.mockReset();
			const close2 = vi.fn();
			const s2 = createResourceStream([4, 5], close2);
			const res = AsyncStream.zipAllWith(s1, s2)(
				-1,
				(v1, v2) => [v1, v2] as const,
			);
			await res.count();
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}

		{
			close.mockReset();
			const close2 = vi.fn();
			const s2 = createResourceStream([4, 5], close2);
			const res = AsyncStream.zipAllWith(s2, s1)(
				-1,
				(v1, v2) => [v1, v2] as const,
			);
			await res.count();
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}
	});

	it('zipAll', async () => {
		expect(
			AsyncStream.zipAll(
				undefined,
				AsyncStream.empty(),
				AsyncStream.empty(),
			).toArray(),
		).resolves.toEqual([]);
		expect(
			AsyncStream.zipAll(
				undefined,
				AsyncStream.of(1),
				AsyncStream.empty(),
			).toArray(),
		).resolves.toEqual([[1, undefined]]);
		expect(
			AsyncStream.zipAll(
				undefined,
				AsyncStream.empty(),
				AsyncStream.of(1),
			).toArray(),
		).resolves.toEqual([[undefined, 1]]);
		expect(
			AsyncStream.zipAll(
				undefined,
				AsyncStream.of(1),
				AsyncStream.of(2),
			).toArray(),
		).resolves.toEqual([[1, 2]]);
		expect(
			AsyncStream.zipAll(
				undefined,
				AsyncStream.of(1, 2, 3),
				AsyncStream.of(10, 11),
			).toArray(),
		).resolves.toEqual([
			[1, 10],
			[2, 11],
			[3, undefined],
		]);
	});
	it('zipAll close', async () => {
		const s1 = createResourceStream([1, 2, 3]);

		{
			const close2 = vi.fn();
			const s2 = createResourceStream([4, 5, 6], close2);
			const res = AsyncStream.zipAll(-1, s1, s2);
			await res.count();
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}

		{
			close.mockReset();
			const close2 = vi.fn();
			const s2 = createResourceStream([4, 5], close2);
			const res = AsyncStream.zipAll(-1, s1, s2);
			await res.count();
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}

		{
			close.mockReset();
			const close2 = vi.fn();
			const s2 = createResourceStream([4, 5], close2);
			const res = AsyncStream.zipAll(-1, s2, s1);
			await res.count();
			expect(close).toBeCalledTimes(1);
			expect(close2).toBeCalledTimes(1);
		}
	});

	it('unzip', async () => {
		const [u1l, u1r] = AsyncStream.unzip(
			AsyncStream.empty<[number, string]>(),
			{ length: 2 },
		);
		expect(u1l.toArray()).resolves.toEqual([]);
		expect(u1r.toArray()).resolves.toEqual([]);
		const [u2l, u2r] = AsyncStream.unzip(
			AsyncStream.of<[number, string]>([1, 'a'], [2, 'b']),
			{
				length: 2,
			},
		);
		expect(u2l.toArray()).resolves.toEqual([1, 2]);
		expect(u2r.toArray()).resolves.toEqual(['a', 'b']);
	});

	it('unzip close', async () => {
		const [s1, s2] = AsyncStream.unzip(
			createResourceStream([
				[1, 'a'],
				[2, 'b'],
				[3, 'c'],
			] as [number, string][]),
			{ length: 2 },
		);

		await s1.count();
		expect(close).toBeCalledTimes(1);

		close.mockReset();

		await s2.count();
		expect(close).toBeCalledTimes(1);
	});
});
