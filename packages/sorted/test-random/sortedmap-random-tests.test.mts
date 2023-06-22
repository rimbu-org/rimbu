import { runMapRandomTestsWith } from '../../collection-types/test-utils/map/map-random.mjs';

import { SortedMap } from '../src/main/index.mjs';

runMapRandomTestsWith('SortedMap default', SortedMap.defaultContext<number>());
