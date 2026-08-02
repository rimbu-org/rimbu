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

const blockSizeBitsValues = [2, 3, 4, 5] as const;

for (const blockSizeBits of blockSizeBitsValues) {
	const maxBlockSize = 1 << blockSizeBits;

	describe(`append verification (blockSizeBits=${blockSizeBits}, maxBlockSize=${maxBlockSize})`, () => {
		it('successive appends maintain valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			let list: List<number> = ctx.empty<number>();

			const totalElements = maxBlockSize * maxBlockSize * 4;

			for (let i = 1; i <= totalElements; i++) {
				list = list.append(i);

				const errors = verifyStructure(list);
				expect(errors).toEqual([]);
			}

			expect(list.size).toBe(totalElements);
			expect(list.toArray()).toEqual(
				Array.from({ length: totalElements }, (_, i) => i + 1),
			);
		});
	});

	describe(`prepend verification (blockSizeBits=${blockSizeBits}, maxBlockSize=${maxBlockSize})`, () => {
		it('successive prepends maintain valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			let list: List<number> = ctx.empty<number>();

			const totalElements = maxBlockSize * maxBlockSize * 4;

			for (let i = 1; i <= totalElements; i++) {
				list = list.prepend(i);

				const errors = verifyStructure(list);
				expect(errors).toEqual([]);
			}

			expect(list.size).toBe(totalElements);
			expect(list.toArray()).toEqual(
				Array.from({ length: totalElements }, (_, i) => totalElements - i),
			);
		});
	});

	describe(`concat verification (blockSizeBits=${blockSizeBits}, maxBlockSize=${maxBlockSize})`, () => {
		it('pairwise concat of singletons builds valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const count = maxBlockSize * maxBlockSize;

			let lists: List<number>[] = [];
			for (let i = 0; i < count; i++) {
				lists.push(ctx.of(i));
			}

			while (lists.length > 1) {
				const next: List<number>[] = [];
				for (let i = 0; i < lists.length; i += 2) {
					const right = lists[i + 1];
					const merged = right ? lists[i].concat(right) : lists[i];
					next.push(merged);

					const errors = verifyStructure(merged);
					expect(errors).toEqual([]);
				}
				lists = next;
			}

			expect(lists[0].size).toBe(count);
		});

		it('sequential concat of growing list with batch maintains valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const batchSize = maxBlockSize;
			const batches = maxBlockSize * 2;

			let list: List<number> = ctx.empty<number>();
			let value = 0;

			for (let b = 0; b < batches; b++) {
				const batch: number[] = [];
				for (let i = 0; i < batchSize; i++) {
					batch.push(value++);
				}

				list = list.concat(ctx.from(batch));
				expect(list.size).toBe((b + 1) * batchSize);

				const errors = verifyStructure(list);
				expect(errors).toEqual([]);
			}
		});

		it('concat of two deep independently-built lists maintains valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const depth = maxBlockSize * maxBlockSize * 2;

			let appended: List<number> = ctx.empty<number>();
			for (let i = 0; i < depth; i++) {
				appended = appended.append(i);
			}

			let prepended: List<number> = ctx.empty<number>();
			for (let i = 0; i < depth; i++) {
				prepended = prepended.prepend(i + depth);
			}

			const merged = appended.concat(prepended);
			expect(merged.size).toBe(depth * 2);

			const errors = verifyStructure(merged);
			expect(errors).toEqual([]);
			expect(merged.toArray() as number[]).toEqual([
				...Array.from({ length: depth }, (_, i) => i),
				...Array.from({ length: depth }, (_, i) => depth + depth - 1 - i),
			]);
		});

		it('concat of tree with singleton exercises block+tree boundary merge', () => {
			const ctx = List.createContext({ blockSizeBits });
			const count = maxBlockSize * maxBlockSize;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < count; i++) {
				list = list.append(i);
			}

			for (let i = 0; i < maxBlockSize * 4; i++) {
				list = list.concat(ctx.of(count + i));

				const errors = verifyStructure(list);
				expect(errors).toEqual([]);
			}

			expect(list.size).toBe(count + maxBlockSize * 4);
		});
	});

	describe(`drop verification (blockSizeBits=${blockSizeBits}, maxBlockSize=${maxBlockSize})`, () => {
		it('drop from append-built list at various offsets maintains valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const total = maxBlockSize * maxBlockSize * 2;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < total; i++) {
				list = list.append(i);
			}

			const dropOffsets = [0, 1, total - 1, total, -1, -(total - 1)];

			for (const offset of dropOffsets) {
				const dropped = list.drop(offset);
				expect(dropped.size).toBe(
					Math.max(0, total - (offset >= 0 ? offset : -offset)),
				);

				const errors = verifyStructure(dropped);
				expect(errors).toEqual([]);
			}
		});

		it('drop at every positive offset maintains valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const total = maxBlockSize * maxBlockSize * 2;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < total; i++) {
				list = list.append(i);
			}

			for (let amount = 1; amount <= total; amount++) {
				const dropped = list.drop(amount);
				expect(dropped.size).toBe(total - amount);

				const errors = verifyStructure(dropped);
				expect(errors).toEqual([]);
			}
		});

		it('drop at every negative offset maintains valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const total = maxBlockSize * maxBlockSize * 2;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < total; i++) {
				list = list.append(i);
			}

			for (let amount = 1; amount <= total; amount++) {
				const dropped = list.drop(-amount);
				expect(dropped.size).toBe(total - amount);

				const errors = verifyStructure(dropped);
				expect(errors).toEqual([]);
			}
		});

		it('drop entire list produces empty', () => {
			const ctx = List.createContext({ blockSizeBits });
			const count = maxBlockSize * maxBlockSize;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < count; i++) {
				list = list.append(i);
			}

			const result = list.drop(count);
			expect(result.isEmpty).toBe(true);
		});

		it('drop from prepend-built list at all offsets maintains valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const total = maxBlockSize * maxBlockSize * 2;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < total; i++) {
				list = list.prepend(i);
			}

			for (let amount = 1; amount < total; amount++) {
				const dropped = list.drop(amount);
				expect(dropped.size).toBe(total - amount);

				const errors = verifyStructure(dropped);
				expect(errors).toEqual([]);
			}
		});

		it('negative drop from prepend-built list at all offsets maintains valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const total = maxBlockSize * maxBlockSize * 2;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < total; i++) {
				list = list.prepend(i);
			}

			for (let amount = 1; amount < total; amount++) {
				const dropped = list.drop(-amount);
				expect(dropped.size).toBe(total - amount);

				const errors = verifyStructure(dropped);
				expect(errors).toEqual([]);
			}
		});
	});

	describe(`take verification (blockSizeBits=${blockSizeBits}, maxBlockSize=${maxBlockSize})`, () => {
		it('take from append-built list at various sizes maintains valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const total = maxBlockSize * maxBlockSize * 3;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < total; i++) {
				list = list.append(i);
			}

			const takeSizes = [
				0,
				1,
				maxBlockSize - 1,
				maxBlockSize,
				maxBlockSize + 1,
				maxBlockSize * 2,
				maxBlockSize * maxBlockSize,
				total,
			];

			for (const amount of takeSizes) {
				const taken = list.take(amount);
				expect(taken.size).toBe(amount);

				const errors = verifyStructure(taken);
				expect(errors).toEqual([]);
			}
		});

		it('take from prepend-built list at various sizes maintains valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const total = maxBlockSize * maxBlockSize * 3;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < total; i++) {
				list = list.prepend(i);
			}

			const takeSizes = [
				0,
				1,
				maxBlockSize,
				maxBlockSize * 2,
				maxBlockSize * maxBlockSize,
				total,
			];

			for (const amount of takeSizes) {
				const taken = list.take(amount);
				expect(taken.size).toBe(amount);

				const errors = verifyStructure(taken);
				expect(errors).toEqual([]);
			}
		});

		it('negative take from append-built list at all offsets maintains valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const total = maxBlockSize * maxBlockSize * 2;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < total; i++) {
				list = list.append(i);
			}

			for (let amount = 1; amount <= total; amount++) {
				const taken = list.take(-amount);
				expect(taken.size).toBe(amount);

				const errors = verifyStructure(taken);
				expect(errors).toEqual([]);
			}
		});

		it('negative take from prepend-built list at all offsets maintains valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const total = maxBlockSize * maxBlockSize * 2;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < total; i++) {
				list = list.prepend(i);
			}

			for (let amount = 1; amount <= total; amount++) {
				const taken = list.take(-amount);
				expect(taken.size).toBe(amount);

				const errors = verifyStructure(taken);
				expect(errors).toEqual([]);
			}
		});

		it('take zero returns empty', () => {
			const ctx = List.createContext({ blockSizeBits });
			const count = maxBlockSize * maxBlockSize;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < count; i++) {
				list = list.append(i);
			}

			const result = list.take(0);
			expect(result.isEmpty).toBe(true);
		});

		it('take all returns same list', () => {
			const ctx = List.createContext({ blockSizeBits });
			const count = maxBlockSize * maxBlockSize;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < count; i++) {
				list = list.append(i);
			}

			const taken = list.take(count);
			expect(taken.size).toBe(count);

			const errors = verifyStructure(taken);
			expect(errors).toEqual([]);
		});
	});

	describe(`reversed verification (blockSizeBits=${blockSizeBits}, maxBlockSize=${maxBlockSize})`, () => {
		it('reverse of single block maintains valid structure and element order', () => {
			const ctx = List.createContext({ blockSizeBits });

			for (const size of [1, maxBlockSize]) {
				let list: List<number> = ctx.empty<number>();
				for (let i = 0; i < size; i++) {
					list = list.append(i);
				}

				const reversed = list.reversed();

				const errors = verifyStructure(reversed);
				expect(errors).toEqual([]);
				expect(reversed.size).toBe(size);
				expect(reversed.toArray() as number[]).toEqual(
					Array.from({ length: size }, (_, i) => size - 1 - i),
				);
			}
		});

		it('reverse maintains valid structure at various list sizes', () => {
			const ctx = List.createContext({ blockSizeBits });

			const sizes = [
				1,
				maxBlockSize,
				maxBlockSize + 1,
				maxBlockSize * 2,
				maxBlockSize * 2 + 1,
				maxBlockSize * maxBlockSize,
				maxBlockSize * maxBlockSize + maxBlockSize,
				maxBlockSize * maxBlockSize * 2,
			];

			for (const size of sizes) {
				let list: List<number> = ctx.empty<number>();
				for (let i = 0; i < size; i++) {
					list = list.append(i);
				}

				const reversed = list.reversed();

				const errors = verifyStructure(reversed);
				expect(errors).toEqual([]);
				expect(reversed.size).toBe(size);
			}
		});

		it('double reverse returns valid structure and identity', () => {
			const ctx = List.createContext({ blockSizeBits });
			const count = maxBlockSize * maxBlockSize * 2;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < count; i++) {
				list = list.append(i);
			}

			const doubleReversed = list.reversed().reversed();
			expect(doubleReversed.size).toBe(count);

			const errors = verifyStructure(doubleReversed);
			expect(errors).toEqual([]);
		});

		it('reverse of prepended list maintains valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const count = maxBlockSize * maxBlockSize * 2;

			let list: List<number> = ctx.empty<number>();
			for (let i = 0; i < count; i++) {
				list = list.prepend(i);
			}

			const reversed = list.reversed();
			expect(reversed.size).toBe(count);

			const errors = verifyStructure(reversed);
			expect(errors).toEqual([]);
		});

		it('reverse of concat-built list maintains valid structure', () => {
			const ctx = List.createContext({ blockSizeBits });
			const depth = maxBlockSize * maxBlockSize;

			let appended: List<number> = ctx.empty<number>();
			for (let i = 0; i < depth; i++) {
				appended = appended.append(i);
			}

			let prepended: List<number> = ctx.empty<number>();
			for (let i = 0; i < depth; i++) {
				prepended = prepended.prepend(i + depth);
			}

			const merged = appended.concat(prepended);
			const reversed = merged.reversed();
			expect(reversed.size).toBe(depth * 2);

			const errors = verifyStructure(reversed);
			expect(errors).toEqual([]);
		});
	});

	describe(`take/drop normalization issues (blockSizeBits=${blockSizeBits}, maxBlockSize=${maxBlockSize})`, () => {
		it('take from deep tree should not produce uncollapsed trees', () => {
			const ctx = List.createContext({ blockSizeBits });

			let list: List<number> = ctx.empty<number>();
			const total = maxBlockSize * maxBlockSize * 4;
			for (let i = 0; i < total; i++) {
				list = list.append(i);
			}

			for (let amount = 1; amount <= total; amount++) {
				const taken = list.take(amount);
				expect(taken.size).toBe(amount);

				const errors = verifyStructure(taken);
				expect(errors).toEqual([]);
			}
		});

		it('positive take across middle boundaries should not produce duplicate elements', () => {
			const ctx = List.createContext({ blockSizeBits });

			let list: List<number> = ctx.empty<number>();
			const total = maxBlockSize * maxBlockSize * 4;
			for (let i = 0; i < total; i++) {
				list = list.append(i);
			}

			for (let amount = 1; amount <= total; amount++) {
				const taken = list.take(amount);
				const arr = taken.toArray();

				expect(new Set(arr).size).toBe(arr.length);
			}
		});

		it('negative take from deep tree should not produce uncollapsed trees', () => {
			const ctx = List.createContext({ blockSizeBits });

			let list: List<number> = ctx.empty<number>();
			const total = maxBlockSize * maxBlockSize * 4;
			for (let i = 0; i < total; i++) {
				list = list.append(i);
			}

			for (let amount = 1; amount <= total; amount++) {
				const taken = list.take(-amount);
				expect(taken.size).toBe(amount);

				const errors = verifyStructure(taken);
				expect(errors).toEqual([]);
			}
		});

		it('negative take across middle boundaries should not produce duplicate elements', () => {
			const ctx = List.createContext({ blockSizeBits });

			let list: List<number> = ctx.empty<number>();
			const total = maxBlockSize * maxBlockSize * 4;
			for (let i = 0; i < total; i++) {
				list = list.append(i);
			}

			for (let amount = 1; amount <= total; amount++) {
				const taken = list.take(-amount);
				const arr = taken.toArray();

				expect(new Set(arr).size).toBe(arr.length);
			}
		});

		it('drop from deep tree should not produce uncollapsed trees', () => {
			const ctx = List.createContext({ blockSizeBits });

			let list: List<number> = ctx.empty<number>();
			const total = maxBlockSize * maxBlockSize * 4;
			for (let i = 0; i < total; i++) {
				list = list.append(i);
			}

			for (let amount = 1; amount < total; amount++) {
				const dropped = list.drop(amount);
				expect(dropped.size).toBe(total - amount);

				const errors = verifyStructure(dropped);
				expect(errors).toEqual([]);
			}
		});

		it('negative drop from deep tree should not produce uncollapsed trees', () => {
			const ctx = List.createContext({ blockSizeBits });

			let list: List<number> = ctx.empty<number>();
			const total = maxBlockSize * maxBlockSize * 4;
			for (let i = 0; i < total; i++) {
				list = list.append(i);
			}

			for (let amount = 1; amount < total; amount++) {
				const dropped = list.drop(-amount);
				expect(dropped.size).toBe(total - amount);

				const errors = verifyStructure(dropped);
				expect(errors).toEqual([]);
			}
		});

		it('drop across middle boundaries should not produce duplicate elements', () => {
			const ctx = List.createContext({ blockSizeBits });

			let list: List<number> = ctx.empty<number>();
			const total = maxBlockSize * maxBlockSize * 4;
			for (let i = 0; i < total; i++) {
				list = list.append(i);
			}

			for (let amount = 1; amount < total; amount++) {
				const dropped = list.drop(amount);
				const arr = dropped.toArray();

				expect(new Set(arr).size).toBe(arr.length);
			}
		});

		it('negative drop across middle boundaries should not produce duplicate elements', () => {
			const ctx = List.createContext({ blockSizeBits });

			let list: List<number> = ctx.empty<number>();
			const total = maxBlockSize * maxBlockSize * 4;
			for (let i = 0; i < total; i++) {
				list = list.append(i);
			}

			for (let amount = 1; amount < total; amount++) {
				const dropped = list.drop(-amount);
				const arr = dropped.toArray();

				expect(new Set(arr).size).toBe(arr.length);
			}
		});
	});
}
