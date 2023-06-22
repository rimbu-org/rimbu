import { runMultiMapTestsWith } from './multimap-test-standard.mjs';

import { HashMultiMapSortedValue } from '../src/main/index.mjs';

runMultiMapTestsWith(
  'HashMultiMapSortedValue',
  HashMultiMapSortedValue.defaultContext()
);
