import { HashSet } from '@rimbu/hashed';
import { HashMultiMapHashValue } from '@rimbu/multimap';
import { runMultiMapRandomTestsWith } from './multimap-test-random';

runMultiMapRandomTestsWith(
  'HashMultiMapHashValue default',
  HashMultiMapHashValue.defaultContext<number, number>(),
  HashSet.defaultContext<number>(),
  true
);
