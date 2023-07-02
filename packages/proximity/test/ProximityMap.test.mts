import { runMapTestsWith } from '../../collection-types/test-utils/map/map-standard.mjs';

import { ProximityMap } from '../src/map/index.mjs';

runMapTestsWith(
  'ProximityMap with default options',
  ProximityMap.createContext()
);
