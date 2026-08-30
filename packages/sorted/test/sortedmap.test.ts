import { runMapTestsWith } from '@rimbu/collection-types/test-utils/map/map-collection-standard';
import { SortedMap } from '@rimbu/sorted/map';

runMapTestsWith(
  'SortedMap blockSize 2',
  SortedMap.createContext({ blockSizeBits: 2 }).keyedContext as any,
);

runMapTestsWith(
  'SortedMap blockSize 3',
  SortedMap.createContext({ blockSizeBits: 3 }).keyedContext as any,
);
