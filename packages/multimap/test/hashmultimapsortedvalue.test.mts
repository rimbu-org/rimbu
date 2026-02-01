import { runMultiMapTestsWith } from './multimap-test-standard.mjs';

import { HashMultiMapSortedValue } from '@rimbu/multimap/hash-key/sorted-value';

runMultiMapTestsWith(
  'HashMultiMapSortedValue',
  HashMultiMapSortedValue.defaultContext()
);
