import { SortedMultiMapHashValue } from '@rimbu/multimap/sorted-key/hash-value';

import { runMultiMapTestsWith } from './multimap-test-standard.mjs';

runMultiMapTestsWith(
  'SortedMultiMapHashValue',
  SortedMultiMapHashValue.defaultContext()
);
