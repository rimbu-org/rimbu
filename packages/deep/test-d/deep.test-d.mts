import type { List } from '@rimbu/list';
import { expectError, expectType } from 'tsd';
import { Deep } from '../src';

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

expectType<number>(Deep.getAt(m, 'a'));

expectType<M>(Deep.patch(m, [{ a: 3 }]));

expectType<M>(Deep.patchAt(m, 'c', [{ d: true }]));
expectType<M>(Deep.patchAt(m, 'c.d', (v) => !v));

expectType<boolean>(Deep.match(m, { a: 2 }));

expectType<boolean>(Deep.matchAt(m, 'a', 1));

expectType<{ readonly q: boolean }>(Deep.select(m, { q: 'c.d' }));

expectType<{ readonly q: boolean }>(Deep.selectAt(m, 'c', { q: 'd' }));

expectType<number[]>([m].map(Deep.getAtWith('a')));

expectType<M[]>([m].map(Deep.patchWith(() => [{ a: 2 }])));

expectType<M[]>([m].map(Deep.patchAtWith('c', [{ d: true }])));
expectType<M[]>([m].map(Deep.patchAtWith('c', () => [{ d: true }])));
expectType<M[]>([m].map(Deep.patchAtWith('c.d', (v) => !v)));

expectType<boolean[]>([m].map(Deep.matchWith({ a: 2 })));
expectType<boolean[]>([m].map(Deep.matchAtWith('a', 2)));

expectType<{ readonly q: boolean }[]>([m].map(Deep.selectWith({ q: 'c.d' })));
expectType<{ readonly q: boolean }[]>(
  [m].map(Deep.selectAtWith('c', { q: 'd' }))
);

expectError([m].map(Deep.patchWith(() => [{ a: 2, z: 1 }])));

const wt = Deep.withType<M>();

expectType<number>(wt.getAtWith('a')(m));

expectType<M>(wt.patchWith([{ a: 2 }])(m));

expectType<M>(wt.patchAtWith('c', [{ d: true }])(m));
expectType<M>(wt.patchAtWith('c.d', (v) => !v)(m));

expectType<boolean>(wt.matchWith({ a: 3 })(m));

expectType<boolean>(wt.matchAtWith('c', { d: true })(m));

expectType<{ readonly q: boolean }[]>([m].map(wt.selectWith({ q: 'c.d' })));

expectType<{ readonly q: boolean }[]>(
  [m].map(wt.selectAtWith('c', { q: 'd' }))
);

const person = {
  name: 'Alice',
  age: 34,
  address: {
    street: 'Random street',
    number: 45,
  },
  friends: ['Bob', 'Carol'],
};

type Person = typeof person;

expectType<Person>(
  Deep.patch(person, [
    {
      address: [{ street: 'ABC' }],
    },
    {
      name: 'James',
    },
  ])
);

expectType<Person>(
  Deep.patchAt(person, 'address', [{ street: 'ABC' }, { number: 34 }])
);

expectType<Person[]>(
  [person].map(Deep.patchAtWith('address', [{ street: 'ABC' }, { number: 34 }]))
);

expectType<Person[]>(
  [person].map(
    Deep.patchWith([{ name: 'James' }, { address: [{ street: 'ABC' }] }])
  )
);

const personUpdate1 = Deep.withType<Person>().patchWith([
  { name: 'James' },
  { address: [{ street: 'ABC' }] },
]);
expectType<Person>(personUpdate1(person));

const personUpdate2 = Deep.withType<Person>().patchAtWith('address', [
  { street: 'ABC' },
  { number: 34 },
]);
expectType<Person>(personUpdate2(person));
