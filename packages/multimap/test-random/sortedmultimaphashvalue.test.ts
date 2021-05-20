import { runMultiMapRandomTestsWith } from './multimap-test-random';
import { HashSet } from '@rimbu/hashed';
import { SortedMultiMapHashValue } from '../src';

runMultiMapRandomTestsWith(
  'SortedMultiMapHashValue default',
  SortedMultiMapHashValue.defaultContext<number, number>(),
  HashSet.defaultContext<number>(),
  true
);
