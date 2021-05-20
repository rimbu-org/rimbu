import { runSetTestsWith } from '@rimbu/collection-types/test-utils/set/set-standard';
import { SortedSet } from '../src';

runSetTestsWith(
  'SortedSet blockSize 2',
  SortedSet.createContext({ blockSizeBits: 2 })
);
