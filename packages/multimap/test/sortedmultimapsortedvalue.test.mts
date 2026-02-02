import { SortedMultiMapSortedValue } from '@rimbu/multimap/sorted-key/sorted-value';

import { runMultiMapTestsWith } from './multimap-test-standard.mjs';

runMultiMapTestsWith(
	'SortedMultiMapSortedValue',
	SortedMultiMapSortedValue.defaultContext(),
);
