import type { List } from '@rimbu/list';
import { expectError, expectType } from 'tsd';
import { getAt } from '../src';

let m!: {
  a: number;
  b: string[];
  c: {
    d: boolean;
    e: [number, string] | null;
    f: string | null;
  };
  g: List.NonEmpty<number>;
  h: { i: number } | null;
};

type M = typeof m;

expectError(getAt(m, 'a.'));
expectError(getAt(m, '.a'));
expectError(getAt(m, 'a.a'));
expectError(getAt(m, 'a.b'));
expectError(getAt(m, 'z'));
expectError(getAt(m, 'cc'));
expectError(getAt(m, 'cd'));

expectType<M>(getAt(m, ''));
expectType<number>(getAt(m, 'a'));
expectType<string[]>(getAt(m, 'b'));
expectType<M['c']>(getAt(m, 'c'));
expectType<M['g']>(getAt(m, 'g'));
expectType<M['c']['e']>(getAt(m, 'c.e'));
expectType<M['c']['f']>(getAt(m, 'c.f'));
expectType<number | undefined>(getAt(m, 'c.e?.[0]'));
expectType<string | undefined>(getAt(m, 'c.e?.[1]'));
expectType<M['h']>(getAt(m, 'h'));
expectType<number | undefined>(getAt(m, 'h?.i'));
