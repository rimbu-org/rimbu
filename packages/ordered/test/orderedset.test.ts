import { runSetTestsWith } from '@rimbu/collection-types/test-utils/set/set-standard';
import { OrderedHashSet, OrderedSortedSet } from '@rimbu/ordered';

runSetTestsWith(
  'OrderedHashSet default',
  OrderedHashSet.defaultContext<number>()
);
runSetTestsWith(
  'OrderedSortedSet default',
  OrderedSortedSet.defaultContext<number>()
);
