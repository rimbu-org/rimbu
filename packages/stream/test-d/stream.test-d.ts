import { expectTypeOf } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { Transformer } from '@rimbu/stream/transformer';

import { HashMap } from '@rimbu/hashed/map';
import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
import { type FastIterator, Stream } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

// Variance
expectTypeOf(Stream.empty<number>()).toExtend<Stream<number | string>>();
expectTypeOf(Stream.empty<number | string>()).not.toExtend<Stream<number>>();
expectTypeOf(Stream.of(1)).toExtend<Stream<number | string>>();
expectTypeOf(Stream.of<number | string>(1)).not.toExtend<Stream<number>>();

expectTypeOf(Stream.of(1)).toExtend<Stream.NonEmpty<number | string>>();

// Iterable
expectTypeOf(Stream.empty<number>()[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<number>
>();
expectTypeOf(Stream.of(1)[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<number>
>();

// Stream.empty<T>()
expectTypeOf(Stream.empty<number>()).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.empty<string>()).toEqualTypeOf<Stream<string>>();
expectTypeOf(Stream.empty<number>()).not.toEqualTypeOf<
	Stream.NonEmpty<number>
>();
expectTypeOf(Stream.empty<number>()).not.toExtend<Stream.NonEmpty<number>>();

// Stream.of<T>(..)
expectTypeOf(Stream.of(1)).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(Stream.of(1)).toExtend<Stream<number>>();
// @ts-expect-error
Stream.of();

// Stream.from<T>(..)
expectTypeOf(Stream.from([] as number[])).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.from([1])).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(Stream.from([1, 2, 3])).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(Stream.from(Stream.of(1))).toEqualTypeOf<
	Stream.NonEmpty<number>
>();
expectTypeOf(Stream.from(new Set([1]))).toEqualTypeOf<Stream<number>>();
// @ts-expect-error
Stream.from();

// Stream.fromArray<T>(..)
expectTypeOf(Stream.fromArray([] as number[])).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.fromArray([1, 2, 3])).toEqualTypeOf<
	Stream.NonEmpty<number>
>();
expectTypeOf(Stream.fromArray([1, 2, 3] as number[])).toEqualTypeOf<
	Stream<number>
>();
expectTypeOf(
	Stream.fromArray([1, 2, 3], { range: { amount: 2 }, reversed: true }),
).toEqualTypeOf<Stream<number>>();

// Stream.fromObject(..)
expectTypeOf(Stream.fromObject({ a: 1 })).toExtend<Stream<[string, number]>>();
expectTypeOf(Stream.fromObjectKeys({ a: 1 })).toExtend<Stream<string>>();
expectTypeOf(Stream.fromObjectValues({ a: 1 })).toEqualTypeOf<Stream<number>>();

// Stream.fromString(..)
expectTypeOf(Stream.fromString('')).toEqualTypeOf<Stream<string>>();
expectTypeOf(Stream.fromString('abc')).toEqualTypeOf<Stream.NonEmpty<string>>();
expectTypeOf(Stream.fromString('abc' as string)).toEqualTypeOf<
	Stream<string>
>();

// Stream.flatten<T>(..)
// @ts-expect-error
Stream.flatten(Stream.empty<number>());

expectTypeOf(Stream.flatten(Stream.empty<Stream<number>>())).toEqualTypeOf<
	Stream<number>
>();
expectTypeOf(
	Stream.flatten(Stream.empty<Stream.NonEmpty<number>>()),
).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.flatten(Stream.of(Stream.of(1)))).toEqualTypeOf<
	Stream.NonEmpty<number>
>();

// Stream.random(X)(..)
expectTypeOf(Stream.random()).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(Stream.randomInt(0, 10)).toEqualTypeOf<Stream.NonEmpty<number>>();

// Stream.range(..)
expectTypeOf(Stream.range({ amount: 10 })).toEqualTypeOf<Stream<number>>();

// Stream.unfold(..)
expectTypeOf(Stream.unfold(0, (v) => v + 1)).toEqualTypeOf<
	Stream.NonEmpty<number>
>();

// Stream.unzip(..)
expectTypeOf(
	Stream.unzip(Stream.of<[number, string]>([0, 'a'], [1, 'b']), { length: 2 }),
).toEqualTypeOf<[Stream.NonEmpty<number>, Stream.NonEmpty<string>]>();
expectTypeOf(
	Stream.unzip(Stream.from(new Map<number, string>()), { length: 2 }),
).toEqualTypeOf<[Stream<number>, Stream<string>]>();

// @ts-expect-error
Stream.unzip(Stream.of(1), { length: 2 });
// @ts-expect-error
Stream.unzip(Stream.of([1, 2] as const), { length: 3 });

// Stream.zip
expectTypeOf(
	Stream.zip(Stream.empty<number>(), Stream.empty<string>()),
).toEqualTypeOf<Stream<[number, string]>>();
expectTypeOf(Stream.zip(Stream.of(1), Stream.empty<string>())).toEqualTypeOf<
	Stream<[number, string]>
>();
expectTypeOf(Stream.zip(Stream.empty<number>(), Stream.of('a'))).toEqualTypeOf<
	Stream<[number, string]>
>();
expectTypeOf(Stream.zip(Stream.of(1), Stream.of('a'))).toEqualTypeOf<
	Stream.NonEmpty<[number, string]>
>();
expectTypeOf(
	Stream.zip(Stream.empty<number>(), Stream.of('a'), Stream.of(true, false)),
).toEqualTypeOf<Stream<[number, string, boolean]>>();
expectTypeOf(
	Stream.zip(Stream.of(1), Stream.of('a'), Stream.of(true, false)),
).toEqualTypeOf<Stream.NonEmpty<[number, string, boolean]>>();

expectTypeOf(Stream.zip(Stream.of(1))).toEqualTypeOf<
	Stream.NonEmpty<[number]>
>();

// @ts-expect-error
Stream.zip();

// Stream.zipAll(..)
expectTypeOf(
	Stream.zipAll(true, Stream.empty<number>(), Stream.empty<string>()),
).toEqualTypeOf<Stream<[number | boolean, string | boolean]>>();
expectTypeOf(Stream.zipAll(true, Stream.of(1), Stream.of('a'))).toEqualTypeOf<
	Stream.NonEmpty<[number | boolean, string | boolean]>
>();

expectTypeOf(Stream.zipAll(true, Stream.of(1))).toEqualTypeOf<
	Stream.NonEmpty<[number | boolean]>
>();

// TODO
// expectType<Stream.NonEmpty<[number | boolean, string | boolean]>>(
//   Stream.zipAll(true, Stream.empty<number>(), Stream.of('a'))
// );

// @ts-expect-error
Stream.zipAll(true);

// .assumeNonEmpty()
expectTypeOf(Stream.empty<number>().assumeNonEmpty()).toEqualTypeOf<
	Stream.NonEmpty<number>
>();
expectTypeOf(Stream.of(1).assumeNonEmpty()).toEqualTypeOf<
	Stream.NonEmpty<number>
>();

// .append()
expectTypeOf(Stream.empty<number>().append(1)).toEqualTypeOf<
	Stream.NonEmpty<number>
>();
expectTypeOf(Stream.of(1).append(1)).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(Stream.empty<number | string>().append('a')).toEqualTypeOf<
	Stream.NonEmpty<number | string>
>();
expectTypeOf(Stream.of(1 as number | string).append('a')).toEqualTypeOf<
	Stream.NonEmpty<number | string>
>();

// .chain(...)
expectTypeOf(
	Stream.empty<number>().reduce(Reducer.sum.chain([Reducer.product])),
).toEqualTypeOf<number>();
expectTypeOf(
	Stream.empty<number>().reduce(Reducer.contains(1).chain([Reducer.isEmpty])),
).toEqualTypeOf<boolean>();

// .collect(..)
expectTypeOf(Stream.empty<number>().collect(() => '')).toEqualTypeOf<
	Stream<string>
>();
expectTypeOf(Stream.of(1).collect(() => '')).toEqualTypeOf<Stream<string>>();

// .concat(..)
expectTypeOf(
	Stream.empty<number>().concat(Stream.empty<number>()),
).toEqualTypeOf<Stream<number>>();
expectTypeOf(
	Stream.empty<number>().concat(Stream.empty<number>(), Stream.empty<number>()),
).toEqualTypeOf<Stream<number>>();

expectTypeOf(Stream.empty<number>().concat(Stream.of(1))).toEqualTypeOf<
	Stream.NonEmpty<number>
>();
expectTypeOf(Stream.of(1).concat(Stream.empty<number>())).toEqualTypeOf<
	Stream.NonEmpty<number>
>();
expectTypeOf(Stream.of(1).concat(Stream.of(1))).toEqualTypeOf<
	Stream.NonEmpty<number>
>();
expectTypeOf(Stream.of(1).concat(Stream.of(1), Stream.of(1))).toEqualTypeOf<
	Stream.NonEmpty<number>
>();

expectTypeOf(Stream.of(1).concat(Stream.of(1), Stream.of(1))).toEqualTypeOf<
	Stream.NonEmpty<number>
>();

// .drop(..)
expectTypeOf(Stream.empty<number>().drop(4)).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.of(1).drop(4)).toEqualTypeOf<Stream<number>>();

// .dropWhile(..)
expectTypeOf(Stream.empty<number>().dropWhile(() => true)).toEqualTypeOf<
	Stream<number>
>();
expectTypeOf(Stream.of(1).dropWhile(() => true)).toEqualTypeOf<
	Stream<number>
>();

// .elementtAt(..)
expectTypeOf(Stream.empty<number>().at(1, 3)).toEqualTypeOf<number>();
expectTypeOf(Stream.empty<number>().at(1, '' as string)).toEqualTypeOf<
	number | string
>();

expectTypeOf(
	Stream.empty<number>().at(1, () => 3),
).toEqualTypeOf<number>();
expectTypeOf(
	Stream.empty<number>().at(1, () => '' as string),
).toEqualTypeOf<number | string>();

// .forEach(..)
expectTypeOf(Stream.empty<number>().forEach(() => {})).toEqualTypeOf<void>();
expectTypeOf(Stream.of(1).forEach(() => {})).toEqualTypeOf<void>();

// .forEachPure(..)
expectTypeOf(
	Stream.empty<number>().forEachPure(() => {}),
).toEqualTypeOf<void>();
expectTypeOf(Stream.of(1).forEachPure(() => {})).toEqualTypeOf<void>();

// .filter(..)
expectTypeOf(Stream.empty<number>().filter((v) => true)).toEqualTypeOf<
	Stream<number>
>();
expectTypeOf(Stream.of(1).filter(() => true)).toEqualTypeOf<Stream<number>>();

expectTypeOf(
	Stream.empty<number | string>().filter((v): v is number => true),
).toEqualTypeOf<Stream<number>>();
expectTypeOf(
	Stream.empty<number | string>().filter((v): v is number => true, {
		negate: false,
	}),
).toEqualTypeOf<Stream<number>>();

// .filter(..) negate
expectTypeOf(
	Stream.empty<number>().filter((v) => true, { negate: true }),
).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.of(1).filter(() => true, { negate: true })).toEqualTypeOf<
	Stream<number>
>();
expectTypeOf(
	Stream.empty<number | string>().filter((v): v is number => true, {
		negate: true,
	}),
).toEqualTypeOf<Stream<string>>();

// .filterPure(..)
expectTypeOf(
	Stream.empty<number>().filterPure({ pred: (v) => true }),
).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.of(1).filterPure({ pred: () => true })).toEqualTypeOf<
	Stream<number>
>();
expectTypeOf(
	Stream.empty<number | string>().filterPure({
		pred: (v): v is number => true,
	}),
).toEqualTypeOf<Stream<number>>();
expectTypeOf(
	Stream.empty<number | string>().filterPure({
		pred: (v): v is number => true,
		negate: false,
	}),
).toEqualTypeOf<Stream<number>>();

// .filterPure(..) negate
expectTypeOf(
	Stream.empty<number>().filterPure({ pred: (v) => true, negate: true }),
).toEqualTypeOf<Stream<number>>();
expectTypeOf(
	Stream.of(1).filterPure({ pred: () => true, negate: true }),
).toEqualTypeOf<Stream<number>>();
expectTypeOf(
	Stream.empty<number | string>().filterPure({
		pred: (v): v is number => true,
		negate: true,
	}),
).toEqualTypeOf<Stream<string>>();

// .find(..)

expectTypeOf(Stream.empty<number>().find(() => true)).toEqualTypeOf<
	number | undefined
>();
expectTypeOf(
	Stream.empty<number>().find(() => true, { occurrence: 1 }),
).toEqualTypeOf<number | undefined>();
expectTypeOf(Stream.of(1).find(() => true)).toEqualTypeOf<number | undefined>();
expectTypeOf(Stream.of(1).find(() => true, { occurrence: 1 })).toEqualTypeOf<
	number | undefined
>();
expectTypeOf(
	Stream.empty<number>().find(() => true, { otherwise: () => 1 }),
).toEqualTypeOf<number>();
expectTypeOf(
	Stream.of(1).find(() => true, { otherwise: () => 1 }),
).toEqualTypeOf<number>();
expectTypeOf(
	Stream.empty<number>().find(() => true, { otherwise: 'a' as string }),
).toEqualTypeOf<number | string>();
expectTypeOf(
	Stream.of(1).find(() => true, { otherwise: 'a' as string }),
).toEqualTypeOf<number | string>();

expectTypeOf(
	Stream.empty<number | string>().find((value): value is number => true),
).toEqualTypeOf<number | undefined>();
expectTypeOf(
	Stream.empty<number | string>().find((value): value is number => true, {
		negate: false,
	}),
).toEqualTypeOf<number | undefined>();
expectTypeOf(
	Stream.empty<number | string>().find((value): value is number => true, {
		negate: false,
		otherwise: true,
	}),
).toEqualTypeOf<number | boolean>();
expectTypeOf(
	Stream.empty<number | string>().find((value): value is number => true, {
		negate: true,
		otherwise: true,
	}),
).toEqualTypeOf<string | boolean>();
expectTypeOf(
	Stream.empty<number | string>().find((value): value is number => true, {
		negate: true,
		otherwise: 'a',
	}),
).toEqualTypeOf<string>();

// .first(..)
expectTypeOf(Stream.empty<number>().first()).toEqualTypeOf<
	number | undefined
>();
// @ts-expect-error
Stream.of(1).first(3);

expectTypeOf(Stream.empty<number>().first(1)).toEqualTypeOf<number>();
expectTypeOf(Stream.of(1).first()).toEqualTypeOf<number>();
expectTypeOf(Stream.empty<number>().first('a' as string)).toEqualTypeOf<
	number | string
>();

// .single(..)
expectTypeOf(Stream.empty<number>().single()).toEqualTypeOf<
	number | undefined
>();
expectTypeOf(Stream.empty<number>().single(1)).toEqualTypeOf<number>();
expectTypeOf(Stream.empty<number>().single('a' as string)).toEqualTypeOf<
	number | string
>();
expectTypeOf(Stream.of(1).single()).toEqualTypeOf<number | undefined>();
expectTypeOf(Stream.of(1).single(1)).toEqualTypeOf<number>();
expectTypeOf(Stream.of(1).single('a' as string)).toEqualTypeOf<
	number | string
>();

// .flatMap(..)
expectTypeOf(
	Stream.empty<number>().flatMap(() => Stream.empty<string>()),
).toEqualTypeOf<Stream<string>>();
expectTypeOf(Stream.of(1).flatMap(() => Stream.empty<string>())).toEqualTypeOf<
	Stream<string>
>();
expectTypeOf(Stream.of(1).flatMap(() => Stream.empty<string>())).toEqualTypeOf<
	Stream<string>
>();
expectTypeOf(Stream.of(1).flatMap(() => Stream.of('a'))).toEqualTypeOf<
	Stream.NonEmpty<string>
>();

// .flatZip(..)
expectTypeOf(Stream.empty<number>().flatZip((v) => [String(v)])).toEqualTypeOf<
	Stream<[number, string]>
>();
expectTypeOf(Stream.of(1).flatZip(() => Stream.empty<string>())).toEqualTypeOf<
	Stream<[number, string]>
>();
expectTypeOf(Stream.of(1).flatZip((v) => [String(v)])).toEqualTypeOf<
	Stream.NonEmpty<[number, string]>
>();

// .transform(..)
expectTypeOf(
	Stream.empty<number>().transform(
		null as unknown as Transformer<number, string>,
	),
).toEqualTypeOf<Stream<string>>();
expectTypeOf(
	Stream.empty<number>().transform(
		null as unknown as Transformer.NonEmpty<number, string>,
	),
).toEqualTypeOf<Stream<string>>();
expectTypeOf(
	Stream.of(1).transform(null as unknown as Transformer<number, string>),
).toEqualTypeOf<Stream<string>>();
expectTypeOf(
	Stream.of(1).transform(
		null as unknown as Transformer.NonEmpty<number, string>,
	),
).toEqualTypeOf<Stream.NonEmpty<string>>();

// .fold(..)
expectTypeOf(
	Stream.empty<number>().fold('a', () => 'b'),
).toEqualTypeOf<string>();
expectTypeOf(Stream.of(1).fold('a', () => 'b')).toEqualTypeOf<string>();
expectTypeOf(
	Stream.empty<number>().fold(
		() => 'a',
		() => 'b',
	),
).toEqualTypeOf<string>();
expectTypeOf(
	Stream.of(1).fold(
		() => 'a',
		() => 'b',
	),
).toEqualTypeOf<string>();

// .foldStream(..)
expectTypeOf(Stream.empty<number>().foldStream('a', () => 'b')).toEqualTypeOf<
	Stream<string>
>();
expectTypeOf(Stream.of(1).foldStream('a', () => 'b')).toEqualTypeOf<
	Stream.NonEmpty<string>
>();

// .groupBy(...)
expectTypeOf(
	Stream.empty<string>().groupBy((v) => v.length)(),
).toEqualTypeOf<Map<number, string[]>>();
expectTypeOf(
	Stream.empty<string>().groupBy((v) => v.length)({
		collector: Reducer.join(),
	}),
).toEqualTypeOf<string>();
expectTypeOf(
	Stream.empty<string>().groupBy((v) => v.length)({
		// accepts readonly tuples
		collector: HashMap.reducer(),
	}),
).toEqualTypeOf<HashMap<number, string>>();
expectTypeOf(
	Stream.empty<string>().groupBy((v) => v.length)({
		// accepts normal tuples
		collector: HashMultiMapHashValue.reducer(),
	}),
).toEqualTypeOf<HashMultiMapHashValue<number, string>>();

// .indexed()
expectTypeOf(Stream.empty<string>().indexed()).toEqualTypeOf<
	Stream<[number, string]>
>();
expectTypeOf(Stream.of('a').indexed()).toEqualTypeOf<
	Stream.NonEmpty<[number, string]>
>();

// .indexWhere(..)
expectTypeOf(Stream.empty<number>().indexWhere(() => true)).toEqualTypeOf<
	number | undefined
>();
expectTypeOf(Stream.of(1).indexWhere(() => true)).toEqualTypeOf<
	number | undefined
>();

// .indexOf(..)
expectTypeOf(Stream.empty<number>().indexOf(2)).toEqualTypeOf<
	number | undefined
>();
expectTypeOf(Stream.of(1).indexOf(2)).toEqualTypeOf<number | undefined>();

// .indicesOf(..)
expectTypeOf(Stream.empty<string>().indicesOf('b')).toEqualTypeOf<
	Stream<number>
>();
expectTypeOf(Stream.of('a').indicesOf('b')).toEqualTypeOf<Stream<number>>();

// .indicesWhere(..)
expectTypeOf(Stream.empty<string>().indicesWhere(() => true)).toEqualTypeOf<
	Stream<number>
>();
expectTypeOf(Stream.of('a').indicesWhere(() => true)).toEqualTypeOf<
	Stream<number>
>();

// .some(..)
expectTypeOf(Stream.empty<string>().some(() => true)).toEqualTypeOf<boolean>();
expectTypeOf(Stream.of('a').some(() => true)).toEqualTypeOf<boolean>();

// .every(..)
expectTypeOf(Stream.empty<string>().every(() => true)).toEqualTypeOf<boolean>();
expectTypeOf(Stream.of('a').every(() => true)).toEqualTypeOf<boolean>();

// .contains(..)
expectTypeOf(Stream.empty<number>().contains(2)).toEqualTypeOf<boolean>();
expectTypeOf(Stream.of(1).contains(2)).toEqualTypeOf<boolean>();
// @ts-expect-error
Stream.of(1).contains('a');

// .containsSlice(..)
expectTypeOf(
	Stream.empty<number>().containsSlice([2]),
).toEqualTypeOf<boolean>();
expectTypeOf(Stream.of(1).containsSlice([2])).toEqualTypeOf<boolean>();
// @ts-expect-error
Stream.of(1).containsSlice(['a']);

// .intersperse(..)
expectTypeOf(
	Stream.empty<number>().intersperse(Stream.empty<number>()),
).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.of(1).intersperse(Stream.empty<number>())).toEqualTypeOf<
	Stream.NonEmpty<number>
>();
expectTypeOf(Stream.empty<number>().intersperse(Stream.of(1))).toEqualTypeOf<
	Stream<number>
>();
expectTypeOf(Stream.of(1).intersperse(Stream.of(1))).toEqualTypeOf<
	Stream.NonEmpty<number>
>();

// .last(..)
expectTypeOf(Stream.empty<number>().last()).toEqualTypeOf<number | undefined>();
// @ts-expect-error
Stream.of(1).last(3);

expectTypeOf(Stream.empty<number>().last(3)).toEqualTypeOf<number>();
expectTypeOf(Stream.empty<number>().last(() => 3)).toEqualTypeOf<number>();
expectTypeOf(Stream.of(1).last()).toEqualTypeOf<number>();
expectTypeOf(Stream.empty<number>().last('a' as string)).toEqualTypeOf<
	number | string
>();

// .map(..)
expectTypeOf(Stream.empty<number>().map(() => 'a')).toEqualTypeOf<
	Stream<string>
>();
expectTypeOf(Stream.of(1).map(() => 'a')).toEqualTypeOf<
	Stream.NonEmpty<string>
>();

// .mapPure(..)
expectTypeOf(Stream.empty<number>().mapPure(() => 'a')).toEqualTypeOf<
	Stream<string>
>();
expectTypeOf(Stream.of(1).mapPure(() => 'a')).toEqualTypeOf<
	Stream.NonEmpty<string>
>();

// .max(..)
expectTypeOf(Stream.empty<number>().max()).toEqualTypeOf<number | undefined>();
// @ts-expect-error
Stream.of(1).max(3);

expectTypeOf(Stream.empty<number>().max(3)).toEqualTypeOf<number>();
expectTypeOf(Stream.empty<number>().max(() => 3)).toEqualTypeOf<number>();
expectTypeOf(Stream.of(1).max()).toEqualTypeOf<number>();
expectTypeOf(Stream.empty<number>().max('a' as string)).toEqualTypeOf<
	number | string
>();

// .min(..)
expectTypeOf(Stream.empty<number>().min()).toEqualTypeOf<number | undefined>();
// @ts-expect-error
Stream.of(1).min(3);

expectTypeOf(Stream.empty<number>().min(3)).toEqualTypeOf<number>();
expectTypeOf(Stream.empty<number>().min(() => 3)).toEqualTypeOf<number>();
expectTypeOf(Stream.of(1).min()).toEqualTypeOf<number>();
expectTypeOf(Stream.empty<number>().min('a' as string)).toEqualTypeOf<
	number | string
>();

// .maxBy(..)
expectTypeOf(Stream.empty<number>().maxBy(() => 0, 3)).toEqualTypeOf<number>();
expectTypeOf(
	Stream.empty<number>().maxBy(
		() => 0,
		() => 3,
	),
).toEqualTypeOf<number>();
expectTypeOf(Stream.of(1).maxBy(() => 0)).toEqualTypeOf<number>();
expectTypeOf(
	Stream.empty<number>().maxBy(() => 0, 'a' as string),
).toEqualTypeOf<number | string>();

// .minBy(..)
expectTypeOf(Stream.empty<number>().minBy(() => 0, 3)).toEqualTypeOf<number>();
expectTypeOf(
	Stream.empty<number>().minBy(
		() => 0,
		() => 3,
	),
).toEqualTypeOf<number>();
expectTypeOf(Stream.of(1).minBy(() => 0)).toEqualTypeOf<number>();
expectTypeOf(
	Stream.empty<number>().minBy(() => 0, 'a' as string),
).toEqualTypeOf<number | string>();

// .joinStream(..)
expectTypeOf(Stream.empty<number>().joinStream({})).toEqualTypeOf<
	Stream<number>
>();
expectTypeOf(Stream.of(1).joinStream({})).toEqualTypeOf<Stream.NonEmpty<number>>();

expectTypeOf(
	Stream.empty<number>().joinStream({ start: Stream.empty<number>() }),
).toEqualTypeOf<Stream<number>>();
expectTypeOf(
	Stream.empty<number>().joinStream({ sep: Stream.empty<number>() }),
).toEqualTypeOf<Stream<number>>();
expectTypeOf(
	Stream.empty<number>().joinStream({ end: Stream.empty<number>() }),
).toEqualTypeOf<Stream<number>>();

expectTypeOf(
	Stream.empty<number>().joinStream({ sep: Stream.of(1) }),
).toEqualTypeOf<Stream<number>>();

// TODO
// expectType<Stream.NonEmpty<number>>(
//   Stream.empty<number>().joinStream({ start: Stream.of(1) })
// );
// expectType<Stream.NonEmpty<number>>(
//   Stream.empty<number>().joinStream({ end: Stream.of(1) })
// );

expectTypeOf(
	Stream.of(1).joinStream({ start: Stream.empty<number>() }),
).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(
	Stream.of(1).joinStream({ sep: Stream.empty<number>() }),
).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(
	Stream.of(1).joinStream({ end: Stream.empty<number>() }),
).toEqualTypeOf<Stream.NonEmpty<number>>();

expectTypeOf(Stream.of(1).joinStream({ start: Stream.of(1) })).toEqualTypeOf<
	Stream.NonEmpty<number>
>();
expectTypeOf(Stream.of(1).joinStream({ sep: Stream.of(1) })).toEqualTypeOf<
	Stream.NonEmpty<number>
>();
expectTypeOf(Stream.of(1).joinStream({ end: Stream.of(1) })).toEqualTypeOf<
	Stream.NonEmpty<number>
>();

// .partition(...)
expectTypeOf(Stream.partition(Stream.of(1), () => false)()).toEqualTypeOf<
	[number[], number[]]
>();
expectTypeOf(
	Stream.partition(
		Stream.of(1),
		() => false,
	)({
		collectorTrue: Reducer.toJSSet(),
		collectorFalse: Reducer.sum,
	}),
).toEqualTypeOf<[Set<number>, number]>();

expectTypeOf(
	Stream.partition(
		Stream.empty<number | string>(),
		(v): v is string => false,
	)(),
).toEqualTypeOf<[string[], number[]]>();
expectTypeOf(
	Stream.partition(
		Stream.empty<number | string>(),
		(v): v is string => false,
	)({
		collectorTrue: Reducer.toJSSet(),
		collectorFalse: Reducer.sum,
	}),
).toEqualTypeOf<[Set<string>, number]>();

// .prepend(..)
expectTypeOf(Stream.empty<number>().prepend(3)).toEqualTypeOf<
	Stream.NonEmpty<number>
>();
expectTypeOf(Stream.of(1).prepend(3)).toEqualTypeOf<Stream.NonEmpty<number>>();

// .reduce(..)
expectTypeOf(
	Stream.empty<number>().reduce(Reducer.isEmpty),
).toEqualTypeOf<boolean>();
expectTypeOf(Stream.of(1).reduce(Reducer.isEmpty)).toEqualTypeOf<boolean>();
// @ts-expect-error
Stream.empty<number | boolean>().reduce(Reducer.sum);

// .reduce(..) shape
expectTypeOf(
	Stream.empty<number>().reduce([
		Reducer.isEmpty,
		Reducer.sum,
		Reducer.join<number>(),
	]),
).toEqualTypeOf<[boolean, number, string]>();
expectTypeOf(
	Stream.of(1).reduce([Reducer.isEmpty, Reducer.sum, Reducer.join<number>()]),
).toEqualTypeOf<[boolean, number, string]>();

// .reduceStream(..) shapes
expectTypeOf(
	Stream.empty<number>().reduceStream([
		Reducer.isEmpty,
		Reducer.sum,
		Reducer.join<number>(),
	]),
).toEqualTypeOf<Stream<[boolean, number, string]>>();
expectTypeOf(
	Stream.of(1).reduceStream([
		Reducer.isEmpty,
		Reducer.sum,
		Reducer.join<number>(),
	]),
).toEqualTypeOf<Stream<[boolean, number, string]>>();
expectTypeOf(
	Stream.of(1).reduceStream({
		a: [Reducer.isEmpty, Reducer.sum],
		b: { c: Reducer.join<number>() },
	}),
).toEqualTypeOf<
	Stream<{ readonly a: [boolean, number]; readonly b: { readonly c: string } }>
>();

// .reduceStream(..)
expectTypeOf(
	Stream.empty<number>().reduceStream(Reducer.isEmpty),
).toEqualTypeOf<Stream<boolean>>();
expectTypeOf(Stream.of(1).reduceStream(Reducer.isEmpty)).toEqualTypeOf<
	Stream<boolean>
>();

// .repeat(..)
expectTypeOf(Stream.empty<number>().repeat()).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.of(1).repeat()).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(Stream.empty<number>().repeat(3)).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.of(1).repeat(3)).toEqualTypeOf<Stream.NonEmpty<number>>();

// .splitOn(..)
expectTypeOf(Stream.empty<number>().splitOn(3)).toEqualTypeOf<
	Stream<number[]>
>();
expectTypeOf(Stream.of(1).splitOn(3)).toEqualTypeOf<Stream<number[]>>();

// .splitOnSlice(...)
expectTypeOf(Stream.of(1).splitOnSlice(Stream.of(1))).toEqualTypeOf<
	Stream<number[]>
>();
expectTypeOf(
	Stream.of(1).splitOnSlice(Stream.of(1), { collector: Reducer.toJSSet() }),
).toEqualTypeOf<Stream<Set<number>>>();

// .splitWhere(..)
expectTypeOf(Stream.empty<number>().splitWhere(() => true)).toEqualTypeOf<
	Stream<number[]>
>();
expectTypeOf(Stream.of(1).splitWhere(() => true)).toEqualTypeOf<
	Stream<number[]>
>();

// .stream()
expectTypeOf(Stream.empty<number>().stream()).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.of(1).stream()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .take(..)
expectTypeOf(Stream.empty<number>().take(2)).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.of(1).take(0)).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.of(1).take(2)).toEqualTypeOf<Stream<number>>();

// .takeWhile(..)
expectTypeOf(Stream.empty<number>().takeWhile(() => true)).toEqualTypeOf<
	Stream<number>
>();
expectTypeOf(Stream.of(1).takeWhile(() => true)).toEqualTypeOf<
	Stream<number>
>();

// .toArray()
expectTypeOf(Stream.empty<number>().toArray()).toEqualTypeOf<number[]>();
expectTypeOf(Stream.of(1).toArray()).toEqualTypeOf<ArrayNonEmpty<number>>();

// .equals(..)
expectTypeOf(Stream.empty<number>().equals([1])).toEqualTypeOf<boolean>();
expectTypeOf(Stream.of(1).equals([1])).toEqualTypeOf<boolean>();

// .count()
expectTypeOf(Stream.empty<number>().count()).toEqualTypeOf<number>();
expectTypeOf(Stream.of(1).count()).toEqualTypeOf<number>();

// .countElement(..)
expectTypeOf(Stream.empty<number>().countElement(1)).toEqualTypeOf<number>();
expectTypeOf(Stream.of(1).countElement(1)).toEqualTypeOf<number>();

// .countElement(..) negate
expectTypeOf(
	Stream.empty<number>().countElement(1, { negate: true }),
).toEqualTypeOf<number>();
expectTypeOf(
	Stream.of(1).countElement(1, { negate: true }),
).toEqualTypeOf<number>();

// .join(..)
expectTypeOf(Stream.empty<number>().join()).toEqualTypeOf<string>();
expectTypeOf(Stream.of(1).join()).toEqualTypeOf<string>();

// .distinctPrevious(..)
expectTypeOf(Stream.empty<number>().distinctPrevious()).toEqualTypeOf<
	Stream<number>
>();
expectTypeOf(Stream.of(1).distinctPrevious()).toEqualTypeOf<
	Stream.NonEmpty<number>
>();

// .window(...)
expectTypeOf(Stream.of(1).window(2)).toEqualTypeOf<Stream<number[]>>();
expectTypeOf(
	Stream.of(1).window(2, { collector: Reducer.toJSSet() }),
).toEqualTypeOf<Stream<Set<number>>>();

// .withOnly(...)
expectTypeOf(
	Stream.empty<number | undefined>().withOnly([undefined]),
).toEqualTypeOf<Stream<undefined>>();
expectTypeOf(Stream.empty<number | undefined>().withOnly([1])).toEqualTypeOf<
	Stream<1>
>();
expectTypeOf(Stream.empty<number | undefined>().withOnly([1, 2])).toEqualTypeOf<
	Stream<1 | 2>
>();

// .without(...)
expectTypeOf(
	Stream.empty<number | undefined>().without([undefined]),
).toEqualTypeOf<Stream<number>>();
expectTypeOf(Stream.empty<number | undefined>().without([1])).toEqualTypeOf<
	Stream<number | undefined>
>();
expectTypeOf(
	Stream.empty<1 | 2 | 3 | undefined>().without([undefined, 2]),
).toEqualTypeOf<Stream<1 | 3>>();
