import { SortedMultiSet } from '@rimbu/multiset';
import { runMultiSetTestsWith } from './multiset-test-standard';

runMultiSetTestsWith('SortedMultiSet', SortedMultiSet.defaultContext());
