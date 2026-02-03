import {
  ArrowValuedGraphHashed,
  ArrowValuedGraphSorted,
} from '../src/main/index.mjs';
import { runGraphTestsWith } from './arrow-valued-graph-test-standard.mjs';

runGraphTestsWith(
  'ArrowValuedGraphHashed',
  ArrowValuedGraphHashed.defaultContext()
);

runGraphTestsWith(
  'ArrowValuedGraphSorted',
  ArrowValuedGraphSorted.defaultContext()
);
