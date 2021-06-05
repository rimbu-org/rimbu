import { runTableRandomTestsWith } from '@rimbu/table/test-random/table-test-random';
import { SortedTableSortedColumn } from '../src';

runTableRandomTestsWith(
  'SortedTableSortedColumn default',
  SortedTableSortedColumn.defaultContext<number, number>()
);
