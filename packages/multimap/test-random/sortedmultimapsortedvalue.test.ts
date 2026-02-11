import { HashSet } from '@rimbu/hashed/set';
import { SortedMultiMapSortedValue } from '@rimbu/multimap/sorted-key/sorted-value';
import { runMultiMapRandomTestsWith } from './multimap-test-random';

runMultiMapRandomTestsWith(
	'SortedMultiMapSortedValue default',
	SortedMultiMapSortedValue.defaultContext<number, number>(),
	HashSet.defaultContext<number>(),
	true,
);
