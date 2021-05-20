import { HashMultiMapSortedValue } from '../src';
import { runMultiMapTestsWith } from './multimap-test-standard';

runMultiMapTestsWith(
  'HashMultiMapSortedValue',
  HashMultiMapSortedValue.defaultContext()
);
