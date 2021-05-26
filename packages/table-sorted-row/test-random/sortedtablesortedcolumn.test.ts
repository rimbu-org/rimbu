import { runTableRandomTestsWith } from './table-test-random';
import { SortedTableSortedColumn } from '../src';

runTableRandomTestsWith(
  'SortedTableSortedColumn default',
  SortedTableSortedColumn.defaultContext<number, number>()
);
