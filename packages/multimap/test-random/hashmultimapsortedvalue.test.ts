import { HashSet } from '@rimbu/hashed/set';
import { HashMultiMapSortedValue } from '@rimbu/multimap/hash-key/sorted-value';
import { runMultiMapRandomTestsWith } from './multimap-test-random';

runMultiMapRandomTestsWith(
	'HashMultiMapSortedValue default',
	HashMultiMapSortedValue.defaultContext<number, number>(),
	HashSet.defaultContext<number>(),
	true,
);
