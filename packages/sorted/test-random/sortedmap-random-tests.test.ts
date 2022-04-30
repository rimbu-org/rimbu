import { runMapRandomTestsWith } from '@rimbu/collection-types/test-utils/map/map-random';
import { SortedMap } from '@rimbu/sorted';

runMapRandomTestsWith('SortedMap default', SortedMap.defaultContext<number>());
