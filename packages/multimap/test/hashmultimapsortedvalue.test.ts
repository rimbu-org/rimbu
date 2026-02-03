import { HashMultiMapSortedValue } from '@rimbu/multimap/hash-key/sorted-value';
import { runMultiMapTestsWith } from './multimap-test-standard.mjs';

runMultiMapTestsWith(
	'HashMultiMapSortedValue',
	HashMultiMapSortedValue.defaultContext(),
);
