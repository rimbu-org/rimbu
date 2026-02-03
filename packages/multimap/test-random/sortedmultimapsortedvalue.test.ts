import { HashSet } from '@rimbu/hashed';
import { SortedMultiMapSortedValue } from '../src/main/index.mjs';
import { runMultiMapRandomTestsWith } from './multimap-test-random.mjs';

runMultiMapRandomTestsWith(
	'SortedMultiMapSortedValue default',
	SortedMultiMapSortedValue.defaultContext<number, number>(),
	HashSet.defaultContext<number>(),
	true,
);
