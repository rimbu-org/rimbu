import { HashSet } from '@rimbu/hashed';
import { HashMultiMapSortedValue } from '@rimbu/multimap';
import { runMultiMapRandomTestsWith } from './multimap-test-random';

runMultiMapRandomTestsWith(
  'HashMultiMapSortedValue default',
  HashMultiMapSortedValue.defaultContext<number, number>(),
  HashSet.defaultContext<number>(),
  true
);
