import { describe, expect, it } from 'bun:test';

import { computeSizeTable } from '#list/size-table';

function child(size: number) {
	return {
		get size() {
			return size;
		},
	};
}

function children(...sizes: number[]) {
	return sizes.map(child);
}

describe('computeSizeTable', () => {
	it('returns regular for a block where all children are full (level 1)', () => {
		const result = computeSizeTable(children(32, 32, 32), 96, 5, 1);

		expect(result).toBe('regular');
	});

	it('returns regular for a block where all children are full (level 2)', () => {
		const result = computeSizeTable(children(1024, 1024), 2048, 5, 2);

		expect(result).toBe('regular');
	});

	it('returns regular for a block where all children are full (level 3)', () => {
		const fullChild = 1 << (5 * 3); // 32768
		const result = computeSizeTable(
			children(fullChild, fullChild),
			fullChild * 2,
			5,
			3,
		);

		expect(result).toBe('regular');
	});

	it('returns regular for an empty block', () => {
		const result = computeSizeTable([], 0, 5, 1);

		expect(result).toBe('regular');
	});

	it('returns regular when total size matches maxChildSize * nrChildren exactly', () => {
		const result = computeSizeTable(children(32, 32, 32, 32, 32), 160, 5, 1);

		expect(result).toBe('regular');
	});

	it('returns size table for irregular block (last child under-full)', () => {
		const result = computeSizeTable(children(32, 32, 16), 80, 5, 1);

		expect(Array.isArray(result)).toBe(true);
		expect(result).toEqual([32, 64, 80]);
	});

	it('returns size table for irregular block (first child under-full)', () => {
		const result = computeSizeTable(children(16, 32, 32), 80, 5, 1);

		expect(Array.isArray(result)).toBe(true);
		expect(result).toEqual([16, 48, 80]);
	});

	it('returns size table for irregular block (mixed sizes)', () => {
		const result = computeSizeTable(children(30, 5, 25, 4), 64, 5, 1);

		expect(Array.isArray(result)).toBe(true);
		expect(result).toEqual([30, 35, 60, 64]);
	});

	it('returns size table for irregular block at level 2', () => {
		const result = computeSizeTable(children(1024, 512), 1536, 5, 2);

		expect(Array.isArray(result)).toBe(true);
		expect(result).toEqual([1024, 1536]);
	});

	it('returns size table for block with single child', () => {
		const result = computeSizeTable(children(17), 17, 5, 1);

		expect(Array.isArray(result)).toBe(true);
		expect(result).toEqual([17]);
	});

	it('returns regular for block with single full child', () => {
		const result = computeSizeTable(children(32), 32, 5, 1);

		expect(result).toBe('regular');
	});

	it('size table values are cumulative', () => {
		const sizes = [10, 20, 30, 5, 15];
		const result = computeSizeTable(
			children(...sizes),
			sizes.reduce((a, b) => a + b, 0),
			5,
			1,
		);

		expect(Array.isArray(result)).toBe(true);
		if (Array.isArray(result)) {
			expect(result).toEqual([10, 30, 60, 65, 80]);
		}
	});

	it('size table entries match running sum', () => {
		const sizes = [32, 32, 16];
		const result = computeSizeTable(
			children(...sizes),
			sizes.reduce((a, b) => a + b, 0),
			5,
			1,
		);

		expect(Array.isArray(result)).toBe(true);
		if (Array.isArray(result)) {
			let sum = 0;
			for (let i = 0; i < sizes.length; i++) {
				sum += sizes[i];
				expect(result[i]).toBe(sum);
			}
		}
	});

	it('uses blockSizeBits=6 correctly', () => {
		const result = computeSizeTable(children(64, 64, 64), 192, 6, 1);

		expect(result).toBe('regular');
	});

	it('uses blockSizeBits=6 level=2 correctly', () => {
		const fullChild = 1 << (6 * 2); // 4096
		const result = computeSizeTable(
			children(fullChild, fullChild),
			fullChild * 2,
			6,
			2,
		);

		expect(result).toBe('regular');
	});

	it('distinguishes regular level 2 from irregular', () => {
		const fullChild = 1 << (5 * 2); // 1024
		const regular = computeSizeTable(
			children(fullChild, fullChild, fullChild),
			fullChild * 3,
			5,
			2,
		);
		const irregular = computeSizeTable(
			children(fullChild, fullChild, 512),
			fullChild * 2 + 512,
			5,
			2,
		);

		expect(regular).toBe('regular');
		expect(Array.isArray(irregular)).toBe(true);
	});

	it('single full child at level 3 is regular', () => {
		const fullChild = 1 << (5 * 3); // 32768
		const result = computeSizeTable(children(fullChild), fullChild, 5, 3);

		expect(result).toBe('regular');
	});

	it('single under-full child at any level is irregular', () => {
		const result = computeSizeTable(children(1), 1, 5, 2);

		expect(Array.isArray(result)).toBe(true);
	});
});
