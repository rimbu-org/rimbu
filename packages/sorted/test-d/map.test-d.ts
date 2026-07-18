import { expectTypeOf } from 'bun:test';

import type { RMap } from '@rimbu/collection-types';
import type { ArrayNonEmpty, WithValueResult } from '@rimbu/common/types';
import type { SortedMap } from '@rimbu/sorted/map';
import type { FastIterator, Stream } from '@rimbu/stream';

type GE<K, V> = SortedMap<K, V>;
type GNE<K, V> = SortedMap.NonEmpty<K, V>;

type G_Empty = GE<number, string>;
type G_NonEmpty = GNE<number, string>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectTypeOf(genNonEmpty).toExtend<G_Empty>();
expectTypeOf(genNonEmpty).toExtend<G_NonEmpty>();
expectTypeOf(genEmpty).not.toExtend<G_NonEmpty>();

// Gen mappings
expectTypeOf(genEmpty).toExtend<RMap<number, string>>();
expectTypeOf(genEmpty).not.toExtend<RMap.NonEmpty<number, string>>();
expectTypeOf(genNonEmpty).toExtend<RMap<number, string>>();
expectTypeOf(genNonEmpty).toExtend<RMap.NonEmpty<number, string>>();

// Test variance
expectTypeOf(genEmpty).not.toExtend<GE<number | string, string>>();
expectTypeOf(genEmpty).toExtend<GE<number, string | boolean>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number | string, string>>();
expectTypeOf(genNonEmpty).toExtend<GNE<number, string | boolean>>();
expectTypeOf(genNonEmpty).toExtend<RMap<number, string | boolean>>();

let m!: any;

expectTypeOf(m as GE<number | string, string>).not.toExtend<G_Empty>();
expectTypeOf(m as GE<number, string | number>).not.toExtend<G_Empty>();
expectTypeOf(m as GNE<number | string, string>).not.toExtend<G_NonEmpty>();
expectTypeOf(m as GNE<number, string | number>).not.toExtend<G_NonEmpty>();

// Iterator
expectTypeOf(genEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();
expectTypeOf(genNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();

// .addEntries(..)
expectTypeOf(genEmpty.addEntries(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addEntries(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntries(genEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntries(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();

// .addEntry(..)
expectTypeOf(genEmpty.addEntry([1, 'a'])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntry([1, 'a'])).toEqualTypeOf<G_NonEmpty>();

// .assumeNonEmpty()
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<SortedMap.Context<number>>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<SortedMap.Context<number>>();

// .filter(..)
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();

// .at(..)
expectTypeOf(genEmpty.at(2, 'a')).toEqualTypeOf<string>();
expectTypeOf(genNonEmpty.at(2, 'a')).toEqualTypeOf<string>();

expectTypeOf(genEmpty.at(2, true as boolean)).toEqualTypeOf<string | boolean>();
expectTypeOf(genNonEmpty.at(2, true as boolean)).toEqualTypeOf<
	string | boolean
>();

// .isEmpty
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();

// .mapValues(..)
expectTypeOf(genEmpty.mapValues(() => true as boolean)).toEqualTypeOf<
	GE<number, boolean>
>();
expectTypeOf(genNonEmpty.mapValues(() => true as boolean)).toEqualTypeOf<
	GNE<number, boolean>
>();

// .modifyAt(..)
expectTypeOf(genEmpty.modifyAt(2, {})).toEqualTypeOf<GE<number, string>>();
expectTypeOf(genNonEmpty.modifyAt(2, {})).toEqualTypeOf<GE<number, string>>();

// .nonEmpty()
expectTypeOf(genEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();

// .removeKey(..)
expectTypeOf(genEmpty.removeKey(3)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeKey(3)).toEqualTypeOf<G_Empty>();

// .removeKeyAndGet(..)
expectTypeOf(genEmpty.removeKeyAndGet(3)).toEqualTypeOf<
	WithValueResult<G_Empty, string>
>();
expectTypeOf(genNonEmpty.removeKeyAndGet(3)).toEqualTypeOf<
	WithValueResult<G_Empty, string>
>();

// .removeKeys(..)
expectTypeOf(genEmpty.removeKeys([3, 4])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeKeys([3, 4])).toEqualTypeOf<G_Empty>();

// .set(..)
expectTypeOf(genEmpty.set(1, 'a')).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.set(1, 'a')).toEqualTypeOf<G_NonEmpty>();

// .stream()
expectTypeOf(genEmpty.stream()).toEqualTypeOf<
	Stream<readonly [number, string]>
>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<readonly [number, string]>
>();

// .streamKeys()
expectTypeOf(genEmpty.streamKeys()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .streamValues()
expectTypeOf(genEmpty.streamValues()).toEqualTypeOf<Stream<string>>();
expectTypeOf(genNonEmpty.streamValues()).toEqualTypeOf<
	Stream.NonEmpty<string>
>();

// .toArray()
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<(readonly [number, string])[]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<readonly [number, string]>
>();

// .toBuilder()
expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<
	SortedMap.Builder<number, string>
>();
expectTypeOf(genNonEmpty.toBuilder()).toEqualTypeOf<
	SortedMap.Builder<number, string>
>();

// .updateAt(..)
expectTypeOf(genEmpty.updateAt(2, () => 'b')).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.updateAt(2, () => 'b')).toEqualTypeOf<G_NonEmpty>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
