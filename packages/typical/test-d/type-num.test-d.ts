import { expectTypeOf } from 'bun:test';

import type { Num } from '@rimbu/typical';

declare function g<T>(): T;

expectTypeOf(g<Num.Add<0, 0>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Add<0, 1>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Add<1, 0>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Add<0, 4>>()).toEqualTypeOf<4>();
expectTypeOf(g<Num.Add<1, 3>>()).toEqualTypeOf<4>();
expectTypeOf(g<Num.Add<2, 2>>()).toEqualTypeOf<4>();
expectTypeOf(g<Num.Add<3, 1>>()).toEqualTypeOf<4>();
expectTypeOf(g<Num.Add<4, 0>>()).toEqualTypeOf<4>();
expectTypeOf(g<Num.Add<4, 16>>()).toEqualTypeOf<20>();
expectTypeOf(g<Num.Add<16, 4>>()).toEqualTypeOf<20>();
expectTypeOf(g<Num.Add<99, 1>>()).toEqualTypeOf<100>();
expectTypeOf(g<Num.Add<1, 99>>()).toEqualTypeOf<100>();
expectTypeOf(g<Num.Add<18, 99>>()).toEqualTypeOf<117>();
expectTypeOf(g<Num.Add<99, 18>>()).toEqualTypeOf<117>();
expectTypeOf(g<Num.Add<5617, 3598>>()).toEqualTypeOf<9215>();

expectTypeOf(g<Num.Decr<0>>()).toEqualTypeOf<never>();
expectTypeOf(g<Num.Decr<1>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Decr<2>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Decr<10>>()).toEqualTypeOf<9>();
expectTypeOf(g<Num.Decr<100>>()).toEqualTypeOf<99>();
expectTypeOf(g<Num.Decr<1000>>()).toEqualTypeOf<999>();

expectTypeOf(g<Num.Div<0, 0>>()).toEqualTypeOf<never>();
expectTypeOf(g<Num.Div<10, 0>>()).toEqualTypeOf<never>();
expectTypeOf(g<Num.Div<0, 1>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Div<0, 10>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Div<1, 1>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Div<10, 10>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Div<999, 999>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Div<9, 3>>()).toEqualTypeOf<3>();
expectTypeOf(g<Num.Div<9, 4>>()).toEqualTypeOf<2>();

expectTypeOf(g<Num.DivMod<0, 0>>()).toEqualTypeOf<never>();
expectTypeOf(g<Num.DivMod<10, 0>>()).toEqualTypeOf<never>();
expectTypeOf(g<Num.DivMod<0, 1>>()).toEqualTypeOf<[0, 0]>();
expectTypeOf(g<Num.DivMod<10, 10>>()).toEqualTypeOf<[1, 0]>();
expectTypeOf(g<Num.DivMod<999, 999>>()).toEqualTypeOf<[1, 0]>();
expectTypeOf(g<Num.DivMod<9, 3>>()).toEqualTypeOf<[3, 0]>();
expectTypeOf(g<Num.DivMod<9, 4>>()).toEqualTypeOf<[2, 1]>();

expectTypeOf(g<Num.Equal<0, 0>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.Equal<1, 1>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.Equal<1234, 1234>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.Equal<0, 1>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.Equal<1, 0>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.Equal<1234, 4321>>()).toEqualTypeOf<false>();

expectTypeOf(g<Num.GreaterThan<0, 0>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.GreaterThan<0, 1>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.GreaterThan<1, 1>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.GreaterThan<123, 321>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.GreaterThan<423, 3211>>()).toEqualTypeOf<false>();

expectTypeOf(g<Num.GreaterThan<1, 0>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.GreaterThan<2, 1>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.GreaterThan<10, 1>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.GreaterThan<321, 123>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.GreaterThan<3211, 413>>()).toEqualTypeOf<true>();

expectTypeOf(g<Num.GreaterThanOrEqual<0, 1>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.GreaterThanOrEqual<123, 321>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.GreaterThanOrEqual<423, 3211>>()).toEqualTypeOf<false>();

expectTypeOf(g<Num.GreaterThanOrEqual<0, 0>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.GreaterThanOrEqual<1, 1>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.GreaterThanOrEqual<1, 0>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.GreaterThanOrEqual<2, 1>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.GreaterThanOrEqual<10, 1>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.GreaterThanOrEqual<321, 123>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.GreaterThanOrEqual<3211, 413>>()).toEqualTypeOf<true>();

expectTypeOf(g<Num.Inc<0>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Inc<1>>()).toEqualTypeOf<2>();
expectTypeOf(g<Num.Inc<9>>()).toEqualTypeOf<10>();
expectTypeOf(g<Num.Inc<439>>()).toEqualTypeOf<440>();

expectTypeOf(g<Num.InRange<4, 5, 10>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.InRange<11, 5, 10>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.InRange<7, 5, 10>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.InRange<5, 5, 10>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.InRange<10, 5, 10>>()).toEqualTypeOf<true>();

expectTypeOf(g<Num.IsEven<0>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.IsEven<2>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.IsEven<14>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.IsEven<256>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.IsEven<5318>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.IsEven<1>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.IsEven<3>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.IsEven<15>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.IsEven<327>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.IsEven<6159>>()).toEqualTypeOf<false>();

expectTypeOf(g<Num.IsOdd<0>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.IsOdd<2>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.IsOdd<14>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.IsOdd<256>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.IsOdd<5318>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.IsOdd<1>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.IsOdd<3>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.IsOdd<15>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.IsOdd<327>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.IsOdd<6159>>()).toEqualTypeOf<true>();

expectTypeOf(g<Num.LessThan<0, 0>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.LessThan<1, 0>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.LessThan<1, 1>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.LessThan<1, 9>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.LessThan<9, 10>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.LessThan<123, 4321>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.LessThan<4320, 4321>>()).toEqualTypeOf<true>();

expectTypeOf(g<Num.LessThanOrEqual<0, 0>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.LessThanOrEqual<1, 0>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.LessThanOrEqual<1, 1>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.LessThanOrEqual<1, 9>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.LessThanOrEqual<9, 10>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.LessThanOrEqual<123, 4321>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.LessThanOrEqual<4320, 4321>>()).toEqualTypeOf<true>();

expectTypeOf(g<Num.Max<0, 0>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Max<0, 1>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Max<1, 0>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Max<1, 1>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Max<60, 7>>()).toEqualTypeOf<60>();
expectTypeOf(g<Num.Max<7, 60>>()).toEqualTypeOf<60>();

expectTypeOf(g<Num.Min<0, 0>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Min<0, 1>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Min<1, 0>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Min<1, 1>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Min<60, 7>>()).toEqualTypeOf<7>();
expectTypeOf(g<Num.Min<7, 60>>()).toEqualTypeOf<7>();

expectTypeOf(g<Num.Mod<0, 0>>()).toEqualTypeOf<never>();
expectTypeOf(g<Num.Mod<0, 1>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Mod<1, 0>>()).toEqualTypeOf<never>();
expectTypeOf(g<Num.Mod<0, 2>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Mod<2, 2>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Mod<68, 2>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Mod<1, 2>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Mod<3, 2>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Mod<69, 2>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Mod<658, 67>>()).toEqualTypeOf<55>();
expectTypeOf(g<Num.Mod<658, 700>>()).toEqualTypeOf<658>();

expectTypeOf(g<Num.Mult<0, 0>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Mult<10, 0>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Mult<0, 10>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Mult<1, 1>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Mult<1, 10>>()).toEqualTypeOf<10>();
expectTypeOf(g<Num.Mult<10, 1>>()).toEqualTypeOf<10>();
expectTypeOf(g<Num.Mult<2, 3>>()).toEqualTypeOf<6>();

expectTypeOf(g<Num.NotEqual<0, 1>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.NotEqual<1, 0>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.NotEqual<9, 99>>()).toEqualTypeOf<true>();
expectTypeOf(g<Num.NotEqual<0, 0>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.NotEqual<1, 1>>()).toEqualTypeOf<false>();
expectTypeOf(g<Num.NotEqual<99, 99>>()).toEqualTypeOf<false>();

expectTypeOf(g<Num.Pow<0, 0>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Pow<0, 1>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Pow<0, 2>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Pow<1, 0>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Pow<1, 1>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Pow<1, 2>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Pow<2, 0>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Pow<2, 1>>()).toEqualTypeOf<2>();
expectTypeOf(g<Num.Pow<2, 2>>()).toEqualTypeOf<4>();
expectTypeOf(g<Num.Pow<2, 3>>()).toEqualTypeOf<8>();
expectTypeOf(g<Num.Pow<3, 4>>()).toEqualTypeOf<81>();

expectTypeOf(g<Num.Subtract<0, 1>>()).toEqualTypeOf<never>();
expectTypeOf(g<Num.Subtract<1234, 4321>>()).toEqualTypeOf<never>();
expectTypeOf(g<Num.Subtract<0, 0>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Subtract<1, 1>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Subtract<9, 9>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Subtract<58, 58>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Subtract<5809, 5809>>()).toEqualTypeOf<0>();
expectTypeOf(g<Num.Subtract<12345, 12345>>()).toEqualTypeOf<0>();

expectTypeOf(g<Num.Subtract<1, 0>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Subtract<2, 1>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Subtract<10, 9>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Subtract<100, 99>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Subtract<5809, 5808>>()).toEqualTypeOf<1>();
expectTypeOf(g<Num.Subtract<12345, 12344>>()).toEqualTypeOf<1>();

expectTypeOf(g<Num.Subtract<4123, 8>>()).toEqualTypeOf<4115>();
expectTypeOf(g<Num.Subtract<14123, 8231>>()).toEqualTypeOf<5892>();
