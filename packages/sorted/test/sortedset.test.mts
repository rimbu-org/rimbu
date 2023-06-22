import { runSetTestsWith } from '../../collection-types/test-utils/set/set-standard.mjs';

import { SortedSet } from '../src/main/index.mjs';

runSetTestsWith(
  'SortedSet blockSize 2',
  SortedSet.createContext({ blockSizeBits: 2 })
);
