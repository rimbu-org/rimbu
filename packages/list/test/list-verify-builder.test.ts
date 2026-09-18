import { describe, expect, it } from 'bun:test';

import type { ListBuilder } from '#list/mutable/builder';

import { List } from '@rimbu/list';

function verifyStructure(list: List<number>): string[] {
	if (list.isEmpty) return [];

	return (
		list as unknown as {
			_verifyStructure(errors?: string[]): string[];
		}
	)._verifyStructure();
}

function makeBuilder(blockSizeBits: number): ListBuilder<number> {
	return List.createContext({
		blockSizeBits,
	}).builder<number>() as ListBuilder<number>;
}

function normalizeInsertIndex(index: number, size: number): number {
	if (size === 0 || index >= size) return size;
	if (index <= -size) return 0;
	return index < 0 ? size + index : index;
}

function normalizeRemoveIndex(index: number, size: number): number {
	if (size === 0 || index >= size || index < -size) return -1;
	return index < 0 ? size + index : index;
}

function expectValid(
	builder: ListBuilder<number>,
	expected: number[],
	label: string,
): void {
	expect(builder.size, `${label}: size`).toBe(expected.length);

	for (let i = 0; i < expected.length; i++) {
		expect(builder.at(i), `${label}: at(${i})`).toBe(expected[i]);
	}

	const built = builder.build();
	expect(built.toArray(), `${label}: toArray`).toEqual(expected);
	expect(verifyStructure(built), `${label}: structure`).toEqual([]);
}

function makeRng(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};
}

const blockSizeBitsValues = [2, 3, 4, 5] as const;

describe('regression: single-child middle underflow (blockSizeBits=5)', () => {
	// Minimal deterministic repro of the failure in "a long mixed sequence"
	// below (op 29, removeAt(-28)): a tree L(32) R(32) that gets a single
	// minBlockSize (16) block in its middle, followed by a remove from that
	// middle block which drops it to 15 < minBlockSize. Nothing repairs it,
	// see `list-builder-middle-underflow.test.ts` for the root cause.
	it('remove from a single-child middle keeps the child at minBlockSize', () => {
		const b = makeBuilder(5);
		const expected: number[] = [];

		for (let i = 0; i < 64; i++) {
			b.append(i);
			expected.push(i);
		}

		const insert = (index: number, value: number) => {
			b.insertAt(index, [value]);
			expected.splice(normalizeInsertIndex(index, expected.length), 0, value);
			expectValid(b, expected, `insertAt(${index})`);
		};

		const remove = (index: number) => {
			const normalized = normalizeRemoveIndex(index, expected.length);
			const removed = b.removeAt(index, undefined);
			expect(removed, `removeAt(${index})`).toBe(expected[normalized]);
			expected.splice(normalized, 1);
			expectValid(b, expected, `removeAt(${index})`);
		};

		// tree layout after these ops: L(31) M([16]) R(19), size 66
		insert(42, 64);
		insert(50, 65);
		insert(49, 66);
		remove(11);

		// index 38 lands in the middle's single child (16 -> 15 elements)
		remove(-28);
	});
});

for (const blockSizeBits of blockSizeBitsValues) {
	const maxBlockSize = 1 << blockSizeBits;
	const totalElements = maxBlockSize * maxBlockSize * 2;
	const values = Array.from({ length: totalElements }, (_, i) => i);

	describe(`list builder structure (blockSizeBits=${blockSizeBits}, maxBlockSize=${maxBlockSize})`, () => {
		describe('insertAt', () => {
			it('repeated inserts maintain valid structure and order', () => {
				const b = makeBuilder(blockSizeBits);
				for (const value of values) b.append(value);
				const expected = [...values];
				let nextValue = totalElements;

				const insert = (index: number, amount = 1) => {
					const inserted = Array.from({ length: amount }, () => nextValue++);
					for (let k = 0; k < inserted.length; k++) {
						b.insertAt(index + k, [inserted[k]]);
					}
					expected.splice(
						normalizeInsertIndex(index, expected.length),
						0,
						...inserted,
					);
					expectValid(b, expected, `insertAt(${index}, x${amount})`);
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
				const b = makeBuilder(blockSizeBits);
				for (const value of values) b.append(value);
				const expected = [...values];
				let nextValue = totalElements;

				for (const index of [
					-1,
					-maxBlockSize,
					-totalElements,
					-(totalElements + 1),
				]) {
					b.insertAt(index, [nextValue]);
					expected.splice(
						normalizeInsertIndex(index, expected.length),
						0,
						nextValue,
					);
					expectValid(b, expected, `insertAt(${index})`);
					nextValue++;
				}
			});

			it('inserting into an empty builder appends', () => {
				const b = makeBuilder(blockSizeBits);
				const expected: number[] = [];

				for (const index of [0, 5, -3]) {
					const value = expected.length;
					b.insertAt(index, [value]);
					expected.splice(
						normalizeInsertIndex(index, expected.length),
						0,
						value,
					);
					expectValid(b, expected, `insertAt(${index})`);
				}
			});
		});

		describe('removeAt', () => {
			it('repeated removes maintain valid structure and order', () => {
				const b = makeBuilder(blockSizeBits);
				for (const value of values) b.append(value);
				const expected = [...values];

				const remove = (index: number, amount = 1) => {
					const normalized = normalizeRemoveIndex(index, expected.length);
					for (let k = 0; k < amount; k++) {
						const removed = b.removeAt(index, undefined);
						expect(removed, `removeAt(${index}, x${amount})`).toBe(
							expected[normalized + k],
						);
					}
					if (normalized >= 0) expected.splice(normalized, amount);
					expectValid(b, expected, `removeAt(${index}, x${amount})`);
				};

				remove(0);
				remove(maxBlockSize - 1);
				remove(maxBlockSize, maxBlockSize);
				remove(Math.floor(expected.length / 2), 2);
				remove(expected.length - 1);
				remove(0, expected.length);

				expect(b.isEmpty).toBe(true);
			});

			it('supports negative indices while maintaining valid structure', () => {
				const b = makeBuilder(blockSizeBits);
				for (const value of values) b.append(value);
				const expected = [...values];

				for (const [index, amount] of [
					[-1, 1],
					[-maxBlockSize, 2],
					[-totalElements, 1],
					[-(totalElements + 1), 2],
				] as const) {
					for (let k = 0; k < amount; k++) {
						const normalized = normalizeRemoveIndex(index, expected.length);
						const removed = b.removeAt(index, undefined);
						if (normalized >= 0) {
							expect(removed, `removeAt(${index}, x${amount})`).toBe(
								expected[normalized],
							);
							expected.splice(normalized, 1);
						} else {
							expect(removed, `removeAt(${index}, x${amount})`).toBeUndefined();
						}
					}
					expectValid(b, expected, `removeAt(${index}, x${amount})`);
				}
			});

			it('out-of-range removes return otherwise without changing the builder', () => {
				const b = makeBuilder(blockSizeBits);
				for (const value of values) b.append(value);
				const expected = [...values];

				for (const index of [
					-totalElements - 1,
					totalElements,
					totalElements + 5,
				]) {
					expect(b.removeAt(index, 'fallback')).toBe('fallback');
					expectValid(b, expected, `removeAt(${index})`);
				}
			});

			it('removing down to empty maintains valid structure', () => {
				const b = makeBuilder(blockSizeBits);
				for (const value of values) b.append(value);
				const expected = [...values];

				let step = 0;
				while (expected.length > 0) {
					const index = step % 2 === 0 ? 0 : expected.length - 1;
					const removed = b.removeAt(index, undefined);
					expect(removed, `removeAt(${index}) step ${step}`).toBe(
						expected[index],
					);
					expected.splice(index, 1);
					expectValid(b, expected, `removeAt(${index}) step ${step}`);
					step++;
				}

				expect(b.isEmpty).toBe(true);
			});
		});

		describe('alternating insertAt/removeAt', () => {
			it('a long mixed sequence maintains valid structure and order', () => {
				const rng = makeRng(blockSizeBits * 1337 + 42);
				const b = makeBuilder(blockSizeBits);
				const expected: number[] = [];

				const seedCount = maxBlockSize * 2 + 3;
				for (let i = 0; i < seedCount; i++) {
					b.append(i);
					expected.push(i);
				}
				let nextValue = seedCount;

				const nextIndex = () =>
					rng() < 0.2
						? -(Math.floor(rng() * expected.length) + 1)
						: Math.floor(rng() * (expected.length + 1));

				const opCount = maxBlockSize * 100;
				for (let op = 0; op < opCount; op++) {
					const index = nextIndex();

					if (expected.length === 0 || rng() < 0.55) {
						const value = nextValue++;
						b.insertAt(index, [value]);
						expected.splice(
							normalizeInsertIndex(index, expected.length),
							0,
							value,
						);
					} else {
						const normalized = normalizeRemoveIndex(index, expected.length);
						const removed = b.removeAt(index, undefined);
						if (normalized >= 0) {
							expect(removed, `op ${op}: removeAt(${index})`).toBe(
								expected[normalized],
							);
							expected.splice(normalized, 1);
						} else {
							expect(removed, `op ${op}: removeAt(${index})`).toBeUndefined();
						}
					}

					expectValid(b, expected, `op ${op}: index ${index}`);
				}
			});
		});
	});
}
