import { EdgeGraphHashed, EdgeGraphSorted } from '@rimbu/graph';
import { runEdgeGraphTestsWith } from './edge-graph-test-standard';

runEdgeGraphTestsWith('EdgeGraphHashed', EdgeGraphHashed.defaultContext());
runEdgeGraphTestsWith('EdgeGraphSorted', EdgeGraphSorted.defaultContext());
