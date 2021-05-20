import { List } from '@rimbu/list';
import { expectError, expectType } from 'tsd';
import { patch, matchAll, Literal, Immutable } from '../src';

let m!: {
  a: number;
  b: string[];
  c: {
    d: boolean;
    e: [number, string] | null;
  };
  f: List.NonEmpty<number>;
};
type M = Immutable<typeof m>;

// Patch

expectError(patch(m)(m));

expectType<M>(patch(m)({}));

expectError(patch(m)({ z: 1 }));
expectError(patch(m)({ z: undefined }));
expectError(patch(m)({ a: '' }));
expectError(patch(m)({ a: 2, z: 1 }));
// expectError(patch(m)({ a: undefined }));
expectError(patch(m)({ a: Literal(undefined) }));
expectError(patch(m)({ a: null }));
expectError(patch(m)({ a: Literal(null) }));
expectError(patch(m)({ a: () => 'a' }));
expectError(patch(m)({ b: [1] }));
expectError(patch(m)({ b: ['a'] }));
expectError(patch(m)({ b: null }));
expectError(patch(m)({ c: { d: 1 } }));
expectError(patch(m)({ c: { d: null } }));
expectError(patch(m)({ c: { d: Literal(null) } }));
expectError(patch(m)({ c: { d: Literal(undefined) } }));
expectError(patch(m)({ c: null }));
expectError(patch(m)({ c: () => {} }));
expectError(patch(m)({ f: [1, 2] }));
expectError(patch(m)({ f: List.empty<number>() }));
expectError(patch(m)({ f: List.of(1, 2, 3) }));
expectError(patch(m)({ f: { a: 1 } }));

expectType<M>(patch(m)({ a: 2 }));
expectType<M>(patch(m)({ a: (v) => v + 1 }));
expectType<M>(patch(m)({ a: (v, p) => p.a }));
expectType<M>(patch(m)({ a: (v, p, r) => r.a }));
expectType<M>(patch(m)({ a: Literal(1) }));
expectType<M>(patch(m)({ b: Literal(['abc']) }));
expectType<M>(patch(m)({ b: { 1: 'abc' } }));
expectType<M>(patch(m)({ c: {} }));
expectType<M>(patch(m)({ c: { d: true } }));
expectType<M>(patch(m)({ c: { d: (v) => !v } }));
expectType<M>(patch(m)({ c: { e: null } }));
expectType<M>(patch(m)({ c: { e: Literal(null) } }));
expectType<M>(patch(m)({ f: (v) => v }));
expectType<M>(patch(m)({ f: Literal(List.of(1, 2, 3)) }));

// Match

// expectError(matchAll(1)(2));
// expectError(matchAll(true)(false));
// expectError(matchAll('abc')('def'));
// expectError(matchAll([])([1]));
// expectError(matchAll([1, 2, 3])([]));
// expectError(matchAll({}));
expectError(matchAll(m)(undefined));
expectError(matchAll(m)({ z: 1 }));
expectError(matchAll(m)({ z: undefined }));
expectError(matchAll(m)({ a: true }));
expectError(matchAll(m)({ a: 1, z: 1 }));
expectError(matchAll(m)({ a: Literal(undefined) }));
expectError(matchAll(m)({ a: null }));
expectError(matchAll(m)({ a: Literal(null) }));
expectError(matchAll(m)({ b: [1] }));
expectError(matchAll(m)({ b: ['a'] }));
expectError(matchAll(m)({ b: null }));
expectError(matchAll(m)({ c: { d: 1 } }));
expectError(matchAll(m)({ c: { d: null } }));
expectError(matchAll(m)({ c: { d: Literal(null) } }));
expectError(matchAll(m)({ c: { d: Literal(undefined) } }));
expectError(matchAll(m)({ c: null }));
expectError(matchAll(m)({ f: [1, 2] }));
expectError(matchAll(m)({ f: List.empty<number>() }));
expectError(matchAll(m)({ f: { a: 1 } }));
