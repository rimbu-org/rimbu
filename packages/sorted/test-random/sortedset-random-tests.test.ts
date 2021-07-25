import { runSetRandomTestsWith } from '@rimbu/collection-types/test-utils/set/set-random';
import { SortedSet } from '../src';

runSetRandomTestsWith('SortedSet default', SortedSet.defaultContext<number>());
