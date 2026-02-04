import { EdgeValuedGraphHashed } from '@rimbu/graph/valued/edge/hashed';
import { EdgeValuedGraphSorted } from '@rimbu/graph/valued/edge/sorted';
import { runGraphTestsWith } from './edge-valued-graph-test-standard';

runGraphTestsWith(
	'EdgeValuedGraphHashed',
	EdgeValuedGraphHashed.defaultContext(),
);

runGraphTestsWith(
	'EdgeValuedGraphSorted',
	EdgeValuedGraphSorted.defaultContext(),
);
