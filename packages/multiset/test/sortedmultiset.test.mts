import { SortedMultiSet } from '@rimbu/multiset/sorted';

import { runMultiSetTestsWith } from './multiset-test-standard.mjs';

runMultiSetTestsWith('SortedMultiSet', SortedMultiSet.defaultContext());
