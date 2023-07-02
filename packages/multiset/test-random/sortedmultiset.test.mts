import { SortedMultiSet } from '../src/main/index.mjs';

import { runMultiSetRandomTestsWith } from './multiset-test-random.mjs';

runMultiSetRandomTestsWith(
  'SortedMultiSet default',
  SortedMultiSet.defaultContext()
);
