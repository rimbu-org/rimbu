import { expectTypeOf } from 'bun:test';

import type { AsyncOptLazy } from '@rimbu/common/async-opt-lazy';

import { OptLazy } from '@rimbu/common/opt-lazy';

expectTypeOf<AsyncOptLazy<number>>(OptLazy(5));
