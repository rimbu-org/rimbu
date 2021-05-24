import { EdgeGraphHashed, EdgeGraphSorted } from '../src';
import { runEdgeGraphTestsWith } from './edge-graph-test-standard';

runEdgeGraphTestsWith('EdgeGraphHashed', EdgeGraphHashed.defaultContext());
runEdgeGraphTestsWith('EdgeGraphSorted', EdgeGraphSorted.defaultContext());
