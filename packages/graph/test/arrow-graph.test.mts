import { ArrowGraphHashed, ArrowGraphSorted } from '@rimbu/graph';
import { runArrowGraphTestsWith } from './arrow-graph-test-standard';

runArrowGraphTestsWith('ArrowGraphHashed', ArrowGraphHashed.defaultContext());
runArrowGraphTestsWith('ArrowGraphSorted', ArrowGraphSorted.defaultContext());
