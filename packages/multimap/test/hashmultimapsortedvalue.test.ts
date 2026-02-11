import { HashMultiMapSortedValue } from '@rimbu/multimap/hash-key/sorted-value';
import { runMultiMapTestsWith } from './multimap-test-standard';

runMultiMapTestsWith(
	'HashMultiMapSortedValue',
	HashMultiMapSortedValue.defaultContext(),
);
