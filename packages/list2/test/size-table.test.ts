import { describe, expect, it } from 'bun:test';

import { SizeTable } from '#list/size-table';

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

describe('SizeTable.fromChildren', () => {
	it('returns regular for a block where all children are full (level 1)', () => {
		const table = SizeTable.fromChildren(children(32, 32, 32), 32, 96);

		expect(table.isRegular).toBe(true);
	});

	it('returns regular for a block where all children are full (level 2)', () => {
		const table = SizeTable.fromChildren(children(1024, 1024), 1024, 2048);

		expect(table.isRegular).toBe(true);
	});

	it('returns regular for a block where all children are full (level 3)', () => {
		const fullChild = 1 << (5 * 3); // 32768
		const table = SizeTable.fromChildren(
			children(fullChild, fullChild),
			fullChild,
			fullChild * 2,
		);

		expect(table.isRegular).toBe(true);
	});

	it('returns regular for an empty block', () => {
		const table = SizeTable.fromChildren([], 32, 0);

		expect(table.isRegular).toBe(true);
	});

	it('returns regular when total size matches maxChildSize * nrChildren exactly', () => {
		const table = SizeTable.fromChildren(children(32, 32, 32, 32, 32), 32, 160);

		expect(table.isRegular).toBe(true);
	});

	it('returns regular when only last child is under-full', () => {
		const table = SizeTable.fromChildren(children(32, 32, 16), 32, 80);

		expect(table.isRegular).toBe(true);
	});

	it('returns irregular for block with first child under-full', () => {
		const table = SizeTable.fromChildren(children(16, 32, 32), 32, 80);

		expect(table.isRegular).toBe(false);
		expect(table.cumulativeTable).toEqual([16, 48, 80]);
	});

	it('returns irregular for block with mixed sizes', () => {
		const table = SizeTable.fromChildren(children(30, 5, 25, 4), 32, 64);

		expect(table.isRegular).toBe(false);
		expect(table.cumulativeTable).toEqual([30, 35, 60, 64]);
	});

	it('returns regular when all but last are full at level 2', () => {
		const table = SizeTable.fromChildren(children(1024, 512), 1024, 1536);

		expect(table.isRegular).toBe(true);
	});

	it('returns regular for single child of any size', () => {
		const table = SizeTable.fromChildren(children(17), 32, 17);

		expect(table.isRegular).toBe(true);
	});

	it('returns regular for block with single full child', () => {
		const table = SizeTable.fromChildren(children(32), 32, 32);

		expect(table.isRegular).toBe(true);
	});

	it('cumulativeTable values are cumulative for irregular block', () => {
		const sizes = [30, 5, 25, 4];
		const totalSize = sizes.reduce((a, b) => a + b, 0);
		const table = SizeTable.fromChildren(children(...sizes), 32, totalSize);

		expect(table.isRegular).toBe(false);
		expect(table.cumulativeTable).toEqual([30, 35, 60, 64]);
	});

	it('cumulativeTable entries match running sum for mixed sizes', () => {
		const sizes = [30, 5, 25, 4];
		const table = SizeTable.fromChildren(
			children(...sizes),
			32,
			sizes.reduce((a, b) => a + b, 0),
		);

		expect(table.isRegular).toBe(false);
		let sum = 0;
		for (let i = 0; i < sizes.length; i++) {
			sum += sizes[i];
			expect(table.cumulativeTable[i]).toBe(sum);
		}
	});

	it('uses blockSizeBits=6 correctly', () => {
		const table = SizeTable.fromChildren(children(64, 64, 64), 64, 192);

		expect(table.isRegular).toBe(true);
	});

	it('uses blockSizeBits=6 level=2 correctly', () => {
		const fullChild = 1 << (6 * 2); // 4096
		const table = SizeTable.fromChildren(
			children(fullChild, fullChild),
			fullChild,
			fullChild * 2,
		);

		expect(table.isRegular).toBe(true);
	});

	it('distinguishes regular from truly irregular at level 2', () => {
		const fullChild = 1 << (5 * 2); // 1024
		const regular = SizeTable.fromChildren(
			children(fullChild, fullChild, 512),
			fullChild,
			fullChild * 2 + 512,
		);
		const irregular = SizeTable.fromChildren(
			children(fullChild, 512, fullChild),
			fullChild,
			fullChild * 2 + 512,
		);

		expect(regular.isRegular).toBe(true);
		expect(irregular.isRegular).toBe(false);
	});

	it('single under-full child is regular', () => {
		const table = SizeTable.fromChildren(children(1), 1024, 1);

		expect(table.isRegular).toBe(true);
	});

	it('single full child at level 3 is regular', () => {
		const fullChild = 1 << (5 * 3); // 32768
		const table = SizeTable.fromChildren(
			children(fullChild),
			fullChild,
			fullChild,
		);

		expect(table.isRegular).toBe(true);
	});
});

describe('SizeTable.fromSizes', () => {
	it('creates table from raw sizes array (irregular)', () => {
		const table = SizeTable.fromSizes([20, 40, 20], 32);

		expect(table.isRegular).toBe(false);
		expect(table.cumulativeTable).toEqual([20, 60, 80]);
		expect(table.totalSize).toBe(80);
		expect(table.nrChildren).toBe(3);
	});

	it('creates regular table from uniform sizes with totalSize', () => {
		const table = SizeTable.fromSizes([32, 32, 32], 32, 96);

		expect(table.isRegular).toBe(true);
		expect(table.totalSize).toBe(96);
		expect(table.nrChildren).toBe(3);
	});

	it('creates regular table when only last is under-full with totalSize', () => {
		const table = SizeTable.fromSizes([32, 32, 16], 32, 80);

		expect(table.isRegular).toBe(true);
		expect(table.totalSize).toBe(80);
	});
});

describe('SizeTable properties', () => {
	it('totalSize returns correct value', () => {
		const table = SizeTable.fromSizes([10, 20, 30], 32);

		expect(table.totalSize).toBe(60);
	});

	it('nrChildren returns correct value', () => {
		const table = SizeTable.fromSizes([10, 20, 30], 32);

		expect(table.nrChildren).toBe(3);
	});

	it('totalSize and nrChildren for empty block', () => {
		const table = SizeTable.fromChildren([], 32, 0);

		expect(table.totalSize).toBe(0);
		expect(table.nrChildren).toBe(0);
	});

	it('childSizeAt returns individual child sizes for irregular table', () => {
		const table = SizeTable.fromSizes([20, 40, 20], 32);

		expect(table.sizeChildAt(0)).toBe(20);
		expect(table.sizeChildAt(1)).toBe(40);
		expect(table.sizeChildAt(2)).toBe(20);
	});

	it('childSizeAt returns maxChildSize for non-last children of regular table', () => {
		const table = SizeTable.fromSizes([32, 32, 32], 32);

		expect(table.sizeChildAt(0)).toBe(32);
		expect(table.sizeChildAt(1)).toBe(32);
		expect(table.sizeChildAt(2)).toBe(32);
	});

	it('childSizeAt with negative index works', () => {
		const table = SizeTable.fromSizes([20, 40, 20], 32);

		expect(table.sizeChildAt(-1)).toBe(20);
		expect(table.sizeChildAt(-2)).toBe(40);
		expect(table.sizeChildAt(-3)).toBe(20);
	});

	it('childSizeAt for regular table with smaller last child', () => {
		const table = SizeTable.fromSizes([32, 32, 16], 32, 80);

		expect(table.sizeChildAt(0)).toBe(32);
		expect(table.sizeChildAt(1)).toBe(32);
		expect(table.sizeChildAt(2)).toBe(16);
		expect(table.sizeChildAt(-1)).toBe(16);
	});
});

describe('SizeTable.prependChildSize', () => {
	it('prepends to irregular table', () => {
		const table = SizeTable.fromSizes([20, 40], 32);
		const result = table.prependChildSize(5);

		expect(result.isRegular).toBe(false);
		expect(result.totalSize).toBe(65);
		expect(result.nrChildren).toBe(3);
		expect(result.sizeChildAt(0)).toBe(5);
		expect(result.sizeChildAt(1)).toBe(20);
		expect(result.sizeChildAt(2)).toBe(40);
	});

	it('prepending maxChildSize to regular table preserves regularity', () => {
		const table = SizeTable.fromSizes([32, 32], 32);
		const result = table.prependChildSize(32);

		expect(result.isRegular).toBe(true);
		expect(result.totalSize).toBe(96);
		expect(result.nrChildren).toBe(3);
		expect(result.sizeChildAt(0)).toBe(32);
		expect(result.sizeChildAt(1)).toBe(32);
		expect(result.sizeChildAt(2)).toBe(32);
	});

	it('prepending non-maxChildSize to regular table makes it irregular', () => {
		const table = SizeTable.fromSizes([32, 32], 32);
		const result = table.prependChildSize(16);

		expect(result.isRegular).toBe(false);
		expect(result.totalSize).toBe(80);
		expect(result.nrChildren).toBe(3);
		expect(result.sizeChildAt(0)).toBe(16);
		expect(result.sizeChildAt(1)).toBe(32);
		expect(result.sizeChildAt(2)).toBe(32);
	});

	it('prepending offsets the table correctly', () => {
		const table = SizeTable.fromSizes([20, 40], 32);
		const result = table.prependChildSize(5);

		expect(result.offset).toBe(-5);
		expect(result.sizeChildAt(0)).toBe(5);
	});
});

describe('SizeTable.appendChildSize', () => {
	it('appends to irregular table', () => {
		const table = SizeTable.fromSizes([20, 40], 32);
		const result = table.appendChildSize(30);

		expect(result.isRegular).toBe(false);
		expect(result.totalSize).toBe(90);
		expect(result.nrChildren).toBe(3);
		expect(result.sizeChildAt(0)).toBe(20);
		expect(result.sizeChildAt(1)).toBe(40);
		expect(result.sizeChildAt(2)).toBe(30);
	});

	it('appending maxChildSize preserves regularity when previous last was full', () => {
		const table = SizeTable.fromSizes([32, 32], 32);
		const result = table.appendChildSize(32);

		expect(result.isRegular).toBe(true);
		expect(result.totalSize).toBe(96);
		expect(result.nrChildren).toBe(3);
	});

	it('appending to regular table with under-full last child becomes irregular', () => {
		const table = SizeTable.fromSizes([32, 16], 32, 48);
		const result = table.appendChildSize(32);

		expect(result.isRegular).toBe(false);
		expect(result.totalSize).toBe(80);
		expect(result.nrChildren).toBe(3);
	});
});

describe('SizeTable.takeChildren', () => {
	it('takes first n children from irregular table', () => {
		const table = SizeTable.fromSizes([20, 40, 20], 32);
		const result = table.takeChildren(2);

		expect(result.isRegular).toBe(false);
		expect(result.nrChildren).toBe(2);
		expect(result.totalSize).toBe(60);
		expect(result.sizeChildAt(0)).toBe(20);
		expect(result.sizeChildAt(1)).toBe(40);
	});

	it('takes from regular table and stays regular', () => {
		const table = SizeTable.fromSizes([32, 32, 32], 32);
		const result = table.takeChildren(2);

		expect(result.isRegular).toBe(true);
		expect(result.nrChildren).toBe(2);
		expect(result.totalSize).toBe(64);
	});

	it('takeChildren returns same instance when taking all', () => {
		const table = SizeTable.fromSizes([20, 40], 32);
		const result = table.takeChildren(2);

		expect(result).toBe(table);
	});
});

describe('SizeTable.dropChildren', () => {
	it('drops first n children from irregular table', () => {
		const table = SizeTable.fromSizes([20, 40, 20], 32);
		const result = table.dropChildren(1);

		expect(result.isRegular).toBe(false);
		expect(result.nrChildren).toBe(2);
		expect(result.totalSize).toBe(60);
		expect(result.sizeChildAt(0)).toBe(40);
		expect(result.sizeChildAt(1)).toBe(20);
	});

	it('drops from regular table and stays regular', () => {
		const table = SizeTable.fromSizes([32, 32, 32], 32);
		const result = table.dropChildren(1);

		expect(result.isRegular).toBe(true);
		expect(result.nrChildren).toBe(2);
		expect(result.totalSize).toBe(64);
	});

	it('dropChildren returns same instance when dropping zero', () => {
		const table = SizeTable.fromSizes([20, 40], 32);
		const result = table.dropChildren(0);

		expect(result).toBe(table);
	});

	it('dropping from regular table with under-full last to boundary', () => {
		const table = SizeTable.fromSizes([32, 32, 16], 32, 80);
		const result = table.dropChildren(2);

		expect(result.isRegular).toBe(true);
		expect(result.nrChildren).toBe(1);
		expect(result.totalSize).toBe(16);
	});
});

describe('SizeTable.getCoordinates', () => {
	function table(sizes: number[], maxChildSize: number, totalSize?: number) {
		return SizeTable.fromSizes(sizes, maxChildSize, totalSize);
	}

	it('regular block: index 0 returns first child', () => {
		const [ci, ii] = table([32, 32, 32], 32, 96).getCoordinates(0) as [
			number,
			number,
		];

		expect(ci).toBe(0);
		expect(ii).toBe(0);
	});

	it('regular block: index at child boundary', () => {
		const [ci, ii] = table([32, 32, 32], 32, 96).getCoordinates(32) as [
			number,
			number,
		];

		expect(ci).toBe(1);
		expect(ii).toBe(0);
	});

	it('regular block: index in middle of second child', () => {
		const [ci, ii] = table([32, 32, 32], 32, 96).getCoordinates(45) as [
			number,
			number,
		];

		expect(ci).toBe(1);
		expect(ii).toBe(13);
	});

	it('regular block: last index of last child', () => {
		const [ci, ii] = table([32, 32, 32], 32, 96).getCoordinates(95) as [
			number,
			number,
		];

		expect(ci).toBe(2);
		expect(ii).toBe(31);
	});

	it('regular block at level 2', () => {
		const [ci, ii] = table([1024, 1024, 1024], 1024).getCoordinates(1500) as [
			number,
			number,
		];

		expect(ci).toBe(1);
		expect(ii).toBe(476);
	});

	it('irregular block: binary search finds correct child', () => {
		const [ci, ii] = table([20, 40, 20], 32).getCoordinates(30) as [
			number,
			number,
		];

		expect(ci).toBe(1);
		expect(ii).toBe(10);
	});

	it('irregular block: index in first child', () => {
		const [ci, ii] = table([20, 40, 20], 32).getCoordinates(10) as [
			number,
			number,
		];

		expect(ci).toBe(0);
		expect(ii).toBe(10);
	});

	it('irregular block: index in last child', () => {
		const [ci, ii] = table([20, 40, 20], 32).getCoordinates(65) as [
			number,
			number,
		];

		expect(ci).toBe(2);
		expect(ii).toBe(5);
	});

	it('irregular block: exact boundary between children', () => {
		const [ci, ii] = table([20, 40, 20], 32).getCoordinates(20) as [
			number,
			number,
		];

		expect(ci).toBe(1);
		expect(ii).toBe(0);
	});

	it('irregular block: index at start of last child', () => {
		const [ci, ii] = table([20, 40, 20], 32).getCoordinates(60) as [
			number,
			number,
		];

		expect(ci).toBe(2);
		expect(ii).toBe(0);
	});

	it('overflow: returns end sentinel', () => {
		const [ci, ii] = table([20, 40, 20], 32).getCoordinates(100) as [
			number,
			number,
		];

		expect(ci).toBe(3);
		expect(ii).toBe(0);
	});

	it('overflow with noEmptyLast returns last position', () => {
		const [ci, ii] = table([20, 40, 20], 32).getCoordinates(100, {
			noEmptyLast: true,
		}) as [number, number];

		expect(ci).toBe(2);
		expect(ii).toBe(19);
	});

	it('forTake adds offset to inChildIndex', () => {
		const [ci, ii] = table([32, 32, 32], 32, 96).getCoordinates(5, {
			forTake: true,
		}) as [number, number];

		expect(ci).toBe(0);
		expect(ii).toBe(5);
	});

	it('forTake with boundary index returns past-end of current child', () => {
		const [ci, ii] = table([32, 32, 32], 32, 96).getCoordinates(32, {
			forTake: true,
		}) as [number, number];

		expect(ci).toBe(0);
		expect(ii).toBe(32);
	});

	it('binary search on many children is correct', () => {
		const [ci, ii] = table(
			[16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			32,
		).getCoordinates(95) as [number, number];

		expect(ci).toBe(5);
		expect(ii).toBe(15);
	});
});
