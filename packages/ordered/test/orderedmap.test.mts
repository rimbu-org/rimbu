import { runMapTestsWith } from '../../collection-types/test-utils/map/map-standard.mjs';

import { OrderedHashMap, OrderedSortedMap } from '../src/main/index.mjs';

runMapTestsWith(
  'OrderedHashMap default',
  OrderedHashMap.defaultContext<number>()
);

runMapTestsWith(
  'OrderedSortedMap default',
  OrderedSortedMap.defaultContext<number>()
);
