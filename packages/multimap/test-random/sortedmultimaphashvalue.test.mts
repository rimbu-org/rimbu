import { HashSet } from '@rimbu/hashed';

import { runMultiMapRandomTestsWith } from './multimap-test-random.mjs';

import { SortedMultiMapHashValue } from '../src/main/index.mjs';

runMultiMapRandomTestsWith(
  'SortedMultiMapHashValue default',
  SortedMultiMapHashValue.defaultContext<number, number>(),
  HashSet.defaultContext<number>(),
  true
);
