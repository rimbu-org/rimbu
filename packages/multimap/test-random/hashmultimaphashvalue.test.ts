import { HashSet } from '@rimbu/hashed/set';
import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
import { runMultiMapRandomTestsWith } from './multimap-test-random';

runMultiMapRandomTestsWith(
	'HashMultiMapHashValue default',
	HashMultiMapHashValue,
	HashSet,
	true,
);
