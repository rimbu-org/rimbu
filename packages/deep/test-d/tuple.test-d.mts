import { expectError, expectType } from 'tsd';
import { Tuple } from '../src';

expectType<readonly [number, string]>(Tuple.of(1, 'a'));
expectType<readonly [number, string, boolean]>(Tuple.of(1, 'a', true));
expectError(Tuple.of());

const tuple = Tuple.of(1, 'a', true);

expectType<number>(Tuple.getIndex(tuple, 0));
expectType<boolean>(Tuple.getIndex(tuple, 2));
expectType<undefined>(Tuple.getIndex(tuple, 3));

expectType<number>(Tuple.first(tuple));

expectType<string>(Tuple.second(tuple));

expectType<boolean>(Tuple.last(tuple));

expectType<typeof tuple>(Tuple.updateAt(tuple, 1, 'b'));

expectType<readonly [...typeof tuple, number, boolean]>(
  Tuple.append(tuple, 1, true)
);

expectType<readonly [...typeof tuple, ...typeof tuple]>(
  Tuple.concat(tuple, tuple)
);

expectType<readonly [number, string]>(Tuple.init(tuple));

expectType<readonly [string, boolean]>(Tuple.tail(tuple));

expectType<readonly [string, boolean, number]>(
  Tuple.append(Tuple.of('a', true), 5)
);

expectType<readonly [number, string]>(Tuple.updateAt(Tuple.of(1, 'a'), 1, 'b'));
