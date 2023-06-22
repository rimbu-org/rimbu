import { runTableRandomTestsWith } from './table-test-random.mjs';

import { HashTableHashColumn } from '../src/main/index.mjs';

runTableRandomTestsWith(
  'HashTableHashColumn default',
  HashTableHashColumn.defaultContext()
);
