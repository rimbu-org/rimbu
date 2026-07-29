import { describe, expect, it } from 'bun:test';

import { SizeTable } from '#list/size-table';

describe('SizeTable chain operations', () => {
	it('builds table, appends, prepends, and resolves coordinates', () => {
		const children = [{ size: 3 }, { size: 5 }, { size: 2 }];

		const table = SizeTable.fromChildren(children, 8, 10);

		expect(table.sizeChildAt(0)).toBe(3);
		expect(table.sizeChildAt(1)).toBe(5);
		expect(table.sizeChildAt(2)).toBe(2);
		expect(table.cumulativeTable).toEqual([3, 8, 10]);
		expect(table.totalSize).toBe(10);

		const table2 = table.appendChildSize(4);

		expect(table2.totalSize).toBe(14);
		expect(table2.cumulativeTable).toEqual([3, 8, 10, 14]);
		expect(table2.sizeChildAt(0)).toBe(3);
		expect(table2.sizeChildAt(1)).toBe(5);

		const table3 = table2.prependChildSize(5);

		expect(table3.totalSize).toBe(19);
		expect(table3.sizeChildAt(0)).toBe(5);
		expect(table3.sizeChildAt(1)).toBe(3);

		const table4 = table3.prependChildSize(8);

		expect(table4.totalSize).toBe(27);
		expect(table4.sizeChildAt(0)).toBe(8);
		expect(table4.sizeChildAt(1)).toBe(5);

		expect(table4.cumulativeTable).toEqual([-5, 0, 3, 8, 10, 14]);

		for (let i = 0; i < table4.totalSize; i++) {
			const [ci, ii] = table4.getCoordinates(i);
			expect(ci).toBeGreaterThanOrEqual(0);
			expect(ii).toBeGreaterThanOrEqual(0);
		}
	});

	it('coordinates are correct after multiple prepends', () => {
		const table = SizeTable.fromSizes([3, 5, 2], 8)
			.appendChildSize(4)
			.prependChildSize(5)
			.prependChildSize(8);

		expect(table.cumulativeTable).toEqual([-5, 0, 3, 8, 10, 14]);

		expect(table.getCoordinates(0) as [number, number]).toEqual([0, 0]);
		expect(table.getCoordinates(7) as [number, number]).toEqual([0, 7]);
		expect(table.getCoordinates(8) as [number, number]).toEqual([1, 0]);
		expect(table.getCoordinates(12) as [number, number]).toEqual([1, 4]);
		expect(table.getCoordinates(13) as [number, number]).toEqual([2, 0]);
	});

	it('coordinates with forTake after prepends', () => {
		const table = SizeTable.fromSizes([3, 5, 2], 8).prependChildSize(5);

		expect(table.getCoordinates(0) as [number, number]).toEqual([0, 0]);
		expect(table.getCoordinates(4) as [number, number]).toEqual([0, 4]);
		expect(table.getCoordinates(5) as [number, number]).toEqual([1, 0]);
		expect(
			table.getCoordinates(5, { forTake: true }) as [number, number],
		).toEqual([0, 5]);
	});
});
