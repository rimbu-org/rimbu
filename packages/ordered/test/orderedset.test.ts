import { OrderedHashSet } from '@rimbu/ordered/set/hashed';
import { OrderedSortedSet } from '@rimbu/ordered/set/sorted';
import { runSetTestsWith } from '../../collection-types/test-utils/set/set-standard';

runSetTestsWith(
	'OrderedHashSet default',
	OrderedHashSet.defaultContext<number>(),
);
runSetTestsWith(
	'OrderedSortedSet default',
	OrderedSortedSet.defaultContext<number>(),
);
