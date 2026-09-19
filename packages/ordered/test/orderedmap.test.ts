import { runMapTestsWith } from '@rimbu/collection-types/test-utils/map/map-collection-standard';
import { OrderedMap } from '@rimbu/ordered/map';

runMapTestsWith(
	'OrderedMap default',
	OrderedMap.createContext<number>({}).keyedContext,
);
