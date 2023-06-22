import { expectType } from 'tsd';
import type { PlainObj } from '../src';

function f<T>(p: T): PlainObj<T> {
  return p as any;
}

expectType<never>(f(1));
expectType<never>(f('a'));
expectType<never>(f(true));
expectType<never>(f(new Map()));
expectType<never>(f(Promise.resolve(1)));
expectType<never>(f([1, 2]));
expectType<never>(f({ q: () => {}, b: 5 }));
const obj = {
  a() {},
  b: 5,
};
expectType<never>(f(obj));
const iter = {
  [Symbol.iterator]() {},
};
expectType<never>(f(iter));

expectType<{}>(f({} as {}));
expectType<{ a: number }>(f({ a: 1 }));
expectType<{ a: { b: number; c: string } }>(f({ a: { b: 3, c: 'a' } }));
expectType<{ a: number[] }>(f({ a: [1, 2] }));
expectType<{ a: Promise<number> }>(f({ a: Promise.resolve(5) }));
