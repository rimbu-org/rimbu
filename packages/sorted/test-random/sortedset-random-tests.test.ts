import { SortedSet } from '@rimbu/sorted/set';
import { runSetRandomTestsWith } from '@rimbu/collection-types/test-utils/set/set-random';

// @ts-ignore legacy RSet.Context vs SortedSet.Context mismatch until 10
runSetRandomTestsWith('SortedSet default', SortedSet as any);
