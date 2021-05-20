import { SortedMultiSet } from '../src';
import { runMultiSetRandomTestsWith } from './multiset-test-random';

runMultiSetRandomTestsWith(
  'SortedMultiSet default',
  SortedMultiSet.defaultContext()
);
