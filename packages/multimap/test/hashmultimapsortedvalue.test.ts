import { HashMultiMapSortedValue } from '@rimbu/multimap';
import { runMultiMapTestsWith } from './multimap-test-standard';

runMultiMapTestsWith(
  'HashMultiMapSortedValue',
  HashMultiMapSortedValue.defaultContext()
);
