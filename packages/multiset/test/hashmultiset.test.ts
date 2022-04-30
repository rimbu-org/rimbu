import { HashMultiSet } from '@rimbu/multiset';
import { runMultiSetTestsWith } from './multiset-test-standard';

runMultiSetTestsWith('HashMultiSet', HashMultiSet.defaultContext());
