import { expectType } from 'tsd';
import type { StrNum } from '../src/index';

declare function g<T>(): T;

expectType<'0'>(g<StrNum.Add<'0', '0'>>());
expectType<'1'>(g<StrNum.Add<'1', '0'>>());
expectType<'1'>(g<StrNum.Add<'0', '1'>>());
expectType<'10'>(g<StrNum.Add<'9', '1'>>());
expectType<'10'>(g<StrNum.Add<'1', '9'>>());
expectType<'131'>(g<StrNum.Add<'123', '8'>>());
expectType<'131'>(g<StrNum.Add<'8', '123'>>());
expectType<'6665'>(g<StrNum.Add<'5678', '987'>>());

expectType<['2', false]>(g<StrNum.AddDigit<'2', '0'>>());
expectType<['2', true]>(g<StrNum.AddDigit<'3', '9'>>());

// expectType<never>(g<StrNum.AmountTimesIn<'0', '0'>>());
// expectType<never>(g<StrNum.AmountTimesIn<'0', '10'>>());
expectType<['1', '0']>(g<StrNum.AmountTimesIn<'1', '1'>>());
expectType<['1', '0']>(g<StrNum.AmountTimesIn<'2', '2'>>());
expectType<['1', '1']>(g<StrNum.AmountTimesIn<'2', '3'>>());
expectType<['5', '0']>(g<StrNum.AmountTimesIn<'1', '5'>>());
expectType<['1', '2']>(g<StrNum.AmountTimesIn<'3', '5'>>());
expectType<['18', '2']>(g<StrNum.AmountTimesIn<'3', '56'>>());

expectType<never>(g<StrNum.Divide<'0', '0'>>());
expectType<never>(g<StrNum.Divide<'10', '0'>>());
expectType<['0', '0']>(g<StrNum.Divide<'0', '1'>>());
expectType<['0', '0']>(g<StrNum.Divide<'0', '100'>>());
expectType<['0', '1']>(g<StrNum.Divide<'1', '2'>>());
expectType<['0', '1']>(g<StrNum.Divide<'1', '10'>>());
expectType<['0', '10']>(g<StrNum.Divide<'10', '100'>>());

expectType<['1', '0']>(g<StrNum.Divide<'1', '1'>>());
expectType<['1', '0']>(g<StrNum.Divide<'9', '9'>>());
expectType<['1', '0']>(g<StrNum.Divide<'987', '987'>>());

expectType<['2', '0']>(g<StrNum.Divide<'4', '2'>>());
expectType<['2', '1']>(g<StrNum.Divide<'5', '2'>>());
expectType<['2', '1']>(g<StrNum.Divide<'9', '4'>>());
expectType<['2', '10']>(g<StrNum.Divide<'410', '200'>>());
