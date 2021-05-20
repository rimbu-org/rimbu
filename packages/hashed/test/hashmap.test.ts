import { runMapTestsWith } from '@rimbu/collection-types/test-utils/map/map-standard';
import { Hasher, HashMap } from '../src';

const collisionHasher: Hasher<any> = {
  hash: () => 1,
  isValid(value: any): value is any {
    return true;
  },
};

runMapTestsWith(
  'HashMap collision hasher',
  HashMap.createContext({ hasher: collisionHasher, blockSizeBits: 2 })
);

runMapTestsWith(
  'HashMap block size 2',
  HashMap.createContext({ blockSizeBits: 2 })
);
