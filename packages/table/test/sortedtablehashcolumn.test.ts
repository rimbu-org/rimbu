import { SortedTableHashColumn } from '@rimbu/table/sorted-row/hash-column';
import { runTableTestsWith } from '../test-utils/table-standard-test';

runTableTestsWith(
	'SortedTableHashColumn default',
	SortedTableHashColumn.defaultContext<number, number>(),
);
