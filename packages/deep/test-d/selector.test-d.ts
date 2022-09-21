import { expectError, expectType } from 'tsd';
import { select, Tuple } from '../src';

const m = {
  a: 1,
  b: { c: true },
  d: Tuple.of(1, true),
};

expectType<number>(select(m, 'a'));
expectType<number>(select(m, (v) => v.a));
expectType<{ c: boolean }>(select(m, 'b'));
expectType<boolean>(select(m, 'b.c'));
expectType<number>(select(m, 'd[0]'));
expectType<boolean>(select(m, 'd[1]'));

expectError(select(m, 'q'));
expectError(select(m, 'd[2]'));

expectType<{ readonly q: number }>(select(m, { q: 'a' }));
expectType<{ readonly q: { c: boolean } }>(select(m, { q: 'b' }));
expectType<{ readonly q: boolean }>(select(m, { q: 'b.c' }));
expectType<{ readonly q: number }>(select(m, { q: 'd[0]' }));
expectType<{ readonly q: boolean }>(select(m, { q: 'd[1]' }));
select(m, ['a', 'b']);

// for some reason, this seems to work in other locations, but not here
// expectType<readonly [number, { c: boolean }]>(select(m, ['a', 'b']));
expectType<readonly [number, { c: boolean }]>(select(m, ['a', 'b'] as const));

// for some reason, this seems to work in other locations, but not here
// expectType<readonly [{ readonly q: number }, { c: boolean }]>(
//   select(m, [{ q: 'a' }, 'b'])
// );
expectType<readonly [{ readonly q: number }, { c: boolean }]>(
  select(m, [{ q: 'a' }, 'b'] as const)
);

expectType<{ readonly q: { c: boolean } }>(select(m, { q: 'b' }));
expectType<{ readonly q: boolean }>(select(m, { q: 'b.c' }));
expectType<{ readonly q: number }>(select(m, { q: 'd[0]' }));
expectType<{ readonly q: boolean }>(select(m, { q: 'd[1]' }));
