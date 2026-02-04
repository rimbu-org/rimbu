import { SortedTableSortedColumn } from '@rimbu/table/sorted-row/sorted-column';
import { runTableRandomTestsWith } from './table-test-random';

runTableRandomTestsWith(
	'SortedTableSortedColumn default',
	SortedTableSortedColumn.defaultContext<number, number>(),
);
