import { runMapTestsWith } from '@rimbu/collection-types/test-utils/map/map-standard';
import { OrderedHashMap, OrderedSortedMap } from '@rimbu/ordered';

runMapTestsWith(
  'OrderedHashMap default',
  OrderedHashMap.defaultContext<number>()
);

runMapTestsWith(
  'OrderedSortedMap default',
  OrderedSortedMap.defaultContext<number>()
);
