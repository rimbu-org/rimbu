import { HashSet } from '@rimbu/hashed';
import { HashMultiMapHashValue } from '../src/main/index.mjs';
import { runMultiMapRandomTestsWith } from './multimap-test-random.mjs';

runMultiMapRandomTestsWith(
	'HashMultiMapHashValue default',
	HashMultiMapHashValue.defaultContext<number, number>(),
	HashSet.defaultContext<number>(),
	true,
);
