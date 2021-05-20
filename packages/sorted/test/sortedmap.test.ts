import { runMapTestsWith } from '@rimbu/collection-types/test-utils/map/map-standard';
import { SortedMap as SortedMapSrc } from '../src';

runMapTestsWith(
  'SortedMap blockSize 2',
  SortedMapSrc.createContext({ blockSizeBits: 2 })
);
