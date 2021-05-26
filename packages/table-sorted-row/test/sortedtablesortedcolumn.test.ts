import { runTableTestsWith } from '@rimbu/table/test-utils/table-standard-test';
import { SortedTableSortedColumn } from '../src';

runTableTestsWith(
  'SortedTableSortedColumn default',
  SortedTableSortedColumn.defaultContext<number, number>()
);
