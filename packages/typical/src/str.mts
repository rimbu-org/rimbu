import type { Num, U } from './index.mjs';

/**
 * Returns the length of the given string S.
 * @example
 * ```ts
 * Length<'abc'> => 3
 * ```
 */
export type Length<S extends string> = LengthHelper<S, 0>;

type LengthHelper<S extends string, Result extends number> = S extends ''
  ? Result
  : S extends `${string}${string}${string}${string}${string}${string}${string}${string}${string}${string}${infer Rest}`
  ? LengthHelper<Rest, Num.Add<Result, 10>>
  : S extends `${string}${string}${string}${string}${string}${infer Rest}`
  ? LengthHelper<Rest, Num.Add<Result, 5>>
  : S extends `${string}${infer Rest}`
  ? LengthHelper<Rest, Num.Add<Result, 1>>
  : Result;

/**
 * Convenience type to represent the concatenation of two string types.
 * @example
 * ```ts
 * Append<'abc', 'def'> => 'abcdef'
 * Append<'abc', 'd' | 'e'> => 'abcd' | 'abce'
 * ```
 */
export type Append<Start extends string, End extends string> = `${Start}${End}`;

/**
 * Convenience type to represent the concatenation of three string types.
 * @example
 * ```ts
 * AppendTwo<'abc', 'def', 'ghi'> => 'abcdefghi'
 * AppendTwo<'abc', 'd' | 'e', 'fgh'> => 'abcdfgh' | 'abcefgh'
 * ```
 */
export type AppendTwo<
  Start extends string,
  Middle extends string,
  End extends string
> = `${Start}${Middle}${End}`;

/**
 * Returns false if the given string is empty, true otherwise.
 * @example
 * ```ts
 * IsNonEmptyString<''> => false
 * IsNonEmptyString<'abc'> => true
 * ```
 */
export type IsNonEmptyString<S extends string> = '' extends S ? false : true;

/**
 * Returns never if the given string is empty, otherwise the given string.
 * @example
 * ```ts
 * NonEmptyString<''> => never
 * NonEmptyString<'abc'> => 'abc'
 * ```
 */
export type NonEmptyString<S extends string> = '' extends S ? never : unknown;

/**
 * If the given string does not start with the given `Start` type, returns false.
 * Otherwise, returns a tuple containing the matched start and the rest.
 * @example
 * ```ts
 * StartsWith<'abcd', 'ab'> => ['ab', 'cd']
 * StartsWith<'abcd', 'd'> => false
 * StartsWith<'abcd', 'ab' | 'bc'> => ['ab', 'cd']
 * StartsWith<'abcd', 'ab' | 'a'> => ['ab', 'cd'] | ['a', 'bcd']
 * ```
 */
export type StartsWith<
  S extends string,
  Start extends string & NonEmptyString<Start>
> = S extends Append<Start, infer Rest>
  ? S extends Append<infer StartInstance, Rest>
    ? [StartInstance, Rest]
    : false
  : false;

/**
 * If the given string does not end with the given `End` type, returns false.
 * Otherwise, returns a tuple containing the start and the matched end.
 * @example
 * ```ts
 * EndsWith<'abcd', 'cd'> => ['ab', 'cd']
 * EndsWith<'abcd', 'a'> => false
 * EndsWith<'abcd', 'cd' | 'de'> => ['ab', 'cd']
 * EndsWith<'abcd', 'cd' | 'd'> => ['ab', 'cd'] | ['abc', 'd']
 * ```
 */
export type EndsWith<
  S extends string,
  End extends string & NonEmptyString<End>
> = S extends Append<infer Start, End>
  ? S extends Append<Start, infer EndInstance>
    ? [Start, EndInstance]
    : false
  : false;

/**
 * Returns false if the given string does not contain the given `Middle` type,
 * or a 3-tuple containing the start, the matched middle, and the rest.
 * @example
 * ```ts
 * SplitAt<'abcd', 'bc'> => ['a', 'bc', 'd']
 * SplitAt<'abcd', 'ef'> => false
 * SplitAt<'abcd', 'b' | 'c'> => ['a', 'b', 'cd'] | ['ab', 'c', 'd']
 * ```
 */
export type SplitAt<
  S extends string,
  Middle extends string & NonEmptyString<Middle>
> = S extends AppendTwo<infer Start, Middle, infer End>
  ? S extends AppendTwo<Start, infer MiddleInstance, End>
    ? [Start, MiddleInstance, End]
    : false
  : ['', '', S];

/**
 * Returns a string containing all the elements that do not match the given Sub type.
 * @example
 * ```ts
 * FilterNot<'abcd', 'b'> => 'acd'
 * FilterNot<'abcd', 'b' | 'd'> => 'ac'
 * ```
 */
export type FilterNot<
  S extends string,
  Sub extends string & NonEmptyString<Sub>
> = FilterNotHelper<S, Sub, ''>;

type FilterNotHelper<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  Result extends string
> = S extends ''
  ? Result
  : S extends Append<Sub, infer Rest>
  ? FilterNotHelper<Rest, Sub, Result>
  : S extends Append<infer First, infer Rest>
  ? FilterNotHelper<Rest, Sub, Append<Result, First>>
  : '';

/**
 * Returns a string containing all the elements that match the given Sub type.
 * @example
 * ```ts
 * Filter<'abcd', 'b'> => 'b'
 * Filter<'abcd', 'b' | 'd'> => 'bd'
 * ```
 */

export type Filter<
  S extends string,
  Sub extends string & NonEmptyString<Sub>
> = FilterHelper<S, Sub, ''>;

type FilterHelper<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  Result extends string
> = S extends ''
  ? Result
  : StartsWith<S, Sub> extends [infer SubInstance, infer Rest]
  ? FilterHelper<string & Rest, Sub, Append<Result, string & SubInstance>>
  : S extends Append<string, infer Rest>
  ? FilterHelper<Rest, Sub, Result>
  : '';

/**
 * Replaces, in the given string, all matches with Sub with the given Repl.
 * @example
 * ```ts
 * ReplaceAll<'abcba', 'b', '_'> => 'a_c_a'
 * ReplaceAll<'abcba', 'b' | 'c', '_'> => 'a___a'
 * ```
 */
export type ReplaceAll<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  Repl extends string
> = S extends ''
  ? ''
  : S extends Append<Sub, infer Rest>
  ? Append<Repl, ReplaceAll<Rest, Sub, Repl>>
  : S extends Append<infer Start, infer Rest>
  ? Append<Start, ReplaceAll<Rest, Sub, Repl>>
  : never;

/**
 * Replaces, in the given string, the first match with Sub with the given Repl.
 * Returns never if there was no match.
 * @example
 * ```ts
 * ReplaceFirst<'abcba', 'b', '_'> => 'a_cba'
 * ReplaceFirst<'abcba', 'b' | 'c', '_'> => 'a_cba'
 * ```
 */
export type ReplaceFirst<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  Repl extends string
> = S extends ''
  ? never
  : S extends Append<Sub, infer Rest>
  ? Append<Repl, Rest>
  : S extends Append<infer Start, infer Rest>
  ? Append<Start, ReplaceFirst<Rest, Sub, Repl>>
  : never;

/**
 * Replaces, in the given string, the last match with Sub with the given Repl.
 * Returns never if there was no match.
 * @example
 * ```ts
 * ReplaceLast<'abcba', 'b', '_'> => 'abc_a'
 * ReplaceLast<'abcba', 'b' | 'c', '_'> => 'abc_a'
 * ```
 */
export type ReplaceLast<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  Repl extends string
> = ReplaceLastHelper<S, Sub, Repl, false>;

type ReplaceLastHelper<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  Repl extends string,
  Replaced extends boolean
> = S extends ''
  ? Replaced extends true
    ? ''
    : never
  : StartsWith<S, Sub> extends [infer SubInstance, infer Rest]
  ? ReplaceLastHelper<string & Rest, Sub, Repl, true> extends infer Result
    ? Append<
        Result extends Rest ? string & Repl : string & SubInstance,
        string & Result
      >
    : never
  : S extends Append<infer Start, infer Rest>
  ? Append<Start, ReplaceLastHelper<Rest, Sub, Repl, Replaced>>
  : never;

/**
 * Returns the amount of times the given `Sub` type is encountered in the given string.
 * @example
 * ```ts
 * Count<'abcba', 'c'> => 1
 * Count<'abcba', 'a' | 'c'> => 3
 * Count<'abcba', 'q'> => 0
 * ```
 */
export type Count<
  S extends string,
  Sub extends string & NonEmptyString<Sub>
> = CountHelper<S, Sub, 0>;

type CountHelper<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  Result extends number
> = S extends ''
  ? Result
  : S extends Append<Sub, infer Rest>
  ? CountHelper<Rest, Sub, Num.Inc<Result>>
  : S extends Append<string, infer Rest>
  ? CountHelper<Rest, Sub, Result>
  : Result;

/**
 * Returns true if the given string contains the given Amount (default 1) of Sub types.
 * @example
 * ```ts
 * Contains<'abcba', 'b'> => true
 * Contains<'abcba', 'b', 2> => true
 * Contains<'abcba', 'b', 3> => false
 * Contains<'abcba', 'q'> => false
 * ```
 */
export type Contains<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  Amount extends number = 1
> = Amount extends 0
  ? true
  : S extends Append<Sub, infer Rest>
  ? Contains<Rest, Sub, Num.Decr<Amount>>
  : S extends Append<string, infer Rest>
  ? Contains<Rest, Sub, Amount>
  : false;

/**
 * Returns true if the given string does not contain the given Amount (default 1) of Sub types.
 * @example
 * ```ts
 * NotContains<'abcba', 'b'> => false
 * NotContains<'abcba', 'b', 2> => false
 * NotContains<'abcba', 'b', 3> => true
 * NotContains<'abcba', 'q'> => true
 * ```
 */
export type NotContains<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  Amount extends number = 1
> = Contains<S, Sub, Amount> extends false ? true : false;

export type RepeatTimes<
  S extends string,
  Sub extends string & NonEmptyString<Sub>
> = RepeatTimesHelper<S, Sub, [0, '']>;

type RepeatTimesHelper<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  Result extends [number, string]
> = S extends ''
  ? [...Result, S]
  : StartsWith<S, Sub> extends [infer SubInstance, infer Rest]
  ? RepeatTimesHelper<
      string & Rest,
      Sub,
      [Num.Inc<Result[0]>, Append<Result[1], string & SubInstance>]
    >
  : [...Result, S];

/**
 * Returns a tuple containing the matched part and the rest of the given string if the string
 * start repeats the given Sub at least N times.
 * @example
 * ```ts
 * RepeatAtLeastTimes<'aabc', 'a', 0> => ['', 'aabc']
 * RepeatAtLeastTimes<'aabc', 'a', 1> => ['a', 'abc']
 * RepeatAtLeastTimes<'aabc', 'a', 3> => false
 * RepeatAtLeastTimes<'aabc', 'a' | 'b', 3> => ['aab', 'c']
 * ```
 */
export type RepeatAtLeastTimes<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  N extends number
> = RepeatAtLeastTimesHelper<S, Sub, N, ''>;

type RepeatAtLeastTimesHelper<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  N extends number,
  Processed extends string
> = N extends 0
  ? [Processed, S]
  : S extends ''
  ? false
  : StartsWith<S, Sub> extends [infer SubInstance, infer Rest]
  ? RepeatAtLeastTimesHelper<
      string & Rest,
      Sub,
      Num.Decr<N>,
      Append<Processed, string & SubInstance>
    >
  : false;

/**
 * Returns a tuple containing the matched part and the rest of the given string if the string
 * start repeats the given Sub at most N times.
 * @example
 * ```ts
 * RepeatAtMostTimes<'aabc', 'a', 0> => false
 * RepeatAtMostTimes<'aabc', 'a', 1> => false
 * RepeatAtMostTimes<'aabc', 'a', 3> => ['aa', 'bc']
 * RepeatAtMostTimes<'aabc', 'a' | 'b', 3> => ['aab', 'c']
 * ```
 */
export type RepeatAtMostTimes<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  N extends number
> = RepeatAtMostTimesHelper<S, Sub, N, ''>;

type RepeatAtMostTimesHelper<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  N extends number,
  Processed extends string
> = S extends Append<Sub, infer Rest>
  ? N extends 0
    ? false
    : S extends Append<infer SubInstance, Rest>
    ? RepeatAtMostTimesHelper<
        Rest,
        Sub,
        Num.Decr<N>,
        Append<Processed, SubInstance>
      >
    : never
  : [Processed, S];

/**
 * Returns a tuple containing the matched part and the rest of the given string if the string
 * start repeats the given Sub exactly N times.
 * @example
 * ```ts
 * RepeatExactTimes<'aabc', 'a', 0> => false
 * RepeatExactTimes<'aabc', 'a', 1> => false
 * RepeatExactTimes<'aabc', 'a', 2> => ['aa', 'bc']
 * RepeatExactTimes<'aabc', 'a', 3> => false
 * RepeatExactTimes<'aabc', 'a' | 'b', 3> => ['aab', 'c']
 * ```
 */
export type RepeatExactTimes<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  N extends number
> = RepeatExactTimesHelper<S, Sub, N, ''>;

type RepeatExactTimesHelper<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  N extends number,
  Processed extends string
> = S extends Append<Sub, infer Rest>
  ? N extends 0
    ? false
    : S extends Append<infer SubInstance, Rest>
    ? RepeatExactTimesHelper<
        Rest,
        Sub,
        Num.Decr<N>,
        Append<Processed, SubInstance>
      >
    : never
  : N extends 0
  ? [Processed, S]
  : false;

/**
 * Returns the first N characters of the given string, or false if the string does
 * not have enough characters.
 * @example
 * ```ts
 * TakeStrict<'abcd', 2> => 'ab'
 * TakeStrict<'abcd', 5> => false
 * ```
 */
export type TakeStrict<S extends string, N extends number> = TakeStrictHelper<
  S,
  N,
  ''
>;

type TakeStrictHelper<
  S extends string,
  N extends number,
  Result extends string
> = N extends 0
  ? Result
  : S extends Append<infer First, infer Rest>
  ? TakeStrictHelper<Rest, Num.Decr<N>, Append<Result, First>>
  : false;

/**
 * Returns the first N characters of the given string, or the given
 * string if it does not have enough characters.
 * @example
 * ```ts
 * Take<'abcd', 2> => 'ab'
 * Take<'abcd', 5> => 'abcd'
 * ```
 */
export type Take<S extends string, N extends number> = TakeHelper<S, N, ''>;

type TakeHelper<
  S extends string,
  N extends number,
  Result extends string
> = N extends 0
  ? Result
  : S extends Append<infer First, infer Rest>
  ? TakeHelper<Rest, Num.Decr<N>, Append<Result, First>>
  : Result;

/**
 * Returns part of the string as long as its parts match Sub.
 * @example
 * ```ts
 * TakeWhile<'aabc', 'a'> => 'aa'
 * TakeWhile<'aabc', 'a' | 'b'> => 'aab'
 * TakeWhile<'aabc', 'q'> => ''
 * ```
 */
export type TakeWhile<
  S extends string,
  Sub extends string & NonEmptyString<Sub>
> = TakeWhileHelper<S, Sub, ''>;

type TakeWhileHelper<
  S extends string,
  Sub extends string & NonEmptyString<Sub>,
  Result extends string
> = StartsWith<S, Sub> extends [infer SubInstance, infer Rest]
  ? TakeWhileHelper<string & Rest, Sub, Append<Result, string & SubInstance>>
  : Result;

/**
 * Skips part of the string as long as its parts match Sub.
 * @example
 * ```ts
 * DropWhile<'aabc', 'a'> => 'bc'
 * DropWhile<'aabc', 'a' | 'b'> => 'c'
 * DropWhile<'aabc', 'q'> => 'aabc'
 * ```
 */
export type DropWhile<S extends string, Sub extends string> = S extends Append<
  Sub,
  infer Rest
>
  ? DropWhile<Rest, Sub>
  : S;

/**
 * Returns the given string reversed.
 * @example
 * ```ts
 * Reverse<'abcd'> => 'dcba'
 * ```
 */
export type Reverse<S extends string> = ReverseHelper<S, ''>;

type ReverseHelper<S extends string, Result extends string> = S extends Append<
  infer First,
  infer Rest
>
  ? ReverseHelper<Rest, Append<First, Result>>
  : Result;

/**
 * Returns the given string without the first N characters, or false if the
 * string has less characters.
 * @example
 * ```ts
 * DropStrict<'abcd', 2> => 'cd'
 * DropStrict<'abcd', 5> => false
 * ```
 */
export type DropStrict<S extends string, N extends number> = N extends 0
  ? S
  : S extends Append<string, infer Rest>
  ? DropStrict<Rest, Num.Decr<N>>
  : false;

/**
 * Returns the given string without the first N characters, or an empty string if the
 * string has less characters.
 * @example
 * ```ts
 * Drop<'abcd', 2> => 'cd'
 * Drop<'abcd', 5> => ''
 * ```
 */
export type Drop<S extends string, N extends number> = N extends 0
  ? S
  : S extends Append<string, infer Rest>
  ? Drop<Rest, Num.Decr<N>>
  : S;

/**
 * Returns the first character of the given string, or false if the string is empty.
 * @example
 * ```ts
 * First<'abc'> => 'a'
 * First<''> => false
 * ```
 */
export type First<S extends string> = S extends Append<infer First, string>
  ? First
  : false;

/**
 * Returns all but the first character of the given string, or false if the string is empty.
 * @example
 * ```ts
 * Tail<'abcd'> => 'bcd'
 * Tail<''> => false
 * ```
 */
export type Tail<S extends string> = S extends Append<string, infer Rest>
  ? Rest
  : false;

/**
 * Returns all but the last character of the given string, or false if the string is empty.
 * @example
 * ```ts
 * Init<'abcd'> => 'abc'
 * Init<''> => false
 * ```
 */
export type Init<S extends string> = InitHelper<S, ''>;

type InitHelper<S extends string, Result extends string> = S extends Append<
  infer First,
  infer Rest
>
  ? U.Extends<Rest, '', Result, InitHelper<Rest, Append<Result, First>>>
  : false;

/**
 * Returns the last character of the given string, or false if the string if empty.
 * @example
 * ```ts
 * Last<'abcd'> => 'd'
 * Last<''> => false
 * ```
 */
export type Last<S extends string> = S extends Append<infer First, infer Rest>
  ? U.Extends<Rest, '', First, Last<Rest>>
  : false;

/**
 * Returns the character in the given string at the given Index, or false if the index
 * is out of bounds.
 * @example
 * ```ts
 * CharAt<'abcd', 1> => 'b'
 * CharAt<'abcd', 5> => false
 * ```
 */
export type CharAt<S extends string, Index extends number> = S extends Append<
  infer Start,
  infer Rest
>
  ? U.Extends<Index, 0, Start, CharAt<Rest, Num.Decr<Index>>>
  : false;
