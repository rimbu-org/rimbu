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

expectError(Path.get(m, ''));
expectError(Path.get(m, 'a.'));
expectError(Path.get(m, '.a'));
expectError(Path.get(m, 'a.a'));
expectError(Path.get(m, 'a.b'));
expectError(Path.get(m, 'z'));
expectError(Path.get(m, 'cc'));
expectError(Path.get(m, 'cd'));

expectType<number>(Path.get(m, 'a'));
expectType<string[]>(Path.get(m, 'b'));
expectType<M['c']>(Path.get(m, 'c'));
expectType<M['f']>(Path.get(m, 'f'));
expectType<M['c']['e']>(Path.get(m, 'c.e'));
