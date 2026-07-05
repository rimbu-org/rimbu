import { expectTypeOf } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { Stream } from '@rimbu/stream';
import type { AsyncTransformer } from '@rimbu/stream/async/transformer';

import { type AsyncFastIterator, AsyncStream } from '@rimbu/stream/async';
import { AsyncReducer } from '@rimbu/stream/async/reducer';
import { Reducer } from '@rimbu/stream/reducer';

// Variance
expectTypeOf(AsyncStream.empty<number>()).toExtend<
	AsyncStream<number | string>
>();
expectTypeOf(AsyncStream.empty<number | string>()).not.toExtend<
	AsyncStream<number>
>();

expectTypeOf(AsyncStream.of(1)).toExtend<AsyncStream<number | string>>();
expectTypeOf(AsyncStream.of<number | string>(1)).not.toExtend<
	AsyncStream<number>
>();

expectTypeOf(AsyncStream.of(1)).toExtend<
	AsyncStream.NonEmpty<number | string>
>();

// Iterable
expectTypeOf(AsyncStream.empty<number>()[Symbol.asyncIterator]()).toEqualTypeOf<
	AsyncFastIterator<number>
>();
expectTypeOf(AsyncStream.of(1)[Symbol.asyncIterator]()).toEqualTypeOf<
	AsyncFastIterator<number>
>();

// AsyncStream.empty<T>()
expectTypeOf(AsyncStream.empty<number>()).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(AsyncStream.empty<string>()).toEqualTypeOf<AsyncStream<string>>();
expectTypeOf(AsyncStream.empty<number>()).not.toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();
expectTypeOf(AsyncStream.empty<number>()).not.toExtend<
	AsyncStream.NonEmpty<number>
>();

// AsyncStream.of<T>(..)
expectTypeOf(AsyncStream.of(1)).toEqualTypeOf<AsyncStream.NonEmpty<number>>();
expectTypeOf(AsyncStream.of(1)).toExtend<AsyncStream<number>>();
// @ts-expect-error
AsyncStream.of();

// AsyncStream.from<T>(..)
expectTypeOf(AsyncStream.from([] as number[])).toEqualTypeOf<
	AsyncStream<number>
>();
expectTypeOf(AsyncStream.from([1])).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();
expectTypeOf(AsyncStream.from([1, 2, 3])).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();
expectTypeOf(AsyncStream.from(AsyncStream.of(1))).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();
expectTypeOf(AsyncStream.from(new Set([1]))).toEqualTypeOf<
	AsyncStream<number>
>();
// @ts-expect-error
AsyncStream.from();

// AsyncStream.flatten<T>(..)
// @ts-expect-error
AsyncStream.flatten(AsyncStream.empty<number>());

expectTypeOf(
	AsyncStream.flatten(AsyncStream.empty<AsyncStream<number>>()),
).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(
	AsyncStream.flatten(AsyncStream.empty<AsyncStream.NonEmpty<number>>()),
).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(
	AsyncStream.flatten(AsyncStream.of(AsyncStream.of(1))),
).toEqualTypeOf<AsyncStream.NonEmpty<number>>();

// AsyncStream.unfold(..)
expectTypeOf(AsyncStream.unfold(0, (v) => v + 1)).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();

// AsyncStream.unzip(..)
expectTypeOf(
	AsyncStream.unzip(AsyncStream.of<[number, string]>([0, 'a'], [1, 'b']), {
		length: 2,
	}),
).toEqualTypeOf<[AsyncStream.NonEmpty<number>, AsyncStream.NonEmpty<string>]>();
expectTypeOf(
	AsyncStream.unzip(AsyncStream.from(new Map<number, string>()), { length: 2 }),
).toEqualTypeOf<[AsyncStream<number>, AsyncStream<string>]>();
// @ts-expect-error
AsyncStream.unzip(AsyncStream.of(1), { length: 2 });
// @ts-expect-error
AsyncStream.unzip(AsyncStream.of([1, 2] as const), { length: 3 });

// AsyncStream.zip
expectTypeOf(
	AsyncStream.zip(AsyncStream.empty<number>(), AsyncStream.empty<string>()),
).toEqualTypeOf<AsyncStream<[number, string]>>();
expectTypeOf(
	AsyncStream.zip(AsyncStream.of(1), AsyncStream.empty<string>()),
).toEqualTypeOf<AsyncStream<[number, string]>>();
expectTypeOf(
	AsyncStream.zip(AsyncStream.empty<number>(), AsyncStream.of('a')),
).toEqualTypeOf<AsyncStream<[number, string]>>();
expectTypeOf(
	AsyncStream.zip(AsyncStream.of(1), AsyncStream.of('a')),
).toEqualTypeOf<AsyncStream.NonEmpty<[number, string]>>();
expectTypeOf(
	AsyncStream.zip(
		AsyncStream.empty<number>(),
		AsyncStream.of('a'),
		AsyncStream.of(true, false),
	),
).toEqualTypeOf<AsyncStream<[number, string, boolean]>>();
expectTypeOf(
	AsyncStream.zip(
		AsyncStream.of(1),
		AsyncStream.of('a'),
		AsyncStream.of(true, false),
	),
).toEqualTypeOf<AsyncStream.NonEmpty<[number, string, boolean]>>();

expectTypeOf(AsyncStream.zip(AsyncStream.of(1))).toEqualTypeOf<
	AsyncStream.NonEmpty<[number]>
>();

// @ts-expect-error
AsyncStream.zip();

// AsyncStream.zipAll(..)
expectTypeOf(
	AsyncStream.zipAll(
		true,
		AsyncStream.empty<number>(),
		AsyncStream.empty<string>(),
	),
).toEqualTypeOf<AsyncStream<[number | boolean, string | boolean]>>();
expectTypeOf(
	AsyncStream.zipAll(true, AsyncStream.of(1), AsyncStream.of('a')),
).toEqualTypeOf<AsyncStream.NonEmpty<[number | boolean, string | boolean]>>();

expectTypeOf(AsyncStream.zipAll(true, AsyncStream.of(1))).toEqualTypeOf<
	AsyncStream.NonEmpty<[number | boolean]>
>();
// @ts-expect-error
AsyncStream.zipAll(true);

// TODO
// expectType<AsyncStream.NonEmpty<[number | boolean, string | boolean]>>(
//   AsyncStream.zipAll(true, AsyncStream.empty<number>(), AsyncStream.of('a'))
// );

// @ts-expect-error
AsyncStream.zipAll(true);

// AsyncStream.zipWith(..)
expectTypeOf(
	AsyncStream.zipWith(
		AsyncStream.empty<number>(),
		AsyncStream.empty<string>(),
	)((a, b) => [a, true, b] as const),
).toEqualTypeOf<AsyncStream<readonly [number, true, string]>>();
expectTypeOf(
	AsyncStream.zipWith(
		AsyncStream.of(1),
		AsyncStream.empty<string>(),
	)((a, b) => [a, true, b] as const),
).toEqualTypeOf<AsyncStream<readonly [number, true, string]>>();
expectTypeOf(
	AsyncStream.zipWith(
		AsyncStream.empty<number>(),
		AsyncStream.of('a'),
	)((a, b) => [a, true, b] as const),
).toEqualTypeOf<AsyncStream<readonly [number, true, string]>>();
expectTypeOf(
	AsyncStream.zipWith(
		AsyncStream.of(1),
		AsyncStream.of('a'),
	)((a, b) => [a, true, b] as const),
).toEqualTypeOf<AsyncStream.NonEmpty<readonly [number, true, string]>>();

expectTypeOf(
	AsyncStream.zipWith(AsyncStream.of(1))((a) => [a] as const),
).toEqualTypeOf<AsyncStream.NonEmpty<readonly [number]>>();

// @ts-expect-error
AsyncStream.zipWith();

// AsyncStream.zipAllWith()
expectTypeOf(
	AsyncStream.zipAllWith(
		AsyncStream.empty<number>(),
		AsyncStream.empty<string>(),
	)(true, (a, b) => [a, true, b] as const),
).toEqualTypeOf<
	AsyncStream<readonly [number | boolean, true, string | boolean]>
>();
expectTypeOf(
	AsyncStream.zipAllWith(AsyncStream.of(1), AsyncStream.of('a'))(
		true,
		(a, b) => [a, true, b] as const,
	),
).toEqualTypeOf<
	AsyncStream.NonEmpty<readonly [number | boolean, true, string | boolean]>
>();
expectTypeOf(
	AsyncStream.zipAllWith(AsyncStream.of(1))(true, (a) => [a] as const),
).toEqualTypeOf<AsyncStream.NonEmpty<readonly [number | boolean]>>();

// @ts-expect-error
AsyncStream.zipAllWith();

// TODO
// expectType<AsyncStream.NonEmpty<[number | boolean, string | boolean]>>(
//   AsyncStream.zipAllWith(true, (a, b) => [a, true, b], AsyncStream.empty<number>(), AsyncStream.of('a'))
// );

// AsyncStream methods

// .assumeNonEmpty()
expectTypeOf(AsyncStream.empty<number>().assumeNonEmpty()).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();
expectTypeOf(AsyncStream.of(1).assumeNonEmpty()).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();

// .append()
expectTypeOf(AsyncStream.empty<number>().append(1)).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();
expectTypeOf(AsyncStream.of(1).append(1)).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();
expectTypeOf(AsyncStream.empty<number | string>().append('a')).toEqualTypeOf<
	AsyncStream.NonEmpty<number | string>
>();
expectTypeOf(AsyncStream.of(1 as number | string).append('a')).toEqualTypeOf<
	AsyncStream.NonEmpty<number | string>
>();

// .count()
expectTypeOf(await AsyncStream.empty<number>().count()).toEqualTypeOf<number>();
expectTypeOf(await AsyncStream.of(1).count()).toEqualTypeOf<number>();

// .countElement(..)
expectTypeOf(
	await AsyncStream.empty<number>().countElement(1),
).toEqualTypeOf<number>();
expectTypeOf(await AsyncStream.of(1).countElement(1)).toEqualTypeOf<number>();

// .countElement(..) negate
expectTypeOf(
	await AsyncStream.empty<number>().countElement(1, { negate: true }),
).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.of(1).countElement(1, { negate: true }),
).toEqualTypeOf<number>();

// .contains(..)
expectTypeOf(
	await AsyncStream.empty<number>().contains(1),
).toEqualTypeOf<boolean>();
expectTypeOf(await AsyncStream.of(1).contains(1)).toEqualTypeOf<boolean>();

// .containsSlice(..)
expectTypeOf(
	await AsyncStream.empty<number>().containsSlice([1]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	await AsyncStream.of(1).containsSlice([1]),
).toEqualTypeOf<boolean>();

// .collect(..)
expectTypeOf(AsyncStream.empty<number>().collect(() => '')).toEqualTypeOf<
	AsyncStream<string>
>();
expectTypeOf(AsyncStream.of(1).collect(() => '')).toEqualTypeOf<
	AsyncStream<string>
>();

// .concat(..)
expectTypeOf(
	AsyncStream.empty<number>().concat(AsyncStream.empty<number>()),
).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(
	AsyncStream.empty<number>().concat(
		AsyncStream.empty<number>(),
		AsyncStream.empty<number>(),
	),
).toEqualTypeOf<AsyncStream<number>>();

expectTypeOf(
	AsyncStream.empty<number>().concat(AsyncStream.of(1)),
).toEqualTypeOf<AsyncStream.NonEmpty<number>>();
expectTypeOf(
	AsyncStream.of(1).concat(AsyncStream.empty<number>()),
).toEqualTypeOf<AsyncStream.NonEmpty<number>>();
expectTypeOf(AsyncStream.of(1).concat(AsyncStream.of(1))).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();
expectTypeOf(
	AsyncStream.of(1).concat(AsyncStream.of(1), AsyncStream.of(1)),
).toEqualTypeOf<AsyncStream.NonEmpty<number>>();

expectTypeOf(
	AsyncStream.of(1).concat(AsyncStream.of(1), AsyncStream.of(1)),
).toEqualTypeOf<AsyncStream.NonEmpty<number>>();

// .drop(..)
expectTypeOf(AsyncStream.empty<number>().drop(4)).toEqualTypeOf<
	AsyncStream<number>
>();
expectTypeOf(AsyncStream.of(1).drop(4)).toEqualTypeOf<AsyncStream<number>>();

// .dropWhile(..)
expectTypeOf(AsyncStream.empty<number>().dropWhile(() => true)).toEqualTypeOf<
	AsyncStream<number>
>();
expectTypeOf(AsyncStream.of(1).dropWhile(() => true)).toEqualTypeOf<
	AsyncStream<number>
>();

// .elementtAt(..)
expectTypeOf(
	await AsyncStream.empty<number>().at(1, 3),
).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().at(1, '' as string),
).toEqualTypeOf<number | string>();

expectTypeOf(
	await AsyncStream.empty<number>().at(1, () => 3),
).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().at(1, () => '' as string),
).toEqualTypeOf<number | string>();

// .filter(..)
expectTypeOf(AsyncStream.empty<number>().filter(() => true)).toEqualTypeOf<
	AsyncStream<number>
>();
expectTypeOf(AsyncStream.of(1).filter(() => true)).toEqualTypeOf<
	AsyncStream<number>
>();

// .filter(..) negate
expectTypeOf(
	AsyncStream.empty<number>().filter(() => true, { negate: true }),
).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(
	AsyncStream.of(1).filter(() => true, { negate: true }),
).toEqualTypeOf<AsyncStream<number>>();

// .filterPure(..)
expectTypeOf(
	AsyncStream.empty<number>().filterPure({ pred: () => true }),
).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(AsyncStream.of(1).filterPure({ pred: () => true })).toEqualTypeOf<
	AsyncStream<number>
>();

// .filterPure(..) negate
expectTypeOf(
	AsyncStream.empty<number>().filterPure({ pred: () => true, negate: true }),
).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(
	AsyncStream.of(1).filterPure({ pred: () => true, negate: true }),
).toEqualTypeOf<AsyncStream<number>>();

// .find(..)
expectTypeOf(await AsyncStream.empty<number>().find(() => true)).toEqualTypeOf<
	number | undefined
>();
expectTypeOf(
	await AsyncStream.empty<number>().find(() => true, { occurrence: 1 }),
).toEqualTypeOf<number | undefined>();
expectTypeOf(await AsyncStream.of(1).find(() => true)).toEqualTypeOf<
	number | undefined
>();
expectTypeOf(
	await AsyncStream.of(1).find(() => true, { occurrence: 1 }),
).toEqualTypeOf<number | undefined>();
expectTypeOf(
	await AsyncStream.empty<number>().find(() => true, { otherwise: () => 1 }),
).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.of(1).find(() => true, { otherwise: () => 1 }),
).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().find(() => true, {
		otherwise: 'a' as string,
	}),
).toEqualTypeOf<number | string>();
expectTypeOf(
	await AsyncStream.of(1).find(() => true, { otherwise: 'a' as string }),
).toEqualTypeOf<number | string>();

// .first(..)
expectTypeOf(await AsyncStream.empty<number>().first()).toEqualTypeOf<
	number | undefined
>();
// @ts-expect-error
AsyncStream.of(1).first(3);

expectTypeOf(
	await AsyncStream.empty<number>().first(1),
).toEqualTypeOf<number>();
expectTypeOf(await AsyncStream.of(1).first()).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().first('a' as string),
).toEqualTypeOf<number | string>();

// .forEach(..)
expectTypeOf(
	await AsyncStream.empty<number>().forEach(() => {}),
).toEqualTypeOf<void>();
expectTypeOf(await AsyncStream.of(1).forEach(() => {})).toEqualTypeOf<void>();

// .forEachPure(..)
expectTypeOf(
	await AsyncStream.empty<number>().forEachPure(() => {}),
).toEqualTypeOf<void>();
expectTypeOf(
	await AsyncStream.of(1).forEachPure(() => {}),
).toEqualTypeOf<void>();

// .flatMap(..)
expectTypeOf(
	AsyncStream.empty<number>().flatMap(() => AsyncStream.empty<string>()),
).toEqualTypeOf<AsyncStream<string>>();
expectTypeOf(
	AsyncStream.of(1).flatMap(() => AsyncStream.empty<string>()),
).toEqualTypeOf<AsyncStream<string>>();
expectTypeOf(
	AsyncStream.of(1).flatMap(() => AsyncStream.empty<string>()),
).toEqualTypeOf<AsyncStream<string>>();
expectTypeOf(
	AsyncStream.of(1).flatMap(() => AsyncStream.of('a')),
).toEqualTypeOf<AsyncStream.NonEmpty<string>>();

// .flatZip(..)
expectTypeOf(
	AsyncStream.empty<number>().flatZip((v) => [String(v)]),
).toEqualTypeOf<AsyncStream<[number, string]>>();
expectTypeOf(
	AsyncStream.of(1).flatZip(() => AsyncStream.empty<string>()),
).toEqualTypeOf<AsyncStream<[number, string]>>();
expectTypeOf(AsyncStream.of(1).flatZip((v) => [String(v)])).toEqualTypeOf<
	AsyncStream.NonEmpty<[number, string]>
>();

// .transform(..)
expectTypeOf(
	AsyncStream.empty<number>().transform(
		null as unknown as AsyncTransformer<number, string>,
	),
).toEqualTypeOf<AsyncStream<string>>();
expectTypeOf(
	AsyncStream.empty<number>().transform(
		null as unknown as AsyncTransformer.NonEmpty<number, string>,
	),
).toEqualTypeOf<AsyncStream<string>>();
expectTypeOf(
	AsyncStream.of(1).transform(
		null as unknown as AsyncTransformer<number, string>,
	),
).toEqualTypeOf<AsyncStream<string>>();
expectTypeOf(
	AsyncStream.of(1).transform(
		null as unknown as AsyncTransformer.NonEmpty<number, string>,
	),
).toEqualTypeOf<AsyncStream.NonEmpty<string>>();
expectTypeOf(
	AsyncStream.of(1).transform(
		null as unknown as AsyncReducer<number, Stream<string>>,
	),
).toEqualTypeOf<AsyncStream<string>>();
expectTypeOf(
	AsyncStream.of(1).transform(
		null as unknown as AsyncReducer<number, Stream.NonEmpty<string>>,
	),
).toEqualTypeOf<AsyncStream.NonEmpty<string>>();

// .fold(..)
expectTypeOf(
	await AsyncStream.empty<number>().fold('a', async () => 'b'),
).toEqualTypeOf<string>();
expectTypeOf(
	await AsyncStream.of(1).fold('a', async () => 'b'),
).toEqualTypeOf<string>();
expectTypeOf(
	await AsyncStream.empty<number>().fold(
		async () => 'a',
		() => 'b',
	),
).toEqualTypeOf<string>();
expectTypeOf(
	await AsyncStream.of(1).fold(
		async () => 'a',
		() => 'b',
	),
).toEqualTypeOf<string>();

// .foldStream(..)
expectTypeOf(
	AsyncStream.empty<number>().foldStream('a', () => 'b'),
).toEqualTypeOf<AsyncStream<string>>();
expectTypeOf(AsyncStream.of(1).foldStream('a', () => 'b')).toEqualTypeOf<
	AsyncStream.NonEmpty<string>
>();

// .distinctPrevious(..)
expectTypeOf(AsyncStream.empty<number>().distinctPrevious()).toEqualTypeOf<
	AsyncStream<number>
>();
expectTypeOf(AsyncStream.of(1).distinctPrevious()).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();

// .indexed()
expectTypeOf(AsyncStream.empty<string>().indexed()).toEqualTypeOf<
	AsyncStream<[number, string]>
>();
expectTypeOf(AsyncStream.of('a').indexed()).toEqualTypeOf<
	AsyncStream.NonEmpty<[number, string]>
>();

// .indexOf(..)
expectTypeOf(await AsyncStream.empty<string>().indexOf('b')).toEqualTypeOf<
	number | undefined
>();
expectTypeOf(await AsyncStream.of('a').indexOf('b')).toEqualTypeOf<
	number | undefined
>();

// .indexOf(..)
expectTypeOf(await AsyncStream.empty<string>().indexOf('b')).toEqualTypeOf<
	number | undefined
>();
expectTypeOf(await AsyncStream.of('a').indexOf('b')).toEqualTypeOf<
	number | undefined
>();

// .indicesWhere(..)
expectTypeOf(
	AsyncStream.empty<string>().indicesWhere(() => true),
).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(AsyncStream.of('a').indicesWhere(() => true)).toEqualTypeOf<
	AsyncStream<number>
>();

// .indicesWhere(..)
expectTypeOf(
	AsyncStream.empty<string>().indicesWhere(() => true),
).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(AsyncStream.of('a').indicesWhere(() => true)).toEqualTypeOf<
	AsyncStream<number>
>();

// .intersperse(..)
expectTypeOf(
	AsyncStream.empty<number>().intersperse(AsyncStream.empty<number>()),
).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(
	AsyncStream.of(1).intersperse(AsyncStream.empty<number>()),
).toEqualTypeOf<AsyncStream.NonEmpty<number>>();
expectTypeOf(
	AsyncStream.empty<number>().intersperse(AsyncStream.of(1)),
).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(AsyncStream.of(1).intersperse(AsyncStream.of(1))).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();

// .last(..)
expectTypeOf(await AsyncStream.empty<number>().last()).toEqualTypeOf<
	number | undefined
>();
// @ts-expect-error
AsyncStream.of(1).last(3);

expectTypeOf(await AsyncStream.empty<number>().last(3)).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().last(() => 3),
).toEqualTypeOf<number>();
expectTypeOf(await AsyncStream.of(1).last()).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().last('a' as string),
).toEqualTypeOf<number | string>();

// .single(...)
expectTypeOf(await AsyncStream.empty<number>().single()).toEqualTypeOf<
	number | undefined
>();
expectTypeOf(
	await AsyncStream.empty<number>().single(1),
).toEqualTypeOf<number>();
expectTypeOf(await AsyncStream.empty<number>().single('a')).toEqualTypeOf<
	number | string
>();
expectTypeOf(await AsyncStream.of(1, 2, 3).single()).toEqualTypeOf<
	number | undefined
>();
expectTypeOf(await AsyncStream.of(1, 2, 3).single(1)).toEqualTypeOf<number>();
expectTypeOf(await AsyncStream.of(1, 2, 3).single('a')).toEqualTypeOf<
	number | string
>();

// .map(..)
expectTypeOf(AsyncStream.empty<number>().map(() => 'a')).toEqualTypeOf<
	AsyncStream<string>
>();
expectTypeOf(AsyncStream.of(1).map(() => 'a')).toEqualTypeOf<
	AsyncStream.NonEmpty<string>
>();

// .mapPure(..)
expectTypeOf(AsyncStream.empty<number>().mapPure(() => 'a')).toEqualTypeOf<
	AsyncStream<string>
>();
expectTypeOf(AsyncStream.of(1).mapPure(() => 'a')).toEqualTypeOf<
	AsyncStream.NonEmpty<string>
>();

// .some(..)
expectTypeOf(
	await AsyncStream.empty<number>().some(() => true),
).toEqualTypeOf<boolean>();
expectTypeOf(await AsyncStream.of(1).some(() => true)).toEqualTypeOf<boolean>();

// .every(..)
expectTypeOf(
	await AsyncStream.empty<number>().every(() => true),
).toEqualTypeOf<boolean>();
expectTypeOf(
	await AsyncStream.of(1).every(() => true),
).toEqualTypeOf<boolean>();

// .max(..)
expectTypeOf(await AsyncStream.empty<number>().max()).toEqualTypeOf<
	number | undefined
>();
// @ts-expect-error
AsyncStream.of(1).max(3);

expectTypeOf(await AsyncStream.empty<number>().max(3)).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().max(() => 3),
).toEqualTypeOf<number>();
expectTypeOf(await AsyncStream.of(1).max()).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().max('a' as string),
).toEqualTypeOf<number | string>();

// .min(..)
expectTypeOf(await AsyncStream.empty<number>().min()).toEqualTypeOf<
	number | undefined
>();
// @ts-expect-error
AsyncStream.of(1).min(3);

expectTypeOf(await AsyncStream.empty<number>().min(3)).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().min(() => 3),
).toEqualTypeOf<number>();
expectTypeOf(await AsyncStream.of(1).min()).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().min('a' as string),
).toEqualTypeOf<number | string>();

// .maxBy(..)
expectTypeOf(
	await AsyncStream.empty<number>().maxBy(() => 0, 3),
).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().maxBy(
		() => 0,
		() => 3,
	),
).toEqualTypeOf<number>();
expectTypeOf(await AsyncStream.of(1).maxBy(() => 0)).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().maxBy(() => 0, 'a' as string),
).toEqualTypeOf<number | string>();

// .minBy(..)
expectTypeOf(
	await AsyncStream.empty<number>().minBy(() => 0, 3),
).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().minBy(
		() => 0,
		() => 3,
	),
).toEqualTypeOf<number>();
expectTypeOf(await AsyncStream.of(1).minBy(() => 0)).toEqualTypeOf<number>();
expectTypeOf(
	await AsyncStream.empty<number>().minBy(() => 0, 'a' as string),
).toEqualTypeOf<number | string>();

// .joinStream(..)
expectTypeOf(AsyncStream.empty<number>().joinStream({})).toEqualTypeOf<
	AsyncStream<number>
>();
expectTypeOf(AsyncStream.of(1).joinStream({})).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();

expectTypeOf(
	AsyncStream.empty<number>().joinStream({ start: AsyncStream.empty<number>() }),
).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(
	AsyncStream.empty<number>().joinStream({ sep: AsyncStream.empty<number>() }),
).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(
	AsyncStream.empty<number>().joinStream({ end: AsyncStream.empty<number>() }),
).toEqualTypeOf<AsyncStream<number>>();

expectTypeOf(
	AsyncStream.empty<number>().joinStream({ sep: AsyncStream.of(1) }),
).toEqualTypeOf<AsyncStream<number>>();

// TODO
// expectType<AsyncStream.NonEmpty<number>>(
//   AsyncStream.empty<number>().joinStream({ start: AsyncStream.of(1) })
// );
// expectType<AsyncStream.NonEmpty<number>>(
//   AsyncStream.empty<number>().joinStream({ end: AsyncStream.of(1) })
// );

expectTypeOf(
	AsyncStream.of(1).joinStream({ start: AsyncStream.empty<number>() }),
).toEqualTypeOf<AsyncStream.NonEmpty<number>>();
expectTypeOf(
	AsyncStream.of(1).joinStream({ sep: AsyncStream.empty<number>() }),
).toEqualTypeOf<AsyncStream.NonEmpty<number>>();
expectTypeOf(
	AsyncStream.of(1).joinStream({ end: AsyncStream.empty<number>() }),
).toEqualTypeOf<AsyncStream.NonEmpty<number>>();

expectTypeOf(
	AsyncStream.of(1).joinStream({ start: AsyncStream.of(1) }),
).toEqualTypeOf<AsyncStream.NonEmpty<number>>();
expectTypeOf(
	AsyncStream.of(1).joinStream({ sep: AsyncStream.of(1) }),
).toEqualTypeOf<AsyncStream.NonEmpty<number>>();
expectTypeOf(
	AsyncStream.of(1).joinStream({ end: AsyncStream.of(1) }),
).toEqualTypeOf<AsyncStream.NonEmpty<number>>();

// .prepend(..)
expectTypeOf(AsyncStream.empty<number>().prepend(3)).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();
expectTypeOf(AsyncStream.of(1).prepend(3)).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();

// .join(..)
expectTypeOf(await AsyncStream.empty<number>().join()).toEqualTypeOf<string>();
expectTypeOf(await AsyncStream.of(1, 2, 3).join()).toEqualTypeOf<string>();

// .reduce(..)
expectTypeOf(
	await AsyncStream.empty<number>().reduce(AsyncReducer.isEmpty),
).toEqualTypeOf<boolean>();
expectTypeOf(
	await AsyncStream.of(1).reduce(AsyncReducer.isEmpty),
).toEqualTypeOf<boolean>();
// @ts-expect-error
AsyncStream.empty<number | boolean>().reduce([Reducer.sum]);

// .reduce(..) shape
expectTypeOf(
	await AsyncStream.empty<number>().reduce([
		AsyncReducer.isEmpty,
		Reducer.sum,
		Reducer.join<number>(),
	]),
).toEqualTypeOf<[boolean, number, string]>();
expectTypeOf(
	await AsyncStream.of(1).reduce([
		AsyncReducer.isEmpty,
		Reducer.sum,
		Reducer.join<number>(),
	]),
).toEqualTypeOf<[boolean, number, string]>();

// .reduceStream(..) shape
expectTypeOf(
	AsyncStream.empty<number>().reduceStream([
		AsyncReducer.isEmpty,
		Reducer.sum,
		Reducer.join<number>(),
	]),
).toEqualTypeOf<AsyncStream<[boolean, number, string]>>();
expectTypeOf(
	AsyncStream.of(1).reduceStream([
		AsyncReducer.isEmpty,
		Reducer.sum,
		Reducer.join<number>(),
	]),
).toEqualTypeOf<AsyncStream<[boolean, number, string]>>();

// .reduceStream(..)
expectTypeOf(
	AsyncStream.empty<number>().reduceStream(AsyncReducer.isEmpty),
).toEqualTypeOf<AsyncStream<boolean>>();
expectTypeOf(
	AsyncStream.of(1).reduceStream(AsyncReducer.isEmpty),
).toEqualTypeOf<AsyncStream<boolean>>();

// .repeat(..)
expectTypeOf(AsyncStream.empty<number>().repeat()).toEqualTypeOf<
	AsyncStream<number>
>();
expectTypeOf(AsyncStream.of(1).repeat()).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();
expectTypeOf(AsyncStream.empty<number>().repeat(3)).toEqualTypeOf<
	AsyncStream<number>
>();
expectTypeOf(AsyncStream.of(1).repeat(3)).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();

// .splitOn(..)
expectTypeOf(AsyncStream.empty<number>().splitOn(3)).toEqualTypeOf<
	AsyncStream<number[]>
>();
expectTypeOf(AsyncStream.of(1).splitOn(3)).toEqualTypeOf<
	AsyncStream<number[]>
>();

// .splitWhere(..)
expectTypeOf(AsyncStream.empty<number>().splitWhere(() => true)).toEqualTypeOf<
	AsyncStream<number[]>
>();
expectTypeOf(AsyncStream.of(1).splitWhere(() => true)).toEqualTypeOf<
	AsyncStream<number[]>
>();

// .asyncStream()
expectTypeOf(AsyncStream.empty<number>().asyncStream()).toEqualTypeOf<
	AsyncStream<number>
>();
expectTypeOf(AsyncStream.of(1).asyncStream()).toEqualTypeOf<
	AsyncStream.NonEmpty<number>
>();

// .take(..)
expectTypeOf(AsyncStream.empty<number>().take(2)).toEqualTypeOf<
	AsyncStream<number>
>();
expectTypeOf(AsyncStream.of(1).take(0)).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(AsyncStream.of(1).take(2)).toEqualTypeOf<AsyncStream<number>>();

// .takeWhile(..)
expectTypeOf(AsyncStream.empty<number>().takeWhile(() => true)).toEqualTypeOf<
	AsyncStream<number>
>();
expectTypeOf(AsyncStream.of(1).takeWhile(() => true)).toEqualTypeOf<
	AsyncStream<number>
>();

// .toArray()
expectTypeOf(await AsyncStream.empty<number>().toArray()).toEqualTypeOf<
	number[]
>();
expectTypeOf(await AsyncStream.of(1).toArray()).toEqualTypeOf<
	ArrayNonEmpty<number>
>();

// .equals()
expectTypeOf(
	await AsyncStream.empty<number>().equals([1, 2]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	await AsyncStream.of(1, 2).equals([1, 2]),
).toEqualTypeOf<boolean>();

// .withOnly(...)
expectTypeOf(
	AsyncStream.empty<number | undefined>().withOnly([undefined]),
).toEqualTypeOf<AsyncStream<undefined>>();
expectTypeOf(
	AsyncStream.empty<number | undefined>().withOnly([1]),
).toEqualTypeOf<AsyncStream<1>>();
expectTypeOf(
	AsyncStream.empty<number | undefined>().withOnly([1, 2]),
).toEqualTypeOf<AsyncStream<1 | 2>>();

// .without(...)
expectTypeOf(
	AsyncStream.empty<number | undefined>().without([undefined]),
).toEqualTypeOf<AsyncStream<number>>();
expectTypeOf(
	AsyncStream.empty<number | undefined>().without([1]),
).toEqualTypeOf<AsyncStream<number | undefined>>();
expectTypeOf(
	AsyncStream.empty<1 | 2 | 3 | undefined>().without([undefined, 2]),
).toEqualTypeOf<AsyncStream<1 | 3>>();
