import { runTableRandomTestsWith } from './table-test-random.mjs';

import { SortedTableSortedColumn } from '../src/main/index.mjs';

runTableRandomTestsWith(
  'SortedTableSortedColumn default',
  SortedTableSortedColumn.defaultContext<number, number>()
);
