import { SortedSet } from '@rimbu/sorted/set';
import { runSetRandomTestsWith } from '@rimbu/collection-types/test-utils/set/set-random';

runSetRandomTestsWith('SortedSet default', SortedSet.defaultContext<number>());
