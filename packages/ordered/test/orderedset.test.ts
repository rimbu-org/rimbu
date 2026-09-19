import { runSetTestsWith } from '@rimbu/collection-types/test-utils/set/set-collection-standard';
import { OrderedSet } from '@rimbu/ordered/set';
import { SortedSet } from '@rimbu/sorted/set';

runSetTestsWith(
	'OrderedSet default',
	OrderedSet.createContext<number>({}),
	SortedSet.createContext<number>({}),
);
