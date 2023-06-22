import { runMultiMapTestsWith } from './multimap-test-standard.mjs';

import { HashMultiMapHashValue } from '../src/main/index.mjs';

runMultiMapTestsWith(
  'HashMultiMapHashValue',
  HashMultiMapHashValue.defaultContext()
);
