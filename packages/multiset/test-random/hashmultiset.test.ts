import { HashMultiSet } from '@rimbu/multiset/hashed';
import { runMultiSetRandomTestsWith } from './multiset-test-random';

runMultiSetRandomTestsWith(
	'HashMultiSet default',
	HashMultiSet.defaultContext(),
);
