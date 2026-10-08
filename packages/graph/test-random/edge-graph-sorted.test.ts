import type { ArrowGraph } from '@rimbu/graph/arrow-graph';

import { EdgeGraphSorted } from '@rimbu/graph/non-valued/edge/sorted';

import { runGraphRandomTestsWith } from './graph-test-random';

runGraphRandomTestsWith(
	'EdgeGraphSorted',
	EdgeGraphSorted as unknown as ArrowGraph.Context<number>,
	false,
);