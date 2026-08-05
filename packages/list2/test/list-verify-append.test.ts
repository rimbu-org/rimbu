import { describe, expect, it } from 'bun:test';

import { List } from '@rimbu/list';

function verifyStructure(list: List<number>): string[] {
	if (list.isEmpty) return [];

	return (
		list as unknown as {
			_verifyStructure(errors?: string[]): string[];
		}
	)._verifyStructure();
}

function expectValid(list: List<number>): void {
	expect(verifyStructure(list)).toEqual([]);
}

function buildList(
	ctx: List.Context<number>,
	size: number,
	direction: 'append' | 'prepend',
): List<number> {
	let list: List<number> = ctx.empty<number>();

	for (let i = 0; i < size; i++) {
		list = direction === 'append' ? list.append(i) : list.prepend(i);
	}

	return list;
}

const blockSizeBitsValues = [2, 3, 4, 5] as const;

for (const blockSizeBits of blockSizeBitsValues) {
	const maxBlockSize = 1 << blockSizeBits;
	const totalElements = maxBlockSize * maxBlockSize * 2;
	const values = Array.from({ length: totalElements }, (_, i) => i);

	describe(`list structure (blockSizeBits=${blockSizeBits}, maxBlockSize=${maxBlockSize})`, () => {
		describe('append', () => {
			it('successive appends maintain valid structure and order', () => {
				const ctx = List.createContext({ blockSizeBits });
				let list: List<number> = ctx.empty<number>();

				for (const value of values) {
					list = list.append(value);
					expectValid(list);
				}

				expect(list.toArray()).toEqual(values);
			});
		});

		describe('prepend', () => {
			it('successive prepends maintain valid structure and order', () => {
				const ctx = List.createContext({ blockSizeBits });
				let list: List<number> = ctx.empty<number>();

				for (const value of values) {
					list = list.prepend(value);
					expectValid(list);
				}

				expect(list.toArray()).toEqual([...values].reverse());
			});
		});

		describe('concat', () => {
			it('concatenates independently-built trees without structural errors', () => {
				const ctx = List.createContext({ blockSizeBits });
				const left = buildList(ctx, totalElements, 'append');
				const right = buildList(ctx, totalElements, 'prepend');

				const result = left.concat(right);

				expectValid(result);
				expect(result.toArray()).toEqual([...values, ...[...values].reverse()]);
			});
		});

		describe('take', () => {
			it('maintains structure and order at representative boundaries', () => {
				const ctx = List.createContext({ blockSizeBits });
				const list = buildList(ctx, totalElements, 'append');
				const amounts = [
					0,
					1,
					maxBlockSize - 1,
					maxBlockSize,
					maxBlockSize + 1,
					totalElements - 1,
					totalElements,
					-1,
					-maxBlockSize,
					-totalElements,
				];

				for (const amount of amounts) {
					const size = Math.min(Math.abs(amount), totalElements);
					const taken = list.take(amount);

					expect(taken.size).toBe(size);
					expect(taken.toArray()).toEqual(
						amount >= 0
							? values.slice(0, size)
							: values.slice(totalElements - size),
					);
					expectValid(taken);
				}
			});
		});

		describe('drop', () => {
			it('maintains structure and order at representative boundaries', () => {
				const ctx = List.createContext({ blockSizeBits });
				const list = buildList(ctx, totalElements, 'append');
				const amounts = [
					0,
					1,
					maxBlockSize - 1,
					maxBlockSize,
					maxBlockSize + 1,
					totalElements - 1,
					totalElements,
					-1,
					-maxBlockSize,
					-totalElements,
				];

				for (const amount of amounts) {
					const removed = Math.min(Math.abs(amount), totalElements);
					const dropped = list.drop(amount);

					expect(dropped.size).toBe(totalElements - removed);
					expect(dropped.toArray()).toEqual(
						amount >= 0
							? values.slice(removed)
							: values.slice(0, totalElements - removed),
					);
					expectValid(dropped);
				}
			});
		});

		describe('reversed', () => {
			it('maintains structure, order, and double-reverse identity', () => {
				const ctx = List.createContext({ blockSizeBits });
				const list = buildList(ctx, totalElements, 'append');

				const reversed = list.reversed();
				expectValid(reversed);
				expect(reversed.toArray()).toEqual([...values].reverse());

				const doubleReversed = reversed.reversed();
				expectValid(doubleReversed);
				expect(doubleReversed.toArray()).toEqual(values);
			});
		});
	});
}
