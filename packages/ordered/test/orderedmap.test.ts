import { OrderedMap } from '@rimbu/ordered/map';
import { runMapTestsWith } from '../test-utils/map/map-standard';

runMapTestsWith('OrderedHashMap default', OrderedMap.createContext<number>({}));

// runMapTestsWith(
// 	'OrderedSortedMap default',
// 	OrderedSortedMap.defaultContext<number>(),
// );
