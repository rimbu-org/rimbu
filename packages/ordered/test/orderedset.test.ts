import { OrderedSet } from '@rimbu/ordered';
import { SortedSet } from '@rimbu/sorted';
import { runSetTestsWith } from '../test-utils/set/set-standard';

runSetTestsWith(
	'OrderedSet default',
	OrderedSet.createContext<number>(),
	SortedSet.defaultContext<number>(),
);
// runSetTestsWith(
// 	'OrderedSortedSet default',
// 	OrderedSortedSet.defaultContext<number>(),
// 	OrderedHashSet.defaultContext<number>(),
// );
