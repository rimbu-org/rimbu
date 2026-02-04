import { SortedTableSortedColumn } from '@rimbu/table/sorted-row/sorted-column';
import { runTableTestsWith } from '../test-utils/table-standard-test';

runTableTestsWith(
	'SortedTableSortedColumn default',
	SortedTableSortedColumn.defaultContext<number, number>(),
);
