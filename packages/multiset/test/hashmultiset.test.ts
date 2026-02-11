import { HashMultiSet } from '@rimbu/multiset/hashed';
import { runMultiSetTestsWith } from './multiset-test-standard';

runMultiSetTestsWith('HashMultiSet', HashMultiSet.defaultContext());
