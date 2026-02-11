import { SortedMultiMapSortedValue } from '@rimbu/multimap/sorted-key/sorted-value';
import { runMultiMapTestsWith } from './multimap-test-standard';

runMultiMapTestsWith(
	'SortedMultiMapSortedValue',
	SortedMultiMapSortedValue.defaultContext(),
);
