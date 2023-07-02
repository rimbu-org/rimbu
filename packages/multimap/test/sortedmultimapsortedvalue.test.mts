import { SortedMultiMapSortedValue } from '../src/main/index.mjs';

import { runMultiMapTestsWith } from './multimap-test-standard.mjs';

runMultiMapTestsWith(
  'SortedMultiMapSortedValue',
  SortedMultiMapSortedValue.defaultContext()
);
