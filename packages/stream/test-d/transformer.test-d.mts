import { expectAssignable } from 'tsd';

import { Transformer, type AsyncTransformer } from '../src/main/index.mjs';

const transformer = Transformer.distinctPrevious<number>();

expectAssignable<AsyncTransformer<number>>(transformer);
