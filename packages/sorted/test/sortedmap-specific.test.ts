import { describe, expect, it } from 'bun:test';

import { SortedMap } from '@rimbu/sorted/map';
import { Stream } from '@rimbu/stream';

function entries<T>(...keys: T[]): [T, T][] {
	return keys.map((v) => [v, v]);
}

function runWith(name: string, context: SortedMap.Context<number>): void {
	describe(name, () => {
		it('stream reversed', () => {
			expect(context.empty().stream({ reversed: true }).toArray()).toEqual([]);
			expect(
				context
					.from(entries(8, 3, 5, 2))
					.stream({ reversed: true })
					.toArray(),
			).toEqual(entries(8, 5, 3, 2));
			const map = context.from(
				Stream.range({ amount: 100 }).map((v) => [v, v]),
			);
			expect(map.stream({ reversed: true }).toArray()).toEqual(
				Stream.range({ start: 99, end: 0 }, { delta: -1 })
					.map((v) => [v, v] as const)
					.toArray(),
			);
		});

		it('streamKeys reversed', () => {
			expect(context.empty().streamKeys({ reversed: true }).toArray()).toEqual(
				[],
			);
			expect(
				context
					.from(entries(8, 3, 5, 2))
					.streamKeys({ reversed: true })
					.toArray(),
			).toEqual([8, 5, 3, 2]);
			const map = context.from(
				Stream.range({ amount: 100 }).map((v) => [v, v]),
			);
			expect(map.streamKeys({ reversed: true }).toArray()).toEqual(
				Stream.range({ start: 99, end: 0 }, { delta: -1 }).toArray(),
			);
		});

		it('streamValues reversed', () => {
			expect(
				context.empty().streamValues({ reversed: true }).toArray(),
			).toEqual([]);
			expect(
				context
					.from(entries(8, 3, 5, 2))
					.streamValues({ reversed: true })
					.toArray(),
			).toEqual([8, 5, 3, 2]);
			const map = context.from(
				Stream.range({ amount: 100 }).map((v) => [v, v]),
			);
			expect(map.streamValues({ reversed: true }).toArray()).toEqual(
				Stream.range({ start: 99, end: 0 }, { delta: -1 }).toArray(),
			);
		});

		it('sliceIndex', () => {
			expect(context.empty().sliceIndex({ amount: 10 })).toBe(context.empty());
			const map = context.from(
				Stream.range({ amount: 100 }).map((v) => [v, v]),
			);

			expect(map.sliceIndex({ amount: 3 }).toArray()).toEqual(entries(0, 1, 2));
			expect(map.sliceIndex({ start: 3, amount: 3 }).toArray()).toEqual(
				entries(3, 4, 5),
			);
			expect(
				map.sliceIndex({ start: [3, false], amount: 3 }).toArray(),
			).toEqual(entries(4, 5, 6));
			expect(map.sliceIndex({ end: 3 }).toArray()).toEqual(entries(0, 1, 2, 3));
			expect(map.sliceIndex({ end: [3, false] }).toArray()).toEqual(
				entries(0, 1, 2),
			);
			expect(map.sliceIndex({ start: 97 }).toArray()).toEqual(
				entries(97, 98, 99),
			);
			expect(map.sliceIndex({ start: [97, false] }).toArray()).toEqual(
				entries(98, 99),
			);
			expect(map.sliceIndex({ start: 0, end: 3 }).toArray()).toEqual(
				entries(0, 1, 2, 3),
			);
			expect(
				map.sliceIndex({ start: [0, false], end: [3, false] }).toArray(),
			).toEqual(entries(1, 2));

			expect(map.sliceIndex({ start: -3 }).toArray()).toEqual(
				entries(97, 98, 99),
			);
			expect(map.sliceIndex({ start: [-3, false] }).toArray()).toEqual(
				entries(98, 99),
			);

			expect(map.sliceIndex({ start: -3, end: -2 }).toArray()).toEqual(
				entries(97, 98),
			);
			expect(map.sliceIndex({ start: -3, amount: 2 }).toArray()).toEqual(
				entries(97, 98),
			);
		});

		it('slice', () => {
			expect(context.empty().slice({ start: 3 })).toBe(context.empty());
			const map = context.from(
				Stream.range({ amount: 100 }).map((v) => [v, v]),
			);
			expect(map.slice({ end: 3 }).toArray()).toEqual(entries(0, 1, 2, 3));
			expect(map.slice({ end: [3, false] }).toArray()).toEqual(
				entries(0, 1, 2),
			);
			expect(map.slice({ end: 3.5 }).toArray()).toEqual(entries(0, 1, 2, 3));
			expect(map.slice({ end: [3.5, false] }).toArray()).toEqual(
				entries(0, 1, 2, 3),
			);
			expect(map.slice({ start: 97 }).toArray()).toEqual(entries(97, 98, 99));
			expect(map.slice({ start: [97, false] }).toArray()).toEqual(
				entries(98, 99),
			);
			expect(map.slice({ start: 0, end: 3 }).toArray()).toEqual(
				entries(0, 1, 2, 3),
			);
			expect(
				map.slice({ start: [0, false], end: [3, false] }).toArray(),
			).toEqual(entries(1, 2));
			expect(map.slice({ start: 97.5 }).toArray()).toEqual(entries(98, 99));
			expect(map.slice({ start: [97.5, false] }).toArray()).toEqual(
				entries(98, 99),
			);
			expect(map.slice({ start: 0.5, end: 3.5 }).toArray()).toEqual(
				entries(1, 2, 3),
			);
			expect(
				map.slice({ start: [0.5, false], end: [3.5, false] }).toArray(),
			).toEqual(entries(1, 2, 3));
		});

		it('streamSliceIndex', () => {
			expect(context.empty().streamSliceIndex({ amount: 10 })).toBe(
				Stream.empty(),
			);
			const map = context.from(
				Stream.range({ amount: 100 }).map((v) => [v, v]),
			);
			expect(map.streamSliceIndex({ amount: 3 }).toArray()).toEqual(
				entries(0, 1, 2),
			);
			expect(map.streamSliceIndex({ start: 3, amount: 3 }).toArray()).toEqual(
				entries(3, 4, 5),
			);
			expect(
				map.streamSliceIndex({ start: [3, false], amount: 3 }).toArray(),
			).toEqual(entries(4, 5, 6));
			expect(map.streamSliceIndex({ end: 3 }).toArray()).toEqual(
				entries(0, 1, 2, 3),
			);
			expect(map.streamSliceIndex({ end: [3, false] }).toArray()).toEqual(
				entries(0, 1, 2),
			);
			expect(map.streamSliceIndex({ start: 97 }).toArray()).toEqual(
				entries(97, 98, 99),
			);
			expect(map.streamSliceIndex({ start: [97, false] }).toArray()).toEqual(
				entries(98, 99),
			);
			expect(map.streamSliceIndex({ start: 0, end: 3 }).toArray()).toEqual(
				entries(0, 1, 2, 3),
			);
			expect(
				map.streamSliceIndex({ start: [0, false], end: [3, false] }).toArray(),
			).toEqual(entries(1, 2));

			expect(map.streamSliceIndex({ start: -3 }).toArray()).toEqual(
				entries(97, 98, 99),
			);
			expect(map.streamSliceIndex({ start: [-3, false] }).toArray()).toEqual(
				entries(98, 99),
			);

			expect(map.streamSliceIndex({ start: -3, end: -2 }).toArray()).toEqual(
				entries(97, 98),
			);
			expect(map.streamSliceIndex({ start: -3, amount: 2 }).toArray()).toEqual(
				entries(97, 98),
			);
		});

		it('streamSliceIndex reversed', () => {
			expect(
				context.empty().streamSliceIndex({ amount: 10 }, { reversed: true }),
			).toBe(Stream.empty());
			const map = context.from(
				Stream.range({ amount: 100 }).map((v) => [v, v]),
			);
			expect(
				map.streamSliceIndex({ amount: 3 }, { reversed: true }).toArray(),
			).toEqual(entries(2, 1, 0));
			expect(
				map
					.streamSliceIndex({ start: 3, amount: 3 }, { reversed: true })
					.toArray(),
			).toEqual(entries(5, 4, 3));
			expect(
				map
					.streamSliceIndex(
						{ start: [3, false], amount: 3 },
						{ reversed: true },
					)
					.toArray(),
			).toEqual(entries(6, 5, 4));
			expect(
				map.streamSliceIndex({ end: 3 }, { reversed: true }).toArray(),
			).toEqual(entries(3, 2, 1, 0));
			expect(
				map.streamSliceIndex({ end: [3, false] }, { reversed: true }).toArray(),
			).toEqual(entries(2, 1, 0));
			expect(
				map.streamSliceIndex({ start: 97 }, { reversed: true }).toArray(),
			).toEqual(entries(99, 98, 97));
			expect(
				map
					.streamSliceIndex({ start: [97, false] }, { reversed: true })
					.toArray(),
			).toEqual(entries(99, 98));
			expect(
				map
					.streamSliceIndex({ start: 0, end: 3 }, { reversed: true })
					.toArray(),
			).toEqual(entries(3, 2, 1, 0));
			expect(
				map
					.streamSliceIndex(
						{ start: [0, false], end: [3, false] },
						{ reversed: true },
					)
					.toArray(),
			).toEqual(entries(2, 1));

			expect(
				map.streamSliceIndex({ start: -3 }, { reversed: true }).toArray(),
			).toEqual(entries(99, 98, 97));
			expect(
				map
					.streamSliceIndex({ start: [-3, false] }, { reversed: true })
					.toArray(),
			).toEqual(entries(99, 98));

			expect(
				map
					.streamSliceIndex({ start: -3, end: -2 }, { reversed: true })
					.toArray(),
			).toEqual(entries(98, 97));
			expect(
				map
					.streamSliceIndex({ start: -3, amount: 2 }, { reversed: true })
					.toArray(),
			).toEqual(entries(98, 97));
		});

		it('streamRange', () => {
			expect(context.empty().streamRange({ start: 3 })).toBe(Stream.empty());
			const map = context.from(
				Stream.range({ amount: 100 }).map((v) => [v, v]),
			);
			expect(map.streamRange({ end: 3 }).toArray()).toEqual(
				entries(0, 1, 2, 3),
			);
			expect(map.streamRange({ end: [3, false] }).toArray()).toEqual(
				entries(0, 1, 2),
			);
			expect(map.streamRange({ end: 3.5 }).toArray()).toEqual(
				entries(0, 1, 2, 3),
			);
			expect(map.streamRange({ end: [3.5, false] }).toArray()).toEqual(
				entries(0, 1, 2, 3),
			);
			expect(map.streamRange({ start: 97 }).toArray()).toEqual(
				entries(97, 98, 99),
			);
			expect(map.streamRange({ start: [97, false] }).toArray()).toEqual(
				entries(98, 99),
			);
			expect(map.streamRange({ start: 0, end: 3 }).toArray()).toEqual(
				entries(0, 1, 2, 3),
			);
			expect(
				map.streamRange({ start: [0, false], end: [3, false] }).toArray(),
			).toEqual(entries(1, 2));
			expect(map.streamRange({ start: 97.5 }).toArray()).toEqual(
				entries(98, 99),
			);
			expect(map.streamRange({ start: [97.5, false] }).toArray()).toEqual(
				entries(98, 99),
			);
			expect(map.streamRange({ start: 0.5, end: 3.5 }).toArray()).toEqual(
				entries(1, 2, 3),
			);
			expect(
				map.streamRange({ start: [0.5, false], end: [3.5, false] }).toArray(),
			).toEqual(entries(1, 2, 3));
		});

		it('streamRange reversed', () => {
			expect(
				context.empty().streamRange({ start: 3 }, { reversed: true }),
			).toBe(Stream.empty());
			const map = context.from(
				Stream.range({ amount: 100 }).map((v) => [v, v]),
			);
			expect(map.streamRange({ end: 3 }, { reversed: true }).toArray()).toEqual(
				entries(3, 2, 1, 0),
			);
			expect(
				map.streamRange({ end: [3, false] }, { reversed: true }).toArray(),
			).toEqual(entries(2, 1, 0));
			expect(
				map.streamRange({ end: 3.5 }, { reversed: true }).toArray(),
			).toEqual(entries(3, 2, 1, 0));
			expect(
				map.streamRange({ end: [3.5, false] }, { reversed: true }).toArray(),
			).toEqual(entries(3, 2, 1, 0));
			expect(
				map.streamRange({ start: 97 }, { reversed: true }).toArray(),
			).toEqual(entries(99, 98, 97));
			expect(
				map.streamRange({ start: [97, false] }, { reversed: true }).toArray(),
			).toEqual(entries(99, 98));
			expect(
				map.streamRange({ start: 0, end: 3 }, { reversed: true }).toArray(),
			).toEqual(entries(3, 2, 1, 0));
			expect(
				map
					.streamRange(
						{ start: [0, false], end: [3, false] },
						{ reversed: true },
					)
					.toArray(),
			).toEqual(entries(2, 1));
			expect(
				map.streamRange({ start: 97.5 }, { reversed: true }).toArray(),
			).toEqual(entries(99, 98));
			expect(
				map.streamRange({ start: [97.5, false] }, { reversed: true }).toArray(),
			).toEqual(entries(99, 98));
			expect(
				map.streamRange({ start: 0.5, end: 3.5 }, { reversed: true }).toArray(),
			).toEqual(entries(3, 2, 1));
			expect(
				map
					.streamRange(
						{ start: [0.5, false], end: [3.5, false] },
						{ reversed: true },
					)
					.toArray(),
			).toEqual(entries(3, 2, 1));
		});

		it('findIndex', () => {
			expect(context.empty().indexOf(5)).toBeUndefined();

			const map = context.from(entries(8, 3, 5, 2));
			expect(map.indexOf(2)).toBe(0);
			expect(map.indexOf(3)).toBe(1);
			expect(map.indexOf(5)).toBe(2);
			expect(map.indexOf(8)).toBe(3);
			expect(map.indexOf(10)).toBeUndefined();
			expect(map.indexOf(5, -1)).toBe(2);
			expect(map.indexOf(10, -1)).toBe(-1);

			const largeMap = context.from(
				Stream.range({ amount: 100 }).map((v) => [v, v]),
			);
			expect(largeMap.indexOf(0)).toBe(0);
			expect(largeMap.indexOf(50)).toBe(50);
			expect(largeMap.indexOf(99)).toBe(99);
			expect(largeMap.indexOf(100)).toBeUndefined();
			expect(largeMap.indexOf(100, -2)).toBe(-2);

			for (const key of largeMap.streamKeys()) {
				expect(largeMap.indexOf(key)).toBe(key);
			}
		});

		it('atIndex', () => {
			expect(context.empty().at(0)).toBeUndefined();

			const map = context.from(entries(8, 3, 5, 2));
			expect(map.at(0)).toEqual([2, 2]);
			expect(map.at(1)).toEqual([3, 3]);
			expect(map.at(-1)).toEqual([8, 8]);
			expect(map.at(10)).toBeUndefined();
			expect(map.at(10, ['q', 0])).toEqual(['q', 0]);
		});

		it('lowerBound / upperBound', () => {
			const map = context.from(entries(8, 3, 5, 2));

			expect(map.lowerBound(2)).toBe(0);
			expect(map.lowerBound(3)).toBe(1);
			expect(map.lowerBound(4)).toBe(2);
			expect(map.lowerBound(8)).toBe(3);
			expect(map.lowerBound(99)).toBe(4);

			expect(map.upperBound(2)).toBe(1);
			expect(map.upperBound(3)).toBe(2);
			expect(map.upperBound(4)).toBe(2);
			expect(map.upperBound(8)).toBe(4);
			expect(map.upperBound(99)).toBe(4);

			expect(context.empty().lowerBound(5)).toBe(0);
			expect(context.empty().upperBound(5)).toBe(0);
		});

		it('nextEntry / previousEntry', () => {
			const map = context.from(entries(8, 3, 5, 2));

			expect(map.nextEntry(2)).toEqual([3, 3]);
			expect(map.nextEntry(3)).toEqual([5, 5]);
			expect(map.nextEntry(5)).toEqual([8, 8]);
			expect(map.nextEntry(8)).toBeUndefined();
			expect(map.nextEntry(99)).toBeUndefined();
			expect(map.nextEntry(8, { inclusive: true })).toEqual([8, 8]);

			expect(map.previousEntry(8)).toEqual([5, 5]);
			expect(map.previousEntry(5)).toEqual([3, 3]);
			expect(map.previousEntry(3)).toEqual([2, 2]);
			expect(map.previousEntry(2)).toBeUndefined();
			expect(map.previousEntry(0)).toBeUndefined();
			expect(map.previousEntry(2, { inclusive: true })).toEqual([2, 2]);

			expect(map.nextEntry(4)).toEqual([5, 5]);
			expect(map.previousEntry(4)).toEqual([3, 3]);

			expect(context.empty().nextEntry(5)).toBeUndefined();
			expect(context.empty().previousEntry(5)).toBeUndefined();

			expect(map.previousEntry(2, { otherwise: 'x' })).toBe('x');
			expect(map.nextEntry(8, { otherwise: 'x' })).toBe('x');
		});
	});
}

runWith('SortedMap default', SortedMap.createContext());
runWith(
	'SortedMap block bits 2',
	SortedMap.createContext({ blockSizeBits: 2 }),
);
