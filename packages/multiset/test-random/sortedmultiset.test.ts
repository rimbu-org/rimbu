import { SortedMultiSet } from '@rimbu/multiset/sorted';
import { runMultiSetRandomTestsWith } from './multiset-test-random';

runMultiSetRandomTestsWith(
	'SortedMultiSet default',
	SortedMultiSet.defaultContext(),
);
