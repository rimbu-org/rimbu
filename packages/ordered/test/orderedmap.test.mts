import { runMapTestsWith } from '../../collection-types/test-utils/map/map-standard.mjs';

import { OrderedHashMap } from '@rimbu/ordered/map/hashed';
import { OrderedSortedMap } from '@rimbu/ordered/map/sorted';

runMapTestsWith(
  'OrderedHashMap default',
  OrderedHashMap.defaultContext<number>()
);

runMapTestsWith(
  'OrderedSortedMap default',
  OrderedSortedMap.defaultContext<number>()
);
