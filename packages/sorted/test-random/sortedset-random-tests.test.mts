import { runSetRandomTestsWith } from '@rimbu/collection-types/test-utils/set/set-random';
import { SortedSet } from '@rimbu/sorted';

runSetRandomTestsWith('SortedSet default', SortedSet.defaultContext<number>());
