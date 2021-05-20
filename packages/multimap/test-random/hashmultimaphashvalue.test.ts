import { runMultiMapRandomTestsWith } from './multimap-test-random';
import { HashSet } from '@rimbu/hashed';
import { HashMultiMapHashValue } from '../src';

runMultiMapRandomTestsWith(
  'HashMultiMapHashValue default',
  HashMultiMapHashValue.defaultContext<number, number>(),
  HashSet.defaultContext<number>(),
  true
);
