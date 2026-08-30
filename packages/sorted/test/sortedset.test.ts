import { runSetTestsWith } from '@rimbu/collection-types/test-utils/set/set-collection-standard';
import { SortedSet } from '@rimbu/sorted/set';

runSetTestsWith(
  'SortedSet blockSize 2',
  SortedSet.createContext({ blockSizeBits: 2 }) as any,
  SortedSet.createContext({ blockSizeBits: 3 }) as any,
);

runSetTestsWith(
  'SortedSet blockSize 3',
  SortedSet.createContext({ blockSizeBits: 3 }) as any,
  SortedSet.createContext({ blockSizeBits: 4 }) as any,
);
