import { runMultiMapRandomTestsWith } from './multimap-test-random';
import { HashSet } from '@rimbu/hashed';
import { SortedMultiMapSortedValue } from '../src';

runMultiMapRandomTestsWith(
  'SortedMultiMapSortedValue default',
  SortedMultiMapSortedValue.defaultContext<number, number>(),
  HashSet.defaultContext<number>(),
  true
);
