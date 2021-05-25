import { EdgeValuedGraphHashed, EdgeValuedGraphSorted } from '../src';
import { runGraphTestsWith } from './edge-valued-graph-test-standard';

runGraphTestsWith(
  'EdgeValuedGraphHashed',
  EdgeValuedGraphHashed.defaultContext()
);

runGraphTestsWith(
  'EdgeValuedGraphSorted',
  EdgeValuedGraphSorted.defaultContext()
);
