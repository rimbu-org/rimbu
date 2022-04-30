import { SortedMultiMapHashValue } from '@rimbu/multimap';
import { runMultiMapTestsWith } from './multimap-test-standard';

runMultiMapTestsWith(
  'SortedMultiMapHashValue',
  SortedMultiMapHashValue.defaultContext()
);
