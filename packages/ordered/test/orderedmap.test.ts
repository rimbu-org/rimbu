import { OrderedHashMap } from '@rimbu/ordered/map/hashed';
import { OrderedSortedMap } from '@rimbu/ordered/map/sorted';
import { runMapTestsWith } from '@rimbu/collection-types/test-utils/map/map-standard';

runMapTestsWith(
	'OrderedHashMap default',
	OrderedHashMap.defaultContext<number>(),
);

runMapTestsWith(
	'OrderedSortedMap default',
	OrderedSortedMap.defaultContext<number>(),
);
