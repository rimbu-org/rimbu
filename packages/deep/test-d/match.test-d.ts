import { expectError, expectType } from 'tsd';
import { Tuple, match } from '../src';

expectType<boolean>(match(undefined, undefined));
expectType<boolean>(match(null, null));
expectType<boolean>(match(1, 2));
expectType<boolean>(match('a', 'b'));
expectType<boolean>(match(true, false));
expectType<boolean>(match(Symbol(), Symbol()));

expectType<boolean>(match(undefined, () => undefined));
expectType<boolean>(match(null, () => null));
expectType<boolean>(match(1, () => 2));
expectType<boolean>(match('a', () => 'b'));
expectType<boolean>(match(true, () => false));
expectType<boolean>(match(Symbol(), () => Symbol()));

expectError(match(undefined, null));
expectError(match(null, undefined));
expectError(match(null, {}));
expectError(match({}, null));
expectError(match(1, 'a'));
expectError(match('a', true));
expectError(match(true, 3));
expectError(match(Symbol(), 3));

expectError(match(undefined, () => null));
expectError(match(null, () => undefined));
expectError(match(null, () => ({})));
// expectError(match({}, () => null));
expectError(match(1, () => 'a'));
expectError(match('a', () => 3));
expectError(match(true, () => 3));
expectError(match(Symbol(), () => 3));

const v1 = { a: 1, b: 'a' };

expectType<boolean>(match(v1, v1));
expectType<boolean>(match(v1, {}));
expectType<boolean>(match(v1, { a: 2 }));
expectType<boolean>(match(v1, ['every', { a: 1 }, { a: 2 }]));
expectType<boolean>(match(v1, ['some', { a: 1 }, { a: 2 }]));
expectType<boolean>(match(v1, ['none', { a: 1 }, { a: 2 }]));
expectType<boolean>(match(v1, ['single', { a: 1 }, { a: 2 }]));
expectType<boolean>(
  match(v1, [
    'some',
    ['every', { a: 1 }, { b: 'a' }],
    ['every', { a: 3 }, { b: 'b' }],
  ])
);

expectType<boolean>(match(v1, () => ({})));
expectType<boolean>(match(v1, () => ({ a: 2 })));
expectType<boolean>(match(v1, () => ['every', { a: 1 }, { a: 2 }]));
expectType<boolean>(match(v1, () => ['some', { a: 1 }, { a: 2 }]));
expectType<boolean>(match(v1, () => ['none', { a: 1 }, { a: 2 }]));
expectType<boolean>(match(v1, () => ['single', { a: 1 }, { a: 2 }]));
expectType<boolean>(
  match(v1, [
    'some',
    ['every', () => ({ a: 1 }), { b: 'a' }],
    ['every', () => ({ a: 3 }), { b: 'b' }],
  ])
);

expectError(match(v1, []));
expectError(match(v1, undefined));
expectError(match(v1, null));
expectError(match(v1, { b: 1 }));
expectError(match(v1, { c: 1 }));
expectError(match(v1, { b: { c: 1 } }));
expectError(match(v1, { every: [{ a: 1 }] }));

expectError(match(v1, () => []));
expectError(match(v1, () => undefined));
expectError(match(v1, () => null));
expectError(match(v1, () => ({ b: 1 })));
expectError(match(v1, () => ({ c: 1 })));
expectError(match(v1, () => ({ a: 1, c: 1 })));
expectError(match(v1, () => ({ b: { c: 1 } })));
expectError(match(v1, () => ({ every: [{ a: 1 }] })));

const v2 = { a: 'a', b: { c: 1, d: true } };

expectType<boolean>(match(v2, v2));
expectType<boolean>(match(v2, {}));
expectType<boolean>(match(v2, { a: 'a' }));
expectType<boolean>(match(v2, { b: { d: true } }));
expectType<boolean>(match(v2, { b: { c: (v) => v > 1 } }));
expectType<boolean>(match(v2, { b: ['some', { c: 1 }, { d: false }] }));

expectType<boolean>(match(v2, () => v2));
expectType<boolean>(match(v2, () => ({})));
expectType<boolean>(match(v2, () => ({ a: 'a' })));
expectType<boolean>(match(v2, () => ({ b: { d: true } })));
expectType<boolean>(match(v2, () => ({ b: { c: (v) => v > 1 } })));
expectType<boolean>(match(v2, () => ({ b: ['some', { c: 1 }, { d: false }] })));

expectError(match(v2, []));
expectError(match(v2, { b: 1 }));
expectError(match(v2, { c: 1 }));
expectError(match(v2, { every: [{ a: 'a' }] }));

expectError(match(v2, () => []));
expectError(match(v2, () => ({ b: 1 })));
expectError(match(v2, () => ({ c: 1 })));
expectError(match(v2, () => ({ every: [{ a: 'a' }] })));

const v3 = [1, 2, 3];

expectType<boolean>(match(v3, v3));
expectType<boolean>(match(v3, []));
expectType<boolean>(match(v3, {}));
expectType<boolean>(match(v3, { 0: 1 }));
expectType<boolean>(match(v3, { 1024: 1, 1025: undefined }));
expectType<boolean>(match(v3, { some: [{ 1: 1 }] }));
expectType<boolean>(match(v3, { every: [{ 1: 1 }] }));
expectType<boolean>(match(v3, { some: [{ 1: 1 }, (v) => v.length > 3] }));

expectType<boolean>(match(v3, () => v3));
expectType<boolean>(match(v3, () => []));
expectType<boolean>(match(v3, () => ({})));
expectType<boolean>(match(v3, () => ({ 0: 1 })));
expectType<boolean>(match(v3, () => ({ 1024: 1, 1025: undefined })));
expectType<boolean>(match(v3, () => ({ some: [{ 1: 1 }] })));
expectType<boolean>(
  match(v3, () => ({ some: [{ 1: 1 }, (v) => v.length > 3] }))
);

expectError(match(v3, ['a']));
expectError(match(v3, { a: 'a' }));
expectError(match(v3, { 1: 'a' }));
expectError(match(v3, ['some', { 0: 1 }]));
expectError(match(v3, { some: 13 }));
expectError(match(v3, { some: [13] }));
expectError(match(v3, { every: [], some: [] }));
expectError(match(v3, { every: [], some: undefined }));

expectError(match(v3, () => ['a']));
// TODO cannot get this to work
// expectError(match(v3, () => ({ a: 'a' })));
expectError(match(v3, () => ({ 1: 'a' })));
expectError(match(v3, () => ['some', { 0: 1 }]));
expectError(match(v3, () => ({ some: 13 })));
expectError(match(v3, () => ({ some: [13] })));
expectError(match(v3, () => ({ every: [], some: [] })));

const v4 = Tuple.of(1, 'a', true);

expectType<boolean>(match(v4, v4));
expectType<boolean>(match(v4, {}));
expectType<boolean>(match(v4, { 1: 'a' }));
expectType<boolean>(match(v4, { 1: 'a', 2: true }));
expectType<boolean>(match(v4, { some: [{ 0: 2 }] }));

expectType<boolean>(match(v4, () => v4));
expectType<boolean>(match(v4, () => ({})));
expectType<boolean>(match(v4, () => ({ 1: 'a' })));
expectType<boolean>(match(v4, () => ({ 1: 'a', 2: true })));
expectType<boolean>(match(v4, () => ({ some: [{ 0: 2 }] })));

expectError(match(v4, ['some', { 0: 1 }]));
expectError(match(v4, { some: [], every: [] }));
expectError(match(v4, { a: 1 }));

expectError(match(v4, () => ['some', { 0: 1 }]));
expectError(match(v4, () => ({ some: [], every: [] })));
expectError(match(v4, () => ({ a: 1 })));

const v5 = { a: 1 } as { a: number } | [number, number];

// expectType<boolean>(match(v5, { a: 5 }));
expectType<boolean>(match(v5, [5, 4]));
