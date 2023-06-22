import { HashMultiSet } from '../src/main/index.mjs';

import { runMultiSetRandomTestsWith } from './multiset-test-random.mjs';

runMultiSetRandomTestsWith(
  'HashMultiSet default',
  HashMultiSet.defaultContext()
);
