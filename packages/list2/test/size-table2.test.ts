import { describe, it } from 'bun:test';

import { SizeTable } from '#list/size-table';

describe('SizeTable2', () => {
	it('should create a size table from children', () => {
		const children = [{ size: 3 }, { size: 5 }, { size: 2 }];

		const table = SizeTable.fromChildren(children, 8, 10);
		console.log(table.sizeChildAt(0));
		console.log(table.sizeChildAt(1));
		console.log(table.sizeChildAt(2));
		console.log(table.cumulativeTable);
		console.log('----');

		const table2 = table.appendChildSize(4);
		console.log(table2.totalSize);
		console.log(table2.cumulativeTable);
		console.log(table2.sizeChildAt(0));
		console.log(table2.sizeChildAt(1));
		console.log('----');

		const table3 = table2.prependChildSize(5);
		console.log(table3.totalSize);
		console.log(table3.cumulativeTable);
		console.log(table3.sizeChildAt(0));
		console.log(table3.sizeChildAt(1));

		console.log('----');

		const table4 = table3.prependChildSize(8);
		console.log(table4.totalSize);
		console.log(table4.cumulativeTable);
		console.log(table4.sizeChildAt(0));
		console.log(table4.sizeChildAt(1));

		console.log('----');

		console.log('sizes', table4.cumulativeTable);
		for (let i = 0; i < table4.totalSize; i++) {
			console.log(i, table4.getCoordinates(i));
		}
	});
});
