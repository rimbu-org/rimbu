import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
import { runMultiMapTestsWith } from './multimap-test-standard';

runMultiMapTestsWith(
	'HashMultiMapHashValue',
	HashMultiMapHashValue.defaultContext(),
);
