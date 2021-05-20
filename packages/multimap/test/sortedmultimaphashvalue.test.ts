import { SortedMultiMapHashValue } from '../src';
import { runMultiMapTestsWith } from './multimap-test-standard';

runMultiMapTestsWith(
  'SortedMultiMapHashValue',
  SortedMultiMapHashValue.defaultContext()
);
