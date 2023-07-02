import { ArrowGraphHashed, ArrowGraphSorted } from '../src/main/index.mjs';
import { runArrowGraphTestsWith } from './arrow-graph-test-standard.mjs';

runArrowGraphTestsWith('ArrowGraphHashed', ArrowGraphHashed.defaultContext());
runArrowGraphTestsWith('ArrowGraphSorted', ArrowGraphSorted.defaultContext());
