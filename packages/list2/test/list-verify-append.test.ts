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
}
