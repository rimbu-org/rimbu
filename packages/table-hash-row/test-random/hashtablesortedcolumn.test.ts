import { runTableRandomTestsWith } from '@rimbu/table/test-random/table-test-random';
import { HashTableSortedColumn } from '../src';

runTableRandomTestsWith(
  'HashTableSortedColumn default',
  HashTableSortedColumn.defaultContext<number, number>()
);
