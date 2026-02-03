import { HashSet } from '@rimbu/hashed';
import { SortedMultiMapHashValue } from '../src/main/index.mjs';
import { runMultiMapRandomTestsWith } from './multimap-test-random.mjs';

runMultiMapRandomTestsWith(
	'SortedMultiMapHashValue default',
	SortedMultiMapHashValue.defaultContext<number, number>(),
	HashSet.defaultContext<number>(),
	true,
);
