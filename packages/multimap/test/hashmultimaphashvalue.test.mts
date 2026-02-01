import { runMultiMapTestsWith } from './multimap-test-standard.mjs';

import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';

runMultiMapTestsWith(
  'HashMultiMapHashValue',
  HashMultiMapHashValue.defaultContext()
);
