import { runTableTestsWith } from '../test-utils/table-standard-test';
import { HashTableSortedColumn } from '@rimbu/table';

runTableTestsWith(
  'HashTableSortedColumn default',
  HashTableSortedColumn.defaultContext<number, number>()
);
