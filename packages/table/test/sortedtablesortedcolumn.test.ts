import { runTableTestsWith } from '../test-utils/table-standard-test';
import { SortedTableSortedColumn } from '@rimbu/table';

runTableTestsWith(
  'SortedTableSortedColumn default',
  SortedTableSortedColumn.defaultContext<number, number>()
);
