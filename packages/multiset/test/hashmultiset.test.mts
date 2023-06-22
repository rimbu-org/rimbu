import { HashMultiSet } from '../src/main/index.mjs';

import { runMultiSetTestsWith } from './multiset-test-standard.mjs';

runMultiSetTestsWith('HashMultiSet', HashMultiSet.defaultContext());
