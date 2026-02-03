import { expectType } from 'tsd';

import type { Num } from '../src/index.mjs';

declare function g<T>(): T;

expectType<0>(g<Num.Add<0, 0>>());
expectType<1>(g<Num.Add<0, 1>>());
expectType<1>(g<Num.Add<1, 0>>());
expectType<4>(g<Num.Add<0, 4>>());
expectType<4>(g<Num.Add<1, 3>>());
expectType<4>(g<Num.Add<2, 2>>());
expectType<4>(g<Num.Add<3, 1>>());
expectType<4>(g<Num.Add<4, 0>>());
expectType<20>(g<Num.Add<4, 16>>());
expectType<20>(g<Num.Add<16, 4>>());
expectType<100>(g<Num.Add<99, 1>>());
expectType<100>(g<Num.Add<1, 99>>());
expectType<117>(g<Num.Add<18, 99>>());
expectType<117>(g<Num.Add<99, 18>>());
expectType<9215>(g<Num.Add<5617, 3598>>());

expectType<never>(g<Num.Decr<0>>());
expectType<0>(g<Num.Decr<1>>());
expectType<1>(g<Num.Decr<2>>());
expectType<9>(g<Num.Decr<10>>());
expectType<99>(g<Num.Decr<100>>());
expectType<999>(g<Num.Decr<1000>>());

expectType<never>(g<Num.Div<0, 0>>());
expectType<never>(g<Num.Div<10, 0>>());
expectType<0>(g<Num.Div<0, 1>>());
expectType<0>(g<Num.Div<0, 10>>());
expectType<1>(g<Num.Div<1, 1>>());
expectType<1>(g<Num.Div<10, 10>>());
expectType<1>(g<Num.Div<999, 999>>());
expectType<3>(g<Num.Div<9, 3>>());
expectType<2>(g<Num.Div<9, 4>>());

expectType<never>(g<Num.DivMod<0, 0>>());
expectType<never>(g<Num.DivMod<10, 0>>());
expectType<[0, 0]>(g<Num.DivMod<0, 1>>());
expectType<[1, 0]>(g<Num.DivMod<10, 10>>());
expectType<[1, 0]>(g<Num.DivMod<999, 999>>());
expectType<[3, 0]>(g<Num.DivMod<9, 3>>());
expectType<[2, 1]>(g<Num.DivMod<9, 4>>());

expectType<true>(g<Num.Equal<0, 0>>());
expectType<true>(g<Num.Equal<1, 1>>());
expectType<true>(g<Num.Equal<1234, 1234>>());
expectType<false>(g<Num.Equal<0, 1>>());
expectType<false>(g<Num.Equal<1, 0>>());
expectType<false>(g<Num.Equal<1234, 4321>>());

expectType<false>(g<Num.GreaterThan<0, 0>>());
expectType<false>(g<Num.GreaterThan<0, 1>>());
expectType<false>(g<Num.GreaterThan<1, 1>>());
expectType<false>(g<Num.GreaterThan<123, 321>>());
expectType<false>(g<Num.GreaterThan<423, 3211>>());

expectType<true>(g<Num.GreaterThan<1, 0>>());
expectType<true>(g<Num.GreaterThan<2, 1>>());
expectType<true>(g<Num.GreaterThan<10, 1>>());
expectType<true>(g<Num.GreaterThan<321, 123>>());
expectType<true>(g<Num.GreaterThan<3211, 413>>());

expectType<false>(g<Num.GreaterThanOrEqual<0, 1>>());
expectType<false>(g<Num.GreaterThanOrEqual<123, 321>>());
expectType<false>(g<Num.GreaterThanOrEqual<423, 3211>>());

expectType<true>(g<Num.GreaterThanOrEqual<0, 0>>());
expectType<true>(g<Num.GreaterThanOrEqual<1, 1>>());
expectType<true>(g<Num.GreaterThanOrEqual<1, 0>>());
expectType<true>(g<Num.GreaterThanOrEqual<2, 1>>());
expectType<true>(g<Num.GreaterThanOrEqual<10, 1>>());
expectType<true>(g<Num.GreaterThanOrEqual<321, 123>>());
expectType<true>(g<Num.GreaterThanOrEqual<3211, 413>>());

expectType<1>(g<Num.Inc<0>>());
expectType<2>(g<Num.Inc<1>>());
expectType<10>(g<Num.Inc<9>>());
expectType<440>(g<Num.Inc<439>>());

expectType<false>(g<Num.InRange<4, 5, 10>>());
expectType<false>(g<Num.InRange<11, 5, 10>>());
expectType<true>(g<Num.InRange<7, 5, 10>>());
expectType<true>(g<Num.InRange<5, 5, 10>>());
expectType<true>(g<Num.InRange<10, 5, 10>>());

expectType<true>(g<Num.IsEven<0>>());
expectType<true>(g<Num.IsEven<2>>());
expectType<true>(g<Num.IsEven<14>>());
expectType<true>(g<Num.IsEven<256>>());
expectType<true>(g<Num.IsEven<5318>>());
expectType<false>(g<Num.IsEven<1>>());
expectType<false>(g<Num.IsEven<3>>());
expectType<false>(g<Num.IsEven<15>>());
expectType<false>(g<Num.IsEven<327>>());
expectType<false>(g<Num.IsEven<6159>>());

expectType<false>(g<Num.IsOdd<0>>());
expectType<false>(g<Num.IsOdd<2>>());
expectType<false>(g<Num.IsOdd<14>>());
expectType<false>(g<Num.IsOdd<256>>());
expectType<false>(g<Num.IsOdd<5318>>());
expectType<true>(g<Num.IsOdd<1>>());
expectType<true>(g<Num.IsOdd<3>>());
expectType<true>(g<Num.IsOdd<15>>());
expectType<true>(g<Num.IsOdd<327>>());
expectType<true>(g<Num.IsOdd<6159>>());

expectType<false>(g<Num.LessThan<0, 0>>());
expectType<false>(g<Num.LessThan<1, 0>>());
expectType<false>(g<Num.LessThan<1, 1>>());
expectType<true>(g<Num.LessThan<1, 9>>());
expectType<true>(g<Num.LessThan<9, 10>>());
expectType<true>(g<Num.LessThan<123, 4321>>());
expectType<true>(g<Num.LessThan<4320, 4321>>());

expectType<true>(g<Num.LessThanOrEqual<0, 0>>());
expectType<false>(g<Num.LessThanOrEqual<1, 0>>());
expectType<true>(g<Num.LessThanOrEqual<1, 1>>());
expectType<true>(g<Num.LessThanOrEqual<1, 9>>());
expectType<true>(g<Num.LessThanOrEqual<9, 10>>());
expectType<true>(g<Num.LessThanOrEqual<123, 4321>>());
expectType<true>(g<Num.LessThanOrEqual<4320, 4321>>());

expectType<0>(g<Num.Max<0, 0>>());
expectType<1>(g<Num.Max<0, 1>>());
expectType<1>(g<Num.Max<1, 0>>());
expectType<1>(g<Num.Max<1, 1>>());
expectType<60>(g<Num.Max<60, 7>>());
expectType<60>(g<Num.Max<7, 60>>());

expectType<0>(g<Num.Min<0, 0>>());
expectType<0>(g<Num.Min<0, 1>>());
expectType<0>(g<Num.Min<1, 0>>());
expectType<1>(g<Num.Min<1, 1>>());
expectType<7>(g<Num.Min<60, 7>>());
expectType<7>(g<Num.Min<7, 60>>());

expectType<never>(g<Num.Mod<0, 0>>());
expectType<0>(g<Num.Mod<0, 1>>());
expectType<never>(g<Num.Mod<1, 0>>());
expectType<0>(g<Num.Mod<0, 2>>());
expectType<0>(g<Num.Mod<2, 2>>());
expectType<0>(g<Num.Mod<68, 2>>());
expectType<1>(g<Num.Mod<1, 2>>());
expectType<1>(g<Num.Mod<3, 2>>());
expectType<1>(g<Num.Mod<69, 2>>());
expectType<55>(g<Num.Mod<658, 67>>());
expectType<658>(g<Num.Mod<658, 700>>());

expectType<0>(g<Num.Mult<0, 0>>());
expectType<0>(g<Num.Mult<10, 0>>());
expectType<0>(g<Num.Mult<0, 10>>());
expectType<1>(g<Num.Mult<1, 1>>());
expectType<10>(g<Num.Mult<1, 10>>());
expectType<10>(g<Num.Mult<10, 1>>());
expectType<6>(g<Num.Mult<2, 3>>());

expectType<true>(g<Num.NotEqual<0, 1>>());
expectType<true>(g<Num.NotEqual<1, 0>>());
expectType<true>(g<Num.NotEqual<9, 99>>());
expectType<false>(g<Num.NotEqual<0, 0>>());
expectType<false>(g<Num.NotEqual<1, 1>>());
expectType<false>(g<Num.NotEqual<99, 99>>());

expectType<0>(g<Num.Pow<0, 0>>());
expectType<0>(g<Num.Pow<0, 1>>());
expectType<0>(g<Num.Pow<0, 2>>());
expectType<1>(g<Num.Pow<1, 0>>());
expectType<1>(g<Num.Pow<1, 1>>());
expectType<1>(g<Num.Pow<1, 2>>());
expectType<1>(g<Num.Pow<2, 0>>());
expectType<2>(g<Num.Pow<2, 1>>());
expectType<4>(g<Num.Pow<2, 2>>());
expectType<8>(g<Num.Pow<2, 3>>());
expectType<81>(g<Num.Pow<3, 4>>());

expectType<never>(g<Num.Subtract<0, 1>>());
expectType<never>(g<Num.Subtract<1234, 4321>>());
expectType<0>(g<Num.Subtract<0, 0>>());
expectType<0>(g<Num.Subtract<1, 1>>());
expectType<0>(g<Num.Subtract<9, 9>>());
expectType<0>(g<Num.Subtract<58, 58>>());
expectType<0>(g<Num.Subtract<5809, 5809>>());
expectType<0>(g<Num.Subtract<12345, 12345>>());

expectType<1>(g<Num.Subtract<1, 0>>());
expectType<1>(g<Num.Subtract<2, 1>>());
expectType<1>(g<Num.Subtract<10, 9>>());
expectType<1>(g<Num.Subtract<100, 99>>());
expectType<1>(g<Num.Subtract<5809, 5808>>());
expectType<1>(g<Num.Subtract<12345, 12344>>());

expectType<4115>(g<Num.Subtract<4123, 8>>());
expectType<5892>(g<Num.Subtract<14123, 8231>>());
