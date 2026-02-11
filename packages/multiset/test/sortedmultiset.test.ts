import { SortedMultiSet } from '@rimbu/multiset/sorted';
import { runMultiSetTestsWith } from './multiset-test-standard';

runMultiSetTestsWith('SortedMultiSet', SortedMultiSet.defaultContext());
