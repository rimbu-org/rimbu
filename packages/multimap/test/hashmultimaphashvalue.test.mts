import { HashMultiMapHashValue } from '@rimbu/multimap';
import { runMultiMapTestsWith } from './multimap-test-standard';

runMultiMapTestsWith(
  'HashMultiMapHashValue',
  HashMultiMapHashValue.defaultContext()
);
