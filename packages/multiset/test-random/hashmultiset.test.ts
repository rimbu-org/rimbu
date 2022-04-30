import { HashMultiSet } from '@rimbu/multiset';
import { runMultiSetRandomTestsWith } from './multiset-test-random';

runMultiSetRandomTestsWith(
  'HashMultiSet default',
  HashMultiSet.defaultContext()
);
