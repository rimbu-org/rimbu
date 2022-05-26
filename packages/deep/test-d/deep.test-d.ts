import { List } from '@rimbu/list';
import { expectError, expectType } from 'tsd';
import $, { match, patch } from '../src';

let m!: {
  a: number;
  b: string[];
  c: {
    d: boolean;
    e: [number, string] | null;
  };
  f: List.NonEmpty<number>;
  g: Record<string, string>;
};
type M = typeof m;

// Patch

expectType<M>(patch(m, {}));
expectType<M>(patch(m, m));

expectError(patch(1, 2));
expectError(patch('', 'a'));
expectError(patch(true, false));
expectError(patch([1], [2]));
expectError(patch({ f() {} }, {}));
expectError(patch({ f: () => 1 }, {}));
expectError(patch(m, { z: 1 }));
expectError(patch(m, { z: undefined }));
expectError(patch(m, { a: '' }));
expectError(patch(m, { a: 2, z: 1 }));
// expectError(patch(m, { a: undefined }));
expectError(patch(m, { a: () => undefined }));
expectError(patch(m, { a: null }));
expectError(patch(m, { a: () => null }));
expectError(patch(m, { a: () => 'a' }));
expectError(patch(m, { b: [1] }));
expectError(patch(m, { b: null }));
expectError(patch(m, { c: { d: 1 } }));
expectError(patch(m, { c: { d: null } }));
expectError(patch(m, { c: { d: () => null } }));
expectError(patch(m, { c: { d: () => undefined } }));
expectError(patch(m, { c: null }));
expectError(patch(m, { c: () => {} }));
expectError(patch(m, { f: [1, 2] }));
expectError(patch(m, { f: List.empty<number>() }));
expectError(patch(m, { f: { a: 1 } }));
expectError(patch(m, { b: { 1: 'abc' } }));
expectError(patch(m, { g: { a: 2 } }));

expectType<M>(patch(m, { a: 2 }));
expectType<M>(patch(m, { a: (v) => v + 1 }));
expectType<M>(patch(m, { a: (v, p) => p.a }));
expectType<M>(patch(m, { a: (v, p, r) => r.a }));
expectType<M>(patch(m, { a: () => 1 }));
expectType<M>(patch(m, { b: ['a'] }));
expectType<M>(patch(m, { b: () => ['abc'] }));
expectType<M>(patch(m, { c: $({}) }));
expectType<M>(patch(m, { c: $({ d: true }) }));
expectType<M>(patch(m, { c: $({ d: (v: boolean) => !v }) }));
expectType<M>(patch(m, { c: $({ e: null }) }));
expectType<M>(patch(m, { c: $({ e: () => null }) }));
expectType<M>(patch(m, { f: (v) => v }));
expectType<M>(patch(m, { f: List.of(1, 2, 3) }));
expectType<M>(patch(m, { f: () => List.of(1, 2, 3) }));

// Match

expectError(match(1, 2));
expectError(match(true, false));
expectError(match('abc', 'def'));
expectError(match([], [1]));
expectError(match([1, 2, 3], []));
expectError(match(m, undefined));
expectError(match(m, { z: 1 }));
expectError(match(m, { z: undefined }));
expectError(match(m, { a: true }));
expectError(match(m, { a: 1, z: 1 }));
expectError(match(m, { a: () => undefined }));
expectError(match(m, { a: null }));
expectError(match(m, { a: () => null }));
expectError(match(m, { b: [1] }));
expectError(match(m, { b: null }));
expectError(match(m, { c: { d: 1 } }));
expectError(match(m, { c: { d: null } }));
expectError(match(m, { c: { d: () => null } }));
expectError(match(m, { c: { d: () => undefined } }));
expectError(match(m, { c: null }));
expectError(match(m, { f: { a: 1 } }));

expectType<boolean>(match(m, {}));
expectType<boolean>(match(m, { a: 1 }));
expectType<boolean>(match(m, { a: () => 1 }));
expectType<boolean>(match(m, { b: ['a'] }));
expectType<boolean>(match(m, { b: () => ['a'] }));
expectType<boolean>(match(m, { c: { d: true } }));
expectType<boolean>(match(m, { f: [1, 2] }));
expectType<boolean>(match(m, { f: List.empty<number>() }));
