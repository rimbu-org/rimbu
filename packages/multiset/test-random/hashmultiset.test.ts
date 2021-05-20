import { HashMultiSet } from '../src';
import { runMultiSetRandomTestsWith } from './multiset-test-random';

runMultiSetRandomTestsWith(
  'HashMultiSet default',
  HashMultiSet.defaultContext()
);
