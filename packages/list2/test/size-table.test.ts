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

describe('SizeTable chain operations', () => {
	it('chain of append and prepend produces correct cumulative table', () => {
		const table = SizeTable.fromSizes([3, 5, 2], 8)
			.appendChildSize(4)
			.prependChildSize(5)
			.prependChildSize(8);

		expect(table.totalSize).toBe(27);
		expect(table.nrChildren).toBe(6);
		expect(table.cumulativeTable).toEqual([-5, 0, 3, 8, 10, 14]);
		expect(table.offset).toBe(-13);
	});

	it('prepending twice accumulates offset correctly', () => {
		const t1 = SizeTable.fromSizes([3, 5], 8);
		expect(t1.offset).toBe(0);

		const t2 = t1.prependChildSize(5);
		expect(t2.offset).toBe(-5);

		const t3 = t2.prependChildSize(8);
		expect(t3.offset).toBe(-13);
	});

	it('coordinates on chained table with negative offset', () => {
		const table = SizeTable.fromSizes([3, 5, 2], 8)
			.appendChildSize(4)
			.prependChildSize(5)
			.prependChildSize(8);

		expect(table.getCoordinates(0) as [number, number]).toEqual([0, 0]);
		expect(table.getCoordinates(7) as [number, number]).toEqual([0, 7]);
		expect(table.getCoordinates(8) as [number, number]).toEqual([1, 0]);
		expect(table.getCoordinates(12) as [number, number]).toEqual([1, 4]);
		expect(table.getCoordinates(13) as [number, number]).toEqual([2, 0]);
		expect(table.getCoordinates(26) as [number, number]).toEqual([5, 3]);
	});

	it('forTake with prepended table gives correct inChildIndex', () => {
		const table = SizeTable.fromSizes([3, 5, 2], 8).prependChildSize(5);

		expect(table.getCoordinatesForTake(5) as [number, number]).toEqual([0, 5]);
	});

	it('forTake with multiple prepends gives correct inChildIndex', () => {
		const table = SizeTable.fromSizes([3, 5, 2], 8)
			.appendChildSize(4)
			.prependChildSize(5)
			.prependChildSize(8);

		expect(table.getCoordinatesForTake(8) as [number, number]).toEqual([0, 8]);
		expect(table.getCoordinatesForTake(13) as [number, number]).toEqual([1, 5]);
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

	it('dropping to single child from irregular table is regular', () => {
		const table = SizeTable.fromSizes([16, 32, 32], 32, 80);
		const result = table.dropChildren(2);

		expect(result.isRegular).toBe(true);
		expect(result.nrChildren).toBe(1);
		expect(result.totalSize).toBe(32);
	});

	it('dropping all but last from full regular table stays regular', () => {
		const table = SizeTable.fromSizes([32, 32, 32, 32], 32);
		const result = table.dropChildren(3);

		expect(result.isRegular).toBe(true);
		expect(result.nrChildren).toBe(1);
		expect(result.totalSize).toBe(32);
	});
});

describe('SizeTable.split', () => {
	it('splits irregular table at middle index', () => {
		const table = SizeTable.fromSizes([20, 30, 20], 32);
		const [left, right] = table.split(2);

		expect(left.nrChildren).toBe(2);
		expect(left.totalSize).toBe(50);
		expect(left.sizeChildAt(0)).toBe(20);
		expect(left.sizeChildAt(1)).toBe(30);
		expect(left.offset).toBe(0);

		expect(right.nrChildren).toBe(1);
		expect(right.totalSize).toBe(20);
		expect(right.sizeChildAt(0)).toBe(20);
		expect(right.offset).toBe(50);
	});

	it('split at every index preserves child sizes', () => {
		const sizes = [3, 5, 2, 4, 6];
		const table = SizeTable.fromSizes(sizes, 8);

		for (
			let splitChildIndex = 0;
			splitChildIndex <= sizes.length;
			splitChildIndex++
		) {
			const [left, right] = table.split(splitChildIndex);

			expect(left.nrChildren).toBe(splitChildIndex);
			expect(right.nrChildren).toBe(sizes.length - splitChildIndex);
			expect(left.totalSize + right.totalSize).toBe(table.totalSize);

			for (let i = 0; i < splitChildIndex; i++) {
				expect(left.sizeChildAt(i)).toBe(sizes[i]);
			}

			for (let i = 0; i < sizes.length - splitChildIndex; i++) {
				expect(right.sizeChildAt(i)).toBe(sizes[splitChildIndex + i]);
			}
		}
	});

	it('right side coordinates stay correct after split', () => {
		const table = SizeTable.fromSizes([20, 30, 20], 32);
		const [left, right] = table.split(1);

		expect(left.getCoordinates(19) as [number, number]).toEqual([0, 19]);

		expect(right.getCoordinates(0) as [number, number]).toEqual([0, 0]);
		expect(right.getCoordinates(29) as [number, number]).toEqual([0, 29]);
		expect(right.getCoordinates(30) as [number, number]).toEqual([1, 0]);
		expect(right.getCoordinates(49) as [number, number]).toEqual([1, 19]);
	});

	it('splits regular table and both sides stay regular', () => {
		const table = SizeTable.fromSizes([32, 32, 32], 32);
		const [left, right] = table.split(2);

		expect(left.isRegular).toBe(true);
		expect(right.isRegular).toBe(true);
		expect(right.sizeChildAt(0)).toBe(32);
	});

	it('split with under-full last child keeps both sides regular', () => {
		const table = SizeTable.fromSizes([32, 32, 16], 32, 80);
		const [left, right] = table.split(2);

		expect(left.isRegular).toBe(true);
		expect(right.isRegular).toBe(true);
		expect(right.totalSize).toBe(16);
	});

	it('split with irregular prefix: left regular, right conservative', () => {
		const table = SizeTable.fromSizes([16, 32, 32], 32, 80);
		const [left, right] = table.split(1);

		expect(left.nrChildren).toBe(1);
		expect(left.totalSize).toBe(16);
		expect(left.isRegular).toBe(true);

		expect(right.nrChildren).toBe(2);
		expect(right.sizeChildAt(0)).toBe(32);
		expect(right.sizeChildAt(1)).toBe(32);
		expect(right.isRegular).toBe(false);
	});

	it('split on table with negative offset', () => {
		const table = SizeTable.fromSizes([3, 5, 2], 8)
			.appendChildSize(4)
			.prependChildSize(5)
			.prependChildSize(8);

		const [left, right] = table.split(2);

		expect(left.cumulativeTable).toEqual([-5, 0]);
		expect(left.offset).toBe(-13);
		expect(left.totalSize).toBe(13);
		expect(left.sizeChildAt(0)).toBe(8);
		expect(left.sizeChildAt(1)).toBe(5);

		expect(right.cumulativeTable).toEqual([3, 8, 10, 14]);
		expect(right.offset).toBe(0);
		expect(right.totalSize).toBe(14);
		expect(right.sizeChildAt(0)).toBe(3);
		expect(right.sizeChildAt(1)).toBe(5);
		expect(right.sizeChildAt(-1)).toBe(4);
	});

	it('negative index counts from the end', () => {
		const table = SizeTable.fromSizes([20, 30, 20], 32);
		const [left, right] = table.split(-1);

		expect(left.nrChildren).toBe(2);
		expect(right.nrChildren).toBe(1);
		expect(right.sizeChildAt(0)).toBe(20);
		expect(left.sizeChildAt(-1)).toBe(30);

		const [left2, right2] = table.split(-2);

		expect(left2.nrChildren).toBe(1);
		expect(right2.nrChildren).toBe(2);
		expect(right2.sizeChildAt(0)).toBe(30);
	});

	it('split at 0 returns empty left and same right', () => {
		const table = SizeTable.fromSizes([20, 30], 32);
		const [left, right] = table.split(0);

		expect(left.nrChildren).toBe(0);
		expect(left.totalSize).toBe(0);
		expect(right).toBe(table);
	});

	it('split at nrChildren returns same left and empty right', () => {
		const table = SizeTable.fromSizes([20, 30], 32);
		const [left, right] = table.split(2);

		expect(left).toBe(table);
		expect(right.nrChildren).toBe(0);
		expect(right.totalSize).toBe(0);
	});

	it('split results are independent from source arrays', () => {
		const table = SizeTable.fromSizes([20, 30, 20], 32);
		const [left, right] = table.split(1);

		expect(left.cumulativeTable).not.toBe(table.cumulativeTable);
		expect(right.cumulativeTable).not.toBe(table.cumulativeTable);
		expect(left.cumulativeTable).not.toBe(right.cumulativeTable);
	});

	it('throws when split index is out of bounds', () => {
		const table = SizeTable.fromSizes([20, 30], 32);

		expect(() => table.split(3)).toThrow();
		expect(() => table.split(-3)).toThrow();
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

	it('forTake adds offset to inChildIndex', () => {
		const [ci, ii] = table([32, 32, 32], 32, 96).getCoordinatesForTake(5) as [
			number,
			number,
		];

		expect(ci).toBe(0);
		expect(ii).toBe(5);
	});

	it('forTake with boundary index returns past-end of current child', () => {
		const [ci, ii] = table([32, 32, 32], 32, 96).getCoordinatesForTake(32) as [
			number,
			number,
		];

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
