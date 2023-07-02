import { HashSet } from '@rimbu/hashed';

import { runMultiMapRandomTestsWith } from './multimap-test-random.mjs';

import { HashMultiMapHashValue } from '../src/main/index.mjs';

runMultiMapRandomTestsWith(
  'HashMultiMapHashValue default',
  HashMultiMapHashValue.defaultContext<number, number>(),
  HashSet.defaultContext<number>(),
  true
);
