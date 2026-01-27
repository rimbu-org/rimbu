import { expectAssignable } from 'tsd';

import { AsyncOptLazy } from '../src/async-opt-lazy.mjs';
import { OptLazy } from '../src/opt-lazy.mjs';

expectAssignable<AsyncOptLazy<number>>(OptLazy(5));
