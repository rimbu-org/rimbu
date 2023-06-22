import { runMapTestsWith } from '@rimbu/collection-types/test-utils/map/map-standard';
import { SortedMap } from '@rimbu/sorted';

runMapTestsWith(
  'SortedMap blockSize 2',
  SortedMap.createContext({ blockSizeBits: 2 })
);
