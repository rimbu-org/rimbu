import { runSetRandomTestsWith } from '../../collection-types/test-utils/set/set-random.mjs';

import { SortedSet } from '../src/main/index.mjs';

runSetRandomTestsWith('SortedSet default', SortedSet.defaultContext<number>());
