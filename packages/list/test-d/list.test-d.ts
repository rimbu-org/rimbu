import type { ArrayNonEmpty } from '@rimbu/common';
import type { FastIterator, Stream } from '@rimbu/stream';
import {
  expectAssignable,
  expectError,
  expectNotAssignable,
  expectType,
} from 'tsd';
import { List } from '../src';

expectAssignable<List<number>>(List.of(1));
expectNotAssignable<List.NonEmpty<number>>(List.empty<number>());

// Fast Iterator
expectType<FastIterator<number>>(List.empty<number>()[Symbol.iterator]());
expectType<FastIterator<number>>(List.of(1)[Symbol.iterator]());

// List.builder()
expectType<List.Builder<number>>(List.builder<number>());

// List.createContext()
expectType<List.Context>(List.createContext());

// List.defaultContext()
expectType<List.Context>(List.defaultContext());

// List.empty()
expectType<List<number>>(List.empty<number>());

// List.from(..)
expectType<List<number>>(List.from([] as number[]));
expectType<List.NonEmpty<number>>(List.from([1]));
expectType<List.NonEmpty<number>>(List.from([1], [2]));
expectType<List<number>>(List.from(new Set([1])));
// TODO
// expectType<List.NonEmpty<number>>(List.from([] as number[], [1]));

// List.of(..)
expectType<List.NonEmpty<number>>(List.of(1));
expectType<List.NonEmpty<number>>(List.of(1, 2, 3));

// .append(..)
expectType<List.NonEmpty<number>>(List.empty<number>().append(2));
expectType<List.NonEmpty<number>>(List.of(1).append(2));

// .assumeNonEmpty()
expectType<List.NonEmpty<number>>(List.empty<number>().assumeNonEmpty());
expectType<List.NonEmpty<number>>(List.of(1).assumeNonEmpty());

// .collect(..)
expectType<List<string>>(List.empty<number>().collect(() => 'a'));
expectType<List<string>>(List.of(1).collect(() => 'a'));

// .concat(..)
expectType<List<number>>(List.empty<number>().concat(List.empty<number>()));
expectType<List.NonEmpty<number>>(List.empty<number>().concat(List.of(1)));
expectType<List.NonEmpty<number>>(List.of(1).concat(List.empty<number>()));
expectType<List.NonEmpty<number>>(List.of(1).concat(List.of(1)));
// TODO
// expectType<List.NonEmpty<number>>(List.empty<number>().concat(List.empty<number>(), List.of(1)));

// .drop(..)
expectType<List<number>>(List.empty<number>().drop(3));
expectType<List<number>>(List.of(1).drop(3));

// .extendType()
expectType<List<never>>(List.empty<number>().extendType<string>());
expectType<List<number | string>>(
  List.empty<number>().extendType<number | string>()
);
expectType<List.NonEmpty<never>>(List.of(1, 2).extendType<string>());
expectType<List.NonEmpty<number | string>>(
  List.of(1, 2).extendType<number | string>()
);

// .filter(..)
expectType<List<number>>(List.empty<number>().filter(() => true));
expectType<List<number>>(List.of(1).filter(() => true));

// .first(..)
expectType<number | undefined>(List.empty<number>().first());
expectError(List.of(1).first(3));
expectType<number>(List.empty<number>().first(3));
expectType<number>(List.of(1).first());
expectType<number | string>(List.empty<number>().first('a' as string));
expectType<number | string>(List.empty<number>().first(() => 'a'));

// .flatMap(..)
expectType<List<string>>(
  List.empty<number>().flatMap(() => List.empty<string>())
);
expectType<List<string>>(List.empty<number>().flatMap(() => List.of('a')));
expectType<List<string>>(List.of(1).flatMap(() => List.empty<string>()));
expectType<List.NonEmpty<string>>(List.of(1).flatMap(() => List.of('a')));
expectType<List<string>>(
  List.of(1).flatMap(() => List.of('a'), { amount: 10 })
);

// .flatten()
expectType<never>(List.empty<number>().flatten());
expectType<List.NonEmpty<number>>(List.of(List.of(1)).flatten());
expectType<List<number>>(List.of(List.empty<number>()).flatten());
expectType<List<number>>(List.of(List.of(1)).asNormal().flatten());
expectType<List.NonEmpty<number>>(List.of(List.from([1, 2])).flatten());
expectType<List<string>>(List.of('abc').flatten());

// .get(..)
expectType<number | undefined>(List.of(1).get(3));
expectType<number | undefined>(List.empty<number>().get(3));
expectType<number>(List.empty<number>().get(2, 3));
expectType<number>(List.of(1).get(2, 3));
expectType<number>(List.empty<number>().get(2, () => 3));
expectType<number>(List.of(1).get(2, () => 3));
expectType<number | string>(List.empty<number>().get(2, 'a' as string));
expectType<number | string>(List.of(1).get(2, 'a' as string));

// .insert(..)
expectType<List<number>>(List.empty<number>().insert(1, List.empty<number>()));
expectType<List.NonEmpty<number>>(List.empty<number>().insert(1, List.of(1)));
expectType<List.NonEmpty<number>>(List.of(1).insert(1, List.empty<number>()));
expectType<List.NonEmpty<number>>(List.of(1).insert(1, List.of(2)));

// .isEmpty
expectType<boolean>(List.empty<number>().isEmpty);
expectType<false>(List.of(1).isEmpty);

// .last(..)
expectType<number | undefined>(List.empty<number>().last());
expectError(List.of(1).last(3));
expectType<number>(List.empty<number>().last(3));
expectType<number>(List.of(1).last());
expectType<number | string>(List.empty<number>().last('a' as string));
expectType<number | string>(List.empty<number>().last(() => 'a'));

// .map(..)
expectType<List<string>>(List.empty<number>().map(() => 'a'));
expectType<List.NonEmpty<string>>(List.of(1).map(() => 'a'));

// .nonEmpty()
expectType<boolean>(List.empty<number>().nonEmpty());
expectType<true>(List.of(1).nonEmpty());

// .padTo(..)
expectType<List<number>>(List.empty<number>().padTo(1, 3));
expectType<List.NonEmpty<number>>(List.of(1).padTo(1, 3));

// .prepend(..)
expectType<List.NonEmpty<number>>(List.empty<number>().prepend(2));
expectType<List.NonEmpty<number>>(List.of(1).prepend(2));

// .remove(..)
expectType<List<number>>(List.empty<number>().remove(3));
expectType<List<number>>(List.of(1).remove(3));
expectType<List<number>>(List.empty<number>().remove(3, 3));
expectType<List<number>>(List.of(1).remove(3, 3));

// .repeat(..)
expectType<List<number>>(List.empty<number>().repeat(3));
expectType<List.NonEmpty<number>>(List.of(1).repeat(3));

// .reversed()
expectType<List<number>>(List.empty<number>().reversed());
expectType<List.NonEmpty<number>>(List.of(1).reversed());

// .rotate(..)
expectType<List<number>>(List.empty<number>().rotate(2));
expectType<List.NonEmpty<number>>(List.of(1).rotate(2));

// .slice(..)
expectType<List<number>>(List.empty<number>().slice({ amount: 2 }));
expectType<List<number>>(List.of(1).slice({ amount: 2 }));

// .splice(..)
expectType<List<number>>(
  List.empty<number>().splice({
    index: 1,
    remove: 2,
    insert: List.empty<number>(),
  })
);
expectType<List<number>>(
  List.of(1).splice({ index: 1, remove: 2, insert: List.empty<number>() })
);

expectType<List.NonEmpty<number>>(
  List.empty<number>().splice({ index: 1, remove: 2, insert: List.of(1) })
);
expectType<List.NonEmpty<number>>(
  List.of(1).splice({ index: 1, remove: 2, insert: List.of(1) })
);

// .stream()
expectType<Stream<number>>(List.empty<number>().stream());
expectType<Stream.NonEmpty<number>>(List.of(1).stream());

// .streamRange(..)
expectType<Stream<number>>(List.empty<number>().streamRange({ amount: 10 }));
expectType<Stream<number>>(List.of(1).streamRange({ amount: 10 }));

// .take(..)
expectType<List<number>>(List.empty<number>().take(2));
expectType<List<number>>(List.of(1).take(0));
expectType<List<number>>(List.of(1).take(2 as number));
expectType<List.NonEmpty<number>>(List.of(1).take(2));

// .toArray()
expectType<number[]>(List.empty<number>().toArray());
expectType<ArrayNonEmpty<number>>(List.of(1).toArray());

// .toBuilder()
expectType<List.Builder<number>>(List.empty<number>().toBuilder());
expectType<List.Builder<number>>(List.of(1).toBuilder());

// .unzip(..)
expectType<[List<number>, List<string>]>(
  List.empty<[number, string]>().unzip(2)
);
expectType<[List.NonEmpty<number>, List.NonEmpty<string>]>(
  List.of([1, 'a'] as [number, string]).unzip(2)
);
expectType<
  [List.NonEmpty<number>, List.NonEmpty<string>, List.NonEmpty<boolean>]
>(List.of([1, 'a', true] as [number, string, boolean]).unzip(3));

// .updateAt(..)
expectType<List<number>>(List.empty<number>().updateAt(1, (v) => v + 1));
expectType<List.NonEmpty<number>>(List.of(1).updateAt(1, (v) => v + 1));

// From Builder
expectType<List<number>>(List.of(1).toBuilder().build());
