import { expectTypeOf } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { OrderedMap } from '@rimbu/ordered/map';
import type { FastIterator, Stream } from '@rimbu/stream';

type GE<K, V> = OrderedMap<K, V>;
type GNE<K, V> = OrderedMap.NonEmpty<K, V>;

type G_Empty = GE<number, string>;
type G_NonEmpty = GNE<number, string>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectTypeOf(genNonEmpty).toExtend<G_Empty>();
expectTypeOf(genNonEmpty).toExtend<G_NonEmpty>();
expectTypeOf(genEmpty).not.toExtend<G_NonEmpty>();

// Iterator
expectTypeOf(genEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();
expectTypeOf(genNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();

// .add(..)
expectTypeOf(genEmpty.add([1, 'a'])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.add([1, 'a'])).toEqualTypeOf<G_NonEmpty>();

// .addAll(..)
expectTypeOf(genEmpty.addAll([])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addAll([[1, 'a']])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addAll([[1, 'a']])).toEqualTypeOf<G_NonEmpty>();

// .assumeNonEmpty()
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<OrderedMap.Context<number>>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<OrderedMap.Context<number>>();

// .filter(..)
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();

// .get(..)
expectTypeOf(genEmpty.get(2)).toEqualTypeOf<string | undefined>();
expectTypeOf(genEmpty.get(2, 'a')).toEqualTypeOf<string>();
expectTypeOf(genNonEmpty.get(2, 'a')).toEqualTypeOf<string>();

// .has(..)
expectTypeOf(genEmpty.has(2)).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.has(2)).toEqualTypeOf<boolean>();

// .isEmpty
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();

// .mapValues(..)
expectTypeOf(genEmpty.mapValues(() => true)).toEqualTypeOf<GE<number, boolean>>();
expectTypeOf(genNonEmpty.mapValues(() => true)).toEqualTypeOf<
	GNE<number, boolean>
>();

// .modifyAtKey(..)
expectTypeOf(genEmpty.modifyAtKey(2, {})).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.modifyAtKey(2, {})).toEqualTypeOf<G_Empty>();

// .nonEmpty()
expectTypeOf(genEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();

// .removeKey(..)
expectTypeOf(genEmpty.removeKey(3)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeKey(3)).toEqualTypeOf<G_Empty>();

// .removeKeyAndReturn(..)
expectTypeOf(genEmpty.removeKeyAndReturn(3).collection).toExtend<G_Empty>();
expectTypeOf(genNonEmpty.removeKeyAndReturn(3).collection).toExtend<G_Empty>();

// .removeKeys(..)
expectTypeOf(genEmpty.removeKeys([3, 4])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeKeys([3, 4])).toEqualTypeOf<G_Empty>();

// .set(..)
expectTypeOf(genEmpty.set(1, 'a')).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.set(1, 'a')).toEqualTypeOf<G_NonEmpty>();

// .stream()
expectTypeOf(genEmpty.stream()).toEqualTypeOf<Stream<readonly [number, string]>>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<readonly [number, string]>
>();

// .streamKeys()
expectTypeOf(genEmpty.streamKeys()).toExtend<Stream<number>>();
expectTypeOf(genNonEmpty.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .streamValues()
expectTypeOf(genEmpty.streamValues()).toExtend<Stream<string>>();
expectTypeOf(genNonEmpty.streamValues()).toEqualTypeOf<Stream.NonEmpty<string>>();

// .toArray()
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<(readonly [number, string])[]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<readonly [number, string]>
>();

// .toBuilder()
expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<OrderedMap.Builder<number, string>>();
expectTypeOf(genNonEmpty.toBuilder()).toEqualTypeOf<
	OrderedMap.Builder<number, string>
>();

// .updateAtKey(..)
expectTypeOf(genEmpty.updateAtKey(2, () => 'b')).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.updateAtKey(2, () => 'b')).toEqualTypeOf<G_NonEmpty>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
