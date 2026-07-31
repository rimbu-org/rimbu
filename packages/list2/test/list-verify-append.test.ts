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

			let offset = count;
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
}
