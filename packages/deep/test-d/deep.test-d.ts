import { List } from '@rimbu/list';
import { expectError, expectType } from 'tsd';
import { patch, Match, Literal, Immutable } from '../src';

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

// expectError(Match.all(1)(2));
// expectError(Match.all(true)(false));
// expectError(Match.all('abc')('def'));
// expectError(Match.all([])([1]));
// expectError(Match.all([1, 2, 3])([]));
// expectError(Match.all({}));
expectError(Match.all(m)(undefined));
expectError(Match.all(m)({ z: 1 }));
expectError(Match.all(m)({ z: undefined }));
expectError(Match.all(m)({ a: true }));
expectError(Match.all(m)({ a: 1, z: 1 }));
expectError(Match.all(m)({ a: Literal(undefined) }));
expectError(Match.all(m)({ a: null }));
expectError(Match.all(m)({ a: Literal(null) }));
expectError(Match.all(m)({ b: [1] }));
expectError(Match.all(m)({ b: ['a'] }));
expectError(Match.all(m)({ b: null }));
expectError(Match.all(m)({ c: { d: 1 } }));
expectError(Match.all(m)({ c: { d: null } }));
expectError(Match.all(m)({ c: { d: Literal(null) } }));
expectError(Match.all(m)({ c: { d: Literal(undefined) } }));
expectError(Match.all(m)({ c: null }));
expectError(Match.all(m)({ f: [1, 2] }));
expectError(Match.all(m)({ f: List.empty<number>() }));
expectError(Match.all(m)({ f: { a: 1 } }));
