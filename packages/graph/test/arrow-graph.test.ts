import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed';
import { ArrowGraphSorted } from '@rimbu/graph/non-valued/arrow/sorted';
import { runArrowGraphTestsWith } from './arrow-graph-test-standard';

runArrowGraphTestsWith('ArrowGraphHashed', ArrowGraphHashed.defaultContext());
runArrowGraphTestsWith('ArrowGraphSorted', ArrowGraphSorted.defaultContext());
