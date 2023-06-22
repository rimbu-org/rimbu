import { runTableRandomTestsWith } from '@rimbu/table/test-random/table-test-random';
import { SortedTableSortedColumn } from '@rimbu/table';

runTableRandomTestsWith(
  'SortedTableSortedColumn default',
  SortedTableSortedColumn.defaultContext<number, number>()
);
