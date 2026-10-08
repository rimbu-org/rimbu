import type { ArrowGraph } from '@rimbu/graph/arrow-graph';

import { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed';

import { runGraphRandomTestsWith } from './graph-test-random';

runGraphRandomTestsWith(
	'ArrowGraphHashed',
	ArrowGraphHashed as unknown as ArrowGraph.Context<number>,
	true,
);
