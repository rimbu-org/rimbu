import { runTableTestsWith } from '../test-utils/table-standard-test.mjs';

import { SortedTableHashColumn } from '../src/main/index.mjs';

runTableTestsWith(
  'SortedTableHashColumn default',
  SortedTableHashColumn.defaultContext<number, number>()
);
