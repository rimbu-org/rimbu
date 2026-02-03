import { SortedMap } from '@rimbu/sorted/map';
import { runMapRandomTestsWith } from '../../collection-types/test-utils/map/map-random';

runMapRandomTestsWith('SortedMap default', SortedMap.defaultContext<number>());
