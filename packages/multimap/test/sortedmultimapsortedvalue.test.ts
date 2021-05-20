import { SortedMultiMapSortedValue } from '../src';
import { runMultiMapTestsWith } from './multimap-test-standard';

runMultiMapTestsWith(
  'SortedMultiMapSortedValue',
  SortedMultiMapSortedValue.defaultContext()
);
