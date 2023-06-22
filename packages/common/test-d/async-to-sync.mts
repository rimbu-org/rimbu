import { expectAssignable } from 'tsd';

import { Reducer, AsyncReducer, OptLazy, AsyncOptLazy } from '../src';

const reducer = Reducer.sum;

expectAssignable<AsyncReducer<number, number>>(reducer);

expectAssignable<AsyncOptLazy<number>>(OptLazy(5));
