import type { AsyncOptLazy } from '../src/async-opt-lazy.mjs';

import { expectAssignable } from 'tsd';
import { OptLazy } from '../src/opt-lazy.mjs';

expectAssignable<AsyncOptLazy<number>>(OptLazy(5));
