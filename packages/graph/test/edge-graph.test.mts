import { EdgeGraphHashed, EdgeGraphSorted } from '../src/main/index.mjs';
import { runEdgeGraphTestsWith } from './edge-graph-test-standard.mjs';

runEdgeGraphTestsWith('EdgeGraphHashed', EdgeGraphHashed.defaultContext());
runEdgeGraphTestsWith('EdgeGraphSorted', EdgeGraphSorted.defaultContext());
