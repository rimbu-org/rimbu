import { HashTableSortedColumn } from '@rimbu/table/hash-row/sorted-column';
import { runTableRandomTestsWith } from './table-test-random';

runTableRandomTestsWith(
	'HashTableSortedColumn default',
	HashTableSortedColumn.defaultContext(),
);
