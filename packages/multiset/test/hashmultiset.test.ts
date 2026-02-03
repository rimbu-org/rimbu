import { HashMultiSet } from '@rimbu/multiset/hashed';
import { runMultiSetTestsWith } from './multiset-test-standard.mjs';

runMultiSetTestsWith('HashMultiSet', HashMultiSet.defaultContext());
