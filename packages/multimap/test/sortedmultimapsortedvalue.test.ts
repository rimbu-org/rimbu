import { SortedMultiMapSortedValue } from '@rimbu/multimap';
import { runMultiMapTestsWith } from './multimap-test-standard';

runMultiMapTestsWith(
  'SortedMultiMapSortedValue',
  SortedMultiMapSortedValue.defaultContext()
);
