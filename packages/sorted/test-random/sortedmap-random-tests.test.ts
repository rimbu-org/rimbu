import { runMapRandomTestsWith } from '@rimbu/collection-types/test-utils/map/map-random';
import { SortedMap } from '@rimbu/sorted/map';

runMapRandomTestsWith(
	'SortedMap default',
	SortedMap.createContext<number>({}).keyedContext,
);
