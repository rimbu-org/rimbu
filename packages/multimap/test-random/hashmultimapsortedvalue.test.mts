import { HashSet } from '@rimbu/hashed';

import { runMultiMapRandomTestsWith } from './multimap-test-random.mjs';

import { HashMultiMapSortedValue } from '../src/main/index.mjs';

runMultiMapRandomTestsWith(
  'HashMultiMapSortedValue default',
  HashMultiMapSortedValue.defaultContext<number, number>(),
  HashSet.defaultContext<number>(),
  true
);
