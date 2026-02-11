import { HashSet } from '@rimbu/hashed/set';
import { SortedMultiMapHashValue } from '@rimbu/multimap/sorted-key/hash-value';
import { runMultiMapRandomTestsWith } from './multimap-test-random';

runMultiMapRandomTestsWith(
	'SortedMultiMapHashValue default',
	SortedMultiMapHashValue.defaultContext<number, number>(),
	HashSet.defaultContext<number>(),
	true,
);
