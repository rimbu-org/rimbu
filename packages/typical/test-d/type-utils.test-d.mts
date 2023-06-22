import { expectType } from 'tsd';
import type { U } from '../src/index';

declare function g<T>(): T;

expectType<unknown>(g<U.Check<5>>());
expectType<unknown>(g<U.Check<true>>());
expectType<never>(g<U.Check<never>>());
expectType<never>(g<U.Check<false>>());

expectType<true>(g<U.Validate<5>>());
expectType<true>(g<U.Validate<true>>());
expectType<never>(g<U.Validate<never>>());
expectType<never>(g<U.Validate<false>>());

expectType<true>(g<U.Extends<1, number>>());
expectType<false>(g<U.Extends<1, string>>());
expectType<'a'>(g<U.Extends<1, number, 'a'>>());
expectType<false>(g<U.Extends<1, string, 'a'>>());
expectType<'a'>(g<U.Extends<1, number, 'a', 'q'>>());
expectType<'q'>(g<U.Extends<1, string, 'a', 'q'>>());

expectType<false>(g<U.NotExtends<1, number>>());
expectType<true>(g<U.NotExtends<1, string>>());
expectType<false>(g<U.NotExtends<1, number, 'a'>>());
expectType<'a'>(g<U.NotExtends<1, string, 'a'>>());
expectType<'q'>(g<U.NotExtends<1, number, 'a', 'q'>>());
expectType<'a'>(g<U.NotExtends<1, string, 'a', 'q'>>());
