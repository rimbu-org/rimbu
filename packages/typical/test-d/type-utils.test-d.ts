import { expectTypeOf } from 'bun:test';

import type { U } from '@rimbu/typical';

declare function g<T>(): T;

expectTypeOf(g<U.Check<5>>()).toEqualTypeOf<unknown>();
expectTypeOf(g<U.Check<true>>()).toEqualTypeOf<unknown>();
expectTypeOf(g<U.Check<never>>()).toEqualTypeOf<never>();
expectTypeOf(g<U.Check<false>>()).toEqualTypeOf<never>();

expectTypeOf(g<U.Validate<5>>()).toEqualTypeOf<true>();
expectTypeOf(g<U.Validate<true>>()).toEqualTypeOf<true>();
expectTypeOf(g<U.Validate<never>>()).toEqualTypeOf<never>();
expectTypeOf(g<U.Validate<false>>()).toEqualTypeOf<never>();

expectTypeOf(g<U.Extends<1, number>>()).toEqualTypeOf<true>();
expectTypeOf(g<U.Extends<1, string>>()).toEqualTypeOf<false>();
expectTypeOf(g<U.Extends<1, number, 'a'>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<U.Extends<1, string, 'a'>>()).toEqualTypeOf<false>();
expectTypeOf(g<U.Extends<1, number, 'a', 'q'>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<U.Extends<1, string, 'a', 'q'>>()).toEqualTypeOf<'q'>();

expectTypeOf(g<U.NotExtends<1, number>>()).toEqualTypeOf<false>();
expectTypeOf(g<U.NotExtends<1, string>>()).toEqualTypeOf<true>();
expectTypeOf(g<U.NotExtends<1, number, 'a'>>()).toEqualTypeOf<false>();
expectTypeOf(g<U.NotExtends<1, string, 'a'>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<U.NotExtends<1, number, 'a', 'q'>>()).toEqualTypeOf<'q'>();
expectTypeOf(g<U.NotExtends<1, string, 'a', 'q'>>()).toEqualTypeOf<'a'>();
