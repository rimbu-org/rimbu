import { HashTableSortedColumn } from '@rimbu/table/hash-row/sorted-column';
import { runTableTestsWith } from '../test-utils/table-standard-test';

runTableTestsWith(
	'HashTableSortedColumn default',
	HashTableSortedColumn.defaultContext<number, number>(),
);
