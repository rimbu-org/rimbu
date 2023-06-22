import { SortedMultiMapHashValue } from '../src/main/index.mjs';

import { runMultiMapTestsWith } from './multimap-test-standard.mjs';

runMultiMapTestsWith(
  'SortedMultiMapHashValue',
  SortedMultiMapHashValue.defaultContext()
);
