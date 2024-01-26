import { type ArrayNonEmpty } from '@rimbu/common';

import {
  expectAssignable,
  expectError,
  expectNotAssignable,
  expectNotType,
  expectType,
} from 'tsd';

import {
  AsyncReducer,
  AsyncStream,
  AsyncTransformer,
  type AsyncFastIterator,
} from '../src/async/index.mjs';
import type { Stream } from '../src/main/index.mjs';

// Variance
expectAssignable<AsyncStream<number | string>>(AsyncStream.empty<number>());
expectNotAssignable<AsyncStream<number>>(AsyncStream.empty<number | string>());

expectAssignable<AsyncStream<number | string>>(AsyncStream.of(1));
expectNotAssignable<AsyncStream<number>>(AsyncStream.of<number | string>(1));

expectAssignable<AsyncStream.NonEmpty<number | string>>(AsyncStream.of(1));

// Iterable
expectType<AsyncFastIterator<number>>(
  AsyncStream.empty<number>()[Symbol.asyncIterator]()
);
expectType<AsyncFastIterator<number>>(
  AsyncStream.of(1)[Symbol.asyncIterator]()
);

// AsyncStream.empty<T>()
expectType<AsyncStream<number>>(AsyncStream.empty<number>());
expectType<AsyncStream<string>>(AsyncStream.empty<string>());
expectNotType<AsyncStream.NonEmpty<number>>(AsyncStream.empty<number>());
expectNotAssignable<AsyncStream.NonEmpty<number>>(AsyncStream.empty<number>());

// AsyncStream.of<T>(..)
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.of(1));
expectAssignable<AsyncStream<number>>(AsyncStream.of(1));
// expectError(AsyncStream.of());

// AsyncStream.from<T>(..)
expectType<AsyncStream<number>>(AsyncStream.from([] as number[]));
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.from([1]));
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.from([1, 2, 3]));
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.from(AsyncStream.of(1)));
expectType<AsyncStream<number>>(AsyncStream.from(new Set([1])));
// expectError(AsyncStream.from());

// AsyncStream.flatten<T>(..)
expectError(AsyncStream.flatten(AsyncStream.empty<number>()));
expectType<AsyncStream<number>>(
  AsyncStream.flatten(AsyncStream.empty<AsyncStream<number>>())
);
expectType<AsyncStream<number>>(
  AsyncStream.flatten(AsyncStream.empty<AsyncStream.NonEmpty<number>>())
);
expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.flatten(AsyncStream.of(AsyncStream.of(1)))
);

// AsyncStream.unfold(..)
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.unfold(0, (v) => v + 1));

// AsyncStream.unzip(..)
expectType<[AsyncStream.NonEmpty<number>, AsyncStream.NonEmpty<string>]>(
  AsyncStream.unzip(AsyncStream.of<[number, string]>([0, 'a'], [1, 'b']), {
    length: 2,
  })
);
expectType<[AsyncStream<number>, AsyncStream<string>]>(
  AsyncStream.unzip(AsyncStream.from(new Map<number, string>()), { length: 2 })
);
expectError(AsyncStream.unzip(AsyncStream.of(1), { length: 2 }));
expectError(AsyncStream.unzip(AsyncStream.of([1, 2] as const), { length: 3 }));

// AsyncStream.zip
expectType<AsyncStream<[number, string]>>(
  AsyncStream.zip(AsyncStream.empty<number>(), AsyncStream.empty<string>())
);
expectType<AsyncStream<[number, string]>>(
  AsyncStream.zip(AsyncStream.of(1), AsyncStream.empty<string>())
);
expectType<AsyncStream<[number, string]>>(
  AsyncStream.zip(AsyncStream.empty<number>(), AsyncStream.of('a'))
);
expectType<AsyncStream.NonEmpty<[number, string]>>(
  AsyncStream.zip(AsyncStream.of(1), AsyncStream.of('a'))
);
expectType<AsyncStream<[number, string, boolean]>>(
  AsyncStream.zip(
    AsyncStream.empty<number>(),
    AsyncStream.of('a'),
    AsyncStream.of(true, false)
  )
);
expectType<AsyncStream.NonEmpty<[number, string, boolean]>>(
  AsyncStream.zip(
    AsyncStream.of(1),
    AsyncStream.of('a'),
    AsyncStream.of(true, false)
  )
);

expectType<AsyncStream.NonEmpty<[number]>>(AsyncStream.zip(AsyncStream.of(1)));

expectError(AsyncStream.zip());

// AsyncStream.zipAll(..)
expectType<AsyncStream<[number | boolean, string | boolean]>>(
  AsyncStream.zipAll(
    true,
    AsyncStream.empty<number>(),
    AsyncStream.empty<string>()
  )
);
expectType<AsyncStream.NonEmpty<[number | boolean, string | boolean]>>(
  AsyncStream.zipAll(true, AsyncStream.of(1), AsyncStream.of('a'))
);

expectType<AsyncStream.NonEmpty<[number | boolean]>>(
  AsyncStream.zipAll(true, AsyncStream.of(1))
);
expectError(AsyncStream.zipAll(true));

// TODO
// expectType<AsyncStream.NonEmpty<[number | boolean, string | boolean]>>(
//   AsyncStream.zipAll(true, AsyncStream.empty<number>(), AsyncStream.of('a'))
// );

expectError(AsyncStream.zipAll(true));

// // AsyncStream.zipWith(..)
expectType<AsyncStream<[number, true, string]>>(
  AsyncStream.zipWith(
    AsyncStream.empty<number>(),
    AsyncStream.empty<string>()
  )((a, b) => [a, true, b])
);
expectType<AsyncStream<[number, true, string]>>(
  AsyncStream.zipWith(
    AsyncStream.of(1),
    AsyncStream.empty<string>()
  )((a, b) => [a, true, b])
);
expectType<AsyncStream<[number, true, string]>>(
  AsyncStream.zipWith(
    AsyncStream.empty<number>(),
    AsyncStream.of('a')
  )((a, b) => [a, true, b])
);
expectType<AsyncStream.NonEmpty<[number, true, string]>>(
  AsyncStream.zipWith(
    AsyncStream.of(1),
    AsyncStream.of('a')
  )((a, b) => [a, true, b])
);

expectType<AsyncStream.NonEmpty<[number]>>(
  AsyncStream.zipWith(AsyncStream.of(1))((a) => [a])
);

expectError(AsyncStream.zipWith());

// AsyncStream.zipAllWith()
expectType<AsyncStream<[number | boolean, true, string | boolean]>>(
  AsyncStream.zipAllWith(
    AsyncStream.empty<number>(),
    AsyncStream.empty<string>()
  )(true, (a, b) => [a, true, b])
);
expectType<AsyncStream.NonEmpty<[number | boolean, true, string | boolean]>>(
  AsyncStream.zipAllWith(AsyncStream.of(1), AsyncStream.of('a'))(
    true,
    (a, b) => [a, true, b]
  )
);
expectType<AsyncStream.NonEmpty<[number | boolean]>>(
  AsyncStream.zipAllWith(AsyncStream.of(1))(true, (a) => [a])
);

expectError(AsyncStream.zipAllWith());

// TODO
// expectType<AsyncStream.NonEmpty<[number | boolean, string | boolean]>>(
//   AsyncStream.zipAllWith(true, (a, b) => [a, true, b], AsyncStream.empty<number>(), AsyncStream.of('a'))
// );

// .assumeNonEmpty()
expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.empty<number>().assumeNonEmpty()
);
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.of(1).assumeNonEmpty());

// .append()
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.empty<number>().append(1));
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.of(1).append(1));
expectType<AsyncStream.NonEmpty<number | string>>(
  AsyncStream.empty<number | string>().append('a')
);
expectType<AsyncStream.NonEmpty<number | string>>(
  AsyncStream.of(1 as number | string).append('a')
);

// .count()
expectType<number>(await AsyncStream.empty<number>().count());
expectType<number>(await AsyncStream.of(1).count());

// .countElement(..)
expectType<number>(await AsyncStream.empty<number>().countElement(1));
expectType<number>(await AsyncStream.of(1).countElement(1));

// .countElement(..) negate
expectType<number>(
  await AsyncStream.empty<number>().countElement(1, { negate: true })
);
expectType<number>(await AsyncStream.of(1).countElement(1, { negate: true }));

// .contains(..)
expectType<boolean>(await AsyncStream.empty<number>().contains(1));
expectType<boolean>(await AsyncStream.of(1).contains(1));

// .containsSlice(..)
expectType<boolean>(await AsyncStream.empty<number>().containsSlice([1]));
expectType<boolean>(await AsyncStream.of(1).containsSlice([1]));

// .collect(..)
expectType<AsyncStream<string>>(AsyncStream.empty<number>().collect(() => ''));
expectType<AsyncStream<string>>(AsyncStream.of(1).collect(() => ''));

// .concat(..)
expectType<AsyncStream<number>>(
  AsyncStream.empty<number>().concat(AsyncStream.empty<number>())
);
expectType<AsyncStream<number>>(
  AsyncStream.empty<number>().concat(
    AsyncStream.empty<number>(),
    AsyncStream.empty<number>()
  )
);

expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.empty<number>().concat(AsyncStream.of(1))
);
expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.of(1).concat(AsyncStream.empty<number>())
);
expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.of(1).concat(AsyncStream.of(1))
);
expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.of(1).concat(AsyncStream.of(1), AsyncStream.of(1))
);

expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.of(1).concat(AsyncStream.of(1), AsyncStream.of(1))
);

// .drop(..)
expectType<AsyncStream<number>>(AsyncStream.empty<number>().drop(4));
expectType<AsyncStream<number>>(AsyncStream.of(1).drop(4));

// .dropWhile(..)
expectType<AsyncStream<number>>(
  AsyncStream.empty<number>().dropWhile(() => true)
);
expectType<AsyncStream<number>>(AsyncStream.of(1).dropWhile(() => true));

// .elementtAt(..)
expectType<number>(await AsyncStream.empty<number>().elementAt(1, 3));
expectType<number | string>(
  await AsyncStream.empty<number>().elementAt(1, '' as string)
);

expectType<number>(await AsyncStream.empty<number>().elementAt(1, () => 3));
expectType<number | string>(
  await AsyncStream.empty<number>().elementAt(1, () => '' as string)
);

// .filter(..)
expectType<AsyncStream<number>>(AsyncStream.empty<number>().filter(() => true));
expectType<AsyncStream<number>>(AsyncStream.of(1).filter(() => true));

// .filter(..) negate
expectType<AsyncStream<number>>(
  AsyncStream.empty<number>().filter(() => true, { negate: true })
);
expectType<AsyncStream<number>>(
  AsyncStream.of(1).filter(() => true, { negate: true })
);

// .filterPure(..)
expectType<AsyncStream<number>>(
  AsyncStream.empty<number>().filterPure({ pred: () => true })
);
expectType<AsyncStream<number>>(
  AsyncStream.of(1).filterPure({ pred: () => true })
);

// .filterPure(..) negate
expectType<AsyncStream<number>>(
  AsyncStream.empty<number>().filterPure({ pred: () => true, negate: true })
);
expectType<AsyncStream<number>>(
  AsyncStream.of(1).filterPure({ pred: () => true, negate: true })
);

// .find(..)
expectType<number | undefined>(
  await AsyncStream.empty<number>().find(() => true)
);
expectType<number | undefined>(
  await AsyncStream.empty<number>().find(() => true, { occurrance: 1 })
);
expectType<number | undefined>(await AsyncStream.of(1).find(() => true));
expectType<number | undefined>(
  await AsyncStream.of(1).find(() => true, { occurrance: 1 })
);
expectType<number>(
  await AsyncStream.empty<number>().find(() => true, { otherwise: () => 1 })
);
expectType<number>(
  await AsyncStream.of(1).find(() => true, { otherwise: () => 1 })
);
expectType<number | string>(
  await AsyncStream.empty<number>().find(() => true, {
    otherwise: 'a' as string,
  })
);
expectType<number | string>(
  await AsyncStream.of(1).find(() => true, { otherwise: 'a' as string })
);

// .first(..)
expectType<number | undefined>(await AsyncStream.empty<number>().first());
expectError(AsyncStream.of(1).first(3));

expectType<number>(await AsyncStream.empty<number>().first(1));
expectType<number>(await AsyncStream.of(1).first());
expectType<number | string>(
  await AsyncStream.empty<number>().first('a' as string)
);

// .forEach(..)
expectType<void>(await AsyncStream.empty<number>().forEach(() => {}));
expectType<void>(await AsyncStream.of(1).forEach(() => {}));

// .forEachPure(..)
expectType<void>(await AsyncStream.empty<number>().forEachPure(() => {}));
expectType<void>(await AsyncStream.of(1).forEachPure(() => {}));

// .flatMap(..)
expectType<AsyncStream<string>>(
  AsyncStream.empty<number>().flatMap(() => AsyncStream.empty<string>())
);
expectType<AsyncStream<string>>(
  AsyncStream.of(1).flatMap(() => AsyncStream.empty<string>())
);
expectType<AsyncStream<string>>(
  AsyncStream.of(1).flatMap(() => AsyncStream.empty<string>())
);
expectType<AsyncStream.NonEmpty<string>>(
  AsyncStream.of(1).flatMap(() => AsyncStream.of('a'))
);

// .flatZip(..)
expectType<AsyncStream<[number, string]>>(
  AsyncStream.empty<number>().flatZip((v) => [String(v)])
);
expectType<AsyncStream<[number, string]>>(
  AsyncStream.of(1).flatZip(() => AsyncStream.empty<string>())
);
expectType<AsyncStream.NonEmpty<[number, string]>>(
  AsyncStream.of(1).flatZip((v) => [String(v)])
);

// .transform(..)
expectType<AsyncStream<string>>(
  AsyncStream.empty<number>().transform(
    null as unknown as AsyncTransformer<number, string>
  )
);
expectType<AsyncStream<string>>(
  AsyncStream.empty<number>().transform(
    null as unknown as AsyncTransformer.NonEmpty<number, string>
  )
);
expectType<AsyncStream<string>>(
  AsyncStream.of(1).transform(
    null as unknown as AsyncTransformer<number, string>
  )
);
expectType<AsyncStream.NonEmpty<string>>(
  AsyncStream.of(1).transform(
    null as unknown as AsyncTransformer.NonEmpty<number, string>
  )
);
expectType<AsyncStream<string>>(
  AsyncStream.of(1).transform(
    null as unknown as AsyncReducer<number, Stream<string>>
  )
);
expectType<AsyncStream.NonEmpty<string>>(
  AsyncStream.of(1).transform(
    null as unknown as AsyncReducer<number, Stream.NonEmpty<string>>
  )
);

// .fold(..)
expectType<string>(
  await AsyncStream.empty<number>().fold('a', async () => 'b')
);
expectType<string>(await AsyncStream.of(1).fold('a', async () => 'b'));
expectType<string>(
  await AsyncStream.empty<number>().fold(
    async () => 'a',
    () => 'b'
  )
);
expectType<string>(
  await AsyncStream.of(1).fold(
    async () => 'a',
    () => 'b'
  )
);

// .foldStream(..)
expectType<AsyncStream<string>>(
  AsyncStream.empty<number>().foldStream('a', () => 'b')
);
expectType<AsyncStream.NonEmpty<string>>(
  AsyncStream.of(1).foldStream('a', () => 'b')
);

// .distinctPrevious(..)
expectType<AsyncStream<number>>(AsyncStream.empty<number>().distinctPrevious());
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.of(1).distinctPrevious());

// .indexed()
expectType<AsyncStream<[number, string]>>(
  AsyncStream.empty<string>().indexed()
);
expectType<AsyncStream.NonEmpty<[number, string]>>(
  AsyncStream.of('a').indexed()
);

// .indexOf(..)
expectType<number | undefined>(await AsyncStream.empty<string>().indexOf('b'));
expectType<number | undefined>(await AsyncStream.of('a').indexOf('b'));

// .indexOf(..)
expectType<number | undefined>(await AsyncStream.empty<string>().indexOf('b'));
expectType<number | undefined>(await AsyncStream.of('a').indexOf('b'));

// .indicesWhere(..)
expectType<AsyncStream<number>>(
  AsyncStream.empty<string>().indicesWhere(() => true)
);
expectType<AsyncStream<number>>(AsyncStream.of('a').indicesWhere(() => true));

// .indicesWhere(..)
expectType<AsyncStream<number>>(
  AsyncStream.empty<string>().indicesWhere(() => true)
);
expectType<AsyncStream<number>>(AsyncStream.of('a').indicesWhere(() => true));

// .intersperse(..)
expectType<AsyncStream<number>>(
  AsyncStream.empty<number>().intersperse(AsyncStream.empty<number>())
);
expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.of(1).intersperse(AsyncStream.empty<number>())
);
expectType<AsyncStream<number>>(
  AsyncStream.empty<number>().intersperse(AsyncStream.of(1))
);
expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.of(1).intersperse(AsyncStream.of(1))
);

// .last(..)
expectType<number | undefined>(await AsyncStream.empty<number>().last());
expectError(AsyncStream.of(1).last(3));

expectType<number>(await AsyncStream.empty<number>().last(3));
expectType<number>(await AsyncStream.empty<number>().last(() => 3));
expectType<number>(await AsyncStream.of(1).last());
expectType<number | string>(
  await AsyncStream.empty<number>().last('a' as string)
);

// .single(...)
expectType<number | undefined>(await AsyncStream.empty<number>().single());
expectType<number>(await AsyncStream.empty<number>().single(1));
expectType<number | string>(await AsyncStream.empty<number>().single('a'));
expectType<number | undefined>(await AsyncStream.of(1, 2, 3).single());
expectType<number>(await AsyncStream.of(1, 2, 3).single(1));
expectType<number | string>(await AsyncStream.of(1, 2, 3).single('a'));

// .map(..)
expectType<AsyncStream<string>>(AsyncStream.empty<number>().map(() => 'a'));
expectType<AsyncStream.NonEmpty<string>>(AsyncStream.of(1).map(() => 'a'));

// .mapPure(..)
expectType<AsyncStream<string>>(AsyncStream.empty<number>().mapPure(() => 'a'));
expectType<AsyncStream.NonEmpty<string>>(AsyncStream.of(1).mapPure(() => 'a'));

// .some(..)
expectType<boolean>(await AsyncStream.empty<number>().some(() => true));
expectType<boolean>(await AsyncStream.of(1).some(() => true));

// .every(..)
expectType<boolean>(await AsyncStream.empty<number>().every(() => true));
expectType<boolean>(await AsyncStream.of(1).every(() => true));

// .max(..)
expectType<number | undefined>(await AsyncStream.empty<number>().max());
expectError(AsyncStream.of(1).max(3));

expectType<number>(await AsyncStream.empty<number>().max(3));
expectType<number>(await AsyncStream.empty<number>().max(() => 3));
expectType<number>(await AsyncStream.of(1).max());
expectType<number | string>(
  await AsyncStream.empty<number>().max('a' as string)
);

// .min(..)
expectType<number | undefined>(await AsyncStream.empty<number>().min());
expectError(AsyncStream.of(1).min(3));

expectType<number>(await AsyncStream.empty<number>().min(3));
expectType<number>(await AsyncStream.empty<number>().min(() => 3));
expectType<number>(await AsyncStream.of(1).min());
expectType<number | string>(
  await AsyncStream.empty<number>().min('a' as string)
);

// .maxBy(..)
expectType<number>(await AsyncStream.empty<number>().maxBy(() => 0, 3));
expectType<number>(
  await AsyncStream.empty<number>().maxBy(
    () => 0,
    () => 3
  )
);
expectType<number>(await AsyncStream.of(1).maxBy(() => 0));
expectType<number | string>(
  await AsyncStream.empty<number>().maxBy(() => 0, 'a' as string)
);

// .minBy(..)
expectType<number>(await AsyncStream.empty<number>().minBy(() => 0, 3));
expectType<number>(
  await AsyncStream.empty<number>().minBy(
    () => 0,
    () => 3
  )
);
expectType<number>(await AsyncStream.of(1).minBy(() => 0));
expectType<number | string>(
  await AsyncStream.empty<number>().minBy(() => 0, 'a' as string)
);

// .mkGroup(..)
expectType<AsyncStream<number>>(AsyncStream.empty<number>().mkGroup({}));
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.of(1).mkGroup({}));

expectType<AsyncStream<number>>(
  AsyncStream.empty<number>().mkGroup({ start: AsyncStream.empty<number>() })
);
expectType<AsyncStream<number>>(
  AsyncStream.empty<number>().mkGroup({ sep: AsyncStream.empty<number>() })
);
expectType<AsyncStream<number>>(
  AsyncStream.empty<number>().mkGroup({ end: AsyncStream.empty<number>() })
);

expectType<AsyncStream<number>>(
  AsyncStream.empty<number>().mkGroup({ sep: AsyncStream.of(1) })
);

// TODO
// expectType<AsyncStream.NonEmpty<number>>(
//   AsyncStream.empty<number>().mkGroup({ start: AsyncStream.of(1) })
// );
// expectType<AsyncStream.NonEmpty<number>>(
//   AsyncStream.empty<number>().mkGroup({ end: AsyncStream.of(1) })
// );

expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.of(1).mkGroup({ start: AsyncStream.empty<number>() })
);
expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.of(1).mkGroup({ sep: AsyncStream.empty<number>() })
);
expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.of(1).mkGroup({ end: AsyncStream.empty<number>() })
);

expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.of(1).mkGroup({ start: AsyncStream.of(1) })
);
expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.of(1).mkGroup({ sep: AsyncStream.of(1) })
);
expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.of(1).mkGroup({ end: AsyncStream.of(1) })
);

// .prepend(..)
expectType<AsyncStream.NonEmpty<number>>(
  AsyncStream.empty<number>().prepend(3)
);
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.of(1).prepend(3));

// .join(..)
expectType<string>(await AsyncStream.empty<number>().join());
expectType<string>(await AsyncStream.of(1, 2, 3).join());

// .reduce(..)
expectType<boolean>(
  await AsyncStream.empty<number>().reduce(AsyncReducer.isEmpty)
);
expectType<boolean>(await AsyncStream.of(1).reduce(AsyncReducer.isEmpty));

// .reduce(..) shape
expectType<[boolean, number, string]>(
  await AsyncStream.empty<number>().reduce([
    AsyncReducer.isEmpty,
    AsyncReducer.sum,
    AsyncReducer.join<number>(),
  ])
);
expectType<[boolean, number, string]>(
  await AsyncStream.of(1).reduce([
    AsyncReducer.isEmpty,
    AsyncReducer.sum,
    AsyncReducer.join<number>(),
  ])
);

// .reduceStream(..) shape
expectType<AsyncStream<[boolean, number, string]>>(
  AsyncStream.empty<number>().reduceStream([
    AsyncReducer.isEmpty,
    AsyncReducer.sum,
    AsyncReducer.join<number>(),
  ])
);
expectType<AsyncStream<[boolean, number, string]>>(
  AsyncStream.of(1).reduceStream([
    AsyncReducer.isEmpty,
    AsyncReducer.sum,
    AsyncReducer.join<number>(),
  ])
);

// .reduceStream(..)
expectType<AsyncStream<boolean>>(
  AsyncStream.empty<number>().reduceStream(AsyncReducer.isEmpty)
);
expectType<AsyncStream<boolean>>(
  AsyncStream.of(1).reduceStream(AsyncReducer.isEmpty)
);

// .repeat(..)
expectType<AsyncStream<number>>(AsyncStream.empty<number>().repeat());
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.of(1).repeat());
expectType<AsyncStream<number>>(AsyncStream.empty<number>().repeat(3));
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.of(1).repeat(3));

// .splitOn(..)
expectType<AsyncStream<number[]>>(AsyncStream.empty<number>().splitOn(3));
expectType<AsyncStream<number[]>>(AsyncStream.of(1).splitOn(3));

// .splitWhere(..)
expectType<AsyncStream<number[]>>(
  AsyncStream.empty<number>().splitWhere(() => true)
);
expectType<AsyncStream<number[]>>(AsyncStream.of(1).splitWhere(() => true));

// .asyncStream()
expectType<AsyncStream<number>>(AsyncStream.empty<number>().asyncStream());
expectType<AsyncStream.NonEmpty<number>>(AsyncStream.of(1).asyncStream());

// .take(..)
expectType<AsyncStream<number>>(AsyncStream.empty<number>().take(2));
expectType<AsyncStream<number>>(AsyncStream.of(1).take(0));
expectType<AsyncStream<number>>(AsyncStream.of(1).take(2));

// .takeWhile(..)
expectType<AsyncStream<number>>(
  AsyncStream.empty<number>().takeWhile(() => true)
);
expectType<AsyncStream<number>>(AsyncStream.of(1).takeWhile(() => true));

// .toArray()
expectType<number[]>(await AsyncStream.empty<number>().toArray());
expectType<ArrayNonEmpty<number>>(await AsyncStream.of(1).toArray());

// .equals()
expectType<boolean>(await AsyncStream.empty<number>().equals([1, 2]));
expectType<boolean>(await AsyncStream.of(1, 2).equals([1, 2]));
