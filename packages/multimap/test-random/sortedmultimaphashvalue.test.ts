import { HashSet } from '@rimbu/hashed';
import { SortedMultiMapHashValue } from '@rimbu/multimap';
import { runMultiMapRandomTestsWith } from './multimap-test-random';

runMultiMapRandomTestsWith(
  'SortedMultiMapHashValue default',
  SortedMultiMapHashValue.defaultContext<number, number>(),
  HashSet.defaultContext<number>(),
  true
);
