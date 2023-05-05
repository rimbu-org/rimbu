import type { Str, U } from './index.ts';

/**
 * Positive numeric digits as strings
 */
export type PosDigit = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/**
 * All numeric digits as strings
 */
export type Digit = '0' | PosDigit;

/**
 * Type that will return the incoming type if the value is a valid positive integer,
 * or `never` otherwise.
 * @example
 * ```ts
 * PosNum<'321'> => '321'
 * PosNum<'0'> => never
 * ```
 */
export type PosNum<N extends string> = N extends Str.Append<
  PosDigit,
  infer Rest
>
  ? Rest extends Str.TakeWhile<Rest, Digit>
    ? N
    : never
  : never;

/**
 * Type that will return the incoming type if the value is a valid natural number,
 * or `never` otherwise.
 * @example
 * ```ts
 * NatNum<'321'> => '321'
 * NatNum<'0'> => '0'
 * ```
 */
export type NatNum<N extends string> = N extends '0' ? '0' : PosNum<N>;

/**
 * Returns true if the given string is a valid positive integer, false otherwise.
 * @example
 * ```ts
 * IsPosNum<5> => true
 * IsPosNum<0> => false
 * IsPosNum<-5> => false
 * ```
 */
export type IsPosNum<N extends string> = N extends Str.Append<
  PosDigit,
  infer Rest
>
  ? Str.DropWhile<Rest, Digit> extends ''
    ? true
    : false
  : false;

/**
 * Returns true if the given string is a valid natural number, false otherwise.
 * @example
 * ```ts
 * IsNatNum<5> => true
 * IsNatNum<0> => true
 * IsNatNum<-5> => false
 * ```
 */
export type IsNatNum<N extends string> = N extends '0' ? true : IsPosNum<N>;

/**
 * Type that validates whether a given string-number is even.
 * Checks that the last digit is even.
 */
export type IsEven<N extends string> = U.Pred<
  Str.EndsWith<N, '0' | '2' | '4' | '6' | '8'>
>;

/**
 * Type that validates whether a given string-number is odd.
 * Checks that the last digit is odd.
 */
export type IsOdd<N extends string> = U.Pred<
  Str.EndsWith<N, '1' | '3' | '5' | '7' | '9'>
>;

/**
 * A symmetric tuple, where the order or the elements does not matter.
 * As an example: SymTup<'a', 1> is equal to SymTup<1, 'a'>
 */
export type SymTup<A, B> = [A, B] | [B, A];

/**
 * Given two string digits, this type returns a tuple of which the first element
 * is the digit resulting from addition of the two digits, and the second element
 * is a boolean indicating whether there was an overflow.
 * @example
 * ```ts
 * AddDigit<'1', '2'> => ['3', false]
 * AddDigit<'8', '4'> => ['2', true]
 * ```
 */
export type AddDigit<D1 extends Digit, D2 extends Digit> = D1 extends '0'
  ? [D2, false]
  : D2 extends '0'
  ? [D1, false]
  : [D1, D2] extends
      | SymTup<'1', '9'>
      | SymTup<'2', '8'>
      | SymTup<'3', '7'>
      | SymTup<'4', '6'>
      | '5'[]
  ? ['0', true]
  : [D1, D2] extends
      | SymTup<'2', '9'>
      | SymTup<'3', '8'>
      | SymTup<'4', '7'>
      | SymTup<'5', '6'>
  ? ['1', true]
  : [D1, D2] extends '1'[]
  ? ['2', false]
  : [D1, D2] extends
      | SymTup<'3', '9'>
      | SymTup<'4', '8'>
      | SymTup<'5', '7'>
      | '6'[]
  ? ['2', true]
  : [D1, D2] extends SymTup<'1', '2'>
  ? ['3', false]
  : [D1, D2] extends SymTup<'4', '9'> | SymTup<'5', '8'> | SymTup<'6', '7'>
  ? ['3', true]
  : [D1, D2] extends SymTup<'1', '3'> | '2'[]
  ? ['4', false]
  : [D1, D2] extends SymTup<'5', '9'> | SymTup<'6', '8'> | '7'[]
  ? ['4', true]
  : [D1, D2] extends SymTup<'1', '4'> | SymTup<'2', '3'>
  ? ['5', false]
  : [D1, D2] extends SymTup<'6', '9'> | SymTup<'7', '8'>
  ? ['5', true]
  : [D1, D2] extends SymTup<'1', '5'> | SymTup<'2', '4'> | '3'[]
  ? ['6', false]
  : [D1, D2] extends SymTup<'7', '9'> | '8'[]
  ? ['6', true]
  : [D1, D2] extends SymTup<'1', '6'> | SymTup<'2', '5'> | SymTup<'3', '4'>
  ? ['7', false]
  : [D1, D2] extends SymTup<'8', '9'>
  ? ['7', true]
  : [D1, D2] extends
      | SymTup<'1', '7'>
      | SymTup<'2', '6'>
      | SymTup<'3', '5'>
      | '4'[]
  ? ['8', false]
  : [D1, D2] extends '9'[]
  ? ['8', true]
  : [D1, D2] extends
      | SymTup<'1', '8'>
      | SymTup<'2', '7'>
      | SymTup<'3', '6'>
      | SymTup<'4', '5'>
  ? ['9', false]
  : never;

/**
 * Returns the result of adding the two given string-numbers.
 * @example
 * ```ts
 * SAdd<'13', '8'> => '21'
 * SAdd<'139', '5232'> => '5371'
 * ```
 */
export type Add<N1 extends string, N2 extends string> =
  // Check if N1 is non-empty
  N1 extends Str.Append<infer N1Start, Digit>
    ? // Check if N2 is non-empty
      N2 extends Str.Append<infer N2Start, Digit>
      ? // Retrieve last digit of N1
        N1 extends Str.Append<N1Start, infer N1LastDigit>
        ? // Retrieve last digit of N2
          N2 extends Str.Append<N2Start, infer N2LastDigit>
          ? // Calculate new digit and overflow
            AddDigit<N1LastDigit & Digit, N2LastDigit & Digit> extends [
              infer NewDigit,
              infer Overflow
            ]
            ? Overflow extends true
              ? // check if more digits
                [N1Start, N2Start] extends ['', '']
                ? // overflow and no more digits
                  Str.Append<'1', string & NewDigit>
                : // more digits and overflow, so add 1
                  Str.Append<Add<Add<N1Start, N2Start>, '1'>, NewDigit & string>
              : // no overflow, simple addition
                Str.Append<Add<N1Start, N2Start>, NewDigit & string>
            : never
          : never
        : never
      : // N2 is empty, return N1
        N1
    : // N1 is empty, return N2
      N2;

/**
 * Given two string digits, returns a tuple of which the first element is the resulting digit from subtracting the second from the first,
 * and the second element a boolean that is true if there is an 'underflow' or borrow, never otherwise.
 * @example
 * ```ts
 * SubDigit<'5', '3'> => ['2', never]
 * SubDigit<'3', '6'> => ['7', true]
 * ```
 */
export type SubDigit<D1 extends Digit, D2 extends Digit> = D2 extends '0'
  ? [D1, false]
  : D1 extends D2
  ? ['0', false]
  : Str.Append<D1, D2> extends infer DD
  ? DD extends '09' | '21' | '32' | '43' | '54' | '65' | '76' | '87' | '98'
    ? ['1', U.Extends<DD, '09'>]
    : DD extends '08' | '19' | '31' | '42' | '53' | '64' | '75' | '86' | '97'
    ? ['2', U.Extends<DD, '08' | '19'>]
    : DD extends '07' | '18' | '29' | '41' | '52' | '63' | '74' | '85' | '96'
    ? ['3', U.Extends<DD, '07' | '18' | '29'>]
    : DD extends '06' | '17' | '28' | '39' | '51' | '62' | '73' | '84' | '95'
    ? ['4', U.Extends<DD, '06' | '17' | '28' | '39'>]
    : DD extends '05' | '16' | '27' | '38' | '49' | '61' | '72' | '83' | '94'
    ? ['5', U.Extends<DD, '05' | '16' | '27' | '38' | '49'>]
    : DD extends '04' | '15' | '26' | '37' | '48' | '59' | '71' | '82' | '93'
    ? ['6', U.Extends<DD, '04' | '15' | '26' | '37' | '48' | '59'>]
    : DD extends '03' | '14' | '25' | '36' | '47' | '58' | '69' | '81' | '92'
    ? ['7', U.Extends<DD, '03' | '14' | '25' | '36' | '47' | '58' | '69'>]
    : DD extends '02' | '13' | '24' | '35' | '46' | '57' | '68' | '79' | '91'
    ? [
        '8',
        U.Extends<DD, '02' | '13' | '24' | '35' | '46' | '57' | '68' | '79'>
      ]
    : DD extends '01' | '12' | '23' | '34' | '45' | '56' | '67' | '78' | '89'
    ? ['9', true]
    : never
  : never;

/**
 * Returns the result of subtracting the second from the first given string-number,
 * or never if the second value is greater than the first. (Only natural numbers currently supported)
 * @example
 * ```ts
 * SSubtract<'13', '8'> => '5'
 * SSubtract<'5371', '139'> => '5232'
 * SSubtract<'100', '101'> => never
 * ```
 */
export type Subtract<N1 extends string, N2 extends string> = N1 extends N2
  ? // input is equal
    '0'
  : // check if N1 is non-empty
  N1 extends Str.Append<infer N1Start, Digit>
  ? // check if N2 is non-empty
    N2 extends Str.Append<infer N2Start, Digit>
    ? // Retrieve last digit of N1
      N1 extends Str.Append<N1Start, infer N1LastDigit>
      ? // Retrieve last digit of N2
        N2 extends Str.Append<N2Start, infer N2LastDigit>
        ? // Calculate new digit and underflow
          SubDigit<Digit & N1LastDigit, Digit & N2LastDigit> extends [
            infer NewDigit,
            infer Underflow
          ]
          ? Underflow extends true
            ? // there is underflow, but no more digits to process, would be negative so stop processing
              N1Start extends ''
              ? never
              : // underflow so subtract 1 from the start digits
              Subtract<Subtract<N1Start, N2Start>, '1'> extends infer Start
              ? // Number should never start with 0, so skip 0
                Start extends '0'
                ? Digit & NewDigit
                : Str.Append<string & Start, Digit & NewDigit>
              : never
            : // No underflow, calculate rest (start)
            Subtract<N1Start, N2Start> extends infer Start
            ? // Number should never start with 0, so skip 0
              Start extends '0'
              ? Digit & NewDigit
              : Str.Append<string & Start, Digit & NewDigit>
            : never
          : never
        : never
      : never
    : // N2 is empty, return rest of N1
      N1
  : // N1 is empty, either it is not valid or N2 is larger
    never;

/**
 * Converts a natural number to a string-number, otherwise never.
 * @example
 * ```ts
 * NumberToStringNum<123> => '123'
 * NumberToStringNum<-13> => never
 * ```
 */
export type FromNumber<N extends number> = NatNum<`${N}`>;

/**
 * Infers and returns the length of given Tuple T.
 */
export type TupleLength<T extends unknown[]> = T extends { length: infer L }
  ? L
  : never;

/**
 * A table from StringDigits to an array that repeats the elements of given
 * array T digit amount of times.
 * 'deca' is used to represent an exponent of 10
 */
export type DigitToTup<T extends unknown[] = [unknown]> = {
  '0': [];
  '1': T;
  '2': [...T, ...T];
  '3': [...T, ...T, ...T];
  '4': [...T, ...T, ...T, ...T];
  '5': [...T, ...T, ...T, ...T, ...T];
  '6': [...T, ...T, ...T, ...T, ...T, ...T];
  '7': [...T, ...T, ...T, ...T, ...T, ...T, ...T];
  '8': [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T];
  '9': [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T];
  '10': [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T];
};

/**
 * Builds a tuple of the length of a given string-number. The length can be used
 * to convert a string-number to a number.
 */
export type BuildTuple<N extends string> = BuildTupleHelper<N, []>;

type BuildTupleHelper<
  N extends string,
  Result extends unknown[]
> = N extends Str.Append<Digit & infer D, infer Rest>
  ? BuildTupleHelper<
      Rest,
      [...DigitToTup[Digit & D], ...DigitToTup<Result>['10']]
    >
  : Result;

/**
 * Converts the given string-number to its corresponding number.
 * @note due to compiler limitations the maximum value is '9999'
 * @example
 * ```ts
 * StringNumToNumber<'13'> => 13
 * StringNumToNumber<'5234'> => 5234
 * ```
 */
export type ToNumber<N extends string> = TupleLength<BuildTuple<N>>;

/**
 * Returns the result of multiplying the given string number with the given digit.
 */
export type MultDigit<N1 extends string, D extends Digit> = N1 extends '0'
  ? '0'
  : N1 extends '1'
  ? D
  : D extends '0'
  ? '0'
  : D extends '1'
  ? N1
  : D extends '2'
  ? Add<N1, N1>
  : D extends '3'
  ? Add<N1, Add<N1, N1>>
  : D extends '4'
  ? Add<N1, N1> extends infer T
    ? Add<string & T, string & T>
    : never
  : D extends '5'
  ? Add<N1, MultDigit<N1, '4'>>
  : D extends '6'
  ? MultDigit<N1, '3'> extends infer T
    ? Add<string & T, string & T>
    : never
  : D extends '7'
  ? Add<N1, MultDigit<N1, '6'>>
  : D extends '8'
  ? MultDigit<N1, '4'> extends infer T
    ? Add<string & T, string & T>
    : never
  : D extends '9'
  ? Add<N1, MultDigit<N1, '8'>>
  : never;

export type Mult<N1 extends string, N2 extends string> = N2 extends Str.Append<
  infer N2Start,
  Digit
>
  ? N2Start extends ''
    ? MultDigit<N1, Digit & N2>
    : N2 extends Str.Append<N2Start, infer N2Last>
    ? Add<MultDigit<N1, Digit & N2Last>, Str.Append<Mult<N1, N2Start>, '0'>>
    : never
  : never;

export type AmountTimesIn<
  Small extends string,
  Large extends string
> = AmountTimesInHelper<Small, Large, '0'>;

type AmountTimesInHelper<
  Small extends string,
  Large extends string,
  Am extends string
> = Small extends Large
  ? [Add<Am, '1'>, '0']
  : Subtract<Large, Small> extends never
  ? [Am, Large]
  : Subtract<Large, Small> extends infer Result
  ? AmountTimesInHelper<Small, string & Result, Add<Am, '1'>>
  : never;

export type AppendDigit<N extends string, D extends Digit> = N extends '0'
  ? D
  : Str.Append<N, D>;

export type Divide<N extends string, M extends string> = DivideHelper<
  N,
  M,
  '',
  ''
>;

type DivideHelper<
  N extends string,
  M extends string,
  Q extends string,
  R extends string
> = M extends '0'
  ? never
  : N extends Str.Append<infer Dig, infer Rest>
  ? AppendDigit<R, Digit & Dig> extends infer D
    ? AmountTimesIn<M, string & D> extends [infer B, infer NewR]
      ? DivideHelper<Rest, M, AppendDigit<Q, Digit & B>, string & NewR>
      : never
    : never
  : [Q, R];
