import { runTableRandomTestsWith } from './table-test-random.mjs';

import { SortedTableHashColumn } from '../src/main/index.mjs';

runTableRandomTestsWith(
  'SortedTableHashColumn default',
  SortedTableHashColumn.defaultContext<number, number>()
);
