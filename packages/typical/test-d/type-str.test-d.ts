import { expectTypeOf } from 'bun:test';

import type { Str } from '@rimbu/typical';

declare function g<T>(): T;

expectTypeOf(g<Str.Append<'', 'a'>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.Append<'a', 'b'>>()).toEqualTypeOf<'ab'>();
expectTypeOf(g<Str.Append<'ab', 'c'>>()).toEqualTypeOf<'abc'>();
expectTypeOf(g<Str.Append<'a', 'bc'>>()).toEqualTypeOf<'abc'>();
expectTypeOf(g<Str.Append<'', 'abc'>>()).toEqualTypeOf<'abc'>();
expectTypeOf(g<Str.Append<'abc', ''>>()).toEqualTypeOf<'abc'>();

expectTypeOf(g<Str.AppendTwo<'a', '', ''>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.AppendTwo<'', 'a', ''>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.AppendTwo<'', '', 'a'>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.AppendTwo<'a', 'b', 'c'>>()).toEqualTypeOf<'abc'>();
expectTypeOf(g<Str.AppendTwo<'ab', '', 'c'>>()).toEqualTypeOf<'abc'>();
expectTypeOf(g<Str.AppendTwo<'ab', 'c', ''>>()).toEqualTypeOf<'abc'>();
expectTypeOf(g<Str.AppendTwo<'', 'ab', 'c'>>()).toEqualTypeOf<'abc'>();
expectTypeOf(g<Str.AppendTwo<'', 'a', 'bc'>>()).toEqualTypeOf<'abc'>();

expectTypeOf(g<Str.CharAt<'abc', 0>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.CharAt<'abc', 1>>()).toEqualTypeOf<'b'>();
expectTypeOf(g<Str.CharAt<'abc', 2>>()).toEqualTypeOf<'c'>();
expectTypeOf(g<Str.CharAt<'abc', 3>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.CharAt<'', 0>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.CharAt<'', -1>>()).toEqualTypeOf<false>();

expectTypeOf(g<Str.Contains<'', 'a'>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.Contains<'a', 'a'>>()).toEqualTypeOf<true>();
expectTypeOf(g<Str.Contains<'a', 'b'>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.Contains<'bbbbccccaccccdddd', 'a'>>()).toEqualTypeOf<true>();
expectTypeOf(
	g<Str.Contains<'bbbbccccaccccdddd', 'q'>>(),
).toEqualTypeOf<false>();
expectTypeOf(g<Str.Contains<'caccaaddda', 'a', 2>>()).toEqualTypeOf<true>();
expectTypeOf(g<Str.Contains<'caccaaddda', 'a', 4>>()).toEqualTypeOf<true>();
expectTypeOf(g<Str.Contains<'caccaaddda', 'a', 5>>()).toEqualTypeOf<false>();

expectTypeOf(g<Str.Count<'', 'a'>>()).toEqualTypeOf<0>();
expectTypeOf(g<Str.Count<'a', 'a'>>()).toEqualTypeOf<1>();
expectTypeOf(g<Str.Count<'ab', 'a'>>()).toEqualTypeOf<1>();
expectTypeOf(g<Str.Count<'ba', 'a'>>()).toEqualTypeOf<1>();
expectTypeOf(g<Str.Count<'bac', 'a'>>()).toEqualTypeOf<1>();
expectTypeOf(g<Str.Count<'baca', 'a'>>()).toEqualTypeOf<2>();
expectTypeOf(g<Str.Count<'bacad', 'a'>>()).toEqualTypeOf<2>();
expectTypeOf(g<Str.Count<'bacad', 'a' | 'b'>>()).toEqualTypeOf<3>();
expectTypeOf(g<Str.Count<'bacad', 'q'>>()).toEqualTypeOf<0>();

expectTypeOf(g<Str.Drop<'', 0>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.Drop<'', 1>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.Drop<'a', 0>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.Drop<'a', 1>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.Drop<'a', 2>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.Drop<'abc', 0>>()).toEqualTypeOf<'abc'>();
expectTypeOf(g<Str.Drop<'abc', 1>>()).toEqualTypeOf<'bc'>();
expectTypeOf(g<Str.Drop<'abc', 2>>()).toEqualTypeOf<'c'>();
expectTypeOf(g<Str.Drop<'abc', 3>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.Drop<'abc', 4>>()).toEqualTypeOf<''>();

expectTypeOf(g<Str.DropStrict<'', 0>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.DropStrict<'', 1>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.DropStrict<'a', 0>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.DropStrict<'a', 1>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.DropStrict<'a', 2>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.DropStrict<'abc', 0>>()).toEqualTypeOf<'abc'>();
expectTypeOf(g<Str.DropStrict<'abc', 1>>()).toEqualTypeOf<'bc'>();
expectTypeOf(g<Str.DropStrict<'abc', 2>>()).toEqualTypeOf<'c'>();
expectTypeOf(g<Str.DropStrict<'abc', 3>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.DropStrict<'abc', 4>>()).toEqualTypeOf<false>();

expectTypeOf(g<Str.DropWhile<'aabc', 'a'>>()).toEqualTypeOf<'bc'>();
expectTypeOf(g<Str.DropWhile<'aabc', 'a' | 'b'>>()).toEqualTypeOf<'c'>();
expectTypeOf(g<Str.DropWhile<'aabc', 'q'>>()).toEqualTypeOf<'aabc'>();

expectTypeOf(g<Str.EndsWith<'', 'a'>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.EndsWith<'abc', 'c'>>()).toEqualTypeOf<['ab', 'c']>();
expectTypeOf(g<Str.EndsWith<'abc', 'b' | 'c'>>()).toEqualTypeOf<['ab', 'c']>();
expectTypeOf(g<Str.EndsWith<'abc', 'd' | 'e'>>()).toEqualTypeOf<false>();

expectTypeOf(g<Str.Filter<'abc', 'b'>>()).toEqualTypeOf<'b'>();
expectTypeOf(g<Str.Filter<'abdc', 'b' | 'c'>>()).toEqualTypeOf<'bc'>();
expectTypeOf(g<Str.Filter<'abc', 'q'>>()).toEqualTypeOf<''>();

expectTypeOf(g<Str.FilterNot<'abc', 'b'>>()).toEqualTypeOf<'ac'>();
expectTypeOf(g<Str.FilterNot<'abc', 'b' | 'c'>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.FilterNot<'abc', 'q'>>()).toEqualTypeOf<'abc'>();

expectTypeOf(g<Str.First<''>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.First<'a'>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.First<'abc'>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.First<'abc' | 'bcd'>>()).toEqualTypeOf<'a' | 'b'>();

expectTypeOf(g<Str.Init<''>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.Init<'a'>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.Init<'abc'>>()).toEqualTypeOf<'ab'>();

expectTypeOf(g<Str.IsNonEmptyString<''>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.IsNonEmptyString<'a'>>()).toEqualTypeOf<true>();
expectTypeOf(g<Str.IsNonEmptyString<'abc'>>()).toEqualTypeOf<true>();

expectTypeOf(g<Str.Last<''>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.Last<'a'>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.Last<'abc'>>()).toEqualTypeOf<'c'>();

expectTypeOf(g<Str.Length<''>>()).toEqualTypeOf<0>();
expectTypeOf(g<Str.Length<'a'>>()).toEqualTypeOf<1>();
expectTypeOf(g<Str.Length<'abc'>>()).toEqualTypeOf<3>();
expectTypeOf(g<Str.Length<'abc' | 'd'>>()).toEqualTypeOf<1 | 3>();

expectTypeOf(g<Str.NotContains<'', 'a'>>()).toEqualTypeOf<true>();
expectTypeOf(g<Str.NotContains<'a', 'a'>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.NotContains<'a', 'b'>>()).toEqualTypeOf<true>();
expectTypeOf(
	g<Str.NotContains<'bbbbccccaccccdddd', 'a'>>(),
).toEqualTypeOf<false>();
expectTypeOf(
	g<Str.NotContains<'bbbbccccaccccdddd', 'q'>>(),
).toEqualTypeOf<true>();
expectTypeOf(g<Str.NotContains<'caccaaddda', 'a', 2>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.NotContains<'caccaaddda', 'a', 4>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.NotContains<'caccaaddda', 'a', 5>>()).toEqualTypeOf<true>();

expectTypeOf(g<Str.RepeatAtLeastTimes<'ababcd', 'ab', 0>>()).toEqualTypeOf<
	['', 'ababcd']
>();
expectTypeOf(g<Str.RepeatAtLeastTimes<'ababcd', 'ab', 1>>()).toEqualTypeOf<
	['ab', 'abcd']
>();
expectTypeOf(g<Str.RepeatAtLeastTimes<'ababcd', 'ab', 2>>()).toEqualTypeOf<
	['abab', 'cd']
>();
expectTypeOf(
	g<Str.RepeatAtLeastTimes<'ababcd', 'ab', 3>>(),
).toEqualTypeOf<false>();

expectTypeOf(
	g<Str.RepeatAtMostTimes<'ababcd', 'ab', 0>>(),
).toEqualTypeOf<false>();
expectTypeOf(
	g<Str.RepeatAtMostTimes<'ababcd', 'ab', 1>>(),
).toEqualTypeOf<false>();
expectTypeOf(g<Str.RepeatAtMostTimes<'ababcd', 'ab', 2>>()).toEqualTypeOf<
	['abab', 'cd']
>();
expectTypeOf(g<Str.RepeatAtMostTimes<'ababcd', 'ab', 3>>()).toEqualTypeOf<
	['abab', 'cd']
>();

expectTypeOf(
	g<Str.RepeatExactTimes<'ababcd', 'ab', 0>>(),
).toEqualTypeOf<false>();
expectTypeOf(
	g<Str.RepeatExactTimes<'ababcd', 'ab', 1>>(),
).toEqualTypeOf<false>();
expectTypeOf(g<Str.RepeatExactTimes<'ababcd', 'ab', 2>>()).toEqualTypeOf<
	['abab', 'cd']
>();
expectTypeOf(
	g<Str.RepeatExactTimes<'ababcd', 'ab', 3>>(),
).toEqualTypeOf<false>();

expectTypeOf(g<Str.ReplaceAll<'', 'a', '-'>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.ReplaceAll<'a', 'a', '-'>>()).toEqualTypeOf<'-'>();
expectTypeOf(g<Str.ReplaceAll<'aa', 'a', '-'>>()).toEqualTypeOf<'--'>();
expectTypeOf(g<Str.ReplaceAll<'aba', 'a', '-'>>()).toEqualTypeOf<'-b-'>();
expectTypeOf(g<Str.ReplaceAll<'bab', 'a', '-'>>()).toEqualTypeOf<'b-b'>();
expectTypeOf(g<Str.ReplaceAll<'aba', 'q', '-'>>()).toEqualTypeOf<'aba'>();

expectTypeOf(g<Str.ReplaceFirst<'', 'a', '-'>>()).toEqualTypeOf<never>();
expectTypeOf(g<Str.ReplaceFirst<'a', 'a', '-'>>()).toEqualTypeOf<'-'>();
expectTypeOf(g<Str.ReplaceFirst<'aa', 'a', '-'>>()).toEqualTypeOf<'-a'>();
expectTypeOf(g<Str.ReplaceFirst<'aba', 'a', '-'>>()).toEqualTypeOf<'-ba'>();
expectTypeOf(g<Str.ReplaceFirst<'baba', 'a', '-'>>()).toEqualTypeOf<'b-ba'>();
expectTypeOf(g<Str.ReplaceFirst<'baba', 'q', '-'>>()).toEqualTypeOf<never>();

expectTypeOf(g<Str.ReplaceLast<'', 'a', '-'>>()).toEqualTypeOf<never>();
expectTypeOf(g<Str.ReplaceLast<'a', 'a', '-'>>()).toEqualTypeOf<'-'>();
expectTypeOf(g<Str.ReplaceLast<'aa', 'a', '-'>>()).toEqualTypeOf<'a-'>();
expectTypeOf(g<Str.ReplaceLast<'aba', 'a', '-'>>()).toEqualTypeOf<'ab-'>();
expectTypeOf(g<Str.ReplaceLast<'baba', 'a', '-'>>()).toEqualTypeOf<'bab-'>();
expectTypeOf(g<Str.ReplaceLast<'baba', 'q', '-'>>()).toEqualTypeOf<never>();

expectTypeOf(g<Str.Reverse<''>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.Reverse<'a'>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.Reverse<'ab'>>()).toEqualTypeOf<'ba'>();
expectTypeOf(g<Str.Reverse<'abc'>>()).toEqualTypeOf<'cba'>();
expectTypeOf(g<Str.Reverse<'abc' | 'def'>>()).toEqualTypeOf<'cba' | 'fed'>();

expectTypeOf(g<Str.SplitAt<'', 'b'>>()).toEqualTypeOf<['', '', '']>();
expectTypeOf(g<Str.SplitAt<'a', 'b'>>()).toEqualTypeOf<['', '', 'a']>();
expectTypeOf(g<Str.SplitAt<'ab', 'b'>>()).toEqualTypeOf<['a', 'b', '']>();
expectTypeOf(g<Str.SplitAt<'abc', 'b'>>()).toEqualTypeOf<['a', 'b', 'c']>();
expectTypeOf(g<Str.SplitAt<'abc', 'a'>>()).toEqualTypeOf<['', 'a', 'bc']>();
expectTypeOf(g<Str.SplitAt<'abc', 'c'>>()).toEqualTypeOf<['ab', 'c', '']>();
expectTypeOf(g<Str.SplitAt<'abcd', 'c'>>()).toEqualTypeOf<['ab', 'c', 'd']>();

expectTypeOf(g<Str.StartsWith<'', 'a'>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.StartsWith<'a', 'a'>>()).toEqualTypeOf<['a', '']>();
expectTypeOf(g<Str.StartsWith<'abc', 'a'>>()).toEqualTypeOf<['a', 'bc']>();
expectTypeOf(g<Str.StartsWith<'bac', 'a'>>()).toEqualTypeOf<false>();

expectTypeOf(g<Str.Tail<''>>()).toEqualTypeOf<false>();
expectTypeOf(g<Str.Tail<'a'>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.Tail<'ab'>>()).toEqualTypeOf<'b'>();
expectTypeOf(g<Str.Tail<'abc'>>()).toEqualTypeOf<'bc'>();

expectTypeOf(g<Str.Take<'', 0>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.Take<'abc', 0>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.Take<'abc', 1>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.Take<'abc', 2>>()).toEqualTypeOf<'ab'>();
expectTypeOf(g<Str.Take<'abc', 3>>()).toEqualTypeOf<'abc'>();
expectTypeOf(g<Str.Take<'abc', 4>>()).toEqualTypeOf<'abc'>();

expectTypeOf(g<Str.TakeStrict<'', 0>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.TakeStrict<'abc', 0>>()).toEqualTypeOf<''>();
expectTypeOf(g<Str.TakeStrict<'abc', 1>>()).toEqualTypeOf<'a'>();
expectTypeOf(g<Str.TakeStrict<'abc', 2>>()).toEqualTypeOf<'ab'>();
expectTypeOf(g<Str.TakeStrict<'abc', 3>>()).toEqualTypeOf<'abc'>();
expectTypeOf(g<Str.TakeStrict<'abc', 4>>()).toEqualTypeOf<false>();

expectTypeOf(g<Str.TakeWhile<'aabc', 'a'>>()).toEqualTypeOf<'aa'>();
expectTypeOf(g<Str.TakeWhile<'aabc', 'a' | 'b'>>()).toEqualTypeOf<'aab'>();
expectTypeOf(g<Str.TakeWhile<'aabc', 'q'>>()).toEqualTypeOf<''>();
