import { runMultiMapRandomTestsWith } from './multimap-test-random';
import { HashSet } from '@rimbu/hashed';
import { HashMultiMapSortedValue } from '../src';

runMultiMapRandomTestsWith(
  'HashMultiMapSortedValue default',
  HashMultiMapSortedValue.defaultContext<number, number>(),
  HashSet.defaultContext<number>(),
  true
);
