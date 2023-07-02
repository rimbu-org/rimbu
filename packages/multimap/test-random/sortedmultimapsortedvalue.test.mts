import { HashSet } from '@rimbu/hashed';

import { runMultiMapRandomTestsWith } from './multimap-test-random.mjs';

import { SortedMultiMapSortedValue } from '../src/main/index.mjs';

runMultiMapRandomTestsWith(
  'SortedMultiMapSortedValue default',
  SortedMultiMapSortedValue.defaultContext<number, number>(),
  HashSet.defaultContext<number>(),
  true
);
