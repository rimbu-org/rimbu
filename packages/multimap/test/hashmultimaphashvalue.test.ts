import { HashMultiMapHashValue } from '../src';
import { runMultiMapTestsWith } from './multimap-test-standard';

runMultiMapTestsWith(
  'HashMultiMapHashValue',
  HashMultiMapHashValue.defaultContext()
);
