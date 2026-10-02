import { SortedBiMultiMap } from '@rimbu/bimultimap/sorted';
import { runBiMultiMapRandomTestsWith } from './bimultimap-test-random';

runBiMultiMapRandomTestsWith(
	'SortedBiMultiMap',
	SortedBiMultiMap,
);
