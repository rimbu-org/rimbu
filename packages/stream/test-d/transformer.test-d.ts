import { Transformer, AsyncTransformer } from '../src/main';
import { expectAssignable } from 'tsd';

const transformer = Transformer.distinctPrevious<number>();

expectAssignable<AsyncTransformer<number>>(transformer);
