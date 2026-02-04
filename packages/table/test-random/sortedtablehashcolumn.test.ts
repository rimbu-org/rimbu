import { SortedTableHashColumn } from '@rimbu/table/sorted-row/hash-column';
import { runTableRandomTestsWith } from './table-test-random';

runTableRandomTestsWith(
	'SortedTableHashColumn default',
	SortedTableHashColumn.defaultContext<number, number>(),
);
