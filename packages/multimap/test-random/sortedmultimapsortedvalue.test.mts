import { HashSet } from '@rimbu/hashed';
import { SortedMultiMapSortedValue } from '@rimbu/multimap';
import { runMultiMapRandomTestsWith } from './multimap-test-random';

runMultiMapRandomTestsWith(
  'SortedMultiMapSortedValue default',
  SortedMultiMapSortedValue.defaultContext<number, number>(),
  HashSet.defaultContext<number>(),
  true
);
