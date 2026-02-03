import { expectType } from 'tsd';

import type { Str } from '../src/index.mjs';

declare function g<T>(): T;

expectType<'a'>(g<Str.Append<'', 'a'>>());
expectType<'ab'>(g<Str.Append<'a', 'b'>>());
expectType<'abc'>(g<Str.Append<'ab', 'c'>>());
expectType<'abc'>(g<Str.Append<'a', 'bc'>>());
expectType<'abc'>(g<Str.Append<'', 'abc'>>());
expectType<'abc'>(g<Str.Append<'abc', ''>>());

expectType<'a'>(g<Str.AppendTwo<'a', '', ''>>());
expectType<'a'>(g<Str.AppendTwo<'', 'a', ''>>());
expectType<'a'>(g<Str.AppendTwo<'', '', 'a'>>());
expectType<'abc'>(g<Str.AppendTwo<'a', 'b', 'c'>>());
expectType<'abc'>(g<Str.AppendTwo<'ab', '', 'c'>>());
expectType<'abc'>(g<Str.AppendTwo<'ab', 'c', ''>>());
expectType<'abc'>(g<Str.AppendTwo<'', 'ab', 'c'>>());
expectType<'abc'>(g<Str.AppendTwo<'', 'a', 'bc'>>());

expectType<'a'>(g<Str.CharAt<'abc', 0>>());
expectType<'b'>(g<Str.CharAt<'abc', 1>>());
expectType<'c'>(g<Str.CharAt<'abc', 2>>());
expectType<false>(g<Str.CharAt<'abc', 3>>());
expectType<false>(g<Str.CharAt<'', 0>>());
expectType<false>(g<Str.CharAt<'', -1>>());

expectType<false>(g<Str.Contains<'', 'a'>>());
expectType<true>(g<Str.Contains<'a', 'a'>>());
expectType<false>(g<Str.Contains<'a', 'b'>>());
expectType<true>(g<Str.Contains<'bbbbccccaccccdddd', 'a'>>());
expectType<false>(g<Str.Contains<'bbbbccccaccccdddd', 'q'>>());
expectType<true>(g<Str.Contains<'caccaaddda', 'a', 2>>());
expectType<true>(g<Str.Contains<'caccaaddda', 'a', 4>>());
expectType<false>(g<Str.Contains<'caccaaddda', 'a', 5>>());

expectType<0>(g<Str.Count<'', 'a'>>());
expectType<1>(g<Str.Count<'a', 'a'>>());
expectType<1>(g<Str.Count<'ab', 'a'>>());
expectType<1>(g<Str.Count<'ba', 'a'>>());
expectType<1>(g<Str.Count<'bac', 'a'>>());
expectType<2>(g<Str.Count<'baca', 'a'>>());
expectType<2>(g<Str.Count<'bacad', 'a'>>());
expectType<3>(g<Str.Count<'bacad', 'a' | 'b'>>());
expectType<0>(g<Str.Count<'bacad', 'q'>>());

expectType<''>(g<Str.Drop<'', 0>>());
expectType<''>(g<Str.Drop<'', 1>>());
expectType<'a'>(g<Str.Drop<'a', 0>>());
expectType<''>(g<Str.Drop<'a', 1>>());
expectType<''>(g<Str.Drop<'a', 2>>());
expectType<'abc'>(g<Str.Drop<'abc', 0>>());
expectType<'bc'>(g<Str.Drop<'abc', 1>>());
expectType<'c'>(g<Str.Drop<'abc', 2>>());
expectType<''>(g<Str.Drop<'abc', 3>>());
expectType<''>(g<Str.Drop<'abc', 4>>());

expectType<''>(g<Str.DropStrict<'', 0>>());
expectType<false>(g<Str.DropStrict<'', 1>>());
expectType<'a'>(g<Str.DropStrict<'a', 0>>());
expectType<''>(g<Str.DropStrict<'a', 1>>());
expectType<false>(g<Str.DropStrict<'a', 2>>());
expectType<'abc'>(g<Str.DropStrict<'abc', 0>>());
expectType<'bc'>(g<Str.DropStrict<'abc', 1>>());
expectType<'c'>(g<Str.DropStrict<'abc', 2>>());
expectType<''>(g<Str.DropStrict<'abc', 3>>());
expectType<false>(g<Str.DropStrict<'abc', 4>>());

expectType<'bc'>(g<Str.DropWhile<'aabc', 'a'>>());
expectType<'c'>(g<Str.DropWhile<'aabc', 'a' | 'b'>>());
expectType<'aabc'>(g<Str.DropWhile<'aabc', 'q'>>());

expectType<false>(g<Str.EndsWith<'', 'a'>>());
expectType<['ab', 'c']>(g<Str.EndsWith<'abc', 'c'>>());
expectType<['ab', 'c']>(g<Str.EndsWith<'abc', 'b' | 'c'>>());
expectType<false>(g<Str.EndsWith<'abc', 'd' | 'e'>>());

expectType<'b'>(g<Str.Filter<'abc', 'b'>>());
expectType<'bc'>(g<Str.Filter<'abdc', 'b' | 'c'>>());
expectType<''>(g<Str.Filter<'abc', 'q'>>());

expectType<'ac'>(g<Str.FilterNot<'abc', 'b'>>());
expectType<'a'>(g<Str.FilterNot<'abc', 'b' | 'c'>>());
expectType<'abc'>(g<Str.FilterNot<'abc', 'q'>>());

expectType<false>(g<Str.First<''>>());
expectType<'a'>(g<Str.First<'a'>>());
expectType<'a'>(g<Str.First<'abc'>>());
expectType<'a' | 'b'>(g<Str.First<'abc' | 'bcd'>>());

expectType<false>(g<Str.Init<''>>());
expectType<''>(g<Str.Init<'a'>>());
expectType<'ab'>(g<Str.Init<'abc'>>());

expectType<false>(g<Str.IsNonEmptyString<''>>());
expectType<true>(g<Str.IsNonEmptyString<'a'>>());
expectType<true>(g<Str.IsNonEmptyString<'abc'>>());

expectType<false>(g<Str.Last<''>>());
expectType<'a'>(g<Str.Last<'a'>>());
expectType<'c'>(g<Str.Last<'abc'>>());

expectType<0>(g<Str.Length<''>>());
expectType<1>(g<Str.Length<'a'>>());
expectType<3>(g<Str.Length<'abc'>>());
expectType<1 | 3>(g<Str.Length<'abc' | 'd'>>());

expectType<true>(g<Str.NotContains<'', 'a'>>());
expectType<false>(g<Str.NotContains<'a', 'a'>>());
expectType<true>(g<Str.NotContains<'a', 'b'>>());
expectType<false>(g<Str.NotContains<'bbbbccccaccccdddd', 'a'>>());
expectType<true>(g<Str.NotContains<'bbbbccccaccccdddd', 'q'>>());
expectType<false>(g<Str.NotContains<'caccaaddda', 'a', 2>>());
expectType<false>(g<Str.NotContains<'caccaaddda', 'a', 4>>());
expectType<true>(g<Str.NotContains<'caccaaddda', 'a', 5>>());

expectType<['', 'ababcd']>(g<Str.RepeatAtLeastTimes<'ababcd', 'ab', 0>>());
expectType<['ab', 'abcd']>(g<Str.RepeatAtLeastTimes<'ababcd', 'ab', 1>>());
expectType<['abab', 'cd']>(g<Str.RepeatAtLeastTimes<'ababcd', 'ab', 2>>());
expectType<false>(g<Str.RepeatAtLeastTimes<'ababcd', 'ab', 3>>());

expectType<false>(g<Str.RepeatAtMostTimes<'ababcd', 'ab', 0>>());
expectType<false>(g<Str.RepeatAtMostTimes<'ababcd', 'ab', 1>>());
expectType<['abab', 'cd']>(g<Str.RepeatAtMostTimes<'ababcd', 'ab', 2>>());
expectType<['abab', 'cd']>(g<Str.RepeatAtMostTimes<'ababcd', 'ab', 3>>());

expectType<false>(g<Str.RepeatExactTimes<'ababcd', 'ab', 0>>());
expectType<false>(g<Str.RepeatExactTimes<'ababcd', 'ab', 1>>());
expectType<['abab', 'cd']>(g<Str.RepeatExactTimes<'ababcd', 'ab', 2>>());
expectType<false>(g<Str.RepeatExactTimes<'ababcd', 'ab', 3>>());

expectType<''>(g<Str.ReplaceAll<'', 'a', '-'>>());
expectType<'-'>(g<Str.ReplaceAll<'a', 'a', '-'>>());
expectType<'--'>(g<Str.ReplaceAll<'aa', 'a', '-'>>());
expectType<'-b-'>(g<Str.ReplaceAll<'aba', 'a', '-'>>());
expectType<'b-b'>(g<Str.ReplaceAll<'bab', 'a', '-'>>());
expectType<'aba'>(g<Str.ReplaceAll<'aba', 'q', '-'>>());

expectType<never>(g<Str.ReplaceFirst<'', 'a', '-'>>());
expectType<'-'>(g<Str.ReplaceFirst<'a', 'a', '-'>>());
expectType<'-a'>(g<Str.ReplaceFirst<'aa', 'a', '-'>>());
expectType<'-ba'>(g<Str.ReplaceFirst<'aba', 'a', '-'>>());
expectType<'b-ba'>(g<Str.ReplaceFirst<'baba', 'a', '-'>>());
expectType<never>(g<Str.ReplaceFirst<'baba', 'q', '-'>>());

expectType<never>(g<Str.ReplaceLast<'', 'a', '-'>>());
expectType<'-'>(g<Str.ReplaceLast<'a', 'a', '-'>>());
expectType<'a-'>(g<Str.ReplaceLast<'aa', 'a', '-'>>());
expectType<'ab-'>(g<Str.ReplaceLast<'aba', 'a', '-'>>());
expectType<'bab-'>(g<Str.ReplaceLast<'baba', 'a', '-'>>());
expectType<never>(g<Str.ReplaceLast<'baba', 'q', '-'>>());

expectType<''>(g<Str.Reverse<''>>());
expectType<'a'>(g<Str.Reverse<'a'>>());
expectType<'ba'>(g<Str.Reverse<'ab'>>());
expectType<'cba'>(g<Str.Reverse<'abc'>>());
expectType<'cba' | 'fed'>(g<Str.Reverse<'abc' | 'def'>>());

expectType<['', '', '']>(g<Str.SplitAt<'', 'b'>>());
expectType<['', '', 'a']>(g<Str.SplitAt<'a', 'b'>>());
expectType<['a', 'b', '']>(g<Str.SplitAt<'ab', 'b'>>());
expectType<['a', 'b', 'c']>(g<Str.SplitAt<'abc', 'b'>>());
expectType<['', 'a', 'bc']>(g<Str.SplitAt<'abc', 'a'>>());
expectType<['ab', 'c', '']>(g<Str.SplitAt<'abc', 'c'>>());
expectType<['ab', 'c', 'd']>(g<Str.SplitAt<'abcd', 'c'>>());

expectType<false>(g<Str.StartsWith<'', 'a'>>());
expectType<['a', '']>(g<Str.StartsWith<'a', 'a'>>());
expectType<['a', 'bc']>(g<Str.StartsWith<'abc', 'a'>>());
expectType<false>(g<Str.StartsWith<'bac', 'a'>>());

expectType<false>(g<Str.Tail<''>>());
expectType<''>(g<Str.Tail<'a'>>());
expectType<'b'>(g<Str.Tail<'ab'>>());
expectType<'bc'>(g<Str.Tail<'abc'>>());

expectType<''>(g<Str.Take<'', 0>>());
expectType<''>(g<Str.Take<'abc', 0>>());
expectType<'a'>(g<Str.Take<'abc', 1>>());
expectType<'ab'>(g<Str.Take<'abc', 2>>());
expectType<'abc'>(g<Str.Take<'abc', 3>>());
expectType<'abc'>(g<Str.Take<'abc', 4>>());

expectType<''>(g<Str.TakeStrict<'', 0>>());
expectType<''>(g<Str.TakeStrict<'abc', 0>>());
expectType<'a'>(g<Str.TakeStrict<'abc', 1>>());
expectType<'ab'>(g<Str.TakeStrict<'abc', 2>>());
expectType<'abc'>(g<Str.TakeStrict<'abc', 3>>());
expectType<false>(g<Str.TakeStrict<'abc', 4>>());

expectType<'aa'>(g<Str.TakeWhile<'aabc', 'a'>>());
expectType<'aab'>(g<Str.TakeWhile<'aabc', 'a' | 'b'>>());
expectType<''>(g<Str.TakeWhile<'aabc', 'q'>>());
