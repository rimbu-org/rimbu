import { runTableTestsWith } from '../test-utils/table-standard-test.mjs';

import { SortedTableSortedColumn } from '../src/main/index.mjs';

runTableTestsWith(
  'SortedTableSortedColumn default',
  SortedTableSortedColumn.defaultContext<number, number>()
);
