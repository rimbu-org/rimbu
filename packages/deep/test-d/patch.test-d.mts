import { expectError, expectType } from 'tsd';
import { Tuple, patch } from '../src';

const num = 1 as number;
const str = 'b' as string;
const bool = false as boolean;

expectType<undefined>(patch(undefined, undefined));
expectType<null>(patch(null, null));
expectType<number>(patch(num, 2));
expectType<boolean>(patch(bool, false));
expectType<string>(patch(str, 'b'));
expectType<symbol>(patch(Symbol(), Symbol()));

expectType<undefined>(patch(undefined, () => undefined));
expectType<null>(patch(null, () => null));
expectType<number>(patch(num, () => 2));
expectType<boolean>(patch(bool, () => false));
expectType<string>(patch(str, () => 'b'));
expectType<symbol>(patch(Symbol(), () => Symbol()));

expectType<undefined>(patch(undefined, (v) => v));
expectType<null>(patch(null, (v) => v));
expectType<number>(patch(num, (v) => v));
expectType<boolean>(patch(bool, (v) => v));
expectType<boolean>(patch(bool, (v) => !v));
expectType<string>(patch(str, (v) => v));
expectType<symbol>(patch(Symbol(), (v) => v));

expectError(patch(undefined, null));
expectError(patch(null, undefined));
expectError(patch(1, true));
expectError(patch(true, 1));
expectError(patch('a', true));
expectError(patch(Symbol(), 'a'));

expectError(patch(1, [2]));
expectError(patch(true, [false]));
expectError(patch('a', ['b']));
expectError(patch(Symbol(), [Symbol()]));

expectError(patch(1, () => true));
expectError(patch(true, () => 1));
expectError(patch('a', () => true));
expectError(patch(Symbol(), () => 'a'));

type NU = number | undefined;

expectType<NU>(patch(1 as NU, 2));
expectType<NU>(patch(1 as NU, undefined));

expectType<NU>(patch(1 as NU, () => 2));
expectType<NU>(patch(1 as NU, () => undefined));
expectType<NU>(patch(1 as NU, (v) => (v ?? 1) + 1));

type NN = number | null;

expectType<NN>(patch(1 as NN, 2));
expectType<NN>(patch(1 as NN, null));

expectType<NN>(patch(1 as NN, () => 2));
expectType<NN>(patch(1 as NN, () => null));
expectType<NN>(patch(1 as NN, (v) => (v ?? 1) + 1));

type AN = { a: number } | null;

expectType<AN>(patch(null as AN, null));
expectType<AN>(patch(null as AN, { a: 3 }));
expectType<AN>(patch({ a: 3 } as AN, null));

expectType<AN>(patch(null as AN, () => null));
expectType<AN>(patch(null as AN, () => ({ a: 3 })));
expectType<AN>(patch({ a: 3 } as AN, () => null));

expectError(patch(null as AN, [{ a: 1 }]));
expectError(patch(null as AN, [{}]));

expectError(patch(null as AN, () => [{ a: 1 }]));
expectError(patch(null as AN, () => [{}]));

type AU = { a: number } | undefined;

expectType<AU>(patch(undefined as AU, undefined));
expectType<AU>(patch(undefined as AU, { a: 3 }));
expectType<AU>(patch({ a: 3 } as AU, undefined));

expectType<AU>(patch(undefined as AU, () => undefined));
expectType<AU>(patch(undefined as AU, () => ({ a: 3 })));
expectType<AU>(patch({ a: 3 } as AU, () => undefined));

expectError(patch(undefined as AU, [{ a: 1 }]));
expectError(patch(undefined as AU, [{}]));

expectError(patch(undefined as AU, () => [{ a: 1 }]));
expectError(patch(undefined as AU, () => [{}]));

const v = { a: 1, b: { c: 'a', d: true } };
type V = typeof v;

expectType<V>(patch(v, v));
expectType<V>(patch(v, [v]));
expectType<V>(patch(v, [{}]));
expectType<V>(patch(v, [{ a: 2 }]));
expectType<V>(patch(v, [{ a: 2 }, { a: (v) => v + 1 }]));
expectType<V>(patch(v, [{ a: () => 2 }]));
expectType<V>(patch(v, [{ a: (v) => v }]));
expectType<V>(patch(v, [{ a: (v) => v, b: [{ c: 'b' }] }]));

expectType<V>(patch(v, () => v));
expectType<V>(patch(v, () => [v]));
expectType<V>(patch(v, () => [{}]));
expectType<V>(patch(v, () => [{ a: 2 }]));
expectType<V>(patch(v, () => [{ a: 2 }, { a: (v) => v + 1 }]));
expectType<V>(patch(v, () => [{ a: () => 2 }]));
expectType<V>(patch(v, () => [{ a: (v) => v }]));
expectType<V>(patch(v, () => [{ a: (v) => v, b: [{ c: 'b' }] }]));

expectType<V>(patch(v, [{ b: { c: 'b', d: false } }]));
expectType<V>(patch(v, [{ b: [{ c: 'b', d: false }] }]));
expectType<V>(patch(v, [{ b: [{ c: 'b' }] }]));
expectType<V>(patch(v, [{ b: [{ d: (v) => !v }] }]));

expectError(patch(v, [{ a: 2, q: 1 }]));
expectError(patch(v, () => [{ a: 2, q: 1 }]));

const t = { a: 1, b: Tuple.of(true, 'a', { x: 1, y: 2 }) };
type T = typeof t;

expectType<T>(patch(t, t));
expectType<T>(patch(t, t));
expectType<T>(patch(t, [{ b: Tuple.of(false, 'b', { x: 0, y: 0 }) }]));
expectType<T>(patch(t, [{ b: {} }]));
expectType<T>(patch(t, [{ b: { 0: true } }]));
expectType<T>(patch(t, [{ b: { 1: 'c' } }]));
expectType<T>(patch(t, [{ b: { 0: true, 1: 'c' } }]));
expectType<T>(patch(t, [{ b: { 0: (v) => !v } }]));
expectType<T>(patch(t, [{ b: { 2: { x: 2, y: 2 } } }]));
// expectType<T>(patch(t, [{ b: { 2: [{ y: 2 }] } }]));
// expectType<T>(patch(t, [{ b: { 2: [{ y: (v, p) => v + p.x }] } }]));

expectError(patch(t, [{ b: [] }]));
expectError(patch(t, [{ b: Tuple.of(1, 'b') }]));
expectError(patch(t, [{ b: { 3: 1 } }]));
expectError(patch(t, [{ b: { 0: 1 } }]));
expectError(patch(t, [{ b: { 0: () => 1 } }]));
expectError(patch(t, [{ b: { 2: { x: 1 } } }]));
expectError(patch(t, [{ b: { 2: [{ z: 1 }] } }]));

const arr = [1, 2, 3];
expectType<number[]>(patch(arr, arr));
expectType<number[]>(patch(arr, []));
expectType<number[]>(patch(arr, [1, 2]));
expectType<number[]>(patch(arr, () => [1, 2, 3]));
expectType<number[]>(patch(arr, (v) => v));

expectError(patch(arr, [[]]));
expectError(patch(arr, ['a']));
expectError(patch(arr, { 0: 2 }));
expectError(patch(arr, [{ 0: 2 }]));
// expectError(
//   patch(arr, (v) => {
//     v[0] = 3;
//     return v;
//   })
// );

const s = new Set([1, 2]);
type S = typeof s;

expectType<S>(patch(s, s));
expectType<S>(patch(s, (s) => s));

expectError(patch(s, { size: 3 }));
expectError(patch(s, [{ size: 3 }]));
expectError(patch(s, () => ({ size: 3 })));
expectError(patch(s, () => [{ size: 3 }]));

const n = { a: { b: { c: 5 } } };
type N = typeof n;

expectType<N>(patch(n, (v, p, r) => v));
expectType<N>(patch(n, (v, p, r) => p));
expectType<N>(patch(n, (v, p, r) => r));

expectType<N>(patch(n, [{ a: (v, p, r) => v }]));
expectType<N>(patch(n, [{ a: (v, p, r) => p.a }]));
expectType<N>(patch(n, [{ a: (v, p, r) => r.a }]));

expectType<N>(patch(n, [{ a: [{ b: (v, p, r) => v }] }]));
expectType<N>(patch(n, [{ a: [{ b: (v, p, r) => p.b }] }]));
expectType<N>(patch(n, [{ a: [{ b: (v, p, r) => r.a.b }] }]));

expectType<() => 5>(
  patch(
    () => 5,
    () => 5
  )
);
expectError(
  patch(
    () => 5,
    () => () => 5
  )
);

expectType<{ a: () => number }>(
  patch({ a: () => 5 as number }, { a: () => 6 })
);
expectError<{ readonly a: () => number }>(
  patch({ a: () => 5 as number }, { a: () => () => 6 })
);

expectType<readonly [number, string]>(patch(Tuple.of(1, 'a'), [2, 'b']));
expectError(patch(Tuple.of(1, 'a'), [1]));
expectError(patch(Tuple.of(1, 'a'), [2, 'b', true]));
expectError(patch(Tuple.of(1, 2), [1, 2, 3]));

expectType<{ a: number | undefined; b: number }>(
  patch({ a: 1, b: 1 } as { a: number | undefined; b: number }, [
    { a: undefined },
  ])
);
expectType<{ a?: number | undefined; b: number }>(
  patch({ a: 1, b: 1 } as { a?: number | undefined; b: number }, [
    { a: undefined },
  ])
);

// tsd does not yet catch "exactOptionalPropertyTypes" errors

// expectError(
//   patch({ a: 1, b: 1 } as { a?: number; b: number }, [{ a: undefined }])
// );
// expectError(patch({ a: 1 }, [{ a: undefined }]));
