import { OrderedHashMap } from '@rimbu/ordered/map/hashed';
import { runMapTestsWith } from '../test-utils/map/map-standard';

runMapTestsWith(
	'OrderedHashMap default',
	OrderedHashMap.defaultContext<number>(),
);

// runMapTestsWith(
// 	'OrderedSortedMap default',
// 	OrderedSortedMap.defaultContext<number>(),
// );
