import { List } from '@rimbu/list';
import { expectError, expectType } from 'tsd';
import { Patch, Match, Literal, Immutable } from '../src';

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

expectError(Patch(m)(m));

expectType<M>(Patch(m)({}));

expectError(Patch(m)({ z: 1 }));
expectError(Patch(m)({ z: undefined }));
expectError(Patch(m)({ a: '' }));
expectError(Patch(m)({ a: 2, z: 1 }));
// expectError(Patch(m)({ a: undefined }));
expectError(Patch(m)({ a: Literal(undefined) }));
expectError(Patch(m)({ a: null }));
expectError(Patch(m)({ a: Literal(null) }));
expectError(Patch(m)({ a: () => 'a' }));
expectError(Patch(m)({ b: [1] }));
expectError(Patch(m)({ b: ['a'] }));
expectError(Patch(m)({ b: null }));
expectError(Patch(m)({ c: { d: 1 } }));
expectError(Patch(m)({ c: { d: null } }));
expectError(Patch(m)({ c: { d: Literal(null) } }));
expectError(Patch(m)({ c: { d: Literal(undefined) } }));
expectError(Patch(m)({ c: null }));
expectError(Patch(m)({ c: () => {} }));
expectError(Patch(m)({ f: [1, 2] }));
expectError(Patch(m)({ f: List.empty<number>() }));
expectError(Patch(m)({ f: List.of(1, 2, 3) }));
expectError(Patch(m)({ f: { a: 1 } }));

expectType<M>(Patch(m)({ a: 2 }));
expectType<M>(Patch(m)({ a: (v) => v + 1 }));
expectType<M>(Patch(m)({ a: (v, p) => p.a }));
expectType<M>(Patch(m)({ a: (v, p, r) => r.a }));
expectType<M>(Patch(m)({ a: Literal(1) }));
expectType<M>(Patch(m)({ b: Literal(['abc']) }));
expectType<M>(Patch(m)({ b: { 1: 'abc' } }));
expectType<M>(Patch(m)({ c: {} }));
expectType<M>(Patch(m)({ c: { d: true } }));
expectType<M>(Patch(m)({ c: { d: (v) => !v } }));
expectType<M>(Patch(m)({ c: { e: null } }));
expectType<M>(Patch(m)({ c: { e: Literal(null) } }));
expectType<M>(Patch(m)({ f: (v) => v }));
expectType<M>(Patch(m)({ f: Literal(List.of(1, 2, 3)) }));

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
