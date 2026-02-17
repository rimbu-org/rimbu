import { expectTypeOf } from 'bun:test';

import type { StrNum } from '@rimbu/typical';

declare function g<T>(): T;

expectTypeOf(g<StrNum.Add<'0', '0'>>()).toEqualTypeOf<'0'>();
expectTypeOf(g<StrNum.Add<'1', '0'>>()).toEqualTypeOf<'1'>();
expectTypeOf(g<StrNum.Add<'0', '1'>>()).toEqualTypeOf<'1'>();
expectTypeOf(g<StrNum.Add<'9', '1'>>()).toEqualTypeOf<'10'>();
expectTypeOf(g<StrNum.Add<'1', '9'>>()).toEqualTypeOf<'10'>();
expectTypeOf(g<StrNum.Add<'123', '8'>>()).toEqualTypeOf<'131'>();
expectTypeOf(g<StrNum.Add<'8', '123'>>()).toEqualTypeOf<'131'>();
expectTypeOf(g<StrNum.Add<'5678', '987'>>()).toEqualTypeOf<'6665'>();

expectTypeOf(g<StrNum.AddDigit<'2', '0'>>()).toEqualTypeOf<['2', false]>();
expectTypeOf(g<StrNum.AddDigit<'3', '9'>>()).toEqualTypeOf<['2', true]>();

// expectType<never>(g<StrNum.AmountTimesIn<'0', '0'>>());
// expectType<never>(g<StrNum.AmountTimesIn<'0', '10'>>());
expectTypeOf(g<StrNum.AmountTimesIn<'1', '1'>>()).toEqualTypeOf<['1', '0']>();
expectTypeOf(g<StrNum.AmountTimesIn<'2', '2'>>()).toEqualTypeOf<['1', '0']>();
expectTypeOf(g<StrNum.AmountTimesIn<'2', '3'>>()).toEqualTypeOf<['1', '1']>();
expectTypeOf(g<StrNum.AmountTimesIn<'1', '5'>>()).toEqualTypeOf<['5', '0']>();
expectTypeOf(g<StrNum.AmountTimesIn<'3', '5'>>()).toEqualTypeOf<['1', '2']>();
expectTypeOf(g<StrNum.AmountTimesIn<'3', '56'>>()).toEqualTypeOf<['18', '2']>();

expectTypeOf(g<StrNum.Divide<'0', '0'>>()).toEqualTypeOf<never>();
expectTypeOf(g<StrNum.Divide<'10', '0'>>()).toEqualTypeOf<never>();
expectTypeOf(g<StrNum.Divide<'0', '1'>>()).toEqualTypeOf<['0', '0']>();
expectTypeOf(g<StrNum.Divide<'0', '100'>>()).toEqualTypeOf<['0', '0']>();
expectTypeOf(g<StrNum.Divide<'1', '2'>>()).toEqualTypeOf<['0', '1']>();
expectTypeOf(g<StrNum.Divide<'1', '10'>>()).toEqualTypeOf<['0', '1']>();
expectTypeOf(g<StrNum.Divide<'10', '100'>>()).toEqualTypeOf<['0', '10']>();

expectTypeOf(g<StrNum.Divide<'1', '1'>>()).toEqualTypeOf<['1', '0']>();
expectTypeOf(g<StrNum.Divide<'9', '9'>>()).toEqualTypeOf<['1', '0']>();
expectTypeOf(g<StrNum.Divide<'987', '987'>>()).toEqualTypeOf<['1', '0']>();

expectTypeOf(g<StrNum.Divide<'4', '2'>>()).toEqualTypeOf<['2', '0']>();
expectTypeOf(g<StrNum.Divide<'5', '2'>>()).toEqualTypeOf<['2', '1']>();
expectTypeOf(g<StrNum.Divide<'9', '4'>>()).toEqualTypeOf<['2', '1']>();
expectTypeOf(g<StrNum.Divide<'410', '200'>>()).toEqualTypeOf<['2', '10']>();
