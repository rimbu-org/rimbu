import { runSetTestsWith } from '../../collection-types/test-utils/set/set-standard.mjs';

import { OrderedHashSet, OrderedSortedSet } from '../src/main/index.mjs';

runSetTestsWith(
  'OrderedHashSet default',
  OrderedHashSet.defaultContext<number>()
);
runSetTestsWith(
  'OrderedSortedSet default',
  OrderedSortedSet.defaultContext<number>()
);
