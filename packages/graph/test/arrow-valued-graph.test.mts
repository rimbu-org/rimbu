import { ArrowValuedGraphHashed, ArrowValuedGraphSorted } from '@rimbu/graph';
import { runGraphTestsWith } from './arrow-valued-graph-test-standard';

runGraphTestsWith(
  'ArrowValuedGraphHashed',
  ArrowValuedGraphHashed.defaultContext()
);

runGraphTestsWith(
  'ArrowValuedGraphSorted',
  ArrowValuedGraphSorted.defaultContext()
);
