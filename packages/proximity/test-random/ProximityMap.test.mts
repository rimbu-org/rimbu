import { runMapRandomTestsWith } from '@rimbu/collection-types/test-utils/map/map-random';
import { ProximityMap } from '../src/map';

runMapRandomTestsWith('ProximityMap default', ProximityMap.defaultContext());

runMapRandomTestsWith('ProximityMap blocksize 2', ProximityMap.createContext());

runMapRandomTestsWith('ProximityMap blocksize 3', ProximityMap.createContext());
