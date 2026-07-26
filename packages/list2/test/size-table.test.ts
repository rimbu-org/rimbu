import { describe, expect, it } from 'bun:test';

import { computeSizeTable, getInnerBlockCoordinates } from '#list/size-table';

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

	it('returns regular when only last child is under-full', () => {
		const result = computeSizeTable(children(32, 32, 16), 80, 5, 1);

		expect(result).toBe('regular' as any);
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

	it('returns regular when all but last are full at level 2', () => {
		const result = computeSizeTable(children(1024, 512), 1536, 5, 2);

		expect(result).toBe('regular' as any);
	});

	it('returns regular for single child of any size', () => {
		const result = computeSizeTable(children(17), 17, 5, 1);

		expect(result).toBe('regular' as any);
	});

	it('returns regular for block with single full child', () => {
		const result = computeSizeTable(children(32), 32, 5, 1);

		expect(result).toBe('regular');
	});

	it('size table values are cumulative', () => {
		const sizes = [30, 5, 25, 4];
		const totalSize = sizes.reduce((a, b) => a + b, 0);
		const result = computeSizeTable(children(...sizes), totalSize, 5, 1);

		expect(Array.isArray(result)).toBe(true);
		if (Array.isArray(result)) {
			expect(result).toEqual([30, 35, 60, 64]);
		}
	});

	it('size table entries match running sum for mixed sizes', () => {
		const sizes = [30, 5, 25, 4];
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

	it('distinguishes regular from truly irregular at level 2', () => {
		const fullChild = 1 << (5 * 2); // 1024
		const regular = computeSizeTable(
			children(fullChild, fullChild, 512),
			fullChild * 2 + 512,
			5,
			2,
		);
		const irregular = computeSizeTable(
			children(fullChild, 512, fullChild),
			fullChild * 2 + 512,
			5,
			2,
		);

		expect(regular).toBe('regular' as any);
		expect(Array.isArray(irregular)).toBe(true);
	});

	it('single under-full child is regular', () => {
		const result = computeSizeTable(children(1), 1, 5, 2);

		expect(result).toBe('regular' as any);
	});

	it('single full child at level 3 is regular', () => {
		const fullChild = 1 << (5 * 3); // 32768
		const result = computeSizeTable(children(fullChild), fullChild, 5, 3);

		expect(result).toBe('regular');
	});
});

describe('getInnerBlockCoordinates', () => {
	it('regular block: index 0 returns first child', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 0,
			size: 96,
			nrChildren: 3,
			sizeTable: 'regular',
			blockSizeBits: 5,
			level: 1,
		});

		expect(ci).toBe(0);
		expect(ii).toBe(0);
	});

	it('regular block: index at child boundary', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 32,
			size: 96,
			nrChildren: 3,
			sizeTable: 'regular',
			blockSizeBits: 5,
			level: 1,
		});

		expect(ci).toBe(1);
		expect(ii).toBe(0);
	});

	it('regular block: index in middle of second child', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 45,
			size: 96,
			nrChildren: 3,
			sizeTable: 'regular',
			blockSizeBits: 5,
			level: 1,
		});

		expect(ci).toBe(1);
		expect(ii).toBe(13);
	});

	it('regular block: last index of last child', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 95,
			size: 96,
			nrChildren: 3,
			sizeTable: 'regular',
			blockSizeBits: 5,
			level: 1,
		});

		expect(ci).toBe(2);
		expect(ii).toBe(31);
	});

	it('regular block at level 2', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 1500,
			size: 3072,
			nrChildren: 3,
			sizeTable: 'regular',
			blockSizeBits: 5,
			level: 2,
		});

		expect(ci).toBe(1);
		expect(ii).toBe(476);
	});

	it('irregular block: binary search finds correct child', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 50,
			size: 80,
			nrChildren: 3,
			sizeTable: [32, 64, 80],
			blockSizeBits: 5,
			level: 1,
		});

		expect(ci).toBe(1);
		expect(ii).toBe(18);
	});

	it('irregular block: index in first child', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 10,
			size: 80,
			nrChildren: 3,
			sizeTable: [32, 64, 80],
			blockSizeBits: 5,
			level: 1,
		});

		expect(ci).toBe(0);
		expect(ii).toBe(10);
	});

	it('irregular block: index in last child', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 70,
			size: 80,
			nrChildren: 3,
			sizeTable: [32, 64, 80],
			blockSizeBits: 5,
			level: 1,
		});

		expect(ci).toBe(2);
		expect(ii).toBe(6);
	});

	it('irregular block: exact boundary between children', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 32,
			size: 80,
			nrChildren: 3,
			sizeTable: [32, 64, 80],
			blockSizeBits: 5,
			level: 1,
		});

		expect(ci).toBe(1);
		expect(ii).toBe(0);
	});

	it('irregular block: index at start of last child', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 64,
			size: 80,
			nrChildren: 3,
			sizeTable: [32, 64, 80],
			blockSizeBits: 5,
			level: 1,
		});

		expect(ci).toBe(2);
		expect(ii).toBe(0);
	});

	it('overflow: returns end sentinel', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 100,
			size: 80,
			nrChildren: 3,
			sizeTable: [32, 64, 80],
			blockSizeBits: 5,
			level: 1,
		});

		expect(ci).toBe(3);
		expect(ii).toBe(0);
	});

	it('overflow with noEmptyLast returns last position', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 100,
			size: 80,
			nrChildren: 3,
			sizeTable: [32, 64, 80],
			blockSizeBits: 5,
			level: 1,
			noEmptyLast: true,
			lastChildSize: 16,
		});

		expect(ci).toBe(2);
		expect(ii).toBe(15);
	});

	it('forTake adds offset to inChildIndex', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 5,
			size: 96,
			nrChildren: 3,
			sizeTable: 'regular',
			blockSizeBits: 5,
			level: 1,
			forTake: true,
		});

		expect(ci).toBe(0);
		expect(ii).toBe(5);
	});

	it('forTake with boundary index returns past-end of current child', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 32,
			size: 96,
			nrChildren: 3,
			sizeTable: 'regular',
			blockSizeBits: 5,
			level: 1,
			forTake: true,
		});

		expect(ci).toBe(0);
		expect(ii).toBe(32); // past end of child 0 = start of child 1
	});

	it('binary search on many children is correct', () => {
		const [ci, ii] = getInnerBlockCoordinates({
			index: 95,
			size: 160,
			nrChildren: 10,
			sizeTable: [16, 32, 48, 64, 80, 96, 112, 128, 144, 160],
			blockSizeBits: 5,
			level: 1,
		});

		expect(ci).toBe(5); // 95 falls in [80, 96) → child 5
		expect(ii).toBe(15); // 95 - 80
	});
});
