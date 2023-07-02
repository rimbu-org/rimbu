import { runTableTestsWith } from '../test-utils/table-standard-test.mjs';

import { HashTableHashColumn } from '../src/main/index.mjs';

runTableTestsWith(
  'HashTableHashColumn default',
  HashTableHashColumn.defaultContext()
);
