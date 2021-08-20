import type { StrNum, U } from './index';

/**
 * Returns the sum of given numbers.
 * @note due to compiler limitations, the maximum result and input numbers is 9999.
 * @example
 * Add<13, 25> => 38
 * Add<1386, 335> => 1721
 */
export type Add<N1 extends number, N2 extends number> = StrNum.ToNumber<
  StrNum.Add<StrNum.FromNumber<N1>, StrNum.FromNumber<N2>>
>;

/**
 * Returns true if the given number is positive (> 0), false otherwise
 * @example
 * IsPositive<9> => true
 * IsPositive<0> => false
 * IsPositive<-5> => false
 */
export type IsPositive<N extends number> = GreaterThanOrEqual<N, 1>;

/**
 * Returns true if the given number is a natural number (>= 0), false otherwise
 * @example
 * IsNatural<9> => true
 * IsNatural<0> => true
 * IsNatural<-5> => false
 */
export type IsNatural<N extends number> = GreaterThanOrEqual<N, 0>;

/**
 * Returns true if the given number is negative (< 0), false otherwise.
 * @example
 * IsNegative<9> => false
 * IsNegative<0> => false
 * IsNegative<-5> => true
 */
export type IsNegative<N extends number> = U.Not<IsNatural<N>>;

/**
 * Returns the result of subtracting N2 from N1.
 * @note since only natural numbers are supported, a result that would be negative will be type never.
 * @note due to compiler limitations, the maximum result and input numbers is 9999.
 * @example
 * Subtract<25, 13> => 12
 * Subtract<1721, 335> => 1386
 * Subtract<5, 8> => never
 */
export type Subtract<N1 extends number, N2 extends number> = N1 extends never
  ? never
  : N2 extends never
  ? never
  : StrNum.ToNumber<
      StrNum.Subtract<StrNum.FromNumber<N1>, StrNum.FromNumber<N2>>
    >;

/**
 * Add 1 to the given natural number.
 * @example
 * Inc<4> => 5
 * Inc<312> => 313
 * Inc<-3> => never
 */
export type Inc<N extends number> = Add<N, 1>;

/**
 * Decreases a positive number by 1, or if the number is not positive,
 * returns never.
 * @example
 * Dec<5> => 4
 * Dec<434> => 433
 * Dec<0> => never
 */
export type Decr<N extends number> = Subtract<N, 1>;

/**
 * Returns true if the given natural number is even, or never otherwise.
 * @example
 * Even<4> => true
 * Even<11> => false
 * Even<-3> => never
 */
export type IsEven<N extends number> = StrNum.IsEven<StrNum.FromNumber<N>>;

/**
 * Returns true if the given natural number is odd, or never otherwise.
 * @example
 * Odd<4> => false
 * Odd<11> => true
 * Odd<-3> => never
 */
export type IsOdd<N extends number> = StrNum.IsOdd<StrNum.FromNumber<N>>;

/**
 * Returns the smallest of the given 2 natural numbers, of never otherwise
 * @example
 * Min<2, 5> => 2
 * Min<534, 424> => 424
 * Min<-4, 4> => never
 */
export type Min<N1 extends number, N2 extends number> = N1 extends never
  ? never
  : N2 extends never
  ? never
  : Subtract<N1 & U.Check<N1>, N2 & U.Check<N2>> extends never
  ? N1
  : N2;

/**
 * Returns the largest of the given 2 natural numbers, of never otherwise
 * @example
 * Max<2, 5> => 5
 * Max<534, 424> => 534
 * Max<-4, 4> => never
 */
export type Max<N1 extends number, N2 extends number> = N1 extends never
  ? never
  : N2 extends never
  ? never
  : Subtract<N1, N2> extends never
  ? N2
  : N1;

/**
 * Returns true if the given numbers are equal.
 * @example
 * Equal<0, 0> => true
 * Equal<8, 9> => false
 */
export type Equal<N1 extends number, N2 extends number> = N1 extends N2
  ? N2 extends N1
    ? true
    : false
  : false;

/**
 * Returns true if the given numbers are not equal.
 * @example
 * NotEqual<0, 0> => false
 * NotEqual<8, 9> => true
 */
export type NotEqual<N1 extends number, N2 extends number> = N1 extends N2
  ? N1 extends N2
    ? false
    : true
  : true;

/**
 * Returns true if the given first natural number is greater or equal than the second.
 * Returns never otherwise.
 * @example
 * GreaterThanOrEqual<15, 12> => true
 * GreaterThanOrEqual<15, 6> => never
 */
export type GreaterThanOrEqual<N1 extends number, N2 extends number> = Subtract<
  N1,
  N2
> extends never
  ? false
  : true;

/**
 * Returns true if the first given number is greater than the second.
 * @example
 * GreaterThan<5, 5> => false
 * GreaterThan<8, 5> => true
 * GreaterThan<3, 7> => false
 */
export type GreaterThan<N1 extends number, N2 extends number> = N1 extends N2
  ? false
  : GreaterThanOrEqual<N1, N2>;

/**
 * Returns true if the first given number is less than the second.
 * @example
 * LessThan<5, 5> => false
 * LessThan<8, 5> => false
 * LessThan<3, 7> => true
 */
export type LessThan<N1 extends number, N2 extends number> = Subtract<
  N1,
  N2
> extends never
  ? true
  : false;

/**
 * Returns true if the first given number is less than or equal to the second.
 * @example
 * LessThanOrEqual<5, 5> => true
 * LessThanOrEqual<8, 5> => false
 * LessThanOrEqual<3, 7> => true
 */
export type LessThanOrEqual<
  N1 extends number,
  N2 extends number
> = N1 extends N2 ? true : LessThan<N1, N2>;

/**
 * Returns true if the given number is greater than or equal to given L, and less than
 * or equal to given H, and returns false otherwise.
 * @example
 * InRange<4, 5, 10> => false
 * InRange<6, 5, 10> => true
 * InRange<5, 5, 10> => true
 */
export type InRange<
  N extends number,
  L extends number,
  H extends number
> = GreaterThanOrEqual<N, L> & LessThanOrEqual<N, H> extends never
  ? false
  : true;

/**
 * Returns the result of multiplying the given natural numbers.
 * @example
 * Mult<0, 0> => 0
 * Mult<9, 10> => 90
 * Mult<3, 18> => 54
 */
export type Mult<N1 extends number, N2 extends number> = N1 extends 0
  ? 0
  : N2 extends 0
  ? 0
  : N1 extends 1
  ? N2
  : N2 extends 1
  ? N1
  : StrNum.ToNumber<StrNum.Mult<StrNum.FromNumber<N1>, StrNum.FromNumber<N2>>>;

/**
 * Returns a tuple containing the quotient and remainer of dividing the first number
 * by the second.
 * @example
 * DivMod<9, 5> => [1, 4]
 * DivMod<9, 3> => [3, 0]
 */
export type DivMod<N1 extends number, N2 extends number> = N2 extends 0
  ? never
  : N1 extends 0
  ? [0, 0]
  : N1 extends N2
  ? [1, 0]
  : StrNum.Divide<StrNum.FromNumber<N1>, StrNum.FromNumber<N2>> extends [
      infer Q,
      infer R
    ]
  ? [StrNum.ToNumber<string & Q>, StrNum.ToNumber<string & R>]
  : never;

/**
 * Returns the result of dividing the first given natural number by the second.
 * @example
 * Div<0, 0> => never
 * Div<9, 3> => 3
 * Div<14, 5> => 2
 */
export type Div<N1 extends number, N2 extends number> = N2 extends 0
  ? never
  : N1 extends 0
  ? 0
  : N1 extends N2
  ? 1
  : StrNum.ToNumber<
      StrNum.Divide<StrNum.FromNumber<N1>, StrNum.FromNumber<N2>>[0]
    >;

/**
 * Returns the remainder after dividing the first given natural number by the second.
 * @example
 * Mod<0, 0> => never
 * Mod<9, 3> => 0
 * Mod<14, 5> => 4
 */
export type Mod<N1 extends number, N2 extends number> = N2 extends 0
  ? never
  : N1 extends 0
  ? 0
  : N1 extends N2
  ? 0
  : StrNum.ToNumber<
      StrNum.Divide<StrNum.FromNumber<N1>, StrNum.FromNumber<N2>>[1]
    >;

/**
 * Returns the power of the first natural number to the second given natural number.
 * @example
 * Pow<2, 0> => 1
 * Pow<2, 3> => 8
 * Pow<3, 4> => 81
 */
export type Pow<N1 extends number, N2 extends number> = N1 extends 0
  ? 0
  : N2 extends 0
  ? 1
  : N2 extends 1
  ? N1
  : N2 extends 2
  ? Mult<N1, N1>
  : IsEven<N2> extends true
  ? Pow<Mult<N1, N1>, Div<N2, 2>>
  : Mult<N1, Pow<N1, Decr<N2>>>;
