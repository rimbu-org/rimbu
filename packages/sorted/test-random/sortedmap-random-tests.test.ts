import { runMapRandomTestsWith } from '@rimbu/collection-types/test-utils/map/map-random';
import { SortedMap } from '../src';

runMapRandomTestsWith('SortedMap default', SortedMap.defaultContext<number>());
