import { runTableRandomTestsWith } from './table-test-random.mjs';

import { HashTableSortedColumn } from '../src/main/index.mjs';

runTableRandomTestsWith(
  'HashTableSortedColumn default',
  HashTableSortedColumn.defaultContext()
);
