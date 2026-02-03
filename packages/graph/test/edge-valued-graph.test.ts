import {
  EdgeValuedGraphHashed,
  EdgeValuedGraphSorted,
} from '../src/main/index.mjs';
import { runGraphTestsWith } from './edge-valued-graph-test-standard.mjs';

runGraphTestsWith(
  'EdgeValuedGraphHashed',
  EdgeValuedGraphHashed.defaultContext()
);

runGraphTestsWith(
  'EdgeValuedGraphSorted',
  EdgeValuedGraphSorted.defaultContext()
);
