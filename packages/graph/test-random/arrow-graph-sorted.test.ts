import type { ArrowGraph } from '@rimbu/graph/arrow-graph';

import { ArrowGraphSorted } from '@rimbu/graph/non-valued/arrow/sorted';

import { runGraphRandomTestsWith } from './graph-test-random';

runGraphRandomTestsWith(
	'ArrowGraphSorted',
	ArrowGraphSorted as unknown as ArrowGraph.Context<number>,
	true,
);
