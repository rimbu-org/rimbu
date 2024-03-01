import { type ArrayNonEmpty } from '@rimbu/common';
import { HashMap } from '@rimbu/hashed';
import { HashMultiMapHashValue } from '@rimbu/multimap';
import {
  expectAssignable,
  expectError,
  expectNotAssignable,
  expectNotType,
  expectType,
} from 'tsd';

import {
  Reducer,
  Stream,
  Transformer,
  type FastIterator,
} from '../src/main/index.mjs';

// Variance
expectAssignable<Stream<number | string>>(Stream.empty<number>());
expectNotAssignable<Stream<number>>(Stream.empty<number | string>());
expectAssignable<Stream<number | string>>(Stream.of(1));
expectNotAssignable<Stream<number>>(Stream.of<number | string>(1));

expectAssignable<Stream.NonEmpty<number | string>>(Stream.of(1));

// Iterable
expectType<FastIterator<number>>(Stream.empty<number>()[Symbol.iterator]());
expectType<FastIterator<number>>(Stream.of(1)[Symbol.iterator]());

// Stream.empty<T>()
expectType<Stream<number>>(Stream.empty<number>());
expectType<Stream<string>>(Stream.empty<string>());
expectNotType<Stream.NonEmpty<number>>(Stream.empty<number>());
expectNotAssignable<Stream.NonEmpty<number>>(Stream.empty<number>());

// Stream.of<T>(..)
expectType<Stream.NonEmpty<number>>(Stream.of(1));
expectAssignable<Stream<number>>(Stream.of(1));
// expectError(Stream.of());

// Stream.from<T>(..)
expectType<Stream<number>>(Stream.from([] as number[]));
expectType<Stream.NonEmpty<number>>(Stream.from([1]));
expectType<Stream.NonEmpty<number>>(Stream.from([1, 2, 3]));
expectType<Stream.NonEmpty<number>>(Stream.from(Stream.of(1)));
expectType<Stream<number>>(Stream.from(new Set([1])));
// expectError(Stream.from());

// Stream.fromArray<T>(..)
expectType<Stream<number>>(Stream.fromArray([] as number[]));
expectType<Stream.NonEmpty<number>>(Stream.fromArray([1, 2, 3]));
expectType<Stream<number>>(Stream.fromArray([1, 2, 3] as number[]));
expectType<Stream<number>>(
  Stream.fromArray([1, 2, 3], { range: { amount: 2 }, reversed: true })
);

// Stream.fromObject(..)
expectAssignable<Stream<[string, number]>>(Stream.fromObject({ a: 1 }));
expectAssignable<Stream<string>>(Stream.fromObjectKeys({ a: 1 }));
expectType<Stream<number>>(Stream.fromObjectValues({ a: 1 }));

// Stream.fromString(..)
expectType<Stream<string>>(Stream.fromString(''));
expectType<Stream.NonEmpty<string>>(Stream.fromString('abc'));
expectType<Stream<string>>(Stream.fromString('abc' as string));

// Stream.flatten<T>(..)
expectError(Stream.flatten(Stream.empty<number>()));
expectType<Stream<number>>(Stream.flatten(Stream.empty<Stream<number>>()));
expectType<Stream<number>>(
  Stream.flatten(Stream.empty<Stream.NonEmpty<number>>())
);
expectType<Stream.NonEmpty<number>>(Stream.flatten(Stream.of(Stream.of(1))));

// Stream.random(X)(..)
expectType<Stream.NonEmpty<number>>(Stream.random());
expectType<Stream.NonEmpty<number>>(Stream.randomInt(0, 10));

// Stream.range(..)
expectType<Stream<number>>(Stream.range({ amount: 10 }));

// Stream.unfold(..)
expectType<Stream.NonEmpty<number>>(Stream.unfold(0, (v) => v + 1));

// Stream.unzip(..)
expectType<[Stream.NonEmpty<number>, Stream.NonEmpty<string>]>(
  Stream.unzip(Stream.of<[number, string]>([0, 'a'], [1, 'b']), { length: 2 })
);
expectType<[Stream<number>, Stream<string>]>(
  Stream.unzip(Stream.from(new Map<number, string>()), { length: 2 })
);
expectError(Stream.unzip(Stream.of(1), { length: 2 }));
expectError(Stream.unzip(Stream.of([1, 2] as const), { length: 3 }));

// Stream.zip
expectType<Stream<[number, string]>>(
  Stream.zip(Stream.empty<number>(), Stream.empty<string>())
);
expectType<Stream<[number, string]>>(
  Stream.zip(Stream.of(1), Stream.empty<string>())
);
expectType<Stream<[number, string]>>(
  Stream.zip(Stream.empty<number>(), Stream.of('a'))
);
expectType<Stream.NonEmpty<[number, string]>>(
  Stream.zip(Stream.of(1), Stream.of('a'))
);
expectType<Stream<[number, string, boolean]>>(
  Stream.zip(Stream.empty<number>(), Stream.of('a'), Stream.of(true, false))
);
expectType<Stream.NonEmpty<[number, string, boolean]>>(
  Stream.zip(Stream.of(1), Stream.of('a'), Stream.of(true, false))
);

expectType<Stream.NonEmpty<[number]>>(Stream.zip(Stream.of(1)));

expectError(Stream.zip());

// Stream.zipAll(..)
expectType<Stream<[number | boolean, string | boolean]>>(
  Stream.zipAll(true, Stream.empty<number>(), Stream.empty<string>())
);
expectType<Stream.NonEmpty<[number | boolean, string | boolean]>>(
  Stream.zipAll(true, Stream.of(1), Stream.of('a'))
);

expectType<Stream.NonEmpty<[number | boolean]>>(
  Stream.zipAll(true, Stream.of(1))
);

// TODO
// expectType<Stream.NonEmpty<[number | boolean, string | boolean]>>(
//   Stream.zipAll(true, Stream.empty<number>(), Stream.of('a'))
// );

expectError(Stream.zipAll(true));

// Stream.zipWith(..)
expectType<Stream<[number, true, string]>>(
  Stream.zipWith(
    Stream.empty<number>(),
    Stream.empty<string>()
  )((a, b) => [a, true, b])
);
expectType<Stream<[number, true, string]>>(
  Stream.zipWith(Stream.of(1), Stream.empty<string>())((a, b) => [a, true, b])
);
expectType<Stream<[number, true, string]>>(
  Stream.zipWith(Stream.empty<number>(), Stream.of('a'))((a, b) => [a, true, b])
);
expectType<Stream.NonEmpty<[number, true, string]>>(
  Stream.zipWith(Stream.of(1), Stream.of('a'))((a, b) => [a, true, b])
);

expectType<Stream.NonEmpty<[number]>>(Stream.zipWith(Stream.of(1))((a) => [a]));

expectError(Stream.zipWith());

// Stream.zipAllWith()
expectType<Stream<[number | boolean, true, string | boolean]>>(
  Stream.zipAllWith(Stream.empty<number>(), Stream.empty<string>())(
    true,
    (a, b) => [a, true, b]
  )
);
expectType<Stream.NonEmpty<[number | boolean, true, string | boolean]>>(
  Stream.zipAllWith(Stream.of(1), Stream.of('a'))(true, (a, b) => [a, true, b])
);
expectType<Stream.NonEmpty<[number | boolean]>>(
  Stream.zipAllWith(Stream.of(1))(true, (a) => [a])
);

expectError(Stream.zipAllWith());

// TODO
// expectType<Stream.NonEmpty<[number | boolean, string | boolean]>>(
//   Stream.zipAllWith(true, (a, b) => [a, true, b], Stream.empty<number>(), Stream.of('a'))
// );

// .assumeNonEmpty()
expectType<Stream.NonEmpty<number>>(Stream.empty<number>().assumeNonEmpty());
expectType<Stream.NonEmpty<number>>(Stream.of(1).assumeNonEmpty());

// .append()
expectType<Stream.NonEmpty<number>>(Stream.empty<number>().append(1));
expectType<Stream.NonEmpty<number>>(Stream.of(1).append(1));
expectType<Stream.NonEmpty<number | string>>(
  Stream.empty<number | string>().append('a')
);
expectType<Stream.NonEmpty<number | string>>(
  Stream.of(1 as number | string).append('a')
);

// .chain(...)
expectType<number>(
  Stream.empty<number>().reduce(Reducer.sum.chain([Reducer.product]))
);
expectType<boolean>(
  Stream.empty<number>().reduce(Reducer.contains(1).chain([Reducer.isEmpty]))
);

// .collect(..)
expectType<Stream<string>>(Stream.empty<number>().collect(() => ''));
expectType<Stream<string>>(Stream.of(1).collect(() => ''));

// .concat(..)
expectType<Stream<number>>(
  Stream.empty<number>().concat(Stream.empty<number>())
);
expectType<Stream<number>>(
  Stream.empty<number>().concat(Stream.empty<number>(), Stream.empty<number>())
);

expectType<Stream.NonEmpty<number>>(
  Stream.empty<number>().concat(Stream.of(1))
);
expectType<Stream.NonEmpty<number>>(
  Stream.of(1).concat(Stream.empty<number>())
);
expectType<Stream.NonEmpty<number>>(Stream.of(1).concat(Stream.of(1)));
expectType<Stream.NonEmpty<number>>(
  Stream.of(1).concat(Stream.of(1), Stream.of(1))
);

expectType<Stream.NonEmpty<number>>(
  Stream.of(1).concat(Stream.of(1), Stream.of(1))
);

// .drop(..)
expectType<Stream<number>>(Stream.empty<number>().drop(4));
expectType<Stream<number>>(Stream.of(1).drop(4));

// .dropWhile(..)
expectType<Stream<number>>(Stream.empty<number>().dropWhile(() => true));
expectType<Stream<number>>(Stream.of(1).dropWhile(() => true));

// .elementtAt(..)
expectType<number>(Stream.empty<number>().elementAt(1, 3));
expectType<number | string>(Stream.empty<number>().elementAt(1, '' as string));

expectType<number>(Stream.empty<number>().elementAt(1, () => 3));
expectType<number | string>(
  Stream.empty<number>().elementAt(1, () => '' as string)
);

// .forEach(..)
expectType<void>(Stream.empty<number>().forEach(() => {}));
expectType<void>(Stream.of(1).forEach(() => {}));

// .forEachPure(..)
expectType<void>(Stream.empty<number>().forEachPure(() => {}));
expectType<void>(Stream.of(1).forEachPure(() => {}));

// .filter(..)
expectType<Stream<number>>(Stream.empty<number>().filter((v) => true));
expectType<Stream<number>>(Stream.of(1).filter(() => true));

expectType<Stream<number>>(
  Stream.empty<number | string>().filter((v): v is number => true)
);
expectType<Stream<number>>(
  Stream.empty<number | string>().filter((v): v is number => true, {
    negate: false,
  })
);

// .filter(..) negate
expectType<Stream<number>>(
  Stream.empty<number>().filter((v) => true, { negate: true })
);
expectType<Stream<number>>(Stream.of(1).filter(() => true, { negate: true }));
expectType<Stream<string>>(
  Stream.empty<number | string>().filter((v): v is number => true, {
    negate: true,
  })
);

// .filterPure(..)
expectType<Stream<number>>(
  Stream.empty<number>().filterPure({ pred: (v) => true })
);
expectType<Stream<number>>(Stream.of(1).filterPure({ pred: () => true }));
expectType<Stream<number>>(
  Stream.empty<number | string>().filterPure({ pred: (v): v is number => true })
);
expectType<Stream<number>>(
  Stream.empty<number | string>().filterPure({
    pred: (v): v is number => true,
    negate: false,
  })
);

// .filterPure(..) negate
expectType<Stream<number>>(
  Stream.empty<number>().filterPure({ pred: (v) => true, negate: true })
);
expectType<Stream<number>>(
  Stream.of(1).filterPure({ pred: () => true, negate: true })
);
expectType<Stream<string>>(
  Stream.empty<number | string>().filterPure({
    pred: (v): v is number => true,
    negate: true,
  })
);

// .find(..)
expectType<number | undefined>(Stream.empty<number>().find(() => true));
expectType<number | undefined>(
  Stream.empty<number>().find(() => true, { occurrance: 1 })
);
expectType<number | undefined>(Stream.of(1).find(() => true));
expectType<number | undefined>(
  Stream.of(1).find(() => true, { occurrance: 1 })
);
expectType<number>(
  Stream.empty<number>().find(() => true, { otherwise: () => 1 })
);
expectType<number>(Stream.of(1).find(() => true, { otherwise: () => 1 }));
expectType<number | string>(
  Stream.empty<number>().find(() => true, { otherwise: 'a' as string })
);
expectType<number | string>(
  Stream.of(1).find(() => true, { otherwise: 'a' as string })
);

expectType<number | undefined>(
  Stream.empty<number | string>().find((value): value is number => true)
);
expectType<number | undefined>(
  Stream.empty<number | string>().find((value): value is number => true, {
    negate: false,
  })
);
expectType<number | boolean>(
  Stream.empty<number | string>().find((value): value is number => true, {
    negate: false,
    otherwise: true,
  })
);
expectType<string | boolean>(
  Stream.empty<number | string>().find((value): value is number => true, {
    negate: true,
    otherwise: true,
  })
);
expectType<string>(
  Stream.empty<number | string>().find((value): value is number => true, {
    negate: true,
    otherwise: 'a',
  })
);

// .first(..)
expectType<number | undefined>(Stream.empty<number>().first());
expectError(Stream.of(1).first(3));

expectType<number>(Stream.empty<number>().first(1));
expectType<number>(Stream.of(1).first());
expectType<number | string>(Stream.empty<number>().first('a' as string));

// .single(..)
expectType<number | undefined>(Stream.empty<number>().single());
expectType<number>(Stream.empty<number>().single(1));
expectType<number | string>(Stream.empty<number>().single('a' as string));
expectType<number | undefined>(Stream.of(1).single());
expectType<number>(Stream.of(1).single(1));
expectType<number | string>(Stream.of(1).single('a' as string));

// .flatMap(..)
expectType<Stream<string>>(
  Stream.empty<number>().flatMap(() => Stream.empty<string>())
);
expectType<Stream<string>>(Stream.of(1).flatMap(() => Stream.empty<string>()));
expectType<Stream<string>>(Stream.of(1).flatMap(() => Stream.empty<string>()));
expectType<Stream.NonEmpty<string>>(Stream.of(1).flatMap(() => Stream.of('a')));

// .flatZip(..)
expectType<Stream<[number, string]>>(
  Stream.empty<number>().flatZip((v) => [String(v)])
);
expectType<Stream<[number, string]>>(
  Stream.of(1).flatZip(() => Stream.empty<string>())
);
expectType<Stream.NonEmpty<[number, string]>>(
  Stream.of(1).flatZip((v) => [String(v)])
);

// .transform(..)
expectType<Stream<string>>(
  Stream.empty<number>().transform(
    null as unknown as Transformer<number, string>
  )
);
expectType<Stream<string>>(
  Stream.empty<number>().transform(
    null as unknown as Transformer.NonEmpty<number, string>
  )
);
expectType<Stream<string>>(
  Stream.of(1).transform(null as unknown as Transformer<number, string>)
);
expectType<Stream.NonEmpty<string>>(
  Stream.of(1).transform(
    null as unknown as Transformer.NonEmpty<number, string>
  )
);

// .fold(..)
expectType<string>(Stream.empty<number>().fold('a', () => 'b'));
expectType<string>(Stream.of(1).fold('a', () => 'b'));
expectType<string>(
  Stream.empty<number>().fold(
    () => 'a',
    () => 'b'
  )
);
expectType<string>(
  Stream.of(1).fold(
    () => 'a',
    () => 'b'
  )
);

// .foldStream(..)
expectType<Stream<string>>(Stream.empty<number>().foldStream('a', () => 'b'));
expectType<Stream.NonEmpty<string>>(Stream.of(1).foldStream('a', () => 'b'));

// .groupBy(...)
expectType<Map<number, string[]>>(
  Stream.empty<string>().groupBy((v) => v.length)
);
expectType<string>(
  Stream.empty<string>().groupBy((v) => v.length, {
    collector: Reducer.join<[number, string]>(),
  })
);
expectType<HashMap<number, string>>(
  Stream.empty<string>().groupBy((v) => v.length, {
    // accepts readonly tuples
    collector: HashMap.reducer(),
  })
);
expectType<HashMultiMapHashValue<number, string>>(
  Stream.empty<string>().groupBy((v) => v.length, {
    // accepts normal tuples
    collector: HashMultiMapHashValue.reducer(),
  })
);

// .indexed()
expectType<Stream<[number, string]>>(Stream.empty<string>().indexed());
expectType<Stream.NonEmpty<[number, string]>>(Stream.of('a').indexed());

// .indexWhere(..)
expectType<number | undefined>(Stream.empty<number>().indexWhere(() => true));
expectType<number | undefined>(Stream.of(1).indexWhere(() => true));

// .indexOf(..)
expectType<number | undefined>(Stream.empty<number>().indexOf(2));
expectType<number | undefined>(Stream.of(1).indexOf(2));

// .indicesOf(..)
expectType<Stream<number>>(Stream.empty<string>().indicesOf('b'));
expectType<Stream<number>>(Stream.of('a').indicesOf('b'));

// .indicesWhere(..)
expectType<Stream<number>>(Stream.empty<string>().indicesWhere(() => true));
expectType<Stream<number>>(Stream.of('a').indicesWhere(() => true));

// .some(..)
expectType<boolean>(Stream.empty<string>().some(() => true));
expectType<boolean>(Stream.of('a').some(() => true));

// .every(..)
expectType<boolean>(Stream.empty<string>().every(() => true));
expectType<boolean>(Stream.of('a').every(() => true));

// .contains(..)
expectType<boolean>(Stream.empty<number>().contains(2));
expectType<boolean>(Stream.of(1).contains(2));
expectError(Stream.of(1).contains('a'));

// .containsSlice(..)
expectType<boolean>(Stream.empty<number>().containsSlice([2]));
expectType<boolean>(Stream.of(1).containsSlice([2]));
expectError(Stream.of(1).containsSlice(['a']));

// .intersperse(..)
expectType<Stream<number>>(
  Stream.empty<number>().intersperse(Stream.empty<number>())
);
expectType<Stream.NonEmpty<number>>(
  Stream.of(1).intersperse(Stream.empty<number>())
);
expectType<Stream<number>>(Stream.empty<number>().intersperse(Stream.of(1)));
expectType<Stream.NonEmpty<number>>(Stream.of(1).intersperse(Stream.of(1)));

// .last(..)
expectType<number | undefined>(Stream.empty<number>().last());
expectError(Stream.of(1).last(3));

expectType<number>(Stream.empty<number>().last(3));
expectType<number>(Stream.empty<number>().last(() => 3));
expectType<number>(Stream.of(1).last());
expectType<number | string>(Stream.empty<number>().last('a' as string));

// .map(..)
expectType<Stream<string>>(Stream.empty<number>().map(() => 'a'));
expectType<Stream.NonEmpty<string>>(Stream.of(1).map(() => 'a'));

// .mapPure(..)
expectType<Stream<string>>(Stream.empty<number>().mapPure(() => 'a'));
expectType<Stream.NonEmpty<string>>(Stream.of(1).mapPure(() => 'a'));

// .max(..)
expectType<number | undefined>(Stream.empty<number>().max());
expectError(Stream.of(1).max(3));

expectType<number>(Stream.empty<number>().max(3));
expectType<number>(Stream.empty<number>().max(() => 3));
expectType<number>(Stream.of(1).max());
expectType<number | string>(Stream.empty<number>().max('a' as string));

// .min(..)
expectType<number | undefined>(Stream.empty<number>().min());
expectError(Stream.of(1).min(3));

expectType<number>(Stream.empty<number>().min(3));
expectType<number>(Stream.empty<number>().min(() => 3));
expectType<number>(Stream.of(1).min());
expectType<number | string>(Stream.empty<number>().min('a' as string));

// .maxBy(..)
expectType<number>(Stream.empty<number>().maxBy(() => 0, 3));
expectType<number>(
  Stream.empty<number>().maxBy(
    () => 0,
    () => 3
  )
);
expectType<number>(Stream.of(1).maxBy(() => 0));
expectType<number | string>(
  Stream.empty<number>().maxBy(() => 0, 'a' as string)
);

// .minBy(..)
expectType<number>(Stream.empty<number>().minBy(() => 0, 3));
expectType<number>(
  Stream.empty<number>().minBy(
    () => 0,
    () => 3
  )
);
expectType<number>(Stream.of(1).minBy(() => 0));
expectType<number | string>(
  Stream.empty<number>().minBy(() => 0, 'a' as string)
);

// .mkGroup(..)
expectType<Stream<number>>(Stream.empty<number>().mkGroup({}));
expectType<Stream.NonEmpty<number>>(Stream.of(1).mkGroup({}));

expectType<Stream<number>>(
  Stream.empty<number>().mkGroup({ start: Stream.empty<number>() })
);
expectType<Stream<number>>(
  Stream.empty<number>().mkGroup({ sep: Stream.empty<number>() })
);
expectType<Stream<number>>(
  Stream.empty<number>().mkGroup({ end: Stream.empty<number>() })
);

expectType<Stream<number>>(
  Stream.empty<number>().mkGroup({ sep: Stream.of(1) })
);

// TODO
// expectType<Stream.NonEmpty<number>>(
//   Stream.empty<number>().mkGroup({ start: Stream.of(1) })
// );
// expectType<Stream.NonEmpty<number>>(
//   Stream.empty<number>().mkGroup({ end: Stream.of(1) })
// );

expectType<Stream.NonEmpty<number>>(
  Stream.of(1).mkGroup({ start: Stream.empty<number>() })
);
expectType<Stream.NonEmpty<number>>(
  Stream.of(1).mkGroup({ sep: Stream.empty<number>() })
);
expectType<Stream.NonEmpty<number>>(
  Stream.of(1).mkGroup({ end: Stream.empty<number>() })
);

expectType<Stream.NonEmpty<number>>(
  Stream.of(1).mkGroup({ start: Stream.of(1) })
);
expectType<Stream.NonEmpty<number>>(
  Stream.of(1).mkGroup({ sep: Stream.of(1) })
);
expectType<Stream.NonEmpty<number>>(
  Stream.of(1).mkGroup({ end: Stream.of(1) })
);

// .partition(...)
expectType<[number[], number[]]>(Stream.of(1).partition(() => false));
expectType<[Set<number>, number]>(
  Stream.of(1).partition(() => false, {
    collectorTrue: Reducer.toJSSet(),
    collectorFalse: Reducer.sum,
  })
);

expectType<[string[], number[]]>(
  Stream.empty<number | string>().partition((v): v is string => false)
);
expectType<[Set<string>, number]>(
  Stream.empty<number | string>().partition((v): v is string => false, {
    collectorTrue: Reducer.toJSSet(),
    collectorFalse: Reducer.sum,
  })
);

// .prepend(..)
expectType<Stream.NonEmpty<number>>(Stream.empty<number>().prepend(3));
expectType<Stream.NonEmpty<number>>(Stream.of(1).prepend(3));

// .reduce(..)
expectType<boolean>(Stream.empty<number>().reduce(Reducer.isEmpty));
expectType<boolean>(Stream.of(1).reduce(Reducer.isEmpty));
expectError<number | boolean>(
  Stream.empty<number | boolean>().reduce(Reducer.sum)
);

// .reduce(..) shape
expectType<[boolean, number, string]>(
  Stream.empty<number>().reduce([
    Reducer.isEmpty,
    Reducer.sum,
    Reducer.join<number>(),
  ])
);
expectType<[boolean, number, string]>(
  Stream.of(1).reduce([Reducer.isEmpty, Reducer.sum, Reducer.join<number>()])
);

// .reduceStream(..) shapes
expectType<Stream<[boolean, number, string]>>(
  Stream.empty<number>().reduceStream([
    Reducer.isEmpty,
    Reducer.sum,
    Reducer.join<number>(),
  ])
);
expectType<Stream<[boolean, number, string]>>(
  Stream.of(1).reduceStream([
    Reducer.isEmpty,
    Reducer.sum,
    Reducer.join<number>(),
  ])
);
expectType<
  Stream<{ readonly a: [boolean, number]; readonly b: { readonly c: string } }>
>(
  Stream.of(1).reduceStream({
    a: [Reducer.isEmpty, Reducer.sum],
    b: { c: Reducer.join<number>() },
  })
);

// .reduceStream(..)
expectType<Stream<boolean>>(
  Stream.empty<number>().reduceStream(Reducer.isEmpty)
);
expectType<Stream<boolean>>(Stream.of(1).reduceStream(Reducer.isEmpty));

// .repeat(..)
expectType<Stream<number>>(Stream.empty<number>().repeat());
expectType<Stream.NonEmpty<number>>(Stream.of(1).repeat());
expectType<Stream<number>>(Stream.empty<number>().repeat(3));
expectType<Stream.NonEmpty<number>>(Stream.of(1).repeat(3));

// .splitOn(..)
expectType<Stream<number[]>>(Stream.empty<number>().splitOn(3));
expectType<Stream<number[]>>(Stream.of(1).splitOn(3));

// .splitOnSlice(...)
expectType<Stream<number[]>>(Stream.of(1).splitOnSlice(Stream.of(1)));
expectType<Stream<Set<number>>>(
  Stream.of(1).splitOnSlice(Stream.of(1), { collector: Reducer.toJSSet() })
);

// .splitWhere(..)
expectType<Stream<number[]>>(Stream.empty<number>().splitWhere(() => true));
expectType<Stream<number[]>>(Stream.of(1).splitWhere(() => true));

// .stream()
expectType<Stream<number>>(Stream.empty<number>().stream());
expectType<Stream.NonEmpty<number>>(Stream.of(1).stream());

// .take(..)
expectType<Stream<number>>(Stream.empty<number>().take(2));
expectType<Stream<number>>(Stream.of(1).take(0));
expectType<Stream<number>>(Stream.of(1).take(2));

// .takeWhile(..)
expectType<Stream<number>>(Stream.empty<number>().takeWhile(() => true));
expectType<Stream<number>>(Stream.of(1).takeWhile(() => true));

// .toArray()
expectType<number[]>(Stream.empty<number>().toArray());
expectType<ArrayNonEmpty<number>>(Stream.of(1).toArray());

// .equals(..)
expectType<boolean>(Stream.empty<number>().equals([1]));
expectType<boolean>(Stream.of(1).equals([1]));

// .count()
expectType<number>(Stream.empty<number>().count());
expectType<number>(Stream.of(1).count());

// .countElement(..)
expectType<number>(Stream.empty<number>().countElement(1));
expectType<number>(Stream.of(1).countElement(1));

// .countElement(..) negate
expectType<number>(Stream.empty<number>().countElement(1, { negate: true }));
expectType<number>(Stream.of(1).countElement(1, { negate: true }));

// .join(..)
expectType<string>(Stream.empty<number>().join());
expectType<string>(Stream.of(1).join());

// .distinctPrevious(..)
expectType<Stream<number>>(Stream.empty<number>().distinctPrevious());
expectType<Stream.NonEmpty<number>>(Stream.of(1).distinctPrevious());

// .window(...)
expectType<Stream<number[]>>(Stream.of(1).window(2));
expectType<Stream<Set<number>>>(
  Stream.of(1).window(2, { collector: Reducer.toJSSet() })
);

// .withOnly(...)
expectType<Stream<undefined>>(
  Stream.empty<number | undefined>().withOnly([undefined])
);
expectType<Stream<1>>(Stream.empty<number | undefined>().withOnly([1]));
expectType<Stream<1 | 2>>(Stream.empty<number | undefined>().withOnly([1, 2]));

// .without(...)
expectType<Stream<number>>(
  Stream.empty<number | undefined>().without([undefined])
);
expectType<Stream<number | undefined>>(
  Stream.empty<number | undefined>().without([1])
);
expectType<Stream<1 | 3>>(
  Stream.empty<1 | 2 | 3 | undefined>().without([undefined, 2])
);
