import { runMapTestsWith } from '../../collection-types/test-utils/map/map-standard.mjs';

import { SortedMap } from '../src/main/index.mjs';

runMapTestsWith(
  'SortedMap blockSize 2',
  SortedMap.createContext({ blockSizeBits: 2 })
);

runMapTestsWith(
  'SortedMap blockSize 3',
  SortedMap.createContext({ blockSizeBits: 3 })
);
