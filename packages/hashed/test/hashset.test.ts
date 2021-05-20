import { runSetTestsWith } from '@rimbu/collection-types/test-utils/set/set-standard';
import { Hasher, HashSet } from '../src';

runSetTestsWith(
  'HashSet block size 2',
  HashSet.createContext({ blockSizeBits: 2 })
);

const collisionHasher: Hasher<any> = {
  hash: () => 1,
  isValid(value: any): value is any {
    return true;
  },
};

runSetTestsWith(
  'HashSet collision hasher',
  HashSet.createContext({ hasher: collisionHasher, blockSizeBits: 2 })
);
