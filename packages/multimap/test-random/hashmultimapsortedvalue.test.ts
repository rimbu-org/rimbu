import { HashSet } from '@rimbu/hashed';
import { HashMultiMapSortedValue } from '../src/main/index.mjs';
import { runMultiMapRandomTestsWith } from './multimap-test-random.mjs';

runMultiMapRandomTestsWith(
	'HashMultiMapSortedValue default',
	HashMultiMapSortedValue.defaultContext<number, number>(),
	HashSet.defaultContext<number>(),
	true,
);
