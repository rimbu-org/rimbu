import { ArrowGraphHashed, ArrowGraphSorted } from '../src';
import { runArrowGraphTestsWith } from './arrow-graph-test-standard';

runArrowGraphTestsWith('ArrowGraphHashed', ArrowGraphHashed.defaultContext());
runArrowGraphTestsWith('ArrowGraphSorted', ArrowGraphSorted.defaultContext());
