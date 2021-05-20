import { HashMultiSet } from '../src';
import { runMultiSetTestsWith } from './multiset-test-standard';

runMultiSetTestsWith('HashMultiSet', HashMultiSet.defaultContext());
