import { SortedMultiSet } from '../src';
import { runMultiSetTestsWith } from './multiset-test-standard';

runMultiSetTestsWith('SortedMultiSet', SortedMultiSet.defaultContext());
