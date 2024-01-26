import { expectAssignable } from 'tsd';

import { OptLazy, AsyncOptLazy } from '../src/index.mjs';

expectAssignable<AsyncOptLazy<number>>(OptLazy(5));
