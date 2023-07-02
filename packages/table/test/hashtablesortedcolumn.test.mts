import { runTableTestsWith } from '../test-utils/table-standard-test.mjs';

import { HashTableSortedColumn } from '../src/main/index.mjs';

runTableTestsWith(
  'HashTableSortedColumn default',
  HashTableSortedColumn.defaultContext<number, number>()
);
