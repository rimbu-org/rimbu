import { SortedTableSortedColumn } from '../src';
import { runTableTestsWith } from './table-standard-test';

runTableTestsWith(
  'SortedTableSortedColumn default',
  SortedTableSortedColumn.defaultContext<number, number>()
);
