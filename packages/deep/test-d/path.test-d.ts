import type { List } from '@rimbu/list';
import { expectError, expectType } from 'tsd';
import { Path } from '../src';

let m!: {
  a: number;
  b: string[];
  c: {
    d: boolean;
    e: [number, string] | null;
  };
  f: List.NonEmpty<number>;
};
type M = typeof m;

expectError(Path.getValue(m, ''));
expectError(Path.getValue(m, 'a.'));
expectError(Path.getValue(m, '.a'));
expectError(Path.getValue(m, 'a.a'));
expectError(Path.getValue(m, 'a.b'));
expectError(Path.getValue(m, 'z'));
expectError(Path.getValue(m, 'cc'));
expectError(Path.getValue(m, 'cd'));

expectType<number>(Path.getValue(m, 'a'));
expectType<string[]>(Path.getValue(m, 'b'));
expectType<M['c']>(Path.getValue(m, 'c'));
expectType<M['f']>(Path.getValue(m, 'f'));
expectType<M['c']['e']>(Path.getValue(m, 'c.e'));
