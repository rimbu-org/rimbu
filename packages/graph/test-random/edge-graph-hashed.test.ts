import type { ArrowGraph } from '@rimbu/graph/arrow-graph';

import { EdgeGraphHashed } from '@rimbu/graph/non-valued/edge/hashed';

import { runGraphRandomTestsWith } from './graph-test-random';

runGraphRandomTestsWith(
	'EdgeGraphHashed',
	EdgeGraphHashed as unknown as ArrowGraph.Context<number>,
	false,
);