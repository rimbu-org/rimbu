import { SortedMultiSet } from '../src/main/index.mjs';

import { runMultiSetTestsWith } from './multiset-test-standard.mjs';

runMultiSetTestsWith('SortedMultiSet', SortedMultiSet.defaultContext());
