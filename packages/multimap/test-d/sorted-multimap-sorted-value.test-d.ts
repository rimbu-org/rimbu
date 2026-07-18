import { expectTypeOf } from 'bun:test';

import type { ArrayNonEmpty, WithValueResult } from '@rimbu/common/types';
import type { SortedMultiMapSortedValue } from '@rimbu/multimap/sorted-key/sorted-value';
import type { SortedMap } from '@rimbu/sorted/map';
import type { SortedSet } from '@rimbu/sorted/set';
import type { FastIterator, Stream } from '@rimbu/stream';

type GE<K, V> = SortedMultiMapSortedValue<K, V>;
type GNE<K, V> = SortedMultiMapSortedValue.NonEmpty<K, V>;

type G_Empty = GE<number, string>;
type G_NonEmpty = GNE<number, string>;

type Iter = FastIterator<[number, string]>;
type Context = SortedMultiMapSortedValue.Context<number, string>;

type Values = SortedSet<string>;
type Values_NE = SortedSet.NonEmpty<string>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectTypeOf(genNonEmpty).toExtend<G_Empty>();
expectTypeOf(genNonEmpty).toExtend<G_NonEmpty>();

// Test variance
expectTypeOf(genEmpty).not.toExtend<GE<number | string, string>>();
expectTypeOf(genEmpty).not.toExtend<GE<number, string | boolean>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number | string, string>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number, string | boolean>>();

let m!: any;
expectTypeOf(m as GE<number | string, string>).not.toExtend<G_Empty>();
expectTypeOf(m as GE<number, string | number>).not.toExtend<G_Empty>();
expectTypeOf(m as GNE<number | string, string>).not.toExtend<G_NonEmpty>();
expectTypeOf(m as GNE<number, string | number>).not.toExtend<G_NonEmpty>();

// Iterator
expectTypeOf(genEmpty[Symbol.iterator]()).toEqualTypeOf<Iter>();
expectTypeOf(genNonEmpty[Symbol.iterator]()).toEqualTypeOf<Iter>();

// .add(..)
expectTypeOf(genEmpty.add(1, 'a')).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.add(1, 'a')).toEqualTypeOf<G_NonEmpty>();

// .addEntries(..)
expectTypeOf(genEmpty.addEntries([])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addEntries([[1, 'a']])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntries([])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntries([[1, 'a']])).toEqualTypeOf<G_NonEmpty>();

// .assumeNonEmpty()
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<Context>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<Context>();

// .filter(..)
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();

// .getValues(..)
expectTypeOf(genEmpty.valuesAt(1)).toEqualTypeOf<Values>();
expectTypeOf(genNonEmpty.valuesAt(1)).toEqualTypeOf<Values>();

// .isEmpty
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();

// .keyMap
expectTypeOf(genEmpty.keyMap).toExtend<
	SortedMap<number, SortedSet.NonEmpty<string>>
>();
expectTypeOf(genNonEmpty.keyMap).toExtend<
	SortedMap.NonEmpty<number, SortedSet.NonEmpty<string>>
>();

// .nonEmpty()
expectTypeOf(genEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();

// .removeKey(..)
expectTypeOf(genEmpty.removeEntries([[3, 'a']])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeEntries([[3, 'a']])).toEqualTypeOf<G_Empty>();

// .removeEntry(..)
expectTypeOf(genEmpty.removeEntry(3, 'a')).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeEntry(3, 'a')).toEqualTypeOf<G_Empty>();

// .removeKey(..)
expectTypeOf(genEmpty.removeKey(3)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeKey(3)).toEqualTypeOf<G_Empty>();

// .removeKeyAndGet(..)
expectTypeOf(genEmpty.removeKeyAndGet(3)).toEqualTypeOf<
	WithValueResult<G_Empty, Values_NE>
>();
expectTypeOf(genNonEmpty.removeKeyAndGet(3)).toEqualTypeOf<
	WithValueResult<G_Empty, Values_NE, G_NonEmpty>
>();

// .removeKeys(..)
expectTypeOf(genEmpty.removeKeys([3, 4])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeKeys([3, 4])).toEqualTypeOf<G_Empty>();

// .setValues(..)
expectTypeOf(genEmpty.setValues(1, [])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.setValues(1, ['a'])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.setValues(1, [])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.setValues(1, ['a'])).toEqualTypeOf<G_NonEmpty>();

// .stream()
expectTypeOf(genEmpty.stream()).toEqualTypeOf<Stream<[number, string]>>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<[number, string]>
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
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<[number, string][]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<[number, string]>
>();

// .toBuilder()
expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<
	SortedMultiMapSortedValue.Builder<number, string>
>();
expectTypeOf(genNonEmpty.toBuilder()).toEqualTypeOf<
	SortedMultiMapSortedValue.Builder<number, string>
>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
