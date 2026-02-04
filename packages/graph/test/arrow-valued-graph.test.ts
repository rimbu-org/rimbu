import { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed';
import { ArrowValuedGraphSorted } from '@rimbu/graph/valued/arrow/sorted';
import { runGraphTestsWith } from './arrow-valued-graph-test-standard';

runGraphTestsWith(
	'ArrowValuedGraphHashed',
	ArrowValuedGraphHashed.defaultContext(),
);

runGraphTestsWith(
	'ArrowValuedGraphSorted',
	ArrowValuedGraphSorted.defaultContext(),
);
