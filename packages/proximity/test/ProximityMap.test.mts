import { runMapTestsWith } from '@rimbu/collection-types/test-utils/map/map-standard';
import { ProximityMap } from '../src/map';

runMapTestsWith(
  'ProximityMap with default options',
  ProximityMap.createContext()
);
