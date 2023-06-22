import { SortedMultiSet } from '@rimbu/multiset';
import { runMultiSetRandomTestsWith } from './multiset-test-random';

runMultiSetRandomTestsWith(
  'SortedMultiSet default',
  SortedMultiSet.defaultContext()
);
