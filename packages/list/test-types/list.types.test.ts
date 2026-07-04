import { expectTypeOf } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { FastIterator, Stream } from '@rimbu/stream';

import { List } from '@rimbu/list';

expectTypeOf(List.of(1)).toExtend<List<number>>();
expectTypeOf(List.empty<number>()).not.toExtend<List.NonEmpty<number>>();

// Fast Iterator
expectTypeOf(List.empty<number>()[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<number>
>();
expectTypeOf(List.of(1)[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<number>
>();

// List.builder()
expectTypeOf(List.builder<number>()).toEqualTypeOf<List.Builder<number>>();

// List.createContext()
expectTypeOf(List.createContext()).toEqualTypeOf<List.Context>();

// List.defaultContext()
expectTypeOf(List.defaultContext).toEqualTypeOf<List.Context>();

// List.empty()
expectTypeOf(List.empty<number>()).toEqualTypeOf<List<number>>();

// List.from(..)
expectTypeOf(List.from([] as number[])).toEqualTypeOf<List<number>>();
expectTypeOf(List.from([1])).toEqualTypeOf<List.NonEmpty<number>>();
expectTypeOf(List.from([1], [2])).toEqualTypeOf<List.NonEmpty<number>>();
expectTypeOf(List.from(new Set([1]))).toEqualTypeOf<List<number>>();
// TODO
// expectType<List.NonEmpty<number>>(List.from([] as number[], [1]));

// List.of(..)
expectTypeOf(List.of(1)).toEqualTypeOf<List.NonEmpty<number>>();
expectTypeOf(List.of(1, 2, 3)).toEqualTypeOf<List.NonEmpty<number>>();

// .append(..)
expectTypeOf(List.empty<number>().append(2)).toEqualTypeOf<
	List.NonEmpty<number>
>();
expectTypeOf(List.of(1).append(2)).toEqualTypeOf<List.NonEmpty<number>>();

// .assumeNonEmpty()
try {
	expectTypeOf(List.empty<number>().assumeNonEmpty()).toEqualTypeOf<
		List.NonEmpty<number>
	>();
} catch {}

expectTypeOf(List.of(1).assumeNonEmpty()).toEqualTypeOf<
	List.NonEmpty<number>
>();

// .collect(..)
expectTypeOf(List.empty<number>().collect(() => 'a')).toEqualTypeOf<
	List<string>
>();
expectTypeOf(List.of(1).collect(() => 'a')).toEqualTypeOf<List<string>>();

// .concat(..)
expectTypeOf(List.empty<number>().concat(List.empty<number>())).toEqualTypeOf<
	List<number>
>();
expectTypeOf(List.empty<number>().concat(List.of(1))).toEqualTypeOf<
	List.NonEmpty<number>
>();
expectTypeOf(List.of(1).concat(List.empty<number>())).toEqualTypeOf<
	List.NonEmpty<number>
>();
expectTypeOf(List.of(1).concat(List.of(1))).toEqualTypeOf<
	List.NonEmpty<number>
>();
// TODO
// expectType<List.NonEmpty<number>>(List.empty<number>().concat(List.empty<number>(), List.of(1)));

// .drop(..)
expectTypeOf(List.empty<number>().drop(3)).toEqualTypeOf<List<number>>();
expectTypeOf(List.of(1).drop(3)).toEqualTypeOf<List<number>>();

// .filter(..)
expectTypeOf(List.empty<number>().filter(() => true)).toEqualTypeOf<
	List<number>
>();
expectTypeOf(List.of(1).filter(() => true)).toEqualTypeOf<List<number>>();

// .first(..)
expectTypeOf(List.empty<number>().first()).toEqualTypeOf<number | undefined>();
// @ts-expect-error
List.of(1).first(3);
expectTypeOf(List.empty<number>().first(3)).toEqualTypeOf<number>();
expectTypeOf(List.of(1).first()).toEqualTypeOf<number>();
expectTypeOf(List.empty<number>().first('a' as string)).toEqualTypeOf<
	number | string
>();
expectTypeOf(List.empty<number>().first(() => 'a')).toEqualTypeOf<
	number | string
>();

// .flatMap(..)
expectTypeOf(
	List.empty<number>().flatMap(() => List.empty<string>()),
).toEqualTypeOf<List<string>>();
expectTypeOf(List.empty<number>().flatMap(() => List.of('a'))).toEqualTypeOf<
	List<string>
>();
expectTypeOf(List.of(1).flatMap(() => List.empty<string>())).toEqualTypeOf<
	List<string>
>();
expectTypeOf(List.of(1).flatMap(() => List.of('a'))).toEqualTypeOf<
	List.NonEmpty<string>
>();
expectTypeOf(
	List.of(1).flatMap(() => List.of('a'), { range: { amount: 10 } }),
).toEqualTypeOf<List<string>>();

// .flatten()
// @ts-expect-error
List.flatten(List.empty<number>());
expectTypeOf(List.flatten(List.of(List.of(1)))).toEqualTypeOf<
	List.NonEmpty<number>
>();
expectTypeOf(List.flatten(List.of(List.empty<number>()))).toEqualTypeOf<
	List<number>
>();
expectTypeOf(List.flatten(List.of(List.of(1)).asNormal())).toEqualTypeOf<
	List<number>
>();
expectTypeOf(List.flatten(List.of(List.from([1, 2])))).toEqualTypeOf<
	List.NonEmpty<number>
>();
expectTypeOf(List.flatten(List.of('abc'))).toEqualTypeOf<List<string>>();

// .get(..)
expectTypeOf(List.of(1).get(3)).toEqualTypeOf<number | undefined>();
expectTypeOf(List.empty<number>().get(3)).toEqualTypeOf<number | undefined>();
expectTypeOf(List.empty<number>().get(2, 3)).toEqualTypeOf<number>();
expectTypeOf(List.of(1).get(2, 3)).toEqualTypeOf<number>();
expectTypeOf(List.empty<number>().get(2, () => 3)).toEqualTypeOf<number>();
expectTypeOf(List.of(1).get(2, () => 3)).toEqualTypeOf<number>();
expectTypeOf(List.empty<number>().get(2, 'a' as string)).toEqualTypeOf<
	number | string
>();
expectTypeOf(List.of(1).get(2, 'a' as string)).toEqualTypeOf<number | string>();

// .insert(..)
expectTypeOf(
	List.empty<number>().insert(1, List.empty<number>()),
).toEqualTypeOf<List<number>>();
expectTypeOf(List.empty<number>().insert(1, List.of(1))).toEqualTypeOf<
	List.NonEmpty<number>
>();
expectTypeOf(List.of(1).insert(1, List.empty<number>())).toEqualTypeOf<
	List.NonEmpty<number>
>();
expectTypeOf(List.of(1).insert(1, List.of(2))).toEqualTypeOf<
	List.NonEmpty<number>
>();

// .isEmpty
expectTypeOf(List.empty<number>().isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(List.of(1).isEmpty).toEqualTypeOf<false>();

// .last(..)
expectTypeOf(List.empty<number>().last()).toEqualTypeOf<number | undefined>();
// @ts-expect-error
List.of(1).last(3);
expectTypeOf(List.empty<number>().last(3)).toEqualTypeOf<number>();
expectTypeOf(List.of(1).last()).toEqualTypeOf<number>();
expectTypeOf(List.empty<number>().last('a' as string)).toEqualTypeOf<
	number | string
>();
expectTypeOf(List.empty<number>().last(() => 'a')).toEqualTypeOf<
	number | string
>();

// .map(..)
expectTypeOf(List.empty<number>().map(() => 'a')).toEqualTypeOf<List<string>>();
expectTypeOf(List.of(1).map(() => 'a')).toEqualTypeOf<List.NonEmpty<string>>();

// .nonEmpty()
expectTypeOf(List.empty<number>().nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(List.of(1).nonEmpty()).toEqualTypeOf<boolean>();

// .padTo(..)
expectTypeOf(List.empty<number>().padTo(1, 3)).toEqualTypeOf<List<number>>();
expectTypeOf(List.of(1).padTo(1, 3)).toEqualTypeOf<List.NonEmpty<number>>();

// .prepend(..)
expectTypeOf(List.empty<number>().prepend(2)).toEqualTypeOf<
	List.NonEmpty<number>
>();
expectTypeOf(List.of(1).prepend(2)).toEqualTypeOf<List.NonEmpty<number>>();

// .remove(..)
expectTypeOf(List.empty<number>().remove(3)).toEqualTypeOf<List<number>>();
expectTypeOf(List.of(1).remove(3)).toEqualTypeOf<List<number>>();
expectTypeOf(List.empty<number>().remove(3, { amount: 3 })).toEqualTypeOf<
	List<number>
>();
expectTypeOf(List.of(1).remove(3, { amount: 3 })).toEqualTypeOf<List<number>>();

// .repeat(..)
expectTypeOf(List.empty<number>().repeat(3)).toEqualTypeOf<List<number>>();
expectTypeOf(List.of(1).repeat(3)).toEqualTypeOf<List.NonEmpty<number>>();

// .reversed()
expectTypeOf(List.empty<number>().reversed()).toEqualTypeOf<List<number>>();
expectTypeOf(List.of(1).reversed()).toEqualTypeOf<List.NonEmpty<number>>();

// .rotate(..)
expectTypeOf(List.empty<number>().rotate(2)).toEqualTypeOf<List<number>>();
expectTypeOf(List.of(1).rotate(2)).toEqualTypeOf<List.NonEmpty<number>>();

// .slice(..)
expectTypeOf(List.empty<number>().slice({ amount: 2 })).toEqualTypeOf<
	List<number>
>();
expectTypeOf(List.of(1).slice({ amount: 2 })).toEqualTypeOf<List<number>>();

// .splice(..)
expectTypeOf(
	List.empty<number>().splice({
		index: 1,
		remove: 2,
		insert: List.empty<number>(),
	}),
).toEqualTypeOf<List<number>>();
expectTypeOf(
	List.of(1).splice({ index: 1, remove: 2, insert: List.empty<number>() }),
).toEqualTypeOf<List<number>>();

expectTypeOf(
	List.empty<number>().splice({ index: 1, remove: 2, insert: List.of(1) }),
).toEqualTypeOf<List.NonEmpty<number>>();
expectTypeOf(
	List.of(1).splice({ index: 1, remove: 2, insert: List.of(1) }),
).toEqualTypeOf<List.NonEmpty<number>>();

// .stream()
expectTypeOf(List.empty<number>().stream()).toEqualTypeOf<Stream<number>>();
expectTypeOf(List.of(1).stream()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .streamRange(..)
expectTypeOf(List.empty<number>().streamRange({ amount: 10 })).toEqualTypeOf<
	Stream<number>
>();
expectTypeOf(List.of(1).streamRange({ amount: 10 })).toEqualTypeOf<
	Stream<number>
>();

// .take(..)
expectTypeOf(List.empty<number>().take(2)).toEqualTypeOf<List<number>>();
expectTypeOf(List.of(1).take(0)).toEqualTypeOf<List<number>>();
expectTypeOf(List.of(1).take(2 as number)).toEqualTypeOf<List<number>>();
expectTypeOf(List.of(1).take(2)).toEqualTypeOf<List.NonEmpty<number>>();

// .toArray()
expectTypeOf(List.empty<number>().toArray()).toEqualTypeOf<number[]>();
expectTypeOf(List.of(1).toArray()).toEqualTypeOf<ArrayNonEmpty<number>>();

// .toBuilder()
expectTypeOf(List.empty<number>().toBuilder()).toEqualTypeOf<
	List.Builder<number>
>();
expectTypeOf(List.of(1).toBuilder()).toEqualTypeOf<List.Builder<number>>();

// .unzip(..)
try {
	// @ts-expect-error
	List.unzip(List.of(1));
} catch {}
expectTypeOf(
	List.unzip(List.empty<[number, string]>(), { length: 2 }),
).toEqualTypeOf<[List<number>, List<string>]>();
expectTypeOf(
	List.unzip(List.of([1, 'a'] as [number, string]), { length: 2 }),
).toEqualTypeOf<[List.NonEmpty<number>, List.NonEmpty<string>]>();
expectTypeOf(
	List.unzip(List.of([1, 'a', true] as [number, string, boolean]), {
		length: 3,
	}),
).toEqualTypeOf<
	[List.NonEmpty<number>, List.NonEmpty<string>, List.NonEmpty<boolean>]
>();

// .updateAt(..)
expectTypeOf(List.empty<number>().updateAt(1, (v) => v + 1)).toEqualTypeOf<
	List<number>
>();
expectTypeOf(List.of(1).updateAt(1, (v) => v + 1)).toEqualTypeOf<
	List.NonEmpty<number>
>();

// From Builder
expectTypeOf(List.of(1).toBuilder().build()).toEqualTypeOf<List<number>>();
