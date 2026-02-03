import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
import { runMultiMapTestsWith } from './multimap-test-standard.mjs';

runMultiMapTestsWith(
	'HashMultiMapHashValue',
	HashMultiMapHashValue.defaultContext(),
);
