import { runTableRandomTestsWith } from '@rimbu/table/test-random/table-test-random';
import { HashTableSortedColumn } from '@rimbu/table';

runTableRandomTestsWith(
  'HashTableSortedColumn default',
  HashTableSortedColumn.defaultContext()
);
