import { SortedSet } from '@rimbu/sorted/set';
import { runSetRandomTestsWith } from '../../collection-types/test-utils/set/set-random';

runSetRandomTestsWith('SortedSet default', SortedSet.defaultContext<number>());
