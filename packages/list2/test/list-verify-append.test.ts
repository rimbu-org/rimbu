import { describe, expect, it } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common';

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

function normalizeIndex(index: number, size: number): number {
	return Math.max(0, Math.min(index < 0 ? size + index : index, size));
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
				expect(result.toArray()).toEqual([
					...values,
					...[...values].reverse(),
				] as ArrayNonEmpty<number>);
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

		describe('insertAt', () => {
			it('maintains structure and order at representative boundaries', () => {
				const ctx = List.createContext({ blockSizeBits });
				let list = buildList(ctx, totalElements, 'append');
				const expected = [...values];
				let nextValue = totalElements;

				const insert = (index: number, amount = 1) => {
					const inserted = Array.from({ length: amount }, () => nextValue++);

					list = list.insertAt(index, ctx.from(inserted));
					expected.splice(
						normalizeIndex(index, expected.length),
						0,
						...inserted,
					);

					expect(list.size).toBe(expected.length);
					expect(list.toArray()).toEqual(expected);
					expectValid(list);
				};

				insert(0, 2);
				insert(1);
				insert(maxBlockSize - 1);
				insert(maxBlockSize);
				insert(maxBlockSize + 1);
				insert(Math.floor(expected.length / 2));
				insert(totalElements);
				insert(totalElements + 1);
			});

			it('supports negative indices while maintaining valid structure', () => {
				const ctx = List.createContext({ blockSizeBits });
				let list = buildList(ctx, totalElements, 'append');
				const expected = [...values];
				let nextValue = totalElements;

				for (const index of [
					-1,
					-maxBlockSize,
					-totalElements,
					-(totalElements + 1),
				]) {
					const inserted = nextValue++;
					list = list.insertAt(index, ctx.of(inserted));
					expected.splice(normalizeIndex(index, expected.length), 0, inserted);

					expect(list.toArray()).toEqual(expected);
					expectValid(list);
				}
			});
		});

		describe('removeAt', () => {
			it('maintains structure and order at representative boundaries', () => {
				const ctx = List.createContext({ blockSizeBits });
				let list = buildList(ctx, totalElements, 'append');
				const expected = [...values];

				const remove = (index: number, amount = 1) => {
					list =
						amount === 1 ? list.removeAt(index) : list.removeAt(index, amount);
					expected.splice(normalizeIndex(index, expected.length), amount);

					expect(list.size).toBe(expected.length);
					expect(list.toArray()).toEqual(expected);
					expectValid(list);
				};

				remove(0);
				remove(maxBlockSize - 1);
				remove(maxBlockSize, maxBlockSize);
				remove(Math.floor(expected.length / 2), 2);
				remove(expected.length - 1);
				remove(0, expected.length);

				expect(list.isEmpty).toBe(true);
			});

			it('supports negative indices while maintaining valid structure', () => {
				const ctx = List.createContext({ blockSizeBits });
				let list = buildList(ctx, totalElements, 'append');
				const expected = [...values];

				for (const [index, amount] of [
					[-1, 1],
					[-maxBlockSize, 2],
					[-totalElements, 1],
					[-(totalElements + 1), 2],
				] as const) {
					list = list.removeAt(index, amount);
					expected.splice(normalizeIndex(index, expected.length), amount);

					expect(list.toArray()).toEqual(expected);
					expectValid(list);
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
