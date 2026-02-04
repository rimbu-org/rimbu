import { EdgeGraphHashed } from '@rimbu/graph/non-valued/edge/hashed';
import { EdgeGraphSorted } from '@rimbu/graph/non-valued/edge/sorted';
import { runEdgeGraphTestsWith } from './edge-graph-test-standard';

runEdgeGraphTestsWith('EdgeGraphHashed', EdgeGraphHashed.defaultContext());
runEdgeGraphTestsWith('EdgeGraphSorted', EdgeGraphSorted.defaultContext());
