import { EdgeValuedGraphHashed, EdgeValuedGraphSorted } from '@rimbu/graph';
import { runGraphTestsWith } from './edge-valued-graph-test-standard';

runGraphTestsWith(
  'EdgeValuedGraphHashed',
  EdgeValuedGraphHashed.defaultContext()
);

runGraphTestsWith(
  'EdgeValuedGraphSorted',
  EdgeValuedGraphSorted.defaultContext()
);
